# Kết quả benchmark — 22/09/2026

Ba hạt giống (42, 43, 44) × 104 ca × K ∈ {0, 1, 5, 20}. Kết quả thô: `results_seed*.json`.
Lượt 1 dùng freshness thô; lượt 2 (dưới đây) thêm **freshness hạt mịn**, **B3 chấm lại bản sửa**
và **đo chi phí**.

## 1. Freshness hạt mịn CỨU được cơ chế

| K | Gate | unsafe-acceptance (3 seed) | false-block (3 seed) |
|---|---|---|---|
| 1 | B1 target-aware (đóng băng) | 0,654 / 0,625 / 0,653 | 0,000 |
| 1 | B2 freshness **thô** | 0,103 / 0,125 / 0,093 | **0,769 / 0,625 / 0,690** |
| 1 | **B2f freshness hạt mịn** | 0,359 / 0,400 / 0,373 | **0,000 / 0,000 / 0,000** |
| 1 | B2′ revalidate | 0,359 / 0,400 / 0,373 | 0,000 / 0,000 / 0,000 |
| 5 | B2 freshness **thô** | 0,022 / 0,011 / 0,021 | **1,000 / 0,786 / 0,818** |
| 5 | **B2f freshness hạt mịn** | 0,163 / 0,222 / 0,215 | **0,000** |
| 5 | B2′ revalidate | 0,163 / 0,222 / 0,215 | 0,000 |

**B2f khớp B2′ ĐẾN TỪNG CHỮ SỐ** trên cả hai chỉ số an toàn, ở mọi K và mọi hạt giống — đồng thời
xoá bỏ thảm hoạ false-block của freshness thô (0,625–1,000 → 0,000).

Kết luận âm ở lượt 1 ("freshness bị revalidation áp đảo") **chỉ đúng cho freshness thô toàn tệp** —
đúng cái đang chạy trong `assessment_gate_service._freshness_of`. Hạt mịn hoá là đủ để gỡ.

## 2. Nhưng lợi thế chi phí PHÂN RÃ theo cửa sổ lệch

Số dòng phải kiểm đầy đủ trên mỗi quyết định (trung bình 3 hạt giống):

| K | B2f hạt mịn | B2′ revalidate | Tiết kiệm |
|---|---|---|---|
| 1 | 102,2 | 200,0 | **49%** |
| 5 | 175,8 | 200,0 | **12%** |
| 20 | 200,0 | 200,0 | **0%** |

Lý do: sự kiện `constraint_tighten` và `transform_change` đổi **ngữ nghĩa** nên buộc quét lại toàn bộ.
Cửa sổ càng dài, xác suất đã xảy ra ít nhất một sự kiện như vậy càng tiến tới 1.

**Đóng góp chuyển miền chỉ sống trong chế độ ít biến động.** Đây là kết quả có biên rõ ràng, phải
phát biểu đúng như vậy chứ không được nói chung chung là "freshness tốt hơn".

## 3. B3 (chấm lại bản sửa) BỊ HẤP THỤ vào B2f — không phải đóng góp độc lập

Đối chiếu B2f với B3 trên 3 hạt giống × 4 giá trị K × 3 chỉ số: **giống nhau ở tất cả**, trừ đúng một
chỗ lệch do làm tròn (175,1 vs 175,2 dòng/quyết định).

Nguyên nhân có cấu trúc: freshness hạt mịn **vốn đã** quét lại mọi dòng có digest thay đổi, mà một
bản sửa được áp thì digest của dòng đó đổi. Nên "chấm lại bản sửa trước phê duyệt" **chính là**
freshness mức dòng, không phải cơ chế thứ hai.

Hệ quả: danh sách khoảng trống ở Phần D/F của `novelty_map` phải **bỏ mục "chấm lại bản sửa ứng
viên"** — nó không đứng riêng được.

Ngoại lệ duy nhất làm nó sống lại: nếu bản sửa được áp qua kênh mà digest đánh giá **không phủ**
(ví dụ working copy riêng). Đó là câu hỏi thiết kế sản phẩm, không phải chỗ để dựng khác biệt nhân tạo.

## 4. Đường cơ sở đóng băng suy thoái mạnh

B1 (đánh giá một lần, tin tuyên bố đã sửa): unsafe-acceptance 0,65 → 0,72 → 0,79 khi K đi từ 1 → 5 → 20.
Đây là động cơ định lượng cho toàn bộ bài toán: **không làm gì với thời gian thì cổng hỏng dần**.

## 5. Giới hạn của chính lượt đo này

1. **K=20 có mẫu số false-block bằng 0 hoặc rất nhỏ** — gần như mọi ca đã bẩn. Con số false-block ở
   K=20 là vô nghĩa, không được trích.
2. `rows_scanned` là **đại lượng thay thế** cho chi phí, chưa đo thời gian thực hay I/O.
3. Corpus tổng hợp 200 dòng/ca, một lược đồ đích duy nhất. Chưa có dữ liệu thật, chưa đa lược đồ.
4. Oracle tầng 3 vẫn là luật do người viết — tầng yếu nhất về tính độc lập, đã khai báo trong README.
5. B4 (AI đề xuất sửa) **vẫn chưa hiện thực**, đã gỡ khỏi danh sách chạy thay vì để trùng B3.

## 6. Trạng thái đóng góp sau hai lượt

| Đóng góp | Trạng thái |
|---|---|
| A5 — benchmark quyết định có oracle độc lập | ✅ **Đứng vững**, đã chạy, oracle đúng 104/104 |
| Chuyển miền hợp đồng hiệu lực | ⚠️ **Sống có điều kiện** — chỉ thắng ở K thấp, hoà ở K cao |
| Chấm lại bản sửa trước phê duyệt | ❌ **Bị hấp thụ** vào freshness mức dòng |
