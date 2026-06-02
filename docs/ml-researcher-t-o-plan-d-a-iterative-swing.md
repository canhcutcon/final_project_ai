# Đề cương Luận văn Thạc sĩ — CSV AI Platform

## Dàn ý chi tiết (bám template IUH)

---

## Context — Vì sao cần đề cương này

Học viên (IUH) đang xây dựng một hệ thống production **CSV AI Platform** (`csv_agent_services` + `csv_agent_platform`) phục vụ luận văn thạc sĩ. Đề tài kết hợp **hai bài toán AI**:

1. **Anomaly Detection** trên dữ liệu CSV (tabular + time-series) — giao dịch BĐS
2. **NLP Report Generation** tự động bằng LLM có fine-tune (Qwen2/Gemma với LoRA)

Hệ thống đã có code, mô hình đã train (V10: XGBoost F1=0.88, BiLSTM F1=0.76, DAE AUC=0.97), nhưng **chưa có đề cương thạc sĩ hoàn chỉnh** — hiện chỉ có skeleton `.tex` trong [de_cuong_IUH/chapters/](de_cuong_IUH/chapters/) với toàn placeholder `[...]`. Plan này cung cấp **dàn ý chi tiết từng mục** để học viên điền nội dung vào các file LaTeX hoặc trình bày trước hội đồng.

Nguồn dữ liệu tham chiếu:

- Backend sản phẩm: [csv_agent_services/backend/](csv_agent_services/backend/) (FastAPI + Celery + MySQL + MinIO)
- Frontend: [csv_agent_services/fronted/](csv_agent_services/fronted/) (Next.js 14)
- Pipeline ML nghiên cứu: [csv_agent_platform/detection/](csv_agent_platform/detection/) (notebooks v8–v11, model V10)
- Template LaTeX: [de_cuong_IUH/](de_cuong_IUH/)
- Memory ghi nhận bug V6 dataset: [memory/project_final_project_ai.md](/Users/mac/.claude/projects/-Users-mac-Downloads-GIANG/memory/project_final_project_ai.md)

---

## 0. Thông tin đề tài (điền vào `main.tex`)

| Trường              | Nội dung đề xuất                                                                                             |
| ------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Tên đề tài (VI)** | Xây dựng nền tảng AI phát hiện bất thường trên dữ liệu CSV và tự động sinh báo cáo bằng mô hình ngôn ngữ lớn |
| **Tên đề tài (EN)** | An AI Platform for CSV Anomaly Detection with LLM-based Automated Report Generation                          |
| **Chuyên ngành**    | Khoa học máy tính                                                                                            |
| **Đối tượng**       | Dữ liệu giao dịch BĐS ở singapore, ~9,812 dòng tabular + 707 tuần time-series                                |

---

## 1. MỞ ĐẦU — `chapters/mo_dau.tex`

### 1.1. Đặt vấn đề

- **Bối cảnh thực tiễn:** Các doanh nghiệp BĐS/tài chính Việt Nam lưu trữ giao dịch dưới dạng CSV/Excel; dữ liệu tồn tại sai sót do nhập liệu, fraud, lỗi hệ thống. Rà soát thủ công tốn chi phí và bỏ sót.
- **Bối cảnh lý luận:** Anomaly Detection truyền thống (rule-based, Isolation Forest) không nắm bắt được pattern phức tạp; các mô hình DL (Autoencoder, Transformer) đã cho kết quả SOTA nhưng khó giải thích cho nghiệp vụ phi kỹ thuật.
- **Research gap được luận văn giải quyết:**
  1. Thiếu nền tảng **end-to-end** tích hợp multi-model (tabular + time-series) cho CSV tiếng Việt.
  2. Kết quả AD thường chỉ ra index anomaly, **chưa sinh giải thích bằng ngôn ngữ tự nhiên** có thể hành động được.
  3. Thiếu nghiên cứu kết hợp **LLM fine-tune (LoRA)** cho báo cáo phát hiện bất thường song ngữ Việt–Anh.

### 1.2. Mục tiêu nghiên cứu (SMART)

- **Mục tiêu tổng quát:** Xây dựng nền tảng AI hoàn chỉnh nhận CSV → phát hiện bất thường → đề xuất sửa → sinh báo cáo NLP → xuất PDF.
- **Mục tiêu cụ thể:**
  1. Xây dựng pipeline tiền xử lý 8 giai đoạn đạt **F1 ≥ 0.85** cho bài toán tabular.
  2. Huấn luyện & triển khai 3 mô hình AD: **XGBoost, BiLSTM, DAE (ensemble)**; so sánh với baseline Isolation Forest/LOF.
  3. Fine-tune **Qwen2-1.5B + LoRA** và **Gemma + LoRA** sinh báo cáo song ngữ, đánh giá bằng BLEU/ROUGE + human eval.
  4. Đóng gói hệ thống Docker Compose (FastAPI + Celery + Next.js) — **latency ≤ 5 phút** cho CSV 10K dòng.

