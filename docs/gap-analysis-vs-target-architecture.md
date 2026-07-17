# Gap Analysis: `csv_agent_services` hiện tại vs Kiến trúc mục tiêu 11 module

**Ngày:** 17/07/2026
**Phạm vi:** Đối chiếu app hiện tại (nhánh `main`) với pipeline mục tiêu 11 module + đánh giá ý tưởng plugin architecture.
**Kết luận nhanh:** App đã phủ **~75–80%** kiến trúc mục tiêu. Lõi mapping/validation/cleaning/AI/preview/audit đã mạnh. Bốn khoảng trống chính: **Data Profiling chuyên sâu, Duplicate Engine (fuzzy/phonetic/embedding), Dry-Run cấp import job, và một số nguồn Upload (Google Sheet URL, UTF-16/BOM)**.

---

> ⚠️ **CẢNH BÁO BẢO MẬT — xử lý ngay**
> File `csv_agent_services/readme.md` đang chứa một **Google API key lộ thiên** (`AIza...YFx5s`) và đã được commit vào git. Cần: (1) **revoke key** đó trong Google Cloud Console ngay, (2) xóa khỏi readme, (3) chuyển sang biến môi trường `.env` (đã có sẵn pattern `.env`), (4) cân nhắc `git filter-repo`/BFG để xóa khỏi lịch sử git. Bất kỳ ai đọc repo đều dùng được key này.

---

## 1. App hiện tại là gì

Không còn là "anomaly detection platform" như tiêu đề readme cũ. Trên thực tế `csv_agent_services` đã tiến hóa thành một **nền tảng import + làm sạch dữ liệu có TDM (Target Data Model)** — rất gần với Ingestro/Flatfile. Bằng chứng: hệ endpoint và service bao trùm upload → header → mapping → validate → clean → prompt → review → complete-import → lineage, cộng connectors, webhooks, templates, TDM.

Stack: FastAPI + SQLAlchemy + Celery + MySQL + Redis + MinIO(S3) + Next.js 14. Có WebSocket theo dõi pipeline realtime, undo/redo, và xuất báo cáo NLP + PDF.

---

## 2. Bảng đối chiếu 11 module

