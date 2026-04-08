# Detection Model Training Plan — V7 (Updated)

python3 csv_agent_platform/detection/scripts/run_pipeline.py

**Ngày tạo**: 2026-04-07 | **Cập nhật lần cuối**: 2026-04-07 15:39
**Tác giả**: Tomoe — AI Mentor (IUH Thesis Project)
**Phạm vi V7**: Train trên tất cả transactions **trừ Sale** (giữ Non-Project, Rental, Referral, Project)
**Mục tiêu**: Tabular F1 ≥ 0.80 | TS F1 ≥ 0.95 | Anomaly rate 2–4%

---

## 1. 📊 Đánh Giá Dataset Mới (Sau Pipeline Run 07-04-2026)

### 1.1 Dữ Liệu Thô (Raw)

#### Nguồn Dữ Liệu

| Thư mục             | Số files | Tổng dung lượng | Ghi chú                                                          |
| ------------------- | -------- | --------------- | ---------------------------------------------------------------- |
| `data/raw/normal/`  | 30 files | ~ 25 MB         | **MỚI**: `rent_transactions_enriched.csv` (11.4 MB, 61,984 rows) |
| `data/raw/snre/`    | 17 files | ~ 7 MB          | Có duplicate files (\*copy.csv)                                  |
| `data/raw/prosage/` | 34 files | ~ 18 MB         | XLSX + CSV (transactions, invoices, contacts)                    |

#### 🆕 File Mới: `rent_transactions_enriched.csv`

| Metric      | Giá trị                                                                                                                                                                                                                                                                                             |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Rows**    | **61,984** (file lớn nhất trong toàn bộ dataset!)                                                                                                                                                                                                                                                   |
| **Columns** | 23                                                                                                                                                                                                                                                                                                  |
| **Các cột** | Transaction No, Block, Floor, Unit Number, Postal Code, Property Type, Transaction Date, Represented, Registration Number, Sale/Rental Type, Submission Date, Resubmission Date, Transaction Price, Status, Project Name, bedrooms, bathrooms, floorArea, psf, district, region, intentType, tenure |

> [!IMPORTANT]
> File này có cấu trúc **CEA rental data** — chứa thông tin vật lý bất động sản (bedrooms, bathrooms, floorArea, psf) và vị trí (district, region). Đây là nguồn data **rất giá trị** cho anomaly detection rental.

---

### 1.2 Sau Pipeline Processing

#### Enriched Dataset (Merged + Labels)

| Metric         | V6 (Cũ)           | V7 (Mới)              | Thay đổi         |
| -------------- | ----------------- | --------------------- | ---------------- |
| **Total rows** | 9,992             | **26,863**            | **+169%**        |
| **Columns**    | 570               | **597**               | +27 features mới |
| **Date range** | 2012-05 → 2024-10 | **2012-05 → 2025-11** | +13 tháng data   |

#### Transaction Type Distribution (Enriched)

| Transaction Type                                  | Count      | %         |
| ------------------------------------------------- | ---------- | --------- |
| **None** (rental from rent_transactions_enriched) | **17,524** | **65.2%** |
| Non-Project                                       | 4,574      | 17.0%     |
| Rental                                            | 3,871      | 14.4%     |
| Project                                           | 492        | 1.8%      |
| Referral Non-Project                              | 400        | 1.5%      |
| Other                                             | 2          | 0.01%     |

> [!WARNING]
> **17,524 rows có transaction_type = "None"** — đây chính là data từ file `rent_transactions_enriched.csv` mới. Cần xác minh đây là **Rental transactions** và gán label `transaction_type = 'Rental'` trong schema standardizer.

#### Anomaly Distribution (Enriched)

| Anomaly Type                  | Count   | % Anomaly         |
| ----------------------------- | ------- | ----------------- |
| PRICE_OUTLIER                 | 99      | 28.9%             |
| AGENT_VELOCITY                | 87      | 25.4%             |
| ABORTED_TXN                   | 38      | 11.1%             |
| HIGH_COMMISSION_RATIO         | 34      | 9.9%              |
| PRICE_AREA_DEVIATION          | 34      | 9.9%              |
| FAST_COMPLETION               | 19      | 5.5%              |
| EXTREME_LEASE_DURATION        | 16      | 4.7%              |
| PRICE_OUTLIER\|AGENT_VELOCITY | 8       | 2.3%              |
| PRICE_OUTLIER\|ABORTED_TXN    | 7       | 2.0%              |
| ABORTED_TXN\|FAST_COMPLETION  | 1       | 0.3%              |
| **Total anomalies**           | **343** | **1.28% overall** |

