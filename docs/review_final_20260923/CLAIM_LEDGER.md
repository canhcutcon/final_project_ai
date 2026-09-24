# Ledger claim — nguồn kết luận hiện hành duy nhất

**Lập 24/09/2026 (P0 của `PLAN_FINAL.md` Revision 3).** Mọi tài liệu khác trong hồ sơ là **lịch sử**.
Khi tài liệu cũ và ledger mâu thuẫn, ledger thắng. Ledger không chứa số liệu mới: nó ghi *claim nào
còn đứng, ở phạm vi nào, dựa trên artifact nào, và còn thiếu gì*.

**Quy tắc dùng:**

- Không viết kết luận mới bằng cách chép H/I/F lịch sử. Chép từ cột “Phạm vi được phép dùng”.
- Một claim chỉ chuyển sang **GIỮ** khi có artifact dẫn được (đường dẫn + hash hoặc run id).
- Số đếm vị trí claim lấy từ `p0/occurrence_manifest.json`, không đếm tay.
- Ledger này chưa mở `HOLDOUT_CONFIRM.json`; không mục nào ở đây là kết quả xác nhận.

**Từ vựng trạng thái**

| Mã | Nghĩa |
|---|---|
| `GIỮ` | Còn đứng trong phạm vi ghi ở cột phạm vi. |
| `THU HẸP` | Lõi còn đúng, phần suy rộng đã bị cắt. |
| `RÚT` | Không được dùng làm kết luận hiện hành, ở bất kỳ phạm vi nào. |
| `CHƯA ĐO` | Chưa có phép đo hợp lệ. Không suy đoán chiều kết quả. |
| `CHẶN` | Có lỗi correctness/thiết kế đang chặn; phải sửa trước khi dùng. |

## 0. Artifact của chính lượt P0 này

| Artifact | sha256 (16) | Vai trò |
|---|---|---|
| `p0/occurrence_manifest.json` | `7f0288e1cdf5f4e6` | Vị trí 11 nhóm claim đã rút, sinh bằng máy, 348 file quét, git `26e7a68e` |
| `p0/label_provenance_manifest.json` | `a8593531d0353524` | Nguồn nhãn 8 dataset detector (D1b), đọc từ loader |
| `audit_evidence.json` | `678692db12aeabdc` | Probe tất định của rà soát 23/09 + hash snapshot 51 file |
| `PREREGISTRATION.md` (sau A1) | `3f89a036f98b56e6` | Trạng thái checkbox đã sửa, có nhật ký amendment |

Công cụ tái lập: `p0/build_occurrence_manifest.py`, `audit_probes.py`. Cả hai read-only.

## 1. Claim đã RÚT khỏi kết luận hiện hành

Đây là danh sách chặn: không câu nào dưới đây được xuất hiện như kết luận trong bản nộp.

