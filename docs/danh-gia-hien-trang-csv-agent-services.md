# Báo cáo đánh giá hiện trạng — CSV Agent Services

- **Phiên bản:** 1.0
- **Ngày:** 2026-07-04
- **Người thực hiện:** Business Analyst (Claude)
- **Phạm vi:** Toàn bộ repo `csv_agent_services/` (backend FastAPI, frontend Next.js, hạ tầng Docker Compose, tài liệu hiện có trong `docs/`)

---

## 1. Tóm tắt điều hành (Executive Summary)

CSV Agent Services là một **nền tảng full-stack phát hiện bất thường (anomaly detection) trên dữ liệu CSV/XLSX**, gồm:

- **Backend:** FastAPI (async) + SQLAlchemy 2.0 + Celery/Redis + MySQL + MinIO, với ~24 nhóm API và pipeline phát hiện bất thường 5 bước chạy nền.
- **ML:** XGBoost (supervised), BiLSTM + DAE encoder (semi-supervised), IsolationForest (fallback); bộ trọng số V11 (mặc định) và V10 (legacy) có sẵn trên đĩa.
- **Frontend:** Next.js 14 App Router với wizard nhập liệu 6 bước, theo dõi pipeline realtime qua WebSocket, quản lý case bất thường, sinh báo cáo có hỗ trợ Gemini fix, xuất PDF.

**Kết luận chung:** Sản phẩm ở mức **MVP khá hoàn chỉnh về luồng lõi** (upload → phân tích → theo dõi → báo cáo → PDF) với độ phủ test tốt (30 file test backend, 14 file test frontend). Tuy nhiên có **các lỗ hổng nghiêm trọng về bảo mật** (gần như không có xác thực, lộ API key), **một số tính năng "vỏ" chưa nối dây** (trang Reports mock, biểu đồ dashboard giả, 5 component đã build nhưng không trang nào dùng), và **vài lỗi tích hợp chặn luồng** (PDF sinh từ pipeline không tải về được do lệch bucket MinIO).

**Mức độ sẵn sàng:** ✅ Demo nội bộ / đồ án — sẵn sàng. ⚠️ Pilot có người dùng thật — cần vá P0. ❌ Production — chưa.

---

## 2. Điểm mạnh

| # | Điểm mạnh | Bằng chứng |
|---|---|---|
| 1 | Luồng lõi end-to-end hoạt động: upload → wizard 6 bước → phân tích → monitor realtime → kết quả → báo cáo → PDF | `fronted/app/(pages)/upload/page.tsx`, `backend/app/tasks/pipeline_tasks.py` |
| 2 | Kiến trúc tách bạch: API / services / models / tasks; 10 migration Alembic có trật tự | `backend/app/`, `backend/alembic/` |
| 3 | ML degrade có tầng lớp: thiếu trọng số → IsolationForest fallback, có ghi `fallback_reason` | `app/services/ai_service.py` |
| 4 | WebSocket monitor có fallback tự động sang polling 3s khi WS lỗi | `fronted/hooks/useWebSocket.ts` |
| 5 | Gemini fix flow có 3 tầng dự phòng: Gemini → Qwen qua Ollama → manual-review stub (`fallback_mode`) | `app/services/gemini_fix_service.py`, `GeminiFixModal.tsx` |
| 6 | Undo/redo + lineage đầy đủ cho thao tác sửa dữ liệu (`transform_log`) | `app/api/endpoints/lineage.py` |
| 7 | Credential connector được mã hoá Fernet; webhook ký HMAC-SHA256 chuẩn | `app/core/security.py`, `webhook_tasks.py` |
| 8 | Độ phủ test tốt cho tầng service backend và component wizard frontend | `backend/tests/` (30 file), `fronted/__tests__/` (14 file) |

---

## 3. Vấn đề nghiêm trọng (P0 — chặn pilot/production)

### 3.1 Bảo mật

| # | Vấn đề | Chi tiết | Khuyến nghị |
|---|---|---|---|
| S1 | **Lộ Google API key trong `readme.md`** (dòng 249, key `AIzaSy…` nằm trần trong file đã commit) | Key nằm trong lịch sử git, ai clone repo đều thấy | **Thu hồi (revoke) key ngay lập tức** trên Google Cloud Console, xoá khỏi readme, cân nhắc rewrite lịch sử git |
| S2 | **Gần như không có xác thực**: trong ~100+ endpoint chỉ duy nhất `POST /pipelines/{id}/trigger` yêu cầu JWT | Mọi DELETE, upload, CRUD connector, mint trigger-token đều mở toang; `report.py` hardcode `user_id = 1` | Thêm auth toàn cục (JWT middleware / dependency), RBAC tối thiểu |
| S3 | JWT secret là placeholder (`SECRET_KEY_PLACEHOLDER` mặc định; `.env` vẫn dùng giá trị example) | Trigger token có thể bị giả mạo | Sinh secret mạnh, bắt buộc qua env, fail-fast khi thiếu |
| S4 | CORS `allow_origins=["*"]` kèm `allow_credentials=True` | Cấu hình không hợp lệ/an toàn với trình duyệt | Whitelist origin cụ thể |
| S5 | Webhook `secret` lưu **plaintext** trong DB (trong khi connector credential lại mã hoá Fernet) | Không nhất quán xử lý bí mật | Mã hoá đồng bộ bằng Fernet |
| S6 | Key Gemini thật đang nằm trong `.env` working tree; MinIO dùng creds mặc định `minioadmin/minioadmin` | Rò rỉ khi share máy/backup | Quản lý secret ngoài repo, đổi creds MinIO |

