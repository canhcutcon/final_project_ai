# Backlog tổng hợp phiên 04/07/2026 — csv_agent_services

Ghi lại toàn bộ vấn đề đã phát hiện/được báo trong phiên, kèm trạng thái. Chi tiết bug transpose
xem file `04072026_bug_transpose_preview.md`.

## ✅ ĐÃ XONG (đã sửa + verify trong phiên này)

| # | Việc | Chi tiết |
|---|---|---|
| 1 | Cài Python 3.14 (Homebrew) | `/opt/homebrew/bin/python3.14` (3.14.6). Không dùng cho venv vì torch chưa có wheel 3.14. |
| 2 | Recreate venv | Xoá venv hỏng (shebang trỏ python3.10/3.14 mất), tạo lại bằng **Python 3.12.13** + `pip install -r requirements.txt` (torch 2.12.1, celery 5.6.3, xgboost 3.3.0…). |
| 3 | Celery `Error 61` Redis | Sai port trong `backend/.env`: Redis container map host **6380** nhưng `.env` để 6379. Sửa `REDIS_URL` → `redis://localhost:6380/0`. Verify `Redis PING: True`. |
| 4 | Bug transpose treo (cap cột) | `datasets.py`: thêm `RAW_GRID_COL_CAP=50`, cap CẢ 2 chiều ở `/header/preview` + `/raw-grid` + cap `merged_header_preview`. `row_count/column_count` vẫn báo full. |
| 5 | Nhiễu 400 `/sheets` | Delimiter (csv/tsv/psv) → trả `200 []` thay vì 400. Cập nhật docstring + test `test_list_sheets_delimiter_format_returns_empty_list`. |
| 6 | requirements.txt thiếu deps | Thêm **openpyxl** (RUNTIME — đọc .xlsx, trước đây thiếu nên `/sheets` cho Excel sẽ lỗi thật), **pytest-asyncio**, **aiosqlite** (test). |
| 7 | `.env.example` lệch | postgres:5432 → `mysql+aiomysql://...:3307`; redis 6379 → 6380 (khớp code thật, theo chỉ đạo "dùng mysql"). |

Kết quả test: `test_sheets.py` + `test_grid.py` = **26 passed, 1 failed** (failure là drift pandas 3.0, xem #F).

## ⏳ CẦN QUYẾT ĐỊNH / CHƯA LÀM

### A. Bug chặn PDF pipeline — bucket mismatch (1 dòng, cần chọn hướng)
- **Ghi:** `pipeline_tasks.py:430` `upload_file(...)` → bucket **`csv-datasets`** (storage.py:19), key `reports/report_{id}.pdf`.
- **Đọc:** `report.py:321` `get_object("reports", ...)` → bucket **`reports`**.
- **Thêm:** `nlp_service.py:79` (writer thứ 2) ghi vào bucket **`reports`** → khớp reader.
- ⇒ PDF do PIPELINE (Celery) sinh nằm ở `csv-datasets` nhưng download tìm ở `reports` → tải fail.
- **2 lựa chọn 1 dòng:**
  - (A1) Sửa reader `report.py:321` đọc bucket `csv-datasets` (`minio_service.get_file(report.pdf_path)`) — khớp pipeline, NHƯNG làm hỏng path `nlp_service`.
  - (A2) Sửa writer để pipeline ghi vào `reports` — nhưng `upload_file` hard-code bucket `csv-datasets`, không phải 1 dòng sạch.
  - → **Khuyến nghị:** thống nhất 1 bucket cho report PDF. Cần chốt: dùng `reports` hay `csv-datasets`? (chưa sửa, chờ quyết định)

### B. UI "giả" (mock/hardcode)
- Trang **Reports** trên menu = tài liệu mock tĩnh "Q3 2024".
- Biểu đồ **trends** ở dashboard = SVG hardcode.
- Báo cáo thật chỉ xem được qua `/reports/{id}`.
- **Quyết định:** nối dây vào data thật, hay gắn nhãn "demo/placeholder"? (chưa làm)

### C. 5 component đã build+test nhưng không trang nào dùng
- Toàn bộ luồng **cleaning → review → complete-import**; backend đã có đủ API.
- User: đưa thành **câu hỏi mở số 1 trong PRD** (nối dây hay xoá). (chờ)

### D. README lệch model
- README dòng 184-185 liệt kê **TranAD, AnoGAN** nhưng `app/ml/models/` KHÔNG có (chỉ có bilstm_classifier, dae_encoder, xgboost_detector, v10, v11).
- **Quyết định:** xoá khỏi README hay implement model? (chưa làm)

### E. PRD cũ lệch sản phẩm
- `docs/detection-data-processing-pipeline-prd.md` mô tả sản phẩm khác (pipeline headless, "no graphical UI").
- **Quyết định:** archive/xoá/hoà giải với `csv-agent-services-prd.md`? (chưa làm)

### F. Test drift do version
- `test_select_sheet_persists_choice_and_updates_counts` fail: pandas 3.0 trả dtype `'str'` thay vì `'object'`.
- **Quyết định:** cập nhật assertion của test cho pandas 3.0, hay pin `pandas<3`? (chưa làm)

### G. `/analyses/1` kẹt "Loading analysis…"
- Backend trả 200 nhanh (4ms, 430 bytes), env đúng → nghi frontend / cần restart dev server nạp `.env.local`.
- **Cần:** mở Console tab ở `/analyses/1` xem lỗi đỏ. (chờ thông tin)
