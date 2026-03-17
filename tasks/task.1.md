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

---

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

Core Feature 1 — CSV Anomaly Detection
Upload CSV
↓
Data preprocessing
↓
Feature engineering
↓
BiLSTM prediction
↓
Anomaly score
↓
Return anomalies

Core Feature 2 — Report Generation Base on REport affer correct data (English, Vietnamese)

4️⃣ Core Feature 3 — Full Analysis Pipeline
CSV
↓
Preprocess
↓
Anomaly Detection
↓
Fixing
↓
Summary
↓
Report generation
↓
Return PDF / text
