                +----------------------+
                |      Client / UI     |
                |  (Web / Postman)     |
                +----------+-----------+
                           |
                           v
                +----------------------+
                |      API Gateway     |
                |  FastAPI / NestJS    |
                +----------+-----------+
                           |
        --------------------------------------------
        |                    |                     |
        v                    v                     v

+---------------+ +----------------+ +----------------+
| Data Service | | AI Model | | NLP Service |
| CSV Parsing | | Anomaly Detect | | Report Gen |
| Feature Eng | | BiLSTM | | LLM / T5 |
+---------------+ +----------------+ +----------------+
| | |

---

|
v
+--------------+
| Storage |
| PostgreSQL |
| / S3 / MinIO |
+--------------+

Tech stack gợi ý
Layer Tech
API FastAPI
ML model PyTorch / TensorFlow
Data pipeline Pandas
Storage PostgreSQL
File storage MinIO
Queue Redis / Celery
Container Docker

Upload CSV
↓
Data preprocessing
↓
Feature engineering
↓
model prediction
↓
Anomaly score
↓
Return anomalies

Core Feature 1 — CSV Anomaly Detection
Upload CSV
↓
Data preprocessing
↓
Feature engineering
↓
BiLSTM prediction
↓
Anomaly score
↓
Return anomalies

Core Feature 2 — Report Generation Base on REport affer correct data (English, Vietnamese)

4️⃣ Core Feature 3 — Full Analysis Pipeline
CSV
↓
Preprocess
↓
Anomaly Detection
↓
Fixing
↓
Summary
↓
Report generation
↓
Return PDF / text

Root Cause Đã Xác Nhận

Bug 1 (CRITICAL): TS 100% Anomaly

Nguyên nhân thực sự: windowing.py dùng label_slice > 0 — bất kỳ tuần nào có 1 giao dịch bất thường đều bị tính là  
 "anomalous week". Trong giai đoạn 2022+ (val/test period):

- 78.2% weeks trong val có anomaly_ratio > 0
- 93.7% weeks trong test có anomaly_ratio > 0  
  → Hầu hết windows (4 tuần) đều có >50% tuần "anomalous" → label=1 → 100%

Bug 2 (CRITICAL): Label Leakage trong TS Features

35 columns trong monthly_timeseries.parquet encode trực tiếp thông tin anomaly vào features: anomaly_count,  
 anomaly_ratio, + tất cả lag (1,3,6,12) + rolling stats (3,6,12). Model đang nhìn thấy label qua features.

Bug 3 (Structural): All Rule-Based Labels

Mọi anomaly đều từ deterministic rules → cần acknowledge trong thesis.

---

Kế Hoạch Fix — 3 Phase

Phase 1: Fix TS Window Labeling windowing.py + timeseries.py

Thay đổi 1 — src/data/timeseries.py: Thêm cột is_anomaly_week binary vào TS aggregation

# Sau khi aggregate xong, thêm:

threshold = ts_cfg.get("anomaly_week_threshold", 0.15) # 15% txn trong tuần là anomaly → tuần đó anomalous  
 monthly["is_anomaly_week"] = (monthly["anomaly_ratio"] >= threshold).astype(int)

Thay đổi 2 — src/data/windowing.py: Sửa cách tính window label

# Thay: anomaly_ratio = (label_slice > 0).mean()

# Thành: label_slice đã là binary (0/1) → dùng trực tiếp

anomaly_ratio = label_slice.mean() # mean của binary values

Thay đổi 3 — configs/default.yaml: Thêm tham số  
 timeseries:  
 anomaly_week_threshold: 0.15 # ≥15% txn/week anomalous → week labeled anomaly

Kết quả dự kiến với threshold=0.15:

┌───────┬───────┬────────┐  
 │ Split │ Trước │ Sau │  
 ├───────┼───────┼────────┤  
 │ Train │ 17.1% │ ~11.3% │
├───────┼───────┼────────┤
│ Val │ 100% │ ~23.1% │  
 ├───────┼───────┼────────┤  
 │ Test │ 100% │ ~27.8% │  
 └───────┴───────┴────────┘

