- model AD → "mô hình phát hiện bất thường", tổ hợp AD → "ensemble phát hiện bất thường"
- evidence → "bằng chứng", LLM downstream → "LLM hạ nguồn"
- benchmark → "bộ đánh giá chuẩn", knowledge graph/KG → "đồ thị tri thức"
- paper → "công trình", fine-tune → "tinh chỉnh", English-only → "chỉ hỗ trợ tiếng Anh"
- domain-specific → "đặc thù theo lĩnh vực"
- Bảng so sánh: Domain dữ liệu → "Lĩnh vực dữ liệu", On-prem SME? → "Triển khai tại chỗ", scorer → "bộ tính điểm", Mixed tabular/Cybersecurity tabular → dịch
- Evidence Packet → "Gói Bằng chứng", cloud → "đám mây", hallucination → "ảo giác mô hình"
- §1.6 tóm tắt: ML cổ điển/Deep Learning/NLP/fine-tune/domain → dịch tương ứng
- pseudo-labeling → "gán nhãn giả (pseudo-labeling)", confidence → "độ tin cậy".
  - activation → "giá trị kích hoạt", mini-batch → "lô nhỏ", learning rate → "tốc độ học"
  - sequence model → "mô hình chuỗi", training → "quá trình huấn luyện", overfitting → "quá khớp"
  - loss → "hàm mất mát", L1/L2 Regularization → "Chính quy hoá L1/L2"
  - residual error → "sai số dư", gradient boosting → "tăng cường gradient"
  - learning rate → "tốc độ học", precision-recall curve → "đường cong độ chính xác--độ phủ"
  - pseudo-label → "nhãn giả", Threats to validity → "Mối đe doạ đến tính hiệu lực"
  - holdout → "tập dữ liệu giữ lại"
  - latent representation → "biểu diễn không gian ẩn", noise injection → "tiêm nhiễu", - - latent dimension → "chiều không gian ẩn"
  - Anomaly score → "Điểm số bất thường", latent space → "không gian ẩn"
  - BiLSTM Classifier → "Bộ phân loại BiLSTM"
  - hidden size → "kích thước ẩn", layers → "lớp", sequence window → "cửa sổ chuỗi", time-series → "chuỗi thời gian"
  - dual-decoder → "hai bộ giải mã", decoder → "bộ giải mã"
  - normal vs. anomaly → "bình thường và bất thường"
  - Loss → "Hàm mất mát", reconstruction và discrimination → "tái tạo và phân biệt"
  - self-conditioning attention → "chú ý tự điều kiện hoá", pattern → "mẫu"
  - fast mapping encoder → "bộ mã hoá ánh xạ nhanh"
  - latent code → "mã không gian ẩn"
  - Anomaly score → "Điểm số bất thường", reconstruction → "tái tạo", discrimination → "phân biệt"
    LLM models:
  - context window → "cửa sổ ngữ cảnh"
  - decoder-only → "chỉ bộ giải mã (decoder-only)"
  - RoPE positional encoding → "mã hoá vị trí RoPE"
  - Multi-Query Attention → "Chú ý đa truy vấn (Multi-Query Attention)"
- score-level fusion → "hợp nhất ở mức điểm số", anomaly score → "điểm số bất thường"
- grid search → "tìm kiếm lưới", validation → "kiểm định"
- self-attention → "tự chú ý", query, key, value matrices → "ma trận truy vấn, khoá, giá trị"
  - key vector → "véc-tơ khoá", Multi-Head Attention → "Chú ý đa đầu", attention head → "đầu chú ý"
- Pipeline tuỳ biến rule → Quy trình tuỳ biến luật (dòng 72)
- thêm vào pipeline → thêm vào quy trình xử lý (dòng 80)
- pipeline tái huấn luyện → quy trình tái huấn luyện (dòng 81)
- tenant → doanh nghiệp (dòng 83)
  §PEFT và LoRA:
- Tabular → Dữ liệu dạng bảng
- Time-series → Dữ liệu chuỗi thời gian
- cùng file → cùng tệp
  Tiêu đề & mở đầu:
  - Pipeline 8 giai đoạn → Quy trình 8 giai đoạn
  - Pipeline tiền xử lý ... modular → Quy trình tiền xử lý ... theo hướng module hoá

  Đảo cụm tiếng Việt lên trước (English) trong ngoặc:
  - Loading (Nạp dữ liệu) → Nạp dữ liệu (Loading)
  - Cleaning → Làm sạch dữ liệu (Cleaning)
  - Feature Engineering → Kỹ thuật đặc trưng (Feature Engineering)

  Dịch các thuật ngữ phổ thông:
  - schema → lược đồ
  - sheet → trang tính
  - missing value → giá trị thiếu
  - median/mode → trung vị/yếu vị
  - numeric/categorical → số/danh mục
  - forward-fill cho time-series → điền xuôi cho chuỗi thời gian
  - fuzzy duplicate → trùng lặp xấp xỉ
  - flag outlier → đánh dấu giá trị ngoại lệ
  - Join sale × client × property × invoice × payee → giao dịch × khách hàng × bất động sản × hoá đơn × người nhận thanh toán
  - date difference → khoảng cách thời gian
  - agent velocity → tốc độ giao dịch của môi giới
  - district target encoding → mã hoá theo mục tiêu cho quận/huyện
  - rolling statistics → thống kê trượt
  - Cleaning → Làm sạch dữ liệu (Cleaning)
  - Feature Engineering → Kỹ thuật đặc trưng (Feature Engineering)
  - 5 tập huấn luyện bộ đánh giá chuẩn công khai → 5 tập dữ liệu chuẩn công khai
  - domain BĐS Singapore → lĩnh vực BĐS Singapore
  - ablation study → nghiên cứu kiểm định loại bỏ
  - rule-blind → loại trừ luật
  - ablation Evidence Packet → kiểm định loại bỏ Gói bằng chứng
  - leave-one-out pipeline stages → kiểm định loại bỏ từng giai đoạn chuỗi xử lý
  - LoRA fine-tune → tinh chỉnh LoRA
  - template-based → sinh theo mẫu cố định
  - đa tenant → đa người thuê
  - CSV 10,000 dòng → CSV 10.000 dòng
  - pipeline tiền xử lý → quy trình tiền xử lý
  - Schema Augmentation cho mô hình universal → tăng cường lược đồ (Schema Augmentation) cho mô hình đa lĩnh vực
  - Model Router--Ensemble AD--Evidence Packet--LLM Report Pipeline → giữ tên gốc nhưng thêm dịch tiếng Việt phía trước: Bộ định tuyến mô hình--Ensemble phát hiện bất thường--Gói chứng cứ--Quy trình sinh báo cáo bằng LLM
  - micro-service → vi dịch vụ
  - Section 3.5 → Mục 3.5
  - cơ chế tuỳ biến rule → cơ chế tuỳ biến luật
  - Anomaly-Detection-as-a-Service → Phát hiện bất thường dạng dịch vụ (Anomaly-Detection-as-a-Service)
  - rule + model riêng cho mỗi tenant → bộ luật và mô hình riêng cho mỗi doanh nghiệp
  - pipeline tuỳ biến rule trên case study → quy trình tuỳ biến luật trên tình huống nghiên cứu
    Tiêu đề:
  - Schema Augmentation cho mô hình universal → Tăng cường lược đồ (Schema Augmentation) cho mô hình đa lĩnh vực
  - Caption bảng: augmentation → tăng cường; universal → đa lĩnh vực

  - Tiêu đề: Threats to validity (...) → Cảnh báo về tính hợp lệ của kết quả:
  - Internal validity -- Circular evaluation → Tính hợp lệ nội bộ -- Đánh giá vòng khép kín
  - pseudo-labeling → nhãn giả; feature leakage → rò rỉ đặc trưng; engineer từ label → được tổng hợp từ nhãn; group-aware split → phân chia nhận biết nhóm; baseline rule-based → phương pháp nền tảng dựa trên luật; classifier
    → bộ phân loại
    cấp kiến trúc; performance claim → khẳng định hiệu năng
  - Construct validity → Tính hợp lệ cấu trúc; n-gram overlap → độ trùng khớp n-gram; reference template → mẫu tham chiếu
  - Conclusion validity -- Latency đo component-level → Tính hợp lệ kết luận -- Độ trễ đo theo thành phần; pipeline component → thành phần chuỗi xử lý; Docker overhead → chi phí Docker; LLM inference → suy luận LLM
  - Human score → Điểm chuyên gia
  - reviewer → người đánh giá (cả 2 chỗ)
  - template-based NLG → sinh ngôn ngữ theo mẫu cố định
    Phương pháp đo (dòng 406): Benchmark → Đo hiệu năng; pipeline component → thành phần chuỗi xử lý; synthetic → tổng hợp; Preprocess → Tiền xử lý; features → đặc trưng; Report generation → Sinh báo cáo; Docker overhead → Chi
    phí Docker; container networking → kết nối mạng container; CSV 10,000 → CSV 10.000; SLA target → ngưỡng SLA

  Ưu điểm (dòng 414–416): false positive → dương tính giả; LoRA fine-tune → Tinh chỉnh LoRA; micro-service → vi dịch vụ; scale → mở rộng quy mô; component → thành phần

  Dòng 419: false negative → âm tính giả; false positive → dương tính giả; trade-off → đánh đổi
  Đoạn mở:
  - dataset huấn luyện → tập huấn luyện
  - subset → tập con
  - universal feature builder → bộ sinh đặc trưng đa lĩnh vực (universal feature builder)
  - master dataset (385 cột gốc) → tập dữ liệu gốc (385 cột)

  Trong bảng:
  - Random subset → Tập con ngẫu nhiên (4 dòng)
  - CSV upload thưa → CSV tải lên thưa
  - combo subset + padding → kết hợp tập con + độn thêm

  Phần giải thích:
  - dataset gốc → tập dữ liệu gốc
  - log, metadata → nhật ký, siêu dữ liệu
  - XGBoost toàn năng → XGBoost đa lĩnh vực

