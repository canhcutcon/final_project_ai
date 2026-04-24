# Upload & Validation Review — Feature Specification

**Project:** CSV AI Platform — Anomaly Detection Thesis
**Module:** Dataset Upload Flow
**Author:** Business Analyst
**Date:** 2026-04-24
**Status:** Draft v1
**Related docs:**
- `final_project_ai/new_adjustment_detection.md` — 3-layer detection architecture
- `final_project_ai/ui/` — UI reference mockups (Ingestro-style)
- `final_project_ai/docs/csv-ai-platform-prd.md` — parent PRD

---

## 1. Overview

### 1.1 Purpose
Bổ sung bước **Validation Review** vào luồng upload để user có thể review, config, và preview kết quả rule-based validation *trước khi* dataset được gửi vào ML anomaly detection model. Mục tiêu: tách bạch trách nhiệm giữa rule engine (Layer 1+2) và ML (Layer 3), phù hợp kiến trúc "business rule = primary, anomaly = secondary".

### 1.2 Problem Statement
Luồng hiện tại: **Upload → ML → Result**. Dataset raw (còn lỗi format, thiếu field, dependency sai) được đẩy thẳng vào model, dẫn đến:
- ML phải "gánh" cả lỗi deterministic lẽ ra rule đã loại bỏ (Trap 3 — Double counting).
- User không phân biệt được row bị flag do rule hay do ML.
- Không có cơ chế override rule mà không deploy lại code.
- A9 Ensemble tuy tốt (anomaly ~1.0, threshold 0.899) nhưng vẫn bị nhiễu bởi hard-fail rows.

### 1.3 Goals
| # | Goal | Metric |
|---|---|---|
| G1 | Tách gate rule trước ML | 100% hard-fail rows bị loại khỏi payload ML |
| G2 | Config-driven rule (tránh Trap 1) | Rule thay đổi qua JSON/YAML, không cần redeploy |
| G3 | Transparency cho user | Mỗi row có status `rejected / warned / anomaly / accepted` |
| G4 | Reusable config | User save template, reload cho upload sau |
| G5 | Feedback loop | Rule_score đưa vào ML như feature (rule → ML bridge) |

### 1.4 Non-Goals
- Không build rule IDE phức tạp (chỉ form-based editor cho v1).
- Không tự động sinh rule từ ML trong cùng session upload (xem Section 13 cho V2 plan).
- Không hỗ trợ real-time streaming upload (batch CSV only).

---

## 2. Stakeholders & Users

| Role | Interest |
|---|---|
| Thesis user (data analyst role-play) | Upload CSV, review kết quả, tinh chỉnh rule |
| Thesis reviewer (Professor) | Đánh giá tính tách bạch rule/ML, tính khoa học của pipeline |
| Developer (bạn) | Implement frontend + rule engine + integration với ML service |

---

## 3. User Flow

```
┌──────────────┐   ┌─────────────────┐   ┌──────────────────────┐   ┌──────────────────┐
│  Step 1      │→ │  Step 2         │→ │  Step 3              │→ │  Step 4          │
│  Upload CSV  │   │  Schema Mapping │   │  Validation Review   │   │  Run Detection   │
│              │   │  (auto/manual)  │   │  (NEW — this spec)   │   │  (Layer 3 ML)    │
└──────────────┘   └─────────────────┘   └──────────────────────┘   └──────────────────┘
                                                   │
                                                   ↓
                                           ┌──────────────┐
                                           │ Rule Engine  │
                                           │ Layer 1 + 2  │
                                           └──────────────┘
```

### 3.1 Entry criteria cho Step 3
- File CSV đã upload và parse thành công.
- Columns đã được map sang Target Data Model.
- Rule set được load (default hoặc user-chosen).

### 3.2 Exit criteria
- Không còn hard-fail row chưa xử lý (user đã chọn drop hoặc fix).
- User bấm `Run detection →`.

---

## 4. Functional Requirements

