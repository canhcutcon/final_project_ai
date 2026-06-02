business rule = primary, anomaly = secondary

# Architecture

### Layer 1 — Rule-based validation (CORE)

Đây là gate chính, chạy deterministic:

✅ Check dạng “thiếu / dư / sai format”
missing field (null, empty)
unexpected field
datatype mismatch (string vs number)
enum sai (status, type…)
✅ Check business logic
transaction_price > 0
lease_expiry_date > lease_start_date
commission <= transaction_price
dependency rules:
có lease → phải có lease_duration
có sale → phải có completion_date

output:
{
"row_id": 123,
"errors": ["missing_price", "invalid_date"],
"severity": "hard_fail"
}

###Layer 2 — Rule scoring (semi-soft)

Không phải fail luôn, mà cho score:

thiếu field phụ → warning
value hơi lệch → suspicious

👉 Output:

{
"row_id": 123,
"rule_score": 0.7
}

### Layer 3 — Anomaly detection (ML-based)

)

👉 Chính là mấy model bạn đang có:

DAE
VAE
XGB
Ensemble (A9)

Nhưng giờ role sẽ là:

👉 “detect cái mà rule không cover được”

Ví dụ:
giá thuê thấp bất thường theo khu vực
pattern hiếm (combination feature lạ)
outlier không obvious

### Using Rule first (khuyên dùng)

if hard_rule_fail:
reject

elif soft_rule_score high OR anomaly_score high:
flag_for_review

else:
accept

A9 Ensemble
phân tách rất tốt (anomaly gần 1.0)
threshold ~0.899 là hợp lý

👉 giữ làm secondary detector là perfect
Feature importance (XGB)
F[11], F[13] dominate mạnh

👉 WARNING:

model đang rely vào few features
dễ overfit / miss logic business

DAE / VAE
overlap khá nhiều

👉 không nên dùng làm decision chính
👉 chỉ nên:

feature generator
support ensemble

6. Nhưng phải cẩn thận
   ❌ Trap 1 — Rule explosion
   rule quá nhiều → khó maintain

👉 giải pháp:

config-driven (JSON/YAML rules)
rule engine riêng
❌ Trap 2 — Rule miss pattern
rule không cover hết edge case

👉 anomaly sẽ cứu

❌ Trap 3 — Double counting
rule + ML cùng detect 1 lỗi

👉 cần:

deduplicate logic
define responsibility rõ

# Kiến trúc cuối:

            CSV INPUT
                 ↓
        Rule Validation Engine
           ↓           ↓
       Hard Fail    Soft Score
                        ↓
                ML Anomaly Model
                        ↓
                Decision Layer

rule engine → convert thành feature cho ML
anomaly → feedback loop → tạo rule mới
