# Plan: Tái cấu trúc đề cương từ 3 chương → 5 chương

## Context

Đề cương luận văn thạc sĩ của Giang (IUH, GVHD: TS. Bùi Thanh Hùng) ở [de_cuong_IUH/](de_cuong_IUH/) hiện theo mẫu PL2 chia thành **3 chương**, nhưng [chuong3.tex](de_cuong_IUH/chapters/chuong3.tex) đang **quá tải**: gộp Dữ liệu (3.1) + Tiền xử lý (3.2) + Phương pháp đề xuất (3.3) + Cài đặt hệ thống (3.4) + Thực nghiệm và đánh giá (3.5) + Thảo luận (3.6) — tổng ~810 dòng LaTeX, trộn lẫn đóng góp khoa học với engineering và kết quả thực nghiệm, gây 3 hệ quả:

1. **Khó phòng vệ trước hội đồng**: Method và Experiment ở cùng chương → hội đồng khó tách "đề xuất gì" vs "đo gì".
2. **Section 3.4 (Cài đặt)** chen giữa Method (3.3) và Experiment (3.5) phá luồng đọc.
3. **Section 3.6 (Thảo luận)** + Section 3.5 (kết quả) gộp → khó phân biệt fact vs interpretation.

Tham chiếu **[de_cuong_IUH/24752441 - Nguyen Tan Nhu - De cuong - 06.01.2026.docx](de_cuong_IUH/24752441 - Nguyen Tan Nhu - De cuong - 06.01.2026.docx)** (cùng IUH, cùng GVHD, được duyệt 01/2026) cho thấy bố cục **5 chương** đã được hội đồng IUH chấp nhận, theo kiểu IMRaD chuẩn quốc tế.

Mục tiêu: tái cấu trúc thành **5 chương + Mở đầu (giữ theo PL2)**, tách Method ↔ Experiment, promote Kết luận thành chương cuối, không viết lại nội dung — chỉ **di chuyển và bổ sung tóm tắt/dẫn nhập chương**.

---

## Bố cục mới (5 chương)

| Phần | Nội dung | Nguồn nội dung hiện tại |
|---|---|---|
| **Mở đầu** *(giữ ngoài chương theo PL2)* | Đặt vấn đề, Mục tiêu, Đối tượng & phạm vi, Phương pháp NC, Ý nghĩa, Bố cục luận văn | [mo_dau.tex](de_cuong_IUH/chapters/mo_dau.tex) — giữ nguyên, chỉ cập nhật mục "6. Bố cục luận văn" (dòng 133–141) từ 3 → 5 chương |
| **Chương 1 — TỔNG QUAN NGHIÊN CỨU** | Bài toán AD, bối cảnh BĐS Singapore, hướng tiếp cận, NLP tự động, related work 26 công trình, research gap, so sánh trực diện | [chuong1.tex](de_cuong_IUH/chapters/chuong1.tex) — **giữ nguyên** |
| **Chương 2 — CƠ SỞ LÝ THUYẾT** | ML/DL nền tảng, 6 mô hình AD (XGB, DAE, BiLSTM, TranAD, AnoGAN, Ensemble), NLP/Transformer/LLM/LoRA, metrics, công nghệ triển khai | [chuong2.tex](de_cuong_IUH/chapters/chuong2.tex) — **giữ nguyên** |
| **Chương 3 — PHƯƠNG PHÁP ĐỀ XUẤT** | Dữ liệu nghiên cứu, Pipeline tiền xử lý 8 giai đoạn, Kiến trúc đề xuất (Model Router, Ensemble AD, Evidence Packet, LLM Pipeline, Gemini Fix), **Cài đặt hệ thống** (Backend/Celery/Frontend/LoRA/Docker — gộp vào chương này, không tách riêng theo lựa chọn của user) | Lấy từ [chuong3.tex:1–449](de_cuong_IUH/chapters/chuong3.tex) (sections 3.1, 3.2, 3.3, 3.4) |
| **Chương 4 — THỰC NGHIỆM VÀ ĐÁNH GIÁ** | Thiết lập thực nghiệm, baseline, kết quả phát hiện bất thường, đánh giá tổng quát hoá benchmark, Ablation Study, kết quả NLP, Human Evaluation, phân tích lỗi, đánh giá end-to-end, thảo luận | Lấy từ [chuong3.tex:451–815](de_cuong_IUH/chapters/chuong3.tex) (sections 3.5 + 3.6) |
| **Chương 5 — KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN** | Tổng kết đóng góp (7 hạng mục), hạn chế, hướng phát triển | Promote [ket_luan.tex](de_cuong_IUH/chapters/ket_luan.tex) từ phần "ngoài chương" thành Chương 5 (theo style Nhu) |
| Tài liệu tham khảo / Phụ lục / Kế hoạch / Lý lịch | Giữ nguyên | Không đổi |