### 1.3. Đối tượng và phạm vi

- **Đối tượng:** Mô hình AD (supervised/unsupervised), kiến trúc hệ thống micro-service, pipeline sinh báo cáo LLM.
- **Phạm vi nội dung:** Tabular + weekly time-series; 13 rule nghiệp vụ BĐS; LoRA fine-tune (không pretrain from scratch).
- **Phạm vi không gian:** Dữ liệu Singapore (2012–2025).
- **Phạm vi thời gian:** Giai đoạn thực hiện 10/2024 – 06/2026.

### 1.4. Phương pháp nghiên cứu

Thực nghiệm định lượng kết hợp kỹ thuật phần mềm:

1. Khảo sát tài liệu (literature review).
2. Thu thập & tiền xử lý dữ liệu (EDA, feature engineering).
3. Xây dựng mô hình (PyTorch + XGBoost).
4. Đánh giá chéo (group-aware CV, F1/AUC/PR curve).
5. Triển khai production (Docker, CI/CD, monitoring).
6. So sánh thực nghiệm với baseline.

### 1.5. Ý nghĩa

- **Khoa học:** Đóng góp phương pháp kết hợp ensemble AD + LLM domain-specific LoRA cho tiếng Việt; công bố tại hội nghị chuyên ngành.
- **Thực tiễn:** Giảm 70–80% thời gian audit CSV; template ứng dụng được cho banking/insurance/retail.

### 1.6. Bố cục luận văn

3 chương chính + Mở đầu + Kết luận (xem §2–§5 dưới).

---

## 2. CHƯƠNG 1 — TỔNG QUAN — `chapters/chuong1.tex`

### 1.1. Tổng quan bài toán phát hiện bất thường

- **Định nghĩa:** Point / Contextual / Collective anomaly.
- **Phân loại bài toán:** Supervised / Semi-supervised / Unsupervised.
- **Ứng dụng:** Fraud detection, IoT, healthcare, **real estate transaction audit** (focus của luận văn).

### 1.2. Các hướng tiếp cận

| Hướng         | Đại diện                                                     | Ưu / Nhược                                     |
| ------------- | ------------------------------------------------------------ | ---------------------------------------------- |
| Thống kê      | Z-score, IQR, Grubbs                                         | Đơn giản, không bắt được tương tác nhiều chiều |
| Rule-based    | Expert rules (13 rule BĐS)                                   | Interpretability cao, chi phí bảo trì lớn      |
| ML cổ điển    | Isolation Forest, LOF, OC-SVM                                | Nhanh, khó với time-series dài                 |
| Deep Learning | AutoEncoder, VAE, BiLSTM, Transformer (TranAD), GAN (AnoGAN) | SOTA, cần dữ liệu nhiều, khó giải thích        |
| Ensemble      | Voting, stacking, score fusion                               | Robust, phức tạp triển khai                    |

### 1.3. Tổng quan NLP Report Generation

- Sinh báo cáo có cấu trúc bằng LLM: prompt engineering, Chain-of-Thought, RAG, fine-tune LoRA.
- Khảo sát Qwen2, Gemma, Llama3, PhoGPT (Vietnamese).

### 1.4. Các công trình liên quan

Bảng **≥ 15 nghiên cứu gần đây** (2021–2025): DeepAnT, USAD, TranAD, OmniAnomaly, NSIBF, GANF, DAGMM; kèm LLM-fin-report (FinMA, BloombergGPT), prompt-cot cho tabular explanation. Mỗi entry ghi: tác giả, năm, phương pháp, kết quả, dataset, gap.

### 1.5. Khoảng trống nghiên cứu (Research gap)

1. Thiếu nghiên cứu end-to-end pipeline AD + NLP trên **CSV tiếng Việt**.
2. Hầu hết paper chỉ đánh giá AD trên dataset chuẩn (Yahoo, SMD), **chưa thực chứng trên dữ liệu BĐS thực tế**.
3. Chưa có hệ thống **giải thích anomaly bằng báo cáo human-readable** có fine-tune domain-specific.

### 1.6. Tóm tắt chương

---

## 3. CHƯƠNG 2 — CƠ SỞ LÝ THUYẾT — `chapters/chuong2.tex`