### FR-1 — Column Config Review Panel (Left)
Bảng column list, mỗi row hiển thị:
| Field | Type | Source |
|---|---|---|
| Column label | string | Target Data Model |
| Column key | string | Target Data Model |
| Data type | enum (STRING, INT, FLOAT, DATE, CATEGORY, IBAN, …) | Target Data Model |
| Hard rules count | number | Rule engine |
| Soft rules count | number | Rule engine |
| Validation status | icon (✅ / ⚠ / ❌) | Live preview |

**FR-1.1** — Click row → mở modal `Column Details` (4 tabs):
- **Details** — label, key, type (reference: `ui/colum-detail-category/detail.png`)
- **Configuration** — enum values, mapping threshold, dropdown options
- **Data validations** — Basic rules + Advanced rules tab
- **Mapping validation** — must be mapped flag

**FR-1.2** — Advanced rules hỗ trợ:
- Range: `>`, `<`, `>=`, `<=`, `between`
- Cross-column: `lease_expiry > lease_start`, `commission <= price`
- Dependency: `if status = "lease" then lease_duration required`
- Enum: `status in [active, closed, pending]`
- Regex (cho STRING / IBAN)

### FR-2 — Validation Summary Panel (Right)
**FR-2.1** — Hiển thị 3 counter động (update khi config thay đổi):
- 🔴 Hard fails — rows vi phạm rule hard (sẽ bị reject)
- 🟡 Soft warnings — rows vi phạm rule soft (gắn rule_score, vẫn đưa vào ML)
- 🟢 Passed — rows sạch

**FR-2.2** — 2 toggle chính:
- `[x] Drop hard-fail rows before ML` (default ON, khoá — không cho OFF ở v1 để đảm bảo G1)
- `[x] Include rule_score as ML feature` (default ON — khớp G5)

**FR-2.3** — Button:
- `Preview flagged rows` — mở drawer list 50 row đầu bị flag, kèm lý do.
- `Download validation report` — CSV report.

### FR-3 — Global Config (Collapsible Header)
| Setting | Type | Default | Note |
|---|---|---|---|
| Rule set | dropdown | `real-estate-v1` | User có thể upload JSON/YAML rule file |
| Business domain | dropdown | `real-estate` | Preset rule packs (real-estate / commission / transaction) |
| Anomaly model | radio | `Ensemble A9` | DAE, VAE, XGB, Ensemble |
| Anomaly threshold | slider | `0.899` | Theo A9 analysis trong `new_adjustment_detection.md` |
| Batch size | number | `25,000` | Theo Ingestro pattern (`adv-validation.png`) |

### FR-4 — Templates
**FR-4.1** — `Save as template` — lưu toàn bộ column config + global config với tên.
**FR-4.2** — `Load template` — dropdown load template cho dataset có schema tương đồng.
**FR-4.3** — Template được lưu ở backend, scoped per user.

### FR-5 — Actions
- `Back` — quay lại Step 2 Mapping.
- `Run detection →` — enabled khi 0 hard-fail-without-action. Disabled state có tooltip lý do.
- `Save draft` — lưu trạng thái, có thể resume sau.

---

## 5. Non-Functional Requirements

| # | Requirement | Target |
|---|---|---|
| NFR-1 | Preview latency | < 2s cho dataset 10k rows, < 10s cho 100k rows |
| NFR-2 | Rule engine chạy client-side (nếu feasible) hoặc stream từ backend | — |
| NFR-3 | Rule schema version | Semantic versioning, backward compatible |
| NFR-4 | Audit log | Mỗi lần `Run detection` lưu snapshot config dùng |
| NFR-5 | I18n | Tiếng Việt + English (thesis context) |

---

## 6. Data Contracts

### 6.1 Rule definition (JSON)
```json
{
  "rule_set_id": "real-estate-v1",
  "version": "1.0.0",
  "columns": {
    "transaction_price": {
      "hard_rules": [
        { "type": "required" },
        { "type": "range", "op": ">", "value": 0 }
      ],
      "soft_rules": [
        { "type": "range", "op": "<", "value": 1000, "weight": 0.3, "message": "Suspiciously low price" }
      ]
    },
    "lease_expiry_date": {
      "hard_rules": [
        { "type": "cross_column", "op": ">", "column": "lease_start_date" }
      ]
    }
  },
  "dependencies": [
    { "if": "status == 'lease'", "then": ["lease_duration"], "severity": "hard" }
  ]
}
```

