# Accounting module — backend changes (frontend integration guide)

This document describes backend behavior and API changes relevant to **Next.js / frontend** developers working on accounting screens (chart of accounts, journals, financial reports). It complements Swagger (`/api` docs if enabled) and the Postman collection in the repo.

**Base URL (local default):** `http://localhost:9090` (unless `PORT` is overridden).

**Authentication:** All accounting routes require `Authorization: Bearer <JWT>` except where noted. Obtain a token via `POST /api/auth/login` with JSON `{ "email", "password" }`; response includes `token` and `user`.

---

## 1. What changed (summary)

| Area | Change |
|------|--------|
| **Accounts** | Stricter validation on **root** type ↔ normal balance, **leaf-only** opening balance via `PUT .../opening-balance`, **non-zero opening balance on new child** blocked when the parent branch already has **posted** transactions. |
| **Transactions** | After a transaction is **saved** with lines, affected accounts get `openingBalanceLocked = true` (opening balance can no longer be edited via API if other rules also apply). |
| **Transaction lines (HTTP)** | `TransactionLineController` is now **registered** on `TransactionLineModule`. Endpoints under `/api/accounting/transaction-lines` return **200** instead of **404** (requires server restart after deploy). |
| **DTO validation** | `CreateTransactionLineDTO.amount` must be **≥ 0.01** (strictly positive). |
| **Reports (trial balance)** | For **non-leaf** (parent) accounts, **`openingBalance` in trial balance rows ignores the stored DB column**; rollup uses children only (see §6). |

---

## 2. Business rules the UI should reflect

These are enforced server-side; aligning forms and messaging avoids confusing **400/403** responses.

### 2.1 Account types and normal balance (root accounts)

- **DEBIT-normal types:** `ASSET`, `EXPENSE`, `CASH`
- **CREDIT-normal types:** `LIABILITY`, `EQUITY`, `REVENUE`

Creating a **root** account with a mismatched pair returns **400**, for example:

- `For account type "EQUITY", normalBalance must be CREDIT.`

Child accounts **inherit** `normalBalance` (and usually `type`) from the parent; **CASH** is allowed under **ASSET** only.

### 2.2 Leaf vs parent

- Only **`isLeaf === true`** accounts (and with no children in practice) may appear on **journal lines** and receive **manual opening balance** via `PUT .../opening-balance`.
- **Parent** accounts (`isLeaf === false`) must not be selectable as posting targets in the journal UI (backend rejects non-leaf postings).

### 2.3 Opening balance — create (`POST /api/accounting/accounts`)

- Optional `openingBalance` on create: if sent (including `0`), backend may **lock** it immediately per mapper/service rules; treat as “set at create”.
- If creating under a **parent** (`parentAccountId` set) with **non-zero** `openingBalance`: if **any posted transaction** exists on **that parent or any account in its subtree**, the API returns **400**:

  `A non-zero opening balance is not allowed under this account because the branch already has posted transactions. Create the account with opening balance 0.`

**UI:** When adding a leaf under a branch that already has activity, **default opening balance to 0** and disable non-zero entry unless product rules allow exceptions.

### 2.4 Opening balance — set endpoint (`PUT /api/accounting/accounts/:id/opening-balance`)

Body: `{ "amount": number }`.

Allowed only when **all** hold:

- Account is **not** `isSystem`
- Account is a **leaf** (and has no children)
- `openingBalanceLocked === false`
- Current stored opening balance is **~0**
- **No** transaction lines exist for this account

Typical errors:

| HTTP | Message (or pattern) |
|------|------------------------|
| 403 | `Opening balance for system chart accounts...` |
| 400 | `Opening balance can only be set on leaf accounts.` |
| 400 | `Opening balance has already been set for this account and cannot be changed.` |
| 400 | `Opening balance can only be set when the current opening balance is zero.` |
| 400 | `Opening balance cannot be changed while the account has transaction lines.` |

### 2.5 After posting journal activity

Saving a **transaction** that includes lines sets **`openingBalanceLocked: true`** on every referenced **account** (by line). The UI should **hide** or **disable** opening-balance editors when `openingBalanceLocked` is true or when the account already has lines (defense in depth).

---

## 3. HTTP API reference (accounting)

### 3.1 Accounts — ` /api/accounting/accounts`

| Method | Path | Role | Notes |
|--------|------|------|--------|
| GET | `/` | ADMIN, USER | Query: `page`, `pageSize`, `search`, `type`, `isLeaf`, `parentAccountId` (use string `"null"` for roots if needed), `includeParent`, dates. Pagination headers: `X-Total-Count`, `Current-Page`, `Has-Next-Page`. |
| GET | `/:id` | ADMIN, USER | Single account; includes `parentAccount` / `childAccounts` when mapped. |
| POST | `/` | ADMIN | `CreateAccountDTO`: root requires `type` + `normalBalance`; child uses `parentAccountId`, optional `type`, optional `openingBalance`. |
| PUT | `/:id` | ADMIN | Partial update; no conflicting `normalBalance` for roots via update (immutable per API rules). |
| PUT | `/:id/opening-balance` | ADMIN | Body `{ "amount" }` — see §2.4. |
| DELETE | `/:id` | ADMIN | Fails if children or transaction lines exist, or if system account. |

