# Detection Model Training Plan — V7

**Ngày tạo**: 2026-04-07
**Tác giả**: Tomoe — AI Mentor (IUH Thesis Project)
**Phạm vi V7**: Chỉ train trên `Project` + `Rental` transactions (loại bỏ Non-Project, Sale, Referral)
**Mục tiêu**: Tabular F1 ≥ 0.80 | TS F1 ≥ 0.98 | Anomaly rate 3–5%

---

## 1. 📊 Đánh Giá Dataset Sau Khi Chia Lại

### 1.1 Tổng Quan Dữ Liệu Sau Split Mới

#### Dataset Gốc (enriched_transactions.parquet)
| Metric | Giá Trị |
|--------|---------|
| Tổng rows | 9,992 |
| Tổng columns | 570 |
| Các transaction type | Non-Project (4,574), Rental (3,871), None/Other (655), Project (492), Referral Non-Project (400) |
| Sale transactions (separated) | **10,459 rows** → `sale_transactions_raw.parquet` |
| is_anomaly (toàn bộ) | 255 anomaly / 9,737 normal (2.55%) |

#### Split V7: Chỉ Project + Rental
| Metric | Giá Trị |
|--------|---------|
| **Tổng rows** | **4,363** |
| Rental | 3,871 (88.7%) |
| Project | 492 (11.3%) |
| Anomaly count | 169 (3.87%) ✅ |
| Normal count | 4,194 (96.13%) |
| Numeric features available | 249 |
| Date range (submit_time) | 2012-05-17 → 2024-10-11 (12+ năm) |

**✅ Anomaly rate 3.87% — NẰM TRONG TARGET ZONE (3–5%)**. Đây là lý do chính để lọc chỉ Project + Rental.

#### Loại Anomaly Trong Subset V7
| Anomaly Type | Count | % trong anomaly |
|-------------|-------|-----------------|
| AGENT_VELOCITY | 87 | 51.5% |
| PRICE_AREA_DEVIATION | 34 | 20.1% |
| ABORTED_TXN | 19 | 11.2% |
| HIGH_COMMISSION_RATIO | 16 | 9.5% |
| EXTREME_LEASE_DURATION | 13 | 7.7% |

**Nhận xét**: AGENT_VELOCITY chiếm >50% — liên quan đến hành vi bất thường của agent (giao dịch quá nhanh/nhiều). PRICE_AREA_DEVIATION là bất thường giá thuê theo khu vực. Các loại này đều **có ý nghĩa thực tế cao** cho đề tài.

---

### 1.2 Vấn Đề Của Dataset V6 (Trước Khi Split)

| Vấn Đề | Severity | Mô Tả |
|---------|----------|-------|
| ❌ Anomaly rate 9.17% (train) | CRITICAL | Vượt ngưỡng 3–5%, model bị bias |
| ❌ TS windows quá ít: train=420, val=3, test=2 | CRITICAL | Val/test TS không đại diện — kết quả sai lệch |
| ⚠️ 234 cặp features tương quan >0.95 | HIGH | Multicollinearity → model overfit noise |
| ⚠️ Leak dữ liệu train↔val (15 file_number) và train↔test (22 file_number) | HIGH | Test leakage → metric không đáng tin |
| ⚠️ Gộp Sale + Non-Sale + Rental → features không đồng nhất | MEDIUM | Model học pattern sai (e.g. sale price >> rental price) |
| ⚠️ Constant features: buyer_company_reg_no_encoded, buyer_country... | LOW | Loại bỏ trước training |

### 1.3 Lý Do Chọn Project + Rental Cho V7

```
Toàn bộ dataset (9,992):
├── Sale transactions (10,459 rows) → Tách riêng (sale_transactions_raw.parquet)
│   Lý do: Sale có price range rất khác (SGD millions vs rental SGD thousands)
│           → nếu gộp, model bị confuse giữa "price cao là anomaly" vs "price cao là sale thường"
│
├── Non-Project (4,574) → LOẠI B khỏi V7
│   Lý do: Mixed transaction types, không có đặc trưng rõ ràng cho anomaly detection
│
├── Referral Non-Project (400) → LOẠI
│   Lý do: Referral không có transaction_price trực tiếp → features thiếu
│
└── Project (492) + Rental (3,871) = 4,363 rows → ✅ DÙNG CHO V7
    Lý do:
    - Đều có đầy đủ: transaction_price, commission, agent_info, dates
    - Anomaly semantics rõ ràng: AGENT_VELOCITY, PRICE_AREA_DEVIATION, EXTREME_LEASE_DURATION
    - Anomaly rate 3.87% — balanced và thực tế
    - Date range 12 năm → đủ cho time-series monthly aggregation
```

