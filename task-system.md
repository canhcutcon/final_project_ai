Phase 1: Data Audit & Fix (Ưu tiên CAO)

┌──────┬────────────────────────────────────────────────────────────────────┬────────────────────────────┐  
 │ Task │ Chi tiết │ Tại sao │
├──────┼────────────────────────────────────────────────────────────────────┼────────────────────────────┤  
 │ 1.1 │ Xác định data đã scaled hay raw — nếu scaled thì bỏ clip/log steps │ Tránh apply sai operations │
├──────┼────────────────────────────────────────────────────────────────────┼────────────────────────────┤
│ 1.2 │ Fix Target Encoding → dùng K-Fold (k=5) │ Chống data leakage │  
 ├──────┼────────────────────────────────────────────────────────────────────┼────────────────────────────┤  
 │ 1.3 │ Tách _high_missing__ columns ra — chúng đã là binary features │ Tránh xử lý trùng │  
 ├──────┼────────────────────────────────────────────────────────────────────┼────────────────────────────┤  
 │ 1.4 │ Tách _\_freq và \*\_encoded — chúng đã là engineered features │ Hiểu rõ feature pipeline │
└──────┴────────────────────────────────────────────────────────────────────┴────────────────────────────┘

Phase 2: Domain Features (Real Estate Transactions)

┌────────────────────┬─────────────────────────┬──────────────────────────────────────────────────┐  
 │ Feature Group │ Features │ Công thức │
├────────────────────┼─────────────────────────┼──────────────────────────────────────────────────┤  
 │ Commission anomaly │ commission_pct │ gross_commission / transaction_price × 100 │
├────────────────────┼─────────────────────────┼──────────────────────────────────────────────────┤
│ │ commission_vs_median │ commission - median(commission by property_type) │  
 ├────────────────────┼─────────────────────────┼──────────────────────────────────────────────────┤  
 │ │ is_commission_outlier │ Commission ngoài IQR per group │  
 ├────────────────────┼─────────────────────────┼──────────────────────────────────────────────────┤  
 │ Price anomaly │ price_per_sqm │ transaction_price / builtup_area │
├────────────────────┼─────────────────────────┼──────────────────────────────────────────────────┤  
 │ │ price_vs_area_median │ Price deviation từ median per postal code │
├────────────────────┼─────────────────────────┼──────────────────────────────────────────────────┤  
 │ │ price_zscore_by_type │ Z-score of price within property_type │
├────────────────────┼─────────────────────────┼──────────────────────────────────────────────────┤  
 │ Agent behavior │ agent_txn_count_30d │ Số giao dịch của agent trong 30 ngày │
├────────────────────┼─────────────────────────┼──────────────────────────────────────────────────┤  
 │ │ agent_avg_commission │ Trung bình commission của agent │
├────────────────────┼─────────────────────────┼──────────────────────────────────────────────────┤  
 │ │ agent_diversity_score │ Số loại property_type agent xử lý │
├────────────────────┼─────────────────────────┼──────────────────────────────────────────────────┤  
 │ Lease anomaly │ lease_vs_market │ So sánh lease duration với thị trường │
├────────────────────┼─────────────────────────┼──────────────────────────────────────────────────┤  
 │ │ lease_price_ratio │ Price per lease day │
├────────────────────┼─────────────────────────┼──────────────────────────────────────────────────┤  
 │ Missing pattern │ missing_score │ Tổng % missing trên 1 row │
├────────────────────┼─────────────────────────┼──────────────────────────────────────────────────┤  
 │ │ critical_fields_missing │ Đếm critical fields bị missing │
└────────────────────┴─────────────────────────┴──────────────────────────────────────────────────┘

Phase 3: Advanced Features

┌────────────────────────┬────────────────────────────────────────────────────────────────────────────┐  
 │ Feature Type │ Chi tiết │
├────────────────────────┼────────────────────────────────────────────────────────────────────────────┤
│ Interaction features │ price × commission_ratio, area × property_type_encoded │
├────────────────────────┼────────────────────────────────────────────────────────────────────────────┤
│ Polynomial │ price², commission² (cho non-linear patterns) │  
 ├────────────────────────┼────────────────────────────────────────────────────────────────────────────┤  
 │ Cluster-based │ KMeans cluster ID dựa trên key numeric features │  
 ├────────────────────────┼────────────────────────────────────────────────────────────────────────────┤  
 │ Aggregation │ Group-level stats (mean, std, count) per postal_code, property_type │
├────────────────────────┼────────────────────────────────────────────────────────────────────────────┤  
 │ Anomaly-specific │ Isolation Forest score, LOF score (unsupervised signals) │