### 2.1. Nền tảng ML/DL

- 2.1.1. Học có giám sát vs không giám sát vs bán giám sát.
- 2.1.2. Hàm mất mát: Cross-Entropy, MSE, reconstruction loss, contrastive loss.
- 2.1.3. Chuẩn hoá: Batch Norm, Layer Norm, dropout, L1/L2 regularization.

### 2.2. Mô hình phát hiện bất thường sử dụng trong luận văn

- **2.2.1. XGBoost** — Gradient boosting, tree ensemble, threshold optimization. (dùng trong A7_XGB-CLEAN, F1=0.88)
- **2.2.2. Denoising Autoencoder (DAE)** — Kiến trúc encoder-decoder, noise injection σ=0.18, reconstruction error + Mahalanobis. (A2_DAE, latent_dim=16)
- **2.2.3. BiLSTM Classifier** — Bidirectional LSTM cho chuỗi thời gian; hidden=64, 2 layer, dropout. (A11_BiLSTM_CLS, F1=0.76)
- **2.2.4. TranAD** — Transformer với dual decoder (reconstruction + discrimination), attention self-conditioning.
- **2.2.5. AnoGAN** — Generator + Discriminator, anomaly score = reconstruction + discrimination.
- **2.2.6. Ensemble strategies** — Voting, stacking, score-level fusion.

### 2.3. Nền tảng NLP & LLM

- 2.3.1. Transformer, self-attention, positional encoding.
- 2.3.2. Pretrained LLM: Qwen2, Gemma — tokenizer, context window.
- 2.3.3. **PEFT / LoRA** — Low-Rank Adaptation, rank r, alpha, target modules (q_proj, v_proj).
- 2.3.4. Prompt engineering: system prompt, few-shot, Chain-of-Thought, structured output (JSON).
- 2.3.5. Evaluation: BLEU, ROUGE-L, METEOR, BERTScore, human eval rubric.

### 2.4. Độ đo đánh giá

- Classification: Accuracy, Precision, Recall, F1, ROC-AUC, PR-AUC.
- Anomaly-specific: Best-F1-threshold, PR curve, Precision@k.
- NLP: BLEU-4, ROUGE-1/2/L, BERTScore, faithfulness, fluency.

### 2.5. Công nghệ triển khai

- FastAPI (async), Celery distributed task, Redis broker, MinIO (S3-compatible), MySQL 8 + SQLAlchemy, Docker Compose, Next.js 14 + WebSocket.

### 2.6. Tóm tắt chương

---

## 4. CHƯƠNG 3 — ÁP DỤNG KẾT QUẢ — `chapters/chuong3.tex`

### 3.1. Dữ liệu nghiên cứu

- **3.1.1. Mô tả dataset** — SNRE + Prosage real estate transactions; 9,812 tabular rows; 707 weekly rows (2012-05-14 → 2025-11-24); 413 cột thô → 51 cột sau feature selection.
- **3.1.2. Quy trình gán nhãn** — 13 business rule + pseudo-labeling ensemble (≥2/3 agreement, confidence ≥0.8) + synthetic augmentation (template 250 + rule-based 150).
- **3.1.3. Chia tập dữ liệu** — Tabular: 70/15/15 group-aware split (không leak `file_number`). Time-series: chronological (train ≤2021-12-31, val →2023-06-30, test →2025-11-24).
- **Bảng mô tả tổng quan** — số dòng, tỷ lệ anomaly (10.8% tabular, 11.3/23.1/27.8% TS theo ngưỡng 0.15), số features.

### 3.2. Tiền xử lý dữ liệu (pipeline 8 phase)

1. **Loading** — auto-detect encoding, xử lý XLSX/CSV đa sheet.
2. **Schema normalization** — column renaming, dtype correction.
3. **Cleaning** — missing value (median/mode/ffill), duplicate (exact + fuzzy), outlier flagging.
4. **Merging & Enrichment** — join sale × client × property × invoice × payee.
5. **Feature engineering** — ratio features (commission_to_price, billing_to_commission), date diff, agent velocity, district target encoding.
6. **Windowing time-series** — sliding window=8 tuần, stride=1, label ngưỡng ≥0.15 (đã fix bug V6).
7. **Synthetic augmentation** — template + rule-based 400 mẫu.
8. **Feature selection & scaling** — corr filter 0.95, top-k=50, StandardScaler/RobustScaler.

### 3.3. Phương pháp đề xuất

