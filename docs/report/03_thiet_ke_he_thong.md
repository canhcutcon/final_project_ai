# THIẾT KẾ HỆ THỐNG (BACKEND - FRONTEND)

## CSV AI Platform — System Architecture Document

---

## I. KIẾN TRÚC TỔNG THỂ

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                          │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Web App    │  │  API Client  │  │  Mobile App   │  │
│  │  (React/    │  │  (Postman/   │  │  (Future)     │  │
│  │   Next.js)  │  │   cURL)      │  │               │  │
│  └──────┬──────┘  └──────┬───────┘  └───────┬───────┘  │
└─────────┼────────────────┼──────────────────┼──────────┘
          │                │                  │
          ▼                ▼                  ▼
┌─────────────────────────────────────────────────────────┐
│                   API GATEWAY (FastAPI)                   │
│  ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌────────┐ │
│  │  Auth    │  │  Rate     │  │  CORS    │  │ Routing│ │
│  │  (JWT)   │  │  Limiter  │  │  Middleware│ │        │ │
│  └──────────┘  └───────────┘  └──────────┘  └────────┘ │
└────────────────────────┬────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Data Service │ │  AI Service  │ │ NLP Service  │
│              │ │              │ │              │
│ • CSV Parse  │ │ • BiLSTM     │ │ • LLM API    │
│ • Clean      │ │ • TranAD     │ │ • Chain-of-  │
│ • Feature    │ │ • AnoGAN     │ │   Thought    │
│   Engineer   │ │ • Score Calc │ │ • Report Gen │
│ • Type Det.  │ │ • GAN Balance│ │ • PDF Export │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │
       ▼                ▼                ▼
┌─────────────────────────────────────────────────────────┐
│                   STORAGE LAYER                          │
│  ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌────────┐ │
│  │PostgreSQL│  │  MinIO/S3 │  │  Redis   │  │ Model  │ │
│  │(Metadata)│  │(CSV/PDF)  │  │(Cache/Q) │  │Registry│ │
│  └──────────┘  └───────────┘  └──────────┘  └────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## II. BACKEND (FastAPI + Python)

### 2.1 Cấu trúc thư mục

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI entry point
│   ├── config.py               # Settings & env vars
│   ├── api/
│   │   ├── v1/
│   │   │   ├── endpoints/
│   │   │   │   ├── upload.py       # CSV upload endpoints
│   │   │   │   ├── analysis.py     # Anomaly detection endpoints
│   │   │   │   ├── report.py       # Report generation endpoints
│   │   │   │   ├── pipeline.py     # Full pipeline endpoints
│   │   │   │   └── health.py       # Health check
│   │   │   └── router.py
│   │   └── deps.py             # Dependencies (DB, Auth)
│   ├── core/
│   │   ├── security.py         # JWT Auth
│   │   └── exceptions.py       # Custom exceptions
│   ├── models/                 # SQLAlchemy models
│   │   ├── user.py
│   │   ├── dataset.py
│   │   ├── analysis_result.py
│   │   └── report.py
│   ├── schemas/                # Pydantic schemas
│   │   ├── upload.py
│   │   ├── analysis.py
│   │   └── report.py
│   ├── services/
│   │   ├── data_service.py     # CSV processing
│   │   ├── ai_service.py       # Model inference
│   │   ├── nlp_service.py      # Report generation
│   │   └── pipeline_service.py # Full pipeline orchestration
│   └── ml/
│       ├── models/
│       │   ├── bilstm_autoencoder.py
│       │   ├── tranad.py
│       │   └── anogan.py
│       ├── preprocessing.py
│       ├── inference.py
│       └── model_registry.py
├── tests/
├── alembic/                    # DB migrations
├── docker-compose.yml
├── Dockerfile
└── requirements.txt
```

### 2.2 API Endpoints chính

| Method | Endpoint                        | Mô tả                        |
| ------ | ------------------------------- | ---------------------------- |
| `POST` | `/api/v1/upload`                | Upload file CSV              |
| `GET`  | `/api/v1/upload/{id}/preview`   | Xem trước dữ liệu (10 dòng)  |
| `POST` | `/api/v1/analysis/detect`       | Chạy anomaly detection       |
| `GET`  | `/api/v1/analysis/{id}/results` | Lấy kết quả phát hiện        |
| `POST` | `/api/v1/report/generate`       | Tạo báo cáo NLP              |
| `GET`  | `/api/v1/report/{id}/download`  | Tải PDF báo cáo              |
| `POST` | `/api/v1/pipeline/run`          | Chạy full pipeline           |
| `GET`  | `/api/v1/pipeline/{id}/status`  | Kiểm tra trạng thái pipeline |

### 2.3 Core Services

#### Data Service

```python
# services/data_service.py
class DataService:
    async def upload_csv(self, file: UploadFile) -> DatasetMeta:
        """Upload và lưu CSV vào MinIO"""

    async def detect_data_type(self, dataset_id: str) -> str:
        """Nhận diện: 'tabular' | 'timeseries' | 'mixed'"""

    async def preprocess(self, dataset_id: str) -> PreprocessResult:
        """Clean, encode, scale dữ liệu"""

    async def get_preview(self, dataset_id: str, rows: int = 10) -> dict:
        """Preview dữ liệu đã xử lý"""