| # | Module mục tiêu | Trạng thái | Bằng chứng trong code | Ghi chú / gap |
|---|---|---|---|---|
| 1 | **Upload Engine** (CSV/XLSX/XLS/TSV/GSheet/ZIP; detect UTF-8/16/BOM/delimiter/sheet) | 🟡 **Phần lớn** | `file_format_service.py` (magic bytes, `csv.Sniffer` cho `,\t\|`, hỗ trợ `zipfile`), `sheet_service.py` (`/sheets`, `/sheet`), `upload.py` | ✅ CSV/TSV/PSV/XLSX/XLS/ZIP, sniff delimiter & sheet. ❌ **Google Sheet URL**; ⚠️ **UTF-16/BOM** chưa thấy detect tường minh (không dùng `chardet`) |
| 2 | **Schema Detection** (AI column mapping, confidence, không map thủ công) | 🟢 **Đủ, mạnh** | `mapping_service.py`, `mapping_matchers.py`, `header_detection_service.py`, `tdm_suggestion_service.py`; endpoint `/mapping/suggest`, `/mapping/confirm`, `/header/preview` | Có gợi ý + confidence. Nên xác nhận đang dùng embedding hay chỉ synonym/heuristic |
| 3 | **Data Profiling** (min/max/avg/null%/unique%/duplicate%, phân bố giá trị) | 🟡 **Một phần** | `value_counts` trong `ai_service.py`, `/preview` (column stats), `grid_service.py` | Có thống kê cơ bản phục vụ AI, **chưa có endpoint profiling chuyên biệt** trả null%/unique%/distribution cho UI. Đây là gap đáng làm — chính bạn ghi "rất ít hệ thống làm tốt" |
| 4 | **Validation Engine** (schema/business/cross-field/db-unique/API) | 🟢 **Đủ, mạnh** | `validation_service.py`, `tdm_validation_service.py`, `rules.py`, model `suspicion_rule`; `/validate`, `/validate/cells` | Kiến trúc rule đa lớp đã có. Cần kiểm tra đủ 5 lớp (đặc biệt **cross-field** & **API existence check**) |
| 5 | **Cleaning Engine** (trim/normalize/date/phone/currency/boolean) | 🟢 **Đủ** | `cleaning_service.py`, `/find-replace`, `/fixes/apply`, `prompt_executor_service.py` | Có auto-clean + prompt. Nên chuẩn hóa danh mục "cleaner" thành bộ rời rạc (phục vụ plugin — mục 4) |
| 6 | **AI Suggestions** (gmail.con→.com, HCM→Ho Chi Minh City; gợi ý, không tự ghi đè) | 🟢 **Đủ** | `ai_service.py`, `gemini_fix_service.py`, `agent_fix_task.py`; `/suggest-fix`, `/fixes/suggestions`; `review_queue` + `/batch-approve` + `/approve` | Đúng triết lý "đề xuất rồi duyệt" (có review queue). Gemini đang là engine |
| 7 | **Duplicate Engine** (exact/fuzzy/phonetic/embedding, multi-key) | 🔴 **Gap lớn** | Chỉ thấy "duplicate" như **issue_type** trong report và rule `ENTITY_DUPLICATE_*` | Chưa có engine dedupe độc lập với **fuzzy (rapidfuzz), phonetic (Soundex/Metaphone via jellyfish), embedding similarity**, và cấu hình multi-key (email+phone / name+dob+phone) |
| 8 | **Interactive Preview** (5000 rows, OK/Warning/Error, click từng lỗi) | 🟢 **Đủ** | `grid_service.py`, model `import_issue`, `/issues/summary`, `/issues/next`, `review.py` | Đã có phân loại issue + điều hướng lỗi |
| 9 | **Dry Run** (simulate would insert/update/fail) | 🟡 **Một phần** | Dry-run có ở `prompt_executor_service.py` (Task4) và `quick_mode_service.py` | ✅ dry-run mức áp prompt/quick-mode. ❌ **chưa có dry-run cấp Import Job** trả "would insert X / update Y / fail Z" so với DB đích |
| 10 | **Job Engine** (async, queued→running→completed, rollback, progress) | 🟢 **Phần lớn** | Celery chain, `pipeline_run`, `pipeline_execution`, `/status`, WS `/ws/{id}`, `transform_log`, `/undo`, `/redo` | ✅ async + progress + realtime. ⚠️ **Rollback cấp import job** (revert bản ghi đã insert vào hệ đích) cần xác nhận — hiện undo/redo là ở working copy, chưa chắc rollback sau khi đã commit vào target |
| 11 | **Audit Log** (ai/thời gian/rows/insert/update/fail, tải CSV lỗi) | 🟢 **Đủ** | `transform_log`, `data_fix_log`, `lineage_service.py` (`/lineage`), `cases/export`, `import_completion_service.py` | Có log + lineage + export. Nên bổ sung **export báo cáo lỗi dạng CSV** cho user sửa & import lại (nếu chưa có) |

**Legend:** 🟢 đủ · 🟡 một phần · 🔴 gap lớn

### Phần app đã có VƯỢT ngoài kiến trúc mục tiêu
Connectors (MinIO/S3), Webhooks (`webhook_service`, delivery log), Templates, TDM seed/heuristics, Quick Mode, Lineage, NLP report + PDF export, Dashboard (summary/trends). Đây là những năng lực "enterprise" mà bản mô tả 11 module chưa liệt kê — lợi thế để giữ.

---

## 3. Gap ưu tiên (đề xuất thứ tự làm)

**P0 — Duplicate Engine (module 7).** Đây là gap lớn nhất và là điểm khác biệt cạnh tranh. Xây service `dedupe_service.py` hỗ trợ: exact match, fuzzy (`rapidfuzz`), phonetic (`jellyfish` — Soundex/Metaphone), embedding similarity; cho phép cấu hình khóa tổ hợp (email+phone; name+dob+phone). Trả cụm trùng + confidence để đưa vào review queue sẵn có.

**P1 — Data Profiling chuyên sâu (module 3).** Thêm endpoint `/{dataset_id}/profile` trả min/max/avg, null%, unique%, duplicate%, top-N distribution mỗi cột. Tận dụng `value_counts` đã có; render thành panel "data health" trong preview.

**P1 — Dry-Run cấp Import Job (module 9).** Mở rộng `import_completion_service` để mô phỏng đối chiếu với bảng đích (theo unique keys) và trả `would_insert / would_update / would_fail` trước khi commit.