### 6.2 Validation result (per row)
```json
{
  "row_id": 123,
  "status": "warned",
  "hard_errors": [],
  "soft_warnings": ["low_price"],
  "rule_score": 0.7
}
```

### 6.3 ML payload (post-validation)
```json
{
  "rows": [ ... only accepted + warned rows ... ],
  "features": {
    "include_rule_score": true
  },
  "model": "ensemble_a9",
  "threshold": 0.899
}
```

### 6.4 Final decision output
```json
{
  "row_id": 123,
  "final_status": "flag_for_review",
  "reasons": {
    "rule_warned": ["low_price"],
    "ml_anomaly_score": 0.92
  }
}
```

Final status enum: `accepted | warned_ok | flag_for_review | rejected`.

---

## 7. UX References

| Reference | Purpose |
|---|---|
| `ui/target-model-detail.png` | Layout column list + Advanced validations button |
| `ui/colum-detail-category/data-validation.png` | Basic rules / Advanced rules tab layout |
| `ui/colum-detail-category/config.png` | Configuration tab cho Category type |
| `ui/adv-validation.png` | Advanced validations modal (Set up tab) |
| `ui/advande-config.png` | Advanced validations modal (Configuration tab) |
| `ui/image.png` | Validation summary card pattern ("78 cleanings") |
| `ui/image copy.png` | Column matching preview pattern |

---

## 8. Acceptance Criteria

- [ ] AC-1 — User thấy đủ 3 panel (column config, summary, global config) trong Step 3.
- [ ] AC-2 — Chỉnh 1 rule → counter Hard/Soft/Passed update trong < 2s.
- [ ] AC-3 — 100% hard-fail row không xuất hiện trong ML payload (verify qua log).
- [ ] AC-4 — `rule_score` xuất hiện như feature trong ML payload khi toggle ON.
- [ ] AC-5 — `Run detection` disabled khi còn hard-fail; tooltip rõ lý do.
- [ ] AC-6 — Save/Load template hoạt động cross-session.
- [ ] AC-7 — Download validation report trả về CSV đúng schema row × reason.
- [ ] AC-8 — Final output có trường `final_status` thuộc 4 enum trên.
- [ ] AC-9 — Rule set thay đổi qua file JSON không cần deploy lại.
- [ ] AC-10 — Audit log lưu snapshot config cho mỗi detection run.

### 8.1 FE-Specific Acceptance Criteria (port từ Stitch mocks)

- [ ] FE-AC-1 — Mỗi Step render đúng layout so với `screen.png` trong `fronted/UI/*/`.
- [ ] FE-AC-2 — Back/Next giữa 4 step KHÔNG mất state (columnConfigs, validationResult, toggles).
- [ ] FE-AC-3 — `WizardStepper` highlight đúng step hiện tại; click step đã completed → back-navigate.
- [ ] FE-AC-4 — `ColumnDetailsModal` render đủ 4 tabs (Details / Configuration / Data validations / Mapping validation); switch tab không reset form.
- [ ] FE-AC-5 — Validation counter (Hard / Soft / Passed) cập nhật sau mỗi `Re-validate` trong < 2s.
- [ ] FE-AC-6 — `Next → Run Detection` disabled khi `hard_fails > 0 && !drop_hard_fails`; tooltip rõ lý do.
- [ ] FE-AC-7 — `startAnalysis` payload (Step 4 submit) chứa đủ các field mở rộng: `rule_set_id`, `column_configs`, `drop_hard_fails`, `include_rule_score`, `anomaly_threshold`, `batch_size`.
- [ ] FE-AC-8 — Tuân thủ "No-line rule" của DESIGN.md — không dùng `1px solid border` cho sectioning.

---

## 9. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Trap 1 — Rule explosion | Khó maintain | Config-driven JSON, modular rule packs, validator cho rule schema |
| Trap 2 — Rule miss edge case | False negative | ML layer (A9) làm secondary detector |
| Trap 3 — Double counting | Inflated anomaly rate | Hard-gate ngăn fail row vào ML; deduplicate logic ở Decision Layer |
| Rule preview chậm với dataset lớn | UX kém | Sampling preview (5k rows đầu) + background full-scan |
| User set rule quá chặt → reject hết | Dataset trống cho ML | Cảnh báo khi reject rate > 30% |

