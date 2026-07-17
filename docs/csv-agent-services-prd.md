# PRD — CSV Agent Services (Nền tảng phát hiện bất thường dữ liệu CSV/XLSX)

- **Phiên bản:** 1.0
- **Ngày:** 2026-07-04
- **Tác giả:** Business Analyst (Claude)
- **Trạng thái:** Draft — chờ review
- **Tài liệu liên quan:**
  - `danh-gia-hien-trang-csv-agent-services.md` — báo cáo đánh giá hiện trạng (nguồn của gap analysis)
  - `csv-agent-services-huong-dan-su-dung.md` — hướng dẫn sử dụng
  - `detection-data-processing-pipeline-prd.md` — PRD cũ, **chỉ áp dụng cho pipeline ML headless** (không phải web app này)

> **Ghi chú phạm vi:** PRD này là PRD đầu tiên mô tả **toàn bộ sản phẩm web full-stack** (backend + frontend). PRD cũ ngày 2026-03-18 mô tả một pipeline xử lý dữ liệu bằng script, tuyên bố rõ "no graphical UI", nên không bao phủ sản phẩm hiện tại.

---

## 1. Tổng quan sản phẩm

### 1.1 Bài toán

Các tổ chức nhận dữ liệu dạng bảng (CSV/XLSX) từ nhiều nguồn với chất lượng không đồng nhất: sai schema, thiếu giá trị, dòng bất thường (lỗi nhập liệu, gian lận, outlier nghiệp vụ). Việc rà soát thủ công tốn nhiều giờ phân tích, khó lặp lại, và không có dấu vết kiểm toán (audit trail).

### 1.2 Giải pháp

CSV Agent Services là nền tảng web cho phép người dùng nghiệp vụ:

1. **Nhập dữ liệu** qua wizard 6 bước có AI hỗ trợ (nhận diện header, map cột vào Data Model chuẩn, validate theo rule).
2. **Phát hiện bất thường tự động** bằng pipeline ML (XGBoost / BiLSTM / ensemble, fallback IsolationForest) chạy nền qua Celery, theo dõi realtime.
3. **Xử lý từng case bất thường** (drill-down, gán người điều tra, đánh dấu false-positive, promote thành rule).
4. **Sửa dữ liệu có AI trợ giúp** (Gemini đề xuất giá trị sửa, con người duyệt).
5. **Sinh báo cáo tự động** (tiếng Việt/Anh) và xuất PDF.
6. **Tự động hoá không giám sát** qua Connectors + Pipelines (recipe) + Webhooks + API trigger token.

### 1.3 Mục tiêu (Goals)

| # | Mục tiêu | Thước đo |
|---|---|---|
| G1 | Giảm thời gian rà soát một file dữ liệu từ hàng giờ xuống < 10 phút | Thời gian upload → báo cáo hoàn tất |
| G2 | Phát hiện bất thường với chất lượng chấp nhận được | F1 ≥ 0.85 tabular (XGBoost V11), ≥ 0.75 timeseries (BiLSTM) |
| G3 | Mọi thao tác sửa dữ liệu có thể truy vết và hoàn tác | 100% edit ghi vào `transform_log`, undo/redo hoạt động |
| G4 | Vận hành không giám sát cho nguồn dữ liệu định kỳ | Pipeline recipe chạy tự động qua connector + trigger token |
| G5 | Người không chuyên ML hiểu được kết quả | Báo cáo ngôn ngữ tự nhiên + giải thích per-case (expected vs actual, feature contribution) |

### 1.4 Non-goals (ngoài phạm vi bản này)

- Huấn luyện/fine-tune model trong sản phẩm (trọng số V10/V11 được huấn luyện offline).
- Hỗ trợ dữ liệu phi bảng (ảnh, văn bản tự do, log stream).
- Multi-tenancy đầy đủ (bản này chỉ cần auth đơn tổ chức).
- Model TranAD / AnoGAN (có trong tài liệu nghiên cứu liên quan nhưng **không** nằm trong backend hiện tại).