├────────────────────────┼────────────────────────────────────────────────────────────────────────────┤  
 │ Time-series enrichment │ Merge monthly stats back to tabular (txn_count_month, anomaly_ratio_month) │
└────────────────────────┴────────────────────────────────────────────────────────────────────────────┘

Phase 4: Selection & Validation

┌──────┬───────────────────────────────────┬────────────────────────────────┐
│ Step │ Method │ Threshold │
├──────┼───────────────────────────────────┼────────────────────────────────┤  
 │ 4.1 │ Remove constant/near-constant │ Variance < 0.01 │
├──────┼───────────────────────────────────┼────────────────────────────────┤  
 │ 4.2 │ Remove highly correlated │ |corr| > 0.95 │  
 ├──────┼───────────────────────────────────┼────────────────────────────────┤
│ 4.3 │ Mutual Information screening │ Top-K features │  
 ├──────┼───────────────────────────────────┼────────────────────────────────┤  
 │ 4.4 │ XGBoost/SHAP importance │ Keep top 50-80 │
├──────┼───────────────────────────────────┼────────────────────────────────┤  
 │ 4.5 │ Re-run PSI check │ PSI < 0.2 │
├──────┼───────────────────────────────────┼────────────────────────────────┤  
 │ 4.6 │ Save final feature set + metadata │ .parquet + feature_config.json │
└──────┴───────────────────────────────────┴────────────────────────────────┘

    ---

Code Review: Recruitment Module vs Case Module Patterns

CRITICAL

---

1. RecruitmentApplicationEntity.salespersonInfo typed as Record<string, unknown> — loses type safety

- File: src/modules/recruitment/entities/recruitment-application.entity.ts:84
- Rule: JSON Columns — Always Typed (case module uses CaseDeal, CommissionDeal interfaces)
- Issue: salespersonInfo, businessCardDetails, emergencyContact are all Record<string, unknown>. The case module types every JSON column with
  a dedicated interface (CaseDeal, CommissionDeal). This caused the field-mapping bugs we just fixed — the compiler can't catch missing fields  
  on Record<string, unknown>.
- Fix: Define typed interfaces matching the DTO shapes:  


// In interfaces/recruitment-application.interface.ts  
 export interface ISalespersonInfo {  
 nameAsPerNric?: string;  
 aliasName?: string;  
 chineseCharacters?: string;  
 nricNo?: string;  
 dateOfBirth?: string;  
 gender?: string;  
 race?: string;  
 raceOther?: string;  
 countryOfBirth?: string;  
 citizenship?: string;  
 residentialStatus?: string;  
 residentialStatusOther?: string;  
 ceaRegistrationNo?: string;  
 nricFrontDocuments?: string[];  
 nricBackDocuments?: string[];  
 isMyInfoPopulated?: boolean;  
 phone?: { countryCode: string; phoneNumber: string }[];  
 residentialNumber?: { countryCode: string; phoneNumber: string };  
 address?: Record<string, string>;  
 }

// In entity:  
 @Column({ name: 'salesperson_info', type: 'json', nullable: true })  
 salespersonInfo: ISalespersonInfo;

Same for businessCardDetails → IBusinessCardDetails and emergencyContact → IEmergencyContact.

---

2. RecruitmentSettingItemEntity.value typed as any — violates JSON typing rule

- File: src/modules/recruitment/entities/recruitment-setting-item.entity.ts:44
- Rule: JSON Columns — Always Typed
- Issue: value?: { email: string; name?: string; items?: any[] } | any — the | any makes the entire type meaningless. The case module's  
  BaseSettingEntity uses a strict value field with auto-parse on AfterLoad.
- Fix:  
  export interface IRecruitmentSettingValue {  
   email?: string;  
   name?: string;  
   items?: { id: string; label: string; required?: boolean }[];  
  }  


@Column({ name: 'value', type: 'json', nullable: true })
value?: IRecruitmentSettingValue;

---

3. ApplicantEntity missing businessUnitId — potential cross-tenant data leak

- File: src/modules/recruitment/entities/applicant.entity.ts
- Rule: Multi-tenant — main entities must declare businessUnitId
- Issue: ApplicantEntity has no businessUnitId. The findOrCreateApplicant query only filters by email — so an applicant created in BU-A can be
  found and updated by BU-B. In the case module, CaseEntity always scopes to businessUnitId.
- Fix: Add businessUnitId column and pass it through from the application:  


@Index()  
 @Column({ name: 'business_unit_id' })  
 businessUnitId: number;

And update findOrCreateApplicant to filter by BU:
.where('a.email = :email', { email: dto.email })
.andWhere('a.businessUnitId = :buId', { buId: dto.businessUnitId })

---

