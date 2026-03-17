                +----------------------+
                |      Client / UI     |
                |  (Web / Postman)     |
                +----------+-----------+
                           |
                           v
                +----------------------+
                |      API Gateway     |
                |  FastAPI / NestJS    |
                +----------+-----------+
                           |
        --------------------------------------------
        |                    |                     |
        v                    v                     v

+---------------+ +----------------+ +----------------+
| Data Service | | AI Model | | NLP Service |
| CSV Parsing | | Anomaly Detect | | Report Gen |
| Feature Eng | | BiLSTM | | LLM / T5 |
+---------------+ +----------------+ +----------------+
| | |
--------------------------------------------
|
v
+--------------+
| Storage |
| PostgreSQL |
| / S3 / MinIO |
+--------------+

Tech stack gợi ý
Layer Tech
API FastAPI
ML model PyTorch / TensorFlow
Data pipeline Pandas
Storage PostgreSQL
File storage MinIO
Queue Redis / Celery
Container Docker

Upload CSV
↓
Data preprocessing
↓
Feature engineering
↓
model prediction
↓
Anomaly score
↓
Return anomalies

research paper , survey about
deep learning anomaly detection tabular data
model anomaly detection time series
model anomaly detection transactional data
unsupervised anomaly detection structured datasets
deep anomaly detection for tabular datasets
around 2020–2025 for CSV AI Platform – anomaly detection + report generation.
from master and phd

Slide so với bữa trước em thấy chỉnh chu hơn rồi ấy ạ, chỗ đề bài cũng nêu rõ dễ hiểu hơn
mà có mấy chỗ testcases nó báo đỏ em cũng ko rõ phải sai chính tả hay ko.
với em có vài câu hỏi nhỏ, có gì chị thấy hợp lý thì thêm nha
cái chỗ gas cost mình có estimate được tầm trung bình bao nhiêu? với hiện tại mình có nên làm thống kê 1 ngày bao nhiêu giao dịch máu để làm thống kê cho rõ hay ko? Kiểu chỗ này mình thống kê chi phí để xem system có tối ưu j hay ko.
Với như em đặt câu hỏi bữa trc là tại sao chọn public chain thay gì private chain Hyperledger Fabric (private/permissioned blockchain) -> thường dùng cho ngân hàng, y tế
có mấy câu này có thể là bên hội đồng sẽ hỏi về phần blockchain