```

#### AI Service

```python
# services/ai_service.py
class AIService:
    async def select_model(self, data_type: str) -> BaseModel:
        """Chọn model phù hợp dựa trên loại dữ liệu"""

    async def detect_anomalies(self, dataset_id: str) -> AnomalyResult:
        """Chạy inference, trả về anomaly scores"""

    async def get_anomaly_details(self, result_id: str) -> list[AnomalyDetail]:
        """Chi tiết từng dòng dị thường: score, features góp phần"""
```

#### NLP Service

```python
# services/nlp_service.py
class NLPService:
    async def generate_report(
        self, anomaly_result: AnomalyResult,
        language: str = "vi",  # "vi" hoặc "en"
        style: str = "detailed"  # "summary" hoặc "detailed"
    ) -> Report:
        """Tạo báo cáo bằng LLM với Chain-of-Thought"""

    async def export_pdf(self, report_id: str) -> str:
        """Xuất báo cáo ra PDF, trả về URL download"""
```

### 2.4 Async Pipeline với Celery + Redis

```python
# services/pipeline_service.py
from celery import chain

class PipelineService:
    def run_full_pipeline(self, dataset_id: str, config: PipelineConfig):
        """Orchestrate full pipeline bất đồng bộ"""
        pipeline = chain(
            preprocess_task.s(dataset_id),
            detect_anomalies_task.s(),
            fix_data_task.s(auto_fix=config.auto_fix),
            generate_report_task.s(
                language=config.language,
                style=config.report_style
            ),
            export_pdf_task.s()
        )
        result = pipeline.apply_async()
        return result.id
```

---

## III. FRONTEND (React / Next.js)

### 3.1 Cấu trúc thư mục

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Landing page
│   │   ├── dashboard/
│   │   │   └── page.tsx        # Main dashboard
│   │   ├── upload/
│   │   │   └── page.tsx        # Upload CSV
│   │   ├── analysis/
│   │   │   ├── page.tsx        # Analysis list
│   │   │   └── [id]/page.tsx   # Analysis detail
│   │   └── report/
│   │       ├── page.tsx        # Report list
│   │       └── [id]/page.tsx   # Report viewer
│   ├── components/
│   │   ├── ui/                 # Reusable UI components
│   │   ├── csv/
│   │   │   ├── CSVUploader.tsx
│   │   │   ├── CSVPreview.tsx
│   │   │   └── DataTypeIndicator.tsx
│   │   ├── analysis/
│   │   │   ├── AnomalyChart.tsx
│   │   │   ├── AnomalyTable.tsx
│   │   │   ├── ScoreHeatmap.tsx
│   │   │   └── ModelSelector.tsx
│   │   ├── report/
│   │   │   ├── ReportViewer.tsx
│   │   │   └── PDFExport.tsx
│   │   └── pipeline/
│   │       ├── PipelineProgress.tsx
│   │       └── PipelineConfig.tsx
│   ├── hooks/
│   │   ├── useUpload.ts
│   │   ├── useAnalysis.ts
│   │   └── useWebSocket.ts    # Realtime pipeline status
│   ├── lib/
│   │   ├── api.ts             # API client (axios/fetch)
│   │   └── utils.ts
│   └── styles/
│       └── globals.css
├── package.json
└── next.config.js
```

### 3.2 Các trang chính

| Trang         | Chức năng                              | UI Components                              |
| ------------- | -------------------------------------- | ------------------------------------------ |
| **Dashboard** | Tổng quan: thống kê, lịch sử phân tích | Charts, Stats cards, Recent list           |
| **Upload**    | Kéo thả CSV, preview, chọn model       | Drag-drop zone, Data table, Model selector |
| **Analysis**  | Kết quả anomaly detection              | Heatmap, Bar chart, Highlighted table      |
| **Report**    | Xem báo cáo NLP, tải PDF               | Markdown viewer, PDF preview, Download     |
| **Pipeline**  | Chạy & theo dõi full pipeline          | Step progress bar, Real-time logs          |

