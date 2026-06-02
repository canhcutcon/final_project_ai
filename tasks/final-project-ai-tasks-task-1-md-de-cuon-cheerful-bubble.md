# Plan: Cập nhật mục tiêu, bổ sung 10 nguồn nghiên cứu mới và làm rõ khoảng trống nghiên cứu cho de_cuong_IUH

## Context

User cung cấp 10 paper mới trong [de_cuong_IUH/new_ref/](de_cuong_IUH/new_ref/), được tổng hợp ở [final_project_ai/tasks/task.1.md](final_project_ai/tasks/task.1.md). Đây là dòng nghiên cứu **2022–2026** về **LLM + Anomaly Detection trên dữ liệu bảng + Tự sinh báo cáo**:

| # | Paper | Năm | Nguồn | Đóng góp chính |
|---|-------|-----|-------|----------------|
| 1 | AnoLLM | 2025 | ICLR (CORE A\*) | LLM làm anomaly scorer qua serialization + NLL |
| 2 | Anomaly Detection of Tabular Data Using LLMs (Li et al.) | 2024 | arXiv 2406.16308 | Zero-shot batch-level AD bằng GPT-4 |
| 3 | OFA-TAD | 2026 | arXiv 2603.14407 | One-for-all cross-domain tabular AD |
| 4 | A Novel Benchmark for Tabular Anomaly Analysis, Reasoning and Reporting | 2025 | EMNLP Findings | Benchmark AD + reasoning + report generation |
| 5 | Automatic Monitoring Report via LLM + Knowledge Graph | 2024 | ScienceDirect (Q1) | Sinh báo cáo có cấu trúc bằng LLM+KG |
| 6 | Contextual Learning for AD in Tabular Data | 2025 | OpenReview | Conditional Wasserstein AE cho contextual AD |
| 7 | ADBench | 2022 | NeurIPS (CORE A\*) | Benchmark 30 thuật toán × 57 dataset |
| 8 | Deep Autoencoder for Accounting Anomalies | 2017 | KDD Workshop / arXiv 1709.05254 | DAE cho gian lận kế toán |
| 9 | TAD-GP — Efficient AD in Tabular Cybersecurity via LLMs | 2025 | Scientific Reports (Q1, IF~4.0) | Prompt-guided LLM 7B cho cybersec AD |
| 10 | LLMs on Tabular Data — A Survey | 2024 | TMLR | Khảo sát LLM-on-tabular toàn diện |

**Ba việc cần làm**:

1. **Mục tiêu nghiên cứu**: Viết lại ngắn gọn, súc tích, mỗi mục là một milestone đánh giá độ hoàn thiện hệ thống (theo yêu cầu user trước đó).
2. **Bổ sung 10 nguồn mới vào** [refs/references.bib](de_cuong_IUH/refs/references.bib) và **vào bảng related work** trong [chapters/chuong1.tex](de_cuong_IUH/chapters/chuong1.tex) (hiện có 16 entry, mở rộng lên 26 entry).
3. **Tái cấu trúc khoảng trống nghiên cứu** (research gap) — đây là phần quan trọng nhất: nhiều "gap" hiện tại trong đề cương đã bị các paper 2024–2026 phủ một phần, nếu không cập nhật thì hội đồng sẽ chỉ ra ngay khi phản biện.

## Critical files

- [de_cuong_IUH/chapters/mo_dau.tex](de_cuong_IUH/chapters/mo_dau.tex) — mục **1. Đặt vấn đề** (dòng 14–19) và mục **2. Mục tiêu nghiên cứu** (dòng 22–32).
- [de_cuong_IUH/chapters/chuong1.tex](de_cuong_IUH/chapters/chuong1.tex) — Bảng `tab:related_work` (dòng 90–132), mục "Nhận xét và khoảng trống nghiên cứu" (dòng 134–146), Bảng `tab:direct_compare` (dòng 152–170), đoạn "Khoảng trống nghiên cứu mà luận văn giải quyết" (dòng 176–181).
- [de_cuong_IUH/refs/references.bib](de_cuong_IUH/refs/references.bib) — thêm 10 entry BibTeX mới ở cuối.

---

## Phần 1 — Mục tiêu nghiên cứu (mo_dau.tex, dòng 22–32)

### 1.1.b. Tham khảo cách viết mục tiêu của 2 paper trong [de_cuong_IUH/example/](de_cuong_IUH/example/)

Thư mục example/ có hai paper được giáo viên dùng làm mẫu tham khảo cho luận văn:

**Paper 1 — "Machine Learning for Real Estate Time Series Prediction" (REITs, UKCI 2022)** — gần đề tài nhất về domain (cũng BĐS + tài chính):

> *"The goal of this paper is to **investigate the predictive performance** on price time series of REITs (real estate investment trusts), stocks and bonds, of **five different machine learning (ML) algorithms**. These algorithms are: linear regression; support vector regression; gradient boosting; long short-term memory neural networks; and k-nearest neighbour. We run experiments on 90 datasets and **compare the ML results to those of an ARIMA model**, which is a popular econometric benchmark."*

→ **Pattern**: 1 câu mục tiêu (động từ + đối tượng + domain) + 1 câu liệt kê phương pháp + 1 câu nêu baseline so sánh. Không bullet, không kể lể kiến trúc.

**Paper 2 — "Localizing and Classifying Objects Using Machine Learning"** — mẫu cách viết **đóng góp/mục tiêu cụ thể**:

> Cấu trúc 5 nhóm đóng góp đánh số rõ ràng:
> *"1. Contribution(s) in Code … 2. Contribution(s) in Application … 3. Contribution(s) in Data … 4. Contribution(s) in Algorithm … 5. Contribution(s) in Analysis …"*

→ **Pattern**: gom mục tiêu cụ thể theo **nhóm deliverable** (Data / Algorithm / Application / Analysis), mỗi nhóm có 2–3 câu súc tích. Đây là cách hội đồng quen đọc.

### 1.1. Tham khảo cách viết mục tiêu của 10 paper trong [new_ref/](de_cuong_IUH/new_ref/)

Khảo sát phần "Mục tiêu nghiên cứu" của 10 paper (tổng hợp ở [task.1.md](final_project_ai/tasks/task.1.md)) cho thấy **một pattern chung rất nhất quán**:

| Paper | Cách viết mục tiêu |
|-------|--------------------|
| **AnoLLM** (ICLR 2025) | "**Đề xuất** một khung làm việc AnoLLM để **sử dụng LLM** trong **phát hiện bất thường không giám sát** trên **dữ liệu bảng**, đặc biệt là dữ liệu hỗn hợp kiểu số và văn bản." |
| **Li et al.** (2024) | "**Nghiên cứu** năng lực zero-shot của **LLM** trong việc **phát hiện bất thường theo batch** trên dữ liệu bảng." |
| **OFA-TAD** (2026) | "**Xây dựng** một khung one-for-all cho **phát hiện bất thường trên bảng**, chỉ cần huấn luyện một lần trên nhiều nguồn dữ liệu rồi tổng quát hoá sang các bảng domain mới." |
| **EMNLP 2025** | "**Xây dựng** bộ dữ liệu benchmark mới cho **phát hiện và phân tích bất thường** trên bảng, đồng thời **đánh giá khả năng LLM trong việc sinh báo cáo** phân tích." |
| **Auto-Monitoring Report** (2024) | "**Xây dựng hệ thống tự động sinh báo cáo giám sát dữ liệu bằng LLM**, kết hợp với knowledge graph." |
| **Contextual AD** (2025) | "**Phát hiện bất thường** trên dữ liệu bảng dựa trên **bối cảnh cục bộ** thay vì mô hình toàn cục." |
| **ADBench** (2022) | "**Xây dựng benchmark toàn diện nhất** cho bài toán phát hiện bất thường trên dữ liệu tabular." |
| **Schreyer** (2017) | "**Phát hiện gian lận** trên dữ liệu kế toán dạng bảng quy mô lớn." |
| **TAD-GP** (2025) | "**Phát hiện bất thường** trên dữ liệu tabular an ninh mạng **bằng LLM**." |
| **LLM-on-Tabular Survey** (2024) | "**Khảo sát toàn diện** việc dùng LLM cho dữ liệu tabular." |

**Rút ra công thức viết mục tiêu nghiên cứu (kết hợp 10 paper new_ref/ và 2 paper example/)**:

> **Mục tiêu tổng quát = [Động từ hành động] + [Đối tượng/Phương pháp đề xuất] + [trên domain/dữ liệu nào] + [đặc tính riêng / baseline so sánh]**

- **Động từ chuẩn**: *Đề xuất / Xây dựng / Nghiên cứu / Phát hiện / Khảo sát / Investigate*.
- **Độ dài**: **1 câu chính** (15–35 từ), tối đa 1–2 câu phụ liệt kê phương pháp hoặc baseline (theo REITs paper). **Không** dùng bullet, không liệt kê chi tiết kỹ thuật.
- **Tránh**: liệt kê công nghệ (FastAPI, Docker, LoRA cụ thể), liệt kê số liệu (F1, AUC, latency), mô tả pipeline — đó là việc của "mục tiêu cụ thể" và Chương 2–3.

> **Mục tiêu cụ thể = nhóm thành 5–6 deliverable category** theo style "Contribution in X" (Object Detection paper), mỗi mục: **danh từ kết quả + 1 dòng mô tả + tiêu chí nghiệm thu (nếu có)**.

### 1.2. Mục tiêu tổng quát (thay dòng 24) — viết theo pattern paper REITs (1 câu chính + 2 câu phụ)

```latex
\textit{Mục tiêu tổng quát:} \textbf{Đề xuất và xây dựng một hệ thống AI tích hợp ensemble
Anomaly Detection và Large Language Model fine-tune (LoRA) để vừa phát hiện bất thường,
vừa tự động sinh báo cáo phân tích bằng ngôn ngữ tự nhiên song ngữ Việt--Anh trên dữ liệu
giao dịch bất động sản và tài chính dạng bảng (CSV/Excel) của doanh nghiệp.} Ensemble gồm
ba mô hình thành phần: XGBoost cho dữ liệu tabular, BiLSTM-Attention cho time-series và
Denoising Autoencoder cho phát hiện bất thường không giám sát; kết quả ensemble được so
sánh với các baseline truyền thống (Isolation Forest, LOF) và các phương pháp LLM-for-AD
gần đây (AnoLLM, TAD-GP). Hệ thống được đóng gói triển khai dạng micro-service, hướng tới
đối tượng người dùng nghiệp vụ phi kỹ thuật trong rà soát, kiểm toán và ra quyết định.
```

**Phân tích theo công thức (đối chiếu REITs paper)**:
- *Câu 1 — mục tiêu*: "Đề xuất và xây dựng một hệ thống AI tích hợp …" — giống "The goal of this paper is to investigate the predictive performance …" của REITs paper.
- *Câu 2 — liệt kê phương pháp + baseline*: 3 thành phần ensemble + baseline so sánh — giống REITs paper liệt kê 5 ML + ARIMA baseline.
- *Câu 3 — phạm vi triển khai và đối tượng người dùng*: gói gọn yếu tố production và đối tượng phục vụ.
- *Domain*: "dữ liệu giao dịch bất động sản và tài chính" — khớp dataset chính (BĐS Singapore 2012–2025) + dataset phụ Credit Card Fraud, đúng yêu cầu user (BĐS + finance nhẹ).
- *Điểm khác biệt*: "song ngữ Việt-Anh" + "tích hợp ensemble AD với LLM fine-tune" — vị thế khác AnoLLM/TAD-GP (chỉ AD), khác Auto-Monitoring Report (cần KG).

### 1.3. Mục tiêu cụ thể (thay dòng 26–32) — gom theo nhóm deliverable theo style "Contribution in X" của paper Object Detection

Nhóm 7 milestone theo **7 deliverable category** (Data / Pipeline / Model / Integration / LLM / System / Custom-Rule-Pipeline) — mở rộng style "Contribution(s) in Code/Application/Data/Algorithm/Analysis" của paper Object Detection trong [example/](de_cuong_IUH/example/):

```latex
\textit{Mục tiêu cụ thể:} Đề tài hướng tới 7 cột mốc nghiệm thu, nhóm theo 7 hạng mục đóng góp:
\begin{enumerate}
  \item \textbf{Đóng góp về dữ liệu (Data)}: chuẩn hoá và công bố bộ dữ liệu BĐS Singapore
        (9.812 dòng tabular, 707 tuần time-series, giai đoạn 2012--2025) cùng 5 dataset
        benchmark công khai cho bài toán phát hiện bất thường CSV nghiệp vụ; gán nhãn
        pseudo-label theo 13 luật nghiệp vụ.

  \item \textbf{Đóng góp về xử lý dữ liệu (Pipeline)}: xây dựng pipeline tiền xử lý 8 giai
        đoạn (làm sạch, chuẩn hoá, feature engineering, gán nhãn, sinh universal feature)
        có thể tái sử dụng cho CSV đa domain (BĐS, kế toán, tài chính).

  \item \textbf{Đóng góp về mô hình (Model)}: phát triển ensemble Anomaly Detection gồm
        XGBoost (tabular), BiLSTM-Attention (time-series) và Denoising Autoencoder
        (unsupervised); đạt \textbf{F1 $\geq$ 0.85} và \textbf{AUC $\geq$ 0.97} trên tập
        kiểm tra, vượt baseline Isolation Forest, LOF và phương pháp LLM-for-AD (AnoLLM,
        TAD-GP).

  \item \textbf{Đóng góp về kiến trúc tích hợp (Integration)}: thiết kế mô-đun
        \textit{Model Router} (định tuyến mô hình theo archetype dữ liệu) và
        \textit{Evidence Packet} (gói bằng chứng có cấu trúc gồm score thành phần, top-$k$
        SHAP feature, luật nghiệp vụ vi phạm, ngữ cảnh giao dịch) làm tầng trung gian giữa
        ensemble AD và LLM downstream.

  \item \textbf{Đóng góp về sinh báo cáo NLP (LLM)}: fine-tune Qwen2-1.5B và Gemma-2B bằng
        LoRA trên evidence packet để sinh báo cáo phát hiện bất thường \textbf{song ngữ
        Việt--Anh}; đánh giá bằng human evaluation (faithfulness, actionability, domain
        correctness, fluency) làm tiêu chí chính, BLEU/ROUGE/Format-Compliance làm sanity
        check.

  \item \textbf{Đóng góp về hệ thống triển khai (System)}: đóng gói toàn bộ pipeline thành
        nền tảng phần mềm hoàn chỉnh (FastAPI + Celery + Next.js + Docker Compose), chạy
        on-premise trên 1 GPU 24GB; đạt \textbf{SLA latency $\leq$ 5 phút} cho tệp CSV
        10.000 dòng (đo p50/p95/p99 trực tiếp trên Docker stack).

  \item \textbf{Đóng góp về khả năng tuỳ biến cho doanh nghiệp (Custom Rule \&
        Re-training Pipeline)}: cung cấp giao diện và pipeline cho phép mỗi doanh nghiệp
        (i) khai báo \textit{custom rules} riêng (qua YAML upload hoặc form trên web UI),
        (ii) sinh \textit{pseudo-label tự động} trên dataset CSV của họ dựa trên rule
        custom, (iii) \textit{re-train hoặc fine-tune} mô hình ensemble + LLM trên dữ liệu
        + rule của doanh nghiệp đó. Hệ thống chứng minh tính tổng quát hoá thực sự ở mức
        \textit{rule pluggability + model adaptability}, không chỉ ở mức code-level
        framework.
\end{enumerate}
```

**Phong cách**: mỗi mục bắt đầu bằng **"Đóng góp về … (English category)"** — đúng cách paper Object Detection liệt kê 5 nhóm đóng góp. Hội đồng đọc lướt biết ngay luận văn đóng góp ở 5 trục nào, mỗi trục có 1 deliverable cụ thể.

---

## Phần 2 — Bổ sung 10 entry BibTeX vào [refs/references.bib](de_cuong_IUH/refs/references.bib)

Thêm vào cuối file một section mới:

```bibtex
% ---- New References (2024–2026): LLM + Tabular AD + Auto Report ----

@inproceedings{tsai2025anollm,
  author    = {Tsai, Che-Ping and Teng, Ganyu and Wallis, Phillip and Ding, Wei},
  title     = {{AnoLLM}: Large Language Models for Tabular Anomaly Detection},
  booktitle = {Proceedings of the 13th International Conference on Learning Representations (ICLR)},
  year      = {2025}
}

@article{li2024llm_tabad,
  author       = {Li, Aodong and Zhao, Yunhan and Qiu, Chen and Kloft, Marius and Smyth, Padhraic and Rudolph, Maja and Mandt, Stephan},
  title        = {Anomaly Detection of Tabular Data Using {LLMs}},
  journal      = {arXiv preprint arXiv:2406.16308},
  year         = {2024},
  howpublished = {\url{https://arxiv.org/abs/2406.16308}}
}

@article{ofa_tad2026,
  author       = {{OFA-TAD Authors}},
  title        = {Towards One-for-All Anomaly Detection for Tabular Data},
  journal      = {arXiv preprint arXiv:2603.14407},
  year         = {2026},
  howpublished = {\url{https://arxiv.org/abs/2603.14407}}
}

@inproceedings{emnlp2025_tabular_anomaly,
  author    = {{EMNLP 2025 Authors}},
  title     = {A Novel Benchmark for Tabular Anomaly Analysis, Reasoning and Reporting},
  booktitle = {Findings of the Association for Computational Linguistics: EMNLP 2025},
  year      = {2025}
}

@article{auto_monitoring_report_llm_kg2024,
  author  = {{Authors}},
  title   = {Automatic Generation of Monitoring Report Based on Large Language Models and Knowledge Graph Inference},
  journal = {ScienceDirect / Elsevier (Scopus/WoS)},
  year    = {2024}
}

@inproceedings{contextual_ad_tabular2025,
  author    = {{Contextual AD Authors}},
  title     = {Contextual Learning for Anomaly Detection in Tabular Data},
  booktitle = {OpenReview},
  year      = {2025}
}

@inproceedings{han2022adbench,
  author    = {Han, Songqiao and Hu, Xiyang and Huang, Hailiang and Jiang, Mingqi and Zhao, Yue},
  title     = {{ADBench}: Anomaly Detection Benchmark},
  booktitle = {Advances in Neural Information Processing Systems (NeurIPS)},
  volume    = {35},
  pages     = {32142--32159},
  year      = {2022}
}

@inproceedings{schreyer2017accounting_dae,
  author    = {Schreyer, Marco and Sattarov, Timur and Borth, Damian and Dengel, Andreas and Reimer, Bernd},
  title     = {Detection of Anomalies in Large-Scale Accounting Data Using Deep Autoencoder Networks},
  booktitle = {KDD 2017 Workshop on Anomaly Detection in Finance},
  year      = {2017},
  howpublished = {\url{https://arxiv.org/abs/1709.05254}}
}

@article{zhao2025tadgp,
  author  = {Zhao, Xiaoxia and Leng, Xiao and Wang, Lei and others},
  title   = {Efficient Anomaly Detection in Tabular Cybersecurity Data Using Large Language Models},
  journal = {Scientific Reports},
  volume  = {15},
  pages   = {3344},
  year    = {2025},
  doi     = {10.1038/s41598-025-88050-z}
}

@article{fang2024llm_tabular_survey,
  author  = {Fang, Xi and Xu, Weijie and Tan, Fiona Anting and Zhang, Jiani and Hu, Ziyue and Qi, Yanjun and Nickleach, Scott and Socolinsky, Diego and Sengamedu, Srinivasan and Faloutsos, Christos},
  title   = {Large Language Models ({LLMs}) on Tabular Data: Prediction, Generation, and Understanding -- A Survey},
  journal = {Transactions on Machine Learning Research (TMLR)},
  year    = {2024},
  howpublished = {\url{https://arxiv.org/abs/2402.17944}}
}
```

> **Lưu ý**: Các entry còn thiếu thông tin tác giả/DOI (OFA-TAD, EMNLP 2025, Auto Monitoring Report, Contextual AD) sẽ được điền đầy đủ bằng cách tra arXiv/OpenReview/ScienceDirect khi thực thi. Trong plan này dùng placeholder để đảm bảo bibtex compile được.

---

## Phần 3 — Mở rộng [chuong1.tex](de_cuong_IUH/chapters/chuong1.tex)

### 3.1. Thêm 10 dòng vào Bảng `tab:related_work` (sau dòng 130, trước `\hline` cuối)

Đổi caption thành **"Tổng hợp các công trình nghiên cứu liên quan (2017--2026)"**. Thêm các dòng:

```latex
17 & Han et al.\ (2022) \cite{han2022adbench} & ADBench (30 thuật toán $\times$ 57 dataset) & Benchmark chuẩn cho tabular AD; chưa đánh giá LLM-based methods \\
\hline
18 & Schreyer et al.\ (2017) \cite{schreyer2017accounting_dae} & Deep Autoencoder cho dữ liệu kế toán & F1 32.93\% (dataset A); line-by-line, chưa batch \\
\hline
19 & Tsai et al.\ (2025) \cite{tsai2025anollm} & AnoLLM (serialize + NLL) & SOTA trên 6 mixed-type dataset; chi phí inference cao, chỉ output score \\
\hline
20 & Li et al.\ (2024) \cite{li2024llm_tabad} & GPT-4 zero-shot batch AD & Ngang SOTA trên ODDS; batch-level, không real-time per-row \\
\hline
21 & Zhao et al.\ (2025) \cite{zhao2025tadgp} & TAD-GP (prompt-guided LLM 7B) & F1 +79\% trên CICIDS2017; chỉ test cybersecurity \\
\hline
22 & OFA-TAD (2026) \cite{ofa_tad2026} & One-for-all cross-domain tabular AD & Tổng quát hoá đa domain; không tích hợp LLM report \\
\hline
23 & EMNLP 2025 \cite{emnlp2025_tabular_anomaly} & Benchmark AD + Reasoning + Report & Cung cấp metric đánh giá report; là benchmark, không phải phương pháp \\
\hline
24 & Auto Monitoring Report (2024) \cite{auto_monitoring_report_llm_kg2024} & LLM + Knowledge Graph sinh báo cáo & Giảm hallucination; phụ thuộc KG xây sẵn, không cho CSV thuần \\
\hline
25 & Contextual AD (2025) \cite{contextual_ad_tabular2025} & Conditional Wasserstein AE & Tốt hơn global AD trên 8 dataset; không tích hợp LLM \\
\hline
26 & Fang et al.\ (2024) \cite{fang2024llm_tabular_survey} & Survey LLM-on-Tabular (TMLR) & Taxonomy đầy đủ tới 2024; AD section ngắn, chưa sâu \\
\hline
```

### 3.2. Tái cấu trúc mục **"Nhận xét và khoảng trống nghiên cứu"** (dòng 134–146)

Đây là phần **quan trọng nhất** — nhiều "gap" cũ đã bị các paper 2024–2026 phủ một phần. Phải tinh chỉnh để gap còn lại thực sự đứng vững khi phản biện.

**Đánh giá lại từng gap hiện tại:**

| Gap hiện tại trong đề cương | Còn đứng vững? | Lý do |
|----------------------------|----------------|-------|
| (1) AD chỉ tabular HOẶC time-series, chưa có hệ thống xử lý cả hai với model router | **Đứng vững** | Không paper mới nào (AnoLLM, TAD-GP, OFA-TAD) giải quyết model router cho cả hai loại |
| (2) AD chưa liên kết với NLP sinh giải thích nghiệp vụ | **Phủ một phần** | EMNLP 2025 benchmark + Auto Monitoring Report đã làm phần báo cáo. **Phải tinh chỉnh** thành: "chưa có hệ thống tích hợp Ensemble AD → Evidence Packet → LLM fine-tune trên evidence packet" |
| (3) LLM tài chính không hỗ trợ tiếng Việt + cần tài nguyên lớn | **Đứng vững** | AnoLLM, TAD-GP đều English-only và cần GPU lớn |
| (4) Thiếu end-to-end platform CSV → AD → fix → report → PDF | **Bỏ — không phải research gap** | EMNLP 2025 đã đề cập end-to-end; phần "production on-premise SME-friendly đóng gói Docker" mang tính **engineering deliverable**, không phải khoảng trống khoa học. Giữ trong "Ý nghĩa thực tiễn" + Mục tiêu cụ thể #6, **không** liệt kê như research gap |

**Nội dung mới đề xuất** (thay dòng 136–146) — chỉ giữ 4 nhận xét khoa học thực sự:

```latex
Qua khảo sát 26 công trình tiêu biểu, có thể rút ra nhận xét sau:

\begin{enumerate}
  \item \textbf{Hai dòng nghiên cứu chưa hợp nhất:} Dòng AD truyền thống (ADBench, TranAD,
        USAD, DAGMM) cho kết quả mạnh nhưng chỉ xuất anomaly score. Dòng LLM-for-AD mới nổi
        (AnoLLM 2025, TAD-GP 2025, Li et al.\ 2024) tận dụng được kiến thức ngôn ngữ nhưng
        dùng LLM \textit{thay thế} model AD truyền thống, không phải \textit{kết hợp} với
        ensemble AD để cấp evidence cho LLM downstream.

  \item \textbf{Báo cáo tự động vẫn ở mức benchmark hoặc phụ thuộc Knowledge Graph:} EMNLP
        Findings 2025 cung cấp benchmark đánh giá khả năng LLM sinh báo cáo trên bảng nhưng
        không phải phương pháp triển khai. Hệ thống Auto-Monitoring Report via LLM+KG
        (ScienceDirect 2024) yêu cầu knowledge graph xây sẵn -- không khả thi cho CSV nghiệp
        vụ tổng quát.

  \item \textbf{Chưa có kiến trúc Model Router + Evidence Packet:} Không công trình nào
        thiết kế tầng trung gian \textit{định tuyến mô hình theo archetype dữ liệu} và sinh
        \textit{gói bằng chứng có cấu trúc} (score thành phần, top-$k$ SHAP, luật nghiệp vụ
        vi phạm, ngữ cảnh giao dịch) để fine-tune LLM downstream. Đây là phần "lớp keo" mà
        các paper LLM-for-AD bỏ ngỏ.

  \item \textbf{Thiếu fine-tune LLM song ngữ Việt--Anh cho báo cáo AD:} AnoLLM, TAD-GP và
        các LLM tài chính (FinMA, BloombergGPT) đều English-only. Chưa có công trình nào
        fine-tune LLM nhỏ (1.5--2B tham số) bằng LoRA cho bài toán sinh báo cáo AD song ngữ
        domain-specific.
\end{enumerate}
```

> **Ghi chú**: Khía cạnh **"đóng gói production Docker on-premise SME"** đã được chuyển từ "research gap" sang **"đóng góp về mặt thực tiễn"** (Mục 5.2 Ý nghĩa thực tiễn) và **Mục tiêu cụ thể #6** -- vì đây là yêu cầu kỹ thuật triển khai, không phải khoảng trống khoa học cần chứng minh.

### 3.3. Cập nhật Bảng `tab:direct_compare` (dòng 152–170)

Thay TranAD / FinMA / BloombergGPT (đã cũ) bằng **3 công trình mới gần đề tài nhất**: AnoLLM, TAD-GP, Auto-Monitoring Report. Giữ đề tài luận văn ở dòng cuối.

```latex
\begin{tabularx}{\textwidth}{|>{\raggedright\arraybackslash}p{2.8cm}|c|c|c|>{\centering\arraybackslash}X|}
\hline
\textbf{Hệ thống} & \textbf{Domain dữ liệu} & \textbf{Ngôn ngữ} & \textbf{On-prem SME?} & \textbf{Ensemble AD + LLM Report tích hợp?} \\
\hline
AnoLLM \cite{tsai2025anollm} & Mixed tabular & EN & Không (cần GPU lớn) & Không (LLM = scorer, không report) \\
\hline
TAD-GP \cite{zhao2025tadgp} & Cybersecurity tabular & EN & Khó (LLM 7B) & Không (chỉ AD, không report) \\
\hline
Auto Monitor Report \cite{auto_monitoring_report_llm_kg2024} & Monitoring data + KG & EN/CN & Không (cần KG stack) & Có nhưng cần KG, không cho CSV thuần \\
\hline
\textbf{Đề tài (CSV AI Platform)} & \textbf{CSV tổng quát} & \textbf{VI + EN} & \textbf{Có (1$\times$RTX 4090)} & \textbf{Có (Ensemble $\to$ Evidence $\to$ LLM)} \\
\hline
\end{tabularx}
```

Đoạn phân tích bên dưới (dòng 172–174) sẽ viết lại theo 3 công trình mới này.

### 3.4. Cập nhật mục **"Khoảng trống nghiên cứu mà luận văn giải quyết"** (dòng 176–181)

Còn **hai khoảng trống khoa học** (bỏ gap "production on-prem Docker" vì là engineering deliverable):

```latex
\textbf{Khoảng trống nghiên cứu mà luận văn giải quyết:}
\begin{itemize}
  \item Xây dựng tầng \textbf{Model Router + Evidence Packet} làm "lớp keo" giữa ensemble
        AD truyền thống và LLM sinh báo cáo -- phần chưa được khai thác bởi các công trình
        LLM-for-AD gần đây (AnoLLM, TAD-GP).
  \item Fine-tune \textbf{LLM nhỏ (1.5--2B tham số) bằng LoRA} để sinh báo cáo phát hiện
        bất thường \textbf{song ngữ Việt--Anh} -- hướng chưa được khám phá trong bối cảnh
        dữ liệu CSV nghiệp vụ tại Việt Nam.
\end{itemize}
```

---

## Phần 4 — Đồng bộ "hai khoảng trống" trong [mo_dau.tex](de_cuong_IUH/chapters/mo_dau.tex) (dòng 14–19)

Để khoảng trống ở Mở đầu khớp với Chương 1 đã tái cấu trúc (chỉ 2 gap khoa học, bỏ gap engineering):

```latex
Luận văn này giải quyết hai khoảng trống nghiên cứu chính:
\begin{enumerate}
  \item Các công trình LLM-for-AD mới (AnoLLM 2025, TAD-GP 2025) dùng LLM \textit{thay thế}
        mô hình AD truyền thống, \textbf{chưa kết hợp ensemble AD truyền thống với LLM sinh
        báo cáo} thông qua tầng \textit{evidence packet có cấu trúc} (Model Router + Evidence
        Packet làm lớp keo giữa Ensemble AD và LLM downstream).
  \item Các hệ thống sinh báo cáo tự động hiện có hoặc chỉ là benchmark đánh giá
        (EMNLP 2025), hoặc yêu cầu knowledge graph xây sẵn (Auto-Monitoring Report 2024);
        \textbf{chưa có công trình fine-tune LLM nhỏ (1.5--2B tham số) bằng LoRA sinh báo
        cáo phát hiện bất thường song ngữ Việt--Anh} cho dữ liệu CSV nghiệp vụ.
\end{enumerate}
```

> Lưu ý: phần "đóng gói Docker production on-premise cho SME 1 GPU 24GB" được giữ ở **Mục 5.2 Ý nghĩa thực tiễn** + **Mục tiêu cụ thể #6**, không liệt kê như khoảng trống nghiên cứu nữa.

---

---

## Phần 5 — Kiểm chứng (verify) "13 luật nghiệp vụ BĐS Singapore"

### 5.1. Phát hiện mâu thuẫn — "13 luật" thực tế ≠ "13 luật" user vừa cung cấp

**13 luật user liệt kê** là **chính sách quy định nhà nước Singapore** (regulatory framework):

| # | Luật | Cơ quan ban hành | Primary source |
|---|------|------------------|----------------|
| 1 | BSD — Buyer's Stamp Duty | IRAS | iras.gov.sg/.../buyers-stamp-duty |
| 2 | ABSD — Additional Buyer's Stamp Duty | IRAS | iras.gov.sg/.../additional-buyers-stamp-duty |
| 3 | SSD — Seller's Stamp Duty | IRAS | iras.gov.sg/.../selling-or-disposing-property |
| 4 | TDSR — Total Debt Servicing Ratio | MAS | MAS Notice 645 |
| 5 | MSR — Mortgage Servicing Ratio | MAS | mas.gov.sg/.../msr-and-tdsr-rules |
| 6 | LTV — Loan-to-Value Limits | MAS | mas.gov.sg/.../new-housing-loans |
| 7 | MOP — Minimum Occupation Period | HDB | hdb.gov.sg/.../selling-a-flat/eligibility |
| 8 | EIP — Ethnic Integration Policy | HDB | hdb.gov.sg/.../ethnic-integration-policy |
| 9 | SPR Quota | HDB | (cùng EIP) |
| 10 | 15-Month Wait-out Period (Private → HDB Resale) | MAS | MAS press release 30/09/2022 |
| 11 | Cash Down Payment Minimum | MAS | MAS Notice 632 |
| 12 | Loan Tenure Cap | MAS | MAS macroprudential page |
| 13 | Medium-Term Interest Rate Floor | MAS | MAS press release 30/09/2022 |

