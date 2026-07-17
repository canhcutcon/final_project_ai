# Hướng dẫn sử dụng — CSV Agent Services

- **Phiên bản:** 1.0 · **Ngày:** 2026-07-04
- **Đối tượng:** Data Analyst, Reviewer, Data Engineer, người mới tiếp nhận dự án
- **Tài liệu liên quan:** `csv-agent-services-prd.md` (yêu cầu sản phẩm), `danh-gia-hien-trang-csv-agent-services.md` (đánh giá hiện trạng)

---

## 1. Sản phẩm làm gì?

CSV Agent Services giúp bạn **upload file CSV/XLSX → tự động phát hiện dòng dữ liệu bất thường bằng ML → xử lý từng case → sinh báo cáo và xuất PDF**, tất cả trên giao diện web. Ngoài ra có thể tự động hoá toàn bộ qua Connectors + Pipelines + Webhooks.

**Các URL khi chạy local:**

| Thành phần | URL |
|---|---|
| Giao diện web | http://localhost:3000 |
| API backend | http://localhost:8000 |
| API docs (Swagger) | http://localhost:8000/docs |
| MinIO console (file browser) | http://localhost:9001 (login `minioadmin`/`minioadmin`) |
| MySQL | localhost:3307 · Redis: localhost:6380 |

---

## 2. Cài đặt & khởi chạy

### 2.1 Yêu cầu

- Docker + Docker Compose
- Nếu chạy local dev: Python 3.10+, Node.js 20+
- Repo anh em `csv_agent_platform` phải nằm **cạnh** repo này (pipeline import module từ `../csv_agent_platform/detection/src` và `generation/src`)

### 2.2 Cách A — Docker Compose (khuyến nghị)

```bash
cd csv_agent_services
docker-compose up --build

# Lần đầu: chạy migration sau khi container lên
docker-compose exec backend alembic upgrade head
```

> ⚠️ Lưu ý: `docker-compose.yml` dùng build context `./csv_agent_services/backend` — nếu lỗi "path not found", chạy compose từ **thư mục cha** của `csv_agent_services`, hoặc sửa context thành `./backend`.

### 2.3 Cách B — Local dev (backend/frontend chạy tay)

**Bước 1 — Hạ tầng (MySQL, Redis, MinIO):**

```bash
cd csv_agent_services
docker-compose up db redis minio -d
```

**Bước 2 — Backend API:**

```bash
cd csv_agent_services/backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Chỉnh `.env` (⚠️ file `.env.example` hiện ghi PostgreSQL — **sai**, hệ thống dùng MySQL):

```env
DATABASE_URL=mysql+aiomysql://user:password@localhost:3307/csv_agent
REDIS_URL=redis://localhost:6380/0
MINIO_URL=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
JWT_SECRET_KEY=<sinh chuỗi ngẫu nhiên mạnh>
GEMINI_API_KEY=<key của bạn — bỏ trống nếu không dùng AI fix>
CONNECTOR_ENCRYPTION_KEY=<Fernet key — cần nếu dùng Connectors>
```

Sinh Fernet key: `python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"`