- LLM Report Pipeline → Quy trình sinh báo cáo bằng LLM
- evidence packet → gói chứng cứ (evidence packet)
- raw CSV row → hàng CSV gốc
- kết quả AD → kết quả phát hiện bất thường
  Dịch các thuật ngữ phổ thông:

- schema → lược đồ
- sheet → trang tính
- missing value → giá trị thiếu
- median/mode → trung vị/yếu vị
- numeric/categorical → số/danh mục
- forward-fill cho time-series → điền xuôi cho chuỗi thời gian
- fuzzy duplicate → trùng lặp xấp xỉ
- flag outlier → đánh dấu giá trị ngoại lệ
- Join sale × client × property × invoice × payee → giao dịch × khách hàng × bất động sản × hoá đơn × người nhận thanh toán
- agent, district, project → môi giới, quận/huyện, dự án
- date difference → khoảng cách thời gian
- agent velocity → tốc độ giao dịch của môi giới
- district target encoding → mã hoá theo mục tiêu cho quận/huyện
- rolling statistics → thống kê trượt
- Sliding window, stride, window → cửa sổ trượt, bước trượt, cửa sổ
- anomaly → bất thường
- fix bug → sửa lỗi
- SHAP importance → độ quan trọng SHAP
- linear model, tree model → mô hình tuyến tính, mô hình cây

Giữ nguyên các tên kỹ thuật chuẩn (UTF-8/CP1258, XLSX/CSV, IQR, SHAP, StandardScaler/RobustScaler, snake_case, transaction_id, any(), tên đặc trưng).

- Tiêu đề: "LoRA fine-tune" → "tinh chỉnh LoRA"
- adapter → "bộ thích nghi", rank → "hạng", fine-tune → "tinh chỉnh"
- target modules → "các mô-đun mục tiêu"

