# PLAN ĐÁNH GIÁ CHI TIẾT V10 — THEO PATTERN LUẬN VĂN THẠC SĨ IUH

**Nguồn tham chiếu chấm điểm:** `final_project_ai/pattent_luan_van/pattern_cham_diem_luan_van_thac_si_iuh.md`
**Artifact review:** `detection/notebooks/v10_detection_result.ipynb`, `detection/outputs/working_v10/` (v10_results.csv, v10_artifacts.json, v10_diagnostics.png, v10_attention_heatmap.png)
**Phiên bản code train:** `detection/notebooks/train_detection_v10.py`

---

## 0. TÓM TẮT KẾT QUẢ V10 (snapshot để chấm)

| Model | Loại | F1_test | ROC_AUC_test | PR_AUC_test | Target F1 | Gate |
|---|---|---:|---:|---:|---:|:---:|
| A2_DAE+Mahal      | Unsupervised  | 0.3911 | 0.9530 | 0.3560 | 0.50 | ✗ FAIL |
| A10_AttnBiLSTM-AE | Unsupervised  | 0.4231 | 0.9529 | 0.4182 | 0.50 | ✗ FAIL |
| A11_BiLSTM-Cls    | Semi-sup.     | 0.7640 | 0.9914 | 0.8568 | 0.60 | ✓ PASS |
| A7_XGB-CLEAN      | Supervised    | 0.8808 | 0.9946 | 0.9317 | 0.85 | ✓ PASS |
| A12_Ensemble (LR) | Stacking      | 0.8476 | 0.9964 | 0.8719 | 0.85 | ✗ FAIL (marginal, Δ = −0.0024) |

**Kiến trúc ensemble:** `dae_mahal + bilstm_cls + xgb_clean` (A10 bị exclude khỏi meta-learner).
**Threshold cố định từ val:** DAE=0.0779, AttnBiLSTM=0.000984, BiLSTM-Cls=0.9816, XGB=0.8318, Ensemble=0.9743.
**Feature order:** 50 chiều đã được hoán vị theo nhóm ngữ nghĩa (Financial → Business Rule → Frequency → Temporal) → hỗ trợ A10 attention.

**Kết luận sơ bộ:** chỉ 2/5 model đạt gate Phase 2. A12 rớt sát biên → cần chạy lại seed hoặc nới target 0.84.

---

## I. HÌNH THỨC & CẤU TRÚC (15đ) — Target ≥ 12/15

> Phần này chấm cho tài liệu luận văn cuối, nhưng vẫn có tiêu chí map được vào artifact v10.

| Sub | Tiêu chí | Áp dụng cho v10 | Dự kiến |
|---|---|---|---:|
| 1.1–1.3 | Trang bìa, các trang bắt buộc, danh mục | Chưa có (thuộc về bản thảo luận văn) | — |
| 1.4 | Trình bày bảng/hình/công thức | ✓ `v10_results.csv` đầy đủ, `v10_diagnostics.png` + `v10_attention_heatmap.png` có caption trong notebook. Cần kiểm: mọi bảng trong notebook đã có header/đơn vị; hình có chú thích dưới cell markdown | 3.5/4 |
| 1.5 | Lý lịch | Thuộc bản luận văn | — |
| 1.6 | Cân đối chương | N/A cho v10 |  — |

**Action:** khi viết Chương 3 (Thực nghiệm), copy nguyên bảng v10_results.csv + 2 ảnh PNG, đánh số `Bảng 3.x`, `Hình 3.x` và mô tả 1 đoạn mỗi hình.

---

## II. MỞ ĐẦU (15đ) — Target ≥ 12/15

| Sub | Tiêu chí | Evidence từ v10 | Gap | Dự kiến |
|---|---|---|---|---:|
| 2.1 Đặt vấn đề (3đ) | Tính cấp thiết | Bài toán anomaly detection cho CSV agent platform; proxy/baseline cũ (V1-V9) không ổn định | Cần trích dẫn số liệu thực tế tỷ lệ CSV lỗi trong production | 2/3 |
| 2.2 Mục tiêu (3đ) | Mục tiêu cụ thể, đo được | ✓ Notebook đã khai báo target F1 rõ cho từng model (0.50/0.60/0.85) và "PASS → Phase 2" | — | 3/3 |
| 2.3 Đối tượng & phạm vi (2đ) | Dataset CSV đặc thù platform, 50 features, 98 anomaly test | Cần ghi rõ phạm vi: KHÔNG xử lý time-series streaming | 1.5/2 |
| 2.4 PP nghiên cứu (3đ) | Literature + thực nghiệm + môi trường | Notebook nêu 3 hướng: reconstruction, sequential attention, supervised. Cần liệt kê HW (Kaggle GPU), framework (PyTorch/XGBoost) | 2.5/3 |
| 2.5 Ý nghĩa thực tiễn (2đ) | A7 và A11 đã đạt gate → sẵn sàng migrate sang `csv_agent_services` | Cần đo latency inference | 1.5/2 |
| 2.6 Phạm vi & cấu trúc (2đ) | Cấu trúc pipeline V1→V11 đã rõ | Viết lại cho bản luận văn | 1.5/2 |