- **3.3.1. Kiến trúc hệ thống tổng thể** — diagram Upload → Preprocess → Detect → Fix → Report → Export PDF (xem [docs/detection-data-processing-pipeline-prd.md](csv_agent_services/docs/detection-data-processing-pipeline-prd.md)).
- **3.3.2. Model Router** — dựa archetype dữ liệu (tabular → XGBoost, time-series → BiLSTM, mixed → ensemble).
- **3.3.3. Ensemble AD** — score fusion của A7_XGB-CLEAN + A11_BiLSTM + A2_DAE_Mahal với threshold từng mô hình (0.8318 / 0.9816 / 0.0779).
- **3.3.4. LLM Report Pipeline** — detection results → aggregation → enrichment → Jinja2 template → Qwen2-1.5B-LoRA inference → Markdown → WeasyPrint PDF.
- **3.3.5. Gemini Fix Service** — batch 20 error rows/request, confidence ≥0.7 auto-apply, <0.7 human review queue, Redis cache.

### 3.4. Cài đặt & triển khai

- **3.4.1. Backend** — FastAPI 0.110 + SQLAlchemy 2.0 async + Alembic; 11 router (upload, analysis, pipeline, report, dashboard, cases, review, agent…).
- **3.4.2. Orchestration** — Celery chain 5 task (preprocess 0–20% → detect 20–60% → fix 60–75% → report 75–88% → export 88–100%); progress qua WebSocket.
- **3.4.3. Frontend** — Next.js 14 + Tailwind; pages: /upload, /pipeline/[id], /analyses, /reports/[id], /dashboard.
- **3.4.4. Deployment** — Docker Compose (MySQL, Redis, MinIO, Celery worker, backend, frontend).
- **3.4.5. LoRA fine-tuning** — `train_qwen_lora.py`, checkpoints 100–750; Gemma 100–1250.

### 3.5. Thực nghiệm và đánh giá

- **3.5.1. Thiết lập** — GPU (A100/RTX 4090), PyTorch 2.0, epochs=50, batch=64, Adam lr=1e-3, early stopping patience=10.
- **3.5.2. Baseline** — Isolation Forest, LOF, OC-SVM, Rule-based only.
- **3.5.3. Kết quả AD** (bảng so sánh):

| Phương pháp            | Precision | Recall | F1            | AUC   |
| ---------------------- | --------- | ------ | ------------- | ----- |
| Isolation Forest       | –         | –      | –             | –     |
| LOF                    | –         | –      | –             | –     |
| Rule-based             | –         | –      | –             | –     |
| A7_XGB-CLEAN           | 0.895     | 0.867  | **0.881**     | 0.995 |
| A11_BiLSTM             | 0.717     | 0.816  | 0.764         | 0.984 |
| A2_DAE-Mahal           | –         | –      | –             | 0.965 |
| **Ensemble (đề xuất)** | TBD       | TBD    | **TBD ≥0.89** | TBD   |

- **3.5.4. Ablation study** — effect of windowing threshold 0.15 vs >0; feature leakage removal (35 cột anomaly\_\*); synthetic augmentation on/off.
- **3.5.5. Kết quả NLP Report** — BLEU-4, ROUGE-L trước vs sau LoRA; human eval 5 rubric (accuracy, fluency, completeness, faithfulness, actionability) trên 50 mẫu.
- **3.5.6. Phân tích lỗi** — confusion matrix, false positive case study, SHAP feature importance cho XGBoost.
- **3.5.7. Đánh giá hệ thống** — latency end-to-end (upload → PDF) trên CSV 1K/5K/10K dòng; scalability Celery worker.

### 3.6. Thảo luận

- Ưu điểm đề xuất; hạn chế (rule-based labels → generalization, sparse time-series pre-2020); threats to validity.

### 3.7. Tóm tắt chương

---

## 5. KẾT LUẬN — `chapters/ket_luan.tex`

### 5.1. Kết quả đạt được

- Xây dựng pipeline 8 phase xử lý dữ liệu.
- Triển khai ensemble 3 mô hình AD; F1 ≥ 0.88.
- Fine-tune LoRA trên Qwen2-1.5B sinh báo cáo song ngữ.
- Đóng gói hệ thống Docker sẵn sàng production.

### 5.2. Hạn chế

- Dataset label 100% từ rule → risk overfit rule.
- Chưa có đánh giá trên dataset domain khác (finance, insurance).
- Latency PDF export ~15s/báo cáo do WeasyPrint.

### 5.3. Hướng phát triển

- Self-supervised representation (contrastive, SimCLR-tabular).
- Multi-modal (kết hợp hình ảnh hợp đồng).
- Active learning / human-in-the-loop feedback vòng.
- RAG với vector database cho context nghiệp vụ.

