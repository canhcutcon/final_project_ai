# Tổng hợp — đánh giá luận văn và định vị tính mới

Cập nhật 22/09/2026. Tài liệu này gộp hai nguồn, đọc cái này trước rồi mới xuống chi tiết:

| Nguồn | Nội dung |
|---|---|
| [`assessment.md`](assessment.md) | 7 lỗi luận văn (F1–F7) + kết quả chạy lại (R1–R7) |
| [`novelty_map_mapping_cleansing_gate.md`](novelty_map_mapping_cleansing_gate.md) | Bản đồ khoảng trống A1–A5, xác minh prior work (D–F), kết quả benchmark (G) |
| [`../../bench/publication_gate/`](../../bench/publication_gate/) | Mã benchmark chạy được + `FINDINGS.md` |

---

## Phần 1 — Luận văn hiện tại: 7 lỗi, 4 đã lượng hoá

| # | Lỗi | Mức | Trạng thái sau khi chạy lại |
|---|---|---|---|
| F1 | Nhãn benchmark là hàm của đặc trưng quan sát | Major | **Đã đo — cơ chế bị sửa.** Bỏ cột giá chỉ hạ F1 0,035 (Condo) / 0,080 (HDB). "Giữ cột giá" là **sai địa chỉ**; vấn đề là nhãn = phân vị của giá, mà giá đoán được từ cột còn lại. Khuyến nghị bỏ cột là **không đủ**. |
| F1a | Credit Card có fallback tổng hợp âm thầm | Major | Xác nhận. Artifact ghi `n_samples=284807` nên bảng CASH **không** nhiễm, nhưng bẫy vẫn còn cho mọi lần chạy sau. |
| F2 | Chọn ngưỡng trên test | Major | **Đã lượng hoá:** +0,1844 F1 (House Prices, test 219 dòng) → +0,0004 (Condo/HDB, test >5.000). Truy vết **tập nhỏ trước**. |
| F2a | Test trong `eval_set` | — | **Tôi đã sai.** Không có `early_stopping_rounds`, `n_estimators=400` cố định → `eval_set` chỉ ghi metric, không đổi mô hình. |
| F3 | Mệnh đề 3 CASH bỏ sót nhiễu nền | Major | **Đã khoanh vùng:** sai ở p ≲ 5 (p=1 → 0,4999 so với cận 0,75), đúng từ p ≳ 10. **KDD HTTP có 3 cột → nằm trong vùng sai.** Phương án B đúng ở mọi p đã thử. |
| F4 | Tổng hợp sketch lệch lý thuyết | Major | **Nặng nhất.** Median theo toạ độ sai gấp **3,1×–493×**; tăng d làm **xấu đi** (MAE 1,35 → 3,57). Khớp việc `signed_cs_d5` sập trên KDD (F1 = 0,073). |
| F5 | Evidence Packet chưa có phép đo | Major | **ĐÃ ĐO 22–23/09** (630 báo cáo, n=70, structural holdout). Xem Phần H của novelty_map. ⚠️ Kết luận về template **đã đảo ngược** sau khi sửa lỗi baseline — xem Phần I. |
| F6 | Kết luận ensemble mâu thuẫn | Major | **Chín tệp** cần sửa, không phải hai. |
| F7 | Readiness có code, chưa có kiểm chứng | Major | Nay đã có benchmark — xem Phần 3. |

**Thứ tự xử lý:** sửa `_aggregate` (F4, có số đo) → truy vết bảng tập nhỏ (F2) → sửa Mệnh đề 3 ở **cả hai tài liệu** (`cash_theory.tex` giống hệt từng byte giữa luận văn và đề cương) → mô tả lại nhãn Condo/HDB → đồng bộ chín tệp F6.

---

## Phần 2 — Tính mới: hai nhánh đóng, một nhánh hẹp lại

