# CSV Agent — Detection Data Processing Pipeline

## Goals and Background Context

### Goals
- Build an end-to-end data processing pipeline that transforms 22 raw CSV/XLSX files (~47K rows) into train-ready datasets for anomaly detection models (A1-A6), data classifier (C3), and data balancing (C1/C2)
- Standardize, clean, and enrich real estate transaction data while preserving anomaly signals (outliers are NOT removed — they are detection candidates)
- Engineer tabular, temporal, and meta features tailored to each model family
- Produce validated, properly split PyTorch-ready datasets with synthetic anomaly augmentation (from ~0.7% to 3-5% anomaly rate)

### Background Context
The CSV Agent Platform's Detection module needs curated datasets to train anomaly detection models on Singapore real estate transaction data. The raw data comes from multiple sources (XLSX transaction files, CSV reports, client/property/invoice enrichment tables) with significant quality issues: 43-48% missing values in XLSX files, inconsistent schemas across files, extreme price outliers (up to $4.08B), and only ~350 naturally occurring anomaly records (~0.7%). This pipeline addresses data quality, feature engineering, class imbalance, and proper temporal/stratified splitting to prevent data leakage.

### Change Log
| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-03-18 | 0.1 | Initial draft from TASKS_PROCESSDATA.md | AI |

---

## Requirements

### Functional Requirements
- **FR1:** Unified data loader that auto-detects encoding (UTF-8, Latin-1) and handles CSV/XLSX formats with edge case handling (empty files, corrupted rows, mixed dtypes)
- **FR2:** Schema standardization — normalize column names to snake_case and map variant column names across files via configurable YAML mapping
- **FR3:** Missing value treatment with strategy per dtype (median/mean for numeric, mode/"UNKNOWN" for categorical, forward-fill for dates) and MCAR/MAR/MNAR analysis for high-missing XLSX files
- **FR4:** Duplicate detection (exact + fuzzy, within-file and cross-file) using existing 63-match reference report
- **FR5:** Outlier flagging (IQR + Z-score) — flag only, never remove — producing `is_outlier_*` columns
- **FR6:** Feature engineering producing 3 feature sets: tabular (ratio/cross features for A1-A3), temporal (lag/rolling/seasonality for A4-A6), and meta features (datetime_ratio, autocorrelation, etc. for C3)
- **FR7:** Anomaly label engineering from 7 sources (~350 real anomalies) with binary (`is_anomaly`) and multi-class (`anomaly_type`) labels
- **FR8:** Dataset merging — align and concat 2 XLSX files (143/145 cols), merge 3 CSV transaction files, join 4 enrichment tables via File Number
- **FR9:** Monthly time-series aggregation (~144 data points, 2012-2024) with sliding window creation (configurable window/stride) for TranAD/BiLSTM
- **FR10:** Synthetic anomaly injection (template-based + rule-based) targeting 3-5% anomaly rate, with `is_synthetic` flag
- **FR11:** Train/Val/Test splitting — stratified for tabular, chronological for time-series, synthetic data in Train only
- **FR12:** Scaling (Standard, MinMax, Robust) fit on Train only — save scaler objects as `.pkl`
- **FR13:** PyTorch Dataset classes (`TabularAnomalyDataset`, `TimeSeriesAnomalyDataset`, `MetaFeatureDataset`) with DataLoader factory
- **FR14:** Data quality validation and report generation (no NaN/Inf, label distribution, no split overlap, correct tensor shapes)

### Non-Functional Requirements
- **NFR1:** Pipeline must be reproducible — all random seeds configurable via `configs/default.yaml`
- **NFR2:** All processing steps log data lineage (source file → transforms → output)
- **NFR3:** Output format: Parquet for intermediate data, `.pt` tensors for final model input
- **NFR4:** Dependencies limited to: pandas, numpy, openpyxl, scikit-learn, torch, statsmodels
- **NFR5:** Unit tests for loader, schema, cleaning, and splitting modules

---

## User Interface Design Goals

### Overall UX Vision
CLI/script-driven pipeline — no graphical UI. Users interact via Python scripts, config YAML files, and generated reports.

