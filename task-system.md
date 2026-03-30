Chia CSV AI Platform thành 2 phase

chuyển Story 1.4: JWT Authentication Setup -> sang phase 2:
🔬 ĐÁNH GIÁ CHI TIẾT: Training Pipeline V4

📊 Tổng quan kết quả

╔═══════════════════╦══════════╦══════════╦══════════╦══════════╦═══════
═══╗
║ Model ║ Test F1 ║ Test AUC ║ PR-AUC ║ Prec ║ Recall
║
╠═══════════════════╬══════════╬══════════╬══════════╬══════════╬═══════
═══╣
║ A2_DAE (Tab) ║ 0.678 ║ 0.967 ║ 0.743 ║ 0.612 ║ 0.759 ║
║ A3_VAE (Tab) ║ 0.464 ║ 0.899 ║ 0.597 ║ 0.696 ║ 0.348 ║
║ A4_TranAD (TS) ║ 0.990 ║ 0.962 ║ 0.999 ║ 0.981 ║ 1.000 ║
║ A5_BiLSTM (TS) ║ 0.990 ║ 0.971 ║ 0.999 ║ 0.981 ║ 1.000 ║
║ A6_Ensemble (Tab) ║ 0.574 ║ 0.950 ║ 0.692 ║ 0.409 ║ 0.962 ║
║ A7_IForest (Tab) ║ 0.318 ║ 0.713 ║ 0.259 ║ 0.262 ║ 0.405 ║
║ A8_OCSVM (Tab) ║ 0.328 ║ 0.639 ║ 0.280 ║ 0.356 ║ 0.304 ║
║ A9_MetaLearner ║ 0.714 ║ 0.971 ║ 0.746 ║ 0.669 ║ 0.766 ║
║ A10_Supervised ║ 1.000 ║ 1.000 ║ 1.000 ║ 1.000 ║ 1.000 ║
⚠️
╚═══════════════════╩══════════╩══════════╩══════════╩══════════╩═══════
═══╝

K-Fold CV (TS — đáng tin hơn):
A4_TranAD: F1 = 0.723 ± 0.019 | AUC = 0.727 ± 0.024
A5_BiLSTM: F1 = 0.742 ± 0.018 | AUC = 0.736 ± 0.025

---

✅ Những điểm V4 làm TỐT

1. Loại bỏ f-AnoGAN — Quyết định đúng

- F1=0.27 ở v3 là gần random, bỏ ra giúp pipeline sạch hơn

2. K-Fold CV cho Time-Series — Rất quan trọng

- Em đã dùng StratifiedKFold (k=5) cho TS models
- Kết quả K-fold (F1~0.72-0.74) thực tế hơn rất nhiều so với
  single-split (F1~0.99)
- Điều này cho thấy single-split TS bị "ảo tưởng" về performance

3. PR-curve threshold thay vì fixed percentile

- Target recall = 0.85 → tìm threshold qua PR curve → hợp lý cho anomaly
  detection (recall > precision)

4. A10 Supervised Head: ý tưởng concat(raw, latent) hay

- Raw dim 51 + Latent dim 32 = 83 features
- Deeper MLP [128→64→32→1] với pos_weight balancing

5. Loss curves hội tụ tốt

- DAE: train/val converge, không diverge
- VAE: recon loss giảm ổn, KL loss ổn định
- TranAD: phase 1→phase 2 transition rõ ràng
- A10: converge nhanh (~40 epochs), early stop ở ep 119

---

❌ Vấn đề #2: A10_Supervised F1 = 1.000 — QUÁ HOÀN HẢO

Confusion Matrix A10:
Normal: 1314 TP, 0 FP
Anomaly: 0 FN, 158 TP ← Zero mistakes!

Tại sao đáng nghi?

- Trong anomaly detection thực tế, không model nào đạt F1=1.0 trên
  unseen data
- Threshold = 0.9999754 → Model predict gần như 0 hoặc 1, không có vùng
  mờ
- Nguyên nhân có thể:
  a. Data leakage (đã xác nhận 33 rows leak vào test)
  b. Task quá dễ — anomalies quá khác biệt so với normal
  c. Overfitting trên features cụ thể mà không generalize

▎ ⚠️ Trong luận văn: Nếu báo cáo A10 F1=1.0, giảng viên phản biện SẼ hỏi
"tại sao perfect?" và đó là câu hỏi rất khó trả lời thuyết phục.

---

⚠️ Vấn đề #3: TS Val/Test Distribution cực kỳ lệch

TS train: 996/1968 anomaly (50.6%) ← OK, balanced
TS val: 100/106 anomaly (94.3%) ← Gần như toàn anomaly!
TS test: 104/106 anomaly (98.1%) ← Gần như toàn anomaly!

Phân tích:

- Val/Test gần như không có normal samples (chỉ 2-6 samples!)
- Bất kỳ model nào predict "tất cả là anomaly" đều đạt F1 ~0.99
- Đây là lý do A4, A5 single-split đạt F1=0.99 nhưng K-fold chỉ
  0.72-0.74
- K-fold CV mới là con số thật!

---

⚠️ Vấn đề #4: A6_Ensemble tệ hơn thành phần đơn lẻ

A2_DAE alone: Test F1 = 0.678
A6_Ensemble: Test F1 = 0.574 ← TỆ HƠN!

- Ensemble = weighted average of DAE + VAE scores
- VAE yếu (F1=0.464) kéo tụt DAE
- Weighted AUC-based ensemble không đủ — cần stacking hoặc
  learn-to-combine

---

📈 BẢNG ĐÁNH GIÁ TỪNG MODEL