### 3.2 Lỗi tích hợp chặn luồng

| # | Vấn đề | Chi tiết |
|---|---|---|
| B1 | **PDF từ pipeline không tải về được**: Celery `export_pdf_task` ghi vào bucket `csv-datasets` (`reports/report_{id}.pdf`) nhưng `GET /report/{id}/download` đọc từ bucket `reports` | Lệch bucket → 404 khi tải PDF do pipeline sinh ra |
| B2 | **Hai đường sinh báo cáo phân kỳ**: pipeline Celery dùng f-string Markdown tĩnh; `POST /report/generate` mới đi qua NLP pipeline (Aggregate → Enrich → ModelRouter) | Nội dung báo cáo khác nhau tuỳ đường gọi |
| B3 | LLM báo cáo **luôn rơi về template**: thư mục `app/ml/generation/adapter_weights/` không tồn tại → Qwen2/Gemma LoRA không bao giờ load, `model_used="template"` | README ngụ ý có LLM nhưng thực tế là Jinja2 template |
| B4 | `agent_fix_task` **không nằm trong Celery `include`** → chỉ chạy khi API và worker chung process (hỏng ở production đa tiến trình) | `app/core/celery_app.py` |
| B5 | **`sys.path` hack liên repo**: `pipeline_tasks` và `report_generator` inject `../../../../csv_agent_platform/...` lúc runtime — vỡ nếu repo anh em vắng mặt/di chuyển | Cần đóng gói thành package hoặc copy module vào repo |

---

## 4. Vấn đề trung bình (P1 — ảnh hưởng trải nghiệm/độ tin cậy)

| # | Vấn đề | Chi tiết |
|---|---|---|
| M1 | **Trang `/reports` (mục nav "Reports") là mock 100% tĩnh** — "Strategic Intelligence Report Q3 2024", chart SVG giả, nút PDF giả. Trang thật là `/reports/[id]` nhưng không có link nào từ nav | `fronted/app/(pages)/reports/page.tsx` |
| M2 | **Biểu đồ "Intelligence Trends" trên dashboard là SVG hardcode** ("84.2 PB/s", "Nodes 42/42"…); `getDashboardTrends()` có trong API client nhưng không bao giờ được gọi | `fronted/app/(pages)/dashboard/page.tsx` |
| M3 | **5 component đã build + test nhưng mồ côi** (không trang nào import): `ReviewEntriesGrid`, `CompleteImportButton`, `CleaningSuggestionsPanel`, `PromptsPanel`, `LineageTimeline` — toàn bộ luồng cleaning → review → complete-import có API backend nhưng chưa nối vào UI | `fronted/components/review/`, `components/upload/` |
| M4 | `fix_data_task` **không sửa dữ liệu** — chỉ gắn cờ `is_anomaly`; việc sửa thật nằm ở luồng Gemini/review riêng. Tên task gây hiểu nhầm | `app/tasks/pipeline_tasks.py` |
| M5 | `.env.example` ghi **PostgreSQL** nhưng code chỉ chạy **MySQL** (aiomysql/pymysql); thiếu `CONNECTOR_ENCRYPTION_KEY` và các flag khác | `backend/.env.example` |
| M6 | Connector `ftp_sftp` / `http` / `email` trả 501 (chưa triển khai) nhưng UI vẫn cho tạo | `app/services/connectors/` |
| M7 | Báo cáo trả Markdown nhưng frontend render **plain text** (`whitespace-pre-wrap`, không có Markdown renderer) | `fronted/app/(pages)/reports/[id]/page.tsx` |
| M8 | Thiếu `v11_artifacts.json` → feature gần 0, dự đoán vô nghĩa nhưng pipeline vẫn "completed" (chỉ log ERROR) | `app/ml/models/universal_features.py` |
| M9 | Frontend `apiFetch` không có fallback khi thiếu `NEXT_PUBLIC_API_BASE_URL` → `fetch("undefined/...")`; xử lý lỗi chỉ trả `API Error: <status>` chung chung | `fronted/lib/api.ts` |
| M10 | Hai khái niệm "pipeline" trùng tên dễ nhầm: `pipeline_runs` (chuỗi detection Celery, route `/pipeline/{id}`) vs `pipelines` (recipe không giám sát Epic 5, route `/pipelines/{id}`) | models + endpoints |