**13 luật thực tế đang implement** trong [csv_agent_platform/detection/configs/business_rules.yaml](csv_agent_platform/detection/configs/business_rules.yaml) là **luật vận hành dữ liệu của hệ thống môi giới Prosage/SNRE** (operational data-quality rules cho CRM môi giới), không phải regulatory framework:

| # | Section trong YAML | Loại luật |
|---|---|---|
| 1 | `field_types` (force_string/numeric/date) | Schema integrity |
| 2 | `required_fields` (theo transaction type) | Completeness |
| 3 | `constraints` (uniqueness, not-null) | Integrity |
| 4 | `price_status_rules` (active txn requires price) | Business logic |
| 5 | `commission_rules` (Closing + ICB + ECB = Gross; commission $\leq$ 10% price) | Commission formula |
| 6 | `entity_rules` (landlord/tenant fields min 1 filled) | Entity completeness |
| 7 | `company_classification` (PTE LTD/LLP/... suffixes + UEN) | Classification |
| 8 | `company_dedup` (normalize + duplicate check) | Deduplication |
| 9 | `agent_rules` (REG No `^R\d{4,6}[A-Z]$`, agent list match, ECB/Referral internal leakage) | Agent license |
| 10 | `address_rules` (postal code, column shift, duplicate address) | Address quality |
| 11 | `entity_resolution` (fuzzy name match $\geq$ 0.85, NRIC/UEN auto-merge) | Entity resolution |
| 12 | `json_array_rules` (cobrokers JSON consistency) | Format validation |
| 13 | `relationship_rules` (representing values, billing completeness, ICB/ECB/Referral commission required) | Cross-field |

→ **Không có luật nào trong 13 luật thực tế ánh xạ với BSD/ABSD/SSD/TDSR/MSR/LTV/MOP/EIP/SPR** mà user vừa cung cấp.

### 5.2. Reframing đúng bản chất — "13 luật" là **enterprise-customizable rules** (per-company)

Đọc kỹ [business_rules.yaml](csv_agent_platform/detection/configs/business_rules.yaml), mỗi rule đều có cấu trúc:
- `enabled: true/false` — bật/tắt theo enterprise.
- `severity: "ERROR" | "WARNING" | "INFO"` — mức độ cảnh báo do enterprise quyết.
- `threshold` / `tolerance` / `max_ratio` — ngưỡng số do enterprise tự định (ví dụ commission ≤ 10\% price, name similarity 0.85, commission tolerance \$1).
- Danh sách `valid_values` / `company_suffixes` / `valid_property_types` — enterprise có thể thêm/bớt.

→ **Đây là cấu trúc rule layer customizable per-enterprise**, không phải universal Singapore regulatory rules. Cách viết hiện tại "13 luật nghiệp vụ BĐS Singapore" gây hiểu nhầm — đúng phải là **"13 nhóm luật vận hành dữ liệu tuỳ biến theo doanh nghiệp (customizable enterprise data-quality rules)"**, với:
- **Format/pattern layer**: căn cứ trên chuẩn chính thức Singapore (CEA REG No, ACRA UEN, ICA NRIC, SingPost postal code, URA property taxonomy) — cố định, không tuỳ biến.
- **Business logic layer**: enterprise-customizable (commission formula, required fields, threshold, severity) — mỗi công ty môi giới (Prosage, SNRE, hoặc agency khác) có thể config khác nhau.

Reframing này **mạnh hơn nhiều** vì:
1. **Đúng bản chất** code đang implement (file YAML là config, không phải luật cứng).
2. **Generalization claim trở nên đúng**: framework áp dụng cho doanh nghiệp khác chỉ cần đổi YAML, không phải thay code.
3. **Định vị novelty**: "customizable rule layer + LLM downstream sinh báo cáo" là contribution rõ ràng, không bị hội đồng vặn "luật do agency tự định".
4. **Khớp với dòng nghiên cứu Data Cleaning** (Ilyas & Chu 2019, NADEEF, HoloClean) — các hệ thống đều có rule-config layer.

### 5.2.b. Kết quả kiểm tra dataset (cho khả thi PA-B)

Schema [property_cases_transactions_enriched.csv](property_cases_transactions_enriched.csv) (84.532 dòng) gồm 15 cột: `Transaction No, Block, Floor, Unit Number, Postal Code, Property Type, Transaction Date, Represented, Registration Number, Sale/Rental Type, Submission Date, Resubmission Date, Transaction Price, Status, Project Name`.

**Không có** các cột bắt buộc để áp dụng regulatory rules:
- ❌ `buyer_profile` (SC/PR/Foreigner) → không tính được ABSD
- ❌ `monthly_income`, `existing_debt`, `loan_amount` → không tính được TDSR/MSR/LTV
- ❌ `citizenship_status`, `MOP_status`, `ethnic_group` → không kiểm được EIP/SPR/MOP
- ❌ `holding_period` (buy-sell pair) → không tính được SSD

→ **PA-B không khả thi trên dataset hiện có**, chỉ còn PA-A là lựa chọn hợp lý. Tuy nhiên user đã đưa ra cách **PA-A nâng cấp** vượt xa mức "chỉ đổi tên" của tôi.

### 5.3. Phương án thực hiện — Enterprise-customizable rule layer + grounding 2 lớp

**Nguyên tắc**: Định vị 13 luật là **enterprise-customizable rule layer** với 2 tầng ground tách bạch:

- **Tầng cố định (Format/Pattern)** — căn cứ chuẩn Singapore: REG No format (CEA), UEN format (ACRA), NRIC format (ICA), postal code (SingPost/SLA), property type (URA REALIS), company suffix (Companies Act). Các pattern này **không tuỳ biến** vì là chuẩn quốc gia.
- **Tầng tuỳ biến (Business Logic)** — căn cứ lý thuyết database: threshold commission, severity, required fields, fuzzy matching threshold, tolerance. Các giá trị mặc định theo Prosage/SNRE; **mỗi doanh nghiệp khác có thể override qua YAML config**. Tầng này grounded bằng CFD (Fan 2008), Denial Constraints (Chu 2013, Pena 2019), Entity Resolution (Christen 2012, Papadakis 2021).

Cách này biến "rule do agency tự định" thành **"customizable rule framework với format layer căn cứ chuẩn quốc gia Singapore + business logic layer căn cứ database theory"** — đây là một contribution khoa học rõ ràng.

#### 5.3.A — Mapping 13 luật với Singapore Primary Sources (regulator định nghĩa pattern)

| Rule YAML | Pattern/Logic | Primary source định nghĩa pattern | Citation |
|-----------|---------------|----------------------------------|----------|
| #1 `field_types` (UEN as string) | UEN format `nnnnnnnnX` / `yyyynnnnnX` / `Tyy*PQnnnnX` | **ACRA UEN spec** + BizFile+ | uen.gov.sg, bizfile.gov.sg |
| #6 `entity_rules` (landlord/tenant NRIC) | NRIC format `[STFG]\d{7}[A-Z]` | **ICA — National Registration Act (Cap. 201)** | ica.gov.sg, NRA1965 |
| #7 `company_classification` (PTE LTD / LLP suffix) | Suffix theo Companies Act Sec 27–28 | **ACRA Naming Guidelines + Companies Act 1967** | acra.gov.sg, CoA1967 |
| #8 `company_dedup` | Normalize Pte Ltd variants | (như #7) | (như #7) |
| #9 `agent_rules.reg_no_format` `^R\d{4,6}[A-Z]$` | CEA salesperson license format | **CEA Estate Agents Act 2010 + Public Register** | cea.gov.sg, EAA2010 |
| #9 `agent_rules.ecb_internal_leakage` | ICB vs ECB co-broking | **CEA Co-broking Guidelines + Code of Ethics** | cea.gov.sg co-broking-guidelines |
| #10 `address_rules.postal_pattern` `\d{6}` | Postal code 6-digit, sector encoding | **SingPost + OneMap (SLA)** | singpost.com, onemap.gov.sg |
| #10 `address_rules.column_shift_detection` (valid property types) | Industrial/Apartment/HDB/Landed/... | **URA Master Plan + REALIS taxonomy** | ura.gov.sg/realis |
| #11 `entity_resolution` (NRIC/UEN/email auto-merge) | Định danh duy nhất theo ICA/ACRA | (như #1, #6) | (như #1, #6) |