| Nhánh | Kết luận | Bằng chứng |
|---|---|---|
| **Mapping** (exact→synonym→embedding→LLM) | ⚠️ **Nhiều prior work mạnh; tìm kiếm có mục tiêu, chưa bao quát** | Zhang et al. ICDE 2023 (A\*), Magneto PVLDB 2025, Narayan et al. PVLDB 2022 |
| **Cleansing / repair** | ⚠️ **Nhiều prior work mạnh; tìm kiếm có mục tiêu, chưa bao quát**, đã có survey | Zhu et al. 2024 (survey), RetClean 2024, UniClean 2025, DMN4DQ+ 2026, Cleenex 2024 |
| **Gate / verdict staleness** | ⚠️ **Hẹp lại** | "Approved Too Late" **ACSOS 2026** đã chiếm khung: TOCTOU, freshness contract, validity horizon, oracle-labeled expiry |
| **Reconciliation** | ⚠️ **Đã có prior work** | Netinant et al. 2023 — nhưng đánh giá suy biến (mọi chỉ số 100%, ER 0%, không ca âm, không oracle độc lập) |
| **Benchmark quyết định** | ✅ **Vẫn trống** | Không nguồn nào gán nhãn ready/not-ready mức file/job |

### Ba bài học về quy trình

1. **Perplexity sai 2/2 ở mục quan trọng nhất** — gọi ACSOS 2026 và KDD 2023 là "không bình duyệt"; bỏ sót bài MDPI nằm đúng trọng tâm câu hỏi của chính nó; đưa 2 DOI không dùng được. Dùng nó để **mở rộng vùng tìm**, không để **phán xử**.
2. **Đọc toàn văn đổi kết luận.** SIC hoá ra là **vision paper không có mục Evaluation**; ACSOS neo tính mới vào **biến đổi nội sinh** nên không trùm lên miền dữ liệu (ngoại sinh).
3. **Ba nhãn đã có chủ**, không dùng đặt tên: *verdict freshness*, *freshness contract*, *validity horizon*. Nhãn an toàn: **publication-gate TOCTOU**, **exogenous verdict expiry**, **decision-event benchmark**.

---

## Phần 3 — Benchmark: đã dựng, đã chạy, cho kết quả âm có giá trị

`bench/publication_gate/` — corpus + oracle ba tầng + thang B0–B4/B2′ + tiêm sự kiện + quét chi phí.
Dùng **`evaluate_readiness` thật** của `csv_agent_services`. **Oracle đúng 104/104 ca.**

| Lượt | Kết quả |
|---|---|
| 1 | Freshness **thô** (đang chạy trong sản phẩm) bị B2′ áp đảo: false-block 0,625–1,000 so với 0,000 |
| 2 | Freshness **hạt mịn** khớp B2′ đến từng chữ số về an toàn — nhưng **B3 (chấm lại bản sửa) trùng khít B2f**, tức bị hấp thụ, không phải cơ chế riêng |
| 3 | Về **chi phí**: B2f quét ít hơn 40% dòng nhưng **chậm hơn ~50%** ở mọi cỡ tệp. Đo được **h/v = 0,491** → hoà vốn khi **c/n < 0,509**, mà sự kiện đổi ngữ nghĩa buộc c/n = 1 |

### Phát hiện lớn nhất: **53% lỗi ở K = 0**

Không sự kiện nào, không staleness — **mọi** gate vẫn cho qua 34/64 ca đáng chặn:

| Nguồn | Ca | Bản chất |
|---|---|---|
| `lossy_load` (tầng 2) | 16 | Mất mát do **phép biến đổi lúc nạp**; dòng nguồn hợp lệ |
| `email_semantic` (tầng 3) | 16 | Đúng kiểu, **sai nghiệp vụ** |
| `fk_missing` | 6 | Hợp đồng **không khai**, hệ đích **có** cưỡng chế |
| `lease_range` | 6 | Như trên |

**Nhánh freshness dịch chuyển vài phần trăm. Lỗi nền là 53%.** Chọn verdict staleness làm trọng tâm là **tối ưu nhánh sai**.

