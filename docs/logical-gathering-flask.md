# Plan — Update Spec & Port Stitch Mocks into Upload Wizard

## Context

User đã có sẵn **4 bộ mock UI Stitch-generated** cho wizard 4 bước:

| Step | Folder | Contents |
|---|---|---|
| 1 Upload | [csv_agent_services/fronted/UI/Upload & Initial Preview/](csv_agent_services/fronted/UI/Upload%20%26%20Initial%20Preview/) | `code.html`, `screen.png`, `DESIGN.md` |
| 2 Mapping | [csv_agent_services/fronted/UI/Step 2- Schema Mapping/](csv_agent_services/fronted/UI/Step%202-%20Schema%20Mapping/) | `code.html`, `screen.png`, `DESIGN.md` |
| 3 Validation Review | [csv_agent_services/fronted/UI/Step 3- Validation Review Dashboard/](csv_agent_services/fronted/UI/Step%203-%20Validation%20Review%20Dashboard/) | `code.html`, `screen.png`, `DESIGN.md` |
| 4 Final Config & Run | [csv_agent_services/fronted/UI/Step 4- Final Configuration & Run/](csv_agent_services/fronted/UI/Step%204-%20Final%20Configuration%20%26%20Run/) | `code.html`, `screen.png`, `DESIGN.md` |

Tất cả 4 DESIGN.md giống nhau — design system **"Sovereign Intelligence Framework"** (editorial, no-line, glassmorphism, signature gradient `#24389c → #3f51b5`).

Scope của edit lần này chuyển từ "build from scratch" → **"port HTML mock thành React components + wire vào backend"**.

User yêu cầu:
1. Cập nhật spec [final_project_ai/docs/upload_validation_review_spec.md](final_project_ai/docs/upload_validation_review_spec.md) để có section hướng dẫn FE implementation dựa trên mocks.
2. Định rõ plan port mocks vào Next.js App Router tại [csv_agent_services/fronted/app/(pages)/upload/](csv_agent_services/fronted/app/(pages)/upload/).

---

## Phần 1 — Cập nhật spec doc

**Mục tiêu**: chèn vào [upload_validation_review_spec.md](final_project_ai/docs/upload_validation_review_spec.md) một section mới mô tả mapping mock → FR và chiến lược port.

### Thêm Section 13 — FE Implementation Mapping (trước "Next Steps")

Nội dung cần có:

**13.1 Mock inventory** — bảng 4 dòng: Step | Folder path | Coverage FR | Missing
- Step 1 — cover FR dropzone + preview; thiếu: column type inference hints, 4-step stepper active-state
- Step 2 — cover FR-1 layout (source ↔ target), sample chips; thiếu: template auto-suggest, save draft wiring
- Step 3 — cover FR-1.1 column table, FR-2.1 counter cards, FR-3 global config; thiếu: ColumnDetailsModal 4 tabs, rule editor UI, FR-4 template save/load, FR-2.3 drawer preview flagged rows
- Step 4 — cover ArchetypeSelector, ModelSelector, run CTA; thiếu: anomaly threshold slider (0.899), summary readback "X rows vào ML"

**13.2 Design system constraints** (trích từ DESIGN.md)
- No-line rule — dùng background shift thay border.
- Surface hierarchy: `surface` → `surface-container-low` → `surface-container-lowest`.
- Signature gradient cho primary CTA.
- Glassmorphism cho modals (blur 12–20px, opacity 80%).
- Typography: Inter, Label-md uppercase cho overline.

**13.3 Port strategy**
- Giữ nguyên structure HTML của mock, convert sang JSX component.
- Mỗi Step = 1 component riêng dưới `components/upload/`.
- Reuse existing components trong `components/`: `PipelineProgress` (làm base cho WizardStepper), `StartAnalysisModal` (shell cho `ColumnDetailsModal`), `TriggerRuleModal` (base cho rule editor), `SideNavBar`, `TopAppBar`.
- Tailwind tokens đã có trong [tailwind.config.ts](csv_agent_services/fronted/tailwind.config.ts) — KHÔNG thêm CSS mới.

**13.4 Component mapping table**