### 3.3 Luồng người dùng (User Flow)

```
1. Upload CSV → Preview data → Auto-detect type
                    ↓
2. Chọn detection mode:
   ├── Quick Scan (DL model only → anomaly scores)
   ├── Deep Analysis (DL + LLM → scores + explanations)
   └── Full Pipeline (preprocess → detect → fix → report → PDF)
                    ↓
3. Xem kết quả → Anomaly heatmap + highlighted rows
                    ↓
4. Tạo báo cáo → Chọn ngôn ngữ (Việt/Anh) → Xem/tải PDF
```

---

## IV. TECH STACK TỔNG HỢP

| Layer            | Technology                     | Lý do                          |
| ---------------- | ------------------------------ | ------------------------------ |
| **Backend API**  | FastAPI (Python 3.11+)         | Async, type hints, auto docs   |
| **ML Framework** | PyTorch 2.x                    | Linh hoạt, community lớn       |
| **Task Queue**   | Celery + Redis                 | Xử lý bất đồng bộ pipeline dài |
| **Database**     | PostgreSQL 15+                 | ACID, JSON support             |
| **File Storage** | MinIO                          | S3-compatible, self-hosted     |
| **Frontend**     | Next.js 14 (React 18)          | SSR, App Router, TypeScript    |
| **Charts**       | Recharts / D3.js               | Interactive visualization      |
| **LLM**          | OpenAI API / Local LLM (Llama) | Report generation              |
| **PDF**          | ReportLab / WeasyPrint         | Server-side PDF                |
| **Container**    | Docker + Docker Compose        | Reproducible deployment        |
| **CI/CD**        | GitHub Actions                 | Automated testing              |

---

## V. DATABASE SCHEMA

```sql
-- Bảng lưu thông tin dataset
CREATE TABLE datasets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    data_type VARCHAR(20), -- 'tabular', 'timeseries', 'mixed'
    row_count INTEGER,
    column_count INTEGER,
    columns_info JSONB, -- {name, dtype, null_count, unique_count}
    uploaded_at TIMESTAMP DEFAULT NOW(),
    user_id UUID REFERENCES users(id)
);

-- Bảng lưu kết quả phân tích
CREATE TABLE analysis_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dataset_id UUID REFERENCES datasets(id),
    model_used VARCHAR(50), -- 'bilstm', 'tranad', 'anogan'
    config JSONB, -- Hyperparameters used
    total_anomalies INTEGER,
    anomaly_ratio FLOAT,
    scores JSONB, -- Array of {row_idx, score, features}
    metrics JSONB, -- {precision, recall, f1, auc}
    duration_seconds FLOAT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Bảng lưu báo cáo
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID REFERENCES analysis_results(id),
    language VARCHAR(5) DEFAULT 'vi',
    content TEXT, -- Markdown content
    pdf_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Bảng pipeline runs
CREATE TABLE pipeline_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dataset_id UUID REFERENCES datasets(id),
    status VARCHAR(20) DEFAULT 'pending', -- pending/running/completed/failed
    current_step VARCHAR(50),
    config JSONB,
    result_id UUID REFERENCES analysis_results(id),
    report_id UUID REFERENCES reports(id),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    error_message TEXT
);
```

---

## VI. DEPLOYMENT

### Docker Compose

```yaml
version: "3.8"
services:
  backend:
    build: ./backend
    ports: ["8000:8000"]
    depends_on: [postgres, redis, minio]
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/csvai
      - REDIS_URL=redis://redis:6379
      - MINIO_ENDPOINT=minio:9000

  celery-worker:
    build: ./backend
    command: celery -A app.worker worker -l info
    depends_on: [redis]

  frontend:
    build: ./frontend
    ports: ["3000:3000"]

  postgres:
    image: postgres:15
    volumes: [pgdata:/var/lib/postgresql/data]

  redis:
    image: redis:7-alpine

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    ports: ["9000:9000", "9001:9001"]

volumes:
  pgdata:
```

❗ Đừng generate report sync → dùng queue
❗ Không expose Chain-of-Thought
❗ Phải summarize data trước khi đưa vào LLM
✅ Tách LLM adapter + fallback
✅ Markdown → HTML → PDF (WeasyPrint best choice)
🚀 Có thể thêm AI reviewer agent để nâng cấp system