### Key Interaction Paradigms
- Run pipeline phases via Python scripts or a single orchestrator entry point
- Configuration-driven behavior via `configs/default.yaml` and `configs/column_mapping.yaml`
- Progress feedback via console logging (phase progress, row counts, warnings)

### Core Screens and Views
- Terminal output: phase progress, data stats, warnings/errors
- `DATA_QUALITY_REPORT.md`: dataset statistics, feature distributions, correlation matrix, data lineage diagram
- `missing_report.csv`: per-column missing stats before/after cleaning
- Inventory report: per-file row/col/dtype/missing% profiling output

### Accessibility
None — CLI/script tool

### Branding
N/A

### Target Device and Platforms
macOS / Linux — Python 3.10+ environment

---

## Technical Assumptions

### Repository Structure
Monorepo — module lives at `{ai_services_detection}/` within the CSV Agent Platform workspace

```
{ai_services_detection}/
├── data/raw/              # Symlink from csv_agent_services/data/raw-csv-detection/
├── data/processed/        # Cleaned/merged/split outputs
├── data/external/         # Benchmark datasets (CICIDS2017, Credit Card Fraud, etc.)
├── notebooks/
├── src/data/              # loader, schema, cleaning, features, splitter, dataset, windowing
├── src/models/
├── src/training/
├── src/evaluation/
├── src/utils/
├── configs/               # default.yaml, column_mapping.yaml
├── models/                # Saved scaler .pkl files
└── tests/                 # Unit tests
```

### Service Architecture
Standalone Python pipeline — no microservices, no API. Runs locally or on training server.

### Testing Requirements
Unit tests for core data modules (loader, schema, cleaning, splitter). Manual validation via DATA_QUALITY_REPORT.

### Additional Technical Assumptions
- Python 3.10+ with pandas, numpy, openpyxl, scikit-learn, torch, statsmodels
- Raw data source: `csv_agent_services/data/raw-csv-detection/` (22 files, ~47K rows)
- Two primary XLSX files: `transaction.xlsx` (3,603 rows × 143 cols) and `transaction-asian.xlsx` (1,024 rows × 145 cols) with 43-48% missing values
- Intermediate outputs as Parquet, final outputs as PyTorch `.pt` tensors
- Scaler objects saved as `.pkl` — fit on Train set only to prevent data leakage
- Synthetic anomalies flagged with `is_synthetic=True` and excluded from Val/Test sets
- Time-series split is chronological: Train 2012-2021, Val 2022-2023H1, Test 2023H2-2024
- Config-driven: all params (window size, split ratios, scaler type, imputation strategy) controlled via YAML

---

## Epic List

- **Epic 1: Project Setup & Data Loading** — Initialize directory structure, build unified data loader, and standardize schemas (Phase 1-2)
- **Epic 2: Data Cleaning & Quality** — Handle missing values, detect duplicates, flag outliers, and correct data types (Phase 3)
- **Epic 3: Feature Engineering & Labeling** — Engineer tabular/temporal/meta features and construct anomaly labels from 7 sources (Phase 4)
- **Epic 4: Dataset Merging & Time-Series Processing** — Merge XLSX/CSV files, join enrichment tables, create master datasets, aggregate monthly time-series, and build sliding windows (Phase 5-6)
- **Epic 5: Augmentation, Splitting & Output** — Inject synthetic anomalies, split train/val/test, scale features, build PyTorch Dataset classes, and validate final data quality (Phase 7-8)

---

## Epic Details

### Epic 1: Project Setup & Data Loading

**Objective:** Establish the detection module directory structure, create a robust data loader supporting CSV/XLSX with auto-encoding detection, and standardize schemas across all 22 source files so downstream phases work with consistent column names and types.

#### Story 1.1: Directory Structure & Dependencies
As a data engineer,
I want the detection module scaffolded with standard directories and a requirements.txt,
so that all team members have a consistent project layout from day one.

**Acceptance Criteria:**
1. Directory tree matches the structure defined in Technical Assumptions
2. `requirements.txt` includes pandas, numpy, openpyxl, scikit-learn, torch, statsmodels
3. `configs/default.yaml` created with default preprocessing params
4. All packages have `__init__.py`

