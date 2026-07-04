# BUG — Header Selection kẹt "Loading transposed preview…" (04/07/2026)

## Triệu chứng
- Ở bước 3 (Header Selection) của wizard Ingest, sau khi tick **Transpose rows/columns**, bảng preview đứng mãi ở `Loading transposed preview…` và không bao giờ hiện dữ liệu.
- Network tab có: `GET http://localhost:8000/api/v1/datasets/1/sheets` → **400 Bad Request**.
- Dataset trong ảnh: **84,532 rows · 15 cols** (file dạng CSV/delimiter).

## Phân loại 2 hiện tượng

### 1) `GET /datasets/{id}/sheets` → 400  → **KHÔNG phải bug** (đúng thiết kế, chỉ gây nhiễu)
- Backend `datasets.py:199-203` trả 400 `"format '...' has no sheet concept"` cho các định dạng delimiter (csv/tsv/psv) vì chúng không có khái niệm "sheet".
- Frontend `SheetSelectionStep.tsx:50-60` **đã catch** lỗi 400 này và auto-skip sang bước sau — đúng theo AC2.
- ⇒ 400 này là hành vi mong đợi. Chỉ "xấu" ở chỗ nó xuất hiện như một lỗi đỏ trong Network tab. (Optional: đổi sang trả `[]` 200 thay vì 400 để bớt nhiễu.)

### 2) Transpose preview treo  → **ĐÂY MỚI LÀ BUG THẬT**

**Root cause: transpose làm nổ số cột, không có giới hạn (cap) theo cột.**

Luồng lỗi:
- `HeaderSelectionStep.tsx:129` gọi `previewHeaderTransform(datasetId, { transpose: true })` → `POST /datasets/{id}/header/preview`.
- Backend `datasets.py:354` `_read_raw_grid()` đọc **TOÀN BỘ** file (cả 84,532 dòng) vào list Python 2D (xem `datasets.py:78-91`, dùng `df_raw.values.tolist()`).
- `datasets.py:356` `working_grid = transpose_grid(raw_grid)` → hoán vị **84,532 × 15** thành **15 × 84,532**.
- `datasets.py:360` `"rows": _clean_grid(working_grid[:RAW_GRID_ROW_CAP])` — `RAW_GRID_ROW_CAP = 30` (`datasets.py:45`) chỉ cap **theo dòng**. Sau transpose lưới chỉ còn 15 dòng nên cap 30 vô tác dụng, **nhưng mỗi dòng có 84,532 cột**.
- ⇒ Payload JSON ≈ **15 × 84,532 ≈ 1.27 triệu ô** + `column_count = 84,532`. Serialize + truyền + render 84k cột ở frontend cực chậm → UI treo ở "Loading transposed preview…" (thực chất đang chờ / có thể timeout / OOM).

**Đối chiếu:** endpoint GET `/raw-grid` (`datasets.py:313`) `capped = raw_grid[:RAW_GRID_ROW_CAP]` cũng chỉ cap theo dòng — với lưới **không transpose** thì OK (15 cột), nhưng khi transpose thì cột mới là chiều bị nổ và **không hề có cap cột**.

## Vị trí code liên quan
- `csv_agent_services/backend/app/api/endpoints/datasets.py:334-381` — endpoint `POST /header/preview` (thiếu cap cột).
- `csv_agent_services/backend/app/api/endpoints/datasets.py:356` — `transpose_grid(raw_grid)` transpose toàn bộ trước khi slice.
- `csv_agent_services/backend/app/api/endpoints/datasets.py:45` — `RAW_GRID_ROW_CAP = 30` (chỉ có cap dòng, không có cap cột).
- `csv_agent_services/backend/app/api/endpoints/datasets.py:78-91` — `_read_raw_grid()` đọc toàn bộ file mỗi lần preview (tốn kém).
- `csv_agent_services/backend/app/services/header_detection_service.py:155-161` — `transpose_grid()` (pure, không cap).
- `csv_agent_services/fronted/components/upload/HeaderSelectionStep.tsx:116-137` — `handleToggleTranspose` (không có timeout/giới hạn hiển thị).

## Đề xuất fix (ưu tiên từ trên xuống)
1. **Cap cột cho preview (fix chính, nhỏ gọn):** thêm `RAW_GRID_COL_CAP` (vd 50) và cắt cả 2 chiều ở endpoint `/header/preview` (và `/raw-grid`):
   ```python
   sliced = [row[:RAW_GRID_COL_CAP] for row in working_grid[:RAW_GRID_ROW_CAP]]
   result = { ..., "rows": _clean_grid(sliced),
              "row_count": len(working_grid),
              "column_count": len(working_grid[0]) if working_grid else 0 }
   ```
   Trả `row_count`/`column_count` đầy đủ để UI báo "đang hiển thị N/M cột" nhưng payload nhỏ.
2. **Chỉ transpose phần cần preview:** vì chỉ cần `RAW_GRID_ROW_CAP` dòng đầu của lưới đã transpose = `RAW_GRID_ROW_CAP` cột đầu của lưới gốc, có thể transpose sau khi đã cắt để tránh dựng lưới 1.27M ô trong RAM.
3. **Đọc file có giới hạn:** `_read_raw_grid` có thể `nrows`-limit khi đọc để preview (không cần load hết 84k dòng chỉ để hiển thị header).
4. **Frontend phòng hờ:** thêm timeout + hiển thị lỗi rõ ràng cho `previewHeaderTransform` thay vì spinner vô hạn; cân nhắc chỉ render tối đa N cột.

## Cách tái hiện
1. Upload 1 file CSV/delimiter nhiều dòng (vd ~80k dòng, 15 cột).
2. Vào wizard Ingest → tới bước 3 Header Selection.
3. Mở **Advanced options** → tick **Transpose rows/columns**.
4. Quan sát: bảng kẹt mãi ở "Loading transposed preview…".

## Trạng thái
- [ ] Chưa fix — mới ghi nhận & xác định root cause (chưa sửa code).
