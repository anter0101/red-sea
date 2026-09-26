# Implementation Plan: Policy Operations & Financial Actions

## Overview

Implement a 4-step Policy Creation Wizard on the frontend linked to a new `policy-operation` NestJS module on the backend. The backend proposes journal lines at creation time and posts them atomically on approval, reusing existing `AccountService` and `TransactionService` infrastructure.

## Tasks

- [~] 1. Backend — Database entities and migrations
  - Create `PolicyOperation`, `PolicyOperationAction`, and `PolicyOperationAudit` TypeORM entities in `redSea-backend-nestjs/src/app/modules/policy-operation/`
  - Define all enums: `OperationType`, `ContractType`, `TransactionType`, `CustodySourceType`, `PolicyOperationStatus`, `ActionStatus`, `EntryType`
  - Add TypeORM `ManyToOne` / `OneToMany` relations: `PolicyOperation → JourneyPolicy`, `PolicyOperationAction → PolicyOperation`, `PolicyOperationAudit → PolicyOperation`
  - Register entities in the module and add them to the TypeORM data source so migrations are generated
  - _Requirements: 6.1, 11.3, 12.1, 12.2_

- [~] 2. Backend — `AccountResolverService`
  - [~] 2.1 Implement `AccountResolverService` in `redSea-backend-nestjs/src/app/modules/policy-operation/account-resolver.service.ts`
    - Traverse the account tree by name segments starting from an existing seeded root
    - Use `AccountService.save()` to create missing intermediate (`isLeaf=false`) and leaf (`isLeaf=true`) accounts
    - Accept an optional `EntityManager` for transactional use
    - Throw `NotFoundException` if the root segment is not found; throw `BadRequestException` if path length < 2
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [ ]* 2.2 Write property test — Property 1: Account resolver idempotency
    - **Property 1: Calling `resolve(path)` twice returns the same account id and creates no duplicate rows**
    - **Validates: Requirements 6.4**
    - Use `fast-check` with an in-memory mock of `AccountService`
    - Tag comment: `// Tag: Feature: policy-operations-financial-actions, Property 1: account resolver idempotency`

  - [ ]* 2.3 Write property test — Property 2: Resolved accounts are always leaf accounts
    - **Property 2: The returned account has `isLeaf=true`; all intermediates have `isLeaf=false`**
    - **Validates: Requirements 6.2, 6.3**
    - Tag comment: `// Tag: Feature: policy-operations-financial-actions, Property 2: resolved accounts are always leaf accounts`

  - [ ]* 2.4 Write property test — Property 3: Resolved accounts inherit type and normalBalance from parent
    - **Property 3: Every newly created account inherits `type` and `normalBalance` from its parent**
    - **Validates: Requirements 6.6**
    - Tag comment: `// Tag: Feature: policy-operations-financial-actions, Property 3: resolved accounts inherit type and normalBalance from parent`

  - [ ]* 2.5 Write unit tests for `AccountResolverService`
    - Test: root not found → throws NotFoundException
    - Test: path length < 2 → throws BadRequestException
    - Test: intermediate account missing → created with `isLeaf=false`
    - Test: leaf account missing → created with `isLeaf=true`
    - Test: all accounts already exist → no new accounts created
    - _Requirements: 6.1–6.7_

