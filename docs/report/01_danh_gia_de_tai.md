# ĐÁNH GIÁ ĐỀ TÀI THẠC SĨ
## "Nền tảng AI Phát hiện Dị thường trên Dữ liệu CSV kết hợp Tạo Báo cáo Tự động bằng NLP"
### Trường Đại học Công nghiệp TP.HCM (IUH) — Ngành Khoa học Máy tính

---

## I. TỔNG QUAN ĐỀ TÀI

### 1.1 Mô tả ngắn gọn
Xây dựng một **CSV AI Platform** tích hợp:
1. **Anomaly Detection** — Phát hiện dị thường tự động trên file CSV (dạng bảng & chuỗi thời gian) sử dụng Deep Learning (BiLSTM, Autoencoder, TranAD).
2. **Report Generation** — Tạo báo cáo phân tích tự động bằng NLP/LLM (tiếng Việt & tiếng Anh) với chuỗi suy luận Chain-of-Thought.
3. **Full Analysis Pipeline** — Pipeline toàn diện: Upload CSV → Tiền xử lý → Phát hiện dị thường → Sửa lỗi → Tóm tắt → Xuất báo cáo PDF.

### 1.2 Kiến trúc hệ thống đề xuất
```
Client/UI (Web) → API Gateway (FastAPI) → [Data Service | AI Model | NLP Service] → Storage (PostgreSQL/MinIO)
```

---

## II. LÝ DO CHỌN ĐỀ TÀI

### 2.1 Tính cấp thiết từ thực tiễn

| Vấn đề thực tế | Giải pháp của đề tài |
|---|---|
| Dữ liệu CSV được sử dụng rộng rãi trong doanh nghiệp nhưng thiếu công cụ kiểm tra chất lượng tự động | Tự động phát hiện dị thường bằng Deep Learning |
| Mô hình AI truyền thống là "hộp đen", thiếu giải thích | Tạo báo cáo ngôn ngữ tự nhiên (XAI) |
| Chi phí dán nhãn dữ liệu cao, gian lận thay đổi liên tục | Sử dụng học không giám sát / bán giám sát |
| Nhu cầu tuân thủ quy định (compliance) yêu cầu tính minh bạch | Báo cáo chi tiết tự động bằng tiếng Việt |

### 2.2 Xu hướng nghiên cứu quốc tế
- **Deep Learning for Anomaly Detection** đang là trọng tâm nghiên cứu với hàng trăm bài báo trên IEEE/ACM/Scopus trong giai đoạn 2021-2025.
- **Explainable AI (XAI)** được nhấn mạnh là thách thức lớn nhất (CH6) trong các survey gần đây [Pang et al., 2021].
- **LLM-based Anomaly Detection** (TAD-GP framework, 2024) mở ra hướng đi mới kết hợp LLM với phát hiện dị thường.

### 2.3 Khoảng trống nghiên cứu (Research Gap)
1. **Thiếu nền tảng tích hợp end-to-end**: Các nghiên cứu hiện tại tập trung vào từng module riêng lẻ (detection hoặc report), chưa có nền tảng kết hợp cả hai.
2. **Thiếu giải thích dị thường bằng ngôn ngữ tự nhiên**: Phần lớn mô hình chỉ trả về anomaly score mà không giải thích *tại sao*.
3. **Chưa có giải pháp hỗ trợ tiếng Việt**: Các hệ thống hiện tại chỉ hỗ trợ tiếng Anh.
4. **Thiếu khả năng xử lý đa dạng loại CSV**: Cần hệ thống tự nhận diện loại dữ liệu (tabular vs time-series) để chọn model phù hợp.

---

## III. TIỀM NĂNG CỦA ĐỀ TÀI

### 3.1 Tiềm năng học thuật
- **Đóng góp khoa học**: Đề xuất kiến trúc hybrid kết hợp Deep Learning (BiLSTM/TranAD) với LLM (Chain-of-Thought) cho bài toán phát hiện dị thường có giải thích.
- **Cơ hội công bố**: Có thể công bố 1-2 bài báo tại hội thảo trong nước (RIVF, KSE, SoICT) hoặc tạp chí quốc tế (IEEE Access, Applied Sciences).
- **Tính liên ngành**: Kết hợp Computer Vision for tabular data, NLP, LLM, và Software Engineering.