#### Sale Transactions (Separated)

| Metric     | Giá trị                         |
| ---------- | ------------------------------- |
| **Rows**   | 10,459                          |
| **File**   | `sale_transactions_raw.parquet` |
| **Status** | ✅ Tách riêng thành công        |

---

### 1.3 Augmented & Split Statistics

#### Augmented Master

| Metric            | Giá trị     |
| ----------------- | ----------- |
| **Total rows**    | 27,263      |
| Real rows         | 26,863      |
| Synthetic rows    | 400         |
| **Anomaly count** | 743 (2.73%) |

#### Tabular Split (Sau Feature Selection + Scaling)

| Split     | Rows       | Features | Anomaly Count | Anomaly Rate |
| --------- | ---------- | -------- | ------------- | ------------ |
| **Train** | **19,204** | 50       | 640           | **3.33%** ✅ |
| **Val**   | **4,029**  | 50       | 51            | **1.27%** ⚠️ |
| **Test**  | **4,030**  | 50       | 52            | **1.29%** ⚠️ |

> [!CAUTION]
> **Val/Test anomaly rate (1.27–1.29%) thấp hơn nhiều so với Train (3.33%)**. Nguyên nhân: data mới (rent_transactions_enriched) chủ yếu vào val/test và hầu hết là normal. Cần **stratified split lại** sao cho các split đồng đều anomaly rate.

#### Time-Series Split

| Split     | Windows | Window Size | Features | Anomaly Count | Anomaly Rate |
| --------- | ------- | ----------- | -------- | ------------- | ------------ |
| **Train** | 1,968   | 4           | 90       | **0**         | **0.00%** ❌ |
| **Val**   | 106     | 4           | 90       | **0**         | **0.00%** ❌ |
| **Test**  | 106     | 4           | 90       | **17**        | **16.04%**   |

> [!CAUTION]
> **CRITICAL BUG**: TS Train có **0 anomaly windows**! TS Val cũng **0**. Toàn bộ 17 anomalies nằm ở test → model sẽ **không học được gì** trong training. Nguyên nhân: monthly aggregation không gán label đúng cho các tháng có anomaly transactions. **PHẢI FIX TRƯỚC KHI TRAINING.**

#### Monthly Time-Series

| Metric             | Giá trị                 |
| ------------------ | ----------------------- |
| Data points        | 707                     |
| Features per point | 91                      |
| Date range         | 2012-05-14 → 2025-11-24 |
| **Span**           | ~13.5 năm               |

---

## 2. ⚠️ Các Vấn Đề Cần Fix TRƯỚC Khi Training

### P0: CRITICAL — Must Fix

| #   | Vấn đề                                                  | Impact                          | Giải pháp                                                                                                       |
| --- | ------------------------------------------------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 1   | **TS train = 0 anomaly**                                | Model TS không train được       | Fix `anomaly_ratio` trong monthly aggregation → assign label dựa trên tỷ lệ anomaly transactions trong tháng đó |
| 2   | **Val/Test anomaly rate mất cân bằng** (1.27% vs 3.33%) | Val/Test metrics không reliable | Dùng **stratified split by is_anomaly** đảm bảo anomaly rate đồng đều ~2.7% trên cả 3 splits                    |
| 3   | **File_number leak** (train↔val: 51, train↔test: 49)    | Data leakage                    | Split by unique file_number (group-based split)                                                                 |

### P1: HIGH — Should Fix

| #   | Vấn đề                                                                            | Impact                         | Giải pháp                                                                                               |
| --- | --------------------------------------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------- |
| 4   | **17,524 rows transaction_type=None**                                             | Model không biết đây là Rental | Trong schema standardizer, gán `transaction_type='Rental'` cho data từ `rent_transactions_enriched.csv` |
| 5   | **Anomaly rate tổng thể thấp (1.28% enriched, 2.73% augmented)** → dưới target 3% | Under-detection risk           | Tăng synthetic injection hoặc giảm anomaly threshold trong label engineering                            |
| 6   | **Duplicate SNRE files** (copy.csv)                                               | Inflate data count             | Loại bỏ duplicate files hoặc deduplicate bằng transaction_no                                            |
| 7   | **Window_size=4 quá nhỏ** cho monthly data                                        | Model TS thiếu context         | Tăng window_size=6 hoặc 8 (đủ data points: 707 months)                                                  |

---

## 3. 🔧 Kế Hoạch Xử Lý Data V7

### 3.1 Data Filtering Strategy