- [~] 3. Backend — `FinancialActionBuilderService`
  - [~] 3.1 Implement `FinancialActionBuilderService` in `redSea-backend-nestjs/src/app/modules/policy-operation/financial-action-builder.service.ts`
    - Pure computation — no DB writes
    - Always produce two TRN1 lines (DEBIT client-asset, CREDIT revenue)
    - Produce TRN2 lines only when `operationType='عقد'` and `contractType='نولون'`
    - Produce TRN3 lines only when the above AND `transactionType='عهدة'`; distinguish `OFFICE` vs `SUPPLIER` custody source paths
    - _Requirements: 7.3, 7.4, 8.3, 8.4, 9.1, 9.2, 9.3_

  - [ ]* 3.2 Write property test — Property 4: TRN builder debit/credit balance
    - **Property 4: `sum(DEBIT amounts) === sum(CREDIT amounts)` for any valid `BuildInput`**
    - **Validates: Requirements 11.1, 11.2**
    - Use `fast-check` with `validBuildInputArb` generator
    - Tag comment: `// Tag: Feature: policy-operations-financial-actions, Property 4: TRN builder debit/credit balance`

  - [ ]* 3.3 Write property test — Property 5: TRN2 generated if and only if عقد + نولون
    - **Property 5: TRN2 rows exist iff `operationType='عقد'` AND `contractType='نولون'`**
    - **Validates: Requirements 8.3, 8.4**
    - Tag comment: `// Tag: Feature: policy-operations-financial-actions, Property 5: TRN2 generated iff عقد+نولون`

  - [ ]* 3.4 Write property test — Property 6: TRN3 generated if and only if عقد + نولون + عهدة
    - **Property 6: TRN3 rows exist iff `operationType='عقد'` AND `contractType='نولون'` AND `transactionType='عهدة'`**
    - **Validates: Requirements 9.3**
    - Tag comment: `// Tag: Feature: policy-operations-financial-actions, Property 6: TRN3 generated iff عقد+نولون+عهدة`

  - [ ]* 3.5 Write unit tests for `FinancialActionBuilderService`
    - Test: TRN1 only (no contractType)
    - Test: TRN1 + TRN2 when عقد + نولون
    - Test: TRN1 + TRN2 + TRN3 (office source) when all conditions met
    - Test: TRN1 + TRN2 + TRN3 (supplier source) when all conditions met
    - _Requirements: 7.3, 7.4, 8.3, 8.4, 9.1c, 9.2c_

- [~] 4. Backend — `PolicyOperationService` and DTOs
  - [~] 4.1 Create `CreatePolicyOperationDto` and `PolicyOperationResponse` / `PolicyOperationActionDto` DTOs in `redSea-backend-nestjs/src/app/modules/policy-operation/dtos/`
    - Include all fields from the design: Step 1 policy fields, Step 2 operation fields, Step 3 party fields
    - _Requirements: 2.1, 3.1, 4.1_

  - [~] 4.2 Implement `PolicyOperationService.create()` in `redSea-backend-nestjs/src/app/modules/policy-operation/policy-operation.service.ts`
    - Validate that `JourneyPolicy`, `Client`, and (if applicable) `Supplier` exist
    - Resolve all required accounts via `AccountResolverService` using the account paths from the design
    - Build proposed actions via `FinancialActionBuilderService`
    - Persist `PolicyOperation` + `PolicyOperationAction` rows with status `PENDING_REVIEW`
    - Append initial `PolicyOperationAudit` entry (event: `CREATED`)
    - Return `PolicyOperationResponse` with all proposed action lines
    - _Requirements: 6.1, 7.1, 7.2, 8.1, 8.2, 9.1a, 9.1b, 9.2a, 9.2b, 12.1_

  - [~] 4.3 Implement `PolicyOperationService.approve()`
    - Re-validate debit/credit balance (sum DEBIT === sum CREDIT within 0.01); return 400 if not balanced
    - Validate each target account via `AccountService.ensureAccountAcceptsJournalLines()`
    - Post each TRN group via `TransactionService.save()` inside a single `EntityManager` transaction
    - Update all `PolicyOperationAction` statuses to `POSTED` and set `postedTransactionCode`
    - Update `PolicyOperation.status` to `POSTED`
    - Append `PolicyOperationAudit` entry (event: `APPROVED`) with transaction codes in snapshot
    - _Requirements: 10.5, 11.1, 11.2, 11.3, 11.4, 12.3, 13.1, 13.2, 13.3_

  - [~] 4.4 Implement `PolicyOperationService.reject()`
    - Update all `PolicyOperationAction` statuses to `REJECTED`
    - Update `PolicyOperation.status` to `REJECTED`
    - Append `PolicyOperationAudit` entry (event: `REJECTED`)
    - _Requirements: 10.6, 12.4_

  - [~] 4.5 Implement `PolicyOperationService.findOne()` and `getAudit()`
    - `findOne`: return operation with all actions (used by Financial Review Screen on resume)
    - `getAudit`: return ordered audit entries for an operation
    - _Requirements: 10.7, 12.5_

  - [ ]* 4.6 Write property test — Property 9: All produced action lines target leaf accounts
    - **Property 9: Every `PolicyOperationAction.accountId` references an account with `isLeaf=true`**
    - **Validates: Requirements 11.4, 13.3**
    - Tag comment: `// Tag: Feature: policy-operations-financial-actions, Property 9: all produced action lines target leaf accounts`

  - [ ]* 4.7 Write unit tests for `PolicyOperationService`
    - Test: missing JourneyPolicy → 404
    - Test: missing Client → 404
    - Test: debit ≠ credit on approve → 400
    - Test: operation already POSTED → 409 on approve
    - Test: audit entries created for CREATED, APPROVED, REJECTED events
    - _Requirements: 10.5, 10.6, 11.1, 11.2, 12.1–12.4_

