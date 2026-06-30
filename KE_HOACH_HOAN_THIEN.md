# KẾ HOẠCH HOÀN THIỆN LUẬN VĂN — Nhóm việc còn thiếu

**Lập:** 29/06/2026 · **Mốc đóng băng số liệu:** 09/2026 (T1) · **Bảo vệ:** 10/2026
**Phạm vi:** 10 đầu việc còn lại, đối chiếu trực tiếp với code `csv_agent_platform` + `csv_agent_services`.

> 10 việc này đã được thêm vào **danh sách todo** (task #5–#14), kèm quan hệ phụ thuộc.

---

## Thứ tự ưu tiên & sơ đồ phụ thuộc

```
Đường găng (critical path):
  B6 (copy weights) ──┐
  A1 (BiLSTM) ─→ A2 (ensemble) ──┤
  NLP-1 (sinh báo cáo) ─→ NLP-2 (fidelity) ──┤
                       └→ NLP-3 (judge) ─→ NLP-4 (calibration) ──┤
                                                                  └─→ C9–C10 (đồng bộ số liệu)
Song song, độc lập:  Phụ lục F (BLEU/ROUGE),  AnoLLM/TAD-GP
```

---

## Chi tiết từng việc

### #5 · B6 — Tích hợp V11 vào backend  ⏱️ ~0,5 ngày · *không phụ thuộc*
Backend **đã sẵn code load V11** (`backend/app/services/ai_service.py`: `_MODELS_DIR = .../v11` trừ khi đặt `USE_V10_FALLBACK=true`). Vấn đề duy nhất: **thư mục `backend/app/ml/models/v11` đang rỗng**.
- Copy từ `detection/models/v11` (hoặc `v11_retrain`): `a7_xgb_clean_v11.json`, `a2_dae_v11.pt`, `a11_bilstm_cls_v11.pt`, `v11_artifacts.json`, `v11_universal_scalers.npz`.
- Kiểm tra `get_threshold(len(df.columns))` đọc đúng ngưỡng theo size trong `v11_artifacts`.
- Smoke test: upload 1 CSV → chạy detect → không lỗi thiếu weight.

### #6 · A1 — Điều tra hồi quy BiLSTM (F1 0,764→0,589)  ⏱️ ~2–3 ngày · *đường găng*
Công cụ: `detection/notebooks/train_v10_retrain.py`, `v10_detection_result.ipynb`.
- So sánh phân phối nhãn cửa sổ time-series V6 vs `data/processed_v10_retrain`.
- Kiểm tra hiệu ứng **anonymization** (mã hoá agent/district/project) lên đặc trưng thời gian.
- Rà `scaler_standard.pkl`, `scaler_gan.pkl`.
- Thử lại ngưỡng cửa sổ **0,10** và **0,20** (hiện 0,15).
- Output: kết luận nguyên nhân + checkpoint cải thiện *hoặc* khai báo limitation minh bạch.

### #7 · A2 — Retune trọng số Ensemble theo PR-AUC v10  ⏱️ ~1 ngày · *chờ #6*
- Grid-search lại `w_XGB, w_BiLSTM, w_DAE` trên tập kiểm định v10.
- Đánh giá lại `θ_ens=0,750` bằng F1-curve / PR-AUC.
- Cập nhật threshold-set vào `v11_artifacts` / runtime config.

### #8 · NLP-1 — Sinh 70/120 báo cáo held-out + evidence packets  ⏱️ ~1 ngày · *tiền đề khối NLP*
Hiện chỉ có `generation/data/training/synthetic_samples.jsonl` (dữ liệu train).
- Tách template-level held-out **T5–T8** (30 packet/template).
- Sinh evidence packet: `src/aggregation/aggregation_service.py` + `src/enrichment/enrichment_service.py` trên dòng nghi ngờ từ V10/V11.
- Sinh báo cáo: `src/inference/report_generator.py` cho 4 cấu hình (Qwen2/Gemma × zero-shot/LoRA) + Template-only baseline.

### #9 · NLP-2 — Bảng fidelity (NumFid/RuleFid/Cov@3/Hallu) §4.7  ⏱️ ~1 ngày · *chờ #8*
`evaluate.py` hiện **chỉ** có BLEU/ROUGE/BERTScore/format → cần **viết thêm** 4 chỉ số fidelity:
- NumFid = token số khớp packet · RuleFid = rule_id khớp · Cov@3 = coverage top-3 · Hallu = token số/rule_id "bịa".
- Chạy trên 120 báo cáo, điền §4.7 `chuong4.tex`. Mục tiêu: NumFid≥0,98 · RuleFid≥0,95 · Cov@3≥0,80 · Hallu≤0,02.

### #10 · Phụ lục F — BLEU/ROUGE-L/BERTScore  ⏱️ ~0,5 ngày · *song song*
- Chạy `ModelEvaluator` (evaluate.py) row-level + template-level cho 4 cấu hình.
- Điền `phu_luc.tex` dòng 231–237 (đang TBD). Một phần đã có: `evaluation_decision.json` (Qwen2 BLEU/ROUGE=1,0 row-level). Cần thêm BERTScore + template-level.

### #11 · NLP-3 — LLM-as-Judge ensemble  ⏱️ ~2 ngày + chi phí API · *chờ #8*
⚠️ **Chưa có script — phải viết mới.** Cần **API key**: OpenAI GPT-4o, Anthropic Claude, Google Gemini.
- Chấm 70 báo cáo × 5 tiêu chí, Likert 1–5, 3 judge độc lập.
- Position randomization (seed=42), blinding model source.
- Tính **ICC(2,k)** + **Krippendorff's α** (ngưỡng ICC≥0,75 excellent / ≥0,60 good).
- Điền bảng §4.8 `chuong4.tex`.

### #12 · NLP-4 — Calibration subset (Spearman ρ, n=15)  ⏱️ ~2–3 ngày (gồm chờ GVHD) · *chờ #11*
- 15/70 báo cáo (seed=42); **tác giả + GVHD chấm tay**, blind, cùng rubric.
- Spearman ρ giữa human (TB 2) và judge ensemble (TB 3) → 75 cặp. Ngưỡng ρ≥0,70 trên ≥4/5 tiêu chí.
- Điền §4.8.4 `chuong4.tex` + `chuong5.tex`. **Đặt lịch GVHD sớm** (phụ thuộc người).

### #13 · So sánh AnoLLM / TAD-GP  ⏱️ ~0,5–1 ngày · *song song*
- Đối chiếu F1 phương pháp đề xuất vs AnoLLM, TAD-GP; điền ô TBD `chuong5.tex` dòng 27.
- Tham chiếu sẵn trong `de_cuong_IUH/new_ref/` (AnoLLM, "Anomaly Detection of Tabular Data Using LLMs").

### #14 · C9–C10 — Đồng bộ số liệu V10/V11 toàn luận văn  ⏱️ ~2 ngày · *chốt cuối, chờ #5,#7,#9,#11*
- Thay Bảng kết quả AD Chương 3 (V6 → V10/V11); đồng bộ mọi F1/AUC ở Mở đầu, Kết luận, tóm tắt VI/EN.
- Cập nhật ROC/PR curve, confusion matrix, SHAP. Hoàn thiện Phụ lục B (siêu tham số, thresholds, feature_columns).

---

## Phụ thuộc bên ngoài cần lo sớm
1. **API key 3 LLM judge** (GPT-4o / Claude / Gemini) — chặn #11, #12.
2. **Lịch GVHD chấm calibration** — chặn #12.

## Ước lượng tổng
Khối code thuần (≈ #5,6,7,8,9,10,13): ~7–8 ngày làm việc. Khối phụ thuộc ngoài (#11,12): ~4–5 ngày + chờ. Đồng bộ cuối (#14): ~2 ngày. → Khả thi trước mốc đóng băng 09/2026 nếu đặt lịch API + GVHD ngay.
