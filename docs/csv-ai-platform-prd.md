# CSV AI Platform

## Goals and Background Context

Context — Vì sao cần đề cương này
Học viên (IUH) đang xây dựng một hệ thống production CSV AI Platform (csv_agent_services + csv_agent_platform) phục vụ luận văn thạc sĩ. Đề tài kết hợp hai bài toán AI:

Anomaly Detection trên dữ liệu CSV (tabular + time-series) — giao dịch BĐS
NLP Report Generation tự động bằng LLM có fine-tune (Qwen2/Gemma với LoRA)
Hệ thống đã có code, mô hình đã train (V10: XGBoost F1=0.88, BiLSTM F1=0.76, DAE AUC=0.97), nhưng chưa có đề cương thạc sĩ hoàn chỉnh — hiện chỉ có skeleton .tex trong de_cuong_IUH/chapters/ với toàn placeholder [...]. Plan này cung cấp dàn ý chi tiết từng mục để học viên điền nội dung vào các file LaTeX hoặc trình bày trước hội đồng.

Nguồn dữ liệu tham chiếu:

Backend sản phẩm: csv_agent_services/backend/ (FastAPI + Celery + MySQL + MinIO)
Frontend: csv_agent_services/fronted/ (Next.js 14)
Pipeline ML nghiên cứu: csv_agent_platform/detection/ (notebooks v8–v11, model V10)
Template LaTeX: de_cuong_IUH/
Memory ghi nhận bug V6 dataset: memory/project_final_project_ai.md

### Goals

- Xây dựng nền tảng phát hiện dị thường (anomaly detection) trên dữ liệu CSV giao dịch bất động sản sử dụng Deep Learning
- Tích hợp NLP (LLM) để sinh báo cáo phân tích tự động bằng ngôn ngữ tự nhiên (Việt/Anh)
- Cung cấp pipeline end-to-end: Upload CSV → Tiền xử lý → Phát hiện dị thường → Sinh báo cáo → Xuất PDF
- Hỗ trợ nhiều loại dữ liệu: tabular, time-series, mixed

### Background Context

Dữ liệu giao dịch bất động sản thường chứa các bất thường như giá trị ngoại lai, giao dịch gian lận, hoặc lỗi nhập liệu. Việc phát hiện thủ công tốn nhiều thời gian và dễ bỏ sót. CSV AI Platform sử dụng 3 model Deep Learning (BiLSTM Autoencoder, TranAD, AnoGAN) để tự động phát hiện dị thường, kết hợp LLM (Chain-of-Thought) để giải thích kết quả dưới dạng báo cáo chuyên nghiệp.

Hệ thống phục vụ đồ án tốt nghiệp Thạc sĩ tại IUH, hướng tới ứng dụng thực tế trong lĩnh vực kiểm toán và phân tích dữ liệu bất động sản.

### Change Log

| Date       | Version | Description                               | Author   |
| ---------- | ------- | ----------------------------------------- | -------- |
| 2026-03-18 | 0.1     | Initial draft from system design document | Dev Team |

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

| Layer             | Technology                      | Lý do                                                             |
| ----------------- | ------------------------------- | ----------------------------------------------------------------- |
| **Backend API**   | FastAPI (Python 3.11+)          | Async, type hints, auto docs                                      |
| **ML Framework**  | PyTorch 2.x                     | Linh hoạt, community lớn                                          |
| **Task Queue**    | Celery + Redis                  | Xử lý bất đồng bộ pipeline dài                                    |
| **Database**      | MySQL 8.0+                      | Reliable, widely supported, JSON column support                   |
| **File Storage**  | MinIO                           | S3-compatible, self-hosted                                        |
| **Frontend**      | Next.js 14 (React 18)           | SSR, App Router, TypeScript                                       |
| **Charts**        | Recharts / D3.js                | Interactive visualization                                         |
| **LLM (Primary)** | Qwen2-1.5B + QLoRA (fine-tuned) | Report generation — lightweight, Vietnamese support tốt, GPU ≥8GB |
| **LLM (Backup)**  | Gemma 4 2B + QLoRA (fine-tuned) | Backup model khi Qwen2 underperform, Google backing               |
| **PDF**           | ReportLab / WeasyPrint          | Server-side PDF                                                   |
| **Container**     | Docker + Docker Compose         | Reproducible deployment                                           |
| **CI/CD**         | GitHub Actions                  | Automated testing                                                 |

### Service Architecture

Microservices-lite — 3 services (Data, AI, NLP) behind a single FastAPI gateway, Celery workers cho async tasks

