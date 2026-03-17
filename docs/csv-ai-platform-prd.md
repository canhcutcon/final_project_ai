# CSV AI Platform

## Goals and Background Context

### Goals
- Xây dựng nền tảng phát hiện dị thường (anomaly detection) trên dữ liệu CSV giao dịch bất động sản sử dụng Deep Learning
- Tích hợp NLP (LLM) để sinh báo cáo phân tích tự động bằng ngôn ngữ tự nhiên (Việt/Anh)
- Cung cấp pipeline end-to-end: Upload CSV → Tiền xử lý → Phát hiện dị thường → Sinh báo cáo → Xuất PDF
- Hỗ trợ nhiều loại dữ liệu: tabular, time-series, mixed

### Background Context
Dữ liệu giao dịch bất động sản thường chứa các bất thường như giá trị ngoại lai, giao dịch gian lận, hoặc lỗi nhập liệu. Việc phát hiện thủ công tốn nhiều thời gian và dễ bỏ sót. CSV AI Platform sử dụng 3 model Deep Learning (BiLSTM Autoencoder, TranAD, AnoGAN) để tự động phát hiện dị thường, kết hợp LLM (Chain-of-Thought) để giải thích kết quả dưới dạng báo cáo chuyên nghiệp.

Hệ thống phục vụ đồ án tốt nghiệp Thạc sĩ tại IUH, hướng tới ứng dụng thực tế trong lĩnh vực kiểm toán và phân tích dữ liệu bất động sản.

### Change Log
| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-03-18 | 0.1 | Initial draft from system design document | Dev Team |

---

## Requirements

### Functional Requirements
- FR1: Upload file CSV (max 100MB), hệ thống parse và lưu trữ vào MinIO
- FR2: Tự động nhận diện loại dữ liệu (tabular / timeseries / mixed)
- FR3: Tiền xử lý dữ liệu: handle missing values, encode categoricals, scale numerics
- FR4: Preview dữ liệu đã upload (10 dòng đầu + column statistics)
- FR5: Chạy anomaly detection với model phù hợp (BiLSTM, TranAD, AnoGAN)
- FR6: Trả về anomaly scores, chi tiết per-row với contributing features
- FR7: Sinh báo cáo NLP bằng LLM, hỗ trợ tiếng Việt và tiếng Anh
- FR8: Xuất báo cáo ra PDF và cho phép download
- FR9: Chạy full pipeline bất đồng bộ (preprocess → detect → fix → report → PDF)
- FR10: Theo dõi trạng thái pipeline realtime
- FR11: Xác thực người dùng bằng JWT (register/login)

### Non-Functional Requirements
- NFR1: API response time < 500ms cho các endpoint đồng bộ
- NFR2: Hỗ trợ file CSV lên đến 100MB (≈ 1 triệu dòng)
- NFR3: Pipeline xử lý hoàn tất trong < 5 phút cho dataset 100K dòng
- NFR4: Anomaly detection accuracy: Precision ≥ 85%, Recall ≥ 80%, F1 ≥ 82%
- NFR5: Hệ thống deployable bằng Docker Compose trên 1 máy chủ
- NFR6: API documentation tự động qua FastAPI Swagger UI

---

## User Interface Design Goals

### Overall UX Vision
Giao diện hiện đại, trực quan, tối ưu cho workflow phân tích dữ liệu. Người dùng có thể hoàn thành toàn bộ luồng từ upload → phân tích → xem báo cáo trong vài clicks.

### Key Interaction Paradigms
- Drag-and-drop để upload CSV
- Step-by-step wizard cho pipeline configuration
- Realtime progress bar cho pipeline dài
- Interactive charts (heatmap, bar chart) cho kết quả phân tích

### Core Screens and Views
- **Dashboard**: Tổng quan thống kê, lịch sử phân tích gần đây
- **Upload**: Kéo thả CSV, preview data, auto-detect type
- **Analysis**: Kết quả anomaly detection với heatmap và highlighted table
- **Report**: Xem báo cáo NLP (Markdown), tải PDF
- **Pipeline**: Chạy và theo dõi full pipeline với realtime logs

### Accessibility
WCAG AA

### Branding
Dark mode mặc định, accent color cho anomaly highlights (red/orange), success indicators (green).

### Target Device and Platforms
Web Responsive (Desktop-first, mobile-friendly)

---

## Technical Assumptions

### Repository Structure
Monorepo — `backend/` (FastAPI) và `frontend/` (Next.js) trong cùng repository

### Tech Stack

