# Plan chỉnh sửa: Loại bỏ dấu hiệu GPT-generated khỏi đề cương

## Bối cảnh

Đề cương luận văn thạc sĩ hiện tại có **5 pattern GPT-generated rõ ràng** mà hội đồng có thể nhận ra. Plan này liệt kê từng vị trí cụ thể cần sửa, cách sửa, và thứ tự ưu tiên.

---

## Bảng tổng hợp mức độ nghiêm trọng

| File | Pre-emptive Defense | Hedging | Over-enum | Uniform Style | Over-defensive |
|------|:---:|:---:|:---:|:---:|:---:|
| [mo_dau.tex](file:///Volumes/Zang_Vox/MAC_Zang_2026/GIANG/giang_workspace/de_cuong_IUH/chapters/mo_dau.tex) | 🔴 | 🔴 | 🔴 | 🔴 | 🔴 |
| [chuong1.tex](file:///Volumes/Zang_Vox/MAC_Zang_2026/GIANG/giang_workspace/de_cuong_IUH/chapters/chuong1.tex) | 🔴🔴 | 🟢 | 🔴 | 🔴 | 🔴🔴 |
| [chuong2.tex](file:///Volumes/Zang_Vox/MAC_Zang_2026/GIANG/giang_workspace/de_cuong_IUH/chapters/chuong2.tex) | 🟡 | 🟡 | 🟡 | 🔴 | 🟡 |
| [chuong3.tex](file:///Volumes/Zang_Vox/MAC_Zang_2026/GIANG/giang_workspace/de_cuong_IUH/chapters/chuong3.tex) | 🔴🔴 | 🟡 | 🔴🔴 | 🔴 | 🔴 |
| [chuong4.tex](file:///Volumes/Zang_Vox/MAC_Zang_2026/GIANG/giang_workspace/de_cuong_IUH/chapters/chuong4.tex) | 🔴 | 🔴🔴 | 🔴🔴 | 🔴 | 🔴 |
| [chuong5.tex](file:///Volumes/Zang_Vox/MAC_Zang_2026/GIANG/giang_workspace/de_cuong_IUH/chapters/chuong5.tex) | 🔴 | 🔴🔴 | 🔴🔴 | 🔴 | 🔴 |
| [ke_hoach.tex](file:///Volumes/Zang_Vox/MAC_Zang_2026/GIANG/giang_workspace/de_cuong_IUH/chapters/ke_hoach.tex) | 🟡 | 🟡 | 🔴🔴 | 🔴 | 🔴 |
| [phu_luc.tex](file:///Volumes/Zang_Vox/MAC_Zang_2026/GIANG/giang_workspace/de_cuong_IUH/chapters/phu_luc.tex) | 🟡 | 🟢 | 🟡 | 🟡 | 🟡 |

🔴🔴 = Critical, 🔴 = High, 🟡 = Medium, 🟢 = Low

---

## Nguyên tắc chỉnh sửa chung

> [!IMPORTANT]
> Mục tiêu **không phải** viết kém đi — mà là viết **tự nhiên hơn**, có **dao động phong cách**, có **giọng cá nhân** của nghiên cứu sinh. Cụ thể:
> 
> 1. **Bỏ "trả lời trước khi bị hỏi"** — để hội đồng hỏi rồi mới trả lời (trong slide bảo vệ)
> 2. **Thay hedging bằng khẳng định hoặc thừa nhận thẳng** — "dự kiến F1 ≥ 0.80" → "mục tiêu F1 ≥ 0.80" hoặc "F1 đạt 0.848 trên tập V10"
> 3. **Gộp/rút gọn danh sách** — 10 hướng → 3-4 hướng trọng tâm, 7 ưu thế → 2-3 lý do chính
> 4. **Thêm dao động phong cách** — xen kẽ đoạn dài/ngắn, thêm liên từ tự nhiên, đổi cấu trúc câu
> 5. **Nêu hạn chế mà KHÔNG bào chữa ngay** — để hạn chế đứng 1 mình, defense để cho phần bảo vệ

---

## Proposed Changes

### Priority 1 — Critical (sửa trước)

---

#### [MODIFY] [chuong1.tex](file:///Volumes/Zang_Vox/MAC_Zang_2026/GIANG/giang_workspace/de_cuong_IUH/chapters/chuong1.tex) — §1.5.1 "Định vị so với SOTA"

**Vấn đề:** Dòng 250–331 (~80 dòng) là đoạn pre-emptive defense nghiêm trọng nhất. Tự đặt câu hỏi *"Gói Bằng chứng có phải là biến thể prompt-with-context của TAD-GP không?"* rồi tự trả lời với git timestamps, ablation, bảng so sánh 8 hàng, kết luận 3 điểm.

**Cách sửa:**
- **Xóa hoàn toàn §1.5.1** (dòng 250–331, ~80 dòng)
- Giữ lại Bảng `tab:direct_compare` (dòng 217–235) nhưng **rút gọn** đoạn phân tích sau bảng (dòng 237) từ ~15 dòng xuống 3-4 câu
- Chuyển nội dung so sánh chi tiết Evidence Packet vs TAD-GP vào **slide bảo vệ** (không nằm trong đề cương)
- Di chuyển bảng `tab:evidence_vs_tadgp` (dòng 285–311) vào **Phụ lục** nếu muốn giữ

**Lý do:** Đoạn này gần như *viết sẵn bài phản biện* — hội đồng sẽ nhận ra ngay. Nội dung tốt nhưng đặt sai chỗ.

---

#### [MODIFY] [chuong5.tex](file:///Volumes/Zang_Vox/MAC_Zang_2026/GIANG/giang_workspace/de_cuong_IUH/chapters/chuong5.tex) — 10× "kỳ vọng" + 10 hướng phát triển

**Vấn đề:** 
- Dòng 57–99: **10 hướng phát triển** với **10 lần dùng "kỳ vọng"** liên tiếp — pattern GPT cực kỳ rõ
- Dòng 33–49: 5 hạn chế + 5 bào chữa ngay lập tức

**Cách sửa "Hướng phát triển" (dòng 57–99):**
- Gộp 10 hướng thành **3-4 hướng chính**, viết dạng đoạn văn thay vì danh sách
- **Bỏ hết "kỳ vọng"** — thay bằng ngôn ngữ đa dạng: "có thể", "hướng tới", "nhằm", hoặc không dùng từ hedge nào
- Ví dụ viết lại:

```latex
% TRƯỚC (GPT pattern):
\item \textbf{Self-supervised pre-training:} ... kỳ vọng cải thiện F1 thêm 3--5\%.
\item \textbf{Multi-modal:} ... kỳ vọng tăng BERTScore thêm 5--8\%.
\item \textbf{Temporal patterns:} ... kỳ vọng phát hiện sớm hơn 2--3 chu kỳ.

% SAU (tự nhiên):
Hướng phát triển gần nhất là tích hợp self-supervised pre-training 
(SimCLR, BYOL) cho tầng encoder để giảm phụ thuộc nhãn. Ngoài ra, 
việc mở rộng sang dữ liệu đa phương thức (hình ảnh hợp đồng, 
email) và phát hiện bất thường theo chuỗi thời gian cũng là 
hướng đáng khám phá trong bối cảnh BĐS.
```

**Cách sửa "Hạn chế" (dòng 33–49):**
- Giữ 5 hạn chế nhưng **bỏ phần bào chữa** sau mỗi hạn chế
- Chỉ nêu hạn chế thẳng thắn, để phần giải trình cho slide bảo vệ

```latex
% TRƯỚC:
\item \textbf{Circular evaluation:} Nhãn pseudo-label từ 13 luật; 
      đã kiểm soát bằng 8 tập chuẩn bên ngoài.

% SAU:
\item Nhãn huấn luyện chính sinh từ 13 luật nghiệp vụ (pseudo-label), 
      chưa có nhãn chuyên gia độc lập.
```

---

#### [MODIFY] [chuong3.tex](file:///Volumes/Zang_Vox/MAC_Zang_2026/GIANG/giang_workspace/de_cuong_IUH/chapters/chuong3.tex) — 7 ưu thế heuristic + 19 requirements + deployment stack

**Vấn đề 1 — "7 ưu thế heuristic" (dòng 231–248):**
Liệt kê 7 lý do chọn heuristic thay vì ML cho Model Router — quá defensive.

**Cách sửa:**
- Rút từ 7 xuống **2 lý do** trong 2-3 câu:

```latex
% SAU:
Heuristic đơn giản được ưu tiên vì ranh giới phân loại kiểu dữ liệu 
là cú pháp (regex, dtype check) — ML không cần thiết cho bài toán này. 
Ngoài ra, heuristic cho kết quả tất định và dễ kiểm tra.
```

**Vấn đề 2 — 19 requirements (dòng 12–49):**
R-AD-01 đến R-DP-04 — quá chi tiết cho đề cương, giống software engineering spec.

**Cách sửa:**
- Gộp thành **1 bảng tóm tắt** 8-10 requirements chính, bỏ mã R-XX-YY
- Hoặc chuyển bảng requirements chi tiết vào **Phụ lục**

**Vấn đề 3 — Bảng so sánh Heuristic vs LightGBM trên 7 chiều (dòng ~498–522):**
Một bảng 7 hàng so sánh heuristic với ML classifier cho 1 quyết định thiết kế nhỏ — quá mức.

**Cách sửa:**
- Xóa bảng so sánh, giữ 2-3 câu giải thích lý do chọn heuristic
- Hoặc rút bảng xuống 3 tiêu chí quan trọng nhất

**Vấn đề 4 — Deployment stack justification (dòng ~550–620):**
FastAPI, Celery, Redis, MySQL, Next.js, Docker — mỗi cái đều có 2-3 bullet justification.

**Cách sửa:**
- Gộp thành **1 bảng** (Công nghệ | Vai trò) không cần justification
- Chuyển chi tiết vào Phụ lục
- Hoặc viết 1 đoạn ngắn: *"Hệ thống triển khai trên stack FastAPI + Celery + Redis, đóng gói Docker Compose. Chi tiết kỹ thuật tại Phụ lục D."*

---

#### [MODIFY] [chuong4.tex](file:///Volumes/Zang_Vox/MAC_Zang_2026/GIANG/giang_workspace/de_cuong_IUH/chapters/chuong4.tex) — §4.9 pre-emptive Q&A + ~55 TBD + cookie-cutter "Nhận xét"

**Vấn đề 1 — §4.9 "Phản biện ba câu hỏi kỹ thuật" (dòng ~815–900):**
🔴🔴 **ĐÂY LÀ DẤU HIỆU GPT RÕ RÀNG NHẤT TRONG TOÀN BỘ ĐỀ CƯƠNG.**

Dòng 815: *"Phần này đáp ứng trước ba câu hỏi phản biện có giá trị nhất mà hội đồng có thể đặt ra"* — tự viết 85 dòng đặt 3 câu hỏi giả tưởng (Q1, Q2, Q3) rồi tự trả lời với ablation designs, rhetorical pivots, emotional framing. Không sinh viên nào tự viết section này.

Các ví dụ cụ thể:
- Dòng ~820: Steelmanning — *"F1 của XGBoost @ Recall=0,908 là bao nhiêu?"* — tự đặt counter-argument mạnh nhất
- Dòng ~844: *"Dự đoán. V11 sẽ thua V10-specific khoảng 2–5 điểm F1"* — dự đoán kết quả xấu rồi reframe: *"Đây không phải tin xấu — đây chính là phần đánh đổi"*
- Dòng ~903: *"Đây là lựa chọn thiết kế có chủ đích, không phải khuyết điểm kỹ thuật"* — raise-then-dismiss

**Cách sửa:**
- **Xóa hoàn toàn §4.9** — chuyển nội dung vào **slide bảo vệ** (FAQ anticipated questions)
- Nếu muốn giữ 1 phần, viết lại thành §4.x "Thảo luận" (Discussion) ngắn gọn 15-20 dòng, nêu insights từ thực nghiệm mà **không** tự đặt câu hỏi phản biện

**Vấn đề 2 — ~55+ ô TBD (dòng 329–379, 570–577, 655–665, 684–694, 711–718, 744–751, 837, 863–867, 891–893, 951):**
Khoảng **40% bảng trong Chương 4** toàn TBD — bao gồm:
- Bảng ablation EP (4.5) — 16 ô TBD
- Bảng pipeline ablation (4.6) — 28 ô TBD
- Bảng NLP results (Qwen2/Gemma) — toàn TBD
- Bảng LLM-as-Judge (inter-judge agreement, calibration, fidelity) — toàn TBD
- Bảng meta-learner LOO, V11 on V10, Tenant B — toàn TBD

Dòng 83: *"Kết quả: p < 0,05 (TBD sau thực nghiệm cuối)"* — viết kết luận TRƯỚC KHI chạy thực nghiệm.
Dòng 956: *"Kết quả Tenant B (TBD) dự kiến cho thấy Recall tăng..."* — dự đoán kết quả chưa có.

**Cách sửa:**
- **Option A (tốt nhất):** Chạy thực nghiệm và điền kết quả thật
- **Option B:** **Xóa tất cả bảng TBD** và viết 1 đoạn: *"Các thực nghiệm ablation Evidence Packet, đánh giá NLP, LLM-as-Judge và multi-tenant sẽ được thực hiện trong giai đoạn tiếp theo."* — 2-3 câu thay vì 10+ bảng rỗng
- **Xóa tất cả dòng "dự kiến cho thấy..."** — không dự đoán kết quả chưa chạy

**Vấn đề 3 — Cookie-cutter "Nhận xét:" paragraphs:**
Mọi phần thực nghiệm đều bắt đầu "Nhận xét:" hoặc "Phân tích kết quả:" với cùng cấu trúc.

**Cách sửa:**
- Bỏ "Nhận xét:" header — viết trực tiếp phân tích
- Xen kẽ câu dài/ngắn, thêm nhận xét cá nhân
- Đổi cách mở: *"Điều đáng chú ý là..."*, *"Kết quả cho thấy..."*, *"Trái dự đoán ban đầu,..."*, hoặc không dùng cụm mở đầu nào

---

### Priority 2 — High (sửa sau Priority 1)

---

#### [MODIFY] [mo_dau.tex](file:///Volumes/Zang_Vox/MAC_Zang_2026/GIANG/giang_workspace/de_cuong_IUH/chapters/mo_dau.tex) — 6× "dự kiến" + 7 hạn chế defensive

**Vấn đề 1 — "Kết quả dự kiến" (dòng 116–126):**
6 bullet points đều bắt đầu "Dự kiến..." — pattern lặp rõ ràng.

**Cách sửa:**
- Thay "dự kiến" bằng ngôn ngữ đa dạng:
  - Bullet 1: "Mục tiêu F1 ≥ 0,80..." (đặt mục tiêu thay vì dự kiến)
  - Bullet 2: "Về chất lượng báo cáo, BERTScore ≥ 0,75..." (mô tả trực tiếp)
  - Bullet 3: "Pipeline xử lý tối đa 10.000 dòng trong 30 phút" (khẳng định)
  - Bullet 4–6: viết dạng đoạn văn gộp lại thay vì 3 bullet riêng

**Vấn đề 2 — "Giới hạn đề tài" (dòng 176–218):**
7 hạn chế, mỗi hạn chế kèm bào chữa ngay.

**Cách sửa:**
- Giữ 4-5 hạn chế quan trọng nhất, viết ngắn gọn
- **Bỏ hoàn toàn phần bào chữa** — chỉ nêu sự thật
- Ví dụ:

```latex
% TRƯỚC:
\item Chỉ hỗ trợ CSV ... \textbf{Giới hạn này không ảnh hưởng} 
      đến tính tổng quát vì CSV là định dạng phổ biến nhất...

% SAU:
\item Hệ thống hiện chỉ xử lý tệp CSV, chưa hỗ trợ Excel, 
      Parquet hoặc database trực tiếp.
```

**Vấn đề 3 — "Bố cục luận văn" có Giới hạn per-chapter (dòng ~129–142):**
Mỗi chương trong bố cục đều kèm disclaimer `\textit{Giới hạn:}` — ví dụ:
- *"Giới hạn: chỉ khảo sát công trình từ năm 2018 trở về sau; không bao gồm các hướng phát hiện bất thường trên dữ liệu phi cấu trúc"*

Đây là pattern bất thường — không ai viết giới hạn vào mục lục. Giới hạn thuộc về từng chương thực tế.

**Cách sửa:**
- **Xóa tất cả dòng `Giới hạn:` khỏi phần Bố cục** — chỉ giữ mô tả ngắn gọn mỗi chương

---

#### [MODIFY] [ke_hoach.tex](file:///Volumes/Zang_Vox/MAC_Zang_2026/GIANG/giang_workspace/de_cuong_IUH/chapters/ke_hoach.tex) — 5 giai đoạn template + 8 risks defensive

**Vấn đề 1 — 5 giai đoạn cùng template (dòng 36–177):**
Mỗi giai đoạn: Mục tiêu → Công cụ → Kết quả giao nộp — GPT template rõ.

**Cách sửa:**
- Gộp 5 giai đoạn thành **1 bảng Gantt** + **1 đoạn mô tả** 5-7 dòng
- Bỏ format "Mục tiêu/Công cụ/Kết quả giao nộp" lặp lại

**Vấn đề 2 — 8 risks + 8 mitigations (dòng 235–290):**

**Cách sửa:**
- Rút từ 8 xuống **3-4 rủi ro chính**
- Viết mitigation dạng đoạn văn ngắn, không phải bảng chi tiết

---

#### [MODIFY] [chuong2.tex](file:///Volumes/Zang_Vox/MAC_Zang_2026/GIANG/giang_workspace/de_cuong_IUH/chapters/chuong2.tex) — Uniform model section template

**Vấn đề:** Mỗi model (XGBoost, BiLSTM, DAE) đều kết thúc bằng *"Trong bối cảnh phát hiện bất thường BĐS, [Model] phát huy..."* — template rõ.

**Cách sửa:**
- Viết lại đoạn kết mỗi model section với phong cách khác nhau:
  - XGBoost: nêu lý do chọn trong 1 câu ngắn
  - BiLSTM: giải thích tại sao cần thêm temporal component (2-3 câu)
  - DAE: liên hệ với unsupervised signal (1 câu + ví dụ cụ thể)
- Không dùng cùng một câu mở đầu

---

### Priority 3 — Medium (nice-to-have)

---

#### [MODIFY] [phu_luc.tex](file:///Volumes/Zang_Vox/MAC_Zang_2026/GIANG/giang_workspace/de_cuong_IUH/chapters/phu_luc.tex)

- Phụ lục chủ yếu là code/schema — ít vấn đề GPT
- Cân nhắc **thêm nội dung** từ các phần được chuyển vào phụ lục (bảng so sánh EP vs TAD-GP, requirements chi tiết, deployment stack)

#### [MODIFY] [abbreviations.tex](file:///Volumes/Zang_Vox/MAC_Zang_2026/GIANG/giang_workspace/de_cuong_IUH/chapters/abbreviations.tex)

- 41 viết tắt — hơi nhiều nhưng chấp nhận được
- Không cần sửa trừ khi muốn giảm số lượng

---

## Open Questions

> [!IMPORTANT]
> **Q1:** Các bảng TBD trong Chương 4 — em muốn xử lý theo Option A (chạy thực nghiệm điền kết quả) hay Option B (xóa bảng, ghi 1 câu "sẽ thực hiện")?

> [!IMPORTANT]
> **Q2:** §1.5.1 "Định vị so với SOTA" (~80 dòng) — em muốn xóa hoàn toàn hay chuyển vào Phụ lục? Nội dung này tốt cho slide bảo vệ nhưng không nên nằm trong đề cương.

> [!WARNING]
> **Q3:** Phần "Giới hạn" ở mo_dau.tex và chuong5.tex — em có muốn giữ phần bào chữa (nhưng viết lại cho tự nhiên hơn) hay bỏ hẳn bào chữa và chỉ nêu hạn chế?

> [!IMPORTANT]
> **Q4:** Phần ke_hoach.tex (phương pháp nghiên cứu chi tiết, risk assessment) — có cần giữ nguyên cấu trúc theo yêu cầu form đề cương IUH không? Nếu IUH yêu cầu format cụ thể thì cần giữ, chỉ sửa giọng văn.

---

## Verification Plan

### Kiểm tra thủ công
1. Đọc lại từng file sau chỉnh sửa — kiểm tra **không còn pattern lặp** (cùng từ/cấu trúc >3 lần liên tiếp)
2. So sánh phong cách viết giữa các chương — phải có **sự dao động tự nhiên**
3. Grep toàn bộ source cho các từ flagged:
   - `grep -c "dự kiến\|kỳ vọng\|TBD" chapters/*.tex` — mục tiêu: giảm ≥70%
   - `grep -c "Nhận xét:" chapters/*.tex` — mục tiêu: ≤ 2 lần
   - `grep -c "Giới hạn này" chapters/*.tex` — mục tiêu: 0

### Build LaTeX
- Chạy `latexmk -pdf main.tex` sau mỗi batch chỉnh sửa
- Kiểm tra không bị lỗi biên dịch, cross-reference đúng