### 1.5 Personas

| Persona | Mô tả | Nhu cầu chính |
|---|---|---|
| **Data Analyst (chính)** | Nhận file dữ liệu định kỳ, chịu trách nhiệm chất lượng | Upload nhanh, map schema ít thao tác, danh sách anomaly rõ ràng |
| **Investigator / Reviewer** | Điều tra case bất thường được gán | Drill-down case, expected vs actual, đánh dấu false-positive, duyệt fix |
| **Data Engineer / Ops** | Thiết lập nguồn dữ liệu tự động | Connectors, pipeline recipe, webhook, trigger API |
| **Manager** | Theo dõi tổng quan | Dashboard, báo cáo PDF |

---

## 2. Kiến trúc & ràng buộc kỹ thuật

### 2.1 Kiến trúc hiện tại

```
┌─────────────┐   REST /api/v1 + WS    ┌──────────────┐
│  Next.js 14 │ ─────────────────────▶ │   FastAPI    │
│  (fronted/) │                        │  (backend/)  │
└─────────────┘                        └──────┬───────┘
                                              │
                    ┌─────────────┬───────────┼─────────────┐
                    ▼             ▼           ▼             ▼
                ┌───────┐    ┌────────┐  ┌────────┐   ┌──────────┐
                │ MySQL │    │ Redis  │  │ MinIO  │   │  Celery  │
                │ 8.0   │    │(broker)│  │(object)│   │  worker  │
                └───────┘    └────────┘  └────────┘   └──────────┘
                                              chuỗi 5 task: preprocess →
                                              detect → fix → report → export
```

- **Backend:** FastAPI async, SQLAlchemy 2.0 (aiomysql cho API, pymysql cho Celery), Alembic 10 migration, pydantic-settings.
- **ML:** trọng số tại `backend/app/ml/models/v11/` (mặc định) và `v10/` (bật qua `USE_V10_FALLBACK=true`); vector đặc trưng universal 132 chiều từ `v11_artifacts.json`.
- **Frontend:** Next.js 14.2 App Router, React 18, TypeScript 5, Tailwind 3; API client tay (`lib/api.ts`, ~1000 dòng), không dùng thư viện state/data-fetching.
- **Hạ tầng dev:** `docker-compose.yml` — MySQL :3307, Redis :6380, MinIO :9000/:9001, backend :8000, frontend :3000.

### 2.2 Ràng buộc

| # | Ràng buộc |
|---|---|
| C1 | DB là **MySQL** (không phải PostgreSQL như `.env.example` cũ ghi) |
| C2 | Celery trên macOS phải chạy pool `solo` (SIGSEGV OpenMP); Linux production dùng `CELERY_POOL=prefork` |
| C3 | Hai module runtime import từ repo anh em `csv_agent_platform` qua sys.path — phải tồn tại cạnh repo cho tới khi đóng gói lại (FR-T2) |
| C4 | Gemini fix cần `GEMINI_API_KEY`; không có key thì degrade sang Ollama/manual (`fallback_mode`) |
| C5 | WeasyPrint cần system libs (pango/cairo) để xuất PDF; fallback ReportLab |

---

## 3. Yêu cầu chức năng (Functional Requirements)

Ký hiệu trạng thái: ✅ đã có và hoạt động · ⚠️ có nhưng lỗi/chưa nối dây · ❌ chưa có (yêu cầu mới).

### EPIC A — Nhập dữ liệu (Ingest Wizard)