---

## 6. Phụ lục, danh mục, lý lịch

- **`abbreviations.tex`:** AD, AUC, BiLSTM, CSV, DAE, DL, F1, GAN, LLM, LoRA, ML, NLP, PR, RAG, ROC, VAE, XGBoost, …
- **`cong_trinh.tex`:** bài báo dự kiến (ví dụ: "Ensemble Anomaly Detection for Vietnamese Real Estate CSV", "LoRA Fine-tuned LLM for Financial Anomaly Narration").
- **`phu_luc.tex`:** ví dụ CSV input, sample report output, code snippet chính, hyperparameter bảng đầy đủ, schema database.
- **`ly_lich.tex`:** thông tin học viên.
- **`refs/references.bib`:** ≥30 tài liệu IEEE format (TranAD, AnoGAN, USAD, DAGMM, XGBoost paper, LoRA paper, Qwen2 tech report, …).

---

## 7. Critical files — dùng để viết nội dung thực tế vào từng chương

| Chương/Mục      | File nguồn tham chiếu                                                                                                                                                                                     |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| §3.1 Dữ liệu    | [csv_agent_platform/detection/data/](csv_agent_platform/detection/data/), [memory/project_final_project_ai.md](/Users/mac/.claude/projects/-Users-mac-Downloads-GIANG/memory/project_final_project_ai.md) |
| §3.2 Tiền xử lý | [csv_agent_platform/detection/src/data/](csv_agent_platform/detection/src/data/) — loader.py, cleaning.py, features_tabular.py, windowing.py, synthetic.py                                                |
| §3.3 Kiến trúc  | [csv_agent_services/docs/detection-data-processing-pipeline-prd.md](csv_agent_services/docs/detection-data-processing-pipeline-prd.md), [csv_agent_services/readme.md](csv_agent_services/readme.md)      |
| §3.3.3 Models   | [csv_agent_platform/detection/src/models/](csv_agent_platform/detection/src/models/), weights `/models/v10/\*.json                                                                                        | pt`, `v10_artifacts.json` |
| §3.3.4 Report   | [csv_agent_services/backend/app/ml/generation/](csv_agent_services/backend/app/ml/generation/) — report_generator, model_router, pdf_engine                                                               |
| §3.4 Triển khai | [csv_agent_services/backend/](csv_agent_services/backend/), [csv_agent_services/fronted/](csv_agent_services/fronted/), [docker-compose.yml](csv_agent_services/docker-compose.yml)                       |
| §3.5 Kết quả    | [csv_agent_platform/detection/notebooks/](csv_agent_platform/detection/notebooks/) — v10_result.ipynb, v11_result.ipynb                                                                                   |

---

## 8. Verification — cách kiểm tra đề cương hoàn chỉnh

1. **Compile LaTeX** — `cd de_cuong_IUH && xelatex main.tex && bibtex main && xelatex main.tex && xelatex main.tex` → ra `main.pdf` không lỗi, mục lục đầy đủ.
2. **Kiểm tra format IUH** — lề 3.5/2/3/3 cm, Times 13pt, 1.5 spacing, caption IEEE; tối đa 100 trang phần chính.
3. **Sanity check số liệu** — mọi bảng F1/AUC phải match [csv_agent_platform/detection/models/v10/v10_artifacts.json](csv_agent_platform/detection/models/v10/v10_artifacts.json) và notebook `v10_detection_result.ipynb`.
4. **Đối chiếu research gap** — mỗi gap ở §1.5 phải có contribution tương ứng ở §5.1.
5. **Bibliography** — ≥30 entry, format IEEE, tất cả `\cite{}` có key tồn tại trong `refs/references.bib`.
6. **Presentation dry-run** — dàn ý in slide ≤30 slide, 20 phút thuyết trình.

---

## 9. Thứ tự thực thi khuyến nghị (roadmap viết đề cương)

1. Tuần 1: Điền `mo_dau.tex` + §0 thông tin `main.tex`.
2. Tuần 2–3: Hoàn thiện `chuong1.tex` — thu thập ≥15 tài liệu liên quan, điền `refs/references.bib`.
3. Tuần 4: `chuong2.tex` — viết cơ sở lý thuyết dựa trên §3 plan.
4. Tuần 5–7: `chuong3.tex` — phần quan trọng nhất; chạy lại notebooks để lấy số liệu chính thức, vẽ lại diagram kiến trúc bằng draw.io/TikZ.
5. Tuần 8: `ket_luan.tex` + phụ lục + lý lịch.
6. Tuần 9: Compile, review, chỉnh format IUH, nộp GVHD.
