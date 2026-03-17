# 🎓 ĐÁNH GIÁ DATA — REAL ESTATE DOMAIN FOCUS

> **Professor Minh** × **Data Analyst** | 17/03/2026

---

## I. HIỆN TRẠNG DATA

### Detection Data — 20 files, ~42K rows (SNRE Singapore)

| Nhóm | Files | Rows | Quality | Dùng cho |
|------|-------|------|---------|----------|
| **Transactions** | `all_transactions_detailed_report`, `project_transactions`, `referral_non_project_transactions` | ~8,137 | ⚠️ Missing 23-73% | **A1-A3 (Tabular Detection)** — phát hiện giao dịch bất thường |
| **Invoices** | `invoice_snre_data_summary_v2`, `enrich_invoice`, `BILL_PRJS_FULL_RECORDS` | ~5,581 | ✅ Missing <2% | **A1-A3** — phát hiện invoice sai/trùng |
| **SNRE Annual** | `SNRE2020/2021/2022report` | ~1,935 | ⚠️ Missing ~37% | **Mixed** — timeline 3 năm, có thể tạo time-series |
| **Clients** | `client_data_with_type`, `client_landlord_seller_details` | ~9,424 | ✅ Missing <3% | **A1-A3** — phát hiện client bất thường |
| **Properties** | `merged_properties_infomation` | 3,759 | ⚠️ Missing 14% | **A1-A3** — phát hiện duplicate/sai địa chỉ |
| **Linkage** | `payee_role_links`, `combined_ar_data`, agents summaries | ~12,652 | ✅ Clean | **B3 Pattern Mining** — phát hiện network bất thường |

### Report Samples — 43 files (~560KB text)