┌────────────────┬─────────┬────────────────────────────────────────┐
│ Model │ Điểm │ Nhận xét │
├────────────────┼─────────┼────────────────────────────────────────┤
│ │ ⭐⭐⭐ │ Solid unsupervised baseline. F1=0.678, │
│ A2_DAE │ 7/10 │ AUC=0.967 tốt. Reconstruction error │
│ │ │ phân tách được normal vs anomaly │
├────────────────┼─────────┼────────────────────────────────────────┤
│ │ ⭐⭐ │ Recall=0.348 quá thấp — bỏ sót 65% │
│ A3_VAE │ 5/10 │ anomaly. beta=0.5 có thể quá cao → KL │
│ │ │ dominate → latent collapse nhẹ │
├────────────────┼─────────┼────────────────────────────────────────┤
│ │ │ K-fold F1=0.723 — decent. Architecture │
│ A4_TranAD │ ⭐⭐⭐ │ đúng chuẩn paper. Phase 1→2 │
│ │ 7/10 │ transition good. Nhưng TS split quá │
│ │ │ lệch │
├────────────────┼─────────┼────────────────────────────────────────┤
│ │ ⭐⭐⭐ │ K-fold F1=0.742 — tốt nhất trong TS. │
│ A5_BiLSTM │ 7.5/10 │ Attention mechanism hữu ích. Slight │
│ │ │ edge over TranAD │
├────────────────┼─────────┼────────────────────────────────────────┤
│ │ ⭐⭐ │ Tệ hơn component đơn lẻ → cần │
│ A6_Ensemble │ 4/10 │ redesign. Simple weighted average │
│ │ │ không đủ │
├────────────────┼─────────┼────────────────────────────────────────┤
│ │ ⭐⭐ │ Baseline yếu F1=0.318, nhưng OK cho so │
│ A7_IForest │ 4/10 │ sánh. Bình thường IForest tốt hơn — │
│ │ │ có thể hyperparams chưa tốt │
├────────────────┼─────────┼────────────────────────────────────────┤
│ │ ⭐⭐ │ F1=0.328 — yếu nhất. PCA reduction có │
│ A8_OCSVM │ 3/10 │ thể mất thông tin. Kernel/gamma cần │
│ │ │ tune │
├────────────────┼─────────┼────────────────────────────────────────┤
│ │ ⭐⭐⭐ │ Best unsupervised-based tabular │
│ A9_MetaLearner │ 7.5/10 │ (F1=0.714). Engineered features (diff, │
│ │ │ ratio, max) thông minh │
├────────────────┼─────────┼────────────────────────────────────────┤
│ A10_Supervised │ ⚠️ ?/10 │ F1=1.0 — không đánh giá được do │
│ │ │ leakage. Cần rerun trên clean data │  
 └────────────────┴─────────┴────────────────────────────────────────┘

---

🎯 TỔNG ĐÁNH GIÁ V4

┌──────────────────┬──────┬──────────────────────────────────────────┐
│ Tiêu chí │ Điểm │ Chi tiết │  
 ├──────────────────┼──────┼──────────────────────────────────────────┤
│ Code quality │ 8/10 │ Clean, well-structured, good docstrings │
├──────────────────┼──────┼──────────────────────────────────────────┤
│ Methodology │ 6/10 │ K-fold CV tốt, nhưng leakage chưa fix, │  
 │ │ │ TS split lệch │  
 ├──────────────────┼──────┼──────────────────────────────────────────┤  
 │ Model diversity │ 8/10 │ 9 models (unsupervised + supervised + │  
 │ │ │ ensemble + baseline) — impressive │
├──────────────────┼──────┼──────────────────────────────────────────┤  
 │ Evaluation rigor │ 5/10 │ Phát hiện leakage nhưng không fix. TS │
│ │ │ single-split misleading │  
 ├──────────────────┼──────┼──────────────────────────────────────────┤
│ Visualization │ 8/10 │ Loss curves, confusion matrices, ROC/PR, │  
 │ │ │ score distributions — đầy đủ │  
 ├──────────────────┼──────┼──────────────────────────────────────────┤
│ Thesis-readiness │ 5/10 │ Chưa thể report A10=1.0 hay TS │  
 │ │ │ single-split=0.99 │  
 └──────────────────┴──────┴──────────────────────────────────────────┘

Tổng: 6.5/10 — Pipeline tốt, nhưng data integrity issues cần fix trước  
 khi report.

---

🔧 KHUYẾN NGHỊ CHO V5

Ưu tiên 1 — Fix data leakage (BẮT BUỘC):

1. Quay lại preprocessing, deduplicate toàn bộ data trước khi split
2. Re-split train/val/test sao cho 0 overlap
3. Re-train tất cả models trên clean data

Ưu tiên 2 — Fix TS split:

1. Đảm bảo val/test có đủ normal samples (ít nhất 20-30%)
2. Hoặc chỉ report K-fold CV results (bỏ single-split)

Ưu tiên 3 — Cải thiện models yếu:

1. A3_VAE: Giảm beta xuống 0.1-0.3, hoặc dùng beta annealing
2. A6_Ensemble: Thử stacking (train logistic regression trên anomaly  
   scores) thay vì weighted average
3. A7_IForest: Tune n_estimators, contamination, max_features

Ưu tiên 4 — Cho luận văn:

1. Report K-fold CV cho TS models (con số thật)
2. Nếu A10 vẫn quá cao sau fix leakage → phân tích tại sao (feature  
   importance, SHAP)
3. Thêm confidence interval cho metrics

---

Em có muốn thầy đi sâu vào vấn đề nào cụ thể không? Ví dụ:

- Hướng dẫn fix data leakage cụ thể trong preprocessing?
- Phân tích tại sao VAE recall thấp và cách fix?
- Design ensemble strategy mới cho A6?