### Testing Requirements

Unit + Integration — pytest cho backend, Jest cho frontend, E2E manual testing

### Additional Technical Assumptions

- Model weights pretrained và lưu trong Model Registry (local filesystem hoặc MinIO)
- LLM Primary: **Qwen2-1.5B fine-tuned với QLoRA** (4-bit NF4); yêu cầu GPU ≥8GB VRAM hoặc Colab T4 free
- LLM Backup: **Gemma 4 2B fine-tuned với QLoRA**; dùng khi Qwen2 underperform
- Fallback: Template-based report (Jinja2, không cần GPU) khi cả 2 LLM fail
- LoRA config: `r=32`, `alpha=64` (tăng rank cho model nhỏ)
- Training data: ≥5,000-10,000 samples (model nhỏ converge nhanh)
- Inference: `transformers` + `peft` + `bitsandbytes` (int4) hoặc GGUF + `llama.cpp` cho CPU deployment
- WebSocket cho realtime pipeline status updates
- Alembic cho database migrations (MySQL dialect)

---

## Implementation Phases

### Phase 1: Core AI Platform (MVP)

Tập trung xây dựng giá trị cốt lõi: từ lúc upload file thông qua AI models đến khi xuất ra báo cáo NLP hoàn chỉnh.

- **Epic 1: Infrastructure & Core Setup** — Thiết lập nền tảng dự án, Docker, Database, CI/CD pipeline
- **Epic 2: Data Ingestion & Processing** — Upload CSV, tự động nhận diện loại dữ liệu, tiền xử lý và lưu trữ
- **Epic 3: AI Anomaly Detection Engine** — Rule Validation + Rule Scoring + ML Models (XGBoost, DAE, Ensemble) 3-layer detection, Decision Layer
- **Epic 4: NLP Report Generation** — Pipeline 4 bước (Aggregation → Enrichment → Prompt Builder → LLM). Fine-tune Qwen2-1.5B + QLoRA (primary) + Gemma 4 2B (backup), template-based fallback. LLM chỉ viết văn — không tự tính toán. Hỗ trợ Việt/Anh, xuất PDF
- **Epic 5: Full Pipeline Orchestration** — Kết nối toàn bộ luồng xử lý bất đồng bộ với Celery + Redis
- **Epic 6: Frontend Dashboard & UI** — Xây dựng giao diện Next.js: Dashboard, Upload, Analysis, Report, Pipeline

### Phase 2: AI Auto-Fix, Security & Production Readiness

Tập trung vào auto-fix pipeline, bảo vệ hệ thống và tối ưu quản lý đa người dùng.

- **Epic 7: Gemini Agent Auto-Fix Engine** — AI Agent (Gemini 1.5 Flash) suggest fix → Auto-fix/Human Review → Re-validate → Data Fix Log
- **Epic 8: Security & Authentication** — Xác thực người dùng bằng JWT, đăng ký/đăng nhập, bảo mật APIs

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

**Objective:** Xây dựng hệ thống phát hiện dị thường 3 lớp: Rule Validation (deterministic, dựa trên `business_rules.yaml`) → Rule Scoring (semi-soft, dựa trên `default.yaml` domain_rules) → ML Anomaly Detection (XGBoost, DAE, Ensemble). Decision Layer kết hợp tất cả tín hiệu: reject / flag_for_review / accept.

#### Story 3.1: Rule Validation Engine (Layer 1)

Validate each CSV row against deterministic business rules từ `business_rules.yaml` (13 rule sections).

#### Story 3.2: Rule Scoring Engine (Layer 2)

Risk scoring dựa trên soft rules từ `default.yaml` `labels.domain_rules` (7 domain rules + 5 anomaly sources).

#### Story 3.3: ML Anomaly Detection Models (Layer 3)

XGBoost CLEAN (F1=0.88), DAE + Mahalanobis, A9 Ensemble stacking.

#### Story 3.4: Decision Layer & Deduplication

Unified decision: hard_fail → reject, soft_high OR anomaly_high → flag, else → accept.

#### Story 3.5: Detection API & Model Registry

`POST /api/v1/analysis/detect`, Model Registry, Celery async, pipeline status.

---

### Epic 4: NLP Report Generation

**Objective:** Xây dựng pipeline sinh báo cáo production-level với 4 bước: **Aggregation → Enrichment → Prompt Builder → LLM**. Fine-tune **Qwen2-1.5B với QLoRA** (primary) và **Gemma 4 2B** (backup). Toàn bộ R&D/training tại `{ai_services_generation}/` với versioned notebooks. Chỉ khi model đạt target mới promote sang `{backend}/`. Template-based fallback khi LLM fail.