**P2 — Upload sources (module 1).** Bổ sung Google Sheet URL (gspread/service account) và detect encoding UTF-16/BOM (`charset-normalizer`/`chardet`).

**P2 — Rollback cấp import & export CSV lỗi (module 10–11).** Xác nhận/hoàn thiện khả năng revert sau khi commit vào hệ đích; thêm nút tải CSV các dòng lỗi.

---

## 4. Đánh giá ý tưởng "Plugin Architecture"

**Nhận định: đây là hướng đúng và rất phù hợp** với hiện trạng — đồng thời trùng với cách Ingestro vận hành (chúng ta đã thấy Ingestro bật/tắt tính năng theo `feature-flag` từng tổ chức: `i18n`, `fuzzy_matching`, `contextual_engine`, `role_management`...). Biến mỗi validator/cleaner/mapper/enricher thành plugin độc lập cho phép **mỗi tenant bật/tắt hoặc thêm rule riêng mà không đụng code lõi** — đúng như bạn nói.

**Vì sao khả thi với codebase hiện tại:** các service đã được tách theo chức năng (`validation_service`, `cleaning_service`, `mapping_service`, `mapping_matchers`...) và đã có model `suspicion_rule`, `template`, `target_data_model`. Đây là nền tốt để trừu tượng hóa thành plugin registry.

**Kiến trúc plugin đề xuất (tối giản):**

1. **Định nghĩa contract cho mỗi loại plugin** — interface Python (Protocol/ABC): `Validator`, `Cleaner`, `Mapper`, `Enricher`, `Deduper`. Mỗi plugin khai báo `id`, `version`, `config_schema` (JSON Schema), và hàm `run(context) -> result`.
2. **Plugin Registry** — nạp plugin qua entry-points hoặc thư mục `plugins/`; mỗi plugin là 1 module Python độc lập, không import chéo lõi.
3. **Per-tenant config** — bảng `tenant_plugin_config` (tenant_id, plugin_id, enabled, config_json, order). Pipeline đọc config này để dựng chuỗi bước động thay vì hard-code.
4. **Sandbox & an toàn** — giới hạn tài nguyên/timeout mỗi plugin; validate `config_json` theo `config_schema`; versioning để rollback plugin.
5. **Thứ tự thực thi động** — pipeline hiện là Celery chain cố định; chuyển sang **chain dựng từ danh sách plugin đã bật của tenant** (node_processing/step_handler bạn đã có ý tưởng trong Ingestro là mô hình tham chiếu tốt).

**Lộ trình thực dụng (không viết lại lõi):**
- Bước 1: rút `validation_service` + `cleaning_service` hiện có thành **các plugin built-in** tuân theo contract mới (giữ nguyên hành vi).
- Bước 2: thêm Plugin Registry + bảng `tenant_plugin_config`, cho bật/tắt built-in theo tenant.
- Bước 3: mở API cho phép tenant thêm **rule tùy biến** (khai báo bằng JSON/DSL, không cần code) — đây là 80% giá trị thực tế.
- Bước 4 (nâng cao): cho phép nạp plugin code bên thứ ba trong sandbox.

**Rủi ro cần lưu ý:** bảo mật khi chạy code plugin bên ngoài (sandbox/timeout bắt buộc); độ phức tạp khi debug chuỗi động; cần versioning + kiểm thử hợp đồng (contract test) cho từng plugin. Khuyến nghị **bắt đầu bằng "plugin nội bộ + custom rule qua JSON"** trước, chưa vội mở nạp code ngoài.

---

## 5. Tóm tắt hành động

Ngắn hạn: revoke API key lộ trong readme; xây Duplicate Engine (P0); thêm Data Profiling + Dry-Run cấp job (P1). Trung hạn: refactor validator/cleaner thành plugin built-in + `tenant_plugin_config` để hiện thực hóa hướng plugin per-tenant. Đây là con đường biến "import" thành năng lực cốt lõi, khác biệt của sản phẩm — đúng định hướng bạn đề ra.

*Ghi chú: phân tích dựa trên cấu trúc service/endpoint và grep mã nguồn tại thời điểm 17/07/2026; một vài kết luận (đủ 5 lớp validation, rollback sau commit) nên được xác nhận bằng đọc chi tiết file tương ứng trước khi lên kế hoạch sprint.*