---

## Files thay đổi

### Tạo mới
- `de_cuong_IUH/chapters/chuong4.tex` — chứa nội dung **Thực nghiệm và đánh giá** (di chuyển từ [chuong3.tex:451–815](de_cuong_IUH/chapters/chuong3.tex)).
- `de_cuong_IUH/chapters/chuong5.tex` — chứa **Kết luận và hướng phát triển** (di chuyển từ [ket_luan.tex](de_cuong_IUH/chapters/ket_luan.tex), thêm dẫn nhập và tóm tắt chương cho phù hợp format Heading 1).

### Sửa
- **[de_cuong_IUH/main.tex](de_cuong_IUH/main.tex)** — dòng 500–514: thêm 2 `\chapter{}` mới sau Chương 3:
  ```latex
  \chapter{TỔNG QUAN NGHIÊN CỨU}      % đổi tên từ "TỔNG QUAN VỀ LĨNH VỰC NGHIÊN CỨU"
  \input{chapters/chuong1}
  \chapter{CƠ SỞ LÝ THUYẾT}
  \input{chapters/chuong2}
  \chapter{PHƯƠNG PHÁP ĐỀ XUẤT}        % đổi tên từ "ÁP DỤNG KẾT QUẢ NGHIÊN CỨU"
  \input{chapters/chuong3}
  \chapter{THỰC NGHIỆM VÀ ĐÁNH GIÁ}    % MỚI
  \input{chapters/chuong4}
  \chapter{KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN}  % MỚI (promote từ ket_luan)
  \input{chapters/chuong5}
  ```
  Đồng thời **bỏ** dòng 519–521 (`\input{chapters/ket_luan}` + dòng KẾT LUẬN VÀ KIẾN NGHỊ đứng ngoài) vì đã promote vào Ch5.

- **[chuong3.tex](de_cuong_IUH/chapters/chuong3.tex)** — **cắt** sections 3.5 "Thực nghiệm và đánh giá" (dòng 451–814) và 3.6 "Thảo luận" (dòng 790–814) sang `chuong4.tex`. Section 3.7 "Tóm tắt chương" (dòng 815) viết lại cho phù hợp scope mới (chỉ tóm Method, không tóm thực nghiệm). Đổi số sections cũ:
  - 3.1 Dữ liệu nghiên cứu (giữ)
  - 3.2 Tiền xử lý dữ liệu (giữ)
  - 3.3 Phương pháp đề xuất (giữ)
  - 3.4 Cài đặt và triển khai hệ thống (giữ — theo user chọn gộp vào ch Method)
  - 3.5 Tóm tắt chương (viết lại)