---

## 10. Out of Scope (v1)

- Collaborative rule editing (multi-user).
- Rule version rollback UI.
- A/B testing giữa rule sets.

---

## 13. V2 Feature Plan — Auto-suggest Rule từ ML Feedback Loop

### 13.1 Mục tiêu

Sau khi ML (Layer 3) chạy xong và tạo ra `anomaly_scores` có `feature_contributions` (SHAP/attention weights), hệ thống phân tích pattern để **tự động đề xuất rule mới** mà user có thể chấp nhận, chỉnh sửa, hoặc bỏ qua. Rule được accept sẽ được thêm vào rule set hiện tại và áp dụng cho lần upload sau.

Đây là bridge thực sự giữa **rule engine (Layer 1+2) ↔ ML (Layer 3)**: thay vì chỉ `rule_score → ML` (chiều hiện tại), V2 thêm chiều ngược `ML insight → rule suggestion`.

---

### 13.2 Luồng tổng quan

```
ML detection xong
        │
        ▼
[Rule Suggestion Engine]
  - Phân tích feature_contributions của các anomaly rows
  - Cluster pattern: field nào xuất hiện với tần suất cao + direction nhất quán
  - Derive candidate rule: "transaction_price > X" hoặc "commission_rate not in [...]"
        │
        ▼
[Suggestion Review Panel]  (xuất hiện sau khi detection hoàn tất)
  - Hiển thị danh sách candidate rules
  - Mỗi rule: preview impact (% rows bị flag), confidence, examples
  - User: Accept → Add to rule set | Edit → tuỳ chỉnh threshold | Dismiss
        │
        ▼
[Rule Set được cập nhật]
  - Rule mới lưu vào rule set hiện tại (hoặc tạo rule set mới)
  - Áp dụng từ lần upload tiếp theo tại Step 3
```

---

### 13.3 Functional Requirements (V2)

#### FR-13.1 — Rule Suggestion Engine (Backend)

**Input**: `AnalysisResult.anomaly_scores` — mỗi entry có `feature_contributions`, `deviations`, `expected_range`, `anomaly_type`.

**Thuật toán đề xuất:**

| Bước | Logic |
|---|---|
| 1. Filter anomaly rows | Chỉ lấy `is_anomaly = true` với `score ≥ threshold` |
| 2. Aggregate per field | Đếm mỗi field xuất hiện trong `top_fields` bao nhiêu lần; tính `mean_weight`, `dominant_direction` (+/-) |
| 3. Chọn candidate field | Field có `frequency ≥ 20%` anomaly rows VÀ `mean_weight ≥ 0.15` |
| 4. Derive rule type | `direction = "+"` + numeric → `range` rule (`field > mean + 2*std`); `direction = "-"` → lower bound; categorical top_fields → `not_in` rule |
| 5. Tính confidence | `confidence = frequency × mean_weight` (chuẩn hoá về [0,1]) |
| 6. Preview impact | Chạy rule candidate trên toàn dataset, đếm rows bị flag |

**Output** (per candidate rule):
```json
{
  "rule_id": "auto_r001",
  "source": "ml_feedback",
  "field": "transaction_price",
  "rule_type": "range",
  "operator": ">",
  "threshold": 2500000,
  "severity": "soft",
  "confidence": 0.82,
  "frequency": 0.67,
  "impact_rows": 23,
  "impact_pct": 3.2,
  "examples": [
    { "row_id": 45, "value": 3100000, "score": 0.94 },
    { "row_id": 72, "value": 2900000, "score": 0.88 }
  ],
  "suggested_message": "transaction_price unusually high — flagged in 67% anomaly rows"
}
```

#### FR-13.2 — API Endpoint

```
GET /api/v1/analysis/{analysis_id}/rule-suggestions
```

- Trả về list candidate rules (tối đa 10 suggestions).
- Có query param `min_confidence=0.6` để filter.
- Cache kết quả 24h (suggestions không thay đổi trừ khi re-run detection).