**Response fields to use in UI:** `id`, `code`, `name`, `type`, `normalBalance`, `isLeaf`, `isSystem`, `openingBalance`, `openingBalanceLocked`, `parentAccount`, `childAccounts`, audit timestamps.

Decimal fields may arrive as **strings** from JSON serialization in some cases; normalize with `Number()` or decimal library if you do math client-side.

### 3.2 Transactions — `/api/accounting/transactions`

| Method | Path | Role |
|--------|------|------|
| GET | `/` | ADMIN, USER |
| GET | `/:id` | ADMIN, USER |
| POST | `/` | ADMIN |
| PUT | `/:id` | ADMIN |
| DELETE | `/:id` | ADMIN |

**Create/update body (create):** `date`, `description`, `status` (`DRAFT` \| `POSTED` \| `CANCELLED`), `transactionLines[]` with:

- `accountId` (integer)
- `entryType`: `DEBIT` \| `CREDIT`
- `amount`: **must be ≥ 0.01**
- `description` (optional)

**Server rules:**

- At least **two** lines; **sum of debits = sum of credits** (within tolerance).
- **Each `accountId` unique** per transaction.
- Each account must be a **leaf** that accepts postings (`ensureAccountAcceptsJournalLines`).

**Amount validation error example (400):** `Amount must be greater than zero` (class-validator on `CreateTransactionLineDTO`).

### 3.3 Transaction lines — `/api/accounting/transaction-lines`

Previously **not mounted**; now available after backend fix.

| Method | Path | Role |
|--------|------|------|
| GET | `/` | ADMIN, USER |
| GET | `/:id` | ADMIN, USER |
| POST | `/` | ADMIN |
| PUT | `/:id` | ADMIN |
| DELETE | `/:id` | ADMIN |

**Note:** Normal workflows create lines **with** `POST /api/accounting/transactions` (atomic). Standalone line CRUD may bypass higher-level journal rules — use only if product requires it.

### 3.4 Financial reports — `/api/accounting/reports`

| GET path | Purpose |
|----------|---------|
| `/ledger` | Query: `accountId`, `dateFrom`, `dateTo`, `page`, `pageSize`. Paginated; headers for totals. |
| `/trial-balance` | Query: `dateFrom`, `dateTo`, `flat` (`true` = flat lines; `false` = tree). |
| `/income-statement` | Query: `dateFrom`, `dateTo`, `flat`. |
| `/balance-sheet` | Query: `asOf`, `flat`, `comparePriorYear`. |

All report routes: **ADMIN** and **USER**.

---

## 4. Trial balance display change (parents)

For **`flat=false` (tree)** and derived rollups:

- **Leaf** accounts: opening column uses stored opening + prior-period movement as before.
- **Non-leaf (parent)** accounts: stored `opening_balance` on the parent row is **not** used for that row’s opening; parent totals **roll up from children**.

**UI:** Do not show “manual opening balance” editors for parent accounts; do not assume `openingBalance` on a parent in trial balance equals the DB column for that id.

---

## 5. Postman and local environment

- **Collection:** `Red Sea.postman_collection.json` (folder **`accounting`**).
- **Subfolder `🔒 Validation — server rules (accounting)`:** requests for **A2**, **N2**, opening-balance rules (**O/V**), **line amount Min (T2)**, and OB lock after POST transaction. Collection variables: `validationParentWithPosted`, `validationParentNonLeaf`, `leafAccountWithJournalLines`, `accountWithNonZeroOpening`, `validationDebitAccountId`, `validationCreditAccountId` (adjust to your DB).
- **Environment:** `postman/Red-Sea.local.postman_environment.json` — set `baseUrl` to `http://localhost:9090` (or your port).
- Run **Login** first; set **`token`** on the environment if requests use `{{token}}`.

---

## 6. Frontend checklist

- [ ] Root account form: **type** and **normalBalance** pairs match §2.1.
- [ ] Journal line account picker: only **`isLeaf`** postable accounts; exclude parents.
- [ ] Line **amount** input: minimum **0.01**; show validation before submit.
- [ ] Opening balance: respect **`openingBalanceLocked`**; hide **PUT opening-balance** when locked, system account, non-leaf, or when lines exist (infer from errors if needed).
- [ ] New child under active branch: offer **0** opening balance when backend rejects non-zero (§2.3).
- [ ] Map **400/403** messages from `message` (Nest often returns `{ statusCode, message }` or `message[]` for validation).
- [ ] Trial balance tree: parent **opening** is rollup-only, not manual DB field.

---

## 7. Related files (backend)

| Topic | Location |
|-------|----------|
| Account rules | `src/app/modules/account/account.service.ts` |
| Transaction save + lock | `src/app/modules/transaction/transaction.service.ts` |
| Line amount min | `src/app/modules/transaction-line/dtos/create-transaction-line.dto.ts` |
| Trial balance parent opening | `src/app/modules/financial-stats/services/trial-balance.service.ts` (`lineForAccount`) |
| Transaction line module | `src/app/modules/transaction-line/transaction-line.module.ts` |

---

*Last updated to match backend accounting behavior as of the integration work documented above.*
