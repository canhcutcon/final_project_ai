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