**Dự kiến tổng: ~11.5–12/15.**
**Action:** bổ sung phần "Giới hạn" nêu rõ `A10 AttnBiLSTM-AE` không dùng cho production (FAIL gate) nhưng giữ làm đóng góp interpretability.

---

## III. CƠ SỞ LÝ THUYẾT / TỔNG QUAN (15đ) — Target ≥ 11/15

| Sub | Tiêu chí | Evidence | Gap | Dự kiến |
|---|---|---|---|---:|
| 3.1 Tổng quan (5đ) | So sánh với NN, Isolation Forest, Autoencoder, LSTM-AE, XGBoost anomaly | Notebook chỉ so nội bộ V9 → V10 | Cần thêm 8–10 paper (2020–2025) về tabular anomaly (TabNet, DeepSVDD, ECOD, PyOD) | 3/5 |
| 3.2 Cơ sở lý thuyết (5đ) | DAE, Mahalanobis distance, BiLSTM, Multi-head attention, XGBoost, Stacking LR | v10 dùng đủ 5 khối lý thuyết trên | Cần viết công thức MSE loss, Mahalanobis Σ⁻¹, softmax attention | 4/5 |
| 3.3 Công cụ (2đ) | PyTorch, XGBoost, scikit-learn, pandas, matplotlib | ✓ `v10_artifacts.json` liệt kê model type | Giải thích lý do chọn PyTorch > TF | 1.5/2 |
| 3.4 Chất lượng tham khảo (3đ) | — | Chưa có reference list | Cần ≥ 20 ref, ≥ 50% trong 5 năm | 1.5/3 |

**Dự kiến tổng: ~10/15.**
**Action bắt buộc:** xây `references.bib` với tối thiểu DAE (Vincent 2010), BiLSTM (Schuster 1997/Graves 2005), Attention (Vaswani 2017), XGBoost (Chen 2016), Mahalanobis Anomaly (Rousseeuw 1999), Isolation Forest (Liu 2008), PyOD (Zhao 2019), ECOD (Li 2022), TabNet (Arik 2021).

---

## IV. PHƯƠNG PHÁP / MÔ HÌNH ĐỀ XUẤT (20đ) — Target ≥ 16/20

| Sub | Tiêu chí | Evidence từ v10 | Dự kiến |
|---|---|---|---:|
| 4.1.1 Mô tả kiến trúc (2đ) | ✓ 5 nhánh độc lập + meta-learner, mô tả rõ trong notebook §1 | 2/2 |
| 4.1.2 Sơ đồ kiến trúc (2đ) | ✗ Chưa có architecture diagram (chỉ có bảng markdown) | 1/2 |
| 4.1.3 Giải thích module (2đ) | ✓ Từng model có input_dim/latent_dim/hidden/heads trong `v10_artifacts.json` | 2/2 |
| 4.1.4 Tính mới (2đ) | ✓ **Feature-as-sequence** cho A10 (tabular → pseudo-sequence qua semantic ordering) — đây là đóng góp chính của v10. Cần nhấn mạnh | 2/2 |
| 4.2.1 Thu thập dữ liệu (1.5đ) | Cần mô tả nguồn CSV platform, split train/val/test, số lượng 98 anomaly test | 1/1.5 |
| 4.2.2 Tiền xử lý (1.5đ) | ✓ Denoising input cho DAE, standardize, percentile threshold | 1.5/1.5 |
| 4.2.3 Feature engineering (1.5đ) | ✓ `feature_order` hoán vị theo 4 nhóm ngữ nghĩa — bắt buộc với A10 | 1.5/1.5 |
| 4.2.4 Tham số (1.5đ) | ✓ Đầy đủ trong `v10_artifacts.json` (latent=16, hidden=64, heads=4, layers=2) | 1.5/1.5 |
| 4.3.1 Chọn metric (2đ) | ✓ F1 (chính), Precision, Recall, ROC_AUC, PR_AUC, detected/actual | 2/2 |
| 4.3.2 Lý do chọn metric (2đ) | Cần giải thích: PR_AUC quan trọng hơn ROC_AUC do class imbalance (98/tổng); F1 dùng làm gate | 1.5/2 |
| 4.3.3 So sánh baseline (2đ) | ✓ V10 tự so với V9 (A8 MLP → A11 BiLSTM). Cần thêm Isolation Forest, ECOD baseline | 1/2 |

