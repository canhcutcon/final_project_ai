# Đánh giá quy trình xử lý dữ liệu cho Epic 4 (NLP Report Generation) - V2 (Production Level)

Dựa trên các file mẫu trong `csv_agent_services/data/report-sample/` và tiêu chuẩn Production, đây là thiết kế kiến trúc xử lý dữ liệu chuẩn xác cho Epic 4 để fine-tune model sinh báo cáo (Qwen2.5-7B/LoRA):

## 1. Kiến trúc Pipeline (Production Level)

Pipeline không đẩy JSON thô vào LLM, mà đi qua **4 bước** chuẩn bị:

```text
Raw anomalies (Từ AI Models BiLSTM/TranAD)
      ↓
Aggregator (Gom nhóm, đếm count, tìm missing)
      ↓
Enrichment Layer (NEW 🔥 - Tính ratio, tính score, rank priority, giải PT)
      ↓
Prompt Builder (Lắp ráp Jinja2 Template + Instructions)
      ↓
LLM (Qwen2.5-7B + LoRA - Viết Markdown Report)
```

**🚨 Nguyên tắc cốt lõi (Bottleneck)**: `Aggregator + Enrichment quality = 80% output quality`. LLM chỉ đóng vai trò "Giám đốc PR", viết văn dựa trên tài liệu đã được chuẩn bị kỹ lưỡng, *tuyệt đối không để LLM tự làm toán*.

## 2. Thiết kế Input JSON (Semantic + Enriched)

Dữ liệu đưa vào Prompt Builder phải đạt chuẩn "Semantic & Enriched", với các control mạnh mẽ để LLM không bị Hallucination:

### A. Context & Aggregation
```json
{
  "context": {
    "dataset": "SNRE Invoices June 2025",
    "summary": {
      "total_records": 5501,
      "expected": 5577,
      "missing": 76
    },
    // 🔥 LLM chỉ cần rewrite, KHÔNG được tự tính toán (ngăn hallucination)
    "cross_analysis": [
      {
        "description": "Net difference explained by paid vs issued mismatch",
        "equation": "-48 issued + 366 paid = 318 net difference"
      }
    ]
  }
}
```

### B. Anomaly Clusters (Ranked & Scored)
Mỗi issue phải được Enrich thêm "numerical reasoning signals" và "priority":
```json
{
    "anomaly_clusters": [
      {
        "issue_type": "MISSING_TRANSACTION",
        "count": 74,
        "ratio": "1.34% of total invoices", // 🔥 Numerical reasoning signal
        "priority": 1, // 🔥 Giúp model biết viết "The most critical issue is..."
        "impact_score": 0.92,
        "impact": "High - Cannot create receipts",
        "samples": [ // 🔥 Sample phải đủ sức giải thích (explanatory)
          {
            "id": "INV-25-00902QCL-L",
            "issue": "Missing transaction data",
            "amount": 163500,
            "note": "Invoice exists in CAS export but no matching transaction record found in DB"
          }
        ]
      }
    ]
}
```

### C. Individual Anomaly Details (Semantic Output)
Đối với các báo cáo phân tích sâu 1 record (Detailed style), Input JSON phải là Semantic Text:
```json
{
  "transaction_id": "TX123",
  "risk_level": "HIGH",
  "anomaly_score": 0.91,
  "summary": "Multiple abnormal deviations detected",
  "key_findings": [
    "Price is 45% higher than district average (last 6 months)",
    "Commission is 80% higher than expected",
    "Property area is 30% smaller than similar listings"
  ],
  "location_context": "District 2, high-end residential area",
  "temporal_context": "Market stable, no recent spikes"
}
```

## 3. Training Strategy (Tối ưu cho Qwen LoRA)

**🚨 KHÔNG train kiểu "Raw to Report". ĐÂY LÀ SAI LẦM PHỔ BIẾN.**
**✅ PHẢI train kiểu "Structured → Formatted Report".**

### A. Dataset Sample Chuẩn (JSONL)

```text
### Instruction:
You are a senior financial analyst and auditor.
Generate a structured report with:
1. Executive Summary
2. Key Issues (ranked by severity)
3. Cross Analysis
4. Recommendations

Use professional audit tone. Be concise and analytical.
Always include bullet points, bold highlights, and numeric references.

### Input:
<JSON đã Aggregate + Enrich ở mục 2>

### Output:
# BÁO CÁO PHÂN TÍCH...
<Markdown report chuẩn giống như các file BAO_CAO_CUOI_CUNG.md>
```

### B. Các "Tricks" Kỹ thuật cho Training
1.  **Force Tone**: Cài cắm trong System Prompt/Instruction phong cách *"professional audit tone"*, ép model từ bỏ giọng văn "chatbot" mặc định.
2.  **Force Structure**: Yêu cầu thẳng trong Instruction các format bắt buộc (bullet points, bold highlights).
3.  **Recommendation Pattern**: Huấn luyện (Fine-tune) cho model quen với cấu trúc câu Consulting. VD: *"Investigate missing transactions"*, *"Validate commission calculations"*, thay vì *"Bạn nên làm abc..."*.

## 4. Tóm tắt Action Items cho Code
1.  **Xây dựng `AggregationService`**: Nhóm các transactions lỗi thành các Clusters (như "MISSING_TRANSACTION", "HIGH_COMMISSION").
2.  **Xây dựng `EnrichmentService`**: Tính toán %. Gán Priority (1, 2, 3) dựa trên `impact_score`. Tạo các chuỗi PT Toán học (Cross Analysis) gửi sẵn cho LLM. Sinh ra các `Semantic Text` (như "Price is 45% higher").
3.  **Cập nhật Prompt Template**: Thêm `### Instruction:` cứng với các rules về Tone và Format.
4.  **Tạo Training Dataset**: Chuyển đổi 50,000 samples thành định dạng `Instruction + Input JSON + Expected Markdown Report` để train LoRA.
