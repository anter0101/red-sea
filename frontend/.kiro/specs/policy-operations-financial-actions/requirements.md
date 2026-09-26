# Requirements Document

## Introduction

Phase 2 introduces a structured Policy Creation workflow in the Office screens and links it to automatic financial action generation. A policy can be entered via a dummy Scan UI (UI-only, no OCR) or via manual entry; both paths produce identical Policy Data. Once confirmed, the system derives the required journal transactions (TRN 1 and, conditionally, TRN 2 and TRN 3), resolves or creates the necessary accounts against the **existing** Chart of Accounts tree, presents a Financial Review screen for approval, validates debit/credit balance, and posts to the existing Financial Module. Every step is retained in a full audit trail.

The system **must not** duplicate existing financial infrastructure. All account resolution, account creation, transaction posting, and journal services must reuse the existing `AccountService`, `TransactionService`, and seeded chart of accounts from the NestJS backend.

---

## Glossary

- **Policy_Wizard**: The four-step frontend wizard used to create a policy and its associated operation.
- **Policy**: A `JourneyPolicy` record linked to a `Journey`, enriched with operation type and financial context introduced in Phase 2.
- **Operation**: The business event associated with a policy (e.g., نولون contract, custody movement).
- **Operation_Type**: Classifies the operation: `عقد` (contract) or others.
- **Contract_Type**: Subtype when `Operation_Type = عقد`; currently `نولون`.
- **Transaction_Type**: Further subtype within نولون: `عهدة` (custody) or normal.
- **TRN**: A double-entry journal transaction posted via `POST /api/accounting/transactions`.
- **TRN1**: Revenue recognition transaction applied to every operation.
- **TRN2**: Expense recognition transaction applied when `Operation_Type=عقد` and `Contract_Type=نولون`.
- **TRN3**: Custody movement transaction applied when `Operation_Type=عقد`, `Contract_Type=نولون`, and `Transaction_Type=عهدة`.
- **Account_Resolver**: Backend service responsible for finding or creating an account within the existing tree given a resolution path and entity identifier.
- **Financial_Review_Screen**: Frontend screen displaying the computed journal lines before approval.
- **Approver**: The authenticated user who reviews and approves or rejects the financial actions.
- **Audit_Trail**: The persisted record of policy, operation, parties, financial actions, review, and posting status for each operation.
- **Scan_UI**: A dummy file-upload/camera-capture screen (UI only in Phase 2; no OCR or AI extraction).
- **Client**: A `Client` entity linked to the journey.
- **Supplier**: A `Supplier` entity (type `TRANSPORTATION`) acting as the transport provider.
- **Office**: The branch / مكتب entity associated with the operation.
- **Custody_Supplier**: A `Supplier` entity acting as the source of custody funds.
- **إجمالي_الإيراد**: Total revenue amount entered on the policy operation.
- **إجمالي_المصروفات**: Total expense amount entered on the policy operation.
- **قيمة_العهدة**: Custody amount entered when `Transaction_Type=عهدة`.

---

## Requirements

### Requirement 1: Policy Creation Entry Point

**User Story:** As an office user, I want to choose between scanning a document and manual entry when starting a policy creation workflow, so that the same policy data can be captured regardless of the input method.

#### Acceptance Criteria

1. THE Policy_Wizard SHALL provide two entry paths on its first screen: "Scan / Upload" and "Manual Entry".
2. WHEN the user selects "Scan / Upload", THE Policy_Wizard SHALL display a dummy Scan UI that accepts a file or image capture input and then advances to the Policy Data step with empty fields ready for manual completion.
3. WHEN the user selects "Manual Entry", THE Policy_Wizard SHALL advance directly to the Policy Data step with empty fields.
4. THE Policy_Wizard SHALL produce identical Policy Data fields regardless of which entry path was chosen.
5. IF the user navigates back from any step, THEN THE Policy_Wizard SHALL preserve all previously entered data in that session.

---

### Requirement 2: Step 1 — بيانات الوثيقة / البوليصة

**User Story:** As an office user, I want to enter or confirm all policy document fields in Step 1, so that the policy record is complete before proceeding to the operation step.

#### Acceptance Criteria

1. THE Policy_Wizard SHALL display Step 1 fields: رقم البوليصة (`policyNo`), تاريخ البوليصة (`policyDate`), تاريخ التحميل (`loadingDate`), رقم أرشيف (`archiveNo`), محافظة التسليم (`deliveryGov`), منطقة التسليم (`deliveryArea`), الوزن الكتابي, الوزن الفعلي, وزن التسليم, الكمية المفقودة, مفوض الاستلام (Employee).
2. WHEN the user attempts to advance from Step 1, THE Policy_Wizard SHALL validate that رقم البوليصة and تاريخ البوليصة are provided.
3. IF رقم البوليصة is missing or تاريخ البوليصة is missing, THEN THE Policy_Wizard SHALL display a field-level validation error and SHALL NOT advance to Step 2.

