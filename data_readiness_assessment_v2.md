# 🎓 ĐÁNH GIÁ DATA v2 — SAU KHI THÊM DATA MỚI

> **Professor Minh** × **Data Analyst** | 17/03/2026 — Updated

---

## I. DATA MỚI THÊM

### 🆕 2 file XLSX — Rất có giá trị!

| File | Rows | Cols | Size | Timeline | Highlight |
|------|------|------|------|----------|-----------|
| **`transaction.xlsx`** | 3,603 | 143 | 3.2MB | 2012 → 2024 (12 năm!) | Rich — 30 numeric, 113 text cols |
| **`transaction-asian.xlsx`** | 1,024 | 145 | 785KB | 2014 → 2024 (10 năm) | **CÓ CỘT `This a high risk or unusual transaction`** 🎯 |

### 🎯 Phát hiện quan trọng: CÓ ANOMALY LABEL!

```
File: transaction-asian.xlsx
Column: "This a high risk or unusual transaction"

  0.0 (Normal):     864 records (84.4%)
  1.0 (High Risk):    2 records  (0.2%)
  NaN (Unlabeled):  158 records (15.4%)
```

> ⚠️ **Vấn đề**: Chỉ có **2 records** được đánh dấu high-risk → quá ít để train supervised. Nhưng đây là **ground truth thật** — rất quý cho validation.

### 📊 Thống kê chi tiết data mới

**Financial ranges:**

| Metric | `transaction.xlsx` | `transaction-asian.xlsx` |
|--------|-------------------|--------------------------|
| **Price** | $700 — $30M (median: $6,679) | $350 — $4.08B (median: $3,300) |
| **Gross Commission** | $0 — $370K (median: $3,500) | $0 — $143K (median: $1,820) |
| **Billing Total** | $0 — $396K (median: $3,745) | $0 — $143K (median: $1,820) |

**Status distributions:**

| Column | `transaction.xlsx` | `transaction-asian.xlsx` |
|--------|-------------------|--------------------------|
| **Status** | Finalized: 3,355 / Draft: 239 / Aborted: 9 | Finalized: 1,010 / Aborted: 13 / Draft: 1 |
| **Billing Status** | Paid: 1,858 / Pending: 1,317 / Not Invoiced: 354 | Paid: 977 / Partially: 14 / Pending: 14 |
| **Txn Type** | Rental: 3,450 / Sale: 153 | Rental: 756 / Sale: 230 / Other: 38 |
| **Property Type** | Condo: 2,327 / Apt: 382 / Landed: 273 | Apt/Condo: 207 / Condo: 176 / HDB 4-room: 96 |

**Date ranges** (time-series tiềm năng):

| File | Submit Time | Lease Start | Lease Expiry |
|------|------------|-------------|--------------|
| `transaction.xlsx` | 2012-05 → 2024-07 | 2012-06 → 2025-06 | 2014-06 → 2028-05 |
| `transaction-asian.xlsx` | 2014-10 → 2024-09 | 2014-09 → 2026-08 | 2015-03 → 2027-08 |

---

## II. TỔNG HỢP TOÀN BỘ DATA

### Inventory cập nhật: 22 files, ~47K rows

| Nhóm | Files | Rows | Cols | Quality |
|------|-------|------|------|---------|
| **🆕 Transactions (XLSX)** | 2 files mới | **4,627** | 143-145 | ⚠️ Missing 43-48% nhưng rất rich |
| Transactions (CSV) | 3 files | 8,137 | 9-61 | ⚠️ Missing 23-73% |
| Invoices | 3 files | 5,581 | 12-24 | ✅ Good |
| SNRE Annual | 3 files | 1,935 | 40-41 | ⚠️ Missing ~37% |
| Clients | 2 files | 9,424 | 8-13 | ✅ Good |
| Properties | 1 file | 3,759 | 11 | ✅ OK |
| Linkage/Summary | 8 files | 12,652 | 4-9 | ✅ Clean |
| **TỔNG** | **22 files** | **~47K** | — | — |

---

## III. ĐÁNH GIÁ THEO MODEL (CẬP NHẬT)

