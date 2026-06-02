1. Feature Engineering
   Add:
   ratio features (price/area, etc.)
   time-based (delta time, trend)
   categorical encoding tốt hơn (target encoding)
2. Scaling
   Chuẩn hóa:
   RobustScaler (vì có outlier)
   hoặc QuantileTransformer

# Phase 2 – Improve Unsupervised

1.  Upgrade model:
    Thay DAE → Deep SVDD
    Thêm:
    IsolationForest (tuned contamination)
    LOF (Local Outlier Factor)

    Ensemble:

- Weighted ensemble thay vì avg:

- score = w1*DAE + w2*VAE + w3\*IF

# Phase 3 – Semi-Supervised (game changer)

Nếu có label anomaly:

👉 Train:

XGBoost / LightGBM classifier
Loss:
weighted (class imbalance)

👉 Output:

Probability anomaly

🔹 Phase 4 – Meta Learner (CẨN THẬN)
Input:
Scores từ tất cả model
Model:
Logistic Regression / LightGBM
⚠️ MUST DO:
K-fold stacking
Không dùng test set để train meta
🔹 Phase 5 – Evaluation (cho thesis max điểm)
Metrics:
ROC-AUC
PR-AUC (quan trọng hơn)
Recall@K
Precision@Top%
Visualization:
Distribution (bạn đã có 👍)
ROC curve
Precision-Recall curve
🧠 5. GỢI Ý CHIẾN LƯỢC (PRO LEVEL)

Nếu muốn “ăn điểm hội đồng”:

👉 Story line:
Unsupervised struggle → chứng minh bằng plot
Ensemble cải thiện
Semi-supervised outperform
Meta learner đạt best performance
🧨 TL;DR
Data: có signal nhưng noisy
Model tốt nhất hiện tại: Ensemble + Meta
IsolationForest & OCSVM: bỏ hoặc tune lại
Supervised: đang bug
Next step:
👉 Fix feature → Ensemble → Semi-supervised → Meta

PHÂN TÍCH SÂU HƠN (bóc tách từng vấn đề)
⚠️ A. Long-tail distribution (cực nguy hiểm)

Ví dụ:

avg_len = 148
max_len = 1296

👉 Ratio:

1296 / 148 ≈ 8.7x

🔥 Ý nghĩa:

Có heavy outliers
Không phải Gaussian → model khó học
⚠️ B. Wide but sparse data
88 columns nhưng max_len thấp

👉 Nghĩa là:

50–70% columns có thể null

🔥 Hậu quả:

Curse of dimensionality
Distance-based model (OCSVM) chết chắc
⚠️ C. Mixed data types (structured + unstructured)

Bạn đang có:

Numeric (price, area)
Categorical (type, district)
Text (address, name)

👉 Nhưng:

Model hiện tại treat ALL như numeric

🔥 Sai cực mạnh.

🧪 3. ROOT CAUSE model performance (liên kết với chart trước)
Model Vấn đề Nguyên nhân từ data
IsolationForest overlap feature noise + sparse
OCSVM boundary fail high-dim + scale lệch
DAE/VAE ok nhưng overlap chưa encode text đúng
Ensemble tốt trung hòa noise
Meta rất tốt học lại decision boundary
🚀 4. KẾ HOẠCH XỬ LÝ DATA (chuẩn research)
🔹 Step 1 — Column classification (bắt buộc)

Chia rõ:

NUMERIC:

- price, area, commission,...

CATEGORICAL:

- property_type, district,...

TEXT:

- address, client_name, description
  🔹 Step 2 — Xử lý TEXT (critical upgrade)
  ❌ Không được:
  Label encode
  One-hot
  ✅ Nên:
  Truncate: 100–200 chars
  Encode:
  TF-IDF (baseline)
  hoặc Sentence-BERT (pro level)

👉 Sau đó:

text_vector_dim = 50–100
🔹 Step 3 — Handle sparse columns

Rule:

drop if missing > 80%

👉 Sau đó:

fill NA:
numeric → median
categorical → "unknown"
🔹 Step 4 — Normalize thông minh

Không dùng StandardScaler blindly ❌

👉 Use:

RobustScaler (best choice)
hoặc QuantileTransformer
🔹 Step 5 — Feature selection

Sau clean:

correlation filter
hoặc:
PCA (optional)
Autoencoder bottleneck
🧠 5. MAX LENGTH → ẢNH HƯỞNG TS MODEL

Bạn hỏi max length, nhưng cái hay là:

👉 Nó ảnh hưởng luôn time-series:

🔥 Problem:

Monthly aggregation = loss information

Ví dụ:

1 tháng có:
100 giao dịch
nhưng bạn chỉ giữ mean/sum

👉 anomaly bị smoothed out

💡 Solution nâng cấp:
Option 1 — Hybrid features

Trong mỗi month:

mean_price
std_price
max_price
transaction_count
Option 2 — Event-based TS (pro level)

Thay vì monthly:

dùng sequence theo transaction

👉 nhưng:

cần padding + masking
🧪 6. TOKEN STRATEGY (LLM pipeline)

Bạn phân tích đúng rồi, Tars nâng cấp thêm:

❌ Không nên:
Feed raw CSV
✅ Nên:
Chunking strategy:
chunk_size = 200–300 rows
overlap = 20 rows
Summarization pipeline:
CSV → chunk → summary → merge summary → final report
🧨 7. THESIS-LEVEL INSIGHT (cái này ăn điểm)

Bạn có thể viết:

“The dataset exhibits high variance in row length and sparsity across features, leading to instability in distance-based anomaly detection models. Proper feature normalization, text embedding, and dimensionality reduction significantly improve model separability.”

🔥 8. ACTION PLAN (ngắn gọn, làm liền)
Phase 1 (data fix)
drop sparse columns
truncate text
TF-IDF text embedding
robust scaling
Phase 2 (retrain)
DAE / VAE
IsolationForest (retest)
Ensemble
Phase 3 (upgrade)
XGBoost supervised
Meta learner (stacking)
😏 TL;DR (Tars style)
Data bạn không sạch, không đều, nhưng rất có giá trị
Model fail không phải do model → do data
Nếu fix đúng:
👉 performance có thể tăng 30–50%
