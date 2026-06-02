# Plan: Nâng cấp Anomaly Detection Analysis UI + Backend

## Context

Trang **Anomaly Detection Analysis** (`/analyses/[id]`) hiện tại có 7 điểm yếu khiến user "biết có sai nhưng không biết sai ở đâu":

1. Score = 1.000 và status CRITICAL nhưng **không có baseline / expected range / deviation** → user không hiểu critical vì cái gì.
2. Cột `SUSPICIOUS FIELDS` hiển thị `"No individual fields isolated"` cho mọi row trong Analysis #7 vì model chạy **IsolationForest fallback** và không expose SHAP/feature contribution.
3. **Heatmap** chỉ show index 0–49, không drill-down được sang row thật.
4. **Score Density** histogram không có threshold line, không nói top X% là bao nhiêu.
5. **Raw Analysis Logs** thiếu anomaly type / cluster ID.
6. **Model transparency = 0**: chỉ có string `isolation_forest_fallback`, không có contamination / feature count / training size / last trained / metrics.
7. **Không có action layer**: phát hiện nhưng không xử lý (mark false positive, assign, trigger rule, export case).

Mục tiêu: phá trạng thái "dead end" đó, biến trang từ log viewer thành một case-management screen có giải thích và action.

Backend đã có phần lớn vật liệu cần thiết nhưng chưa expose:
- `XGBoostDetector` (`app/ml/models/xgboost_detector.py:112-127`) **đã compute SHAP top-5 per row** nhưng `AIService.detect()` không forward nó vào API response.
- `AIService.detect()` (`app/services/ai_service.py:154-188`) **đã có mean/std per numeric column** khi tính Z-score — tái dùng được cho expected range + deviation.
- `ReviewQueue` model + endpoints (`app/api/endpoints/review.py`) đã có approve/reject/override — nhưng nó bám vào fix flow, không phải case management. Ta sẽ thêm một model case riêng thay vì gán ghép.

---

## Scope (đã chốt với user)

- **Full 7 điểm trong 1 đợt**.
- **Action layer = CRM-style đầy đủ**: mark FP + assign investigator + trigger rule + status workflow.
- **Anomaly Type = rule-based** từ `rule_type` + `top_fields`, không chạy KMeans/DBSCAN.

---

## Backend changes

### B1. Mở rộng `AIService.detect()` — `app/services/ai_service.py:82-197`

Thêm vào mỗi entry của `anomaly_scores` (giữ nguyên các field cũ để backward compatible):

```python
{
  # existing
  "row_id": int, "score": float, "is_anomaly": bool,
  "top_fields": list[str], "reason": str, "rule_type": str,

  # NEW
  "anomaly_type": str,                 # "price spike" | "multi-field deviation" | "pattern anomaly"
  "feature_contributions": [           # top-5 features, normalized weights
    {"feature": str, "weight": float, "direction": "+"|"-"}
  ],
  "expected_range": {                  # only for top_fields (numeric)
    col: {"low": float, "high": float, "mean": float, "std": float}
  },
  "actual_values": {col: any},         # raw value của row tại top_fields
  "deviations": {col: {"z": float, "pct_from_mean": float}}
}
```

- `anomaly_type` rule-based trong `_derive_anomaly_type(rule_type, top_fields, deviations)`:
  - `statistical_outlier` + 1 dominant field + z > 0 → `"{col} spike"`, z < 0 → `"{col} dip"`
  - `statistical_outlier` + nhiều field → `"multi-field deviation"`
  - `pattern_anomaly` → `"pattern anomaly"`
- `feature_contributions`:
  - **XGBoost path**: lấy `AnomalyScores.contributing_features` từ `XGBoostDetector.predict()` (đã sẵn). Thread qua `_ModelRegistry` / `detect()`.
  - **IF fallback path**: dùng top-5 Z-scores đã có (`ai_service.py:159-162`), chuẩn hoá thành weights tổng = 1, direction theo dấu của `(value - mean)`.
- `expected_range / actual_values / deviations`: chỉ compute cho các column xuất hiện trong `top_fields` để payload không phình.

### B2. Model metadata registry — `app/ml/models/model_metadata.py` (NEW)