- [~] 5. Backend — `PolicyOperationController` and module wiring
  - Create `PolicyOperationController` with routes: `POST /api/policy-operations`, `GET /api/policy-operations/:id`, `POST /api/policy-operations/:id/approve`, `POST /api/policy-operations/:id/reject`, `GET /api/policy-operations/:id/audit`
  - Apply `@Roles(UserRole.ADMIN)` or appropriate role guard
  - Create `PolicyOperationModule`, import `AccountModule`, `TransactionModule`, register all three entities and services
  - Register `PolicyOperationModule` in the root `AppModule`
  - _Requirements: 10.4, 12.5, 13.1, 13.2_

- [~] 6. Checkpoint — backend unit tests pass
  - Ensure all backend unit and property tests pass, ask the user if questions arise.

- [~] 7. Frontend — Zod schemas and types
  - Create `red-sea-frontend-nextjs/src/features/policy-wizard/types/policy-wizard-schema.ts`
  - Implement `step1Schema`, `step2Schema` (with `superRefine` for conditional revenue/expense/custody validation), `step3Schema` (with `superRefine` for conditional party validation), and combined `wizardSchema`
  - Export `WizardFormValues` inferred type
  - _Requirements: 2.2, 2.3, 3.4, 3.5, 3.6, 3.7, 4.6, 4.7_

- [~] 8. Frontend — API hooks
  - Create `red-sea-frontend-nextjs/src/features/policy-wizard/api/create-policy-operation.ts` — `useCreatePolicyOperation` using base `useCreate` hook
  - Create `approve-policy-operation.ts` — `useApprovePolicyOperation` using base `usePut` (or `useCreate`) hook
  - Create `reject-policy-operation.ts` — `useRejectPolicyOperation`
  - Create `get-policy-operation.ts` — `useGetPolicyOperation` using base `useGetOne` hook
  - _Requirements: 5.3, 5.4, 10.5, 10.6, 10.7_

- [~] 9. Frontend — i18n keys
  - Add all new Arabic wizard and financial-review strings to `red-sea-frontend-nextjs/messages/ar/office.json`
  - Add corresponding English strings to `red-sea-frontend-nextjs/messages/en/office.json`
  - Keys to cover: step labels, all field labels, placeholders, validation messages, action button labels, Financial Review Screen column headers and status labels
  - _Requirements: 14.1, 14.2, 14.3, 14.4_

- [~] 10. Frontend — Wizard step components
  - [x] 10.1 Create `policy-entry-choice.tsx` — two cards: "Scan / Upload" and "Manual Entry"
    - _Requirements: 1.1, 1.2, 1.3_

  - [ ] 10.2 Create `policy-scan-step.tsx` — dummy file/image upload UI, "Continue" advances to Step 1
    - _Requirements: 1.2, 1.4_

  - [~] 10.3 Create `policy-step-1-document.tsx` — RHF form bound to `step1Schema`
    - Fields: رقم البوليصة, تاريخ البوليصة, تاريخ التحميل, رقم أرشيف, محافظة التسليم, منطقة التسليم, الوزن الكتابي, الوزن الفعلي, وزن التسليم, الكمية المفقودة, مفوض الاستلام
    - Validate on "Next"; show field-level errors
    - _Requirements: 2.1, 2.2, 2.3_

  - [~] 10.4 Create `policy-step-2-operation.tsx` — RHF form bound to `step2Schema`
    - Conditionally render نوع العقد when `operationType='عقد'`; render إجمالي المصروفات + نوع المعاملة when `contractType='نولون'`; render قيمة العهدة when `transactionType='عهدة'`
    - Validate on "Next"; show field-level errors
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [~] 10.5 Create `policy-step-3-parties.tsx` — RHF form bound to `step3Schema`
    - Always show العميل (pre-populated from journey client)
    - Conditionally render مورد النقل, بيانات العهدة (source selector + custody supplier), بيانات العقد, بيانات النولون fields
    - Validate on "Next"; show field-level errors
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

  - [~] 10.6 Create `policy-step-4-review.tsx` — read-only summary of all wizard data
    - Group by section with "Edit" shortcut back to the corresponding step
    - "Confirm" button triggers API submission with loading state; display API error inline if backend returns error
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [~] 11. Frontend — `use-policy-wizard-form.ts` hook
  - Combine form state across all steps using a single `useForm` instance with `wizardSchema`
  - Track current step index and navigation (next, back, jump to step)
  - On confirm (Step 4), call `useCreatePolicyOperation` and transition to Financial Review on success
  - Preserve all field values on back-navigation
  - _Requirements: 1.5, 5.3, 5.4, 5.5_