| ID | Yêu cầu | Trạng thái |
|---|---|---|
| FR-A1 | Upload file CSV/TSV/PSV/XLSX qua drag-drop, lưu MinIO bucket `csv-datasets`, tạo bản ghi `datasets` | ✅ |
| FR-A2 | Preview 10 dòng + thống kê cột ngay sau upload (`GET /upload/{id}/preview`) | ✅ |
| FR-A3 | Chọn sheet với file XLSX đa sheet; tự bỏ qua bước này với CSV | ✅ |
| FR-A4 | Nhận diện dòng header tự động (ngưỡng tin cậy `HEADER_DETECT_CONFIDENCE_THRESHOLD=0.75`), cho phép chọn tay, transpose, merge, preview trước khi xác nhận | ✅ |
| FR-A5 | Map cột nguồn → cột TDM bằng 3 tầng: AI (Gemini, flag `AI_MAPPING_ENABLED`) → historical → fuzzy; hiển thị confidence và badge tầng; người dùng xác nhận từng mapping | ✅ |
| FR-A6 | Cấu hình rule per-column (range, required, enum, regex, cross-column, dependency) + ngưỡng anomaly threshold toàn cục | ✅ |
| FR-A7 | Validate dataset theo rule; tổng hợp errors/warnings; drawer xem dòng bị cờ | ✅ (lưu ý: backend trả issue mức cột, frontend tổng hợp `row_id` tổng hợp — cần chuẩn hoá, xem FR-A10) |
| FR-A8 | Lưu/nạp cấu hình wizard thành **Template** tái sử dụng | ✅ |
| FR-A9 | Kết thúc wizard: khởi chạy phân tích (`POST /analysis`) và điều hướng sang `/analyses` | ✅ |
| FR-A10 | **[Mới]** Backend trả issue validation kèm `row` thật (không null) để drawer hiển thị đúng số dòng dataset | ❌ |
| FR-A11 | **[Mới]** Quick Mode (`POST /datasets/{id}/quick-mode`, flag `QUICK_MODE_ENABLED`): bỏ qua wizard cho file đã có template khớp — nối vào UI | ⚠️ backend có, UI chưa lộ |

### EPIC B — Làm sạch & review dữ liệu (Cleaning / Review)

> Toàn bộ backend Epic B đã có; **UI đã build và test nhưng chưa được import vào trang nào** (component mồ côi). Yêu cầu của Epic B là *nối dây*, không phải xây mới.

| ID | Yêu cầu | Trạng thái |
|---|---|---|
| FR-B1 | Đề xuất fix tự động theo rule/AI (`POST /datasets/{id}/fixes/suggestions`, `/fixes/apply`) hiển thị qua `CleaningSuggestionsPanel` | ⚠️ nối `CleaningSuggestionsPanel` vào wizard sau bước Validation |
| FR-B2 | Sửa dữ liệu bằng prompt ngôn ngữ tự nhiên có preview diff (`/prompts/preview`, `/prompts/apply`) qua `PromptsPanel` | ⚠️ nối dây |
| FR-B3 | Grid xem/sửa từng cell, find-replace, nhảy tới issue kế tiếp (`/grid`, `/cell`, `/find-replace`, `/issues/next`) qua `ReviewEntriesGrid` (virtual scroll) | ⚠️ nối dây |
| FR-B4 | Undo/redo mọi transform + timeline lineage (`/undo`, `/redo`, `/lineage`) qua `LineageTimeline` | ⚠️ nối dây |
| FR-B5 | Hoàn tất import (`POST /complete-import`) — gate theo `block_on_required_errors` của TDM — qua `CompleteImportButton` | ⚠️ nối dây |
| FR-B6 | **[Quyết định cần chốt]** Nếu không nối Epic B trong quý này → xoá 5 component mồ côi + API client tương ứng để giảm nợ kỹ thuật | ❌ |

### EPIC C — Phát hiện bất thường (Detection Pipeline)