Static registry (vì repo chưa có bảng model_version):

```python
MODEL_METADATA = {
  "xgboost_v10": {
    "display_name": "XGBoost V10 A7-Clean",
    "contamination": None,
    "threshold": 0.8318004608154297,
    "feature_count": 50,
    "training_size": 2_847_392,       # điền từ training notebook nếu có, else None
    "last_trained": "2025-09-14",
    "metrics": {"f1": 0.8808, "precision": 0.8947, "recall": 0.8673, "roc_auc": 0.9946},
  },
  "bilstm_v10": { ... },              # tương tự từ bilstm_classifier.py:1-11
  "isolation_forest_fallback": {
    "display_name": "Isolation Forest (fallback)",
    "contamination": 0.1,
    "threshold": None,                 # dùng quantile động, tính runtime
    "feature_count": None,             # = số numeric column của dataset
    "training_size": None,             # fit on current dataset
    "last_trained": None,
    "metrics": None,
  },
}

def get_metadata(model_name: str) -> dict: ...
```

Được `AIService.detect()` fill runtime-specific field (ví dụ `feature_count` cho IF = len numeric cols; `threshold` cho IF = quantile(1 - contamination)).

### B3. Response schema mở rộng — `app/api/endpoints/analysis.py:301-315`

Response mới của `GET /api/v1/analysis/{id}/results`:

```json
{
  "id": 7, "dataset_id": 42, "filename": "external_agent_bills_sorted.csv",
  "anomaly_scores": [ /* ScoreEntry với các field mới ở B1 */ ],
  "models_used": ["isolation_forest_fallback"],
  "model_metadata": { /* object từ B2, đã fill runtime */ },
  "anomaly_threshold": 0.7,
  "threshold_percentile": 0.02,
  "total_rows": 69,
  "anomaly_count": 7,
  "anomaly_type_breakdown": {"price spike": 3, "multi-field deviation": 4}
}
```

### B4. Drill-down endpoint — `app/api/endpoints/analysis.py` (NEW route)

```
GET /api/v1/analysis/{id}/rows/{row_id}
```

Return: raw CSV row (từ `Dataset` / file gốc) + ScoreEntry + case status (nếu có). Dùng cho heatmap click + table "View detail".

### B5. AnomalyCase model (CRM-style) — `app/models/anomaly_case.py` (NEW)

```python
class CaseStatus(str, Enum):
    OPEN = "open"
    INVESTIGATING = "investigating"
    RESOLVED = "resolved"
    FALSE_POSITIVE = "false_positive"
    RULE_CREATED = "rule_created"

class AnomalyCase(Base):
    id: int
    analysis_id: int (FK analysis_results.id)
    row_id: int
    status: CaseStatus (default OPEN)
    assignee: str | None           # email; dùng string vì repo chưa có User table
    priority: str                  # "low"|"med"|"high", default từ score
    notes: str | None
    created_at, updated_at, resolved_at
    __table_args__ = (UniqueConstraint("analysis_id", "row_id"),)
```

Migration mới: `alembic/versions/xxxx_add_anomaly_cases.py`.

### B6. SuspicionRule model — `app/models/suspicion_rule.py` (NEW)

Dành cho nút "Trigger Rule":

```python
class SuspicionRule(Base):
    id: int
    source_analysis_id: int
    source_row_id: int
    column: str
    operator: str                  # ">", "<", "not_in", "regex"
    threshold: str                 # JSON-encoded
    action: str                    # "flag" | "block" | "review"
    enabled: bool
    created_by: str
    created_at
```

Migration đi kèm. Phase này chỉ tạo record; enforcement rule sẽ là feature sau.

### B7. Case endpoints — `app/api/endpoints/cases.py` (NEW)

Tất cả prefix `/api/v1/analysis/{analysis_id}/cases`:

| Method | Path | Action |
|---|---|---|
| `GET` | `/{row_id}` | Load case (auto-create với status OPEN nếu chưa có) |
| `PATCH` | `/{row_id}/status` | Đổi status (open/investigating/resolved/false_positive) |
| `PATCH` | `/{row_id}/assign` | Gán assignee (string email) |
| `POST` | `/{row_id}/false-positive` | Shortcut: set status=FALSE_POSITIVE + flip `is_anomaly=false` trong `AnalysisResult.anomaly_scores` (reuse logic `report.py:213-237`) |
| `POST` | `/{row_id}/trigger-rule` | Tạo `SuspicionRule` từ body {column, operator, threshold, action}; set case.status=RULE_CREATED |
| `GET` | `/{row_id}/export?format=json\|csv` | Export 1 case: row data + scores + contributions + case metadata |
| `GET` | `` (no row_id) | List cases của analysis (filter by status, assignee) |

Pydantic schemas: `app/schemas/case.py` + `app/schemas/rule.py`.

Register router trong `app/api/api.py`.

---

## Frontend changes

Base file: `fronted/app/(pages)/analyses/[id]/page.tsx` (hiện đang đặt mọi sub-component trong cùng file). Tách các component mới ra folder `fronted/components/anomaly/` để file chính đỡ cồng kềnh.

### F1. Types — `fronted/app/(pages)/analyses/[id]/page.tsx:11-35` + `fronted/lib/api.ts`

Cập nhật `ScoreEntry`:
```ts
interface FeatureContribution { feature: string; weight: number; direction: "+"|"-"; }
interface Deviation { z: number; pct_from_mean: number; }
interface ExpectedRange { low: number; high: number; mean: number; std: number; }

interface ScoreEntry {
  row_id: number; score: number; is_anomaly: boolean;
  top_fields: string[]; reason?: string|null; rule_type?: string|null;
  anomaly_type?: string;
  feature_contributions?: FeatureContribution[];
  expected_range?: Record<string, ExpectedRange>;
  actual_values?: Record<string, unknown>;
  deviations?: Record<string, Deviation>;
}

interface ModelMetadata { display_name: string; contamination: number|null; threshold: number|null; feature_count: number|null; training_size: number|null; last_trained: string|null; metrics: Record<string, number>|null; }

interface AnalysisResult {
  /* existing fields */
  model_metadata?: ModelMetadata;
  anomaly_threshold?: number;
  threshold_percentile?: number;
  total_rows?: number;
  anomaly_count?: number;
  anomaly_type_breakdown?: Record<string, number>;
}
```

Thêm API clients trong `fronted/lib/api.ts`:
```ts
getAnalysisRow(id, rowId)
getCase(analysisId, rowId)
patchCaseStatus(analysisId, rowId, status)
patchCaseAssignee(analysisId, rowId, assignee)
markFalsePositive(analysisId, rowId)
triggerRule(analysisId, rowId, rule)
exportCase(analysisId, rowId, format)
```

### F2. `ScoreHeatmap` — `page.tsx:91-118`

- Thêm `onSelect(rowId)` prop.
- Cell `onClick` → mở `AnomalyDrillDownPanel`.
- Tooltip mở rộng: row ID + score + top-3 features với `±weight`.

### F3. `ScoreDensity` — `page.tsx:123-169`

- Thêm prop `threshold: number`.
- Vẽ vertical dashed line tại bucket chứa threshold, label "Threshold 0.70".
- Annotation dưới chart: `"Top 2.3% highest anomaly scores (7/69)"`.

### F4. `ModelMetadataCard` — `fronted/components/anomaly/ModelMetadataCard.tsx` (NEW)

Thay thế badge `Model: isolation_forest_fallback` hiện tại (raw logs header `page.tsx:178-190`). Grid 2x3 hiển thị: display_name, contamination, threshold, feature_count, training_size, last_trained. Metrics: F1/Precision/Recall/ROC-AUC dạng chip.

Nếu `model_metadata = null` cho một field → show `—` + tooltip "Not tracked".

### F5. `FeatureContributionBars` — `fronted/components/anomaly/FeatureContributionBars.tsx` (NEW)

Horizontal bars: label feature, width proportional `|weight|`, màu red nếu direction `+` (đẩy score lên), blue nếu `-`. Top 3-5 rows. Dùng trong:
- Cell `SUSPICIOUS FIELDS` của `RawLogsTable` (inline compact version, top 3).
- `AnomalyDrillDownPanel` (full version, top 5).