---

## 2. 🔧 Kế Hoạch Xử Lý Data Cho V7

### 2.1 Data Split Strategy

**Nguyên tắc**: Không leak — split theo file_number (strict stratified split).

```
Project + Rental subset: 4,363 rows
├── TRAIN: 70% = 3,054 rows (Anomaly ~119, rate 3.9%)
├── VAL:   15% = 655 rows  (Anomaly ~25, rate 3.8%)
└── TEST:  15% = 654 rows  (Anomaly ~25, rate 3.8%)

Split method: Stratified by is_anomaly + by transaction_type (đảm bảo Project không bị out)
Constraint: Không có file_number nào xuất hiện ở cả 2 splits
```

**Time-Series Split** (chiều theo thời gian — KHÔNG random):
```
Monthly aggregation từ submit_time: ~90 tháng (2016–2024)
(Lọc 2016+ vì trước đó data thưa cho Project + Rental)

Window size: 6 tháng (stride 1) → ~84 windows total
├── TRAIN: 2016-01 → 2022-12 = ~84 windows × 0.70 = ~59 windows
├── VAL:   2023-01 → 2023-06 = ~6 windows
└── TEST:  2023-07 → 2024-10 = ~15 windows

⚠️ So sánh với V6: TS val=3, test=2 → V7 target: val≥6, test≥12
```

### 2.2 Feature Engineering Pipeline Mới

**Bước 1: Xóa Noise Features**
```python
drop_features = [
    # Constant features
    'buyer_company_reg_no_encoded',
    'buyer_country_of_incorporation_encoded',
    # Không liên quan đến Rental/Project
    'sale_type', 'development_name', ...
    # Tương quan >0.95 (chọn 1 trong mỗi cặp bằng MI score)
]
```

**Bước 2: Feature Selection (V7 version)**

Target: Từ 249 features → chọn **top 60–80 features**
- Mutual Information (MI) với is_anomaly
- Correlation filter (<0.90 giữa các features)
- Domain knowledge: giữ lại các features có ý nghĩa kinh doanh

**Top Features Dự Kiến Cho V7** (từ phân tích domain):

| Feature | Lý Do |
|---------|-------|
| `transaction_price` | Core anomaly signal |
| `gross_commission` | COMMISSION_SPLIT_MISMATCH |
| `commission_to_price_ratio` | HIGH_COMMISSION_RATIO |
| `agent_txn_count_30d` | AGENT_VELOCITY |
| `days_between_txn` | AGENT_VELOCITY |
| `price_change_pct` | PRICE_AREA_DEVIATION |
| `lease_duration_days` | EXTREME_LEASE_DURATION |
| `agent_avg_price` | Price deviation baseline |
| `agent_price_deviation` | PRICE_AREA_DEVIATION |
| `number_of_bedrooms` | Rental-specific feature |
| `_biz_rule_violation_count` | Business rule signal |
| `closing_agent_license_number` (validity) | Invalid license |
| `year`, `month` | Temporal seasonality |
| `is_weekend` | Behavioral pattern |

**Bước 3: Synthetic Anomaly Injection (Điều Chỉnh)**

V6 vấn đề: Anomaly rate bị đẩy lên 9.2% do injection quá nhiều.

V7 config:
```yaml
synthetic:
  enabled: true
  target_anomaly_rate: 0.04  # Giữ dưới 4.5% sau injection
  injection_ratio: 0.20       # Tối đa 20% anomaly là synthetic
  types:
    - PRICE_SPIKE       # Đặc trưng cho Rental
    - VELOCITY_BURST    # Đặc trưng cho Project
    - LEASE_EXTREME     # Đặc trưng cho Rental
  # KHÔNG inject MISSING_INVOICE (là noise, không phải anomaly thật)
  # KHÔNG inject SUSPICIOUS_DRAFT (thông tin dư thừa)
```

---

## 3. 🤖 Kế Hoạch Training Models V7

### 3.1 Tổng Quan Model Suite V7

