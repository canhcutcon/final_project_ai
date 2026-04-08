Task 1:
tách data thành 2 : Rental and Sale, focus data sales, check lại các logic nghiệp vụ hiện có
kiểm tra độ nhiễu của data feature bị nhiễu + không đúng abstraction

dataleaage
Bạn đang có:

_high_missing_\* (rất nhiều)
\_freq features
\_encoded
\_biz_rule_violations
anomaly_score
is_anomaly

Task 2:(Feature Selection)
Phân nhóm cho feature :
example:
Nhóm Tài chính (Core Metrics): \* transaction_price, gross_commission, tax, total_amount_paid.

Đặc biệt quan trọng: commission_to_price_ratio. Đây là biến có khả năng chỉ ra các giao dịch "có vấn đề" nếu tỷ lệ hoa hồng quá cao so với giá trị giao dịch.

Nhóm Quy tắc Nghiệp vụ: \* \_biz_rule_violation_count: Những giao dịch có số lượng vi phạm cao (Max = 15) gần như chắc chắn là bất thường.

\_biz_rule_violations: Bạn có thể dùng kỹ thuật One-Hot Encoding cho các loại lỗi phổ biến như COMMISSION_EXCEEDS_PRICE_RATIO.

Nhóm Tần suất (Frequency Features): \* landlord_name_freq, tenant_freq, address_postal_code_freq.

Các giá trị tần suất thấp (outliers về phía âm trong bản phân tích của bạn) có thể chỉ ra các thực thể hoặc địa chỉ hiếm khi xuất hiện, cần được chú ý.

Nhóm Thời gian: \* lease_duration_days: Thời hạn thuê quá ngắn hoặc quá dài bất thường so với trung bình.

2. Xử lý dữ liệu thiếu (Missing Values)
   Dữ liệu của bạn có tỷ lệ Missing rất cao (khoảng 57% cho nhiều cột như landlord_nric, tenant_email). Điều này thường xảy ra khi gộp dữ liệu từ nhiều nguồn khác nhau (ví dụ: source_file từ snre và prosage).

Gợi ý: Thay vì xóa bỏ, hãy sử dụng các cột _high_missing_... mà bạn đã tạo. Chúng đóng vai trò là các biến chỉ thị (Indicator Variables), giúp mô hình hiểu rằng việc thiếu thông tin cũng có thể là một dấu hiệu của sự bất thường.

A. Học không giám sát (Unsupervised Learning)Dành cho trường hợp bạn muốn tìm ra những bất thường mới mà quy tắc nghiệp vụ chưa quét tới:Isolation Forest: Hiệu quả nhất với dữ liệu có nhiều biến và tỷ lệ nhiễu cao.Local Outlier Factor (LOF): Tốt để tìm các giao dịch bất thường so với các giao dịch "lân cận" (ví dụ: giá thuê căn hộ này quá cao so với các căn hộ cùng tòa nhà).B. Học bán giám sát/có giám sátVì bạn đã có cột _biz_rule_violation_count, bạn có thể coi đây là một dạng "nhãn" để huấn luyện:XGBoost / LightGBM: Huấn luyện để dự báo \_biz_rule_violation_count. Những dòng có sai số dự báo (residual) lớn chính là những trường hợp bất thường tiềm năng.Autoencoders (Deep Learning): Nén dữ liệu xuống không gian thấp chiều rồi giải nén lại. Các giao dịch có sai số tái tạo (reconstruction error) cao là các giao dịch bất thường.$$Reconstruction Error = \sum_{i=1}^{n} (x_i - \hat{x}\_i)^2$$

cd /Users/mac/Downloads/GIANG/giang_workspace/csv_agent_platform/detection/notebooks && python train_detection_v8.py 2>&1 | tail -100

