# Interactive Data Preprocessing (Ingestro-style Importer & Pipelines)

## Goals and Background Context

### Goals

- Transform the current black-box preprocessing step of the CSV Agent Service into an **interactive, human-in-the-loop data import flow** modeled on Ingestro AI: Upload → Sheet/Header Selection → Match Columns → Validate & Clean → Review Entries → Confirm
- Introduce **Target Data Models (TDM)** as first-class entities that define the canonical output schema (column keys, types, validations, category options) that every import maps into
- Add an **AI-assisted column mapping** layer (exact → historical → LLM/fuzzy) so recurring file formats map automatically after the first confirmed import ("Remember Mapping")
- Provide an **interactive cleaning experience**: per-cell validation errors, AI-suggested fixes (single + bulk), and natural-language bulk transforms ("AI Prompts") with mandatory preview-before-apply
- Split preprocessing into two tiers: **business cleaning** (user-facing, produces readable canonical Parquet) and **model prep** (automatic label-encoding/scaling inside the Celery pipeline) — the user confirms clean data *before* any ML transformation
- Preserve anomaly signals: business cleaning fixes format/schema/typo errors only; outliers are never removed or "corrected" (they are detection candidates for the downstream anomaly pipeline)
- Lay the groundwork for **automated pipelines** (connectors + saved mappings + webhooks) so confirmed interactive imports can later run unattended

### Background Context

The CSV Agent Service (`{backend}` + `{frontend}`) currently runs preprocessing as Task 1 of a 5-task Celery chain (`preprocess → detect → fix → report → export`). `DataService.preprocess()` applies DtypeCorrector → MissingValueHandler → LabelEncoder → StandardScaler with zero user visibility: the user cannot see what was changed, cannot correct a wrong dtype guess or a bad imputation, and the stored `_processed.parquet` contains encoded/scaled values that are unreadable to humans. Review only happens *after* detection (Epic 7 review queue), on anomaly fixes — not on the input data itself.

Benchmarking against Ingestro AI (importer workflow, Target Data Models, Data Pipelines, and feature catalogue) shows the industry pattern: data onboarding is an interactive, schema-driven flow where AI proposes and the user confirms at each step, and automation is earned gradually by remembering confirmed decisions (Skip Header Step, Skip Mapping Step, Remember Mapping). The service already has partial building blocks — Upload Wizard validation (`upload_validation_review_spec.md`), rule sets and column configs (`{backend}/app/services/validation_service.py`), templates (`{backend}/app/models/template.py`), a Gemini fix service, and a human review queue — but they are disconnected from the preprocessing step and lack the mapping layer entirely.

This PRD supersedes the preprocessing-related parts of the Upload Wizard spec and extends it into a full import product. It intentionally excludes multi-tenant enterprise features seen in Ingestro (sub-organizations, role management, whitelabeling, SSO).

### Change Log

| Date       | Version | Description                                                        | Author |
| ---------- | ------- | ------------------------------------------------------------------ | ------ |
| 2026-07-02 | 0.1     | Initial draft from Ingestro gap analysis (conversation synthesis)  | AI     |

---

## Requirements

### Functional Requirements

**Target Data Model (TDM)**

- **FR1:** A `TargetDataModel` entity storing an ordered list of column definitions in Ingestro-compatible JSON shape: `key` (snake_case identifier), `label`, `columnType` (`string | int | float | date | email | phone | category | percentage | currency_code`), optional `description`, optional `outputFormat` (dates), optional `dropdownOptions` (+ `isMultiSelect`) for `category` columns, and `validations` array supporting `required`, `unique`, `regex` (+ `errorMessage`), `required_with`, `required_with_all`
- **FR2:** CRUD API + UI for TDMs with two views (table view and raw-JSON view with paste-to-create), evolving the existing `Template.column_configs`; existing rule sets (`real-estate-v1`, `commission-v1`, `invoice-v1`, `contact-v1`) are migrated into seed TDMs
- **FR3:** Dynamic TDM suggestion — given an uploaded sample file, the LLM proposes a draft TDM (keys, types, validations inferred from data); user edits and saves before use

**Upload & structure detection**