```
                    TRAINING V7 PLAN
                    ─────────────────
        Project + Rental Dataset (4,363 rows)
                        │
          ┌─────────────┴──────────────┐
          │                            │
    TABULAR BRANCH               TIME-SERIES BRANCH
    (Per-transaction)           (Monthly windows)
          │                            │
    ┌─────┴─────┐              ┌───────┴───────┐
    │           │              │               │
   A2_DAE     A3_VAE      A5_BiLSTM        A4_TranAD
  (Primary)  (Support)    (Primary)        (Support)
    │           │              │               │
    └─────┬─────┘              └───────┬───────┘
          │                            │
         A6_Ensemble            A9_Hybrid v2
         (Tabular)            (TS→Tab mapping FIX)
```

### 3.2 A2_DAE (Deep Autoencoder) — TABULAR PRIMARY

**Kết quả V2**: F1=0.620, AUC=0.953 ✅ (Best tabular)
**Mục tiêu V7**: F1 ≥ 0.80, AUC ≥ 0.96

**Changes từ V2 → V7**:

| Param | V2 | V7 | Lý Do |
|-------|----|----|-------|
| hidden_dims | [256, 128, 64] | [128, 64, 32] | Rental data đơn giản hơn, tránh overfit |
| dropout | 0.2 | **0.3** | Regularization mạnh hơn (ít data hơn) |
| noise_std | 0.15 | **0.20** | Denoising mạnh hơn cho robustness |
| epochs | 200 | **300** | Convergence chậm hơn với dropout cao |
| lr | 1e-3 | **5e-4** | Stable learning |
| scheduler | CosineAnnealing(T0=30) | **OneCycleLR** | Tốt hơn cho dataset nhỏ |
| features | 75 (sau selection) | **60–70** (MI + correlation filter) | Loại noise |
| weighted_loss | ✅ | **✅ (w_anomaly ≥ 8x)** | Rate 3.87% → cần weight cao hơn |

```python
# V7 DAE Config
dae_config = {
    "hidden_dims": [128, 64, 32],
    "latent_dim": 16,
    "dropout": 0.3,
    "noise_std": 0.20,
    "activation": "GELU",
    "epochs": 300,
    "lr": 5e-4,
    "batch_size": 64,
    "weight_decay": 1e-4,
    "scheduler": "OneCycleLR",
    "class_weight": {0: 1.0, 1: 8.0},  # 3.87% rate → 1/0.0387 ≈ 25x, dùng 8x cho balance
    "threshold_method": "precision_recall_curve",  # Tối ưu F1
}
```

### 3.3 A3_VAE (Variational Autoencoder) — TABULAR SUPPORT

**Kết quả V2**: F1=0.571, AUC=0.924 ⚠️ (Regression từ V1)
**Mục tiêu V7**: F1 ≥ 0.65, AUC ≥ 0.95

**Root cause V2**: beta=0.3 quá thấp → latent space không smooth → anomaly separation kém.

```python
# V7 VAE Config — FIX BETA
vae_config = {
    "hidden_dims": [128, 64],    # Nhỏ hơn → phù hợp với ~4K rows
    "latent_dim": 16,
    "beta": 0.5,                 # ← Quay lại V1 value (ĐÚNG)
    "beta_schedule": "linear_warmup",  # 0.1 → 0.5 trong 50 epochs
    "dropout": 0.25,
    "epochs": 250,
    "lr": 8e-4,
    "kl_annealing": True,        # Tránh KL vanishing
    "free_bits": 0.5,            # Minimum KL per dimension
}
```

### 3.4 A5_BiLSTM (Bidirectional LSTM + Attention) — TS PRIMARY

**Kết quả V2**: F1=0.980 ✅ (Xuất sắc — nhưng test set chỉ có 2 windows!)
**Mục tiêu V7**: F1 ≥ 0.95, với test set ≥ 12 windows (đáng tin cậy hơn)

**Critical issue V6/V7**: TS val=3, test=2 → không reliable!

**V7 TS Strategy**:
```
Từ 4,363 rows (2012-2024):
- Lọc lấy 2014-2024 (data thưa trước 2014)
- Aggregate monthly → ~120 data points
- Window size: 6 months (stride 1 month)
- Total windows: ~114
  → Train: 80 windows (2014-01 to 2020-12)
  → Val:   17 windows (2021-01 to 2022-05)
  → Test:  17 windows (2022-06 to 2024-10) ✅
```

