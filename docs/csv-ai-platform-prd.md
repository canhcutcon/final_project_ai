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

| Layer            | Technology                     | Lý do                                            |
| ---------------- | ------------------------------ | ------------------------------------------------ |
| **Backend API**  | FastAPI (Python 3.11+)         | Async, type hints, auto docs                     |
| **ML Framework** | PyTorch 2.x                    | Linh hoạt, community lớn                         |
| **Task Queue**   | Celery + Redis                 | Xử lý bất đồng bộ pipeline dài                   |
| **Database**     | MySQL 8.0+                     | Reliable, widely supported, JSON column support  |
| **File Storage** | MinIO                          | S3-compatible, self-hosted                       |
| **Frontend**     | Next.js 14 (React 18)          | SSR, App Router, TypeScript                      |
| **Charts**       | Recharts / D3.js               | Interactive visualization                        |
| **LLM**          | Qwen2.5-7B + LoRA (fine-tuned) | Report generation — domain-tuned on anomaly data |
| **PDF**          | ReportLab / WeasyPrint         | Server-side PDF                                  |
| **Container**    | Docker + Docker Compose        | Reproducible deployment                          |
| **CI/CD**        | GitHub Actions                 | Automated testing                                |

### Service Architecture

Microservices-lite — 3 services (Data, AI, NLP) behind a single FastAPI gateway, Celery workers cho async tasks

### Testing Requirements

Unit + Integration — pytest cho backend, Jest cho frontend, E2E manual testing

### Additional Technical Assumptions

- Model weights pretrained và lưu trong Model Registry (local filesystem hoặc MinIO)
- LLM sử dụng **Qwen2.5-7B fine-tuned với LoRA** (3B/7B tùy tài nguyên); 7B yêu cầu GPU ≥16GB VRAM hoặc Colab T4 với quantization (4-bit)
- LoRA adapter fine-tuned trên domain data (anomaly JSON → báo cáo tiếng Việt/Anh)
- Inference: `transformers` + `peft` + `bitsandbytes` (int4 quantization cho production)
- WebSocket cho realtime pipeline status updates
- Alembic cho database migrations (MySQL dialect)

---

## Implementation Phases

### Phase 1: Core AI Platform (MVP)
Tập trung xây dựng giá trị cốt lõi: từ lúc upload file thông qua AI models đến khi xuất ra báo cáo NLP hoàn chỉnh.
- **Epic 1: Infrastructure & Core Setup** — Thiết lập nền tảng dự án, Docker, Database, CI/CD pipeline
- **Epic 2: Data Ingestion & Processing** — Upload CSV, tự động nhận diện loại dữ liệu, tiền xử lý và lưu trữ
- **Epic 3: AI Anomaly Detection Engine** — Rule Validation + Rule Scoring + ML Models (XGBoost, DAE, Ensemble) 3-layer detection, Decision Layer
- **Epic 4: NLP Report Generation** — Pipeline 4 bước (Aggregation → Enrichment → Prompt Builder → LLM). Fine-tune Qwen2.5-7B + LoRA trên structured data, LLM chỉ viết văn — không tự tính toán. Hỗ trợ Việt/Anh, xuất PDF
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

**Objective:** Xây dựng pipeline sinh báo cáo production-level với 4 bước: **Aggregation → Enrichment → Prompt Builder → LLM**. Fine-tune **Qwen2.5-7B với LoRA** trên domain data (structured JSON → báo cáo Markdown), tích hợp vào pipeline. LLM chỉ đóng vai trò "viết văn" — mọi tính toán số học được thực hiện trước bởi Aggregator + Enrichment Layer.

**Pipeline luồng sinh báo cáo (Production Level):**

```
Raw anomalies (Từ AI Models BiLSTM/TranAD/DAE)
       ↓
Aggregator (Gom nhóm, đếm count, tìm missing)
       ↓
Enrichment Layer (Tính ratio, score, rank priority, cross-analysis)
       ↓
Prompt Builder (Jinja2 Template + Instructions)
       ↓
Qwen2.5-7B + LoRA (Viết Markdown Report)
       ↓
PDF export (ReportLab / WeasyPrint)
```

**Nguyên tắc cốt lõi:** `Aggregator + Enrichment quality = 80% output quality`. LLM chỉ rewrite dữ liệu đã chuẩn bị, **tuyệt đối không để LLM tự làm toán** (ngăn hallucination).

**Hardware requirements:**