```bash
alembic upgrade head
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Bước 3 — Celery worker (terminal riêng, BẮT BUỘC):**

```bash
cd csv_agent_services/backend && source venv/bin/activate
celery -A app.core.celery_app worker --loglevel=info --queues=main-queue
```

> ⚠️ **Không có worker thì phân tích đứng ở `pending` mãi mãi.** API vẫn trả lời bình thường nên rất dễ nhầm là lỗi khác.
>
> - macOS: worker mặc định pool `solo` (tránh crash OpenMP) — chỉ chạy 1 task một lúc, là bình thường.
> - Linux: đặt `CELERY_POOL=prefork` và `--concurrency=2` trở lên để tăng throughput.

**Bước 4 — Frontend:**

```bash
cd csv_agent_services/fronted     # lưu ý: thư mục tên "fronted"
npm install
npm run dev
```

`.env.local` cần có (thiếu biến này frontend sẽ gọi `fetch("undefined/...")`):

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

### 2.4 Kiểm tra hệ thống khoẻ

```bash
curl http://localhost:8000/health          # {"status": "ok"}
curl http://localhost:8000/api/v1/config/flags   # feature flags
```

---

## 3. Luồng sử dụng chính (end-to-end)

### Bước 1 — Upload dữ liệu (`/upload`)

Wizard 6 bước:

1. **Ingestion** — kéo-thả file CSV/TSV/PSV/XLSX. Hệ thống upload lên MinIO, hiển thị preview 10 dòng + thống kê cột, và tự nhận diện archetype dữ liệu (`tabular` / `timeseries` / `mixed`) — bạn có thể chọn lại.
2. **Sheet Selection** — chỉ hiện với XLSX nhiều sheet; CSV tự bỏ qua.
3. **Header Selection** — hệ thống đoán dòng header (confidence ≥ 0.75 thì tự chọn); bạn có thể chọn dòng khác, transpose hoặc merge, xem preview rồi xác nhận.
4. **Schema Mapping** — map cột file vào **Target Data Model (TDM)**. Đề xuất đến từ 3 tầng (badge hiển thị): **AI** (Gemini), **Historical** (đã map lần trước), **Fuzzy** (tên giống nhau). Duyệt/sửa từng mapping rồi xác nhận.
5. **Validation** — chạy rule per-column (range, required, enum, regex, cross-column…). Xem tổng hợp errors/warnings, mở drawer xem các dòng bị cờ. Có thể **Save Template** để lần sau dùng lại toàn bộ cấu hình.
6. **Inference/Run** — chọn model (`auto` khuyến nghị) và bấm chạy → hệ thống tạo phân tích và chuyển bạn sang trang Analyses.

### Bước 2 — Theo dõi phân tích (`/analyses` và `/pipeline/{id}`)

- `/analyses`: danh sách job với tab lọc (all/pending/running/completed/failed), tự refresh 5s khi có job đang chạy. Các nút: **Start** (chạy lại), **Stop**, **Delete**, **Monitor**, **View results**.
- Bấm **Monitor** → `/pipeline/{id}`: xem tiến độ realtime qua WebSocket (badge "Live"; nếu WS đứt tự chuyển "Polling" 3s). Chuỗi 5 bước:

```
preprocess (20%) → detect (60%) → fix/flag (75%) → report (88%) → export (100%)
```

- Chọn model tự động theo archetype: `timeseries`→BiLSTM, `tabular`→XGBoost, `mixed`→ensemble. Nếu thiếu trọng số V11, hệ thống **âm thầm fallback sang IsolationForest** — kiểm tra mục Model Metadata ở trang kết quả để biết model nào thực sự chạy.

### Bước 3 — Xem kết quả & xử lý case (`/analyses/{id}`)

- Danh sách dòng bất thường kèm điểm số, đếm mức critical.
- Bấm vào từng dòng để **drill-down**: giá trị thực tế vs khoảng kỳ vọng, đóng góp của từng feature, tóm tắt ngôn ngữ tự nhiên, metadata model.
- Thao tác trên case: đổi trạng thái, **Assign** người điều tra, đánh dấu **False positive**, **Trigger rule** (biến case thành rule nghi vấn tự động cho lần sau), **Export**.

### Bước 4 — Sinh báo cáo (nút **Generate Report** trên `/analyses/{id}`)

- **Không còn anomaly mở** → sinh báo cáo ngay → chuyển sang `/reports/{id}`.
- **Còn anomaly** → mở **Gemini Fix Modal**:
  1. Hệ thống gọi Gemini (model `gemini-2.5-flash-lite`) đề xuất giá trị sửa cho từng dòng lỗi.
  2. Bạn duyệt/sửa từng đề xuất trong bảng (fix confidence ≥ 0.7 được auto-apply; thấp hơn vào hàng đợi review).
  3. Accept → áp fix → sinh báo cáo với `force=true`.
  - Không có `GEMINI_API_KEY`? Modal chạy `fallback_mode` (thử Ollama Qwen local, hoặc chuyển hết sang review tay) — vẫn dùng được.
- Báo cáo hỗ trợ **tiếng Việt / English**, style summary; nội dung Markdown (hiện render dạng plain text).

### Bước 5 — Xuất PDF (`/reports/{id}`)

- Bấm **Export PDF** → backend render PDF (font Noto Sans, hỗ trợ tiếng Việt có dấu) → tải về qua `/report/{id}/download`.
- ⚠️ **Bug đã biết:** PDF do *pipeline tự động* sinh ra nằm sai bucket MinIO nên nút download có thể 404 — chỉ PDF sinh từ nút Export PDF trên trang báo cáo là tải được. (Xem mục 7 Troubleshooting.)

---

## 4. Các module khác

### 4.1 Data Models — TDM (`/tdm`)

Định nghĩa schema chuẩn (tên cột, kiểu, validation, `block_on_required_errors`). Tạo tay bằng editor bảng/JSON, hoặc bấm **Suggest TDM from file** để AI dựng nháp từ file mẫu (cần flag `ai_mapping_enabled` bật — kiểm tra `GET /config/flags`).

### 4.2 Templates (`/templates`)

Cấu hình wizard đã lưu (column configs + rule set). Tạo từ bước Validation của wizard; sửa/xoá tại đây.

### 4.3 Connectors (`/connectors`)

Nguồn vào/ra cho pipeline tự động. **Hiện chỉ MinIO/S3 hoạt động**; FTP/SFTP, HTTP, Email hiển thị trên UI nhưng backend trả 501. Credential được mã hoá (cần `CONNECTOR_ENCRYPTION_KEY` trong `.env`). Có nút Test connection.

### 4.4 Pipelines — recipe tự động (`/pipelines`)

> Phân biệt: **/pipelines** (số nhiều) là *recipe tự động hoá* (connector vào → TDM → detection → connector ra). **/pipeline/{id}** (số ít) là *màn hình theo dõi một lần chạy detection*.

- Tạo recipe, xem lịch sử execution, bấm **Run now**.
- **Trigger từ hệ thống ngoài:** bấm mint **API trigger token** (JWT scoped đúng 1 pipeline) — UI cho sẵn snippet curl:

```bash
curl -X POST http://localhost:8000/api/v1/pipelines/<id>/trigger \
  -H "Authorization: Bearer <token>"