- **FR4:** Upload extended beyond CSV to XLSX/XLS/TSV/PSV/ODS; multi-sheet workbooks trigger a Sheet Selection step (auto-skipped for single-sheet files)
- **FR5:** Header Selection step — raw grid preview with spreadsheet-style coordinates; user picks the header row; advanced options: transpose rows/columns and merge multiple header rows; auto-detect header row with confidence score so the step can be skipped when confident (Skip Header Step)
- **FR6:** Existing type-archetype detection (`tabular | timeseries | mixed`) is preserved and runs on the selected sheet/header configuration

**Column mapping**

- **FR7:** `POST /datasets/{id}/mapping/suggest` returns a proposed source-column → TDM-column mapping using layered matching in priority order: (1) exact/normalized name match, (2) historical match from `mapping_history`, (3) LLM/semantic match, (4) fuzzy string match — each with a confidence score; matches below a configurable threshold (default 60%) are returned as "unmatched" for manual assignment
- **FR8:** Match Columns UI — per-column dropdown ("Select or add column…"), per-column data-quality readout (% rows with a value, sample values), option to create a new TDM column inline, and explicit user confirmation via `POST /datasets/{id}/mapping/confirm`
- **FR9:** Confirmed mappings are persisted to `mapping_history` (source header signature → TDM column, per TDM) so subsequent files with the same signature auto-map (Remember Mapping / Skip Mapping Step); category columns additionally remember source-value → dropdown-option assignments

**Validation & cleaning**

- **FR10:** After mapping, the dataset is validated against the TDM producing **cell-level issues**: `{row, column_key, issue_type, raw_value, message}` for missing-required, type mismatch, regex failure, uniqueness violation, unknown category value, and cross-column rules (`required_with*`); summary counts per column and per issue type
- **FR11:** Cleaning suggestions — deterministic fixers first (date-format normalization to `outputFormat`, numeric coercion, whitespace/casing, category synonym mapping), then LLM fixes via the existing Gemini fix service for residual issues; each suggestion carries `{proposed_value, source: rule|llm, confidence}` and can be applied individually or in bulk per column/issue type
- **FR12:** AI Prompts — natural-language bulk transforms at review time (e.g. "Merge first_name and last_name with a space into full_name"); the LLM generates a transform, the system shows a **preview diff (affected rows, before/after)**, and the change applies only on user approval; all applied prompts are logged
- **FR13:** Every accepted change (suggestion, prompt, manual edit) is recorded in a per-import **transform log** (lineage): original value, new value, actor (rule/LLM/user), timestamp — with undo support during the session

**Review & confirm gate**

- **FR14:** Review Entries screen — editable Excel-like grid over the mapped data: required-column markers, error highlighting, error count, "Find error" navigation, filter (all / rows-with-errors / valid), sort, find & replace, undo/redo
- **FR15:** "Complete import" is the **only** trigger of the analysis pipeline; it persists the canonical Parquet (readable values, TDM schema, plus `is_outlier_*` flags where applicable) to MinIO and then launches the existing Celery chain. Import cannot complete while required-column errors remain (configurable: block vs. warn)
- **FR16:** `preprocess_task` is refactored to **model prep only** (encoding, scaling, feature prep) reading from the canonical Parquet; `DataService.preprocess()` no longer performs silent business cleaning. Anomaly-relevant values are never altered by cleaning — only format/schema normalization is allowed pre-detection

**Automation (later phase)**

- **FR17:** `Connector` entity — `type: input | output`, `kind: manual | minio_s3 | ftp_sftp | http | email`, with credentials stored server-side (encrypted) and a connection test action; MinIO/S3 is the first implemented kind
- **FR18:** `Pipeline` entity — named combination of input connector + TDM + saved mapping/header script + output connector (+ output format: CSV/JSON/XLSX); executions run the import flow unattended using remembered decisions, pausing into the Review queue only when unresolved errors exceed a threshold
- **FR19:** Webhooks — up to N registered URLs receiving signed event payloads for `import.completed`, `import.needs_review`, `pipeline.completed`, `pipeline.failed` (complements existing WebSocket progress channel)

### Non-Functional Requirements