```
POST /api/v1/rule-sets/{rule_set_id}/rules
```

- Body: `{ source_suggestion_id, field, operator, threshold, severity, message }`
- User accept một suggestion → tạo rule thực trong rule set.

#### FR-13.3 — Suggestion Review Panel (Frontend)

Xuất hiện như một **tab mới** trong trang Analysis Detail (`/analyses/[id]`), cạnh "Raw Analysis Logs":

**Tab: "Rule Suggestions" (badge đỏ với số lượng suggestions)**

Layout mỗi suggestion card:
```
┌─────────────────────────────────────────────────────┐
│  💡  [FIELD: transaction_price]   Confidence: 82%   │
│  Suggested rule: transaction_price > 2,500,000      │
│  Impact: 23 rows (3.2%) would be flagged as soft    │
│  Found in 67% of anomaly rows · direction: spike    │
│                                                     │
│  Threshold: [2,500,000 ____]  Severity: [Soft ▾]   │
│                                                     │
│  [Dismiss]  [View examples]  [✓ Add to rule set]   │
└─────────────────────────────────────────────────────┘
```

**FR-13.3.1** — "View examples": mở drawer 3–5 row examples với value + anomaly score.

**FR-13.3.2** — Threshold editable inline trước khi accept.

**FR-13.3.3** — Severity dropdown: Hard / Soft (default Soft — an toàn hơn cho suggestion tự động).

**FR-13.3.4** — "Add to rule set" → chọn rule set target (dropdown, default = rule set đang dùng của analysis này) → POST rule → toast "Rule added to `real-estate-v1`".

**FR-13.3.5** — Dismiss → ẩn suggestion khỏi list (lưu `dismissed_suggestions` per user, không hiện lại lần sau với cùng analysis).

**FR-13.3.6** — Empty state khi không có suggestion đủ confidence: *"Không có pattern đủ mạnh để đề xuất rule tự động. Thêm nhiều dữ liệu hoặc điều chỉnh threshold model."*

---

### 13.4 Data Contracts (V2 additions)

#### Rule Suggestion (stored trong DB)
```json
{
  "id": "auto_r001",
  "analysis_id": 7,
  "field": "transaction_price",
  "rule_type": "range",
  "operator": ">",
  "threshold": 2500000,
  "severity": "soft",
  "confidence": 0.82,
  "frequency": 0.67,
  "impact_rows": 23,
  "impact_pct": 3.2,
  "status": "pending",
  "created_at": "2026-04-24T10:00:00Z",
  "examples": [ ... ]
}
```

`status` enum: `pending | accepted | dismissed | edited_accepted`.

#### Rule Set entry khi accept suggestion
```json
{
  "field": "transaction_price",
  "soft_rules": [
    {
      "type": "range",
      "op": ">",
      "value": 2500000,
      "weight": 0.3,
      "message": "transaction_price unusually high — flagged in 67% anomaly rows",
      "source": "ml_feedback",
      "source_analysis_id": 7,
      "created_at": "2026-04-24T10:05:00Z"
    }
  ]
}
```

Field `source: "ml_feedback"` giúp phân biệt rule do user tạo vs. ML-derived trong audit log.

---

### 13.5 Backend Implementation Plan

| Component | File | Action |
|---|---|---|
| Suggestion engine | `app/services/rule_suggestion_service.py` | NEW — logic aggregate feature_contributions |
| DB model | `app/models/rule_suggestion.py` | NEW — lưu suggestions per analysis |
| API endpoint | `app/api/endpoints/rule_suggestions.py` | NEW — GET suggestions, POST dismiss |
| Rule set update | `app/api/endpoints/rule_sets.py` | MODIFY — thêm route POST /rules để accept suggestion |
| Migration | `alembic/versions/xxxx_add_rule_suggestions.py` | NEW |

**Reuse từ code hiện tại:**
- `feature_contributions` từ `AnalysisResult.anomaly_scores` (đã có từ B1 plan).
- `expected_range` + `deviations` từ cùng anomaly_scores — dùng trực tiếp để tính threshold đề xuất (`mean + 2*std`).
- `SuspicionRule` model (đã có từ B6 plan) — xem xét reuse thay vì tạo model mới.