---

### Requirement 3: Step 2 — بيانات العملية

**User Story:** As an office user, I want to capture the operation type and financial amounts in Step 2, so that the system can determine which journal transactions to generate.

#### Acceptance Criteria

1. THE Policy_Wizard SHALL display in Step 2: نوع العملية (Operation_Type), and إجمالي الإيراد.
2. WHEN `Operation_Type = عقد`, THE Policy_Wizard SHALL additionally display: نوع العقد (Contract_Type: نولون), and إجمالي المصروفات.
3. WHEN `Contract_Type = نولون`, THE Policy_Wizard SHALL additionally display: نوع المعاملة (Transaction_Type: عهدة or normal), and — if `Transaction_Type = عهدة` — قيمة العهدة.
4. WHEN the user attempts to advance from Step 2, THE Policy_Wizard SHALL validate that إجمالي الإيراد is a positive number greater than zero.
5. IF `Operation_Type = عقد` and `Contract_Type = نولون`, THEN THE Policy_Wizard SHALL validate that إجمالي المصروفات is a positive number greater than zero before advancing.
6. IF `Transaction_Type = عهدة`, THEN THE Policy_Wizard SHALL validate that قيمة العهدة is a positive number greater than zero before advancing.
7. IF any required Step 2 field is missing or invalid, THEN THE Policy_Wizard SHALL display a field-level validation error and SHALL NOT advance to Step 3.

---

### Requirement 4: Step 3 — الأطراف والبيانات المرتبطة بالعملية

**User Story:** As an office user, I want to capture the parties relevant to the operation in Step 3, so that the correct accounts can be resolved for each party.

#### Acceptance Criteria

1. THE Policy_Wizard SHALL always display the Client selection field (العميل) in Step 3 and SHALL pre-populate it from the journey's existing `client` if available.
2. WHEN `Operation_Type = عقد` and `Contract_Type = نولون`, THE Policy_Wizard SHALL display the Supplier selection field (مورد النقل, type TRANSPORTATION).
3. WHEN `Transaction_Type = عهدة`, THE Policy_Wizard SHALL display: بيانات العهدة — custody source type (من المكتب / من مورد العهدة); IF custody source = من مورد العهدة THEN a Custody_Supplier selector (مورد العهدة).
4. WHEN `Operation_Type = عقد`, THE Policy_Wizard SHALL display بيانات العقد — contract reference fields (رقم العقد, تاريخ العقد, optional).
5. WHEN `Contract_Type = نولون`, THE Policy_Wizard SHALL display بيانات النولون — freight reference fields (رقم النولون, optional).
6. WHEN the user attempts to advance from Step 3, THE Policy_Wizard SHALL validate that العميل is selected.
7. IF `Contract_Type = نولون` and العميل or مورد النقل is not selected, THEN THE Policy_Wizard SHALL display a validation error and SHALL NOT advance to Step 4.

---

### Requirement 5: Step 4 — مراجعة البوليصة

**User Story:** As an office user, I want to review all entered policy data before confirming, so that I can catch errors before the operation is committed.

#### Acceptance Criteria

1. THE Policy_Wizard SHALL display a read-only summary in Step 4 showing all data from Steps 1, 2, and 3 grouped by section.
2. THE Policy_Wizard SHALL provide an "Edit" action for each section that navigates back to the corresponding step while preserving all other entered data.
3. WHEN the user selects "Confirm", THE Policy_Wizard SHALL submit the policy and operation data to the backend and SHALL display a loading state during submission.
4. IF the backend returns an error on confirm, THEN THE Policy_Wizard SHALL display the error message and SHALL remain on Step 4 without clearing data.
5. WHEN the backend responds with success, THE Policy_Wizard SHALL advance the user to the Financial Review Screen.

---

### Requirement 6: Account Resolution

**User Story:** As a system operator, I want the backend to automatically find or create the correct accounts in the existing chart of accounts when an operation is submitted, so that no manual account setup is required and no duplicate accounts are created.

#### Acceptance Criteria

