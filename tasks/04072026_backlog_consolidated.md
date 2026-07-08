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

| 8 | ✅ **A. PDF bucket mismatch** | Quyết định: thống nhất bucket `reports`. Sửa `pipeline_tasks.py` ghi PDF bằng `client.put_object("reports", ..., content_type="application/pdf")` (khớp reader `report.py:321` + `nlp_service`), thay vì `upload_file()` (hard-code `csv-datasets` + text/csv). Import OK. |
| 9 | ✅ **D. README lệch model** | Xoá 2 dòng phantom TranAD/AnoGAN khỏi bảng model (readme.md = README.md, cùng inode). Model thật: xgboost, bilstm, ensemble, isolation_forest (fallback). |
| 10 | ✅ **E. PRD cũ lệch** | Thêm banner ARCHIVED/SUPERSEDED đầu `docs/detection-data-processing-pipeline-prd.md`, trỏ về `csv-agent-services-prd.md`. Không xoá (giữ lịch sử). |
| 11 | ✅ **F. Test drift pandas 3.0** | Pin `pandas>=2.2.1,<3` trong requirements + downgrade venv về pandas 2.3.3. Test `test_select_sheet` pass. Full suite **52 passed**. |
| 12 | ✅ **C. Component không dùng** | Xác minh 3 component (CompleteImportButton, ReviewEntriesGrid, CleaningSuggestionsPanel) không page nào import; backend đã có API (`/complete-import`, prompts). Ghi rõ vào **câu hỏi mở #1** trong `csv-agent-services-prd.md` (kèm chi phí wiring thấp). |

Cập nhật: **B đã làm xong** (quyết định: nối cả hai vào data thật).

| 13 | ✅ **B. UI giả → data thật** | (1) Thêm backend `GET /api/v1/report` (list) trong `report.py` + `getReports()` trong `api.ts`. (2) Rewrite `reports/page.tsx` từ mock "Q3 2024" thành listing thật (fetch getReports, link `/reports/{id}`, nút download PDF khi has_pdf). (3) Dashboard trends: bỏ SVG hardcode, vẽ polyline từ `getDashboardTrends` (labels/primary/secondary). Frontend `tsc --noEmit` = **0 errors**; backend import OK. |
| 14 | ✅ **PRD open questions chốt** | #2 ship LoRA · #3 single-tenant (thêm cột tenant_id nullable) · #4 branding = "CSV Agent Services". Đã ghi vào `csv-agent-services-prd.md` §8. |
| 15 | ✅ **Branding UI** | Đổi "Sovereign Intelligence"/"Intelligence Framework v1.0" → "CSV Agent Services" (layout.tsx title/desc, SideNavBar). Bỏ flavor "Sovereign Data Privacy Framework". tsc 0 errors. |

## ⏳ CẦN QUYẾT ĐỊNH / CHƯA LÀM

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