```
Enriched dataset (26,863 rows):
                        │
    ┌───────────────────┴───────────────────┐
    │                                       │
 INCLUDE (V7 Training)              EXCLUDE (V7)
    │                                       │
 ├── "None" (17,524)                 └── Sale (10,459)
 │   → Gán thành "Rental"                đã tách riêng vào
 │   (từ rent_transactions_              sale_transactions_raw.parquet
 │    enriched.csv)
 ├── "Non-Project" (4,574) ✅
 ├── "Rental" (3,871) ✅
 ├── "Project" (492) ✅
 ├── "Referral Non-Project" (400) ✅
 └── "Other" (2) ✅

 Total V7: ~26,863 rows (toàn bộ enriched, vì Sale đã tách)
```

> [!IMPORTANT]
> **V7 sử dụng toàn bộ non-sale data (26,863 rows)** — chỉ loại Sale (đã tách riêng). Giữ lại Non-Project và Referral để model học đa dạng transaction types.

### 3.2 Improved Split Strategy

```python
# V7 Split: Stratified + Group-based (no file_number leak)
from sklearn.model_selection import StratifiedGroupKFold

splitter = StratifiedGroupKFold(n_splits=5, shuffle=True, random_state=42)
# groups = file_number (đảm bảo không leak)
# stratify = is_anomaly (đảm bảo anomaly rate đều)
# Fold 1: val (20%), Fold 2: test (20%), Folds 3-5: train (60%)

# Target (toàn bộ 26,863 non-sale rows):
# Train: ~18,804 rows (70%), anomaly ~2.7%
# Val:   ~4,029 rows (15%), anomaly ~2.7%
# Test:  ~4,030 rows (15%), anomaly ~2.7%
```

### 3.3 Feature Engineering Updates

**Features mới từ `rent_transactions_enriched.csv`:**

| Feature     | Loại        | Ý Nghĩa cho Anomaly Detection                                   |
| ----------- | ----------- | --------------------------------------------------------------- |
| `bedrooms`  | Numeric     | Rental property size — outlier bedrooms = potential data error  |
| `bathrooms` | Numeric     | Cross-validate với bedrooms (6 bedrooms + 1 bathroom = anomaly) |
| `floorArea` | Numeric     | Price per sqft validation                                       |
| `psf`       | Numeric     | **KEY**: Price per square foot — PRICE_AREA_DEVIATION           |
| `district`  | Categorical | Location-based price validation                                 |
| `region`    | Categorical | Regional price benchmarking                                     |
| `tenure`    | Categorical | Freehold vs Leasehold affects price                             |

**Feature Selection Target**: 50 features (đã có) → giữ nguyên hoặc mở rộng lên 60 nếu features mới có MI score cao.

### 3.4 Synthetic Injection Adjustment

```yaml
# V7 Synthetic Config
synthetic:
  enabled: true
  # Hiện tại: 400 synthetic / 26,863 real = 1.5% synthetic ratio
  # Anomaly rate: 2.73% (dưới target 3%)
  # → Cần thêm synthetic hoặc điều chỉnh label threshold
  target_anomaly_rate: 0.035 # Target 3.5%
  max_synthetic_ratio: 0.05 # Tối đa 5% synthetic
  types:
    - PRICE_OUTLIER # Cao nhất: 99 real samples
    - AGENT_VELOCITY # 87 real samples
    - PRICE_AREA_DEVIATION # 34 real — cần augment nhiều hơn
    - EXTREME_LEASE_DURATION # 16 real — cần augment
```

---

## 4. 🤖 Kế Hoạch Training V7

### 4.1 Architecture Overview

```
        TRAINING V7: All Non-Sale Transactions (~26,863 rows)
                              │
              ┌───────────────┴────────────────┐
              │                                │
       TABULAR BRANCH                 TIME-SERIES BRANCH
       (Per-transaction)              (Monthly windows)
       Train: ~19K rows               ~707 months → ~700 windows
              │                                │
       ┌──────┴──────┐               ┌────────┴────────┐
       │             │               │                 │
     A2_DAE      A3_VAE         A5_BiLSTM          A4_TranAD
    (Primary)   (Support)       (Primary)          (Support)
       │             │               │                 │
       └──────┬──────┘               └────────┬────────┘
              │                                │
         A6_Ensemble                    A9_Hybrid v2
     (Weighted A2+A3)             (Fixed TS→Tab mapping)
```

### 4.2 A2_DAE — Tabular Primary