#### Story 1.2: Data Inventory & Profiling
As a data engineer,
I want an automated profiling script that scans all raw files and outputs an inventory report,
so that I understand row counts, column counts, dtypes, missing %, and date ranges before processing.

**Acceptance Criteria:**
1. `src/data/profiler.py` scans `data/raw/` and reports per-file stats
2. Files grouped by category: Transactions, Invoices, SNRE, Clients, Properties, Linkage
3. The 2 XLSX files profiled with column overlap analysis (~140 expected common cols)

#### Story 1.3: Unified Data Loader
As a data engineer,
I want a single loader module that reads CSV (auto-detect encoding) and XLSX files,
so that all downstream code uses one consistent loading interface.

**Acceptance Criteria:**
1. `src/data/loader.py` exposes `load_csv()`, `load_xlsx()`, `load_all()`
2. Handles edge cases: empty files, corrupted rows, mixed dtypes
3. `tests/test_loader.py` passes

#### Story 1.4: Schema Standardization
As a data engineer,
I want column names normalized to snake_case with variant mappings defined in YAML,
so that merged datasets have consistent column names regardless of source file.

**Acceptance Criteria:**
1. `src/data/schema.py` normalizes names and applies mapping from `configs/column_mapping.yaml`
2. MASTER_SCHEMA dict defined per data group
3. Variant names (e.g., "File Number" / "File No" / "file_number") all resolve to one canonical name

---

### Epic 2: Data Cleaning & Quality

**Objective:** Clean the raw data by handling missing values (43-48% in XLSX), removing duplicates (exact + fuzzy, cross-file), flagging outliers without removing them, and correcting data types — producing analysis-ready DataFrames.

#### Story 2.1: Missing Value Treatment
As a data engineer,
I want a configurable missing value handler that applies different strategies per dtype,
so that cleaned data retains maximum information while eliminating NaNs.

**Acceptance Criteria:**
1. `MissingValueHandler` class in `src/data/cleaning.py` supports median, mean, mode, forward-fill, and "UNKNOWN" strategies
2. High-missing columns (>70%) flagged for drop/keep decision via config
3. MCAR/MAR/MNAR analysis performed for the 2 XLSX files
4. Outputs `missing_report.csv` with before/after stats per column

#### Story 2.2: Duplicate Detection & Removal
As a data engineer,
I want duplicates detected within and across files using exact and fuzzy matching,
so that the master dataset contains no redundant records.

**Acceptance Criteria:**
1. Intra-file exact duplicate detection per file
2. Cross-file detection references `bills_duplicate_check_report_matches.csv` (63 matches)
3. Strategy: keep first occurrence, log all removed records with reason

#### Story 2.3: Outlier Flagging
As a data engineer,
I want outliers flagged via IQR and Z-score methods but never removed,
so that anomaly detection models can use them as candidate signals.

**Acceptance Criteria:**
1. IQR + Z-score applied to Price, Gross Commission, Billing Total
2. Known extreme: $4.08B confirmed as anomaly (median $3,300)
3. Output columns: `is_outlier_price`, `is_outlier_commission`, etc.
4. Zero records deleted by this step

#### Story 2.4: Data Type Correction
As a data engineer,
I want automatic dtype detection and conversion for dates, numerics, booleans, and identifiers,
so that all columns have correct types for downstream feature engineering.

**Acceptance Criteria:**
1. Date strings → datetime64, numeric strings (with comma/dollar) → float64, boolean-like → bool
2. UEN/Phone numbers preserved as string
3. File Number format validated (F-XXXX-XXXXXYYY)

---

### Epic 3: Feature Engineering & Labeling

**Objective:** Engineer three distinct feature sets (tabular for A1-A3, temporal for A4-A6, meta for C3) and construct anomaly labels from 7 identified sources, producing ~350 real positive samples with binary and multi-class labels.

#### Story 3.1: Tabular Features
As a data scientist,
I want numeric, encoded categorical, ratio, and cross features computed for each transaction,
so that models A1-A3 have rich flat feature vectors.

**Acceptance Criteria:**
1. `src/data/features_tabular.py` produces LabelEncoder for low-cardinality, Target/Frequency encoding for high-cardinality
2. Ratio features: `commission_to_price_ratio`, `billing_to_commission_ratio`, `tax_to_billing_ratio`
3. Cross features: `price_per_sqft`, `days_to_completion`, `days_to_payment`