4. RecruitmentPublicController has no authentication — no rate limiting either

- File: src/modules/recruitment/controllers/recruitment-public.controller.ts:17-18
- Rule: Security — public endpoints need rate limiting
- Issue: @Controller('recruitment') with no AuthGuard(). This is intentional for the applicant-facing flow, but there's no @RateLimiter() on  
  any endpoint. The case module equivalent would use rate limiting for unauthenticated routes. Endpoints like validate-token, myinfo-authorize,
  attachments are exposed to brute-force attacks.
- Fix: Add rate limiting on sensitive public endpoints:  
  @RateLimiter({ ttl: 60, limit: 10 })  
  @Get('validate-token')  
  async validateToken(...) { ... }

---

WARNING

---

5. formData typed as object in DTOs — blocks compiler checks

- File: src/modules/recruitment/dto/create-application.dto.ts:42, update-application.dto.ts:36
- Rule: JSON Columns — Always Typed
- Issue: formData?: object — should be Record<string, unknown> at minimum to prevent any-like behavior.
- Fix:  
  @IsOptional() @IsObject()  
  formData?: Record<string, unknown>;  


---

6. SalespersonInfoDto.address typed as object

- File: src/modules/recruitment/dto/application-sub.dto.ts:80
- Rule: JSON Columns — Always Typed
- Issue: address?: object — should be a proper DTO with @ValidateNested(). The RecruitmentAddress class already exists in  
  recruitment-contact.ts but isn't used here.
- Fix:  
  @IsOptional()
  @IsObject()  
  @ValidateNested()  
  @Type(() => RecruitmentAddress)
  address?: RecruitmentAddress;

---

7. Setting service manually sets createdAt/updatedAt — redundant with TypeORM decorators

- File: src/modules/recruitment/services/recruitment-setting-item.service.ts:131-132,155,229-230
- Rule: Code Quality — DRY
- Issue: createdAt: new Date() and updatedAt: new Date() are manually set, but the entity already has @CreateDateColumn() and  
  @UpdateDateColumn() which TypeORM handles automatically. The case module's settings entity relies on TypeORM for this.
- Fix: Remove manual timestamp assignments — let TypeORM handle them.  


---

8. Setting entity has both isDeleted boolean and @DeleteDateColumn deletedAt — redundant soft-delete

- File: src/modules/recruitment/entities/recruitment-setting-item.entity.ts:55,70
- Rule: Database conventions — case module uses @DeleteDateColumn only
- Issue: The entity has both isDeleted: boolean (queried manually with isDeleted: false) and deletedAt (TypeORM soft delete). The case  
  module's BaseSettingEntity only uses TypeORM's @DeleteDateColumn. This creates confusion about which mechanism controls visibility.
- Fix: Pick one. Since @DeleteDateColumn is the standard, remove isDeleted and use deletedAt IS NULL (which TypeORM does automatically with  
  .find() when @DeleteDateColumn is present).  


---

9. Controller has heavy business logic — case module delegates to service

- File: src/modules/recruitment/controllers/recruitment-application.controller.ts:111-162
- Rule: Controller conventions — no business logic in controllers; case module controller's create() is ~10 lines
- Issue: The sendLink method (lines 111–162) contains MyInfo URL construction, cache anti-spam check, event publishing, and conditional  
  branching. In the case module, controllers are thin wrappers that delegate entirely to the service.
- Fix: Move the link-building, anti-spam, and event-publishing logic into RecruitmentApplicationService.sendLink().  


---

10. ApplicationHistoryEntity missing updatedAt and deletedAt

- File: src/modules/recruitment/entities/application-history.entity.ts
- Rule: Base Columns Required — updated_at + deleted_at required by convention
- Issue: Only has @CreateDateColumn. Audit trails are append-only but the convention still requires these columns.  


---

11. RecruitmentSettingItemEntity.id typed as string | number — ambiguous

- File: src/modules/recruitment/entities/recruitment-setting-item.entity.ts:12
- Rule: Entity conventions
- Issue: Other recruitment entities consistently use string for bigint IDs. This entity uses string | number, causing casts like id: id as any
  in the service (line 147).
- Fix: Standardize to string with the same transformer pattern used in other entities.  


---

SUGGESTION

---

12. Repeated findOrFail + scope check pattern — extract to helper