```

Đây là endpoint **duy nhất** hiện yêu cầu xác thực.

### 4.5 Webhooks (`/webhooks`)

Đăng ký URL nhận event (4 loại). Mỗi delivery ký HMAC-SHA256 trong header `X-Webhook-Signature: sha256=<hmac>`; xem hướng dẫn verify tại `/webhooks/docs`; log delivery tại trang chi tiết webhook.

### 4.6 Dashboard (`/dashboard`)

Metric thật: tổng dataset, tổng báo cáo, % anomaly, phân tích gần đây. ⚠️ **Biểu đồ "Intelligence Trends" và các card Nodes/Cluster Health/Threat hiện là mock tĩnh** — đừng dùng để ra quyết định. Tương tự, trang `/reports` (menu Reports) là tài liệu mẫu tĩnh; báo cáo thật nằm ở `/reports/{id}` (đi từ nút Generate Report).

---

## 5. Tham chiếu API nhanh

Đầy đủ và luôn đúng nhất: **http://localhost:8000/docs** (Swagger). Các nhóm chính dưới `/api/v1`:

| Nhóm | Endpoint tiêu biểu |
|---|---|
| Upload/Datasets | `POST /upload`, `GET /upload/{id}/preview`, `GET /datasets`, `/datasets/{id}/sheets·raw-grid·header·validate·mapping/suggest·grid·lineage·undo·redo·complete-import` |
| Analysis | `POST /analysis`, `GET /analysis`, `GET /analysis/{id}/results`, `POST /analysis/{id}/start`, `DELETE /analysis/{id}` |
| Pipeline run | `GET /pipeline/{id}/status`, `POST /pipeline/{id}/stop`, WS `/pipeline/ws/{id}` |
| Cases | `GET/PATCH /analysis/{id}/cases/...`, `POST .../false-positive`, `.../trigger-rule` |
| Report | `POST /report/generate`, `POST /report/suggest-fix`, `POST /report/apply-fix`, `POST /report/{id}/export-pdf`, `GET /report/{id}/download` |
| Dashboard | `GET /dashboard/summary`, `GET /dashboard/trends` |
| TDM/Templates/Rules | `GET·POST·PUT·DELETE /tdm`, `/templates`, `GET /rules/sets`, `POST /tdm/suggest` |
| Tự động hoá | `/connectors...`, `/pipelines...`, `POST /pipelines/{id}/trigger-token`, `POST /pipelines/{id}/trigger` (JWT), `/webhooks...` |
| Hệ thống | `GET /health`, `GET /config/flags` |

---

## 6. Lệnh vận hành thường dùng

```bash
# Migration
cd backend && alembic upgrade head           # áp dụng
alembic revision --autogenerate -m "mô tả"   # tạo mới sau khi sửa model
alembic downgrade -1                         # lùi 1 bản