| Layer | Technology | Lý do |
|---|---|---|
| **Backend API** | FastAPI (Python 3.11+) | Async, type hints, auto docs |
| **ML Framework** | PyTorch 2.x | Linh hoạt, community lớn |
| **Task Queue** | Celery + Redis | Xử lý bất đồng bộ pipeline dài |
| **Database** | MySQL 8.0+ | Reliable, widely supported, JSON column support |
| **File Storage** | MinIO | S3-compatible, self-hosted |
| **Frontend** | Next.js 14 (React 18) | SSR, App Router, TypeScript |
| **Charts** | Recharts / D3.js | Interactive visualization |
| **LLM** | OpenAI API / Local LLM (Llama) | Report generation |
| **PDF** | ReportLab / WeasyPrint | Server-side PDF |
| **Container** | Docker + Docker Compose | Reproducible deployment |
| **CI/CD** | GitHub Actions | Automated testing |

### Service Architecture
Microservices-lite — 3 services (Data, AI, NLP) behind a single FastAPI gateway, Celery workers cho async tasks

### Testing Requirements
Unit + Integration — pytest cho backend, Jest cho frontend, E2E manual testing

### Additional Technical Assumptions
- Model weights pretrained và lưu trong Model Registry (local filesystem hoặc MinIO)
- LLM sử dụng OpenAI API (production) hoặc Local Llama (development/offline)
- WebSocket cho realtime pipeline status updates
- Alembic cho database migrations (MySQL dialect)

---

## Epic List

- **Epic 1: Infrastructure & Project Setup** — Thiết lập nền tảng dự án, Docker, Database, CI/CD pipeline
- **Epic 2: Data Ingestion & Processing** — Upload CSV, tự động nhận diện loại dữ liệu, tiền xử lý và lưu trữ
- **Epic 3: AI Anomaly Detection Engine** — Tích hợp các model BiLSTM, TranAD, AnoGAN để phát hiện dị thường
- **Epic 4: NLP Report Generation** — Sinh báo cáo tự nhiên bằng LLM (Chain-of-Thought), hỗ trợ Việt/Anh, xuất PDF
- **Epic 5: Full Pipeline Orchestration** — Kết nối toàn bộ luồng xử lý bất đồng bộ với Celery + Redis
- **Epic 6: Frontend Dashboard & UI** — Xây dựng giao diện Next.js: Dashboard, Upload, Analysis, Report, Pipeline

---

## Epic Details

### Epic 1: Infrastructure & Project Setup

**Objective:** Thiết lập toàn bộ hạ tầng dự án bao gồm cấu trúc thư mục backend/frontend, Docker Compose cho tất cả services (MySQL, Redis, MinIO), database schema, và CI/CD. Đây là nền tảng để tất cả epic khác có thể triển khai.

#### Story 1.1: Backend Project Scaffold
As a developer,
I want to scaffold the FastAPI backend project with proper folder structure,
so that the team has a standardized codebase to build upon.

**Acceptance Criteria:**
1. Cấu trúc `backend/app/` với `api/`, `core/`, `models/`, `schemas/`, `services/`, `ml/` theo thiết kế
2. `main.py` chạy được với endpoint `/health` trả về `200 OK`
3. `config.py` đọc env vars cho DB, Redis, MinIO, JWT secret

#### Story 1.2: Docker Compose & Infrastructure Services
As a developer,
I want all infrastructure services (MySQL, Redis, MinIO) running via Docker Compose,
so that the development environment is reproducible.

**Acceptance Criteria:**
1. `docker-compose up` khởi động backend, celery-worker, mysql, redis, minio, frontend
2. Volumes persistent cho MySQL data
3. MinIO console truy cập được tại port `9001`

#### Story 1.3: Database Schema & Migrations
As a developer,
I want the database schema created via Alembic migrations,
so that schema changes are version-controlled.

**Acceptance Criteria:**
1. 4 bảng chính: `datasets`, `analysis_results`, `reports`, `pipeline_runs` được tạo
2. `alembic upgrade head` chạy thành công với MySQL dialect
3. Foreign keys và indexes đúng thiết kế

#### Story 1.4: JWT Authentication Setup
As a user,
I want to register and login with JWT authentication,
so that my data and analysis results are secured.

**Acceptance Criteria:**
1. Endpoints `POST /auth/register` và `POST /auth/login` hoạt động
2. JWT token được tạo và verify tại `core/security.py`
3. Protected endpoints yêu cầu Bearer token hợp lệ

---

### Epic 2: Data Ingestion & Processing