Thay thế dòng `"No individual fields isolated"` (`page.tsx` phần render suspicious fields). Nếu vẫn rỗng (dataset quá nhỏ) → show `"Sparse data — top Z-scores: ..."` thay vì dead-end message.

### F6. `ExpectedVsActualTable` — `fronted/components/anomaly/ExpectedVsActualTable.tsx` (NEW)

Hiển thị trong `AnomalyDrillDownPanel`. Mỗi row = 1 top_field:
| Field | Expected range | Actual | Z | % from mean |

Màu cell actual đỏ nếu `|z| > 2`, vàng nếu `1 < |z| ≤ 2`.

### F7. `AnomalyDrillDownPanel` — `fronted/components/anomaly/AnomalyDrillDownPanel.tsx` (NEW)

Right-side drawer (tailwind `fixed inset-y-0 right-0 w-[560px]`). Trigger:
- Heatmap cell click.
- Row "View" button trong `RawLogsTable`.

Sections:
1. Header: row ID, anomaly score, anomaly type chip, close btn.
2. `ExpectedVsActualTable`.
3. `FeatureContributionBars` (top 5).
4. Raw row data (bảng key-value, scroll-able).
5. `CaseActionBar` (F9).

### F8. `RawLogsTable` — `page.tsx:174-349`

- Thêm cột `TYPE` (anomaly_type chip).
- SUSPICIOUS FIELDS: render `FeatureContributionBars` compact top-3 (thay cho text "No individual fields isolated").
- Cột STATUS: dùng `CaseStatusChip` lấy status từ case (fetch batch trong `AnalysisDetailPage` effect), chứ không phải derived từ score nữa.
- Row hover → show 3 icon buttons (View / Mark FP / Export).

### F9. `CaseActionBar` — `fronted/components/anomaly/CaseActionBar.tsx` (NEW)

Trong `AnomalyDrillDownPanel`:
- **Status dropdown** (Open / Investigating / Resolved / FP / Rule Created).
- **Assignee input** (email) với save button → `patchCaseAssignee`.
- **Mark as False Positive** button → `markFalsePositive` + toast + flip row trong bảng (optimistic update).
- **Trigger Rule** button → mở `TriggerRuleModal` (F10).
- **Export Case** dropdown (JSON / CSV).
- Notes textarea (lưu vào case).

### F10. `TriggerRuleModal` — `fronted/components/anomaly/TriggerRuleModal.tsx` (NEW)

Form: column (select từ top_fields), operator (>, <, not_in, regex), threshold (input), action (flag/block/review). Submit → `triggerRule`. Pre-fill từ row hiện tại (operator `>` nếu z > 0, threshold = expected.high).

### F11. `AssignInvestigatorModal` — `fronted/components/anomaly/AssignInvestigatorModal.tsx` (NEW)

Simple modal: email input + optional note. Vì repo chưa có User table, chỉ lưu string. Autocomplete từ danh sách assignee đã từng dùng (GET case list distinct assignees).

### F12. `CaseStatusChip` — `fronted/components/anomaly/CaseStatusChip.tsx` (NEW)

Thay `StatusChip` cũ (`page.tsx:69-86`). Màu:
- OPEN: slate
- INVESTIGATING: amber
- RESOLVED: emerald
- FALSE_POSITIVE: slate strikethrough
- RULE_CREATED: indigo

### F13. `InsightCard` — `page.tsx:354-386`

Thêm mini bar chart `anomaly_type_breakdown` (dùng cùng kiểu bar của `ScoreDensity`, không cần chart lib).

---

## Files to modify / create

### Backend (modify)
- [app/services/ai_service.py](csv_agent_services/backend/app/services/ai_service.py) — B1 feature contributions, expected range, anomaly type, threading SHAP
- [app/ml/models/xgboost_detector.py](csv_agent_services/backend/app/ml/models/xgboost_detector.py) — đảm bảo `contributing_features` được trả về khi registry gọi
- [app/api/endpoints/analysis.py](csv_agent_services/backend/app/api/endpoints/analysis.py) — B3 + B4
- [app/api/api.py](csv_agent_services/backend/app/api/api.py) — register cases router
- [app/api/endpoints/report.py](csv_agent_services/backend/app/api/endpoints/report.py) — reuse logic `apply-fix` (`:213-237`) cho mark-false-positive