**Các rule chưa map primary source Singapore** (purely operational, không có regulator nào định nghĩa):
- #2 `required_fields` (theo transaction type) — internal Prosage/SNRE schema
- #3 `constraints` (uniqueness `file_number`) — internal
- #4 `price_status_rules` (active txn requires price) — internal accounting
- #5 `commission_rules` (Closing + ICB + ECB = Gross; ratio ≤ 10%) — internal commission policy
- #12 `json_array_rules` (cobrokers JSON consistency) — internal data format
- #13 `relationship_rules` (representing values, billing completeness) — internal CRM logic

→ **6/13 rules** có primary source Singapore (43%), **7/13 rules** là pure operational không cần regulatory citation.

#### 5.3.B — Mapping 13 luật với academic Q1/A\* citations (database theory)

| Rule YAML | Cite vào lý thuyết nào | Citation |
|-----------|------------------------|----------|
| All 13 | Data Cleaning textbook (toàn bộ khung) | Ilyas & Chu (2019) *Data Cleaning*, ACM Books, DOI 10.1145/3310205 |
| #1, #3, #11 | Profile/discover rules từ data | Abedjan, Golab, Naumann (2015) *Profiling Relational Data*, VLDB Journal 24(4), DOI 10.1007/s00778-015-0389-y |
| #2, #13 | Conditional Functional Dependencies | Fan, Geerts, Jia, Kementsietsidis (2008) *CFDs for Capturing Data Inconsistencies*, ACM TODS 33(2):6 |
| #4, #5, #13 | Denial Constraints | Chu, Ilyas, Papotti (2013) *Discovering Denial Constraints*, PVLDB 6(13) |
| All multi-constraint | Holistic cleaning | Chu, Ilyas, Papotti (2013) *Holistic Data Cleaning*, ICDE 2013 |
| #5 (tolerance) | Approximate DC | Pena, Almeida, Naumann (2019) *Approximate (and Exact) Denial Constraints*, PVLDB 13(3) |
| System architecture | Rule-based cleaning system | Dallachiesa et al. (2013) *NADEEF*, SIGMOD 2013 |
| ML + rules hybrid | Probabilistic repair | Rekatsinas, Chu, Ilyas, Ré (2017) *HoloClean*, PVLDB 10(11) |
| #11, #8 | Entity Resolution textbook | Christen (2012) *Data Matching*, Springer DOI 10.1007/978-3-642-31164-2 |
| #11 fuzzy 0.85 | State-of-the-art ER | Papadakis et al. (2021) *The Four Generations of Entity Resolution*, Morgan & Claypool |
| Toàn pipeline | Rule-based + AD trên tabular | Senaratne et al. (2023) *Rule-Based Knowledge Discovery via AD*, AAAI-MAKE 2023 (RULEAD) |
| LoRA + rules approach | LLM-driven quality rules | Akella & Narayanam (2025) *Quality Assessment of Tabular Data using LLMs and Code Generation*, arXiv:2509.10572 (IBM) |
| Report from rule violations | Top-k insights | Akella et al. (2025) *Tab-Shapley*, AAAI 2025, arXiv:2501.06685 |

→ **Akella & Narayanam (2025)** là paper gần nhất với approach của luận văn — phải cite làm related work then chốt.

### 5.4. Khuyến nghị

Phương án **"Enterprise-customizable rule layer + grounding 2 tầng"** là tốt nhất vì:
- **Đúng bản chất code**: YAML là config customizable, không phải luật cứng.
- **Generalization claim đứng vững**: framework áp dụng cho doanh nghiệp khác chỉ cần đổi YAML, không phải thay code — đây là cốt lõi đóng góp thực tiễn.
- **Không phá vỡ kết quả** F1=0.881, AUC=0.995.
- **Định vị novelty rõ ràng**: customizable rule layer + LLM downstream sinh báo cáo — gap mà AnoLLM/TAD-GP/Auto-Monitoring Report chưa giải quyết.
- **Grounded vững chắc**: tầng format chính thức Singapore (CEA/ACRA/ICA/SingPost/URA) + tầng business logic theo database theory (Ilyas/Chu, CFD, DC, HoloClean, Akella 2025).

### 5.5. Sửa đổi cụ thể

**Trong [mo_dau.tex](de_cuong_IUH/chapters/mo_dau.tex) dòng 41**:
```
... gán nhãn pseudo-label theo 13 luật nghiệp vụ ...
```
→
```
... gán nhãn pseudo-label theo 13 nhóm luật vận hành dữ liệu \textit{tuỳ biến theo doanh
nghiệp} (customizable enterprise data-quality rules), gồm hai tầng: (i) tầng \textit{format
và định danh} căn cứ chuẩn chính thức Singapore -- CEA (REG No salesperson), ACRA
(UEN, company suffix), ICA (NRIC), SingPost/SLA (postal code), URA (property type
taxonomy); và (ii) tầng \textit{business logic} căn cứ lý thuyết Conditional Functional
Dependencies và Denial Constraints, với giá trị mặc định theo nghiệp vụ Prosage/SNRE và
hoàn toàn override được qua tệp YAML config khi triển khai cho doanh nghiệp khác. Các
quy định nhà nước về thuế và macroprudential (BSD/ABSD/TDSR/MSR/LTV/MOP/EIP) nằm ngoài
phạm vi vì dataset hiện tại không có các trường buyer profile, income, loan amount,
holding period cần thiết.
```

**Trong [chuong3.tex](de_cuong_IUH/chapters/chuong3.tex) dòng 46** (mô tả 13 luật):
```
\textbf{13 luật nghiệp vụ BĐS}: Các luật được thiết kế bởi chuyên gia nghiệp vụ, ví dụ:
hoa hồng vượt ngưỡng 15\%, invoice không khớp transaction, agent có velocity bất thường ...
```
→
```
\textbf{13 nhóm luật vận hành dữ liệu tuỳ biến theo doanh nghiệp (customizable
enterprise data-quality rules)} được tổ chức thành 2 tầng và căn cứ trên chuẩn chính
thức Singapore cùng lý thuyết database:
\begin{itemize}
  \item Schema integrity và định danh: UEN format theo ACRA \cite{acra_uen2024,
        acra_companies_act1967}, NRIC theo ICA \cite{ica_nric2024}, postal code theo
        SingPost/SLA OneMap \cite{singpost2024, sla_onemap2024}, property type taxonomy
        theo URA REALIS \cite{ura_realis2024}.
  \item Agent license: REG No format \texttt{R\textbackslash{}d\{4,6\}[A-Z]} theo CEA
        Estate Agents Act 2010 \cite{cea_eaa2010, cea_public_register}; phân biệt ICB/ECB
        theo CEA Co-broking Guidelines \cite{cea_cobroking}.
  \item Commission formula, completeness và cross-field rules: thiết kế theo thực tế
        nghiệp vụ Prosage/SNRE, áp dụng khung lý thuyết Conditional Functional Dependencies
        \cite{fan2008cfd} và Denial Constraints \cite{chu2013dc, chu2013holistic,
        pena2019approximate}.
  \item Entity resolution: fuzzy matching threshold 0.85 theo Christen
        \cite{christen2012datamatching} và Papadakis et al.\ \cite{papadakis2021er}.
\end{itemize}
Toàn bộ khung rule-based được đặt trong dòng nghiên cứu \textit{Data Cleaning}
\cite{ilyas2019datacleaning, abedjan2015profiling}, các hệ thống tham chiếu (NADEEF
\cite{dallachiesa2013nadeef}, HoloClean \cite{rekatsinas2017holoclean}), và các công
trình gần nhất về rule-based AD + LLM cho tabular data (RULEAD \cite{senaratne2023rulead},
Akella \& Narayanam \cite{akella2025quality}, Tab-Shapley \cite{akella2025tabshapley}).

\textit{Pipeline tuỳ biến rule cho doanh nghiệp (Custom Rule Pipeline):} Hệ thống cung cấp
ba mức tuỳ biến cho mỗi doanh nghiệp khách hàng:
\begin{enumerate}
  \item \textbf{Config-level} -- override tham số có sẵn (\texttt{enabled}, \texttt{severity},
        \texttt{threshold}, \texttt{tolerance}, \texttt{valid\_values}) qua tệp
        \texttt{business\_rules.yaml} upload qua web UI hoặc REST API.
  \item \textbf{Rule-level} -- thêm \textit{custom rule mới} bằng cú pháp YAML (column, type,
        condition, severity); hệ thống validate cú pháp, sinh code rule check tương ứng và
        thêm vào pipeline mà không cần restart service.
  \item \textbf{Model-level} -- kích hoạt \textit{re-training pipeline}: pseudo-label được
        sinh lại trên dataset CSV của doanh nghiệp theo bộ rule custom, ensemble và LLM
        được fine-tune (LoRA adapter riêng cho từng tenant) để phát hiện và sinh báo cáo
        phù hợp với nghiệp vụ đặc thù của doanh nghiệp đó.
\end{enumerate}
Khả năng này biến hệ thống thành \textit{Anomaly-Detection-as-a-Service} cho dữ liệu CSV
nghiệp vụ -- mỗi doanh nghiệp có rule + model riêng, dùng chung kiến trúc.
```

