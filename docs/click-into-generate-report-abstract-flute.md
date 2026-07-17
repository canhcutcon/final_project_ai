# Wire "Generate Report" to Pipeline + Gemini Fix Flow

## Context

On the analysis detail page, clicking **Generate Report** currently does nothing useful — it only navigates to `/reports?analysis_id={id}`, which renders a hard-coded mock page. No backend API is called; no pipeline step runs.

The user wants the button to become the real trigger:

1. If the analysis has **no anomalies** (no row with `score ≥ 0.5`), the click should push the CSV through the report pipeline (`POST /report/generate`) and navigate to the real generated report.
2. If anomalies **exist**, block auto-generation and instead open a modal showing **Gemini AI fix suggestions** per bad row. The user reviews/approves, the backend applies the fixes, and only then is the report generated.

The Gemini agent code already exists at [csv_agent_platform/detection/src/agent/gemini_agent.py](csv_agent_platform/detection/src/agent/gemini_agent.py) but is **not wired into the backend service** (missing from `requirements.txt`, missing `GEMINI_API_KEY` in `.env.example`, not imported anywhere in `csv_agent_services/backend`). Report generation endpoint (`POST /report/generate`) already works — it's just never called by the UI.

---

## Files to Modify / Create

### Backend (`csv_agent_services/backend/`)

1. **Copy + adapt Gemini agent → [app/services/gemini_fix_service.py](csv_agent_services/backend/app/services/gemini_fix_service.py)** (new)
   - Port `GeminiAgentService`, `FixSuggestion`, `AgentResult` from `csv_agent_platform/detection/src/agent/gemini_agent.py`.
   - Drop the `FixCache` Redis dependency for V1 (keep simple; add later if cost is a problem).
   - Expose async wrapper `suggest_fixes(analysis_id, db) -> list[FixSuggestion]`.

2. **New endpoint → [app/api/endpoints/report.py](csv_agent_services/backend/app/api/endpoints/report.py)**
   - Add `POST /report/suggest-fix` — body: `{analysis_id: int}` → returns list of suggestions with row_id, field, original_value, suggested_value, confidence, fix_type, reason.
   - Add `POST /report/apply-fix` — body: `{analysis_id: int, accepted_suggestions: [{row_id, field, suggested_value}]}` → patches `AnalysisResult.anomaly_scores` (flip `is_anomaly=false` on fixed rows) OR updates the underlying dataset parquet. Persists a new `AnalysisResult` snapshot referencing the same `dataset_id`.
   - Existing `POST /report/generate` already returns `{report_id, content, model_used}` — no change required.

3. **Anomaly precheck helper → inline in the `/report/generate` endpoint**
   - Before calling `nlp.generate_report`, compute `has_anomalies = any(s["is_anomaly"] for s in analysis.anomaly_scores)`.
   - If `has_anomalies` and request has no `force=true` flag → return HTTP 409 `{"detail": "anomalies_present", "anomaly_count": N}` so the frontend knows to open the fix modal.
   - Add `force: bool = False` to `GenerateReportRequest`.

4. **[requirements.txt](csv_agent_services/backend/requirements.txt)** — add `google-generativeai>=0.8.0`.

5. **[.env.example](csv_agent_services/backend/.env.example)** — add `GEMINI_API_KEY=` line.

### Frontend (`csv_agent_services/fronted/`)

6. **[lib/api.ts](csv_agent_services/fronted/lib/api.ts)** — add three helpers:
   ```ts
   export function generateReport(analysisId: number, opts?: {language?: string; style?: string; force?: boolean}) { ... }
   export function suggestFix(analysisId: number) { ... }
   export function applyFix(analysisId: number, accepted: FixAcceptPayload[]) { ... }
   ```

7. **[app/(pages)/analyses/[id]/page.tsx:468-474](csv_agent_services/fronted/app/(pages)/analyses/[id]/page.tsx#L468-L474)** — rewrite the Generate Report button handler:
   - Compute `hasAnomalies = entries.some(e => e.is_anomaly)` (already available in the page state).
   - If `!hasAnomalies`: call `generateReport(result.id)`, then `router.push('/reports/' + report_id)`.
   - If `hasAnomalies`: open `<GeminiFixModal>` (new component).
   - Show spinner / disable button while the API call is in flight.

8. **New component → [components/GeminiFixModal.tsx](csv_agent_services/fronted/components/GeminiFixModal.tsx)** (new)
   - On mount, calls `suggestFix(analysisId)` → renders a table: row, field, original, suggested, confidence, accept-checkbox.
   - "Apply & Generate" button → `applyFix(...)` → then `generateReport(analysisId, {force: true})` → navigate to report.
   - Handles the loading / empty / error states.

9. **New page → [app/(pages)/reports/[id]/page.tsx](csv_agent_services/fronted/app/(pages)/reports/[id]/page.tsx)** (new)
   - Fetch via `getReport(id)` (already in `lib/api.ts:28`).
   - Replace the hard-coded mock from `/reports/page.tsx` with real `content` (Markdown), `model_used`, `language`, `style`, and a working Export PDF button that calls the existing `POST /report/{id}/export-pdf` then `GET /report/{id}/download`.

---

## Reuse (Existing Code — Do Not Rewrite)

- **NLP pipeline**: [app/services/nlp_service.py](csv_agent_services/backend/app/services/nlp_service.py) → `get_nlp_service().generate_report(...)` — already wired in `report.py:103`.
- **Report model**: [app/models/report.py](csv_agent_services/backend/app/models/report.py) — no schema change needed.
- **Anomaly schema**: [app/models/analysis_result.py](csv_agent_services/backend/app/models/analysis_result.py) — `anomaly_scores` JSON already has `row_id`, `is_anomaly`, `top_fields` which `GeminiAgentService` expects.
- **Gemini prompt + batching logic**: port verbatim from [csv_agent_platform/detection/src/agent/gemini_agent.py](csv_agent_platform/detection/src/agent/gemini_agent.py) — `_SYSTEM_PROMPT`, `BATCH_SIZE=20`, retry/backoff.

---

## Flow Diagram (end-to-end)

```
User clicks "Generate Report" on /analyses/[id]
        │
        ▼
  hasAnomalies = entries.some(e => e.is_anomaly)
        │
   ┌────┴────┐
   │ false   │ true
   ▼         ▼
generateReport()   <GeminiFixModal>
   │                    │ suggestFix()
   │                    ▼
   │               User accepts suggestions
   │                    │
   │                    ▼ applyFix()
   │                    │
   │                    ▼ generateReport({force:true})
   │                    │
   └─────────┬──────────┘
             ▼
    router.push('/reports/'+report_id)  → real content
```

---

## Verification

1. **Backend unit**: `cd csv_agent_services/backend && pytest tests/ -k "report or gemini"`.
2. **Manual happy path** (no anomalies):
   - Upload clean CSV → start analysis → wait for completion → click Generate Report → confirm navigation to `/reports/{id}` with real Markdown content.
3. **Manual fix path** (anomalies present):
   - Upload a dirty CSV (with known validation errors) → click Generate Report → modal opens → Gemini returns suggestions (requires `GEMINI_API_KEY` in `.env`) → accept a few → confirm `anomaly_scores` patched and fresh report generated.
4. **Error states**:
   - Missing `GEMINI_API_KEY` → modal shows "Gemini unavailable, fall back to manual review" message (port the `fallback_mode` flag from the source agent).
   - Network failure on `applyFix` → error toast, modal remains open, no state corruption.
5. **PDF export** still works end-to-end via existing endpoint.