| ID | Yêu cầu | Trạng thái |
|---|---|---|
| FR-C1 | Chuỗi Celery 5 bước: preprocess (20%) → detect (60%) → fix-flag (75%) → report (88%) → export (100%); tiến độ ghi vào `pipeline_runs.metrics.progress` | ✅ |
| FR-C2 | Chọn model tự động theo archetype: `timeseries`→BiLSTM, `tabular`→XGBoost, `mixed`→ensemble (trung bình); >100k dòng hạ ensemble→XGBoost | ✅ |
| FR-C3 | Fallback IsolationForest khi thiếu trọng số, ghi `fallback_reason` vào `run_metadata` | ✅ |
| FR-C4 | Kết quả per-row: `score`, `is_anomaly`, `top_fields`, `anomaly_type`, `feature_contributions`, `expected_range`, `actual_values`, `deviations` | ✅ |
| FR-C5 | Theo dõi realtime: WS `/pipeline/ws/{id}` (server poll DB 1s, push diff) + REST polling fallback 3s phía client | ✅ |
| FR-C6 | Stop / re-run / delete phân tích | ✅ |
| FR-C7 | **[Sửa]** Khi thiếu `v11_artifacts.json`, pipeline phải chuyển trạng thái **failed** (hoặc cảnh báo rõ trên UI) thay vì "completed" với dự đoán vô nghĩa | ⚠️ hiện chỉ log ERROR |
| FR-C8 | **[Sửa]** Đổi tên/tách `fix_data_task`: hiện chỉ gắn cờ `is_anomaly`, không sửa giá trị — tránh hiểu nhầm trong UI ("Fix" → "Flag") | ⚠️ |
| FR-C9 | **[Sửa]** Đăng ký `agent_fix_task` vào Celery `include` để chạy được ở chế độ đa tiến trình | ⚠️ |

### EPIC D — Quản lý case bất thường (Case Management)

| ID | Yêu cầu | Trạng thái |
|---|---|---|
| FR-D1 | Danh sách anomaly theo phân tích, đếm critical, filter | ✅ |
| FR-D2 | Drill-down case: expected vs actual, feature contribution bars, model metadata, tóm tắt ngôn ngữ tự nhiên | ✅ |
| FR-D3 | Vòng đời case: status (open/investigating/resolved…), assign investigator, notes, priority (`anomaly_cases`) | ✅ |
| FR-D4 | Đánh dấu false-positive (optimistic UI) | ✅ |
| FR-D5 | Promote case thành **suspicion rule** (column/operator/threshold/action) | ✅ |
| FR-D6 | Export case | ✅ |
| FR-D7 | **[Sửa — UAT 2026-07-04]** Loại cột định danh (identifier) khỏi giải thích anomaly: cột có `nunique/n_rows ≳ 0.95` (vd. Transaction No, Registration Number) không được đưa vào `top_fields`/expected-vs-actual; với cột unique chỉ cảnh báo khi **trùng lặp** (duplicate), không cảnh báo "rare value" | ✅ đã sửa 2026-07-04 (`ai_service.py` — loại identifier khỏi top_fields, thêm kind `identifier` cho duplicate) |
| FR-D8 | **[Sửa — UAT 2026-07-04]** Không hiển thị z-score/Δ% cho cột categorical: z hiện tính trên giá trị **đã mã hoá** (label/frequency encoding) nên vô nghĩa với giá trị gốc — dẫn tới "Outstanding" (giá trị phổ biến hợp lệ) bị badge SEVERE, z=−5.38, Δ +>10.000%. Severity cho categorical phải dựa trên tần suất giá trị gốc (freq=0 → nghi typo; freq<1% và không thuộc common values → warning; thuộc common values → không cờ) | ✅ đã sửa 2026-07-04 (backend bỏ deviations cho categorical; UI severity theo tần suất: Unseen/Rare/Uncommon) |
| FR-D9 | **[Sửa — UAT 2026-07-04]** Nếu giá trị gốc nằm trong common values với tần suất bình thường (vd. Represented="Tenant") thì **loại field khỏi danh sách issue** thay vì hiện card "Confirm that X matches your source document" — card này khiến người dùng tưởng dữ liệu sai | ✅ đã sửa 2026-07-04 (filter `isNormalCategoricalValue` ở cả backend lẫn 2 component — áp dụng cho cả dữ liệu cũ) |
| FR-D10 | **[Sửa — UAT 2026-07-04]** Bỏ fallback "luôn liệt kê top-3 cột" khi không cột nào đạt z≥1: dòng bị model cờ theo pattern tổng thể thì hiển thị thông điệp "flagged based on overall pattern", không bịa 3 field | ✅ đã sửa 2026-07-04 (`rule_type=pattern_anomaly` khi không field nào vượt filter) |