| # | Claim đã rút | Vì sao | Vị trí (manifest) | Thay bằng |
|---|---|---|---|---|
| 1 | “LLM thắng template về độ trung thực” | Baseline template có lỗi bỏ `ratio` dạng chuỗi; sửa xong NumFid 0,570 → 1,000 | `C1`: 11 đoạn / 2 file | Chưa có kết luận. Template đầy đủ là baseline mô tả bắt buộc ở P4 |
| 2 | “Fine-tuning chỉ mua văn phong” | Đối chứng so Qwen2-1.5B-FT với Qwen2.5-**3B**: khác phiên bản, kích thước, lượng tử hoá | `C2`: 3 đoạn / 2 file | H3 nếu chạy được; nếu không thì `CHƯA ĐO` |
| 3 | “Đã xác định Ollama cắt mất khối `### Instruction`” | Chính I11 thừa nhận chưa xác định đoạn mất | `C3`: 4 đoạn / 1 file | “Đặt `num_ctx=8192` cải thiện kết quả trên tập phát triển”; cơ chế chưa chứng minh |
| 4 | “Mọi gate đều lọt 34/64” | B0 lọt **0/64** (`audit_evidence.gate_k0`, cả 3 seed) | `C4`: 2 đoạn / 1 file | “B1–B3 lọt 34/64; B0 là reject-all suy biến, false-block 40/40” |
| 5 | “Freshness thô bị áp đảo” | Là **đánh đổi**: coarse an toàn hơn nhưng chặn nhầm 0,625–1,000 | `C5`: 7 đoạn / 4 file | Báo cả hai chỉ số, không dùng từ dominance |
| 6 | “B3 luôn bị hấp thụ vào B2f” | Phản ví dụ no-op repair: B2f xuất (0 dòng quét), B3 chặn (1), B2′ chặn (10), oracle nói không xuất | `C6`: 9 đoạn / 4 file | “Tương đương chỉ quan sát được trên corpus hiện tại” |
| 7 | “Mô phỏng p ≳ 10 chứng minh Mệnh đề 3” | Mô phỏng chỉ bác bỏ được, không chứng minh; KDD HTTP có 3 cột nằm trong vùng sai | `C7`: 5 đoạn / 3 file | Sửa mệnh đề theo giả thiết (D3) |
| 8 | “MAE 493× chứng minh detector kém 493 lần” | Số đo trên decoder count-sketch áp lên pooled embedding; XGBoost hạ nguồn không dùng decoder đó | `C8`: 5 đoạn / 2 file | “Không thể viện cùng bảo đảm estimator cho `_aggregate`” (D4) |
| 9 | Mọi phát biểu “đầu tiên / chưa từng có / không tồn tại / vẫn trống” | Tìm kiếm có mục tiêu không chứng minh được sự vắng mặt | `C9`: 23 đoạn / 10 file — **cần rà từng ca**, nhiều khớp là vô hại | Phát biểu theo prior work cụ thể đã đọc |
| 10 | “Mọi ensemble kém XGBoost có ý nghĩa thống kê” | `chuong4.tex:132–137` ghi CI của ΔF1 **chứa 0** | `C10`: 4 vị trí thật / 3 file luận văn (xem §4) | Phát biểu theo metric + run + CI |
| 11 | “Benchmark CASH dùng nhãn thật, không chịu phê phán đánh giá vòng tròn” | 3/8 tập dùng nhãn sinh từ phân vị giá; 2 tập còn giữ cột sinh nhãn trong X | `C11`: 4 vị trí thật / 4 file (xem §4) | Đã sửa 24/09 — xem D1b ở §4 |

## 2. F1–F7 — lỗi luận văn

| # | Claim/lỗi | Trạng thái | Phạm vi được phép dùng | Artifact | Task còn lại |
|---|---|---|---|---|---|
| F1 | Nhãn benchmark là hàm của đặc trưng quan sát | `GIỮ` | Đúng cho House Prices, SG Condo, SG HDB. Không suy ra mọi benchmark vô giá trị | `p0/label_provenance_manifest.json` | D1b **đã sửa bản thảo**; D5 rerun bảng giữ lại |
| F1a | Credit Card fallback synthetic giữ nguyên tên | `GIỮ` | Bẫy còn trong loader. Artifact cũ ghi `n_samples=284807` nên bảng CASH không nhiễm | `ablation_k256.py:256–267` | **D1** — chưa làm |
| F2 | Chọn ngưỡng trên test | `GIỮ` | Cả 5 runner của `v11_benchmark_public_run.py`. Độ lạc quan +0,1844 (test 219 dòng) → +0,0004 (test >5.000) | `assessment.md` R2 | **D2** — chưa làm |
| F2a | Test trong `eval_set` | `RÚT` | Không có `early_stopping_rounds`; không có đường tác động đã chứng minh | — | Vẫn nên đổi eval_set sang val, nhưng không claim leakage |
| F3 | Mệnh đề CASH bỏ sót nhiễu nền | `GIỮ` | Phản ví dụ p=1 đứng vững | `cash_theory.tex:107,114–133` | **D3** — chưa làm |
| F4 | `_aggregate` khác đại lượng được lập luận | `THU HẸP` | Mismatch code↔lý thuyết là thật. Tỷ lệ MAE **không** đo được mất mát F1 | `cash_features.py:116–122,155–161` | **D4** — chưa làm |
| F5 | Evidence Packet chưa có phép đo trực tiếp | `CHƯA ĐO` | Kết quả n=70 là **thăm dò trên tập phát triển**, chấm bằng template lỗi | `FINDINGS_F5.md` (lịch sử) | P1 → P4 |
| F6 | Claim ensemble mâu thuẫn | `GIỮ` | 4 vị trí trong 3 file luận văn, **không phải 9 tệp** | `p0/occurrence_manifest.json` C10 | **D6** — chưa làm |
| F7 | Readiness có code, chưa kiểm chứng | `THU HẸP` | Gate là **pilot bổ trợ**, không phải đóng góp chính | `bench/publication_gate/` | Gói **G** |