| Param              | V2 (old)         | V7 (new)                    | Lý do                                           |
| ------------------ | ---------------- | --------------------------- | ----------------------------------------------- |
| **Input features** | 75               | **50**                      | MI selection đã chọn top 50                     |
| hidden_dims        | [256,128,64]     | **[256,128,64]**            | Dataset lớn hơn (19K rows) → giữ kiến trúc mạnh |
| dropout            | 0.2              | **0.25**                    | Nhẹ tăng regularization                         |
| noise_std          | 0.15             | **0.18**                    | Moderate denoising                              |
| epochs             | 200              | **300**                     | More data → cần thêm epochs                     |
| lr                 | 1e-3             | **5e-4**                    | Stable learning                                 |
| scheduler          | CosineAnnealing  | **OneCycleLR(max_lr=1e-3)** | Tốt cho dataset lớn                             |
| batch_size         | 64               | **128**                     | Dataset lớn hơn → batch lớn hơn                 |
| class_weight       | {0:0.55, 1:5.45} | **{0:0.52, 1:15.0}**        | Rate 3.33% → weight ~30x                        |

**Mục tiêu**: F1 ≥ 0.80, AUC ≥ 0.96

### 4.3 A3_VAE — Tabular Support

| Param         | V2           | V7                                  | Lý do                      |
| ------------- | ------------ | ----------------------------------- | -------------------------- |
| hidden_dims   | [256,128,64] | **[256,128,64]**                    | Giữ nguyên (dataset lớn)   |
| latent_dim    | 32           | **24**                              | Moderate compression       |
| **beta**      | **0.3** ❌   | **0.5** ✅                          | **FIX: quay lại V1 value** |
| beta_schedule | None         | **linear_warmup(0→0.5, 50 epochs)** | Tránh KL collapse          |
| dropout       | 0.2          | **0.25**                            | Regularization             |

**Mục tiêu**: F1 ≥ 0.65, AUC ≥ 0.95
**So sánh V1 → V2 → V7**: V1 beta=0.5 (F1=0.671), V2 beta=0.3 (F1=0.571 ❌), V7 beta=0.5 (target ≥0.65)

### 4.4 A5_BiLSTM — Time-Series Primary

| Param           | V2  | V7      | Lý do                     |
| --------------- | --- | ------- | ------------------------- |
| window_size     | 12  | **6**   | Tạo nhiều windows hơn     |
| **TS features** | 85  | **90**  | Thêm features từ new data |
| lstm_hidden     | 128 | **64**  | Tránh overfit             |
| n_lstm_layers   | 2   | **2**   | Giữ nguyên                |
| attention_heads | 4   | **4**   | Giữ nguyên                |
| dropout         | 0.2 | **0.3** | Tăng regularization       |
| batch_size      | 32  | **32**  | Đủ windows                |

**Critical**: Phải fix TS label assignment trước! Hiện tại train=0 anomaly.

**Mục tiêu**: F1 ≥ 0.95 (với test ≥ 100 windows — ĐÃ ĐẠT)

### 4.5 A4_TranAD — Time-Series Support

| Param           | V7  |
| --------------- | --- |
| window_size     | 6   |
| d_model         | 64  |
| nhead           | 4   |
| num_layers      | 2   |
| dim_feedforward | 128 |

**Mục tiêu**: F1 ≥ 0.95

### 4.6 A6_Ensemble & A9_Hybrid

**A6_Ensemble**: Weighted average A2+A3, weights learned from val F1.

**A9_Hybrid v2**: Fix mapping bug (np.tile → submit_time join).

```python
# V7 fix: map transaction → window bằng submit_time
df['window_id'] = df['submit_time'].apply(
    lambda t: find_nearest_window(t, window_timestamps)
)
df['ts_score'] = df['window_id'].map(window_anomaly_scores)
# hybrid = α * tab_score + (1-α) * ts_score
```

---

## 5. 📅 Timeline & Checklist

### PHASE 1: DATA FIX (1 ngày)

- [ ] Fix `transaction_type=None` → assign `'Rental'` cho data từ `rent_transactions_enriched.csv`
- [ ] Fix TS label: monthly anomaly labeling dựa trên ratio anomaly transactions / total trong tháng đó
- [ ] Fix stratified split: anomaly rate đồng đều 3 splits (~2.7%)
- [ ] Fix file_number leak: group-based split
- [ ] Loại bỏ duplicate SNRE files (copy.csv)

### PHASE 2: TABULAR TRAINING (2–3 ngày)

- [ ] A2_DAE V7: train + threshold optimization → F1 ≥ 0.80
- [ ] A3_VAE V7: fix beta=0.5, KL annealing → F1 ≥ 0.65
- [ ] A6_Ensemble V7: learned weights → F1 ≥ 0.78
- [ ] Lưu checkpoints, loss curves, confusion matrices