- 22 [.md](file:///Users/mac/Downloads/GIANG/giang_workspace/.agent/skills/scan/SKILL.md) + 21 [.txt](file:///Users/mac/Downloads/GIANG/giang_workspace/csv_agent_services/data/report-sample/ar_split_report.txt) — phân tích invoice, bill integrity, data quality
- Ngôn ngữ: Việt + English mixed
- Chất lượng: **Tốt** — đã có structure, tables, findings

---

## II. ĐÁNH GIÁ LẠI: DOMAIN REAL ESTATE

### ✅ Điểm mạnh (thay đổi so với đánh giá trước)

| # | Điểm mạnh | Chi tiết |
|---|-----------|----------|
| 1 | **Data thực tế, phong phú** | 42K records từ 1 công ty — đủ train unsupervised models |
| 2 | **Đa dạng loại CSV** | 6 nhóm data khác nhau → test Model C3 router |
| 3 | **Report samples chất lượng** | 43 reports viết bởi analyst → có thể dùng cho B1/B2 |
| 4 | **Time-series tiềm năng** | SNRE 2020-2022 (3 năm) → ghép thành chuỗi thời gian |
| 5 | **Anomaly thật đã có** | `bills_duplicate_check_report_matches` = **63 duplicates đã detect** |

### ❌ Vẫn cần bổ sung

| # | Thiếu | Mức độ | Giải pháp |
|---|-------|--------|-----------|
| 1 | **Anomaly labels** | 🔴 Critical | Annotate thủ công + inject synthetic |
| 2 | **Training pairs cho B1/B2** | 🟡 High | Tạo từ report samples hiện có |
| 3 | **Time-series format** | 🟡 Medium | Ghép SNRE 2020-2022 theo timeline |

---

## III. KẾ HOẠCH HÀNH ĐỘNG (Real Estate Focus)

### Phase 1: TẠO ANOMALY LABELS (1-2 ngày)

#### A. Inject Synthetic Anomalies vào SNRE data

```python
# synthetic_anomaly_injector.py
import pandas as pd
import numpy as np

def inject_anomalies(df, anomaly_ratio=0.05):
    """Inject 5% anomalies vào data SNRE thực"""
    n_anomalies = int(len(df) * anomaly_ratio)
    df['is_anomaly'] = 0
    indices = np.random.choice(len(df), n_anomalies, replace=False)
    
    anomaly_types = []
    for idx in indices:
        atype = np.random.choice([
            'duplicate_invoice',    # Invoice trùng số
            'commission_outlier',   # Commission cao/thấp bất thường
            'missing_critical',     # Thiếu field quan trọng
            'amount_mismatch',      # Bill ≠ Invoice amount
            'date_inconsistency',   # Contract date > Completion date
            'suspicious_payee',     # Payee không match salesperson
        ])
        
        if atype == 'commission_outlier':
            # Nhân commission x10 hoặc x0.01
            if 'Commission' in df.columns:
                df.loc[idx, 'Commission'] *= np.random.choice([10, 0.01])
        
        elif atype == 'amount_mismatch':
            if 'Bill Amount' in df.columns and 'Invoice Amount' in df.columns:
                df.loc[idx, 'Invoice Amount'] *= np.random.uniform(1.5, 3.0)
        
        elif atype == 'date_inconsistency':
            # Swap dates to create impossible timeline
            date_cols = [c for c in df.columns if 'date' in c.lower()]
            if len(date_cols) >= 2:
                df.loc[idx, date_cols[0]], df.loc[idx, date_cols[1]] = \
                    df.loc[idx, date_cols[1]], df.loc[idx, date_cols[0]]
        
        df.loc[idx, 'is_anomaly'] = 1
        anomaly_types.append(atype)
    
    df.loc[indices, 'anomaly_type'] = anomaly_types
    return df
```

**Loại anomaly phù hợp domain real estate:**

| Loại | Mô tả | Ví dụ thực tế SNRE |
|------|--------|---------------------|
| `duplicate_invoice` | Invoice trùng số/payee | [bills_duplicate_check_report_matches.csv](file:///Users/mac/Downloads/GIANG/giang_workspace/csv_agent_services/data/raw-csv-detection/bills_duplicate_check_report_matches.csv) đã có 63 cases |
| `commission_outlier` | Hoa hồng bất thường | Commission $315K (max) vs median $2,962 |
| `amount_mismatch` | Bill Amount ≠ Invoice Amount | Chênh lệch giữa `Bill Amount` và `Invoice Amount` |
| `date_inconsistency` | Timeline sai logic | Contract Date > Completion Date |
| `missing_critical` | Thiếu thông tin bắt buộc | File Number trống, Payee Name missing |
| `suspicious_payee` | Payee không khớp hồ sơ | Payee name ≠ Matched Agent Name |

#### B. Annotate thủ công từ report findings

Từ report samples đã có, extract anomalies đã phát hiện:

| Report | Anomalies tìm được | Dùng làm labels |
|--------|---------------------|-----------------|
| [BILLS_DATA_QUALITY_ISSUES.txt](file:///Users/mac/Downloads/GIANG/giang_workspace/csv_agent_services/data/report-sample/BILLS_DATA_QUALITY_ISSUES.txt) | ✅ Data quality violations | Labels cho `enrich_invoice`, `BILL_PRJS` |
| [BAO_CAO_BILLS_ANALYSIS.md](file:///Users/mac/Downloads/GIANG/giang_workspace/csv_agent_services/data/report-sample/BAO_CAO_BILLS_ANALYSIS.md) | ✅ Bill duplicates + missing | Labels cho `all_transactions` |
| [INVOICE_DISCREPANCY_ANALYSIS.md](file:///Users/mac/Downloads/GIANG/giang_workspace/csv_agent_services/data/report-sample/INVOICE_DISCREPANCY_ANALYSIS.md) | ✅ Invoice mismatches | Labels cho `invoice_snre_data_summary_v2` |
| [BILLS_MISSING_IN_SYSTEM.txt](file:///Users/mac/Downloads/GIANG/giang_workspace/csv_agent_services/data/report-sample/BILLS_MISSING_IN_SYSTEM.txt) | ✅ 74 invoices missing | Ground truth anomalies |

### Phase 2: TẠO TIME-SERIES DATA (1 ngày)

Ghép SNRE 2020 + 2021 + 2022 thành chuỗi thời gian:

```python
# Ghép 3 năm SNRE → time-series theo tháng
snre_files = ['SNRE2020report.csv', 'SNRE2021report.csv', 'SNRE2022report.csv']
dfs = [pd.read_csv(f, encoding='utf-8-sig') for f in snre_files]
combined = pd.concat(dfs, ignore_index=True)

# Parse date & sort
combined['Date'] = pd.to_datetime(combined['Submission Date'], format='mixed')
combined = combined.sort_values('Date')

# Aggregate monthly: count transactions, total commission, avg amount
monthly = combined.groupby(combined['Date'].dt.to_period('M')).agg({
    'File Number': 'count',          # Số giao dịch/tháng
    'Commission': 'sum',             # Tổng hoa hồng
    'Transaction Price': 'mean',     # Giá trung bình
}).reset_index()
# → ~36 data points (3 năm × 12 tháng) — đủ cho TranAD window_size=10
```

### Phase 3: TẠO TRAINING PAIRS CHO B1/B2 (2 ngày)

Tạo cặp `(anomaly_context → explanation → summary)` từ reports hiện có:

```json
{
  "input": {
    "anomaly_type": "amount_mismatch",
    "record": {"Invoice": "INV-22-01004LPF", "Bill": 25000, "Invoice_Amount": 37500},
    "context": "Payee: Liong Phang Fei, Project: SB Yung Ho Investment"
  },
  "chain_of_thought": "1. Bill Amount = $25,000, Invoice Amount = $37,500 → chênh lệch 50%. 2. Trong SNRE, chênh lệch bình thường do GST < 10%. 3. Chênh lệch 50% vượt xa mức bình thường → BẤT THƯỜNG.",
  "summary": "Invoice INV-22-01004LPF có chênh lệch 50% giữa bill và invoice amount, vượt ngưỡng GST thông thường.",
  "label": "anomaly"
}
```

→ Tạo **~200 cặp** từ 43 report samples + synthetic anomalies.

---

## IV. SCORECARD CẬP NHẬT (Real Estate Focus)

```
┌─────────────────────────────────────────────────────────┐
│         DATA READINESS — REAL ESTATE FOCUS              │
│                                                         │
│  Hiện tại               Sau Phase 1-3                   │
│                                                         │
│  Detection:  ██░░░░░░  20%  →  ███████░░░  70%        │
│  C3 Router:  ████░░░░  40%  →  ████████░░  80%        │
│  Balancing:  ░░░░░░░░   0%  →  ██████░░░░  60%        │
│  Reports:    ███░░░░░  30%  →  ████████░░  80%        │
│                                                         │
│  Overall:    ██░░░░░░  15%  →  ███████░░░  70%  ✅    │
│                                                         │
│  ⚡ Ước tính: 4-5 ngày công để hoàn thành Phase 1-3    │
└─────────────────────────────────────────────────────────┘
```

> **Kết luận mới**: Với focus real estate, data SNRE hiện có là **nền tảng tốt**. Chỉ cần **inject synthetic anomalies** + **annotate từ report findings** + **ghép time-series** là có thể bắt đầu train. Không cần download benchmark datasets từ domain khác.