| Mock element (step) | React component | Reuse? |
|---|---|---|
| WizardStepper (shared top) | `components/upload/WizardStepper.tsx` | Extend `PipelineProgress` |
| DropZone + preview (S1) | giữ `DropZone`, `StructurePreview` trong `page.tsx` | Yes |
| Source↔Target mapping table (S2) | `components/upload/SchemaMappingStep.tsx` | New |
| Column config table (S3 left) | `components/upload/ColumnConfigTable.tsx` | New |
| Counter cards + toggles (S3 right) | `components/upload/ValidationSummaryPanel.tsx` | New |
| Global config bar (S3 top) | `components/upload/GlobalConfigHeader.tsx` | New |
| Column details 4 tabs | `components/upload/ColumnDetailsModal.tsx` | Extend `StartAnalysisModal` shell |
| Rule editor form | `components/upload/RuleEditorForm.tsx` | Extend `TriggerRuleModal` |
| Flagged rows drawer | `components/upload/FlaggedRowsDrawer.tsx` | New |
| Threshold slider + model select (S4) | giữ `ModelSelector`, thêm `AnomalyThresholdSlider.tsx` | Yes + New |
| Summary readback (S4) | inline trong page | New |

**13.5 State lift-up to page.tsx** (liệt kê state cần thêm, khớp Section 4)
```ts
step, columnConfigs, ruleSetId, businessDomain,
validationResult, dropHardFails (locked true), includeRuleScore,
anomalyThreshold (0.899), batchSize (25000)
```

**13.6 API contracts khớp Section 6 của spec**
- `POST /api/v1/datasets/{id}/validate` → triggers khi vào Step 3, re-trigger khi user edit rule.
- `GET /api/v1/rules/sets` → load cho Rule set dropdown.
- `POST|GET /api/v1/templates` → FR-4.
- Mở rộng `POST /api/v1/analysis` payload: thêm `rule_set_id, column_configs, drop_hard_fails, include_rule_score, anomaly_threshold, batch_size`.
- Cho v1 demo: fallback mock trong [csv_agent_services/fronted/lib/api.ts](csv_agent_services/fronted/lib/api.ts) với env flag `NEXT_PUBLIC_MOCK_VALIDATE`.

**13.7 Acceptance (FE-specific)** bổ sung cho Section 8
- [ ] FE-AC-1 — Mỗi Step render đúng layout so với `screen.png` reference.
- [ ] FE-AC-2 — Back/Next giữa 4 step KHÔNG mất state.
- [ ] FE-AC-3 — WizardStepper highlight đúng step hiện tại.
- [ ] FE-AC-4 — Column Details modal render đủ 4 tabs, switch tab không reset form.
- [ ] FE-AC-5 — Validation counter cập nhật sau mỗi `Re-validate`.
- [ ] FE-AC-6 — `Next → Run Detection` disabled đúng logic (hard_fails > 0).
- [ ] FE-AC-7 — `startAnalysis` payload chứa đủ field mở rộng khi Step 4 submit.

---

## Phần 2 — Port mocks thành React code (thứ tự thực thi)

1. **Wizard shell** — refactor [upload/page.tsx](csv_agent_services/fronted/app/(pages)/upload/page.tsx) thành shell + `<WizardStepper />` + switch(step). Giữ Step 1 logic cũ (DropZone, StructurePreview).
2. **WizardStepper** — port top stepper từ `Upload & Initial Preview/code.html`, tạo [components/upload/WizardStepper.tsx](csv_agent_services/fronted/components/upload/WizardStepper.tsx). Props: `currentStep`, `onStepClick` (chỉ cho back-navigate).
3. **Step 2** — port `Step 2- Schema Mapping/code.html` thành [components/upload/SchemaMappingStep.tsx](csv_agent_services/fronted/components/upload/SchemaMappingStep.tsx). Dùng `preview.columns` từ backend auto-detect fill mặc định. Output `ColumnConfig[]`.
4. **Types** — tạo [types/upload.ts](csv_agent_services/fronted/types/upload.ts) với `ColumnConfig`, `Rule`, `ValidationResult`, `RowValidation`, `Template`, `RuleSet` theo Section 6 spec.
5. **API mocks** — trong [lib/api.ts](csv_agent_services/fronted/lib/api.ts) thêm `validateDataset`, `getRuleSets`, `saveTemplate`, `loadTemplates` + mở rộng `startAnalysis` signature. Fake data khi `NEXT_PUBLIC_MOCK_VALIDATE=true`.
6. **Step 3 shell + GlobalConfigHeader** — port layout top bar từ `Step 3/code.html`.
7. **Step 3 ColumnConfigTable + ValidationSummaryPanel** — port left+right panels, wire counters với `validationResult` state.
8. **ColumnDetailsModal 4 tabs** — mock từ [final_project_ai/ui/colum-detail-category/](final_project_ai/ui/colum-detail-category/) + shell của `StartAnalysisModal`. 4 tabs: Details / Configuration / Data validations (Basic+Advanced) / Mapping validation.
9. **RuleEditorForm** — form nested trong "Advanced rules" tab, hỗ trợ range / cross_column / dependency / enum / regex (FR-1.2).
10. **FlaggedRowsDrawer** — drawer list 50 rows bị flag (FR-2.3).
11. **Step 4** — port `Step 4/code.html`. Giữ `ArchetypeSelector`, `ModelSelector`. Thêm `AnomalyThresholdSlider` + summary readback. Sửa `handleInitialize` để gửi payload mở rộng.
12. **I18n pass** — labels tiếng Việt + English (NFR-5).
13. **Dev test end-to-end** → xem Verification.