## 3. I1–I13 — bản đồ tính mới / đính chính lượt 21–23/09

| # | Nội dung | Trạng thái | Ghi chú |
|---|---|---|---|
| I1 | “LLM thắng template” sai vì lỗi baseline | `GIỮ` (là đính chính) | Claim gốc → §1 mục 1 |
| I2 | Đối chứng fine-tuning không hợp lệ | `GIỮ` | → §1 mục 2 |
| I3 | Quy kết L4 cho “packet dài” chưa đủ bằng chứng | `GIỮ` | Phải tách hai trường hợp |
| I4 | Gọi B2 “bị áp đảo” là sai — là đánh đổi | `GIỮ` | → §1 mục 5 |
| I5 | “53% lỗi nền” trình bày sai | `GIỮ` | 44 lượt = 34 ca (10 chồng lấp); tỷ lệ do corpus tự đặt |
| I6 | Bốn tài liệu không thống nhất | `GIỮ` | Đóng bằng chính ledger này |
| I7 | Trạng thái đóng góp sau đính chính | `LỊCH SỬ` | Thay bằng §2 của ledger |
| I8 | Phát biểu lại câu hỏi nghiên cứu | `GIỮ` | Đã chuyển vào `PLAN_FINAL.md` §1 |
| I9 | Giới hạn diễn giải 4 chỉ số | `GIỮ` | NumFid/IssueFid/Cov@k/hallu đều là **proxy** |
| I10 | Giao thức chốt trước | `LỊCH SỬ` | Thay bằng `PREREGISTRATION.md` + amendment A2 (P2.2) |
| I11 | “Đã tìm ra nguyên nhân L4” | `THU HẸP` | Hiệu ứng `num_ctx` giữ; cơ chế mất Instruction **rút** |
| I12 | Bài học phương pháp | `GIỮ` | Chịu cùng giới hạn của I11 |
| I13 | Bốn điều khoá thêm trước holdout | `LỊCH SỬ` | Thay bằng checklist P3 của `PLAN_FINAL.md` |

## 4. R01–R19 — phát hiện của rà soát 23/09 → gói công việc

