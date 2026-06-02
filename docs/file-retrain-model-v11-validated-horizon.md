# Plan: Retrain V11 Universal Anomaly Detection — Validated Horizon

## Context

The v11 universal anomaly-detection stack at [csv_agent_platform/detection/models/v11/](csv_agent_platform/detection/models/v11/) is currently incomplete:

- `a7_xgb_clean_v11.json` exists (May 10, 2026 — single trained XGBoost)
- `v11_artifacts.json` is the placeholder shipped by the design doc — empty `column_zscore_params`, empty `eval_results`, fallback thresholds = 0.48
- `a2_dae_v11.pt`, `a11_bilstm_cls_v11.pt`, `v11_universal_scalers.npz` are **missing**

The processed parquets at [data/processed/](csv_agent_platform/detection/data/processed/) date to Apr 8, 2026 and predate any recent label / feature-engineering fixes. The service-side fallback path (Analysis #21 — "Feature shape mismatch, expected 48, got 58 → IsolationForest fallback") that motivated v11 cannot be closed until all three universal models are trained and evaluated against the full test horizon with the migration gate (F1 ≥ 0.85 × V10 = 0.7487).

**Goal of this retrain:** regenerate `data/processed/` from scratch, train the full v11 stack (XGB + DAE + BiLSTM) end-to-end into a sibling directory `models/v11_retrain/`, validate against the test split (per-size + overall, migration gate, backwards-compat on 50-col slice), and promote into `models/v11/` only if the gate passes.

Source-of-truth design doc (unchanged, do not edit): [final_project_ai/tasks/retrain-model-anomaly-v1.md](final_project_ai/tasks/retrain-model-anomaly-v1.md).

---

## Approach

### Phase 0 — Pre-flight (no writes)

1. Confirm Python env has `xgboost>=2.0`, `torch>=2.0`, `pandas`, `pyarrow`, `scikit-learn` (training script imports each lazily and raises with hint on miss).
2. Snapshot current artifacts: copy [models/v11/](csv_agent_platform/detection/models/v11/) → `models/v11_prev_<date>/` so the partial XGB is preserved if rollback is needed. **(One-shot `cp -r`, not a code change.)**
3. Verify `configs/default.yaml` exists and matches the seed=42 expectation used by the training script.

### Phase 1 — Regenerate processed parquets

```
cd csv_agent_platform/detection
python scripts/run_pipeline.py --phase 0 --seed 42
```

- Reuses existing pipeline functions defined in [scripts/run_pipeline.py:765-840](csv_agent_platform/detection/scripts/run_pipeline.py#L765). `--phase 0` runs all 8 phases (inventory → load → clean → business rules → feature engineering → labelling → splitting → save).
- Output: overwrites `data/processed/master_tabular_{train,val,test}.parquet` (writer at [scripts/run_pipeline.py:657](csv_agent_platform/detection/scripts/run_pipeline.py#L657)) plus `.pt` tensors and timeseries variants.
- **Sanity check after rebuild** (one-liner, no new code): `python -c "import pandas as pd; tr=pd.read_parquet('data/processed/master_tabular_train.parquet'); va=pd.read_parquet('data/processed/master_tabular_val.parquet'); te=pd.read_parquet('data/processed/master_tabular_test.parquet'); print(tr.shape, va.shape, te.shape, tr.is_anomaly.mean(), va.is_anomaly.mean(), te.is_anomaly.mean())"`.
  Expected (per project memory): ~6,868 / 1,472 / 1,472, ~10.8 % anomaly rate. Reject and stop if val/test rates drift to ~100 % (TS Bug 1) or to 0 %.

### Phase 2 — Train v11 stack into the retrain dir

```
mkdir -p models/v11_retrain
python notebooks/train_v11_universal.py \
    --data-path data/processed \
    --output-dir models/v11_retrain \
    --n-variants 8 \
    --epochs 30 \
    --seed 42
```

Driver: [notebooks/train_v11_universal.py](csv_agent_platform/detection/notebooks/train_v11_universal.py).
Stages it runs (no code changes needed):

- `load_data` — drops `anomaly_type`, `anomaly_score`, `file_number`, `is_synthetic`, `is_outlier_*`. [train_v11_universal.py:46-73](csv_agent_platform/detection/notebooks/train_v11_universal.py#L46-L73)
- `fit_features` — builds 132-dim universal vector with `build_universal_features` from [src/data/universal_features.py:195](csv_agent_platform/detection/src/data/universal_features.py#L195) and augments via `build_augmented_dataset` from [src/data/schema_augmentation.py](csv_agent_platform/detection/src/data/schema_augmentation.py). Optional `RuleScoringEngine` from [src/rules/rule_scorer.py](csv_agent_platform/detection/src/rules/rule_scorer.py) — script falls back to zero-block automatically if init raises.
- `train_xgb` → `a7_xgb_clean_v11.json` + val-tuned threshold ([train_v11_universal.py:125](csv_agent_platform/detection/notebooks/train_v11_universal.py#L125))
- `train_dae` → `a2_dae_v11.pt` (132→32→132, 30 epochs, GELU + BN + dropout)
- `train_bilstm` → `a11_bilstm_cls_v11.pt` (164-dim input `[DAE_latent | X]`)
- `evaluate` + `save_artifacts` → writes `v11_artifacts.json` and `v11_universal_scalers.npz` ([train_v11_universal.py:437-490](csv_agent_platform/detection/notebooks/train_v11_universal.py#L437-L490))
- `check_migration_gate` — exits non-zero if `overall F1 < 0.7487`. This is the **validated-horizon gate** — it fails the retrain if test-set performance regresses past 15 % of V10 baseline (0.8808).

Reuse only — no new modules to add in this phase.

### Phase 3 — Validated-horizon evaluation (read-only)

Run the result notebook against `models/v11_retrain/` so per-size and backwards-compat sections execute against the new artifacts:

```
MODELS_DIR=models/v11_retrain jupyter nbconvert --to notebook --execute \
    notebooks/v11_universal_result.ipynb \
    --output v11_universal_result_retrain.ipynb \
    --ExecutePreprocessor.timeout=7200
```

The notebook ([notebooks/v11_universal_result_run.py](csv_agent_platform/detection/notebooks/v11_universal_result_run.py) is the executed mirror) already covers:

- Per-size F1 across schema variants ([v11_universal_result_run.py:192-206](csv_agent_platform/detection/notebooks/v11_universal_result_run.py#L192-L206))
- Backwards-compat F1 on 50-col slice ≥ 0.7487 ([v11_universal_result_run.py:213-228](csv_agent_platform/detection/notebooks/v11_universal_result_run.py#L213-L228))
- Migration-gate assert ([v11_universal_result_run.py:230-245](csv_agent_platform/detection/notebooks/v11_universal_result_run.py#L230-L245))
- PR-curve + score-distribution plots
- V10 vs V11 comparison table

**Tweak required (small):** `MODELS_DIR` in the notebook is hard-coded at [v11_universal_result_run.py:35](csv_agent_platform/detection/notebooks/v11_universal_result_run.py#L35). Either:

- Read it from env (`os.getenv('MODELS_DIR', ROOT/'models/v11')`) — one-line edit in both the `.ipynb` cell and `_run.py`, OR
- Temporarily symlink `models/v11_retrain` → `models/v11` during the notebook run.

Recommendation: prefer the env-var edit (more reproducible, leaves git tree clean), keep the change to the single line.

### Phase 4 — Promote (only if gate passes)

If the script in Phase 2 exited 0 **and** the notebook in Phase 3 finished without assertion errors:

```
rm -f models/v11/*           # current placeholder + partial XGB
cp models/v11_retrain/* models/v11/
```

Leave `models/v11_retrain/` in place as the audit trail until the next retrain.

If the gate fails: leave `models/v11/` untouched, investigate via the executed notebook's plots (score distribution, PR curve) before re-running.

---

## Critical Files

- [csv_agent_platform/detection/scripts/run_pipeline.py](csv_agent_platform/detection/scripts/run_pipeline.py) — invoked in Phase 1, no code changes
- [csv_agent_platform/detection/notebooks/train_v11_universal.py](csv_agent_platform/detection/notebooks/train_v11_universal.py) — invoked in Phase 2, no code changes
- [csv_agent_platform/detection/src/data/universal_features.py](csv_agent_platform/detection/src/data/universal_features.py) — 132-dim builder; reused, not modified
- [csv_agent_platform/detection/src/data/schema_augmentation.py](csv_agent_platform/detection/src/data/schema_augmentation.py) — augmentation source; reused
- [csv_agent_platform/detection/src/rules/rule_scorer.py](csv_agent_platform/detection/src/rules/rule_scorer.py) — optional rule block; reused
- [csv_agent_platform/detection/notebooks/v11_universal_result.ipynb](csv_agent_platform/detection/notebooks/v11_universal_result.ipynb) — Phase 3 evaluator; **only** edit the `MODELS_DIR` cell to honor an env var
- [csv_agent_platform/detection/notebooks/v11_universal_result_run.py](csv_agent_platform/detection/notebooks/v11_universal_result_run.py) — same one-line env-var edit at line 35

---

## Files To Be Written (by tooling, not by hand)

After Phase 2 completes:

- `models/v11_retrain/a7_xgb_clean_v11.json`
- `models/v11_retrain/a2_dae_v11.pt`
- `models/v11_retrain/a11_bilstm_cls_v11.pt`
- `models/v11_retrain/v11_artifacts.json` (with non-empty `column_zscore_params`, `eval_results`, calibrated per-size thresholds)
- `models/v11_retrain/v11_universal_scalers.npz`

After Phase 4 promotion: same files copied into `models/v11/`.

---

## Verification

End-to-end checks before promoting and notifying the service team:

1. **Data sanity** — train/val/test anomaly rates within [0.05, 0.30]; row counts match the V6 dataset stats in project memory (~6.8k / 1.5k / 1.5k).
2. **Training success** — `train_v11_universal.py` exits 0; all 5 artifact files exist in `models/v11_retrain/`; `v11_artifacts.json["feature_dim"] == 132` and `column_zscore_params` is non-empty.
3. **Migration gate** — overall F1 reported by the script ≥ 0.7487 (printed as `"PASS ✓"`).
4. **Validated-horizon notebook** — `v11_universal_result_retrain.ipynb` runs to completion; the assertion at [v11_universal_result_run.py:245](csv_agent_platform/detection/notebooks/v11_universal_result_run.py#L245) does not fire; backwards-compat block prints `✓ PASS`.
5. **Per-size F1** — printed by Section 8 of the notebook; tiny ≥ 0.70, medium ≥ 0.78, large ≥ 0.82 (per [tasks/retrain-model-anomaly-v1.md#L124](final_project_ai/tasks/retrain-model-anomaly-v1.md#L124)). Soft target — log even if not all met.
6. **Promotion** — `ls models/v11/` shows all 5 artifacts with a newer mtime than the snapshot in `models/v11_prev_<date>/`.
7. **Smoke (optional, no service redeploy in scope)** — `python -c "import json; a=json.load(open('csv_agent_platform/detection/models/v11/v11_artifacts.json')); assert a['feature_dim']==132 and a['eval_results']; print(a['thresholds'])"`.

Service-side wiring (`ai_service.py`, `model_metadata.py`, `model_selector.py`) and the PlainLanguageSummary UI fix from the original design doc are **out of scope** for this retrain — they live downstream once the artifacts are promoted.