- [~] 12. Frontend — `policy-wizard.tsx` orchestrator
  - Render `PolicyEntryChoice` → `PolicyScanStep` (optional) → Steps 1–4 → `FinancialReviewScreen` based on wizard state
  - Accept `journeyId` prop; pre-fetch journey data to populate client
  - RTL layout when locale is `ar`
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 14.3_

- [~] 13. Checkpoint — wizard renders and navigates correctly
  - Ensure all frontend components compile and form validation works on each step, ask the user if questions arise.

- [~] 14. Frontend — Financial Review Screen
  - [~] 14.1 Create `financial-action-lines-table.tsx` — table component showing all action lines grouped by `trnGroup`
    - Columns: اسم الحساب, المسار الكامل, نوع القيد (مدين/دائن), القيمة, رقم TRN, سبب القيد
    - Summary row: total debit and total credit
    - _Requirements: 10.2, 10.3_

  - [~] 14.2 Create `financial-review-screen.tsx` — full review screen
    - Receive `PolicyOperationResponse` (from POST response or GET resume)
    - Render `FinancialActionLinesTable`
    - "Approve" button: calls `useApprovePolicyOperation`, shows loading state, navigates to success on completion
    - "Reject" button: calls `useRejectPolicyOperation`, shows loading state
    - Display API errors in an alert banner without clearing the proposed actions list
    - _Requirements: 10.1, 10.4, 10.5, 10.6, 10.7_

  - [ ]* 14.3 Write property test — Property 7: Wizard data preservation on back-navigation
    - **Property 7: Navigating back and forward preserves all previously entered form values**
    - **Validates: Requirements 1.5, 5.2**
    - Use `@fast-check/jest` with `wizardFormValuesArb` generator
    - Tag comment: `// Tag: Feature: policy-operations-financial-actions, Property 7: wizard data preservation on back-navigation`

  - [ ]* 14.4 Write property test — Property 8: Step 2 conditional field visibility
    - **Property 8: Visible fields in Step 2 match exactly the conditional display rules for any operationType/contractType/transactionType combination**
    - **Validates: Requirements 3.2, 3.3**
    - Tag comment: `// Tag: Feature: policy-operations-financial-actions, Property 8: step 2 conditional field visibility`

  - [ ]* 14.5 Write unit tests for `FinancialReviewScreen`
    - Test: renders all columns and grouped TRN sections
    - Test: total debit and total credit rows display correctly
    - Test: approve button calls hook and shows loading state
    - Test: API error displayed in alert banner without clearing lines
    - _Requirements: 10.2, 10.3, 10.4_

- [~] 15. Frontend — Route page
  - Create `red-sea-frontend-nextjs/src/app/[locale]/(loggedIn)/office/policy/[journeyId]/create/page.tsx`
  - Fetch journey by `journeyId` to pre-populate client
  - Render `PolicyWizard` with `journeyId` prop
  - _Requirements: 4.1_

- [~] 16. Final checkpoint — all tests pass
  - Ensure all backend and frontend tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use `fast-check` (backend) and `@fast-check/jest` (frontend); each requires a tag comment
- All account resolution must use `AccountService.save()` — no parallel creation paths
- All transaction posting must use `TransactionService.save()` — no parallel posting mechanism