### PHASE 3: TIME-SERIES TRAINING (1–2 ngày)

- [ ] A5_BiLSTM V7: window=6 → F1 ≥ 0.95
- [ ] A4_TranAD V7 → F1 ≥ 0.95
- [ ] Verify: train anomaly > 0, val anomaly > 0

### PHASE 4: HYBRID + EVALUATION (1 ngày)

- [ ] A9_Hybrid v2: fix submit_time mapping → F1 ≥ 0.70
- [ ] So sánh V2 → V7
- [ ] Viết DETECTION_TRAINING_REPORT_V7.md

---

## 6. 🎯 Target Metrics V7

### So Sánh Data Scale

| Metric           | V2          | V7              | Thay đổi        |
| ---------------- | ----------- | --------------- | --------------- |
| Train rows       | 6,868       | **19,204**      | **+180%**       |
| Val rows         | 1,472       | **4,029**       | **+174%**       |
| Test rows        | 1,472       | **4,030**       | **+174%**       |
| Train anomaly    | 297 (9.17%) | **640 (3.33%)** | Rate ✅ tốt hơn |
| Features         | 51          | **50**          | Tương đương     |
| TS windows train | 420         | **1,968**       | **+369%**       |
| TS windows val   | 3           | **106**         | **+3433%**      |
| TS windows test  | 2           | **106**         | **+5200%**      |

### Model Targets

| Model       | V2 F1   | V7 Target  | Chiến lược chính                                       |
| ----------- | ------- | ---------- | ------------------------------------------------------ |
| A2_DAE      | 0.620   | **≥ 0.80** | +180% data, OneCycleLR, class weight 15x               |
| A3_VAE      | 0.571   | **≥ 0.65** | Fix beta=0.5 + KL warmup                               |
| A5_BiLSTM   | 0.980\* | **≥ 0.95** | \*V2 unreliable (2 test windows), V7: 106 test windows |
| A4_TranAD   | 0.980\* | **≥ 0.95** | Same as above                                          |
| A6_Ensemble | 0.606   | **≥ 0.78** | Learned weights                                        |
| A9_Hybrid   | 0.340   | **≥ 0.70** | Fix mapping bug                                        |

---

## 7. 💡 Insights Cho Thesis

### Data Scale Jump — Điểm Mạnh V7

```
V2 Dataset:  6,868 train rows (mixed types, including sale)
V7 Dataset: 19,204 train rows (all non-sale: Rental + Non-Project + Project + Referral)
                 ↑ +180% data = better generalization

V2 TS Test:   2 windows → metric NOT reliable ❌
V7 TS Test: 106 windows → metric RELIABLE ✅

V2 Features: Sale + Rental + Non-Project mixed → sale price noise
V7 Features: Non-sale focused → cleaner signal (sale separated)
```

### Số Liệu Cho Thesis Defense

```
Dataset V7:    26,863 enriched (all non-sale transactions)
               19,204 train | 4,029 val | 4,030 test
               Anomaly rate: 3.33% (train)
               50 selected features via MI + correlation filter
               707 monthly TS points → 1,968 train TS windows
               Types: Rental 21,395 + Non-Project 4,574 + Project 492 + Referral 400

🆕 New data:   rent_transactions_enriched.csv (61,984 rows, 23 cols)
               CEA property data: bedrooms, bathrooms, floorArea, psf
               District + Region for location-based anomaly detection
```

---

## 8. ⚠️ Rủi Ro và Mitigation

| Rủi Ro                                              | Xác Suất | Impact       | Mitigation                                                   |
| --------------------------------------------------- | -------- | ------------ | ------------------------------------------------------------ |
| TS train 0 anomaly → model không train được         | **100%** | **CRITICAL** | **PHẢI fix label assignment** trước training                 |
| Val/Test anomaly rate mất cân bằng                  | **100%** | HIGH         | Stratified split lại                                         |
| Project subset nhỏ (492/26,863 = 1.8%)              | HIGH     | MEDIUM       | Oversample project; evaluate per transaction_type separately |
| rent_transactions_enriched không có commission data | MEDIUM   | HIGH         | Chỉ dùng price/area features cho records này                 |
| Overfitting A2_DAE trên data imbalanced             | MEDIUM   | MEDIUM       | Class weight 15x + dropout 0.25 + early stopping             |

---

_Plan được update tự động dựa trên pipeline run 07-04-2026 15:36._
_Implemented by: Tomoe AI Mentor — IUH CSV AI Platform Thesis Project_