- File: src/modules/recruitment/controllers/recruitment-application.controller.ts (lines 118-124, 172-178, 244-250, 280-286, 311-317, 340-346)
- Rule: DRY
- Issue: This pattern repeats 6 times in the controller:  
  const buScope = await user.hasPermission('update', { moduleName: 'recruitment', entity: 'application' }, BuScope, bu.id);
  const application = await RecruitmentApplicationEntity.findOrFail<RecruitmentApplicationEntity>(null, {  
   where: Obj.filter({ id, businessUnitId: bu.id, createdById: buScope === false ? user.id : undefined }),  
  });  
  The case module uses user.authorize('action', entity) via policy instead. Consider extracting to a service method:  
  async findApplicationWithScope(id: string, bu: BusinessUnitEntity, user: UserEntity, action: string) { ... }  


---

13. syncDefaultData swallows errors and returns empty array

- File: src/modules/recruitment/services/recruitment-setting-item.service.ts:248-255
- Rule: Error Handling — no silent error swallowing (unless background job)
- Issue: The catch block logs but returns [], meaning the caller silently gets no settings. The case module's CaseSettingService doesn't  
  swallow errors in its onModuleInit.
- Fix: Consider re-throwing or returning a fallback that the caller can distinguish from "genuinely empty":  
  catch (error) {  
   Logging.error('Error syncing default data', error, 'RecruitmentSettingItemService');  
   throw error; // let caller handle it  
  }  


---

14. FormLayoutEntity missing businessUnitId — all BUs share the same layouts

- File: src/modules/recruitment/entities/form-layout.entity.ts
- Rule: Multi-tenant (if BUs need different form layouts)
- Issue: The case module's settings are scoped per businessUnitId via BaseSettingEntity. If all BUs intentionally share form layouts, this is
  fine. But if different BUs need different CEA compliance questions or disclaimer items, this entity needs BU scoping.  


---

Summary Table

┌─────┬────────────┬────────────────────────────────────┬───────────────────────────────────────────────┐
│ # │ Severity │ File │ Issue │  
 ├─────┼────────────┼────────────────────────────────────┼───────────────────────────────────────────────┤
│ 1 │ CRITICAL │ recruitment-application.entity.ts │ JSON columns typed as Record<string, unknown> │  
 ├─────┼────────────┼────────────────────────────────────┼───────────────────────────────────────────────┤
│ 2 │ CRITICAL │ recruitment-setting-item.entity.ts │ value typed as any │  
 ├─────┼────────────┼────────────────────────────────────┼───────────────────────────────────────────────┤
│ 3 │ CRITICAL │ applicant.entity.ts │ Missing businessUnitId — cross-tenant leak │  
 ├─────┼────────────┼────────────────────────────────────┼───────────────────────────────────────────────┤  
 │ 4 │ CRITICAL │ recruitment-public.controller.ts │ No rate limiting on public endpoints │
├─────┼────────────┼────────────────────────────────────┼───────────────────────────────────────────────┤  
 │ 5 │ WARNING │ DTOs │ formData typed as object │
├─────┼────────────┼────────────────────────────────────┼───────────────────────────────────────────────┤  
 │ 6 │ WARNING │ application-sub.dto.ts │ address untyped, existing DTO unused │
├─────┼────────────┼────────────────────────────────────┼───────────────────────────────────────────────┤  
 │ 7 │ WARNING │ setting-item.service.ts │ Manual timestamp assignment │
├─────┼────────────┼────────────────────────────────────┼───────────────────────────────────────────────┤  
 │ 8 │ WARNING │ setting-item.entity.ts │ Dual soft-delete mechanism │
├─────┼────────────┼────────────────────────────────────┼───────────────────────────────────────────────┤  
 │ 9 │ WARNING │ application.controller.ts │ Heavy business logic in sendLink │
├─────┼────────────┼────────────────────────────────────┼───────────────────────────────────────────────┤  
 │ 10 │ WARNING │ application-history.entity.ts │ Missing updatedAt/deletedAt │
├─────┼────────────┼────────────────────────────────────┼───────────────────────────────────────────────┤  
 │ 11 │ WARNING │ setting-item.entity.ts │ id typed as string | number │
├─────┼────────────┼────────────────────────────────────┼───────────────────────────────────────────────┤  
 │ 12 │ SUGGESTION │ application.controller.ts │ Repeated scope-check pattern │
├─────┼────────────┼────────────────────────────────────┼───────────────────────────────────────────────┤  
 │ 13 │ SUGGESTION │ setting-item.service.ts │ Error swallowing in syncDefaultData │
├─────┼────────────┼────────────────────────────────────┼───────────────────────────────────────────────┤  
 │ 14 │ SUGGESTION │ form-layout.entity.ts │ No BU scoping │
└─────┴────────────┴────────────────────────────────────┴───────────────────────────────────────────────┘

The highest-impact fix is #1 (typing salespersonInfo with a proper interface) — this is the root cause of the field-mapping bugs we fixed  
 earlier and would prevent future regressions at compile time.
