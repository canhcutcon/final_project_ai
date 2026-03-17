# 🎓 BÁO CÁO ĐÁNH GIÁ DATA — TRAINING READINESS

> **Professor Minh** × **Data Analyst**
> Ngày: 17/03/2026

---

## I. TỔNG QUAN DATA HIỆN CÓ

### 1.1 Detection Data (`raw-csv-detection/`) — 20 files, ~42K rows

| File | Rows | Cols | Size | Missing% | Loại |
|------|------|------|------|----------|------|
| [client_data_with_type.csv](file:///Users/mac/Downloads/GIANG/giang_workspace/csv_agent_services/data/raw-csv-detection/client_data_with_type.csv) | 6,755 | 13 | 1.6MB | 2.8% | **Tabular** — Client profiles |
| [all_transactions_detailed_report.csv](file:///Users/mac/Downloads/GIANG/giang_workspace/csv_agent_services/data/raw-csv-detection/all_transactions_detailed_report.csv) | 7,246 | 9 | 779KB | 23.7% | **Tabular** — Transaction records |
| [payee_role_links.csv](file:///Users/mac/Downloads/GIANG/giang_workspace/csv_agent_services/data/raw-csv-detection/payee_role_links.csv) | 6,517 | 6 | 631KB | 0.0% | **Tabular** — Role linkage |
| [invoice_snre_data_summary_v2.csv](file:///Users/mac/Downloads/GIANG/giang_workspace/csv_agent_services/data/raw-csv-detection/invoice_snre_data_summary_v2.csv) | 5,501 | 12 | 738KB | 1.2% | **Tabular** — Invoice summary |
| [combined_ar_data.csv](file:///Users/mac/Downloads/GIANG/giang_workspace/csv_agent_services/data/raw-csv-detection/combined_ar_data.csv) | 5,578 | 6 | 456KB | 0.0% | **Tabular** — Accounts receivable |
| [merged_properties_infomation.csv](file:///Users/mac/Downloads/GIANG/giang_workspace/csv_agent_services/data/raw-csv-detection/merged_properties_infomation.csv) | 3,759 | 11 | 636KB | 14.4% | **Tabular** — Property info |
| [client_landlord_seller_details.csv](file:///Users/mac/Downloads/GIANG/giang_workspace/csv_agent_services/data/raw-csv-detection/client_landlord_seller_details.csv) | 2,669 | 8 | 386KB | 15.1% | **Tabular** — Client details |
| [SNRE2022report.csv](file:///Users/mac/Downloads/GIANG/giang_workspace/csv_agent_services/data/raw-csv-detection/SNRE2022report.csv) | 1,006 | 40 | 492KB | 36.9% | **Mixed** — Annual report |
| [SNRE2021report.csv](file:///Users/mac/Downloads/GIANG/giang_workspace/csv_agent_services/data/raw-csv-detection/SNRE2021report.csv) | 642 | 40 | 302KB | 39.7% | **Mixed** — Annual report |
| [project_transactions.csv](file:///Users/mac/Downloads/GIANG/giang_workspace/csv_agent_services/data/raw-csv-detection/project_transactions.csv) | 491 | 61 | 182KB | **57.0%** | **Tabular** — Rich but sparse |
| [referral_non_project_transactions.csv](file:///Users/mac/Downloads/GIANG/giang_workspace/csv_agent_services/data/raw-csv-detection/referral_non_project_transactions.csv) | 400 | 61 | 134KB | **73.2%** | **Tabular** — Very sparse |
| [SNRE2020report.csv](file:///Users/mac/Downloads/GIANG/giang_workspace/csv_agent_services/data/raw-csv-detection/SNRE2020report.csv) | 287 | 41 | 144KB | 37.2% | **Mixed** — Annual report |
| *8 smaller files* | 1,498 | — | ~100KB | varies | *Summaries, lookups* |

**Domain**: Real estate transactions (SNRE Singapore) — invoices, bills, commissions, properties, clients.

### 1.2 Report Samples (`report-sample/`) — 43 files

| Metric | Value |
|--------|-------|
| Formats | 22 [.md](file:///Users/mac/Downloads/GIANG/giang_workspace/.agent/skills/scan/SKILL.md) + 21 [.txt](file:///Users/mac/Downloads/GIANG/giang_workspace/csv_agent_services/data/report-sample/ar_split_report.txt) |
| Total size | ~560KB |
| Avg length | ~1,500 words/file |
| Language | Tiếng Việt + English mixed |
| Content | Invoice analysis, bill integrity, data quality reports |

---

## II. ĐÁNH GIÁ THEO TỪNG MODEL

### ❌ Kết luận chung: DATA CHƯA SẴN SÀNG ĐỂ TRAIN

| Model | Status | Vấn đề chính |
|-------|--------|---------------|
| **C3** — Data-Type Classifier | 🟡 Partial | Chỉ có tabular data, thiếu time-series samples |
| **C1** — GAN Generator | 🔴 Blocked | Không có anomaly labels → không biết class nào cần augment |
| **C2** — SMOTE | 🔴 Blocked | Tương tự C1 — cần labels |
| **A1-A3** — Tabular Detection | 🟡 Partial | Có data tabular nhưng KHÔNG CÓ anomaly labels |
| **A4-A6** — Time-Series Detection | 🔴 Blocked | KHÔNG CÓ dữ liệu time-series |
| **B1** — LLM Chain-of-Thought | 🟡 Partial | Có report samples nhưng thiếu cặp (input→explanation) |
| **B2** — mT5 Summarization | 🟡 Partial | Có 43 reports nhưng thiếu cặp (long→summary) |
| **B3** — Pattern Mining | 🔴 Blocked | Cần anomaly detection results (phụ thuộc A1-A6) |
| **B4** — Trend Analyzer | 🔴 Blocked | Cần time-indexed anomaly scores |

---

## III. PHÂN TÍCH CHI TIẾT 5 VẤN ĐỀ LỚN

### 🚨 Vấn đề 1: KHÔNG CÓ ANOMALY LABELS

Đây là **vấn đề nghiêm trọng nhất**. Toàn bộ 20 files đều là dữ liệu thô — không có cột nào đánh dấu record nào là anomaly/normal.

```
Các cột "gần giống" label nhưng KHÔNG PHẢI:
- Status: {paid: 5296, issued: 205}          → Trạng thái business, không phải anomaly
- Transaction Type: {Non-Project, Project}   → Phân loại giao dịch
- Client Type: {Company: 6630, Individual: 125} → Loại khách hàng
```

**Để train được A1-A6**, cần ÍT NHẤT một trong hai:
1. **Labeled data**: Cột `is_anomaly` (0/1) do chuyên gia annotate
2. **Benchmark data**: Datasets chuẩn đã có labels (CICIDS2017, Credit Card Fraud, etc.)

### 🚨 Vấn đề 2: KHÔNG CÓ DỮ LIỆU TIME-SERIES

Tất cả 20 files đều là **tabular** (bảng tĩnh). Các cột date (`Submission Date`, `Contract Date`) chỉ là metadata, KHÔNG tạo thành chuỗi thời gian liên tục.

→ Model A4 (TranAD), A5 (BiLSTM-GRU), A6 (Hybrid BiLSTM+CNN) **không thể train** trên data hiện có.

### ⚠️ Vấn đề 3: MISSING VALUES QUÁ CAO

| Mức missing | Files | Nhận xét |
|-------------|-------|----------|
| 0-5% | 6 files | ✅ Sạch, dùng được |
| 5-20% | 4 files | ⚠️ Cần xử lý |
| 20-40% | 5 files | ⚠️ Nhiều cột trống |
| **>40%** | **4 files** | ❌ project_txn (57%), referral (73%), bills_payee (41%), SNRE reports (~37%) |

→ Cần **imputation strategy** mạnh hơn median fill, hoặc **loại bỏ cột** có >50% missing.

### ⚠️ Vấn đề 4: REPORT SAMPLES THIẾU CẤU TRÚC CHO TRAINING

43 report samples là các báo cáo phân tích **đã hoàn chỉnh**, nhưng:
- ❌ Không có **cặp (CSV input → report output)** — thiếu mapping dữ liệu nào tạo ra report nào
- ❌ Không có **cặp (long text → summary)** — thiếu ground truth cho mT5 summarization
- ❌ Không có **chain-of-thought reasoning traces** — thiếu bước suy luận trung gian
- ⚠️ Ngôn ngữ mixed (Việt + Anh) — cần chuẩn hóa

### ⚠️ Vấn đề 5: DOMAIN QUÁ HẸP

Toàn bộ data đến từ **1 công ty bất động sản Singapore (SNRE)**. Model train trên data này sẽ:
- Overfit vào domain real estate
- Không generalize được sang CSV khác domain (finance, healthcare, IoT, etc.)
- Thiếu diversity để validate tính đa năng của platform

---

## IV. KHUYẾN NGHỊ HÀNH ĐỘNG

### Phase 1: NGAY LẬP TỨC (cần để bắt đầu train)

| # | Hành động | Chi tiết | Ưu tiên |
|---|-----------|----------|---------|
| 1 | **Thêm benchmark datasets** | Download & đưa vào `raw-csv-detection/`: | 🔴 P0 |
| | | • Credit Card Fraud (Kaggle, 284K rows) — tabular, có labels |  |
| | | • CICIDS2017 (Canadian Institute, 3M rows) — tabular+time |  |
| | | • Yahoo S5 (367 time-series) — pure time-series |  |
| | | • NAB (Numenta Anomaly Benchmark) — time-series |  |
| 2 | **Annotate anomalies trên SNRE data** | Nhờ domain expert đánh dấu ~500-1000 records bất thường (invoice sai, commission lạ, duplicate transactions) | 🔴 P0 |
| 3 | **Tạo training pairs cho report generation** | Với mỗi report sample, tạo file JSON mapping: `{csv_input, anomaly_results, explanation, summary}` | 🟡 P1 |

### Phase 2: CẢI THIỆN DATA QUALITY

| # | Hành động | Chi tiết |
|---|-----------|----------|
| 4 | **Xử lý missing values** | Loại bỏ cột >50% missing, impute còn lại bằng KNN/IterativeImputer (tốt hơn median) |
| 5 | **Chuẩn hóa format** | Date format (mixed `31-Dec-20` vs `2021-12-29`), currency (mixed `S$21,900.00` vs `21900.0`), encoding (`utf-8-sig`) |
| 6 | **Fix [ecb_agents_summary.csv](file:///Users/mac/Downloads/GIANG/giang_workspace/csv_agent_services/data/raw-csv-detection/ecb_agents_summary.csv)** | File bị lỗi parse (expected 7 fields, saw 55) — sửa delimiter |
| 7 | **Loại bỏ 103 duplicates** trong [payee_role_links.csv](file:///Users/mac/Downloads/GIANG/giang_workspace/csv_agent_services/data/raw-csv-detection/payee_role_links.csv) |

### Phase 3: MỞ RỘNG ĐA DẠNG

| # | Hành động | Chi tiết |
|---|-----------|----------|
| 8 | **Thêm data domains khác** | Finance (bank transactions), Healthcare (patient records), IoT (sensor readings) |
| 9 | **Tạo synthetic anomalies** | Inject anomalies vào SNRE data: outliers, duplicates, missing patterns, format errors |
| 10 | **Thu thập Chain-of-Thought samples** | Viết 50-100 mẫu giải thích anomaly bằng tiếng Việt cho fine-tune B1 |

---

## V. KẾ HOẠCH DOWNLOAD BENCHMARK DATA

```bash
# 1. Credit Card Fraud Detection (Kaggle — cần đăng nhập)
# Link: https://www.kaggle.com/mlg-ulb/creditcardfraud
# → creditcard.csv (284,807 rows, 31 cols, có cột "Class" 0/1)

# 2. CICIDS2017 (free download)
# Link: https://www.unb.ca/cic/datasets/ids-2017.html
# → 8 CSV files, ~3M rows, có cột "Label"

# 3. Yahoo S5 Anomaly Benchmark (cần xin quyền)
# Link: https://webscope.sandbox.yahoo.com/catalog.php?datatype=s&did=70
# → 367 time-series, có cột "is_anomaly"

# 4. NAB — Numenta Anomaly Benchmark (GitHub, free)
# git clone https://github.com/numenta/NAB.git
# → realKnownCause/, realTraffic/, realTweets/ folders

# 5. KDD Cup 1999 (UCI, free)
# Link: https://archive.ics.uci.edu/ml/datasets/kdd+cup+1999+data
# → 5M rows, có cột "label" (normal/attack types)
```

---

## VI. TÓM TẮT

```
┌─────────────────────────────────────────────────────────┐
│              DATA READINESS SCORECARD                    │
│                                                         │
│  Detection Pipeline (A1-A6):     ██░░░░░░░░  20%       │
│  ├─ Tabular data:                ████░░░░░░  40%       │
│  ├─ Time-series data:            ░░░░░░░░░░   0%       │
│  ├─ Anomaly labels:              ░░░░░░░░░░   0%       │
│  └─ Benchmark data:              ░░░░░░░░░░   0%       │
│                                                         │
│  Classification (C3):            ██░░░░░░░░  20%       │
│  ├─ Tabular samples:             ████████░░  80%       │
│  └─ Time-series samples:         ░░░░░░░░░░   0%       │
│                                                         │
│  Balancing (C1/C2):              ░░░░░░░░░░   0%       │
│  └─ Needs labels first                                  │
│                                                         │
│  Report Generation (B1-B4):      ███░░░░░░░  30%       │
│  ├─ Report samples:              ██████░░░░  60%       │
│  ├─ Training pairs:              ░░░░░░░░░░   0%       │
│  └─ CoT traces:                  ░░░░░░░░░░   0%       │
│                                                         │
│  Overall Readiness:              ██░░░░░░░░  15%       │
│                                                         │
│  ⚡ MOST URGENT: Download benchmark + annotate labels   │
└─────────────────────────────────────────────────────────┘
```

> **Kết luận**: Data hiện có là **dữ liệu domain thực tế tốt** để test pipeline end-to-end, nhưng **KHÔNG ĐỦ để train bất kỳ model AI nào**. Cần bổ sung benchmark datasets có labels (Phase 1) trước khi bắt đầu training.