tạo notebook v8 traning
bao gồm có các phần phân tích đánh giá cho tâpj data set hiện taị
| 1 | Data Overview |
| 2 | Missing Value Analysis |
| 3 | Distribution Analysis (Histogram / Boxplot / Log) |
| 4 | Correlation Heatmap |
| 5 | Anomaly Visualization |
| 6 | Feature Engineering Pipeline |
| 7 | Feature Importance |
| 8 | Train / Test Comparison (Data Drift + PSI) |

training setup model train, model over view
mô ta chi tiết cấu trúc của tùngư model training
Validation,Evalution và Visualization cho từng model

# Review paper pattern

Problem → Idea → Method → Experiment → Result → Limitation → Insight

1. Problem & Motivation (Bài toán có đáng không?)
2. Contribution (Đóng góp thật hay marketing?)
   👉 Tách ra:
   Technical contribution (model, algorithm)
   System contribution (architecture, pipeline)

3. Method / Approach (Cách làm có solid không?)
   3.1 Model choice
   3.2 Pipeline
   Preprocess → inference → postprocess có hợp lý không?
   3.3 System Design
   Có scalable không?
   Có production-ready không?

4. Experiment & Evaluation (phần dễ bị “lùa gà” nhất 🐔)
   4.1 Dataset
   Có bias không?
   Có đủ lớn không?
   4.2 Metrics
   Precision cao nhưng recall thấp → nghĩa là gì?
   4.3 Baseline comparison
5. Result (kết quả có đáng tin không?)
   Có overfit không?
   Có real-world test không?
6. Summary
7. Strengths
8. Weaknesses
9. Technical Evaluation
10. Experimental Evaluation
11. Suggestions
12. Final Verdict
13. Presentation Score
    Aspect Score (1–5)
    Clarity
    Structure
    Conciseness
    Visuals
    Storytelling
    Academic depth

---

state of the art but Experimental results achieve 91.9% precision, 67.5% recall,
and 82.1% mAP@50,?

Precision = 91.9%
Recall = 67.5%
👉 Dịch ra:
Model “rất ít sai” nhưng “bỏ sót nhiều”
Có so với model khác không?

📌 Paper:

Không thấy benchmark rõ với YOLOv8 / Faster R-CNN ❌

👉 Đây là điểm trừ lớn.
4.1 Dataset
Có bias không?
Có đủ lớn không?
📌 Paper:
VinDr-CXR (18k images) → khá tốt
Nhưng: class imbalance ❗
4.2 Metrics
Precision cao nhưng recall thấp → nghĩa là gì?

📌 Paper:

Precision = 91.9%
Recall = 67.5%

👉 Dịch ra:

Model “rất ít sai” nhưng “bỏ sót nhiều”

👉 Nhận xét:

“Model favors precision over recall, which may be risky in medical diagnosis.”
Nhưng:
Không có external dataset ❌
Không có clinical validation ❌

👉 Nhận xét:

“Results are promising but lack real-world validation.”

🚨 3.2 Thiếu baseline comparison

Không có:

YOLOv8 vs YOLOv11
Faster R-CNN
RT-DETR

👉 Đây là lỗi nặng trong paper ML

“Why YOLOv11?” → trả lời chưa đủ thuyết phục

🚨 3.3 Recall thấp (67.5%) ⚠️

Trong medical:

Miss bệnh = rất nguy hiểm

👉 Precision cao nhưng:

Model “chắc ăn nhưng bỏ sót nhiều”

👉 Nhận xét:

Not suitable as standalone diagnostic system

2.1 Section “System Design” quá dài
Chiếm gần 40–50% paper
Quá nhiều chi tiết:
payment (VNPay)
queue logic
role system

👉 Đây là implementation detail, không phải research core
Phần Main Contributions:

Viết dài
Nhưng không highlight rõ:
cái nào là NEW
cái nào là IMPROVEMENT

4.2 Thiếu visualization quan trọng

Không có:

Sample prediction (bounding box output)
Failure case images

👉 Trong medical AI:
→ cái này cực kỳ quan trọng