**Dự kiến tổng: ~17/20.**
**Action cao:** vẽ **architecture diagram** (draw.io hoặc mermaid) cho toàn bộ pipeline V10 — đây là item thiếu nặng nhất.

---

## V. THỰC NGHIỆM & KẾT QUẢ (20đ) — Target ≥ 15/20 (mấu chốt)

| Sub | Tiêu chí | Evidence | Đánh giá | Dự kiến |
|---|---|---|---|---:|
| 5.1.1 Mô tả dữ liệu (2đ) | 50 features, 98 anomaly test | Cần bổ sung tỷ lệ lớp, phân phối nhóm feature | 1.5/2 |
| 5.1.2 Dữ liệu đủ lớn (1đ) | Cần ghi rõ N_train, N_val | ⚠ Chưa rõ trong notebook | 0.5/1 |
| 5.1.3 EDA (1đ) | ✓ `v10_diagnostics.png` có distribution + PR curve | 1/1 |
| 5.2.1 Trình bày bảng số (2đ) | ✓ `v10_results.csv` đầy đủ | 2/2 |
| 5.2.2 Biểu đồ minh họa (2đ) | ✓ diagnostics + attention heatmap | 2/2 |
| 5.2.3 Reproducible (2đ) | ✓ seed cố định, artifact .pt/.json lưu lại threshold | 2/2 |
| 5.2.4 Đạt mục tiêu (2đ) | **⚠ 2/5 PASS, A12 FAIL sát biên** | Risk cao | 1/2 |
| 5.3.1 Phân tích chiều sâu (2đ) | Cần giải thích: tại sao A10 F1 thấp dù ROC_AUC 0.953? → threshold quá nhạy (0.000984) + tabular không thực sự có cấu trúc sequence | 1.5/2 |
| 5.3.2 So sánh model (2đ) | ✓ Bảng 5 dòng so sánh trực tiếp | 2/2 |
| 5.3.3 Nguyên nhân tốt/chưa tốt (2đ) | ✓ A7 XGB dẫn đầu vì có label + feature đủ tách, A2 DAE yếu vì rare anomaly không tái tạo được, A12 LR quá phụ thuộc A7 | 1.5/2 |
| 5.3.4 Nhận xét khách quan (2đ) | ✓ Notebook ghi rõ PASS/FAIL từng model, không che giấu | 2/2 |

**Dự kiến tổng: ~19/20 NẾU bổ sung N_train/N_val + phân tích A10 thất bại.**
**Risk điểm thực nghiệm:** mục 5.2.4 chỉ đạt 1/2 vì A12 Ensemble (flagship) FAIL. Có 2 phương án cứu:
1. Chạy lại với 5 seed khác nhau, báo cáo mean ± std → nếu mean ≥ 0.85 thì vẫn claim PASS.
2. Retrain meta-learner (thử XGBoost thay LR, hoặc bỏ A2 khỏi stacking).

---

## VI. KẾT LUẬN & HƯỚNG PHÁT TRIỂN (10đ) — Target ≥ 8/10

| Sub | Tiêu chí | Evidence | Dự kiến |
|---|---|---|---:|
| 6.1.1 Tóm tắt đóng góp (2đ) | 3 đóng góp: (a) feature-as-sequence A10, (b) BiLSTM-Cls thay MLP, (c) ensemble stacking đạt F1≈0.85 | 2/2 |
| 6.1.2 Đối chiếu mục tiêu (1.5đ) | 2/5 model PASS gate, A12 sát biên | 1/1.5 |
| 6.1.3 Hạn chế (1.5đ) | ✓ Rõ: A10 FAIL, A12 rớt marginal, dataset anomaly nhỏ (98 test) | 1.5/1.5 |
| 6.2.1 Hướng nghiên cứu (2.5đ) | → V11 (notebook đã có): denoising + percentile threshold + ensemble filtering | 2/2.5 |
| 6.2.2 Cải tiến (2.5đ) | Gợi ý: thay LR meta bằng XGB, thêm TabNet baseline, ECOD baseline, data augmentation SMOTE cho A11 | 2/2.5 |

**Dự kiến tổng: ~8.5/10.**

---