1. THE Account_Resolver SHALL resolve each required account by traversing the existing account tree from the root account matching the path segments.
2. WHEN an intermediate branch account in the required path does not exist, THE Account_Resolver SHALL create it under the correct parent account using `AccountService.save()` with `isLeaf = false`.
3. WHEN the target leaf account for a named entity (e.g., client name, supplier name) does not exist, THE Account_Resolver SHALL create it as a leaf account (`isLeaf = true`) under the correct parent branch using `AccountService.save()`.
4. WHEN an account already exists at the required path and name, THE Account_Resolver SHALL use the existing account and SHALL NOT create a duplicate.
5. THE Account_Resolver SHALL NOT hardcode account IDs; all resolution SHALL use account names and parent-child relationships from the existing tree.
6. THE Account_Resolver SHALL inherit `type` and `normalBalance` from the parent account when creating any new child account, consistent with existing `AccountService.save()` rules.
7. IF the Account_Resolver cannot resolve a required root-level anchor account (e.g., الأصول, الإيرادات), THEN THE Account_Resolver SHALL throw a descriptive error and SHALL NOT proceed to transaction creation.

---

### Requirement 7: TRN 1 — إجمالي الإيراد (All Operations)

**User Story:** As an accountant, I want revenue recognition to be posted automatically for every operation, so that income from in-progress policies is recorded immediately upon confirmation.

#### Acceptance Criteria

1. THE Account_Resolver SHALL resolve (or create) the credit account at path: الإيرادات → إيرادات تحت التنفيذ → إيرادات تحت التنفيذ {اسم العميل/المكتب}.
2. THE Account_Resolver SHALL resolve (or create) the debit account at path: الأصول → الأصول المستخدمة → العملاء تحت التنفيذ → العملاء تحت التنفيذ {اسم العميل}.
3. WHEN the operation is confirmed, THE Financial_Module SHALL create TRN 1 with: one CREDIT line on the revenue account for إجمالي_الإيراد, and one DEBIT line on the asset account for إجمالي_الإيراد.
4. THE Financial_Module SHALL apply TRN 1 to every confirmed operation regardless of Operation_Type.

---

### Requirement 8: TRN 2 — عقد / نولون — إجمالي المصروفات

**User Story:** As an accountant, I want freight expense to be posted automatically when the operation is a نولون contract, so that transport costs are recorded against the correct supplier liability account.

#### Acceptance Criteria

1. THE Account_Resolver SHALL resolve (or create) the debit account at path: المصروفات → مصروفات التشغيل → سيارات عقود النولون.
2. THE Account_Resolver SHALL resolve (or create) the credit account at path: الخصوم → الالتزامات المستخدمة → مورد النقل → مورد النقل {اسم المورد}.
3. WHEN `Operation_Type = عقد` AND `Contract_Type = نولون`, THE Financial_Module SHALL create TRN 2 with: one DEBIT line on the expense account for إجمالي_المصروفات, and one CREDIT line on the supplier liability account for إجمالي_المصروفات.
4. IF `Operation_Type ≠ عقد` OR `Contract_Type ≠ نولون`, THEN THE Financial_Module SHALL NOT create TRN 2.

---

### Requirement 9: TRN 3 — عهدة (Custody Movement)

**User Story:** As an accountant, I want custody fund movements to be posted correctly whether they come from the office or from a custody supplier, so that the balance of the correct accounts reflects the custody transfer.

#### Acceptance Criteria

1. WHEN custody source = من المكتب:
   a. THE Account_Resolver SHALL resolve (or create) the credit account at path: الأصول → الأصول المستخدمة → مدينون وارصده مدينه اخرى → عهدة → عهدة {اسم المكتب}.
   b. THE Account_Resolver SHALL resolve (or create) the debit account at path: الخصوم → الالتزامات المستخدمة → مورد النقل → مورد النقل {اسم المورد}.
   c. THE Financial_Module SHALL create TRN 3 with: one CREDIT line on the office custody account for قيمة_العهدة, and one DEBIT line on the supplier liability account for قيمة_العهدة.
2. WHEN custody source = من مورد العهدة:
   a. THE Account_Resolver SHALL resolve (or create) the credit account at path: الخصوم → الالتزامات المستخدمة → مورد العهدة → مورد العهدة {اسم المورد}.
   b. THE Account_Resolver SHALL resolve (or create) the debit account at path: الخصوم → الالتزامات المستخدمة → مورد النقل → مورد النقل {اسم المورد}.
   c. THE Financial_Module SHALL create TRN 3 with: one CREDIT line on the custody supplier liability account for قيمة_العهدة, and one DEBIT line on the transport supplier liability account for قيمة_العهدة.
3. IF `Operation_Type ≠ عقد` OR `Contract_Type ≠ نولون` OR `Transaction_Type ≠ عهدة`, THEN THE Financial_Module SHALL NOT create TRN 3.

---

### Requirement 10: Financial Action Review

**User Story:** As an approver, I want to see a clear financial review screen showing all proposed journal lines before any posting occurs, so that I can verify and approve or reject the financial impact.

#### Acceptance Criteria