---

## 5. Vấn đề nhỏ (P2 — vệ sinh mã nguồn)

- Thư mục frontend đặt tên sai chính tả: `fronted/` (thay vì `frontend/`); docker-compose build context trỏ `./csv_agent_services/backend` (sai nếu compose chạy từ trong thư mục — cần chạy từ thư mục cha hoặc sửa path).
- `package.json` frontend **không có script `test`** dù có bộ Jest đầy đủ (phải chạy `npx jest`).
- README kể model TranAD/AnoGAN nhưng backend **không có** hai model này (chỉ XGBoost/BiLSTM+DAE/IsolationForest); README cũng ghi trọng số V10 trong khi mặc định code là V11.
- Nút Settings/Support ở SideNavBar và ô search ở TopAppBar không có handler (chết).
- File rác đã commit: `dashboard.zip`, `stitch*.zip`, ảnh chụp màn hình, `._package-lock.json`, `.env.local`.
- Celery pool mặc định `solo` + concurrency 1 (workaround SIGSEGV OpenMP trên macOS) — nghẽn cổ chai throughput; production cần `CELERY_POOL=prefork`.
- PRD cũ trong `docs/detection-data-processing-pipeline-prd.md` mô tả **một sản phẩm khác** (pipeline Python headless cho 22 file bất động sản Singapore, "no graphical UI") — web app hiện tại chưa từng có PRD riêng. → Đã khắc phục bằng PRD mới đi kèm báo cáo này.

---

## 6. Ma trận mức độ hoàn thiện theo module

| Module | Backend | Frontend | Nối dây E2E | Ghi chú |
|---|---|---|---|---|
| Upload + preview | ✅ | ✅ | ✅ | Wizard 6 bước hoàn chỉnh |
| Sheet/Header detection | ✅ | ✅ | ✅ | Hỗ trợ XLSX đa sheet, transpose |
| TDM + Schema mapping | ✅ | ✅ | ✅ | AI/fuzzy/historical mapping |
| Validation + rules | ✅ | ✅ | ✅ | Có mock switch `NEXT_PUBLIC_MOCK_VALIDATE` |
| Cleaning / Prompts / Lineage / Grid | ✅ | ⚠️ component mồ côi | ❌ | API đủ, UI chưa nối |
| Detection pipeline (Celery) | ✅ | ✅ | ✅ | Monitor WS + polling fallback |
| Anomaly cases | ✅ | ✅ | ✅ | Drill-down, assign, false-positive |
| Report + Gemini fix | ✅ | ✅ | ⚠️ | PDF pipeline lệch bucket (B1); render plain text |
| Dashboard | ✅ | ⚠️ | ⚠️ | Summary thật, trends chart giả |
| Connectors | ⚠️ chỉ MinIO/S3 | ✅ | ⚠️ | 3/4 loại trả 501 |
| Pipelines (recipe) + trigger token | ✅ | ✅ | ✅ | Endpoint duy nhất có auth |
| Webhooks | ✅ | ✅ | ✅ | HMAC ký đúng chuẩn |
| Templates | ✅ | ✅ | ✅ | |
| Auth / phân quyền | ❌ | ❌ | ❌ | Chỉ 1 endpoint có JWT |

---

## 7. Khuyến nghị ưu tiên

**Ngay lập tức (tuần này):**
1. Thu hồi Google API key lộ trong `readme.md` (S1) — đây là việc khẩn cấp nhất.
2. Sửa lệch bucket PDF (B1) — 1 dòng code, mở khoá luồng tải PDF.
3. Sửa `.env.example` về MySQL + bổ sung biến thiếu (M5).

**Sprint kế tiếp (P0):**
4. Auth toàn cục JWT + secret mạnh (S2, S3), siết CORS (S4).
5. Đăng ký `agent_fix_task` vào Celery include (B4).
6. Hợp nhất 2 đường sinh báo cáo — cho pipeline gọi NLPService (B2).

**Roadmap (P1):**
7. Nối 5 component mồ côi vào luồng review/cleaning hoặc xoá (M3).
8. Thay trang `/reports` mock bằng danh sách báo cáo thật, thêm Markdown renderer (M1, M7).
9. Nối `getDashboardTrends()` vào chart thật (M2).
10. Đóng gói `csv_agent_platform` thành dependency thay vì sys.path hack (B5).

Chi tiết yêu cầu xem **PRD** (`csv-agent-services-prd.md`); vận hành xem **Hướng dẫn sử dụng** (`csv-agent-services-huong-dan-su-dung.md`).