- **NFR1:** **AI data minimization** — LLM services (mapping suggestions, cleaning fixes, prompts, dynamic TDM) receive only what they need: column headers + small samples for mapping/TDM, and **only the error cells/rows** for cleaning — never the full dataset. A per-deployment/tenant flag can disable all LLM features; the UI shows an explicit notice when data leaves the platform for AI processing (Ingestro "No Data Entry Processing" lesson)
- **NFR2:** Secrets hygiene — no API keys in repo files or docs; keys live in `.env`/secret manager only. (The Google API key currently committed in `{backend}` repo README must be revoked and replaced.)
- **NFR3:** Interactive latency budgets — mapping suggestion ≤ 5 s for 100 columns; validation of 50k rows ≤ 10 s; grid edits reflected < 200 ms (server round-trips async)
- **NFR4:** Lineage & reproducibility — every import produces a machine-readable lineage record (source file → header config → mapping → transforms → canonical Parquet) sufficient to replay the import deterministically (LLM steps replayed from logged outputs, not re-queried)
- **NFR5:** All new tables via Alembic migrations; no breaking change to existing endpoints — current auto-flow (upload → immediate analysis) remains available behind a "quick mode" flag during transition
- **NFR6:** Unit tests for mapping layers, validators, and deterministic fixers; integration test covering upload → map → clean → confirm → pipeline-launch happy path
- **NFR7:** File handling limits unchanged (100 MB) but memory-safe for XLSX (streamed/chunked reads where possible)

---

## User Interface Design Goals

### Overall UX Vision

A guided, five-stage import wizard with a progress bar (Upload → Sheet Selection → Header Selection → Match Columns → Review Entries), where each stage completes with a visible check before advancing. AI does the heavy lifting at every stage but the user always sees what changed and holds final confirmation. Non-technical users (payroll/ops-style personas) must be able to finish an import without help.

### Key Interaction Paradigms

- Wizard stages with auto-skip when confident (single sheet, high-confidence header, fully remembered mapping)
- "AI proposes, user disposes": suggestions and prompts always render a preview/diff before apply
- Excel-like editable grid at Review (sort, filter, find & replace, error navigation, undo/redo)
- Natural-language Prompts box for bulk edits at Review
- Explicit AI-processing notice whenever LLM features are invoked

### Core Screens and Views

- Import Wizard (5 stages) — replaces/extends the current Upload Wizard in `{frontend}`
- Target Data Models list + editor (table view / JSON view, Dynamic TDM "suggest from file")
- Review Entries grid with cleaning assistant side panel and Prompts input
- Connectors and Pipelines management pages (later phase; pipelines list shows name, executions, history, status filter)
- Existing Pipeline Monitor page unchanged (post-confirm Celery progress)

### Accessibility

None (internal tool) — keyboard navigation in the grid is required for usability, not compliance

### Branding

Follow existing frontend Tailwind design system; no whitelabeling in scope

### Target Device and Platforms

Web Responsive (desktop-first; grid interactions optimized for desktop)

---

## Technical Assumptions

### Repository Structure

Monorepo — backend at `{backend}`, frontend at `{frontend}`; reused ML data utilities live in `{ai_services_detection}/src/data`

### Service Architecture

Existing monolith FastAPI + Celery + MySQL + Redis + MinIO. New components are modules inside the same services: mapping/cleaning services in `{backend}/app/services`, new endpoints under `{backend}/app/api/endpoints`, new Celery task for pipeline executions. LLM access through the existing Gemini service wrapper (single choke point for data-minimization policy).

### Testing Requirements

Unit + Integration — pytest for mapping layers/validators/fixers, one end-to-end integration test per epic; frontend Jest tests for wizard stage logic and grid edit reducers

### Additional Technical Assumptions

- New tables: `target_data_models`, `dataset_mappings` (confirmed mapping per dataset), `mapping_history`, `import_issues` (cell-level validation issues), `transform_log`, `connectors`, `pipelines`, `pipeline_executions`, `webhooks`; `datasets` gains `tdm_id`, `import_status` (`uploaded | structured | mapped | cleaning | reviewed | confirmed`), `canonical_path`
- `Template` is migrated into `TargetDataModel` (data migration; template endpoints become thin aliases until frontend switches)
- Canonical data format: Parquet in MinIO (`*_canonical.parquet`), human-readable values; model prep output remains a separate encoded artifact
- Mapping confidence threshold, AI on/off, block-vs-warn on confirm are settings in `config` (env + per-TDM override)
- LLM = Gemini via existing `gemini_fix_service` patterns; every call logged with payload size and purpose
- Header-signature for mapping history = ordered list of normalized source headers hashed per TDM

---

## Epic List