### EPIC E — Sửa dữ liệu có AI (Gemini Fix) & Báo cáo

| ID | Yêu cầu | Trạng thái |
|---|---|---|
| FR-E1 | `POST /report/generate` chặn 409 khi còn anomaly chưa xử lý, trừ khi `force=true` | ✅ |
| FR-E2 | Gemini fix flow: `suggest-fix` (gemini-2.5-flash-lite) → bảng đề xuất người dùng duyệt/sửa → `apply-fix` → generate report `force=true`; degrade Gemini → Ollama Qwen → manual stub (`fallback_mode`) | ✅ |
| FR-E3 | Fix có ngưỡng tự động `AUTO_FIX_CONFIDENCE_THRESHOLD=0.7`; dưới ngưỡng vào `review_queue` cho người duyệt (approve/reject/override, batch-approve); mọi fix ghi `data_fix_log` | ✅ |
| FR-E4 | Báo cáo đa ngôn ngữ (`vi`/`en`), style (`summary`/…), lưu Markdown vào bảng `reports` | ✅ |
| FR-E5 | Xuất PDF font tiếng Việt (Noto Sans, WeasyPrint, fallback ReportLab) + tải về | ⚠️ **bug B1: PDF do pipeline sinh ghi bucket `csv-datasets` nhưng endpoint download đọc bucket `reports` — phải thống nhất một bucket** |
| FR-E6 | **[Sửa]** Hợp nhất 2 đường sinh báo cáo: `generate_report_task` trong pipeline phải gọi NLPService thay vì f-string tĩnh | ⚠️ |
| FR-E7 | **[Sửa]** Render báo cáo bằng Markdown renderer trên frontend (hiện là plain text) | ⚠️ |
| FR-E8 | **[Quyết định]** LLM local (Qwen2/Gemma LoRA) chưa bao giờ hoạt động vì thiếu `adapter_weights/` — hoặc ship trọng số, hoặc gỡ code router và ghi nhận chính thức `model_used="template"` | ⚠️ |

### EPIC F — Dashboard & Reports listing

| ID | Yêu cầu | Trạng thái |
|---|---|---|
| FR-F1 | Metric tổng quan: tổng dataset, tổng báo cáo, tỉ lệ anomaly (`GET /dashboard/summary`) | ✅ |
| FR-F2 | Danh sách phân tích gần đây | ✅ |
| FR-F3 | **[Sửa]** Biểu đồ trends dùng dữ liệu thật từ `GET /dashboard/trends` (weekly/monthly) — thay SVG hardcode "84.2 PB/s" | ⚠️ |
| FR-F4 | **[Sửa]** Gỡ các card giả ("Nodes 42/42", Cluster Health, Threat Neutralization) hoặc thay bằng metric thật | ⚠️ |
| FR-F5 | **[Mới]** Trang `/reports` thành danh sách báo cáo thật (thay mock "Q3 2024"), link tới `/reports/{id}` | ❌ |

### EPIC G — Tự động hoá (Connectors, Pipelines recipe, Webhooks)

| ID | Yêu cầu | Trạng thái |
|---|---|---|
| FR-G1 | CRUD connector (input/output), test connection; credential mã hoá Fernet (`CONNECTOR_ENCRYPTION_KEY`) | ✅ (chỉ MinIO/S3) |
| FR-G2 | Connector `ftp_sftp`, `http`, `email` | ❌ trả 501 — **ẩn khỏi UI cho tới khi triển khai** |
| FR-G3 | Pipeline recipe: input connector → TDM → mapping → detection → output connector/format; lịch sử execution; Run now | ✅ |
| FR-G4 | Trigger qua API bằng JWT token scoped từng pipeline (`POST /pipelines/{id}/trigger-token` mint, `POST /{id}/trigger` dùng) + snippet curl trên UI | ✅ |
| FR-G5 | Webhooks: subscribe 4 loại event, ký HMAC-SHA256 (`X-Webhook-Signature`), delivery log, trang docs verify chữ ký | ✅ |
| FR-G6 | **[Sửa]** Mã hoá webhook `secret` bằng Fernet (hiện plaintext) | ⚠️ |