- Preprocessing → Tiền xử lý (Preprocessing)
- Anomaly Detection → Phát hiện bất thường (Anomaly Detection)
- Auto-Fix → Tự động sửa lỗi (Auto-Fix)
- Report \& Export → Báo cáo và xuất kết quả (Report \& Export)
- format, encoding → định dạng, mã hoá
- Celery task → tác vụ Celery
- Model Router chọn → Bộ định tuyến mô hình chọn
- inference → suy luận
- ensemble score → điểm ensemble
- confidence ≥ 0.7 auto-apply → độ tin cậy ≥ 0.7 áp dụng tự động
- human review → kiểm duyệt thủ công
- → (Unicode mũi tên) → $\rightarrow$ (đồng nhất với phần còn lại của tài liệu)
- Aggregation → Tổng hợp (Aggregation); severity, affected column → mức độ nghiêm trọng, cột bị ảnh hưởng
- Enrichment → Làm phong phú (Enrichment); transaction type, agent info, district → loại giao dịch, thông tin môi giới, quận/huyện
- Jinja2 Template → Tạo khuôn mẫu Jinja2; prompt → câu lệnh (prompt); few-shot examples → ví dụ minh hoạ (few-shot)
- LLM Inference → Suy luận bằng LLM; fine-tune → tinh chỉnh
- PDF Export → Xuất PDF; render → kết xuất
- Mũi tên Unicode $\to$ → $\rightarrow$ cho đồng nhất

  Giữ nguyên các tên thành phần riêng (Gemini Fix Service, LLM Report Generator, WeasyPrint, Markdown, PDF, Celery, CSV/XLSX).
  ('chậm inference', 'chậm suy luận'),
  ('SOTA trên 6/9 dataset chuẩn', 'Tiên tiến nhất trên 6/9 tập dữ liệu chuẩn'),
  ('phức tạp với tabular thưa', 'phức tạp với dữ liệu dạng bảng thưa'),
  ('AUC 0.99 fraud detection', 'AUC 0.99 phát hiện gian lận'),
  ('tham số fine-tune; benchmark NLU', 'tham số tinh chỉnh; bộ đánh giá chuẩn NLU'),
  ('SOTA Open-domain QA; cần vector DB riêng', 'Tiên tiến nhất hỏi-đáp miền mở; cần cơ sở dữ liệu vector riêng'),
  ('GPT-4 level finance NLP; không hỗ trợ Vietnamese', 'Ngang GPT-4 về xử lý ngôn ngữ tài chính; không hỗ trợ tiếng Việt'),
  ('50B params finance; không open-source đầy đủ', '50 tỷ tham số tài chính; không mã nguồn mở hoàn toàn'),
  ('Cải thiện reasoning; không ổn định output format', 'Cải thiện khả năng suy luận; định dạng đầu ra không ổn định'),
  ('Đánh giá NLG tốt hơn BLEU', 'Đánh giá sinh văn bản tốt hơn BLEU'),
  ('Latent space học được; reconstruction blur', 'Không gian ẩn học được; hình tái tạo mờ'),
  ('Nền tảng mọi mô hình SOTA hiện đại', 'Nền tảng mọi mô hình tiên tiến hiện đại'),
  ('57 dataset) & Benchmark chuẩn cho tabular AD; chưa đánh giá LLM-based methods', '57 tập dữ liệu) & Bộ đánh giá chuẩn phát hiện bất thường dạng bảng; chưa đánh giá phương pháp dựa trên LLM'),
  ('(dataset A); line-by-line, chưa batch', '(tập A); từng dòng, chưa xử lý theo lô'),
  ('SOTA trên 6 mixed-type dataset; chi phí inference cao, chỉ output score', 'Tiên tiến nhất trên 6 tập dữ liệu kiểu hỗn hợp; chi phí suy luận cao, chỉ xuất điểm số'),
  ('Ngang SOTA trên ODDS; batch-level, không real-time per-row', 'Ngang tiên tiến nhất trên ODDS; xử lý theo lô, không theo thời gian thực từng hàng'),
  ('chỉ test cybersecurity', 'chỉ kiểm thử an ninh mạng'),
  ('Tổng quát hoá đa domain; không tích hợp LLM report', 'Tổng quát hoá đa lĩnh vực; không tích hợp LLM sinh báo cáo'),
  ('Cung cấp metric đánh giá report; là benchmark, không phải phương pháp', 'Cung cấp độ đo đánh giá báo cáo; là bộ đánh giá chuẩn, không phải phương pháp'),
  ('Giảm hallucination; phụ thuộc KG xây sẵn, không cho CSV thuần', 'Giảm ảo giác mô hình; phụ thuộc đồ thị tri thức xây sẵn, không dùng được cho CSV thuần'),
  ('Tốt hơn global AD trên 8 dataset; không tích hợp LLM', 'Tốt hơn phát hiện bất thường toàn cục trên 8 tập dữ liệu; không tích hợp LLM'),
  ('Taxonomy đầy đủ tới 2024; AD section ngắn, chưa sâu', 'Phân loại đầy đủ tới 2024; phần phát hiện bất thường ngắn, chưa sâu'),
  ('không hỗ trợ dạng bảng', 'không hỗ trợ dữ liệu dạng bảng'),
  ────────────────────────────────────────┬────────────────────────────────────────────────────────────────────────┐
  │ Trước │ Sau │
  ├────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────┤
  │ circular evaluation │ đánh giá vòng khép kín + giữ circular evaluation trong ngoặc │
  ├────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────┤
  │ nhãn rule-based │ nhãn dựa trên luật │
  ├────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────┤
  │ nhiều domain khác nhau │ nhiều lĩnh vực khác nhau │
  ├────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────┤
  │ schema augmentation │ tăng cường lược đồ + schema augmentation trong ngoặc │
  ├────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────┤
  │ universal feature builder │ bộ xây dựng đặc trưng phổ quát + universal feature builder trong ngoặc │
  ├────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────┤
  │ benchmark công khai / ground-truth │ tập dữ liệu chuẩn công khai / nhãn thực tế độc lập │
  ├────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────┤
  │ train/test, tập train, tập test │ huấn luyện/kiểm tra, tập huấn luyện, tập kiểm tra │
  ├────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────┤
  │ convention chuẩn │ quy ước chuẩn │
  ├────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────┤
  │ benchmark suite │ bộ tập dữ liệu chuẩn │
  ├────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────┤
  │ phương pháp AD │ phương pháp phát hiện bất thường │
  ├────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────┤
  │ COPOD (Copula-Based Outlier Detection) │ thêm bản dịch tiếng Việt trước, giữ tên Anh trong ngoặc │
  └────────────────────────────────────────┴────────────────────────────────────────────────────────
  custom rule (caption bảng) │ luật tuỳ chỉnh │
  ├─────────────────────────────────────────┼────────────────────────────────────────┤
  │ 3 HDB custom rules + re-train │ 3 luật tuỳ chỉnh HDB + tái huấn luyện │
  ├─────────────────────────────────────────┼────────────────────────────────────────┤
  │ custom pseudo-labels từ bộ rule mở rộng │ nhãn giả tuỳ chỉnh từ bộ luật mở rộng │
  ├─────────────────────────────────────────┼────────────────────────────────────────┤
  │ Tenant A/B │ Người thuê A/B (nhất quán) │
  ├─────────────────────────────────────────┼────────────────────────────────────────┤
  │ subsection: khai báo custom rule │ khai báo luật tuỳ chỉnh │
  ├─────────────────────────────────────────┼────────────────────────────────────────┤
  │ tuỳ biến bộ rule phát hiện bất thường │ tuỳ chỉnh bộ luật phát hiện bất thường │

  │ pseudo-labeling ensemble │ gán nhãn giả bằng học tổng hợp (pseudo-labeling) │
  ├───────────────────────────────────────┼───────────────────────────────────────────────────────────────┤
  │ nhãn pseudo-label từ 13 nhóm │ nhãn giả (pseudo-label) từ 13 nhóm │
  ├───────────────────────────────────────┼───────────────────────────────────────────────────────────────┤
  │ pseudo-label tự động │ nhãn giả tự động │
  ├───────────────────────────────────────┼───────────────────────────────────────────────────────────────┤
  │ pseudo-labeling ensemble; mô hình học │ gán nhãn giả bằng học tổng hợp (pseudo-labeling); mô hình học │
  ├───────────────────────────────────────┼───────────────────────────────────────────────────────────────┤
  │ pseudo-label từ rule-based labeling │ nhãn giả (pseudo-label) từ gán nhãn dựa trên luật │
  └───────────────────────────────────────┴─────────────────────────────────────────────────────────
  Trước │ Sau │
  ├──────────────────────────────────────┼─────────────────────────────┤
  │ extit{circular reasoning} (lỗi tab) │ \textit{circular reasoning} │
  ├──────────────────────────────────────┼────────────────────────────────┤
  │ Rule-blind test (tiêu đề subsection) │ Kiểm tra loại trừ luật │
  ├──────────────────────────────────────┼────────────────────────────────┤
  │ 12 domain rules │ 12 luật nghiệp vụ │
  ├──────────────────────────────────────┼────────────────────────────────┤
  │ 8 domain rules │ 8 luật nghiệp vụ miền │
  ├────────────────────────────────────────┼───────────────────────────────────────────────────────────────┤
  │ Tập nhãn rule-blind │ Tập nhãn loại trừ luật │
  ├────────────────────────────────────────┼───────────────────────────────────────────────────────────────┤
  │ tập test │ tập kiểm tra │
  ├────────────────────────────────────────┼───────────────────────────────────────────────────────────────┤
  │ domain rules và bị loại │ luật nghiệp vụ và bị loại │
  ├────────────────────────────────────────┼───────────────────────────────────────────────────────────────┤
  │ 4030 mẫu │ 4.030 mẫu (thêm dấu phân ngàn) │
  ├────────────────────────────────────────┼───────────────────────────────────────────────────────────────┤
  │ Rule features: │ Đặc trưng luật: │
  ├────────────────────────────────────────┼───────────────────────────────────────────────────────────────┤
  │ feature importance │ tầm quan trọng đặc trưng │
  ├────────────────────────────────────────┼───────────────────────────────────────────────────────────────┤
  │ feature selection (Mutual Information) │ lựa chọn đặc trưng (Thông tin tương hỗ -- Mutual Information) │
  └────────────────────────────────────────┴──────────────────────────────────────────────────────