| Model | Before | After | Lý do thay đổi |
|-------|--------|-------|-----------------|
| **A1-A3** (Tabular Detection) | 🔴 20% | 🟡 **50%** | +4.6K rows rich data, CÓ partial labels |
| **A4-A6** (Time-Series) | 🔴 0% | 🟡 **40%** | Submit Time 2012-2024 → monthly aggregation ~144 data points |
| **C3** (Data-Type Classifier) | 🟡 40% | 🟡 **50%** | Thêm 2 files XLSX = thêm sample types |
| **C1/C2** (Balancing) | 🔴 0% | 🟡 **30%** | Có label `high_risk` nhưng chỉ 2 positive → cần augment |
| **B3** (Pattern Mining) | 🔴 0% | 🟡 **35%** | Rich features cho pattern discovery |
| **B4** (Trend Analyzer) | 🔴 0% | 🟡 **45%** | 12 năm data → trend + seasonality analysis |
| **B1/B2** (Reports) | 🟡 30% | 🟡 **30%** | Không thay đổi — vẫn cần training pairs |

---

## IV. HÀNH ĐỘNG CẬP NHẬT

### ✅ Không cần làm nữa

| # | Item | Lý do |
|---|------|-------|
| 1 | Tìm anomaly label | ĐÃ CÓ cột `This a high risk or unusual transaction` |
| 2 | Tìm time-series data | ĐÃ CÓ Submit Time 2012-2024 (12 năm) |

### ⚡ Cần làm (ưu tiên cập nhật)

| # | Hành động | Chi tiết | Thời gian |
|---|-----------|----------|-----------|
| 1 | **Inject synthetic anomalies** | Dùng 2 records `high_risk=1` làm template → inject thêm ~200-500 synthetic anomalies tương tự | 1 ngày |
| 2 | **Merge + clean XLSX** | Gộp 2 XLSX → chuẩn hóa 145 cols chung, xử lý missing 43-48% | 0.5 ngày |
| 3 | **Tạo time-series aggregation** | Group by month (Submit Time) → ~144 monthly data points | 0.5 ngày |
| 4 | **Tạo training pairs cho B1/B2** | Từ report samples + anomaly results | 2 ngày |

### 🔍 Anomaly thật đã có sẵn trong data!

| Loại | Chi tiết | File |
|------|----------|------|
| **Price outlier** | Max **$4.08 BILLION** (median chỉ $3,300) — chắc chắn sai | `transaction-asian.xlsx` |
| **Aborted transactions** | 22 aborted records | Cả 2 xlsx |
| **Draft/Unapproved** | 239 Draft + 354 Approval Status=0 | `transaction.xlsx` |
| **Billing mismatch** | 45 Partially Invoiced + 26 Ready to Invoice | `transaction.xlsx` |
| **High risk flagged** | 2 records ground truth | `transaction-asian.xlsx` |
| **Duplicate invoices** | 63 matches | `bills_duplicate_check_report_matches.csv` |
| **Missing invoices** | 74 invoices missing | Report samples |

→ **Tổng: ~350+ anomaly candidates** không cần synthetic injection!

---

## V. SCORECARD CẬP NHẬT

```
┌─────────────────────────────────────────────────────────┐
│         DATA READINESS v2 — AFTER NEW DATA              │
│                                                         │
│  v1 (before)          v2 (now)           Target         │
│                                                         │
│  Detection:  ██░░░░  20%  →  █████░░░  45%  →  70%    │
│  Time-Series: ░░░░░░   0%  →  ████░░░░  40%  →  65%   │
│  C3 Router:  ████░░  40%  →  █████░░░  50%  →  80%    │
│  Balancing:  ░░░░░░   0%  →  ███░░░░░  30%  →  60%    │
│  Reports:    ███░░░  30%  →  ███░░░░░  30%  →  80%    │
│                                                         │
│  Overall:    ██░░░░  15%  →  █████░░░  40%  ✅        │
│                                                         │
│  ⚡ Ước tính: 3-4 ngày công để đạt target 70%+         │
│  (Giảm 1 ngày so với v1 nhờ data mới!)                 │
└─────────────────────────────────────────────────────────┘
```

> **Kết luận v2**: Data mới **cải thiện đáng kể** tình hình. Đặc biệt cột `high_risk` và 12 năm timeline. Price outlier $4.08B là anomaly thật → dùng làm ground truth. Cần ~3-4 ngày nữa là đủ train.