### EPIC H — Bảo mật & quản trị (mới, ưu tiên cao nhất)

| ID | Yêu cầu | Trạng thái |
|---|---|---|
| FR-H1 | **Thu hồi Google API key đã lộ trong `readme.md`** và xoá khỏi tài liệu | ❌ KHẨN |
| FR-H2 | Xác thực JWT toàn cục (login, middleware/dependency trên mọi route trừ `/health`); thay `user_id = 1` hardcode bằng user thật | ❌ |
| FR-H3 | Phân quyền tối thiểu: viewer (đọc) / analyst (tạo phân tích, duyệt fix) / admin (connectors, webhooks, xoá) | ❌ |
| FR-H4 | JWT secret bắt buộc từ env, fail-fast khi là placeholder | ❌ |
| FR-H5 | CORS whitelist origin cụ thể; bỏ tổ hợp `*` + credentials | ❌ |
| FR-H6 | Đổi credential MinIO mặc định; secret quản lý ngoài repo | ❌ |

---

## 4. Yêu cầu phi chức năng (NFR)

| ID | Yêu cầu | Ngưỡng |
|---|---|---|
| NFR1 | **Hiệu năng pipeline:** file ≤ 50k dòng hoàn tất detect trong ≤ 5 phút trên worker prefork 2 concurrency | đo bằng `pipeline_runs.started_at → finished_at` |
| NFR2 | **Realtime:** độ trễ cập nhật tiến độ ≤ 2s (WS poll 1s) | |
| NFR3 | **Độ tin cậy task:** retry preprocess ×3, task khác ×2, delay 5s; `task_acks_late=True` | ✅ đã có |
| NFR4 | **Truy vết:** 100% thay đổi dữ liệu ghi `transform_log`/`data_fix_log` kèm actor + source (rule/llm/prompt/manual) | ✅ đã có |
| NFR5 | **Khả dụng khi degrade:** thiếu Gemini key, thiếu trọng số ML, WS đứt — hệ thống vẫn dùng được với thông báo rõ ràng cho người dùng (không im lặng) | ⚠️ một phần |
| NFR6 | **Test:** giữ ≥ mức phủ hiện tại (30 file backend / 14 file frontend); thêm test cho pages, `useWebSocket`, `GeminiFixModal`; thêm script `npm test` | ⚠️ |
| NFR7 | **I18n báo cáo:** PDF render đúng tiếng Việt có dấu (Noto Sans) | ✅ |
| NFR8 | **Tương thích trình duyệt:** Chrome/Edge/Safari 2 bản mới nhất, viewport ≥ 1280px (layout sidebar cố định `ml-64`) | |

---

## 5. Roadmap đề xuất

| Giai đoạn | Nội dung | FR |
|---|---|---|
| **Sprint 0 (hotfix, ngay)** | Thu hồi API key lộ; sửa bucket PDF; sửa `.env.example` | FR-H1, FR-E5, M5 |
| **Sprint 1 — Security** | Auth JWT toàn cục + RBAC, CORS, secrets | FR-H2…H6, FR-G6 |
| **Sprint 2 — Trung thực hoá UI** | Dashboard trends thật, gỡ card giả, trang Reports thật, Markdown renderer | FR-F3…F5, FR-E7 |
| **Sprint 3 — Hợp nhất báo cáo & pipeline** | NLPService trong pipeline, artifacts-missing → failed, đổi tên fix task, agent_fix_task include | FR-E6, FR-C7…C9, FR-E8 |
| **Sprint 4 — Epic B (quyết định nối hoặc xoá)** | Cleaning/Prompts/Grid/Lineage/Complete-import vào UI | FR-B1…B6, FR-A11 |
| **Sprint 5 — Connectors mở rộng** | FTP/SFTP, HTTP; ẩn loại chưa có | FR-G2 |