```python
# V7 BiLSTM Config
bilstm_config = {
    "window_size": 6,           # ← Giảm từ 12 → 6 để có nhiều windows hơn
    "stride": 1,
    "lstm_hidden": 64,          # Nhỏ hơn (ít data hơn)
    "n_lstm_layers": 2,
    "bidirectional": True,
    "attention_heads": 4,
    "dropout": 0.3,
    "epochs": 200,
    "lr": 1e-3,
    "batch_size": 16,
    "ts_features": 40,          # Monthly aggregated features (commission, price, count, etc.)
}
```

### 3.5 A4_TranAD — TS SUPPORT

**Kết quả V2**: F1=0.980 ✅ (Xuất sắc — cùng vấn đề test set nhỏ)
**Mục tiêu V7**: F1 ≥ 0.95, ổn định hơn

```python
# V7 TranAD Config (không đổi nhiều — đã tốt)
tranad_config = {
    "window_size": 6,
    "d_model": 64,              # Giảm từ 128 (dataset nhỏ hơn)
    "nhead": 4,
    "num_layers": 2,
    "dim_feedforward": 128,
    "dropout": 0.2,
    "epochs": 200,
    "lr": 5e-4,
}
```

### 3.6 A6_Ensemble — TABULAR ENSEMBLE

**V7**: Ensemble A2_DAE + A3_VAE với learned weights (thay vì fixed 0.5/0.5)

```python
# V7 Ensemble Strategy
ensemble_config = {
    "models": ["A2_DAE", "A3_VAE"],
    "weight_method": "val_f1_weighted",  # Weight by val F1 of each model
    "threshold_method": "joint_optimization",  # Optimize threshold on val
}
# Expected: if A2 F1=0.80, A3 F1=0.65 → weights ≈ [0.55, 0.45]
```

### 3.7 A9_Hybrid v2 — FIX MAPPING BUG

**V2 bug**: Dùng `np.tile` để repeat TS scores → sai hoàn toàn (mapping random).
**V7 fix**: Join theo `submit_time` → window_id.

```python
# V7 Hybrid Mapping Logic
def map_transaction_to_window(df, ts_scores, window_timestamps):
    """
    Với mỗi transaction, tìm window chứa submit_time của nó.
    TS score của window đó → gán cho transaction.
    """
    df['_window_id'] = df['submit_time'].apply(
        lambda t: find_window(t, window_timestamps, window_size=6)
    )
    df['ts_anomaly_score'] = df['_window_id'].map(ts_scores)
    # Kết hợp: hybrid_score = α * tabular_score + (1-α) * ts_score
    # α được optimize trên val set
    return df
```

---

## 4. 📅 Timeline Training V7

```
PHASE 1: DATA PREPARATION (1-2 ngày)
├── [ ] Filter enriched data → giữ Project + Rental (4,363 rows)
├── [ ] Fix split: stratified by is_anomaly + transaction_type, no file_number leak
├── [ ] Feature selection: MI + correlation → giữ 60-70 features
├── [ ] Adjust synthetic injection: target rate 3.5-4.5%
├── [ ] Monthly aggregation cho TS: window_size=6, stride=1 → ≥17 val/test windows
└── [ ] Kiểm tra: Không NaN, không Inf, leak check

PHASE 2: TABULAR TRAINING (2-3 ngày)
├── [ ] A2_DAE V7: train + threshold optimization → target F1 ≥ 0.80
├── [ ] A3_VAE V7: fix beta=0.5, KL annealing → target F1 ≥ 0.65
├── [ ] A6_Ensemble V7: learned weights → target F1 ≥ 0.78
└── [ ] Lưu checkpoints, loss curves, confusion matrices

PHASE 3: TIME-SERIES TRAINING (1-2 ngày)
├── [ ] Monthly aggregation với Project + Rental subset
├── [ ] A5_BiLSTM V7: window=6 → target F1 ≥ 0.95 (với ≥17 test windows)
├── [ ] A4_TranAD V7: tune → target F1 ≥ 0.95
└── [ ] Kiểm tra: val size ≥ 6, test size ≥ 12

PHASE 4: HYBRID + EVALUATION (1 ngày)
├── [ ] A9_Hybrid v2: fix submit_time mapping → target F1 ≥ 0.70
├── [ ] So sánh V2 → V7 cho tất cả models
├── [ ] Viết DETECTION_TRAINING_REPORT_V7.md
└── [ ] Cập nhật thesis metrics
```

---

## 5. ✅ Training Readiness Checklist