---

### 13.6 Frontend Implementation Plan

| Component | File | Action |
|---|---|---|
| Tab "Rule Suggestions" | `fronted/app/(pages)/analyses/[id]/page.tsx` | Thêm tab + state |
| Suggestion card | `fronted/components/anomaly/RuleSuggestionCard.tsx` | NEW |
| API clients | `fronted/lib/api.ts` | Thêm `getRuleSuggestions`, `dismissSuggestion`, `acceptSuggestion` |

---

### 13.7 Acceptance Criteria (V2)

- [ ] AC-13.1 — Sau khi detection xong, tab "Rule Suggestions" hiển thị ≥ 1 suggestion nếu có field với frequency ≥ 20%.
- [ ] AC-13.2 — Mỗi suggestion card hiển thị đúng: field, operator, threshold, confidence %, impact rows.
- [ ] AC-13.3 — User chỉnh threshold inline → impact_rows cập nhật realtime (debounce 500ms, gọi lại preview endpoint).
- [ ] AC-13.4 — Accept suggestion → rule xuất hiện trong rule set target; lần upload tiếp theo Step 3 áp dụng rule này.
- [ ] AC-13.5 — Rule được accept có `source: "ml_feedback"` và `source_analysis_id` đúng.
- [ ] AC-13.6 — Dismiss suggestion → không hiện lại khi reload trang.
- [ ] AC-13.7 — Severity mặc định là `soft`; user có thể đổi sang `hard` trước khi accept (warning: hard rule có thể reject row).
- [ ] AC-13.8 — Empty state rõ ràng khi không có suggestion đủ confidence.
- [ ] AC-13.9 — API `GET /rule-suggestions` trả về kết quả trong < 3s với dataset 10k rows.

---

### 13.8 Risks & Mitigations (V2)

| Risk | Impact | Mitigation |
|---|---|---|
| ML suggest rule quá chặt → reject row hợp lệ | False positive tăng | Default severity = soft; cảnh báo trước khi upgrade lên hard |
| Feature contributions từ fallback model (IsolationForest) không đủ tin cậy | Suggestion nhiễu | Chỉ generate suggestions khi model = XGBoost hoặc BiLSTM (không áp dụng cho IF fallback) |
| User accept nhiều rule → rule set phình | Khó maintain | Giới hạn 10 ML-derived rules per rule set; badge đếm trong Rule Set UI |
| Threshold đề xuất không phù hợp domain | Rule kém hiệu quả | User chỉnh threshold inline + "View examples" để kiểm tra trước khi accept |

---

## 14. FE Implementation Mapping (Stitch Mocks → React Components)

### 14.1 Mock Inventory

4 bộ Stitch-generated mock đã tồn tại trong [csv_agent_services/fronted/UI/](../../csv_agent_services/fronted/UI/), mỗi bộ gồm `code.html` + `screen.png` + `DESIGN.md` (design system chung — "Sovereign Intelligence Framework"):

| Step | Folder | Covers (FR) | Missing |
|---|---|---|---|
| 1 — Upload & Initial Preview | `fronted/UI/Upload & Initial Preview/` | FR dropzone, preview table, row count badge | Column type inference hints, stepper active-state |
| 2 — Schema Mapping | `fronted/UI/Step 2- Schema Mapping/` | FR-1 layout (source ↔ target), sample chips | Template auto-suggest, save draft wiring |
| 3 — Validation Review Dashboard | `fronted/UI/Step 3- Validation Review Dashboard/` | FR-1.1 column table, FR-2.1 counter cards, FR-3 global config | `ColumnDetailsModal` 4 tabs, rule editor UI, FR-4 template save/load, FR-2.3 drawer preview flagged rows |
| 4 — Final Configuration & Run | `fronted/UI/Step 4- Final Configuration & Run/` | `ArchetypeSelector`, `ModelSelector`, run CTA, pipeline progress | Anomaly threshold slider (0.899), summary readback "X rows sẽ vào ML" |

### 14.2 Design System Constraints (trích DESIGN.md)