---

## Phần 4 — Quyết định phải ra

### Khuyến nghị: A + B, với C làm câu hỏi sắc hoá

> **Một cổng chỉ tốt bằng hợp đồng của nó.** Luận văn đo độ phủ hợp đồng–hệ đích, học ràng buộc còn thiếu từ phản hồi từ chối của hệ đích, và đưa đối soát vào **quyết định xuất bản** cho phần mà ràng buộc khai báo **không thể** biểu diễn.

| Hướng | Nhắm | Định vị |
|---|---|---|
| **A — Độ phủ hợp đồng ↔ hệ đích** | 19% lỗi nền | Auto-Validate (SIGMOD 2021) suy từ data lake; AVH (KDD 2023) suy từ lịch sử chạy. **Chưa ai suy từ phản hồi từ chối của hệ đích** |
| **B — Đối soát làm đầu vào cổng** | 50% lỗi nền | Netinant 2023 có đủ chỉ số nhưng **không ca âm, không nối vào cổng** |
| **C — Khi nào kiểm khai báo hơn shadow-load?** | Sắc hoá | Oracle tầng 1 **chính là** shadow load → phép so sánh đã có sẵn |
| **D — Evidence Packet (F5)** | **ĐÃ ĐO 22–23/09** | Kết quả ở Phần H/I của novelty_map. Bằng chứng CÓ giúp (L1→L3 có ý nghĩa); template tất định sau khi sửa đạt NumFid 1,000 |

Ba lý do chọn A+B: nhắm **53%** thay vì vài phần trăm; benchmark **đã dựng xong**; và hai kết quả âm ở Phần 3 trở thành **Related Work của chính nó**.

### Trạng thái đóng góp

| Đóng góp | Trạng thái |
|---|---|
| **A5 — benchmark có oracle độc lập** | ✅ Đứng vững trong mọi kịch bản |
| Chuyển miền hợp đồng hiệu lực | ❌ Hoà an toàn, thua chi phí |
| Chấm lại bản sửa trước duyệt | ❌ Bị hấp thụ vào freshness mức dòng |
| Độ phủ hợp đồng ↔ hệ đích | 🆕 Khuyến nghị |
| Đối soát làm đầu vào cổng | 🆕 Khuyến nghị |

### ⚠️ Điều kiện dừng — đặt NGAY, lúc chưa bị áp lực

Nếu sau **hai tuần** hướng A+B chưa cho kết quả đo được → chuyển sang **D** và đóng luận văn bằng đúng thứ nó đã tuyên bố.

---

## Phần 5 — Việc còn nợ, không được quên

1. **Chưa quét SIGMOD / EDBT / ICDT** — DBLP chặn bot. Đây là lỗ hổng tìm kiếm thật, chưa đóng.
2. **Chưa truy 66 tài liệu SIC trích** — nếu một trong số đó lấp khe thì kết luận Phần 2 phải sửa.
3. **F5 đã đo** (630 báo cáo). Còn nợ: đánh giá **chuyên gia** (bộ công cụ sẵn ở `expert_kit/`), và **LLM-as-Judge đã chạy nhưng KHÔNG đạt calibration** (ρ = 0,174 / −0,101). **F7 vẫn chưa có phép đo trực tiếp.**
4. **Sáu tập benchmark chưa chạy lại** (Credit Card, KDD, Forest Cover, Gisette, Dorothea, Isolet) — cần tải OpenML.
5. **Chưa replay môi trường lịch sử** — tái lập ở Phần 1 dùng scikit-learn 1.9.0 / XGBoost 3.3.0 hiện tại.
6. **Oracle tầng 3 vẫn là luật do người viết** — tầng yếu nhất về tính độc lập, đã khai báo.
7. **Chưa thử dấu vân rẻ hơn** (xxhash trên byte thô) — có thể lật kết luận chi phí ở Phần 3.
8. **B4 (AI đề xuất sửa) chưa hiện thực.**