#### Story 3.2: Temporal Features
As a data scientist,
I want time-based features extracted from Submit Time (2012-2024),
so that models A4-A6 capture seasonality, trends, and temporal patterns.

**Acceptance Criteria:**
1. `src/data/features_temporal.py` extracts month, quarter, year, day_of_week, is_weekend, days_since_epoch
2. Lag features: lag-1, lag-3, lag-6, lag-12
3. Rolling features: mean/std/min/max with windows 3, 6, 12 months
4. Seasonality indicators: Q1-Q4, peak season flag

#### Story 3.3: Meta Features
As a data scientist,
I want dataset-level meta features computed for the C3 data-type classifier,
so that the classifier can distinguish time-series from tabular data.

**Acceptance Criteria:**
1. `src/data/features_meta.py` computes: `datetime_ratio`, `is_sorted_by_time`, `avg_autocorrelation`, `has_regular_interval`, `adf_stationary`, `numeric_ratio`, `categorical_ratio`, `n_rows`, `n_cols`

#### Story 3.4: Anomaly Label Engineering
As a data scientist,
I want anomaly labels constructed from 7 identified sources mapped to binary and multi-class columns,
so that models have ground truth for supervised and semi-supervised training.

**Acceptance Criteria:**
1. Labels sourced from: HIGH_RISK (2), PRICE_OUTLIER (~5-10), ABORTED_TXN (22), SUSPICIOUS_DRAFT (~239), BILLING_MISMATCH (45), DUPLICATE_INVOICE (63), MISSING_INVOICE (74)
2. Binary column `is_anomaly` (0/1) — ~350+ positives
3. Multi-class column `anomaly_type` (7 categories)
4. Expected imbalance: ~0.7% positive rate

---

### Epic 4: Dataset Merging & Time-Series Processing

**Objective:** Merge XLSX and CSV transaction files, join enrichment tables, create consolidated master datasets, then aggregate into monthly time-series and sliding windows for temporal models.

#### Story 4.1: Merge XLSX Transaction Files
As a data engineer,
I want the 2 XLSX files aligned and concatenated with source tracking,
so that all transaction data is in one dataset.

**Acceptance Criteria:**
1. Column alignment between 143-col and 145-col files, identifying 2 extra cols (incl. `high_risk`)
2. Output: `data/processed/merged_transactions.parquet` (~4,627 rows × ~145 cols)
3. `source_file` column tracks origin

#### Story 4.2: Merge CSV Transaction Files
As a data engineer,
I want 3 CSV transaction files merged and deduplicated by File Number,
so that CSV-sourced transactions are consolidated.

**Acceptance Criteria:**
1. Merges: `all_transactions_detailed_report.csv` (7,247), `project_transactions_detailed_report.csv` (679), `referral_non_project_transactions.csv` (401)
2. Deduplicated on File Number
3. Output: `data/processed/merged_csv_transactions.parquet`

#### Story 4.3: Join Enrichment Tables
As a data engineer,
I want client, property, invoice, and payee data joined to transactions,
so that the master dataset is fully enriched for feature engineering.

**Acceptance Criteria:**
1. Joins: `client_data_with_type.csv`, `merged_properties_infomation.csv`, `invoice_snre_data_summary_v2.csv`, `payee_role_links.csv`
2. Primary join key: File Number; fuzzy backup: Client Name + Property Address
3. Output: `data/processed/enriched_transactions.parquet`

#### Story 4.4: Master Dataset Creation
As a data engineer,
I want 3 master datasets produced with full anomaly labels and lineage tracking,
so that each model family has its dedicated input.

**Acceptance Criteria:**
1. `master_tabular.parquet` (flat features for A1-A3)
2. `master_timeseries.parquet` (time-indexed for A4-A6)
3. `master_meta.parquet` (meta features for C3)
4. Data lineage logged: source → processing steps → output

#### Story 4.5: Monthly Time-Series Aggregation
As a data scientist,
I want transactions aggregated by month with key metrics,
so that temporal models have ~144 monthly data points.