### Backend (create)
- `app/ml/models/model_metadata.py` — B2
- `app/models/anomaly_case.py` — B5
- `app/models/suspicion_rule.py` — B6
- `app/schemas/case.py`, `app/schemas/rule.py`
- `app/api/endpoints/cases.py` — B7
- `alembic/versions/xxxx_add_anomaly_cases_and_rules.py`

### Frontend (modify)
- [fronted/app/(pages)/analyses/[id]/page.tsx](csv_agent_services/fronted/app/(pages)/analyses/[id]/page.tsx) — wire components, types, drill-down state
- [fronted/lib/api.ts](csv_agent_services/fronted/lib/api.ts) — thêm clients F1

### Frontend (create, folder `fronted/components/anomaly/`)
- `ModelMetadataCard.tsx`
- `FeatureContributionBars.tsx`
- `ExpectedVsActualTable.tsx`
- `AnomalyDrillDownPanel.tsx`
- `CaseActionBar.tsx`
- `TriggerRuleModal.tsx`
- `AssignInvestigatorModal.tsx`
- `CaseStatusChip.tsx`

---

## Reuse & guardrails

- **Reuse SHAP**: `XGBoostDetector._top_k_per_row` đã có — đừng viết lại, chỉ thread nó qua `_ModelRegistry.detect_with_model()` về `AIService.detect()`.
- **Reuse apply-fix**: `report.py:213-237` đã biết cách flip `is_anomaly`. `POST /cases/{row_id}/false-positive` chỉ là wrapper thêm case record rồi gọi hàm đó (extract thành helper nếu cần).
- **Reuse Z-score stats**: mean/std trong `ai_service.py:159-162` — compute 1 lần per column, dùng lại cho cả top_fields, expected_range, deviations.
- **Không xâm phạm ReviewQueue**: đó là fix pipeline (Epic 7), khác khái niệm case. Không nhập nhằng.
- Giữ backward compatibility response (field cũ nguyên vẹn, field mới optional).

---

## Verification

### Backend
1. `cd csv_agent_services/backend && alembic upgrade head` — kiểm tra migration chạy clean.
2. Chạy pytest / script ad-hoc: upload CSV mẫu → gọi `GET /api/v1/analysis/{id}/results`, verify response có `feature_contributions`, `expected_range`, `anomaly_type`, `model_metadata`.
3. Khi model là XGBoost → `feature_contributions` non-empty với weights từ SHAP.
4. Khi model là `isolation_forest_fallback` → `feature_contributions` fallback từ Z-score, không còn rỗng.
5. Test case CRUD: `GET /cases/{row_id}` auto-create, `PATCH /status`, `POST /false-positive` flip `is_anomaly=false`, `POST /trigger-rule` tạo `SuspicionRule`, `GET /export?format=csv` trả CSV hợp lệ.

### Frontend
1. `cd csv_agent_services/fronted && npm run dev`, mở `/analyses/7`.
2. Tương tác golden path:
   - Heatmap cell đỏ: hover thấy top-3 contributions; click mở drill-down panel bên phải.
   - Drill-down: expected-vs-actual đúng, feature bars có màu +/-, raw row hiện đủ.
   - Mark FP → row chuyển strikethrough, status chip FALSE_POSITIVE.
   - Assign → nhập email → reload panel thấy assignee.
   - Trigger Rule → modal pre-fill, submit tạo rule, status → RULE_CREATED.
   - Export JSON/CSV → file tải xuống, nội dung hợp lệ.
3. Density chart có threshold line + "Top X% highest" annotation.
4. Model card hiển thị đầy đủ 6 field + metrics (nếu có).
5. Edge cases: fallback model (không có SHAP) vẫn có contributions; case chưa tồn tại → `GET` tự tạo OPEN; assignee null ok; numeric field rỗng → hiển thị `—` không crash.
6. Regression: `/analyses` list page, generate report, Gemini fix modal vẫn hoạt động bình thường (response cũ còn nguyên field).