- Fine-tune: GPU ≥16GB VRAM (RTX 3090/4090, A100) hoặc Google Colab T4 với 4-bit quantization
- Inference production: GPU ≥8GB (int4) hoặc CPU với llama.cpp backend
- Model size: Qwen2.5-7B (~14GB FP16) → ~4GB với int4 quantization

#### Story 4.1: Aggregation Service

As a developer,
I want raw anomaly results grouped into semantic clusters with counts and summaries,
so that the LLM receives structured, pre-computed data instead of raw JSON.

**Acceptance Criteria:**

1. `AggregationService.aggregate()` nhóm anomalies thành clusters theo `issue_type` (MISSING_TRANSACTION, HIGH_COMMISSION, DUPLICATE_ENTRY, ...)
2. Mỗi cluster chứa: `issue_type`, `count`, `samples[]` (top 3-5 mẫu đại diện), `affected_ids[]`
3. Context summary được tính toán sẵn: `total_records`, `expected`, `missing`, `anomaly_ratio`
4. Cross-analysis equations được sinh trước (VD: `-48 issued + 366 paid = 318 net difference`) — LLM chỉ cần rewrite, không tự tính
5. Output là structured JSON chuẩn, sẵn sàng cho Enrichment Layer

#### Story 4.2: Enrichment Service

As a developer,
I want aggregated anomaly clusters enriched with numerical reasoning signals, priority ranking, and semantic text,
so that the LLM can generate accurate reports without performing any calculations.

**Acceptance Criteria:**

1. `EnrichmentService.enrich()` thêm cho mỗi cluster: `ratio` (VD: "1.34% of total"), `priority` (1-3), `impact_score` (0-1), `impact` level (High/Medium/Low)
2. Priority ranking dựa trên `impact_score`: score ≥0.8 → priority 1, ≥0.5 → priority 2, còn lại → priority 3
3. Sinh `semantic_text` cho detailed reports: "Price is 45% higher than district average", "Commission is 80% higher than expected"
4. Individual anomaly detail chứa: `risk_level`, `anomaly_score`, `key_findings[]`, `location_context`, `temporal_context`
5. Output JSON đạt chuẩn "Semantic & Enriched" — LLM có thể viết report chỉ bằng cách rewrite

#### Story 4.3: Qwen2.5-7B LoRA Fine-Tuning

As an ML engineer,
I want to fine-tune Qwen2.5-7B with LoRA on structured anomaly data → report pairs,
so that the model generates accurate, professionally-toned reports in Vietnamese and English.

**Acceptance Criteria:**

1. Training script `generation/train_lora.py` với `transformers` + `peft` + `bitsandbytes`
2. Dataset format: JSONL với `Instruction + Input (Enriched JSON) + Output (Markdown Report)` — **KHÔNG train từ raw JSON**
3. Instruction template bao gồm: tone (professional audit), structure (Executive Summary → Key Issues → Cross Analysis → Recommendations), format rules (bullet points, bold, numeric references)
4. LoRA config: `r=16`, `alpha=32`, target modules `q_proj`, `v_proj`
5. Fine-tuning chạy được trên Colab T4 (4-bit QLoRA) và local GPU ≥16GB (bfloat16)
6. Training data: ≥50,000 samples dạng `Instruction + Enriched Input + Expected Markdown`
7. Adapter weights lưu vào `models/qwen-lora-adapter/`
8. BLEU / ROUGE-L evaluation trên held-out test set

#### Story 4.4: Prompt Template & Report Generation Service

As a user,
I want the system to generate a natural language report explaining the anomalies found,
so that I can understand the results without deep technical knowledge.

**Acceptance Criteria:**

1. Prompt template `generation/templates/report_prompt.j2` nhận Enriched JSON từ Story 4.2, render thành prompt chuẩn với `### Instruction` + `### Input` + `### Output`
2. `NLPService.generate_report()` gọi pipeline: Aggregate → Enrich → Render Template → LLM Inference
3. Hỗ trợ `language`: `vi` (Việt) và `en` (English) — via prompt language instruction
4. Hỗ trợ `style`: `summary` (tóm tắt ≤500 từ, cluster-level) và `detailed` (per-anomaly explanation với semantic text)
5. Force Tone: professional audit tone (consulting-style recommendations: "Investigate missing transactions" thay vì "Bạn nên...")
6. Inference timeout ≤60s cho dataset ≤1000 anomalies

#### Story 4.5: PDF Export

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
