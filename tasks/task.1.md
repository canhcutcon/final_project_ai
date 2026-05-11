for dèine
To run the full thesis workflow from csv_agent_platform/detection/:

# Full run (all 3 steps)

bash notebooks/run_experiments.sh

# Skip benchmark if already done, retrain only

SKIP_BENCHMARK=1 bash notebooks/run_experiments.sh

# Lighter training pass (4 variants, 10 epochs)

N_VARIANTS=4 EPOCHS=10 bash notebooks/run_experiments.sh
Outputs produced:

Section 4 → notebooks/v11_benchmark_results.json + v11_benchmark_latex_tables.tex
Section 5 → notebooks/v11_universal_result_executed.ipynb + models/v11/ artifacts

Tiến trình retrain V11 (đang chạy nền):

✅ Bước 1/5 — Load data (18,871 train rows, 390 cols)
✅ Bước 2/5 — Rule scoring (đang chạy — 8 variants × 18,871 rows)
⏳ Bước 3/5 — Build universal features → X_train (169,839 × 132)
⏳ Bước 4/5 — Train XGBoost (~2 phút)
⏳ Bước 5/5 — Train DAE + BiLSTM (30 epochs, ~10-15 phút)
Khi xong sẽ có đủ 5 file trong models/v11/:

a7_xgb_clean_v11.json
a2_dae_v11.pt
a11_bilstm_cls_v11.pt
v11_artifacts.json (populated)
v11_universal_scalers.npz