**R&D → Production Promotion Flow:**

```
{ai_services_generation}/                    ← R&D & Training
├── notebooks/train_generation_v1..vN.ipynb  ← Versioned experiments
├── src/ (aggregation, enrichment, training, inference)
├── models/ (adapter weights)
└── data/training/ (JSONL)
         │
         │ Model đạt target (ROUGE-L ≥0.45)
         ▼
{backend}/app/ml/generation/                 ← Production Serving
├── model_router.py
├── adapter_weights/
└── templates/
```

**Nguyên tắc cốt lõi:** `Aggregator + Enrichment quality = 80% output quality`. LLM chỉ rewrite, **không tự làm toán**.

**Hardware:** Fine-tune GPU ≥8GB (Colab T4 free) | Inference GPU ≥4GB hoặc CPU (GGUF)

#### Story 4.1: Aggregation Service

`{ai_services_generation}/src/aggregation/aggregation_service.py` — nhóm anomalies thành clusters, tính sẵn cross-analysis equations.

#### Story 4.2: Enrichment Service

`{ai_services_generation}/src/enrichment/enrichment_service.py` — enrich clusters với ratio, priority, impact_score, semantic_text.

#### Story 4.3: Qwen2-1.5B QLoRA Fine-Tuning (Primary)

Versioned notebooks `{ai_services_generation}/notebooks/train_generation_v1.ipynb` (baseline) → `v2.ipynb` (QLoRA fine-tune). Training script `src/training/train_qwen_lora.py`. LoRA `r=32, alpha=64`. Data ≥5K-10K JSONL samples. Adapter → `models/qwen2-1.5b-lora-adapter/`.

#### Story 4.4: Gemma 4 2B QLoRA Fine-Tuning (Backup)

Notebook `{ai_services_generation}/notebooks/train_generation_v3.ipynb`. Reuse data_loader + evaluate. Adapter → `models/gemma4-2b-lora-adapter/`.

#### Story 4.5: Model Evaluation & Promotion

Notebook `v4.ipynb` — head-to-head comparison. Target: ROUGE-L ≥0.45, BLEU ≥0.30. Khi đạt target → promote best adapter weights + inference code → `{backend}/app/ml/generation/`.

#### Story 4.6: Prompt Template & Report Generation Service

Model Router (Primary → Backup → Template fallback). `POST /api/v1/report/generate` tại `{backend}/` sau promotion.

#### Story 4.7: PDF Export

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

---

### Epic 7: Gemini Agent Auto-Fix Engine (Phase 2)

**Objective:** AI Agent (Gemini 1.5 Flash) nhận error list từ Epic 3 → suggest fix với confidence scoring → Auto-fix (confidence ≥ 0.9) hoặc Human Review → Re-validate bằng Rule Engine → Data Fix Log cho audit. Tối ưu cost bằng batch request, token reduction, Redis cache.

#### Story 7.1: Gemini Agent Service

Gemini 1.5 Flash suggestion engine — batch request, token reduction, Redis cache layer.

#### Story 7.2: Auto-Fix Engine & Human Review Queue

Auto-apply high-confidence fixes, route low-confidence to human review queue.

#### Story 7.3: Re-validation Loop & Data Fix Log

Re-validate fixed rows via Rule Engine, `data_fix_log` table for audit trail.

#### Story 7.4: Agent Fix API & Pipeline Integration

API endpoints, Celery task integration with Epic 5 pipeline.

---

### Epic 8: Security & Authentication (Phase 2)

**Objective:** Tích hợp hệ thống xác thực người dùng bằng JWT, phân quyền truy cập cơ bản, đảm bảo dữ liệu và báo cáo phân tích được bảo mật riêng tư cho từng người dùng.

#### Story 8.1: JWT Authentication Setup

As a user,
I want to register and login with JWT authentication,
so that my data and analysis results are secured and isolated from other users.

**Acceptance Criteria:**

1. Tạo bảng `users` trong database với mật khẩu được mã hóa (bcrypt)
2. Endpoints `POST /auth/register` và `POST /auth/login` hoạt động sinh JWT
3. JWT token được tạo và verify tại module `core/security.py`
4. Cập nhật các bảng `datasets`, `analysis_results`, `reports`, `data_fix_log` thêm `user_id` foreign key
5. Protected endpoints (Epic 2-7) yêu cầu Bearer token hợp lệ và chỉ trả về dữ liệu của user hiện tại