- **Epic 1: Target Data Models & Column Mapping** — stand up TDM as a first-class entity and deliver AI-layered column mapping with Remember Mapping
- **Epic 2: Structure Detection for Multi-format Upload** — XLSX/multi-sheet/header-selection wizard stages with auto-skip
- **Epic 3: Validation, Cleaning Assistant & AI Prompts** — cell-level issues, rule+LLM fix suggestions, natural-language bulk transforms with preview
- **Epic 4: Review Entries & Confirm Gate** — editable grid, import gate, canonical Parquet, and refactor of `preprocess_task` to model-prep-only
- **Epic 5: Automated Pipelines (Connectors + Webhooks)** — unattended imports from connectors using remembered decisions, with webhook notifications

---

## Epic Details

### Epic 1: Target Data Models & Column Mapping

**Objective:** Replace implicit schema assumptions with explicit, reusable Target Data Models, and make column mapping a confirmed, remembered decision instead of a non-existent step. This unlocks every later stage (validation and cleaning are meaningless without a target schema).

#### Story 1.1: TDM entity, migration & CRUD API
As a data operator,
I want to define and manage Target Data Models with typed columns and validations,
so that every import has an explicit canonical schema to map into.

**Acceptance Criteria:**
1. `target_data_models` table + Alembic migration; JSON column definitions validated against the FR1 schema on write
2. CRUD endpoints (`GET/POST/PUT/DELETE /api/v1/tdm`) with the Ingestro-compatible JSON shape
3. Existing 4 rule sets seeded as TDMs; `Template` records migrated; template endpoints keep working as aliases
4. Unit tests: schema validation accepts/rejects representative definitions (category without dropdownOptions rejected, etc.)

#### Story 1.2: TDM UI (table + JSON views)
As a data operator,
I want to view and edit a TDM as a table or as raw JSON,
so that I can manage schemas in whichever form is faster.

**Acceptance Criteria:**
1. TDM list page and detail page with table view and JSON view toggle
2. Paste-JSON-to-create works and surfaces validation errors inline
3. Column add/edit/delete/reorder in table view, including validations and dropdown options

#### Story 1.3: Layered mapping suggestion service
As a data operator,
I want the system to propose column mappings automatically,
so that I only correct exceptions instead of mapping everything by hand.

**Acceptance Criteria:**
1. `POST /api/v1/datasets/{id}/mapping/suggest` implements exact → historical → LLM → fuzzy layers with per-match confidence and source layer
2. Matches below threshold returned as unmatched; threshold configurable
3. LLM layer receives only headers + ≤ 5 sample values per column (NFR1) and degrades gracefully to fuzzy when AI is disabled
4. Unit tests per layer with fixture files (exact-hit, historical-hit, semantic-hit, no-hit)

#### Story 1.4: Match Columns UI + confirm + mapping history
As a data operator,
I want to review, adjust, and confirm the proposed mapping,
so that the import proceeds with a mapping I trust — and repeats automatically next time.

**Acceptance Criteria:**
1. Match Columns wizard stage: per-column target dropdown, % filled readout, sample values, flag on unmatched columns
2. `POST /mapping/confirm` persists `dataset_mappings` and upserts `mapping_history` keyed by header signature per TDM
3. Re-uploading a file with the same header signature auto-maps at 100% confidence (historical layer) and the stage shows "auto-matched — review optional"
4. Category value assignments (source value → dropdown option) captured at confirm and remembered

#### Story 1.5: Dynamic TDM suggestion
As a data operator onboarding a brand-new client format,
I want a draft TDM generated from my sample file,
so that I don't build the schema from scratch.

**Acceptance Criteria:**
1. "Suggest TDM from file" action produces a draft (keys, labels, inferred columnTypes, obvious validations) for user editing; nothing is saved without confirmation
2. LLM receives headers + capped sample rows only; feature hidden when AI disabled
3. Draft quality test on the real-estate sample files: ≥ 80% of columns get a sensible type without manual correction

### Epic 2: Structure Detection for Multi-format Upload

**Objective:** Accept the file shapes real clients send (Excel workbooks, odd headers) and resolve structure interactively, so mapping always starts from a correctly parsed grid.

#### Story 2.1: Multi-format upload
As a data operator,
I want to upload XLSX/XLS/TSV/PSV/ODS in addition to CSV,
so that I don't have to convert files manually.

**Acceptance Criteria:**
1. Upload endpoint accepts the new formats with the same 100 MB limit; parser selected by content, not extension alone
2. Corrupt/empty files rejected with actionable error messages
3. Existing CSV path unaffected (regression test)