**Objective:** Cho phép người dùng upload file CSV, hệ thống tự động nhận diện loại dữ liệu (tabular/timeseries/mixed), tiền xử lý dữ liệu (clean, encode, scale), và lưu trữ vào MinIO. Cung cấp preview dữ liệu đã xử lý.

#### Story 2.1: CSV Upload & Storage
As a user,
I want to upload a CSV file through the API,
so that my data is stored securely for analysis.

**Acceptance Criteria:**
1. `POST /api/v1/upload` nhận file CSV, lưu vào MinIO
2. Metadata (filename, size, row_count, column_count, columns_info) lưu vào bảng `datasets`
3. Trả về `dataset_id` để sử dụng trong các bước tiếp theo
4. Reject file > 100MB hoặc không phải CSV

#### Story 2.2: Auto Data Type Detection
As a user,
I want the system to automatically detect if my data is tabular, time-series or mixed,
so that the appropriate AI model is selected.

**Acceptance Criteria:**
1. `DataService.detect_data_type()` phân loại chính xác 3 loại: `tabular`, `timeseries`, `mixed`
2. Kết quả lưu vào trường `data_type` của bảng `datasets`
3. Detection dựa trên phân tích columns (datetime, sequential patterns)

#### Story 2.3: Data Preprocessing Pipeline
As a user,
I want my data to be automatically cleaned and preprocessed,
so that it's ready for anomaly detection.

**Acceptance Criteria:**
1. `DataService.preprocess()` thực hiện: handle missing values, encode categoricals, scale numerics
2. `PreprocessResult` chứa thông tin: columns processed, rows removed, transformations applied
3. Dữ liệu đã xử lý lưu lại MinIO dưới dạng processed CSV

#### Story 2.4: Data Preview
As a user,
I want to preview the first 10 rows of my uploaded data,
so that I can verify the data was uploaded correctly.

**Acceptance Criteria:**
1. `GET /api/v1/upload/{id}/preview` trả về 10 dòng đầu kèm column info
2. Response bao gồm data type đã detect và column statistics
3. Trả `404` nếu dataset_id không tồn tại

---

### Epic 3: AI Anomaly Detection Engine

**Objective:** Triển khai 3 model deep learning (BiLSTM Autoencoder, TranAD, AnoGAN) để phát hiện dị thường. Hệ thống tự chọn model phù hợp theo loại dữ liệu, trả về anomaly scores, chi tiết từng dòng dị thường và các features góp phần.

#### Story 3.1: BiLSTM Autoencoder Integration
As a data analyst,
I want to run BiLSTM Autoencoder on time-series data,
so that temporal anomalies are detected accurately.

**Acceptance Criteria:**
1. `bilstm_autoencoder.py` load và inference với pretrained weights
2. Trả về anomaly scores cho từng row
3. Threshold tự động dựa trên reconstruction error distribution

#### Story 3.2: TranAD Model Integration
As a data analyst,
I want to run TranAD model for transformer-based anomaly detection,
so that complex temporal patterns are captured.

**Acceptance Criteria:**
1. `tranad.py` load và inference thành công
2. Support multivariate time-series input
3. Trả về scores và feature importance per anomaly

#### Story 3.3: AnoGAN Model Integration
As a data analyst,
I want to run AnoGAN for GAN-based anomaly detection on tabular data,
so that non-temporal anomalies are found.

**Acceptance Criteria:**
1. `anogan.py` load và inference thành công
2. Hỗ trợ tabular và mixed data types
3. GAN data balancing nếu dữ liệu imbalanced

#### Story 3.4: Model Selection & Inference API
As a user,
I want the system to automatically select the best model based on data type,
so that I get optimal detection results without manual configuration.

**Acceptance Criteria:**
1. `AIService.select_model()` mapping: timeseries → BiLSTM/TranAD, tabular → AnoGAN
2. `POST /api/v1/analysis/detect` chạy inference, lưu kết quả vào `analysis_results`
3. `GET /api/v1/analysis/{id}/results` trả về: total_anomalies, anomaly_ratio, scores, metrics
4. Chi tiết per-row: `{row_idx, score, contributing_features}`

---

### Epic 4: NLP Report Generation

**Objective:** Sử dụng LLM (OpenAI API hoặc Local Llama) với kỹ thuật Chain-of-Thought để sinh báo cáo phân tích dị thường bằng ngôn ngữ tự nhiên. Hỗ trợ tiếng Việt và tiếng Anh, hai style (summary/detailed), và xuất PDF.

#### Story 4.1: LLM Report Generation
As a user,
I want the system to generate a natural language report explaining the anomalies found,
so that I can understand the results without deep technical knowledge.