| # | Phát hiện | Gói | Trạng thái 24/09 |
|---|---|---|---|
| R01 | Bản sửa template không nằm trong đường chạy | P1.1 | `CHẶN` — chưa làm |
| R02 | Chưa có runner xác nhận khoá theo manifest | P1.3 | `CHẶN` — chưa làm |
| R03 | H2 “không kém” mâu thuẫn phép kiểm | P2.2 | `CHẶN` — amendment A2 chưa lập |
| R04 | Không trùng nội dung ≠ độc lập theo nguồn | P2.3 | `CHẶN` — ghi vào PREREG nhật ký A4 |
| R05 | Scorer zip hai danh sách lọc riêng | P1.2 | `CHẶN` — chưa làm |
| R06 | Chẩn đoán context viết như đã biết cơ chế | P0 + P2.1 | **ĐÃ ĐÁNH DẤU** ở novelty_map I11 |
| R07 | Bootstrap đếm lỗi sai đơn vị (rater×ca) | U1 | `CHẶN` claim expert |
| R08 | Gói người chấm thiếu trường báo cáo dùng | U1 | `CHẶN` claim expert |
| R09 | User task chưa khả thi như mô tả | U2 | `CHƯA ĐO` |
| R10 | Provenance / preprocessing / threshold | D1, **D1b**, D2 | D1b **ĐÃ SỬA**; D1, D2 chưa |
| R11 | Lý thuyết sửa theo giả thiết, không theo ngưỡng p | D3 | Chưa làm |
| R12 | Không dùng MAE decoder để kết luận detector | D4 + §1 mục 8 | **ĐÃ ĐÁNH DẤU** ở assessment R4 |
| R13 | Claim ensemble mâu thuẫn; review đếm sai file | D6 + P0 | Đếm **đã thay bằng manifest** |
| R14 | Phản ví dụ bác bỏ “B3 bị hấp thụ” | G | **ĐÃ ĐÁNH DẤU** ở gate FINDINGS |
| R15 | Xóa dòng gây `IndexError` | G | `CHẶN` — chưa sửa code |
| R16 | “Constraint change” thực ra là contract-knowledge update | G | Chưa đổi tên |
| R17 | B0 / oracle / mẫu số / chi phí báo sai | G | **ĐÃ ĐÁNH DẤU** ở TONG_HOP |
| R18 | Các đính chính chưa đồng bộ | P0 | **ĐÃ XỬ LÝ** — 7 tài liệu gắn trạng thái lịch sử |
| R19 | Nguồn hỗ trợ novelty chưa đủ | W | `CHƯA ĐO` |

### Hai vị trí claim mà review chưa liệt kê đủ

Manifest tìm thêm, không có trong danh sách viết tay của REVIEW_FINAL:

1. **D1b rộng hơn 2 file.** `PLAN_FINAL.md` D1b nêu hai `cash_results.tex`. Manifest `C11` cho thấy
   `cash_theory.tex:163–169` mang **cùng** claim (“benchmark công khai có nhãn thật … bằng chứng
   không phụ thuộc nhãn giả sinh từ luật nghiệp vụ”) ở **cả hai** tài liệu. Tổng **4 vị trí**, đã sửa
   hết ngày 24/09; cả hai tài liệu build lại bằng `tectonic` không phát sinh undefined reference.
2. **C10 có vị trí thứ 5 trong đề cương.** `de_cuong_IUH/chapters/chuong4.tex:81–86` nói kết quả kiểm
   định “sẽ được báo cáo sau đợt thực nghiệm cuối”. Đây **không** phải claim sai, nhưng mâu thuẫn với
   việc luận văn đã khẳng định có ý nghĩa. D6 phải đồng bộ cả hai tài liệu, không chỉ 4 vị trí thesis.

## 5. Việc P0 đã làm và chưa làm

**Đã làm 24/09/2026**

- `p0/build_occurrence_manifest.py` + `occurrence_manifest.json`: 11 nhóm claim, khớp theo **đoạn**
  (LaTeX xuống dòng giữa câu nên khớp theo dòng bỏ sót `mo_dau.tex:59–61`).
- `p0/label_provenance_manifest.json`: nguồn nhãn 8 dataset, tách `label_class` (nhãn định nghĩa thế
  nào) khỏi `label_column_in_X` (có rò rỉ đặc trưng không) — hai trục độc lập.
- D1b: sửa 4 vị trí tex ở thesis + đề cương; build lại cả hai bằng `tectonic`, PDF ra bình thường.
- PREREG: trả 3 checkbox `[x]` sai về `[ ]`, thêm §9 nhật ký amendment (A1 đã thực hiện; A2–A4 chờ).
- 7 tài liệu lịch sử gắn banner + mốc inline tại đúng claim: TONG_HOP, assessment, novelty_map,
  FINDINGS_F5, JUDGE_FINDINGS, gate README, gate FINDINGS.

**Chưa làm (không được coi là đạt)**

- Rà từng ca của `C9` (23 đoạn firstness) — phần lớn có thể vô hại, cần đọc tay.
- D1, D2, D3, D4, D5, D6; toàn bộ gói G, U, W.
- P1.1 / P1.2 / P1.3 và mọi mục P2/P3.