#### Story 2.2: Sheet Selection stage
As a data operator,
I want to pick which worksheet to import,
so that multi-tab workbooks import the right data.

**Acceptance Criteria:**
1. Multi-sheet files present a sheet picker with per-sheet row/col counts; single-sheet files skip the stage automatically
2. Selected sheet recorded in the import lineage

#### Story 2.3: Header Selection with auto-detect
As a data operator,
I want to confirm (or let the system detect) the header row,
so that columns are named correctly before mapping.

**Acceptance Criteria:**
1. Raw grid preview with A/B/C column letters and numbered rows; click-to-select header row
2. Auto-detection proposes a header row with confidence; above threshold the stage is pre-completed but revisitable (Skip Header Step)
3. Advanced options: transpose, merge multiple header rows into one
4. Header config recorded in lineage and reused via header signature

### Epic 3: Validation, Cleaning Assistant & AI Prompts

**Objective:** Convert validation from a one-shot report into an interactive cleaning loop where every issue is visible, explainable, and fixable — individually, in bulk, or via natural language — while never touching anomaly signal.

#### Story 3.1: Cell-level validation engine
As a data operator,
I want validation errors reported per cell against the TDM,
so that I can see exactly what is wrong and where.

**Acceptance Criteria:**
1. Validator supports all FR1 validation types incl. `unique`, `regex` with custom message, `required_with`, `required_with_all`, category membership
2. Issues persisted to `import_issues` with row/column/type/raw value; summary endpoint returns per-column and per-type counts
3. 50k-row dataset validates within NFR3 budget
4. Existing `validate.py` endpoint reimplemented on the new engine without breaking its response contract

#### Story 3.2: Deterministic fixers + LLM suggestions
As a data operator,
I want suggested fixes for detected issues,
so that cleaning is one click instead of manual editing.

**Acceptance Criteria:**
1. Rule-based fixers: date normalization to `outputFormat`, numeric coercion (strip currency/thousand separators), trim/case, category synonym map — run first, marked `source: rule`
2. Residual issues optionally sent to Gemini (error cells only, batched) returning `proposed_value + confidence`, marked `source: llm`
3. Apply single / apply all per column / apply all per issue-type; every application writes `transform_log`
4. Outlier-flagged numeric values are excluded from "fix" suggestions (they are flagged, never altered)

#### Story 3.3: AI Prompts with preview diff
As a data operator,
I want to describe a bulk edit in natural language and preview it before applying,
so that complex transforms don't require exports to Excel.

**Acceptance Criteria:**
1. Prompt box at Review; LLM generates a transform executed against the working data copy in a sandboxed executor (no I/O, whitelisted operations)
2. Preview shows affected-row count and before/after sample; nothing applies without approval
3. Applied prompts logged (prompt text, generated transform, row count) in `transform_log`; undo restores pre-prompt state
4. Failure modes handled: un-executable transform → readable error, zero-affected-rows → warning

#### Story 3.4: Session undo/redo & lineage record
As a data operator,
I want to undo mistakes and see what was changed,
so that cleaning is safe to explore.

**Acceptance Criteria:**
1. Undo/redo across suggestion applications, prompt applications, and manual edits within an import session
2. Lineage record (NFR4) assembled per import: file → sheet → header config → mapping → ordered transforms
3. Lineage retrievable via API and rendered as a simple timeline in the UI

### Epic 4: Review Entries & Confirm Gate

**Objective:** Give users a final, trustworthy checkpoint — an editable grid over canonical data — and make their confirmation the single trigger of the ML pipeline, cleanly separating business cleaning from model prep.

#### Story 4.1: Review Entries grid
As a data operator,
I want an Excel-like grid over the mapped, cleaned data,
so that I can make final edits and verify the import.

**Acceptance Criteria:**
1. Grid renders TDM columns with required markers; error cells highlighted with tooltip messages
2. Error count, "Find error" navigation, filter all/errors/valid, sort, find & replace, undo/redo
3. Edits re-validate the affected cells inline; performance within NFR3 on 50k rows (virtualized rendering)

#### Story 4.2: Complete-import gate & canonical Parquet
As a data operator,
I want "Complete import" to finalize the data and start the analysis,
so that only confirmed data enters the ML pipeline.