# Reset toàn bộ DB (mất dữ liệu!)
docker-compose down -v && docker-compose up db -d && alembic upgrade head

# Theo dõi Celery
celery -A app.core.celery_app events

# Test
cd backend && pytest                         # backend (30 file test)
cd fronted && npx jest                       # frontend (chưa có script npm test)

# Duyệt file MinIO: http://localhost:9001 (minioadmin/minioadmin)
```

---

## 7. Troubleshooting

| Triệu chứng | Nguyên nhân | Cách xử lý |
|---|---|---|
| Phân tích đứng `pending` mãi | **Chưa chạy Celery worker** (lỗi phổ biến nhất) | Mở terminal chạy worker (mục 2.3 bước 3); kiểm tra worker nghe queue `main-queue` |
| Kết quả anomaly "kỳ lạ", model hiện `isolation_forest_fallback` | Thiếu file trọng số V11 (`app/ml/models/v11/`) | Kiểm tra `a7_xgb_clean_v11.json`, `a2_dae_v11.pt`, `a11_bilstm_cls_v11.pt`, `v11_artifacts.json` tồn tại; xem `fallback_reason` trong run metadata |
| Pipeline "completed" nhưng điểm số gần như bằng nhau | Thiếu `v11_artifacts.json` → feature vector rỗng | Bổ sung file artifacts rồi re-run |
| Nút download PDF trả 404 | PDF do pipeline sinh nằm bucket `csv-datasets`, endpoint đọc bucket `reports` (bug đã biết) | Dùng nút **Export PDF** trên trang `/reports/{id}` (đường này ghi đúng bucket); hoặc lấy file trực tiếp qua MinIO console |
| Gemini Fix Modal báo `fallback_mode` | Thiếu/sai `GEMINI_API_KEY` | Thêm key vào `backend/.env`, restart backend; hoặc chạy Ollama local (`OLLAMA_URL`, `OLLAMA_FIX_MODEL`) |
| Frontend trắng trơn, console lỗi `fetch undefined/...` | Thiếu `NEXT_PUBLIC_API_BASE_URL` trong `.env.local` | Tạo `.env.local` như mục 2.3 bước 4, restart `npm run dev` |
| Monitor hiện "Polling" thay vì "Live" | WebSocket không kết nối được (proxy/port) | Kiểm tra `NEXT_PUBLIC_WS_URL=ws://localhost:8000`; polling 3s vẫn cho kết quả đúng, chỉ chậm hơn |
| Lỗi import `csv_agent_platform` khi worker chạy preprocess/report | Repo anh em không nằm cạnh repo này | Clone `csv_agent_platform` vào cùng thư mục cha |
| Worker crash SIGSEGV trên macOS | Xung đột OpenMP với prefork | Giữ pool mặc định `solo` trên macOS; chỉ dùng `CELERY_POOL=prefork` trên Linux |
| Lỗi kết nối DB `psycopg`/PostgreSQL | Làm theo `.env.example` cũ (ghi sai PostgreSQL) | Dùng `mysql+aiomysql://...` như mục 2.3 |
| Tạo connector FTP/HTTP/Email báo 501 | Loại connector chưa được triển khai | Hiện chỉ dùng được MinIO/S3 |
| `docker-compose up` báo không tìm thấy build context | Compose file dùng path `./csv_agent_services/backend` | Chạy compose từ thư mục cha, hoặc sửa context thành `./backend` |

---

## 8. Lưu ý an toàn (đọc trước khi share/deploy)

1. **Hầu hết API không có xác thực** — tuyệt đối không expose port 8000/3000 ra internet ở trạng thái hiện tại.
2. `readme.md` gốc từng chứa một Google API key thật — nếu chưa thu hồi, **thu hồi ngay** trên Google Cloud Console.
3. Đặt `JWT_SECRET_KEY` mạnh (mặc định là placeholder), đổi credential MinIO khỏi `minioadmin`, và không commit `.env`/`.env.local`.