---

Phase 2: Fix Label Leakage — Loại anomaly\_\* khỏi TS input features

Thay đổi — configs/default.yaml: Thêm exclude_from_features
timeseries:  
 exclude_from_features:

- anomaly_count
- anomaly_ratio

# Tất cả lag/rolling variants sẽ tự động bị drop

Thay đổi — src/data/timeseries.py hoặc src/data/dataset.py: Khi tạo features, drop các cột này trước khi windowing (giữ
lại is_anomaly_week làm label_col, nhưng không dùng làm feature).

Số columns TS sau fix: 91 − 35 = 56 columns (chưa tính lag/rolling của is_anomaly_week)

---

Phase 3: Regenerate Processed Data & Retrain

Sau khi fix code, cần chạy lại pipeline:

1. scripts/run_pipeline.py → regenerate monthly_timeseries.parquet (với is_anomaly_week)
2. Regenerate master_timeseries_train/val/test.pt (với đúng labels và features)
3. Retrain TranAD và BiLSTM → V7

Metric mục tiêu V7:

- TS Val anomaly%: 15–30% (thay vì 100%)
- TranAD/BiLSTM F1 realistic: 0.6–0.8 (thay vì 1.0)
- Feature count TS: ~56 (loại 35 leaky cols)

---

Thứ Tự Ưu Tiên

P1 (ngay): Fix windowing.py label threshold → 30 phút code
P1 (ngay): Fix timeseries.py thêm is*anomaly_week → 20 phút code  
 P2 (sau): Loại anomaly*\* cols khỏi TS input → 30 phút code + config  
 P3 (sau): Chạy lại pipeline + retrain V7 → runtime

need to fix 3. Train/Test KHÔNG phải Temporal Split

Train time: 2012-08-01 → 2025-11-25
Test time: 2012-05-17 → 2025-11-25 ← 100% overlap!

Timeline thực tế:
──────────────────────────────────────────────────────────
2012 2015 2019 2022 2025
| | | | |
[████████████████ TRAIN ████████████████████████]
[████████████████ TEST ████████████████████████]
↑ Không có ranh giới thời gian!

Đây là random stratified split, KHÔNG phải temporal split.

Vấn đề với TranAD / BiLSTM:
Model time-series cần:
Train: 2012 → 2023 (học pattern lịch sử)
Test : 2024 → 2025 (predict tương lai)

Hiện tại: train và test có cùng thời điểm → model có thể
"nhớ" pattern tương lai trong training → đánh giá không thực tế

4. Feature Bloat — 193 flags nhưng 188 là constant (vô dụng)

\_high_missing flags: 193 cột
├── 188 cột CONSTANT (cùng giá trị cho mọi row) → NOISE
└── 5 cột có variance → potentially useful

Effective features sau cleanup: ~225 (thay vì 413)

# Dọn dẹp ngay

from sklearn.feature_selection import VarianceThreshold
vt = VarianceThreshold(threshold=0.0)

# Loại ~188 constant cols

# 2. Remove constant \_high_missing flags

from sklearn.feature_selection import VarianceThreshold
vt = VarianceThreshold(threshold=0.0)

# Sẽ tự động drop 188 constant cols

# 3. KHÔNG clip values vì data đã standardized

# (bỏ cell 6.1 clip hoặc chỉ clip raw data trước khi scale)

# 4. Cân nhắc temporal split cho TS models

# train: submit_time < 2024-01-01

# test : submit_time >= 2024-01-01

Quy tắc BĐS Singapore:

┌──────────────┬──────────────┬───────────────────┐
│ Property Type│ Price Range │ Area Range (sqm) │
├──────────────┼──────────────┼───────────────────┤
│ HDB │ $300K-$1.5M │ 45-130 │
│ Condo │ $500K-$5M │ 40-300 │
│ Landed │ $2M-$30M │ 150-2000 │
│ Commercial │ Varies │ Varies │
└──────────────┴──────────────┴───────────────────┘
Ngoài range → Flag anomaly
