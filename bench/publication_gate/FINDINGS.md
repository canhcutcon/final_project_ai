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

## 7. Quét chi phí theo cỡ tệp — cơ chế freshness THUA trên trục chi phí

`cost_sweep.py`, 5 lần lặp mỗi ô, cỡ tệp 200 / 2.000 / 20.000 dòng.

| n dòng | K | B2f quét | B2f thời gian | B2′ quét | B2′ thời gian | Tiết kiệm quét | **Tiết kiệm thời gian** |
|---|---|---|---|---|---|---|---|
| 200 | 1 | 120,4 | 1,33 ms | 200,0 | 0,91 ms | 39,8% | **−46,2%** |
| 2.000 | 1 | 1.200,4 | 14,55 ms | 2.000,0 | 9,50 ms | 40,0% | **−53,2%** |
| 20.000 | 1 | 12.000,4 | 143,09 ms | 20.000,0 | 100,42 ms | 40,0% | **−42,5%** |
| 20.000 | 5 | 20.000,0 | 142,23 ms | 20.000,0 | 94,50 ms | 0,0% | **−50,5%** |

**B2f quét ít hơn 40% số dòng nhưng CHẬM HƠN khoảng 50% về thời gian thực, ở mọi cỡ tệp.**
Tiết kiệm số dòng quét là ảo: nó không tính chi phí **bắt buộc phải bằm dấu vân mọi dòng** để biết
dòng nào đã đổi.

### Điều kiện hoà vốn, đo trực tiếp trên n = 20.000

| Thành phần | Chi phí/dòng |
|---|---|
| Bằm dấu vân `h` (SHA-256 trên JSON dòng) | 2,334 µs |
| Kiểm đầy đủ `v` | 4,754 µs |
| Kiểm unique `u` (cả hai đều chịu) | 0,121 µs |

**Tỉ lệ h/v = 0,491.**

Bỏ `u` vì cả hai bậc đều chịu:

> B2f rẻ hơn B2′ ⟺ n·h + c·v < n·v ⟺ **h/v < 1 − c/n**
>
> Với h/v = 0,491 → freshness chỉ rẻ hơn khi **tỉ lệ dòng đổi c/n < 0,509**.

Nhưng trong mô hình sự kiện, hai trong bốn loại (`constraint_tighten`, `transform_change`) đổi
**ngữ nghĩa** nên buộc c/n = 1. Ngay ở K=1 điều đó xảy ra khoảng một nửa số lần, và khi xảy ra thì
B2f trả **n·h + n·v = 1,49× chi phí của B2′**. Đó là lý do thời gian thực luôn tệ hơn.

### Phát biểu trung thực

Giả định nền của mọi cơ chế freshness — *"so hash rẻ hơn nhiều so với kiểm lại"* — **sai với tải này**.
Bằm một dòng tốn gần một nửa chi phí kiểm dòng đó. Kết quả phụ thuộc hai đại lượng, phải nói rõ:

1. **h/v của hệ thống cụ thể.** Nếu kiểm dòng đắt hơn nhiều (tra cứu khoá ngoại qua DB, kiểm chéo
   bảng, gọi LLM) thì h/v giảm mạnh và freshness thắng. Ở đây validator chỉ là vài regex nên v rẻ.
2. **Cách bằm.** SHA-256 trên `json.dumps` từng dòng là cách bằm nặng. Dấu vân rẻ hơn (xxhash trên
   chính byte dòng CSV đã đọc) sẽ hạ h đáng kể. **Chưa thử.**

Vậy kết luận đúng là: *với dấu vân SHA-256-trên-JSON và validator rẻ, freshness không thể hoà vốn.*
**Không** được kết luận "freshness luôn thua".

## 8. Trạng thái đóng góp sau ba lượt đo

| Đóng góp | Trạng thái |
|---|---|
| A5 — benchmark quyết định có oracle độc lập | ✅ **Đứng vững** — oracle đúng 104/104, thang chạy được, có điều kiện hoà vốn định lượng |
| Chuyển miền hợp đồng hiệu lực | ❌ **Hoà về an toàn, THUA về chi phí** — chưa có trục nào thắng |
| Chấm lại bản sửa trước phê duyệt | ❌ Bị hấp thụ vào freshness mức dòng |

Hai việc có thể cứu trục chi phí, theo thứ tự rẻ nhất trước:
1. Đổi sang dấu vân rẻ (xxhash trên byte thô) và đo lại h/v.
2. Làm validator đắt lên cho đúng thực tế (khoá ngoại tra DB thật thay vì kiểm khoảng 1..28) rồi đo lại.

Nếu cả hai đều không lật được, phải báo cáo kết quả âm và để **A5 là đóng góp duy nhất**.