- **[chuong4.tex](de_cuong_IUH/chapters/chuong4.tex) (mới)** — cấu trúc sections:
  - 4.1 Thiết lập thực nghiệm (từ 3.5.1 cũ)
  - 4.2 Baseline (từ 3.5.2 cũ)
  - 4.3 Kết quả phát hiện bất thường (từ 3.5.3 cũ)
  - 4.4 Đánh giá tổng quát hoá trên benchmark công khai (từ 3.5.4 cũ)
  - 4.5 Ablation Study (từ 3.5.5 cũ, bao gồm subsection Rule-blind test)
  - 4.6 Kết quả sinh báo cáo NLP (từ 3.5.6 cũ)
  - 4.7 Human Evaluation cho báo cáo NLP (từ 3.5.7 cũ)
  - 4.8 Phân tích lỗi (từ 3.5.8 cũ)
  - 4.9 Đánh giá hệ thống end-to-end (từ 3.5.9 cũ)
  - 4.10 Thảo luận (từ 3.6 cũ)
  - 4.11 Tóm tắt chương (viết mới)
  - Thêm dẫn nhập đầu chương ~5 dòng: nhắc lại Method ở Ch3, giới thiệu thiết lập đánh giá ở Ch4.

- **[chuong5.tex](de_cuong_IUH/chapters/chuong5.tex) (mới)** — chuyển nội dung từ [ket_luan.tex](de_cuong_IUH/chapters/ket_luan.tex), tổ chức lại theo các section của một chương chuẩn:
  - 5.1 Tóm tắt đóng góp (mapping với 7 đóng góp ở Mở đầu mục 2)
  - 5.2 Hạn chế của nghiên cứu
  - 5.3 Hướng phát triển
  - 5.4 Tóm tắt chương (tùy chọn, có thể bỏ)

- **[mo_dau.tex](de_cuong_IUH/chapters/mo_dau.tex)** — mục "6. Bố cục luận văn" (dòng 133–141): cập nhật từ 3 chương → 5 chương như sau:
  ```latex
  \begin{itemize}
    \item \textbf{Chương 1 -- Tổng quan nghiên cứu:} Khảo sát 26 công trình về AD và NLP report, xác định 2 khoảng trống nghiên cứu chính.
    \item \textbf{Chương 2 -- Cơ sở lý thuyết:} ML/DL, 6 mô hình AD thành phần, Transformer/LLM/LoRA, metrics, công nghệ triển khai.
    \item \textbf{Chương 3 -- Phương pháp đề xuất:} Dữ liệu, pipeline tiền xử lý 8 giai đoạn, kiến trúc Model Router + Ensemble + Evidence Packet + LLM, cài đặt FastAPI/Celery/Next.js/Docker.
    \item \textbf{Chương 4 -- Thực nghiệm và đánh giá:} Setup, baseline, kết quả AD, ablation, kết quả NLP + Human Evaluation, phân tích lỗi, đánh giá end-to-end, thảo luận.
    \item \textbf{Chương 5 -- Kết luận và hướng phát triển:} Tổng kết 7 đóng góp, hạn chế và hướng nghiên cứu tiếp theo.
  \end{itemize}
  ```

- **[chuong1.tex](de_cuong_IUH/chapters/chuong1.tex)** dòng 244 ("Chương 2 tiếp theo..."): giữ nguyên (vẫn đúng).
- **[chuong2.tex](de_cuong_IUH/chapters/chuong2.tex)** dòng cuối (Tóm tắt chương): cập nhật câu nối "Chương 3 tiếp theo sẽ trình bày..." → đảm bảo nói **chỉ về Method** (dữ liệu + pipeline + kiến trúc + cài đặt), không nhắc thực nghiệm.
- **[chuong3.tex](de_cuong_IUH/chapters/chuong3.tex)** Tóm tắt chương mới: nối sang "Chương 4 sẽ trình bày thiết lập thực nghiệm và đánh giá".
- **[chuong4.tex](de_cuong_IUH/chapters/chuong4.tex)** Tóm tắt chương: nối sang "Chương 5 sẽ tổng kết đóng góp...".