⏺ ┌─────────────────────────────────────────┬─────────────────────────────────────────┐
│ Trước │ Sau │
├─────────────────────────────────────────┼─────────────────────────────────────────┤
│ tập rule-blind │ tập loại trừ luật │
├─────────────────────────────────────────┼─────────────────────────────────────────┤
│ khả năng phân biệt (ranking) │ khả năng phân biệt (xếp hạng) │
├─────────────────────────────────────────┼─────────────────────────────────────────┤
│ rule features chiếm 0\% importance │ đặc trưng luật chiếm 0\% tầm quan trọng │
├─────────────────────────────────────────┼─────────────────────────────────────────┤
│ các pattern bất thường │ các mẫu bất thường │
├─────────────────────────────────────────┼─────────────────────────────────────────┤
│ replay'' bộ luật | tái hiện'' bộ luật │ │
└─────────────────────────────────────────┴─────────────────────────────────────────┘

⏺ ┌────────────────────────┬───────────────────────────────┐
│ Trước │ Sau │
├────────────────────────┼───────────────────────────────┤
│ template-based │ sinh báo cáo theo mẫu cố định │
├────────────────────────┼───────────────────────────────┤
│ human score │ điểm chuyên gia │
├────────────────────────┼───────────────────────────────┤
│ \textit{Actionability} │ \textit{Khả hành} │
├────────────────────────┼───────────────────────────────┤
│ \textit{Coverage} │ \textit{Bao phủ} │
├────────────────────────┼───────────────────────────────┤
│ Rule context │ ngữ cảnh luật │
├────────────────────────┼───────────────────────────────┤
│ LLM │ mô hình ngôn ngữ lớn │
├────────────────────────┼───────────────────────────────┤
│ human evaluation │ đánh giá chuyên gia │
└────────────────────────┴────────────────────────────
┌────────────────────────────────┬──────────────────────────────────────────────────────┐
│ Trước │ Sau │
├────────────────────────────────┼──────────────────────────────────────────────────────┤
│ pipeline 8 giai đoạn (tiêu đề) │ chuỗi xử lý 8 bước │
├────────────────────────────────┼──────────────────────────────────────────────────────┤
│ Pipeline tiền xử lý │ Chuỗi xử lý tiền xử lý │
├────────────────────────────────┼──────────────────────────────────────────────────────┤
│ §3,2 (sót) │ §3.2 │
├────────────────────────────────┼──────────────────────────────────────────────────────┤
│ leave-one-out ablation │ kiểm định loại bỏ từng bước (leave-one-out ablation) │
├────────────────────────────────┼──────────────────────────────────────────────────────┤
│ tập test V10 │ tập kiểm tra V10 │
├────────────────────────────────┼──────────────────────────────────────────────────────┤
│ pipeline tiền xử lý (caption) │ chuỗi tiền xử lý │
├────────────────────────────────┼──────────────────────────────────────────────────────┤
│ $\Delta$F1 vs. Full │ $\Delta$F1 so với đầy đủ │
├────────────────────────────────┼──────────────────────────────────────────────────────┤
│ Full pipeline (8 stages) │ Chuỗi xử lý đầy đủ (8 giai đoạn) │
├────────────────────────────────┼──────────────────────────────────────────────────────┤
│ Stage 1–7 + tên Anh │ Giai đoạn 1–7 + tên tiếng Việt │
├────────────────────────────────┼──────────────────────────────────────────────────────┤
│ Stage 8 (Label generation) │ Giai đoạn 8 (Sinh nhãn) │
├────────────────────────────────┼──────────────────────────────────────────────────────┤
│ drop lớn nhất │ giảm F1 lớn nhất │
├────────────────────────────────┼──────────────────────────────────────────────────────┤
│ pipeline tối giản │ chuỗi xử lý tối giản
│ template (n-gram overlap với reference) │ mẫu cố định (độ trùng lặp n-gram với câu tham chiếu) │
├────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────┤
│ NLG community │ cộng đồng nghiên cứu sinh ngôn ngữ tự nhiên │
├────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────┤
│ tập test │ tập kiểm tra │
├────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────┤
│ price outlier / volume spike/drop / timing pattern │ ngoại lệ giá / đột biến/sụt giảm giao dịch / mẫu thời điểm bất thường │
├────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────┤
│ Reviewer: │ Người đánh giá: │
├────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────┤
│ anchor │ người đánh giá tham chiếu │
├────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────┤
│ data analyst / business analyst │ phân tích dữ liệu / phân tích nghiệp vụ │
├────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────┤
│ blind đối với nguồn │ không biết nguồn gốc │
├────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────┤
│ zero-shot baseline │ mô hình zero-shot │
├────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────┤
│ Pilot 5 mẫu │ Thử nghiệm thí điểm 5 mẫu │
├────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────┤
│ 3 reviewer / reviewer nghiệp vụ │ 3 người đánh giá / người đánh giá nghiệp vụ │
├────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────┤
│ Rubric: tên Anh trước → Việt trong ngoặc │ Tên Việt trước → Anh trong ngoặc │
├────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────┤
│ hallucination │ thông tin bịa đặt (hallucination) │
├────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────┤
│ AD đầu vào / flag / input / đúng schema │ phát hiện bất thường đầu vào / cờ cảnh báo / đầu vào / đúng cấu trúc quy định │
├────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────┤
│ Inter-Annotator Agreement (IAA): │ Độ đồng thuận giữa người đánh giá (IAA): │
├────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────┤
│ human eval vs. BLEU/ROUGE │ đánh giá chuyên gia với BLEU/ROUGE │
├────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────┤
│ metric automatic / human score │ độ đo tự động / điểm chuyên gia │
└────────────────────────────────────────────────────┴───────────────────────────────────