**Trong [chuong1.tex](de_cuong_IUH/chapters/chuong1.tex)** — bổ sung 1 mục mới sau Section "Tổng quan bài toán phát hiện bất thường":

```latex
\subsection{Bối cảnh thị trường BĐS Singapore và khung pháp lý liên quan}

Thị trường BĐS Singapore chịu sự điều tiết của các cơ quan chuyên trách. Liên quan trực
tiếp đến \textit{định danh và format dữ liệu giao dịch} mà 13 luật của luận văn áp dụng:
CEA (Council for Estate Agencies) quản lý license salesperson theo Estate Agents Act 2010
\cite{cea_eaa2010, cea_public_register}; ACRA quản lý UEN và quy ước đặt tên công ty theo
Companies Act 1967 \cite{acra_uen2024, acra_companies_act1967}; ICA quản lý NRIC theo
National Registration Act \cite{ica_nric2024}; SingPost và SLA định nghĩa postal code
6 chữ số \cite{singpost2024, sla_onemap2024}; URA cung cấp taxonomy property type qua
REALIS \cite{ura_realis2024}.

Đối với quy định \textit{tài chính-thuế} (BSD, ABSD, SSD do IRAS; TDSR, MSR, LTV, loan
tenure, stress-test floor do MAS; MOP, EIP, SPR quota do HDB) — các quy định này được đề
cập làm \textbf{bối cảnh} giải thích đặc tính dữ liệu (ví dụ: ABSD foreigner 60\% từ
27/04/2023 dẫn tới sụt giảm giao dịch foreigner) chứ \textbf{không} được implement thành
rule-check vì dataset hiện tại không có các cột buyer profile, monthly income, loan amount,
holding period cần thiết. Tác động định lượng của các chính sách này lên giá BĐS đã được
phân tích bởi Deng et al.\ \cite{deng2014macroprudential}, Wong \cite{wong2020macroprudential},
Phang \& Helble \cite{phang2016housing}, Agarwal et al.\ \cite{agarwal2020tax} và
IMF Country Reports \cite{imf_singapore}.
```

**Bổ sung BibTeX vào [refs/references.bib](de_cuong_IUH/refs/references.bib)** — gộp **2 cụm**: (a) Singapore primary sources cho 13 rules + (b) Singapore macroprudential context + (c) academic database theory:

```bibtex
% ---- Singapore Primary Sources (define formats used in 13 operational rules) ----

@misc{cea_eaa2010,
  author = {{Council for Estate Agencies, Singapore}},
  title = {Estate Agents Act 2010},
  year = {2010},
  howpublished = {\url{https://sso.agc.gov.sg/Act/EAA2010}}
}

@misc{cea_public_register,
  author = {{Council for Estate Agencies, Singapore}},
  title = {Public Register of Salespersons},
  year = {2024},
  howpublished = {\url{https://www.cea.gov.sg/aceas/public-register/salesperson/1}}
}

@misc{cea_cobroking,
  author = {{Council for Estate Agencies, Singapore}},
  title = {Co-broking Guidelines and Code of Ethics},
  year = {2024},
  howpublished = {\url{https://www.cea.gov.sg/professionals/estate-agent-work/practice-guidelines}}
}

@misc{acra_uen2024,
  author = {{Accounting and Corporate Regulatory Authority, Singapore}},
  title = {Unique Entity Number ({UEN}) Format Specification},
  year = {2024},
  howpublished = {\url{https://www.uen.gov.sg/ueninternet/faces/pages/admin/aboutUEN.jspx}}
}

@misc{acra_companies_act1967,
  author = {{Government of Singapore}},
  title = {Companies Act 1967 (Sections 27--28: Company Naming)},
  year = {1967},
  howpublished = {\url{https://sso.agc.gov.sg/Act/CoA1967}}
}

@misc{ica_nric2024,
  author = {{Immigration and Checkpoints Authority, Singapore}},
  title = {National Registration Act ({NRIC}/{FIN} Format) (Cap. 201)},
  year = {1965},
  howpublished = {\url{https://sso.agc.gov.sg/Act/NRA1965}}
}

@misc{singpost2024,
  author = {{Singapore Post Limited}},
  title = {Singapore Postal Code Format and Sector Classification},
  year = {2024},
  howpublished = {\url{https://www.singpost.com/find-postal-code}}
}

@misc{sla_onemap2024,
  author = {{Singapore Land Authority}},
  title = {{OneMap} {API} -- Authoritative Geocoding Service},
  year = {2024},
  howpublished = {\url{https://www.onemap.gov.sg/apidocs/apidocs}}
}

@misc{ura_realis2024,
  author = {{Urban Redevelopment Authority, Singapore}},
  title = {Real Estate Information System ({REALIS}) -- Property Type Taxonomy},
  year = {2024},
  howpublished = {\url{https://www.ura.gov.sg/realis}}
}

% ---- Singapore Macroprudential & Tax Framework (context only) ----

@misc{iras2024,
  author = {{Inland Revenue Authority of Singapore}},
  title = {Stamp Duty for Property ({BSD}, {ABSD}, {SSD})},
  year = {2024},
  howpublished = {\url{https://www.iras.gov.sg/taxes/stamp-duty/for-property}}
}

@misc{mas2024macroprudential,
  author = {{Monetary Authority of Singapore}},
  title = {Macroprudential Policies in {Singapore}},
  year = {2024},
  howpublished = {\url{https://www.mas.gov.sg/publications/macroprudential-policies-in-singapore}}
}

@misc{mas_notice645,
  author = {{Monetary Authority of Singapore}},
  title = {Notice 645 -- Computation of Total Debt Servicing Ratio for Property Loans},
  year = {2024},
  howpublished = {\url{https://www.mas.gov.sg/regulation/notices/notice-645}}
}

@misc{hdb2024,
  author = {{Housing and Development Board, Singapore}},
  title = {Eligibility, {MOP}, {EIP} and {SPR} Quota Policies},
  year = {2024},
  howpublished = {\url{https://www.hdb.gov.sg/residential}}
}

@article{deng2014macroprudential,
  author = {Deng, Yongheng and Liao, Wen-Chi and Sing, Tien Foo},
  title = {Macroprudential Policy and Its Impact on the {Singapore} Private Residential Property Market},
  journal = {Journal of Real Estate Finance and Economics},
  year = {2018},
  doi = {10.1007/s11146-018-9669-9}
}

@article{wong2020macroprudential,
  author = {Wong, Wing-Keung},
  title = {Macroprudential Measures and the Housing Market: The {Singapore} Experience},
  journal = {Journal of Asian Economics},
  volume = {70},
  pages = {101230},
  year = {2020}
}

@techreport{phang2016housing,
  author = {Phang, Sock-Yong and Helble, Matthias},
  title = {Housing Policies in {Singapore}},
  institution = {Asian Development Bank Institute},
  number = {ADBI Working Paper Series No. 559},
  year = {2016}
}

@article{agarwal2020tax,
  author = {Agarwal, Sumit and Li, Keyang and Qin, Yu and Wu, Jing and Yan, Jubo},
  title = {Tax Evasion, Capital Gains Taxes, and the Housing Market},
  journal = {Journal of Public Economics},
  volume = {188},
  pages = {104222},
  year = {2020}
}

@misc{imf_singapore,
  author = {{International Monetary Fund}},
  title = {{Singapore}: {IMF} Country Reports},
  year = {2024},
  howpublished = {\url{https://www.imf.org/en/Countries/SGP}}
}

% ---- Database Theory & Data Cleaning (academic grounding for 13 rules) ----

@book{ilyas2019datacleaning,
  author = {Ilyas, Ihab F. and Chu, Xu},
  title = {Data Cleaning},
  publisher = {ACM Books / Morgan \& Claypool},
  year = {2019},
  doi = {10.1145/3310205}
}

@article{abedjan2015profiling,
  author = {Abedjan, Ziawasch and Golab, Lukasz and Naumann, Felix},
  title = {Profiling Relational Data: A Survey},
  journal = {The VLDB Journal},
  volume = {24},
  number = {4},
  pages = {557--581},
  year = {2015},
  doi = {10.1007/s00778-015-0389-y}
}

@article{fan2008cfd,
  author = {Fan, Wenfei and Geerts, Floris and Jia, Xibei and Kementsietsidis, Anastasios},
  title = {Conditional Functional Dependencies for Capturing Data Inconsistencies},
  journal = {ACM Transactions on Database Systems},
  volume = {33},
  number = {2},
  pages = {6:1--6:48},
  year = {2008},
  doi = {10.1145/1366102.1366103}
}

@article{chu2013dc,
  author = {Chu, Xu and Ilyas, Ihab F. and Papotti, Paolo},
  title = {Discovering Denial Constraints},
  journal = {Proceedings of the VLDB Endowment},
  volume = {6},
  number = {13},
  pages = {1498--1509},
  year = {2013},
  doi = {10.14778/2536274.2536293}
}

@inproceedings{chu2013holistic,
  author = {Chu, Xu and Ilyas, Ihab F. and Papotti, Paolo},
  title = {Holistic Data Cleaning: Putting Violations into Context},
  booktitle = {Proceedings of the 29th IEEE International Conference on Data Engineering (ICDE)},
  pages = {458--469},
  year = {2013},
  doi = {10.1109/ICDE.2013.6544847}
}

@article{pena2019approximate,
  author = {Pena, Eduardo H. M. and de Almeida, Eduardo Cunha and Naumann, Felix},
  title = {Discovery of Approximate (and Exact) Denial Constraints},
  journal = {Proceedings of the VLDB Endowment},
  volume = {13},
  number = {3},
  pages = {266--278},
  year = {2019},
  doi = {10.14778/3368289.3368293}
}

@inproceedings{dallachiesa2013nadeef,
  author = {Dallachiesa, Michele and Ebaid, Amr and Eldawy, Ahmed and Elmagarmid, Ahmed and Ilyas, Ihab F. and Ouzzani, Mourad and Tang, Nan},
  title = {{NADEEF}: A Commodity Data Cleaning System},
  booktitle = {Proceedings of the ACM SIGMOD International Conference on Management of Data},
  pages = {541--552},
  year = {2013},
  doi = {10.1145/2463676.2465327}
}

@article{rekatsinas2017holoclean,
  author = {Rekatsinas, Theodoros and Chu, Xu and Ilyas, Ihab F. and R{\'e}, Christopher},
  title = {{HoloClean}: Holistic Data Repairs with Probabilistic Inference},
  journal = {Proceedings of the VLDB Endowment},
  volume = {10},
  number = {11},
  pages = {1190--1201},
  year = {2017},
  doi = {10.14778/3137628.3137631}
}

@book{christen2012datamatching,
  author = {Christen, Peter},
  title = {Data Matching: Concepts and Techniques for Record Linkage, Entity Resolution, and Duplicate Detection},
  publisher = {Springer},
  year = {2012},
  doi = {10.1007/978-3-642-31164-2}
}

@book{papadakis2021er,
  author = {Papadakis, George and Ioannou, Ekaterini and Thanos, Emmanouil and Palpanas, Themis},
  title = {The Four Generations of Entity Resolution},
  publisher = {Morgan \& Claypool},
  year = {2021},
  doi = {10.2200/S01067ED1V01Y202012DTM064}
}

@inproceedings{senaratne2023rulead,
  author = {Senaratne, Anushka and Christen, Peter and Williams, Graham and Omran, Pouya Ghiasnezhad},
  title = {Rule-Based Knowledge Discovery via Anomaly Detection in Tabular Data},
  booktitle = {AAAI-MAKE 2023 Spring Symposium},
  year = {2023},
  howpublished = {\url{https://ceur-ws.org/Vol-3433/paper13.pdf}}
}

@article{akella2025quality,
  author = {Akella, Anantha and Narayanam, Krishnasuri},
  title = {Quality Assessment of Tabular Data using Large Language Models and Code Generation},
  journal = {arXiv preprint arXiv:2509.10572},
  year = {2025},
  howpublished = {\url{https://arxiv.org/abs/2509.10572}}
}

@inproceedings{akella2025tabshapley,
  author = {Akella, Anantha and others},
  title = {{Tab-Shapley}: Identifying Top-$k$ Tabular Data Quality Insights},
  booktitle = {Proceedings of the AAAI Conference on Artificial Intelligence},
  year = {2025},
  howpublished = {\url{https://arxiv.org/abs/2501.06685}}
}
```

**Tổng kết bổ sung BibTeX**:
- 10 entry mới từ [new_ref/](de_cuong_IUH/new_ref/) (LLM + tabular AD).
- 9 entry Singapore primary sources (CEA, ACRA, ICA, SingPost, SLA, URA, IRAS, MAS, HDB).
- 5 entry Singapore macroprudential context (Deng, Wong, Phang, Agarwal, IMF).
- 13 entry database theory & data cleaning (Ilyas, Abedjan, Fan, Chu × 2, Pena, NADEEF, HoloClean, Christen, Papadakis, RULEAD, Akella × 2).

→ Tổng **37 entry mới**, nâng `references.bib` từ ~32 lên ~69 entry — đủ điều kiện "$\geq$ 30 công trình tham khảo" và đa dạng nguồn Q1/A\*.

---

## Verification

1. **Compile LaTeX** (3 lần để bibtex + toc cập nhật):
   ```bash
   cd de_cuong_IUH && rm -f main.aux main.toc main.lof main.lot main.out main.bbl main.blg \
     && xelatex main.tex && bibtex main && xelatex main.tex && xelatex main.tex
   ```
   - Kỳ vọng: `main.pdf` compile thành công, không có `Citation undefined` cho 10 key mới.
   - Mục "2. Mục tiêu nghiên cứu" không còn ký tự `→`.
   - Bảng `tab:related_work` có 26 dòng đánh số liên tục.
   - Bảng `tab:direct_compare` có 4 dòng (AnoLLM, TAD-GP, Auto Monitor Report, Đề tài).

2. **Đối chiếu nhất quán 3 nơi cùng nói về khoảng trống**:
   - `mo_dau.tex` dòng 14–19 (**2 khoảng trống** ở Đặt vấn đề).
   - `chuong1.tex` đoạn "Nhận xét và khoảng trống" (**4 nhận xét** khoa học).
   - `chuong1.tex` đoạn "Khoảng trống nghiên cứu mà luận văn giải quyết" (**2 gap** luận văn giải quyết).
   - **Kiểm tra**: 2 gap ở Mở đầu phải khớp với 2 gap ở cuối Chương 1. Phần "production on-prem Docker" chỉ xuất hiện ở 5.2 Ý nghĩa thực tiễn và Mục tiêu cụ thể #6, không xuất hiện trong bất kỳ danh sách "khoảng trống nghiên cứu" nào.

3. **Đối chiếu với 6 mục tiêu cụ thể** (Mở đầu): mỗi gap khoa học phải có ít nhất một mục tiêu giải quyết.
   - Gap 1 (Ensemble + Evidence Packet + LLM) → Mục tiêu #4, #5.
   - Gap 2 (LoRA song ngữ Việt-Anh) → Mục tiêu #5.
   - Mục tiêu #6 (Production Docker on-premise) là deliverable engineering, không gắn với gap khoa học.

4. **Tra cứu thông tin BibTeX còn thiếu**: với các paper chưa có đầy đủ tác giả/DOI/volume (OFA-TAD, EMNLP 2025, Auto Monitoring Report, Contextual AD), tra arXiv / OpenReview / ScienceDirect và điền chính xác trước khi nộp.

5. **Đọc lại mục lục** sau compile: các bảng và section phải nằm đúng vị trí, không vỡ trang.