**Acceptance Criteria:**
1. Complete import blocked (or warns, per TDM setting) while required-column errors remain
2. On confirm: canonical Parquet (readable values, TDM keys, `is_outlier_*` flags) written to MinIO; `datasets.import_status = confirmed`, `canonical_path` set
3. The existing Celery chain launches from the confirm action; the legacy auto-launch on upload is gated behind "quick mode"
4. WebSocket/status endpoints report the new pre-pipeline stages (`structured/mapped/cleaning/reviewed`) in addition to Celery steps

#### Story 4.3: Refactor preprocess_task to model prep
As a platform maintainer,
I want `preprocess_task` to consume the canonical Parquet and perform only ML preparation,
so that business cleaning and model prep are decoupled.

**Acceptance Criteria:**
1. `preprocess_task` reads `canonical_path` (no raw-CSV re-parse), applies encoding/scaling, and keeps its output contract to `detect_anomalies_task`
2. `DataService.preprocess()` business-cleaning behavior removed; equivalent logic now lives in Epic 3 services (with tests proving no regression in detection F1 on the reference dataset)
3. `detect` task's raw-label lookup uses canonical Parquet instead of re-reading the original CSV
4. End-to-end integration test: upload → map → clean → confirm → detection completes with results

### Epic 5: Automated Pipelines (Connectors + Webhooks)

**Objective:** Let a confirmed, remembered import run unattended — data arrives via a connector, flows through saved header/mapping/cleaning decisions, and exits to a destination — turning the interactive importer into a repeatable operating model.

#### Story 5.1: Connector entity & MinIO/S3 connector
As a platform operator,
I want to register input/output connectors,
so that pipelines can receive and deliver data without manual uploads.

**Acceptance Criteria:**
1. `connectors` table + CRUD API/UI (name, type input/output, kind, config); credentials encrypted at rest, never returned by the API
2. MinIO/S3 input (watch prefix) and output (write result) implemented; "Test connection" action
3. `manual` kind preserves the interactive upload path as a pseudo-connector

#### Story 5.2: Pipeline entity & unattended execution
As a platform operator,
I want to compose input connector + TDM + saved mapping + output connector into a pipeline,
so that recurring imports run automatically.

**Acceptance Criteria:**
1. `pipelines` + `pipeline_executions` tables; setup flow: name → input connector → TDM → output connector (+ output format CSV/JSON/XLSX)
2. Execution runs header detection + historical mapping + deterministic cleaning unattended; if unresolved required-errors exceed threshold, execution pauses with status `needs_review` and appears in the Review queue
3. Pipelines list page: name, executions count, last status, history; manual "Run now"
4. Executions write the same lineage records as interactive imports

#### Story 5.3: Webhooks
As an integrating developer,
I want webhook notifications for import/pipeline events,
so that downstream systems react without polling.

**Acceptance Criteria:**
1. `webhooks` table + CRUD (URL, secret, subscribed events, max 10); HMAC-signed payloads
2. Events emitted: `import.completed`, `import.needs_review`, `pipeline.completed`, `pipeline.failed`; delivery with retry/backoff and a delivery log
3. Documentation page listing payload schemas

---

## Out of Scope (this PRD)

- Sub-organizations, role management/RBAC, SSO, whitelabeling (Ingestro enterprise tier)
- Self-hosted LLM for mapping/cleaning (single Gemini integration for now; the service wrapper keeps this swappable)
- PDF/nested JSON/XML ingestion (Ingestro "Advanced Parsing") — flat tabular formats only
- Embeddable importer SDK for third-party apps
- Scheduling/cron for pipelines (event/manual trigger only in Epic 5)

## Dependencies & Risks

- **Security debt (act immediately, independent of this PRD):** a Google API key is committed in the service README — revoke and move to `.env` (NFR2)
- Epic 3/4 depend on Epic 1 (TDM + mapping); Epic 2 can proceed in parallel; Epic 5 depends on Epics 1–4
- Detection quality risk in Story 4.3: changing cleaning behavior may shift model inputs — mitigated by the F1 regression test on the reference dataset before switching defaults
- LLM cost/latency risk on large files — mitigated by NFR1 minimization (error-cells-only batching) and deterministic-fixers-first ordering
- Related docs: `final_project_ai/docs/upload_validation_review_spec.md` (superseded in part), `csv_agent_services/docs/detection-data-processing-pipeline-prd.md` (downstream training pipeline, unchanged)