**Acceptance Criteria:**
1. Metrics: txn_count, total_price, avg_commission, anomaly_count, anomaly_ratio, unique_agents, rental_ratio
2. Missing months handled (fill 0 or interpolate)
3. Output: `data/processed/monthly_timeseries.parquet`

#### Story 4.6: Sliding Window Creation
As a data scientist,
I want sliding windows generated from the monthly time-series,
so that TranAD/BiLSTM models receive properly shaped input tensors.

**Acceptance Criteria:**
1. `src/data/windowing.py` with configurable window_size (default 12) and stride (default 1)
2. Output shape: `[N_windows, window_size, n_features]`
3. Window labeled anomaly if it contains any anomaly month
4. Output: `windows_train.pt`, `windows_val.pt`, `windows_test.pt`

---

### Epic 5: Augmentation, Splitting & Output

**Objective:** Inject synthetic anomalies to raise the anomaly rate from ~0.7% to 3-5%, split data properly (stratified/chronological with no leakage), scale features, build PyTorch Dataset classes, and validate final data quality.

#### Story 5.1: Template-based Anomaly Injection
As a data scientist,
I want synthetic anomalies generated by perturbing the 2 known high_risk records,
so that the training set has more diverse anomaly examples.

**Acceptance Criteria:**
1. Perturbation: price [2x-100x], commission outside normal range, status randomized, impossible dates
2. ~200-300 synthetic records injected
3. All flagged `is_synthetic = True`

#### Story 5.2: Rule-based Anomaly Injection
As a data scientist,
I want additional anomalies injected based on business rules,
so that the model learns domain-specific anomaly patterns.

**Acceptance Criteria:**
1. Rules: commission >10% of price, billing > commission, price <$100, lease start > expiry, duplicate File Numbers with different amounts
2. ~100-200 additional records
3. Output: `data/processed/augmented_master.parquet`

#### Story 5.3: Anomaly Distribution Validation
As a data scientist,
I want the post-injection anomaly distribution validated and visualized,
so that I can confirm the target 3-5% rate is met.

**Acceptance Criteria:**
1. Total: ~650-850 anomalies / ~47K records
2. Visualization: anomaly types, temporal spread, feature space distribution

#### Story 5.4: Train/Val/Test Split
As a data engineer,
I want data split with stratification (tabular) and chronological ordering (time-series), with synthetic data in Train only,
so that evaluation sets reflect real-world conditions without leakage.

**Acceptance Criteria:**
1. Tabular: 70/15/15 stratified split
2. Time-series: Train 2012-2021, Val 2022-2023H1, Test 2023H2-2024
3. Synthetic data in Train only, real anomalies distributed across Val/Test
4. Output: features (X) + labels (y) + metadata per split

#### Story 5.5: Scaling & Normalization
As a data engineer,
I want scalers fit on Train only and applied to Val/Test,
so that there is no data leakage from scaling.

**Acceptance Criteria:**
1. StandardScaler, MinMaxScaler(-1,1) for GAN, RobustScaler for outlier-heavy data
2. Scaler objects saved: `models/scaler_standard.pkl`, `models/scaler_gan.pkl`
3. Val/Test transformed only — never fit

#### Story 5.6: PyTorch Dataset Classes
As a ML engineer,
I want Dataset classes for each model family with DataLoader factory,
so that training scripts can load data with a single line.

**Acceptance Criteria:**
1. `TabularAnomalyDataset` returns (features_tensor, anomaly_label, metadata_dict)
2. `TimeSeriesAnomalyDataset` returns (window_tensor, window_label, timestamps)
3. `MetaFeatureDataset` returns (meta_features, data_type_label)
4. DataLoader factory with configurable batch_size, shuffle, num_workers

#### Story 5.7: Data Quality Validation & Report
As a data engineer,
I want automated validation checks and a quality report before training begins,
so that no corrupted or leaked data reaches the models.

**Acceptance Criteria:**
1. Checks: no NaN/Inf, anomaly rate >1%, no train/val/test overlap, scaler fitted correctly, tensor shapes match
2. `DATA_QUALITY_REPORT.md` generated with: dataset stats, feature distributions, correlation matrix, data lineage diagram