| Check | V6 Status | V7 Target |
|-------|-----------|-----------|
| Anomaly rate 3-5% | ❌ 9.17% | ✅ 3.87% |
| Train size ≥ 1,000 | ✅ 3,238 | ✅ ~3,054 |
| TS test windows ≥ 12 | ❌ 2 windows | ✅ ~17 windows |
| No file_number leak | ❌ 22 leaks | ✅ Strict split |
| Features (no constant/corr) | ⚠️ 234 correlated pairs | ✅ ≤ 70 clean features |
| No NaN/Inf | ✅ | ✅ |
| Transaction type consistency | ❌ Mixed Sale+Rental+NonProject | ✅ Only Project+Rental |
| Synthetic injection rate | ❌ Tooì high | ✅ target ≤ 20% of anomaly |

---

## 6. 🎯 Target Metrics V7

### Tabular Models
| Model | V6 F1 | V7 Target | Chiến lược |
|-------|-------|-----------|-----------|
| A2_DAE | 0.620 | **≥ 0.80** | Smaller arch + dropout + OneCycleLR |
| A3_VAE | 0.571 | **≥ 0.65** | Fix beta=0.5 + KL annealing |
| A6_Ensemble | 0.606 | **≥ 0.78** | Learned weights |

### Time-Series Models
| Model | V6 F1 | V7 Target | Ghi Chú |
|-------|-------|-----------|---------|
| A5_BiLSTM | 0.980* | **≥ 0.95** | *V6 test chỉ có 2 windows → unreliable |
| A4_TranAD | 0.980* | **≥ 0.95** | V7 sẽ có ≥17 test windows |
| A9_Hybrid | 0.340 | **≥ 0.70** | Fix mapping bug |

---

## 7. 💡 Insights Quan Trọng cho Thesis

### Tại Sao V7 Khác Biệt?

1. **Domain-specific training**: Không gộp tất cả transaction types → model học pattern đặc trưng của Rental (price theo m², lease duration) và Project (commission structure).

2. **Anomaly semantics có ý nghĩa hơn**:
   - `AGENT_VELOCITY`: Agent giao dịch quá nhanh → dấu hiệu gian lận
   - `PRICE_AREA_DEVIATION`: Giá thuê bất thường so với khu vực → thao túng giá
   - `EXTREME_LEASE_DURATION`: Hợp đồng thuê quá ngắn/dài → red flag regulatory

3. **Time-series meaningful**: Monthly trend của Rental transactions trong 10 năm → seasonality (tháng 1, 7, 12 cao điểm thuê SG), COVID impact (2020 drop), post-pandemic recovery.

### Key Numbers Cho Thesis Defense:
```
Dataset V7:  4,363 rows | 3 splits | Anomaly rate 3.87%
             ├── Rental: 3,871 (88.7%) — đặc trưng: lease_duration, monthly_rent
             └── Project: 492 (11.3%) — đặc trưng: development_name, unit_type

Target:      A2_DAE F1 ≥ 0.80 (từ 0.620 V2 → +29%)
             A5_BiLSTM F1 ≥ 0.95 (reliable với ≥17 test windows)
             A9_Hybrid F1 ≥ 0.70 (từ 0.340 V2 → +106% sau fix bug)
```

---

## 8. ⚠️ Rủi Ro và Mitigation

| Rủi Ro | Xác Suất | Impact | Mitigation |
|--------|----------|--------|-----------|
| Project subset quá nhỏ (492 rows) → model bị bias về Rental | HIGH | MEDIUM | Oversample Project trong train; separate evaluation report |
| TS train windows không đủ (nếu date thưa) | MEDIUM | HIGH | Giảm window_size từ 12→6; dùng stride=1 |
| A2_DAE không đạt F1≥0.80 | MEDIUM | HIGH | Thử semi-supervised: pretrain unsupervised + fine-tune với labeled data |
| Overfitting trên train set nhỏ (3,054 rows) | MEDIUM | MEDIUM | Dropout 0.3 + weight_decay + early stopping (patience=30) |
| A9_Hybrid mapping không khớp (submit_time missing) | LOW | HIGH | Fallback: dùng contract_date; nếu cả hai missing → skip hybrid |

---

*Plan này được tạo tự động dựa trên phân tích DATA_REEVALUATION_REPORT.md và DATA_QUALITY_REPORT.md.*
*Implemented by: Tomoe AI Mentor — IUH CSV AI Platform Thesis Project*