## VII. CHẤT LƯỢNG VIẾT (5đ) — Target ≥ 4/5

| Tiêu chí | Áp dụng | Dự kiến |
|---|---|---:|
| Ngữ pháp, câu văn | Kiểm bản luận văn cuối, không chấm được trên notebook | 1/1.5 |
| Thuật ngữ nhất quán | ⚠ Cần chuẩn hóa: "anomaly detection" vs "outlier detection", "DAE" vs "Denoising AE" | 1/1 |
| Trích dẫn | ⚠ Phụ thuộc references.bib ở mục III | 1/1.5 |
| Plagiarism < 20% | Chạy Turnitin trước nộp | 1/1 |

**Dự kiến tổng: ~4/5.**

---

## BẢNG TỔNG HỢP DỰ KIẾN V10

| Mục | Tối đa | Dự kiến | Gap chính |
|---|---:|---:|---|
| I. Hình thức | 15 | ~12 | Phần luận văn cứng |
| II. Mở đầu | 15 | ~11.5 | Số liệu cấp thiết, giới hạn |
| III. Cơ sở lý thuyết | 15 | ~10 | **Tham khảo thiếu ≥ 20 ref** |
| IV. Phương pháp | 20 | ~17 | **Architecture diagram** |
| V. Thực nghiệm | 20 | ~16 (nếu giữ nguyên v10) / ~19 (nếu cứu A12) | A12 FAIL + N_train/val |
| VI. Kết luận | 10 | ~8.5 | OK |
| VII. Viết | 5 | ~4 | OK |
| **TỔNG** | **100** | **~79 (≈7.9/10)** | **Khá** |

**Xếp loại dự kiến:** **Khá (7.0–7.9)**. Để lên **Giỏi (≥ 8.0)** cần 3 việc bắt buộc:
1. **Cứu A12 Ensemble** (mục 5.2.4) — chạy 5 seed hoặc đổi meta-learner.
2. **Vẽ architecture diagram** (mục 4.1.2) — +1đ chắc chắn.
3. **Bổ sung ≥ 20 tài liệu tham khảo** (mục 3.4) — +1.5đ chắc chắn.

---

## CHECKLIST REVIEW V10 (để chạy khi review lại)

### A. Artifact check (offline, đã đủ)
- [x] `v10_results.csv` 10 dòng (5 model × val/test)
- [x] `v10_artifacts.json` đầy đủ thresholds + hyperparams + feature_order
- [x] `v10_diagnostics.png` tồn tại
- [x] `v10_attention_heatmap.png` tồn tại
- [x] 4 model checkpoint (a2, a7, a10, a11)

### B. Reproducibility check (chạy lại)
- [ ] Rerun `train_detection_v10.py` với seed mặc định → verify F1 match CSV (±0.005)
- [ ] Rerun 5 seed khác, báo mean ± std cho A7, A11, A12
- [ ] Verify threshold trên val khớp file json

### C. Nội dung bổ sung cần viết
- [ ] Bảng N_train / N_val / N_test + tỷ lệ anomaly
- [ ] Giải thích PR_AUC vs ROC_AUC cho class imbalance
- [ ] Phân tích vì sao A10 FAIL (threshold quá nhạy + tabular không có cấu trúc tuần tự thật)
- [ ] Phân tích vì sao A12 rớt sát biên (LR quá phụ thuộc A7, weight A2/A10 nhỏ)
- [ ] Baseline so sánh: Isolation Forest, ECOD (từ PyOD)
- [ ] Latency inference mỗi model (cho phần ý nghĩa thực tiễn)
- [ ] Architecture diagram tổng thể

### D. Đối chiếu với V11
- [ ] So sánh điểm chấm V10 vs V11 (V11 đã có denoising + percentile threshold + ensemble filtering)
- [ ] Quyết định: luận văn dùng V10 làm mốc so sánh, V11 làm phiên bản cải tiến cuối cùng?

---

## LỊCH TRÌNH REVIEW (đề xuất, từ 2026-04-12)

| Tuần | Việc | Output |
|---|---|---|
| T1 (04-12 → 04-19) | Chạy lại 5 seed + cứu A12 + vẽ diagram | Bảng mean±std, architecture.png |
| T2 (04-19 → 04-26) | Viết Chương 3 (Thực nghiệm) dựa trên artifact v10 | Draft Chương 3 |
| T3 (04-26 → 05-03) | Bổ sung references.bib, viết Chương 1 | Draft Chương 1 + refs |
| T4 (05-03 → 05-10) | Tự chấm lại theo pattern IUH, mục tiêu ≥ 8.0 | Self-score sheet |