1. WHEN the policy is confirmed in Step 4, THE Financial_Review_Screen SHALL be displayed before any journal transaction is posted.
2. THE Financial_Review_Screen SHALL list each proposed journal line with: اسم الحساب, المسار الكامل للحساب, نوع القيد (مدين/دائن), القيمة, رقم TRN المرتبطة, سبب القيد.
3. THE Financial_Review_Screen SHALL display the total debit sum and total credit sum.
4. THE Financial_Review_Screen SHALL provide "Approve" and "Reject" actions.
5. WHEN the Approver selects "Approve", THE Financial_Module SHALL post all pending TRN lines atomically via `POST /api/accounting/transactions` and SHALL update the operation status to POSTED.
6. WHEN the Approver selects "Reject", THE Financial_Module SHALL discard the pending financial actions and SHALL set the operation status to REJECTED, preserving the policy record.
7. IF the user navigates away from the Financial_Review_Screen without acting, THEN THE Financial_Review_Screen SHALL persist the pending financial actions so the Approver can return to them later.

---

### Requirement 11: Financial Validation

**User Story:** As the system, I want to validate that total debits equal total credits before allowing posting, so that the chart of accounts always remains balanced.

#### Acceptance Criteria

1. BEFORE posting any TRN, THE Financial_Module SHALL compute the sum of all DEBIT lines and the sum of all CREDIT lines across all TRNs for the operation.
2. IF total DEBIT ≠ total CREDIT (within a tolerance of 0.01), THEN THE Financial_Module SHALL prevent posting, SHALL return a descriptive imbalance error message to the Approver, and SHALL NOT create any transaction record.
3. THE Financial_Module SHALL enforce that each individual transaction line amount is ≥ 0.01, consistent with the existing API rule.
4. THE Financial_Module SHALL enforce that each journal line targets a leaf account, consistent with the existing `ensureAccountAcceptsJournalLines` rule.

---

### Requirement 12: Audit Trail

**User Story:** As a compliance officer, I want every operation to have a complete, immutable audit trail, so that the full history of the policy, parties, financial actions, review, and posting is always available for review.

#### Acceptance Criteria

1. THE Audit_Trail SHALL persist for each operation: the linked Policy (رقم البوليصة, تاريخ البوليصة), Operation_Type, Contract_Type (if applicable), Transaction_Type (if applicable), all party names and IDs (Client, Supplier, Office, Custody_Supplier where applicable), all financial action lines (account name, full path, DEBIT/CREDIT, amount, TRN reference, reason), the review event (Approver user, decision status, notes if any, timestamp), and the posting event (status, posted timestamp, transaction reference code).
2. THE Audit_Trail SHALL be append-only; no modification of an existing audit record SHALL be permitted after it is written.
3. WHEN a posting succeeds, THE Audit_Trail SHALL record the transaction `code` returned by the backend and the posted timestamp.
4. WHEN a posting is rejected, THE Audit_Trail SHALL record the rejection reason, the Approver identity, and the rejection timestamp.
5. THE Audit_Trail SHALL be accessible via a dedicated API endpoint for retrieval by authorised users.

---

### Requirement 13: Integration with Existing Financial Module

**User Story:** As a developer, I want Phase 2 to reuse all existing financial infrastructure without duplication, so that the codebase remains coherent and maintenance cost is minimised.

#### Acceptance Criteria

1. THE Financial_Module SHALL use the existing `AccountService.save()` method for all new account creation and SHALL NOT implement a separate account creation path.
2. THE Financial_Module SHALL use the existing `POST /api/accounting/transactions` endpoint (or the underlying `TransactionService.save()`) to post journal entries and SHALL NOT implement a parallel posting mechanism.
3. THE Financial_Module SHALL use `AccountService.ensureAccountAcceptsJournalLines()` to validate each target account before constructing transaction lines.
4. THE Financial_Module SHALL NOT define a new Chart of Accounts root hierarchy; it SHALL anchor all new branches to the existing seeded root accounts (الأصول, الخصوم, الإيرادات, المصروفات).
5. THE Financial_Module SHALL NOT store financial amounts as child accounts; amounts SHALL be stored only as transaction line values.

---

### Requirement 14: i18n — Arabic Primary

**User Story:** As an Arabic-speaking user, I want all UI text, labels, validation messages, and status indicators to appear in Arabic by default, so that the system is fully usable without requiring knowledge of English.

#### Acceptance Criteria

1. THE Policy_Wizard SHALL display all step labels, field labels, placeholders, and action buttons in Arabic when the active locale is `ar`.
2. THE Financial_Review_Screen SHALL display all column headers, status labels, and action buttons in Arabic when the active locale is `ar`.
3. THE Policy_Wizard SHALL use RTL layout direction when the active locale is `ar`.
4. ALL new Arabic strings SHALL be added to `messages/ar/office.json` (wizard and review strings) and SHALL have corresponding English strings in `messages/en/office.json`.