- **No-line rule** — KHÔNG dùng `1px solid border` cho sectioning. Phân vùng bằng background shift (`surface` → `surface-container-low` → `surface-container-lowest`).
- **Surface hierarchy 4 tầng**: `surface` (#f7f9fc) → `surface-container-low` (#f2f4f7) → `surface-container-lowest` (#fff) → `surface-bright` (modal glass).
- **Signature gradient** cho primary CTA: `linear-gradient(135deg, #24389c → #3f51b5)`.
- **Glassmorphism** cho modals & nav rails: `backdrop-filter: blur(10–20px)`, opacity 80–85%.
- **Typography**: Inter. Display (hero), Headline (page title, tracking -0.02em), Body (0.875rem), Label-md UPPERCASE cho overline (0.05em tracking).
- **Charts**: Recharts, palette `primary / secondary / tertiary_fixed_dim`, grid line `outline_variant` 10% opacity.
- **Status badges**: Running → pulse animation trên `secondary_container`; Completed → `on_secondary_container`; Failed → `error` + `error_container` glow.

### 14.3 Port Strategy

- Giữ nguyên DOM structure của mock `code.html`, convert sang JSX component — không redesign.
- Mỗi Step = 1 component riêng dưới [csv_agent_services/fronted/components/upload/](../../csv_agent_services/fronted/components/upload/).
- **Reuse trước khi build mới**:
  - [`components/PipelineProgress.tsx`](../../csv_agent_services/fronted/components/PipelineProgress.tsx) làm base cho `WizardStepper`.
  - [`components/StartAnalysisModal.tsx`](../../csv_agent_services/fronted/components/StartAnalysisModal.tsx) làm shell cho `ColumnDetailsModal`.
  - [`components/TriggerRuleModal.tsx`](../../csv_agent_services/fronted/components/TriggerRuleModal.tsx) làm base cho `RuleEditorForm`.
  - [`components/SideNavBar.tsx`](../../csv_agent_services/fronted/components/SideNavBar.tsx), [`components/TopAppBar.tsx`](../../csv_agent_services/fronted/components/TopAppBar.tsx).
- [`tailwind.config.ts`](../../csv_agent_services/fronted/tailwind.config.ts) đã có đủ tokens — KHÔNG thêm CSS mới.

### 14.4 Component Mapping

| Mock element (step) | React component | Reuse? |
|---|---|---|
| WizardStepper (shared top) | `components/upload/WizardStepper.tsx` | Extend `PipelineProgress` |
| DropZone + preview (S1) | Giữ `DropZone`, `StructurePreview` inline trong `page.tsx` | Yes |
| Source↔Target mapping table (S2) | `components/upload/SchemaMappingStep.tsx` | New |
| Column config table (S3 left) | `components/upload/ColumnConfigTable.tsx` | New |
| Counter cards + toggles (S3 right) | `components/upload/ValidationSummaryPanel.tsx` | New |
| Global config bar (S3 top) | `components/upload/GlobalConfigHeader.tsx` | New |
| Column details 4 tabs | `components/upload/ColumnDetailsModal.tsx` | Extend `StartAnalysisModal` shell |
| Rule editor form | `components/upload/RuleEditorForm.tsx` | Extend `TriggerRuleModal` |
| Flagged rows drawer | `components/upload/FlaggedRowsDrawer.tsx` | New |
| Threshold slider + model select (S4) | Giữ `ModelSelector`, thêm `AnomalyThresholdSlider.tsx` | Yes + New |
| Summary readback (S4) | Inline trong `page.tsx` | New |

### 14.5 State Lift-up (`upload/page.tsx`)

```ts
type Step = 1 | 2 | 3 | 4;

const [step, setStep] = useState<Step>(1);
const [columnConfigs, setColumnConfigs] = useState<ColumnConfig[]>([]);
const [ruleSetId, setRuleSetId] = useState("real-estate-v1");
const [businessDomain, setBusinessDomain] = useState("real-estate");
const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
const [dropHardFails] = useState(true);           // locked ON per FR-2.2
const [includeRuleScore, setIncludeRuleScore] = useState(true);
const [anomalyThreshold, setAnomalyThreshold] = useState(0.899);
const [batchSize, setBatchSize] = useState(25000);
```

### 14.6 API Contracts (FE wiring)

- `POST /api/v1/datasets/{id}/validate` — gọi khi enter Step 3, re-trigger khi edit rule.
- `GET /api/v1/rules/sets` — populate Rule set dropdown.
- `POST | GET /api/v1/templates` — FR-4 save/load.
- Mở rộng `POST /api/v1/analysis` body: thêm `rule_set_id`, `column_configs`, `drop_hard_fails`, `include_rule_score`, `anomaly_threshold`, `batch_size`.
- V1 demo: fallback mock trong [`lib/api.ts`](../../csv_agent_services/fronted/lib/api.ts), toggle bằng env flag `NEXT_PUBLIC_MOCK_VALIDATE=true`.

### 14.7 Execution Order (port tasks)

1. Refactor [`upload/page.tsx`](../../csv_agent_services/fronted/app/(pages)/upload/page.tsx) thành wizard shell + `<WizardStepper />` + switch(step). Giữ Step 1 logic hiện tại.
2. Tạo [`components/upload/WizardStepper.tsx`](../../csv_agent_services/fronted/components/upload/WizardStepper.tsx) — port top stepper từ mock Step 1 HTML.
3. Tạo [`types/upload.ts`](../../csv_agent_services/fronted/types/upload.ts) — các interface `ColumnConfig`, `Rule`, `ValidationResult`, `RowValidation`, `Template`, `RuleSet` (khớp Section 6).
4. Thêm 4 API client + mở rộng `startAnalysis` trong [`lib/api.ts`](../../csv_agent_services/fronted/lib/api.ts). Mock fallback nếu env flag ON.
5. Port Step 2 `SchemaMappingStep` — dùng `preview.columns` auto-fill, output `ColumnConfig[]`.
6. Port Step 3: `GlobalConfigHeader` → `ColumnConfigTable` (left) → `ValidationSummaryPanel` (right).
7. Build `ColumnDetailsModal` (4 tabs) + `RuleEditorForm` (nested trong tab Data validations → Advanced).
8. Build `FlaggedRowsDrawer`.
9. Port Step 4 — thêm `AnomalyThresholdSlider` + summary readback. Sửa `handleInitialize` gửi payload mở rộng.
10. I18n pass (vi + en) theo NFR-5.
11. E2E dev test (xem 14.8).

### 14.8 Dev Verification

- `cd csv_agent_services/fronted && npm run dev`, mở `/upload`.
- So sánh visual mỗi step với `screen.png` reference — layout match, spacing match.
- CSV test: upload → mapping → validate (mock) → run. Verify `startAnalysis` payload qua DevTools Network.
- Back/Next 4 lần không mất state.
- Test disabled state CTA Step 3 → 4 khi `hard_fails > 0`.
- `npm run test` — không regression.
- `npm run build` — TypeScript clean.

### 14.9 Out of Scope (FE v1)

- Backend endpoints thật — dùng mock trong `lib/api.ts`.
- Rule IDE visual drag-drop — form-based editor là đủ.
- Multi-user template sharing — scoped per-user.
- Feedback loop ML → auto-suggest rule — đã có Section 13 (V2 plan).

---

## 11. Open Questions

1. Rule engine chạy ở đâu — frontend (JS) hay backend service riêng? Ảnh hưởng latency và độ phức tạp dependency rule.
2. Threshold 0.899 của A9 có cần tuning per-dataset hay giữ cố định?
3. Template có shared giữa các user thesis reviewer không, hay strictly per-user?
4. Cần hỗ trợ rule ở cấp dataset (cross-row, ví dụ "tổng commission ≤ tổng price") không?

---

## 12. Next Steps

1. Reviewer (Professor / user) confirm spec v1.
2. Draft **rule schema JSON** chi tiết (hỗ trợ full rule types trong FR-1.2).
3. Wireframe high-fidelity cho Step 3 (3 panel layout).
4. Prototype rule engine với 1 rule pack (`real-estate-v1`).
5. Integration test với Ensemble A9 + XGB baseline.