**Acceptance Criteria:**
1. `NLPService.generate_report()` tạo nội dung Markdown từ `AnomalyResult`
2. Hỗ trợ `language`: `vi` (Việt) và `en` (English)
3. Hỗ trợ `style`: `summary` (tóm tắt) và `detailed` (chi tiết)
4. Sử dụng Chain-of-Thought prompting cho giải thích logic

#### Story 4.2: PDF Export
As a user,
I want to download the analysis report as a PDF,
so that I can share it with stakeholders.

**Acceptance Criteria:**
1. `NLPService.export_pdf()` chuyển Markdown report sang PDF (ReportLab/WeasyPrint)
2. PDF lưu vào MinIO, trả về download URL
3. `GET /api/v1/report/{id}/download` stream PDF về client
4. PDF bao gồm header, footer, charts/tables nếu có

---

### Epic 5: Full Pipeline Orchestration

**Objective:** Kết nối toàn bộ luồng xử lý bất đồng bộ: preprocess → detect → fix → report → PDF, sử dụng Celery chain tasks với Redis broker. Người dùng theo dõi trạng thái realtime qua API.

#### Story 5.1: Celery Task Chain Setup
As a developer,
I want the full pipeline orchestrated as a Celery chain,
so that long-running analysis runs asynchronously without blocking the API.

**Acceptance Criteria:**
1. 5 Celery tasks: `preprocess_task`, `detect_anomalies_task`, `fix_data_task`, `generate_report_task`, `export_pdf_task`
2. `PipelineService.run_full_pipeline()` chạy `chain()` và trả về `task_id`
3. Redis broker hoạt động đúng

#### Story 5.2: Pipeline Status Tracking
As a user,
I want to check the status of my running pipeline,
so that I know which step is executing and when it will complete.

**Acceptance Criteria:**
1. `POST /api/v1/pipeline/run` bắt đầu pipeline, trả về `pipeline_id`
2. `GET /api/v1/pipeline/{id}/status` trả về: `status`, `current_step`, `started_at`, `completed_at`
3. Status transitions: `pending` → `running` → `completed` / `failed`
4. Nếu `failed`, trả về `error_message`

---

### Epic 6: Frontend Dashboard & UI

**Objective:** Xây dựng ứng dụng Next.js 14 với App Router, bao gồm 5 trang chính (Dashboard, Upload, Analysis, Report, Pipeline) với giao diện hiện đại, tương tác realtime qua WebSocket cho pipeline status.

#### Story 6.1: Dashboard Page
As a user,
I want a dashboard showing overview statistics and recent analyses,
so that I have a quick glance at my data activity.

**Acceptance Criteria:**
1. Hiển thị: tổng datasets, tổng analyses, anomaly detection rate
2. Danh sách 5 analyses gần nhất với status
3. Charts tổng quan (Recharts/D3.js)

#### Story 6.2: CSV Upload Page
As a user,
I want to drag-and-drop CSV files and preview data before analysis,
so that I can verify the correct file is uploaded.

**Acceptance Criteria:**
1. `CSVUploader` component: drag-drop zone, file validation
2. `CSVPreview` component: hiển thị data table 10 dòng
3. `DataTypeIndicator`: hiển thị loại dữ liệu detected
4. `ModelSelector`: cho phép chọn manual hoặc auto model

#### Story 6.3: Analysis Results Page
As a user,
I want to see anomaly detection results with visual heatmaps and highlighted rows,
so that I can quickly identify problematic data.

**Acceptance Criteria:**
1. `ScoreHeatmap`: biểu đồ nhiệt anomaly scores
2. `AnomalyTable`: bảng dữ liệu với highlighted anomaly rows
3. `AnomalyChart`: bar chart phân bố anomaly scores
4. Filter/sort theo score, row index

#### Story 6.4: Report Viewer & PDF Download
As a user,
I want to view the generated NLP report and download it as PDF,
so that I can read and share analysis insights.

**Acceptance Criteria:**
1. `ReportViewer`: render Markdown content
2. `PDFExport`: button tải PDF, hiển thị preview
3. Chọn ngôn ngữ (Việt/Anh) và style (summary/detailed)

#### Story 6.5: Pipeline Monitor with WebSocket
As a user,
I want to see real-time pipeline progress with step-by-step updates,
so that I can monitor long-running analyses.

**Acceptance Criteria:**
1. `PipelineProgress`: step progress bar với 5 bước
2. `PipelineConfig`: form chọn config (auto_fix, language, report_style)
3. `useWebSocket` hook: nhận realtime status updates
4. Hiển thị logs và error messages
