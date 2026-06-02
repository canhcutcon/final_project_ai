# Plan: v11 Universal Anomaly Detection Retraining

## Context

The v10 anomaly detection stack ([models/v10/v10_artifacts.json](csv_agent_platform/detection/models/v10/v10_artifacts.json)) was trained on a fixed 50-feature schema with positional integer indices (not column names). This breaks the moment a user uploads a CSV with a different column count — the recent Analysis #21 hit "Feature shape mismatch, expected: 48, got 58" and silently fell back to IsolationForest.

**Goal:** Retrain a v11 stack that is **schema-agnostic** — a single trained model that scores CSVs of any size:

- Tiny: <50 columns (e.g. bank transactions)
- Medium: 50–100 columns (typical real estate)
- Large: 100+ columns (enriched datasets)

**Approach:** Build a fixed-dim **Universal Feature Vector (132 dims)** combining hash-based numeric/categorical buckets + row-level statistical descriptors + dataset meta-features + rule-scorer outputs. All v11 models (XGBoost, BiLSTM, DAE) train on this 132-dim representation, so they are decoupled from any specific column schema.

**Bonus fix folded in:** the rare-value explanation contradiction (value shown in "Common values" panel yet labeled "uncommon") originates in [PlainLanguageSummary.tsx:50-55](csv_agent_services/fronted/components/anomaly/PlainLanguageSummary.tsx#L50-L55) — same explanation pipeline this work touches.

---

## Universal Feature Vector — 132 dims

| Block                    | Dims    | Source                                                                              | Notes                                                                                                   |
| ------------------------ | ------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Numeric hash buckets     | 64      | `mmh3.hash(col_name) % 64`, accumulate per-column z-score                           | Works for any column count                                                                              |
| Categorical hash buckets | 32      | hash of column name, accumulate frequency-encoded value                             | Frequency table in artifacts                                                                            |
| Row-level stats          | 16      | mean/std/skew/kurt of numerics, missing rate, num_numeric, num_cat, max abs z, etc. | Schema-agnostic                                                                                         |
| Dataset meta             | 8       | n_cols, n_rows, numeric_ratio, avg cardinality (broadcast per row)                  | From [features_meta.py](csv_agent_platform/detection/src/data/features_meta.py)                         |
| Rule scorer              | 12      | rule_score + 11 binary per-rule indicators                                          | From [rule_scorer.py](csv_agent_platform/detection/src/rules/rule_scorer.py); zero-vec if no rule fires |
| **Total**                | **132** |                                                                                     | Identical at train and inference                                                                        |

---

## Files to Create

### Platform (training side)

1. **[src/data/universal_features.py](csv_agent_platform/detection/src/data/universal_features.py)**

   ```python
   UNIVERSAL_DIM = 132
   def build_universal_features(
       df: pd.DataFrame, fit: bool = True,
       artifacts: dict | None = None,
       rule_scorer: "RuleScorer | None" = None,
   ) -> tuple[np.ndarray, dict]: ...
   ```

   `artifacts` schema: `{hash_seed, numeric_hash_dim, column_zscore_params, column_freq_params, row_stats_scaler, dataset_meta_scaler, feature_dim, version}`. Reuses `MissingValueHandler`, `DtypeCorrector` from [cleaning.py](csv_agent_platform/detection/src/data/cleaning.py); reuses [features_meta.py](csv_agent_platform/detection/src/data/features_meta.py).

2. **[src/data/schema_augmentation.py](csv_agent_platform/detection/src/data/schema_augmentation.py)**
   `augment_schema_variants(df, labels, n_variants=8)` — yields tiny_30, tiny_45, medium_70, medium_90, large_150, large_220, rename_only, noise_pad. Stack into `master_universal_train.parquet` (~150K rows). Forces hash buckets to see diverse name → bucket mappings.

3. **[notebooks/train_v11_universal.py](csv_agent_platform/detection/notebooks/train_v11_universal.py)** — argparse CLI (reproducible, CI-runnable). Functions: `load_data`, `augment`, `fit_features`, `train_dae`, `train_bilstm`, `train_xgb`, `evaluate`, `save_artifacts`.

4. **[notebooks/v11_universal_result.ipynb](csv_agent_platform/detection/notebooks/v11_universal_result.ipynb)** — mirrors v10 results-only layout (~25 cells):
   1. Title + overview (markdown)
   2. Imports + path setup
   3. Load `master_tabular_{train,val,test}.parquet`
   4. `schema_augmentation.augment_schema_variants` (train+val)
   5. Instantiate `RuleScorer()`
   6. `build_universal_features(train, fit=True)` → `X_train, artifacts`
   7. `build_universal_features(val, fit=False, artifacts=...)` → `X_val`
   8. Sanity-check shapes `(*, 132)`
   9. Class balance + threshold prior
   10. Train A2-DAE-Universal (132→32→132, 30 epochs)
   11. Save `a2_dae_v11.pt`; reconstruction loss plot
   12. Train A11-BiLSTM-Universal on `[X | DAE_latent]` (164 dim)
   13. Save `a11_bilstm_cls_v11.pt`
   14. Train A7-XGBoost-Universal on 132 dims (no proxy drop)
   15. Save `a7_xgb_clean_v11.json`
   16. Ensemble stacking — logistic meta-learner over the three (mirror v11 cell pattern)
   17. Threshold sweep on val; pick per-size thresholds (tiny/medium/large)
   18. Synthesize tiny/medium/large eval frames from test split
   19. Per-size eval: F1, PR-AUC, ROC-AUC, confusion matrices
   20. Backwards-compat: re-run v10 50-col test set, expect F1 ≥ 0.837 (≥95% of v10's 0.881)
   21. Migration gate assert (`F1_v11 >= 0.85 * F1_v10`)
   22. Write `v11_artifacts.json` (new format)
   23. Save `v11_universal_scalers.npz`
   24. Release notes + known limitations
   25. Final summary table

5. **Model artifacts** under `csv_agent_platform/detection/models/v11/`:
   `a7_xgb_clean_v11.json`, `a11_bilstm_cls_v11.pt`, `a2_dae_v11.pt`, `v11_artifacts.json`, `v11_universal_scalers.npz`.

   New `v11_artifacts.json` format:

   ```json
   {
     "feature_dim": 132,
     "hash_seed": 12648430,
     "scaler_params_file": "v11_universal_scalers.npz",
     "model_files": {
       "xgb": "a7_xgb_clean_v11.json",
       "bilstm": "a11_bilstm_cls_v11.pt",
       "dae": "a2_dae_v11.pt"
     },
     "thresholds": {
       "tiny": 0.42,
       "medium": 0.48,
       "large": 0.55,
       "default": 0.48
     },
     "rule_scorer_version": "v1",
     "trained_on": "master_universal_train.parquet"
   }
   ```

### Service (inference side)

6. **[backend/app/ml/models/universal_features.py](csv_agent_services/backend/app/ml/models/universal_features.py)** — thin wrapper that imports the platform module; loads `v11_artifacts.json` + scalers npz once at startup.

7. **`backend/app/ml/models/v11/`** directory with copied artifact files.

### Tests / fixtures

8. **`csv_agent_platform/detection/tests/fixtures/universal/`**:
   - `tiny_bank_20col.csv`
   - `medium_realestate_80col.csv`
   - `large_synthetic_200col.csv` (master + 110 noise cols)
   - `v10_compat_50col.csv`

9. **[tests/test_v11_universal.py](csv_agent_platform/detection/tests/test_v11_universal.py)**:
   - `test_universal_features_shape` — every fixture → `(n, 132)`
   - `test_inference_no_crash`
   - `test_f1_per_bucket` — F1 ≥ 0.70 (tiny), ≥ 0.78 (medium), ≥ 0.82 (large)
   - `test_v10_backwards_compat` — F1 ≥ 0.837 on `v10_compat_50col.csv`
   - `test_artifacts_roundtrip`

---

## Files to Modify

1. **[backend/app/services/ai_service.py](csv_agent_services/backend/app/services/ai_service.py) lines 104–414** — replace `REQUIRED_FEATURES = 50` with `UNIVERSAL_DIM = 132`. Remove `data[:, :50]` slicing. Inject universal feature builder before `model.predict`. Look up size-bucket threshold from `v11_artifacts.json["thresholds"]` based on `df.shape[1]` (tiny<50 / medium 50-100 / large>100). Remove the IsolationForest fallback branch (universal pipeline handles n<50 natively).

2. **[backend/app/ml/models/xgboost_detector.py:50](csv_agent_services/backend/app/ml/models/xgboost_detector.py#L50)** — remove `proxy_features=[11,13]` and `_drop_proxy()` call; assert `data.shape[1] == 132`.

3. **[backend/app/ml/models/bilstm_classifier.py](csv_agent_services/backend/app/ml/models/bilstm_classifier.py)** — input dim 132 (or 164 with DAE latent); load `a11_bilstm_cls_v11.pt`.

4. **[backend/app/ml/models/dae_encoder.py](csv_agent_services/backend/app/ml/models/dae_encoder.py)** — architecture 132→32 (was 50→16); load `a2_dae_v11.pt`.

5. **[backend/app/ml/models/model_metadata.py](csv_agent_services/backend/app/ml/models/model_metadata.py)** — register `xgboost_v11_universal`, `bilstm_v11_universal`, `dae_v11_universal` entries with `feature_dim=132`.

6. **[backend/app/ml/models/model_selector.py](csv_agent_services/backend/app/ml/models/model_selector.py)** — default route v11; env flag `USE_V10_FALLBACK` for safety; remove the `n_cols < 50 → fallback` branch.

7. **[fronted/components/anomaly/PlainLanguageSummary.tsx:46-57](csv_agent_services/fronted/components/anomaly/PlainLanguageSummary.tsx#L46-L57)** — fix rare-value contradiction. Current bug: a value in `common_values` (top 5 by freq) can still be tagged "uncommon" if its absolute freq <5%. Change `describeIssue()` for categorical: only emit "rare/uncommon" wording when the value is **NOT** in `common_values`; otherwise emit `"${field} = '${valStr}' is one of several common values but is unusual in combination with other fields here"`. This keeps the row's anomaly explanation honest when the column is high-cardinality.

---

## Risk Register

1. **Hash collisions on small column counts** → Train with both 64- and 128-bucket variants; pick highest val F1; record chosen dim. Add `n_hash_collisions` to row-stats dim 16.
2. **Lost feature semantics → F1 drop vs v10** → Rule scorer's 12 dims preserve domain semantics; ensemble meta-learner lets XGBoost lean on rule features when hash signal is weak. Migration gate blocks release if F1 drops >15%.
3. **Synthetic schema variants don't match real distribution shift** → Add real-world fixtures to validation; weight `large_synthetic` lower (`sample_weight=0.5`); log per-size F1 in production.
4. **Ensemble inference latency** → Parallelize model calls; cache `universal_features` artifacts in memory; target ≤150ms p95 for 10K-row CSV. If exceeded, ship XGB-only with rule features.
5. **Threshold drift per CSV size** → Store size-bucketed thresholds in artifacts; `ai_service.py` selects by `n_cols`; monthly `recalibrate_thresholds.py` script.
6. **Backwards-compat break in `ai_service.py`** → Env flag `MODEL_VERSION` (default `v11`, fallback `v10`); canary deploy 10% traffic for 48h.

---

## Verification

End-to-end checks before merge:

1. **Training**: `python notebooks/train_v11_universal.py --data-path data/processed --output-dir models/v11 --n-variants 8 --epochs 30` completes without error; produces all 5 artifacts.
2. **Notebook reproducibility**: open `v11_universal_result.ipynb`, "Run All" finishes; final cell asserts F1 gate.
3. **Unit tests**: `pytest csv_agent_platform/detection/tests/test_v11_universal.py -v` — all 5 tests pass.
4. **Backwards compat**: F1 on `v10_compat_50col.csv` ≥ 0.837.
5. **Service integration**: copy v11 artifacts into `csv_agent_services/backend/app/ml/models/v11/`, restart Celery worker, re-run Analysis #21 (the failing one) — `models_used` should report `xgboost_v11_universal` (not `isolation_forest_fallback`).
6. **Multi-size smoke**: upload tiny_bank_20col.csv, medium_realestate_80col.csv, large_synthetic_200col.csv via the UI — all three return non-fallback model results.
7. **UI bug fix**: open Analysis #21 in browser — confirm `"Apartment/Condo" is uncommon` no longer appears alongside `"Apartment/Condo"` in the Common Values panel.

---

## Critical Files

- [csv_agent_platform/detection/src/data/universal_features.py](csv_agent_platform/detection/src/data/universal_features.py) (new)
- [csv_agent_platform/detection/notebooks/train_v11_universal.py](csv_agent_platform/detection/notebooks/train_v11_universal.py) (new)
- [csv_agent_platform/detection/notebooks/v11_universal_result.ipynb](csv_agent_platform/detection/notebooks/v11_universal_result.ipynb) (new)
- [csv_agent_services/backend/app/services/ai_service.py](csv_agent_services/backend/app/services/ai_service.py) (modify lines 104-414)
- [csv_agent_services/backend/app/ml/models/model_metadata.py](csv_agent_services/backend/app/ml/models/model_metadata.py) (modify)
- [csv_agent_services/fronted/components/anomaly/PlainLanguageSummary.tsx](csv_agent_services/fronted/components/anomaly/PlainLanguageSummary.tsx) (modify lines 46-57)