### 3.2 Tiềm năng ứng dụng

| Lĩnh vực | Ứng dụng cụ thể |
|---|---|
| **Tài chính** | Phát hiện giao dịch gian lận, rửa tiền trên dữ liệu CSV giao dịch |
| **Y tế** | Phát hiện bất thường trong dữ liệu bệnh nhân, xét nghiệm |
| **Sản xuất** | Giám sát chất lượng, phát hiện lỗi sản phẩm từ dữ liệu cảm biến |
| **An ninh mạng** | Phát hiện xâm nhập từ network log (CICIDS2017, KDD Cup) |
| **Kiểm toán** | Tự động kiểm tra dữ liệu kế toán, phát hiện sai sót |

### 3.3 Tiềm năng thương mại hóa
- Triển khai dạng SaaS cho doanh nghiệp vừa và nhỏ.
- Tích hợp vào hệ thống ERP/CRM hiện có qua API.
- Mô hình freemium: miễn phí cho file nhỏ, trả phí cho enterprise.

---

## IV. TÍNH MỚI CỦA ĐỀ TÀI

### 4.1 So sánh với các nghiên cứu hiện có

| Tiêu chí | Nghiên cứu hiện tại | **Đề tài này** |
|---|---|---|
| Phát hiện dị thường | Chỉ output anomaly score | Score + giải thích NL |
| Loại dữ liệu | Chuyên biệt (tabular HOẶC time-series) | **Đa dạng** (tự nhận diện) |
| Giải thích kết quả | Không có / hạn chế | **Chain-of-Thought reasoning** |
| Ngôn ngữ báo cáo | Tiếng Anh | **Đa ngôn ngữ (Việt + Anh)** |
| Kiến trúc | Standalone model | **End-to-end platform** |
| Sửa lỗi dữ liệu | Không | **Có (auto-fix suggestions)** |

### 4.2 Điểm mới cốt lõi

1. **Hybrid Detection Engine**: Kết hợp Deep Learning models (BiLSTM, TranAD, AnoGAN) với LLM-based analysis (TAD-GP) để vừa nhanh vừa có giải thích.
2. **Intelligent Data Router**: Tự động nhận diện loại dữ liệu CSV (tabular/time-series/mixed) và route đến model phù hợp.
3. **Vietnamese NLP Report Generation**: Đầu tiên trong lĩnh vực - tạo báo cáo phân tích dị thường bằng tiếng Việt chuyên ngành.
4. **Self-correcting Pipeline**: Không chỉ phát hiện mà còn đề xuất sửa lỗi dữ liệu trước khi tạo báo cáo.

---

## V. ĐÁNH GIÁ THEO TIÊU CHÍ CHẤM ĐIỂM IUH

> Dựa trên pattern chấm điểm luận văn thạc sĩ IUH (100 điểm)

### Điểm mạnh dự kiến (≥ 80% điểm tối đa)

| Tiêu chí | Điểm tối đa | Dự kiến | Lý do |
|---|---|---|---|
| **Mô hình đề xuất** (IV) | 20 | 16-18 | Kiến trúc hybrid mới, có sơ đồ rõ ràng |
| **Cơ sở lý thuyết** (III) | 15 | 12-14 | 27+ papers từ IEEE/ACM/Scopus |
| **Thực nghiệm** (V) | 20 | 15-17 | Nhiều dataset benchmark, so sánh đa model |

### Điểm cần chú ý

| Rủi ro | Giải pháp |
|---|---|
| Hệ thống phức tạp, khó hoàn thiện 100% | Tập trung core features, phần còn lại là prototype |
| LLM tiếng Việt chất lượng chưa cao | Fine-tune hoặc dùng GPT-4 với prompt engineering |
| Thời gian inference có thể chậm | Thiết kế 2-tier: DL filter nhanh → LLM phân tích sâu |