---

## 6. Thước đo thành công (Success Metrics)

| Metric | Baseline | Mục tiêu |
|---|---|---|
| Thời gian upload → báo cáo (file 10k dòng) | chưa đo | ≤ 10 phút |
| Tỉ lệ pipeline hoàn tất không lỗi | chưa đo | ≥ 95% |
| Tỉ lệ fix AI được chấp nhận (accepted / suggested) | chưa đo | ≥ 60% |
| Tỉ lệ false-positive do người dùng đánh dấu | chưa đo | ≤ 15% |
| Endpoint có xác thực | 1/100+ | 100% (trừ `/health`) |

---

## 7. Rủi ro & giả định

| # | Rủi ro | Mức | Giảm thiểu |
|---|---|---|---|
| R1 | API key đã lộ bị lạm dụng trước khi thu hồi | Cao | FR-H1 ngay lập tức |
| R2 | Phụ thuộc repo anh em `csv_agent_platform` (sys.path hack) vỡ khi deploy | Cao | Đóng gói thành package/pip dependency |
| R3 | Model V11 lệch phân phối với dữ liệu người dùng thật → fallback IsolationForest âm thầm giảm chất lượng | Trung | FR-C7 + hiển thị `models_used`/`fallback_reason` trên UI (đã có ModelMetadataCard) |
| R4 | Celery solo pool nghẽn khi nhiều phân tích đồng thời | Trung | `CELERY_POOL=prefork` trên Linux, tăng concurrency |
| R5 | Schema drift frontend/backend (không có codegen chung) | Trung | Sinh client từ OpenAPI (`/openapi.json`) trong CI |
| R6 | Giả định: người dùng nội bộ, dữ liệu không chứa PII cần compliance riêng | — | Xác nhận với stakeholder |

---

## 8. Câu hỏi mở (cần stakeholder chốt)

1. Epic B (cleaning/review UI): **nối dây hay xoá**? (FR-B6)
   - _Hiện trạng (xác minh 04-07-2026):_ 3 component đã build + test nhưng **không trang nào import**:
     `fronted/components/review/CompleteImportButton.tsx`, `fronted/components/review/ReviewEntriesGrid.tsx`,
     `fronted/components/upload/CleaningSuggestionsPanel.tsx`. Backend **đã có đủ API** (vd
     `POST /datasets/{id}/complete-import` trong `import_completion.py`, cleaning suggestions trong `prompts.py`).
   - ⇒ Chi phí "nối dây" thấp (API sẵn sàng, chỉ thiếu wiring ở page). Cần chốt: đưa luồng
     cleaning → review → complete-import vào wizard, hay xoá component + API để giảm bề mặt bảo trì?
2. LLM local cho báo cáo: **ship trọng số LoRA hay chấp nhận template**? (FR-E8)
   - ✅ **ĐÃ CHỐT (04-07-2026): ship trọng số LoRA.** Kèm theo: cần kế hoạch đóng gói/phân phối
     trọng số (dung lượng, license model nền, nơi host), và fallback template khi không nạp được weights.
3. Có cần multi-tenancy trong 6 tháng tới không (ảnh hưởng thiết kế auth FR-H2/H3)?
   - ✅ **ĐÃ CHỐT (04-07-2026): KHÔNG — single-tenant.** Thiết kế auth single-tenant cho gọn,
     nhưng **thêm sẵn cột `tenant_id`/`org_id`** ở schema (nullable) để sau mở rộng không phải migrate lớn.
4. Tên sản phẩm chính thức: UI đang hiện "Sovereign Intelligence Framework v1.0", repo tên "CSV Agent Services" — cần thống nhất branding.
   - ✅ **ĐÃ CHỐT (04-07-2026): "CSV Agent Services".** Đổi các chuỗi UI "Sovereign Intelligence
     Framework" → "CSV Agent Services" cho khớp repo/docs.
5. Đổi tên thư mục `fronted/` → `frontend/` (breaking change cho docker-compose, đường dẫn CI)?