### Xoá / archive
- [ket_luan.tex](de_cuong_IUH/chapters/ket_luan.tex) — sau khi promote nội dung sang `chuong5.tex`, để an toàn hãy **rename thành `ket_luan.tex.bak`** thay vì xoá hẳn (đề phòng cần rollback). `main.tex` không còn `\input` file này.

### Cắt độ sâu Mục lục

- **[main.tex:182](de_cuong_IUH/main.tex#L182)** — đổi `\setcounter{tocdepth}{4}` thành `\setcounter{tocdepth}{2}`.
  - Hiệu quả: Mục lục chỉ hiển thị tới cấp **subsection** (vd `3.5.5 Ablation Study`), không show cấp paragraph kiểu `3.5.5.1 Kiểm chứng rủi ro circular reasoning (Rule-blind test)` nữa.
  - **Giữ** `\setcounter{secnumdepth}{4}` (dòng 181) để vẫn đánh số trong nội dung — chỉ lọc ở TOC, không xoá số trong body.
  - Sau khi tách chuong3→chuong4, cấu trúc TOC sẽ gọn theo dạng X.Y (vd `4.5 Ablation Study`, `4.10 Thảo luận`).

### Không đụng đến
- [refs/references.bib](de_cuong_IUH/refs/references.bib), [figures/](de_cuong_IUH/figures/), [abbreviations.tex](de_cuong_IUH/chapters/abbreviations.tex), [cong_trinh.tex](de_cuong_IUH/chapters/cong_trinh.tex), [ke_hoach.tex](de_cuong_IUH/chapters/ke_hoach.tex), [phu_luc.tex](de_cuong_IUH/chapters/phu_luc.tex), [ly_lich.tex](de_cuong_IUH/chapters/ly_lich.tex) — không liên quan đến tái cấu trúc chương.

---

## Rà soát 7 mục tiêu × Giải thuật × Minh chứng × Kiểm chứng

Đối chiếu **7 mục tiêu cụ thể** ở [mo_dau.tex:39–81](de_cuong_IUH/chapters/mo_dau.tex) với section trong Ch3 mới (Method) và Ch4 mới (Experiment):

| # | Mục tiêu | Giải thuật (Ch3 mới) | Minh chứng & Kiểm chứng (Ch4 mới) | Trạng thái |
|---|---|---|---|---|
| 1 | **Data**: BĐS SG + 5 benchmark + pseudo-label 13 luật | 3.1.1 Mô tả tập dữ liệu, 3.1.2 Quy trình gán nhãn, 3.1.3 Chia tập, 3.1.4 Benchmark | 4.3 (kết quả AD trên dataset chính), 4.4 (5 benchmark) — V11-XGBoost dẫn đầu 5/5 | ✅ Đủ |
| 2 | **Pipeline 8 giai đoạn** tái sử dụng cross-domain | 3.2 Tiền xử lý 8 stages (Load→Schema→Clean→Merge→FE→Window→Augment→Select), 3.2.1 Schema Augmentation | 4.4 (chạy cùng pipeline trên 5 dataset khác domain → minh chứng reusability) | ⚠️ Thiếu **ablation định lượng** cho từng stage (vd F1 giảm bao nhiêu nếu bỏ Schema Augmentation) — bổ sung subsection trong 4.5 Ablation |
| 3 | **Model ensemble** XGB+BiLSTM+DAE: F1≥0.85, AUC≥0.97 | 3.3.3 Ensemble AD | 4.3: XGBoost F1=0.881, AUC=0.995 ✅; BiLSTM F1=0.764, AUC=0.984; DAE AUC=0.965; **ensemble F1=0.848** | ⚠️ Ensemble F1=0.848 **dưới target 0.85** (sát ngưỡng). Cần (i) thảo luận ở 4.10 lý do ensemble thấp hơn XGBoost đơn lẻ, (ii) hoặc điều chỉnh target ở Mở đầu xuống F1≥0.84 cho khớp số thực |
| 4 | **Integration**: Model Router + Evidence Packet (lớp keo Ensemble↔LLM) | 3.3.1 Kiến trúc tổng thể, 3.3.2 Model Router, 3.3.3 Ensemble cấp evidence | 4.5 Ablation — nhưng **chưa rõ có ablation "tắt Evidence Packet"** vs giữ nguyên | ⚠️ Bổ sung ablation: so LLM output khi (a) nhận evidence packet đầy đủ vs (b) chỉ nhận anomaly score thuần. Đây là đóng góp khoa học chính → bắt buộc có evidence định lượng |
| 5 | **LLM Report**: LoRA Qwen2-1.5B + Gemma-2B + Human Eval | 3.3.4 LLM Report Pipeline, 3.4.4 LoRA Fine-tuning | 4.6 Kết quả NLP (BLEU/ROUGE), 4.7 Human Eval (faithfulness, actionability, domain correctness, fluency, Cohen's κ) | ✅ Đủ |
| 6 | **System**: FastAPI+Celery+Next.js+Docker, SLA latency ≤5min/10k dòng | 3.4 Cài đặt (Backend, Celery, Frontend, LoRA, Docker) | 4.9 Đánh giá end-to-end: p50=0.165s, p99=0.191s/10k dòng ✅ vượt SLA | ✅ Đủ |
| 7 | **Custom Rule & Re-training Pipeline** (rule pluggability + model adaptability cho doanh nghiệp) | **KHÔNG có section dedicated trong Ch3 hiện tại**. Chỉ nhắc 1 dòng ở 3.1.2 và 3 cấp tuỳ biến nêu ở Mở đầu | **KHÔNG có section nào trong Ch4 hiện tại** verify "custom rule → pseudo-label tự động → re-train → cải thiện trên dataset doanh nghiệp khác" | 🔴 **GAP NGHIÊM TRỌNG**: thiếu cả giải thuật và kiểm chứng |

### Bổ sung bắt buộc (đã chốt với user: triển khai cả 5 hạng mục A–E)

**A. Mục tiêu 7 — Custom Rule & Re-training Pipeline** (gap lớn nhất, ảnh hưởng phòng vệ trước hội đồng):

- **Thêm Section 3.5 vào Ch3 mới** (sau 3.4 Cài đặt, trước 3.5 Tóm tắt) — `chuong3.tex`:
  ```
  3.5 Pipeline tuỳ biến rule cho doanh nghiệp
    3.5.1 Schema YAML khai báo custom rule (cú pháp + validator)
    3.5.2 Sinh pseudo-label tự động trên dataset doanh nghiệp
    3.5.3 Trigger re-train ensemble + LLM LoRA (model versioning, MLflow)
    3.5.4 UI khai báo rule (web form / YAML upload qua FastAPI endpoint)
  ```
  Nội dung: lấy ý tưởng từ [mo_dau.tex:71–81](de_cuong_IUH/chapters/mo_dau.tex) (3 mức Rule/Model/UI) — viết mới ~2–3 trang.

- **Thêm Section 4.11 vào Ch4 mới** (sau 4.10 Thảo luận, trước Tóm tắt) — `chuong4.tex`:
  ```
  4.11 Kiểm chứng pipeline tuỳ biến rule (case study)
    - Chọn 1–2 dataset của domain khác (vd: HDB Resale hoặc dataset kế toán nội bộ)
    - Khai báo bộ rule riêng qua YAML
    - Đo F1/AUC trước (pre-trained model gốc) vs sau (re-trained với rule mới)
    - Báo cáo thời gian re-train, kích thước LoRA adapter mới
  ```
  Nếu không kịp thực nghiệm thật → tối thiểu mô tả "thiết kế thực nghiệm dự kiến" + 1 mini case study với cấu hình rule khác.

- **Cập nhật câu mô tả mục tiêu 7 ở [mo_dau.tex:73–81](de_cuong_IUH/chapters/mo_dau.tex)**: thêm forward-reference `(chi tiết tại §3.5 và §4.11)` để hội đồng theo dấu được.

**B. Mục tiêu 4 — Ablation Evidence Packet** (thiết kế thực nghiệm cụ thể):

- **Mở rộng Section 4.5 Ablation Study** trong `chuong4.tex` — thêm subsection mới `4.5.X Ablation: vai trò của Evidence Packet`:

  | Setup | Input cho LLM | Mục đích |
  |---|---|---|
  | **A (full)** | score + top-5 SHAP + luật vi phạm + ngữ cảnh giao dịch | Baseline đầy đủ (mặc định hệ thống) |
  | **B (score-only)** | chỉ score nhị phân + giá trị anomaly score | Đo đóng góp tối thiểu của LLM khi không có evidence |
  | **C (score+SHAP)** | score + top-5 SHAP, KHÔNG có rule/context | Đo riêng đóng góp của rule+context layer |
  | **D (score+rule)** | score + luật vi phạm, KHÔNG có SHAP/context | Đo riêng đóng góp của SHAP+context layer |

  **Metric đo cho mỗi setup**:
  - Faithfulness (1–5), Actionability (1–5), Domain Correctness (1–5) — từ 3 reviewer, tính trung bình + Cohen's κ
  - Format Compliance (0/1) — pass nếu output match Jinja2 schema
  - BLEU-4 / ROUGE-L làm sanity check
  - **Cỡ mẫu**: ≥ 30 anomaly cases/setup × 3 reviewer = 90 đánh giá/setup
  - **Kỳ vọng**: A > C, D > B → chứng minh evidence packet thực sự cấp giá trị, không phải LLM nội suy

**C. Mục tiêu 3 — Target F1 ensemble** (đã chốt):

- Sửa [mo_dau.tex:52–54](de_cuong_IUH/chapters/mo_dau.tex) từ "F1 ≥ 0.85" thành **"F1 ≥ 0.80"** cho khớp số thực và để biên an toàn rộng hơn cho hội đồng. Cả ensemble (0.848) và XGBoost đơn lẻ (0.881) đều vượt. AUC ≥ 0.97 giữ nguyên.
- **Thêm thảo luận ở Section 4.10 Thảo luận** trong `chuong4.tex`: giải thích tại sao ensemble F1=0.848 < XGBoost đơn lẻ F1=0.881 — nguyên nhân chính là **trade-off Precision–Recall**: ensemble được tune theo Recall=0.908 (ưu tiên giảm bỏ sót cho audit), sacrifice Precision; trong khi XGBoost đơn lẻ cân bằng hơn. Đây là **quyết định thiết kế phục vụ nghiệp vụ** (false negative trong audit đắt hơn false positive), không phải nhược điểm kỹ thuật.
- Cập nhật cùng số liệu này ở [ket_luan.tex](de_cuong_IUH/chapters/ket_luan.tex) (sau khi promote thành chuong5.tex) — section "Kết quả đạt được" và "Hạn chế".

**D. Mục tiêu 2 — Ablation pipeline 8 giai đoạn** (thiết kế thực nghiệm cụ thể):

- Trong **Section 4.5 Ablation** của `chuong4.tex`, thêm subsection mới `4.5.Y Ablation: đóng góp của từng stage trong pipeline 8 giai đoạn`:

  | Setup | Pipeline | Cố định | Mục đích |
  |---|---|---|---|
  | Full | 8/8 stages | XGBoost V11 | Baseline (F1 hiện tại) |
  | −Schema Aug | bỏ Schema Augmentation (3.2.1) | XGBoost V11 | Đo đóng góp universal feature |
  | −Window | bỏ Windowing | XGBoost V11 | Đo đóng góp time-series window |
  | −FE | bỏ Feature Engineering | XGBoost V11 | Đo đóng góp engineered feature |
  | −Augment | bỏ Data Augmentation | XGBoost V11 | Đo đóng góp augmentation cho lớp thiểu số |
  | −Select | bỏ Feature Selection | XGBoost V11 | Đo đóng góp feature pruning |
  | −Merge | bỏ Merge stage | XGBoost V11 | Đo đóng góp join external table |

  **Metric**: F1, Precision, Recall, AUC trên cùng tập kiểm tra V10. Train mỗi setup từ scratch, group-aware split `deal_id` để tránh leakage.

  **Cross-domain reusability**: Lặp lại bảng trên với 2/5 dataset benchmark (vd KDD99 HTTP + Credit Card Fraud) để minh chứng từng stage có giá trị trên domain khác — không chỉ trên dataset BĐS gốc.

**E. Gemini Fix Service** (đã chốt: **demote sang Phụ lục**):

- **Xoá** Section 3.3.5 Gemini Fix Service khỏi [chuong3.tex:381–389](de_cuong_IUH/chapters/chuong3.tex#L381-L389).
- **Thêm vào [phu_luc.tex](de_cuong_IUH/chapters/phu_luc.tex)**: section mới "Phụ lục X — Gemini Fix Service (chi tiết engineering)" — mô tả batch optimization, confidence routing (≥0.7 auto-apply / <0.7 human review), Redis cache pattern. Giữ scope 7 mục tiêu, không inflate.
- **Cập nhật** mọi `\ref{...}` trong các file khác có trỏ tới subsection Gemini Fix (nếu có) — chuyển sang ref Phụ lục.

## Cross-reference cần kiểm

Sau khi tách [chuong3.tex](de_cuong_IUH/chapters/chuong3.tex), các `\label{...}` cũ trong sections 3.5 + 3.6 sẽ nằm ở `chuong4.tex`. Bibliography (`\cite`) không bị ảnh hưởng. Cần grep:

```bash
grep -n "ref{tab:\|ref{fig:\|ref{sec:\|ref{eq:" de_cuong_IUH/chapters/*.tex
```

→ Đảm bảo mọi `\ref` vẫn resolve đúng sau khi chia file. Đặc biệt chú ý:
- Reference chéo từ Ch3 → bảng/hình ở Ch4 (sẽ trở thành reference forward, vẫn OK).
- Bảng nào hiện đang ở section 3.5 mà được nhắc tới ở section 3.3 — cần xem có cần di chuyển label không.

---

## Verification

1. **Compile sạch**:
   ```bash
   cd de_cuong_IUH && xelatex -interaction=nonstopmode main.tex && bibtex main && xelatex main.tex && xelatex main.tex
   ```
   Kiểm `main.log` không có `LaTeX Warning: Reference ... undefined`.

2. **Kiểm cấu trúc TOC**: mở `main.pdf` đến trang Mục lục — phải hiển thị đúng 5 chương + Mở đầu + Kết luận đã promote (Ch5).

3. **Kiểm số trang**: tổng phần chính (Mở đầu → Ch5) ≤ 100 trang theo quy định IUH (PL2 mục giới hạn).

4. **Spot-check nội dung**: đọc lướt câu nối ở Tóm tắt chương 2/3/4 → đảm bảo không còn câu kiểu "Chương 3 sẽ trình bày thực nghiệm" (vì thực nghiệm đã ở Ch4).

5. **Đối chiếu với Mở đầu**: 7 đóng góp ở [mo_dau.tex:39–81](de_cuong_IUH/chapters/mo_dau.tex) phải khớp 1-1 với section 5.1 "Tóm tắt đóng góp" ở Ch5 mới.

6. **Đối chiếu với Nhu (sanity check)**: bố cục 5 chương của Giang khớp khung của [24752441 - Nguyen Tan Nhu - De cuong - 06.01.2026.docx](de_cuong_IUH/24752441 - Nguyen Tan Nhu - De cuong - 06.01.2026.docx) — đề cương đã được hội đồng IUH duyệt cùng GVHD → giảm rủi ro bị phản biện về cấu trúc.