---

## Critical files

**Edit:**
- [final_project_ai/docs/upload_validation_review_spec.md](final_project_ai/docs/upload_validation_review_spec.md) — thêm Section 13 (FE Implementation Mapping) + bổ sung FE-AC vào Section 8.
- [csv_agent_services/fronted/app/(pages)/upload/page.tsx](csv_agent_services/fronted/app/(pages)/upload/page.tsx) — refactor thành wizard shell.
- [csv_agent_services/fronted/lib/api.ts](csv_agent_services/fronted/lib/api.ts) — thêm 4 client + mở rộng `startAnalysis`.

**New:**
- [csv_agent_services/fronted/types/upload.ts](csv_agent_services/fronted/types/upload.ts)
- [csv_agent_services/fronted/components/upload/WizardStepper.tsx](csv_agent_services/fronted/components/upload/WizardStepper.tsx)
- [csv_agent_services/fronted/components/upload/SchemaMappingStep.tsx](csv_agent_services/fronted/components/upload/SchemaMappingStep.tsx)
- [csv_agent_services/fronted/components/upload/GlobalConfigHeader.tsx](csv_agent_services/fronted/components/upload/GlobalConfigHeader.tsx)
- [csv_agent_services/fronted/components/upload/ColumnConfigTable.tsx](csv_agent_services/fronted/components/upload/ColumnConfigTable.tsx)
- [csv_agent_services/fronted/components/upload/ValidationSummaryPanel.tsx](csv_agent_services/fronted/components/upload/ValidationSummaryPanel.tsx)
- [csv_agent_services/fronted/components/upload/ColumnDetailsModal.tsx](csv_agent_services/fronted/components/upload/ColumnDetailsModal.tsx)
- [csv_agent_services/fronted/components/upload/RuleEditorForm.tsx](csv_agent_services/fronted/components/upload/RuleEditorForm.tsx)
- [csv_agent_services/fronted/components/upload/FlaggedRowsDrawer.tsx](csv_agent_services/fronted/components/upload/FlaggedRowsDrawer.tsx)
- [csv_agent_services/fronted/components/upload/AnomalyThresholdSlider.tsx](csv_agent_services/fronted/components/upload/AnomalyThresholdSlider.tsx)

## Reuse (đã có, không làm lại)

- [components/PipelineProgress.tsx](csv_agent_services/fronted/components/PipelineProgress.tsx) — base cho WizardStepper.
- [components/StartAnalysisModal.tsx](csv_agent_services/fronted/components/StartAnalysisModal.tsx) — shell cho ColumnDetailsModal.
- [components/TriggerRuleModal.tsx](csv_agent_services/fronted/components/TriggerRuleModal.tsx) — base cho RuleEditorForm.
- [components/SideNavBar.tsx](csv_agent_services/fronted/components/SideNavBar.tsx), [components/TopAppBar.tsx](csv_agent_services/fronted/components/TopAppBar.tsx).
- [tailwind.config.ts](csv_agent_services/fronted/tailwind.config.ts) — tokens đầy đủ, không thêm mới.
- DropZone, StructurePreview, ArchetypeSelector, ModelSelector — đã có inline trong `upload/page.tsx`.

## Verification

- `cd csv_agent_services/fronted && npm run dev`, mở `/upload`.
- So sánh visual từng step với `screen.png` trong 4 UI folders — layout match.
- Flow end-to-end với 1 CSV mẫu: upload → mapping → validation (mock `/validate`) → run detection. Payload gửi `startAnalysis` chứa đủ field mở rộng (verify qua DevTools Network).
- Back/Next không mất state.
- Disabled state CTA Step 3 → 4 khi hard_fails > 0.
- `npm run test` pass (không regression).
- TypeScript build clean: `npm run build`.

## Out of scope (defer v2)

- Backend endpoints thật (`/validate`, `/rules/sets`, `/templates`) — v1 dùng mock.
- Rule IDE nâng cao (visual rule builder drag-drop).
- Multi-user template sharing.
- Feedback loop ML → auto-suggest new rule.
