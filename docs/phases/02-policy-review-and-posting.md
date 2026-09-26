# Phase 2 — Policy review and ledger posting

Build spec. Phase 1 stays the calculator: [Phase 1 — Journey financials](01-journey-financials.md). This phase adds the review screen and the ledger lines.

## What to build

1. Internal account keys, then auto-create the four actor leaves.
2. Link a transport supplier to the branch of the employee who creates journeys.
3. On policy save, keep the Phase 1 journey update. Show the TRN lines. Post them only when the user presses Apply.
4. Upload stays an icon. Manual entry is the form that fills the review.

There is no Reject button. An admin corrects a posted set later. Own cars get TRN1 only.

## Office form

Create Policy on the office screens has two options:

- **Upload.** Icon only. File parsing comes later and must return the same fields from AI OCR.
- **Manual.** The fields that feed the review: client, book weight, vehicle mode, transport supplier, and the custody amounts already known on the journey.

Both options end on the same review. Saving the policy runs Phase 1: **الإيراد الفعلي** and the expense columns update, and the journey state updates. The ledger waits for Apply.

## Names

| Spec word | Account |
| --- | --- |
| `3ARE4` | The client. العريش is **مصنع اسمنت العريش**. الوطنية is **مصنع وطنيه**. |
| clients under progress | **العملاء تحت التنفيذ** |
| revenue under progress | **ايرادات تحت التنفيذ** |
| nolon contract cars | **سيارات عقود النولون** |
| na2l supplier | **مورد النقل** |
| madene warsda madina ao5ra | **مدينين وارصده مدينه اخرى** |
| custody / office | **عهد → {branch name}** |
| custody supplier | **مورد العهدة** |

“Assets usable” is **الاصول المتداوله**. “Usable liabilities” is **الالتزامات المتداوله**. Those are not extra nodes. The amount is the money on the line, not another child account.

## Account lookup

`accounts.code` is a generated number. It changes between databases, so it is not the lookup. `accounts.name` is the label on screen. Search does not use the label, so spelling and a later rename do not matter.

Add on `accounts`:

- `system_key` — set on seeded parents only
- `actor_type` — `CLIENT`, `BRANCH`, `TRANSPORT_SUPPLIER`, `CUSTODY_SUPPLIER`
- `actor_id` — numeric id of that row

Parent keys:

- `CLIENTS_IN_PROGRESS`
- `REVENUE_IN_PROGRESS`
- `NOLON_CONTRACT_CARS`
- `TRANSPORT_SUPPLIER`
- `CUSTODY`
- `CUSTODY_SUPPLIER`

A leaf is found by parent `system_key` + `actor_type` + `actor_id`. **سيارات عقود النولون** is found by `NOLON_CONTRACT_CARS` alone.

Example after the two seeded clients exist:

| id | name | system_key | actor_type | actor_id | parent |
| --- | --- | --- | --- | --- | --- |
| 10 | العملاء تحت التنفيذ | CLIENTS_IN_PROGRESS | | | |
| 11 | ايرادات تحت التنفيذ | REVENUE_IN_PROGRESS | | | |
| 20 | مصنع اسمنت العريش | | CLIENT | 1 | 10 |
| 21 | ايرادات تحت التنفيذ مصنع اسمنت العريش | | CLIENT | 1 | 11 |
| 22 | مصنع وطنيه | | CLIENT | 2 | 10 |
| 23 | ايرادات تحت التنفيذ مصنع وطنيه | | CLIENT | 2 | 11 |

A Watania journey for client 2 debits row 22 and credits row 23.

## Auto leaves

Create the leaf when the actor is saved. Apply only looks it up. If the leaf is still missing, find-or-create it with the same key and actor id.

- **Client.** `{name}` under `CLIENTS_IN_PROGRESS`, and `ايرادات تحت التنفيذ {name}` under `REVENUE_IN_PROGRESS`. Both rows use `actor_type = CLIENT` and the client id. This replaces the current name lookup in `AccountService.createClientAccounts`.
- **Branch.** `{branch name}` under `CUSTODY`, `actor_type = BRANCH`.
- **Transport supplier.** Type `TRANSPORTATION`. `{name}` under `TRANSPORT_SUPPLIER`, `actor_type = TRANSPORT_SUPPLIER`. The supplier row stores `branch_id`.
- **Custody supplier.** Add supplier type `CUSTODY`. `{name}` under `CUSTODY_SUPPLIER`, `actor_type = CUSTODY_SUPPLIER`. Goods and services suppliers get no leaf.

The visible name is copied at create time. Renaming the actor does not rename the leaf and does not change `actor_id`.

Backfill rows that already exist: the two clients, every branch, and every transport supplier.

## Branch and the employee

`employee.branch` is the office. The employee on `POST /api/journeys/office` is the person who creates the journey. TRN2 and TRN3 use a transport supplier whose `branch_id` is that branch. The office credit is the `CUSTODY` leaf of that same branch.

## Ledger lines

Each line balances. Apply posts the set in one transaction. The idempotency key is policy id + journey id + line kind. A second Apply does not insert another copy.

**TRN1 — every journey, including an own car.** Amount = Phase 1 actual revenue, or expected revenue when actual is empty.

```text
Debit   CLIENTS_IN_PROGRESS  + client id
Credit  REVENUE_IN_PROGRESS  + client id
```

**TRN2 — nolon and contract.** Amount = the Phase 1 nolon expense (sheet `nolonPrice`). An own car skips this line.

```text
Debit   NOLON_CONTRACT_CARS
Credit  TRANSPORT_SUPPLIER + transport supplier id
```

**TRN3 — nolon and contract.** The employee does not choose a source. Post each pair that has an amount above zero.

Office amount = `journey.custodyAmount`.

```text
Debit   TRANSPORT_SUPPLIER + transport supplier id
Credit  CUSTODY + branch id
```

Custody-supplier amount = the custody-supplier amount stored for that journey. Add the column if it is not there. Zero omits the pair.

```text
Debit   TRANSPORT_SUPPLIER + transport supplier id
Credit  CUSTODY_SUPPLIER + custody supplier id
```

## Review

The screen lists the lines above with the Arabic path, debit, credit, and amount. The only action is Apply. There is no Reject. A wrong posted set is corrected later by an admin. Journey numbers written at policy save stay as they are.

## Worked case

Client **مصنع وطنيه** (`actor_id = 2`), Watania, quantity 20, unit price 670, sheet nolon 8,000, book weight 18.5, nolon car, transport supplier **مورد النيل** on the employee’s branch.

Journey create shows expected **13,400**, actual **-**, profit **13,400**. No ledger lines.

Policy save updates the journey:

- Actual = `670 × 18.5` = **12,395**
- Nolon = **8,000**
- Profit = **4,395**

Review, before Apply:

- TRN1 debit **العملاء تحت التنفيذ → مصنع وطنيه** 12,395. Credit **ايرادات تحت التنفيذ → ايرادات تحت التنفيذ مصنع وطنيه** 12,395. Stored as client id 2.
- TRN2 debit **سيارات عقود النولون** 8,000. Credit **مورد النقل → مورد النيل** 8,000.
- TRN3 office, when `custodyAmount` is above zero: debit **مورد النيل**, credit **عهد → {branch name}**.
- TRN3 custody supplier, when that amount is above zero: debit **مورد النيل**, credit **مورد العهدة → {name}**.

An own car on the same client shows TRN1 only.

## Acceptance

- [ ] Seeded parents store the six `system_key` values.
- [ ] Client, branch, transport supplier, and custody supplier each create their leaf on save, keyed by actor id.
- [ ] Lookup never uses the Arabic name or `accounts.code`.
- [ ] A transport supplier belongs to a branch, and the journey can use only a supplier from the creating employee’s branch.
- [ ] Policy save still updates Phase 1 journey numbers.
- [ ] Upload is an icon. Manual entry reaches the review.
- [ ] The review shows TRN1 for every journey, TRN2 and TRN3 only for nolon and contract, and omits a TRN3 pair whose amount is zero.
- [ ] Apply posts the set once, together. A retry does not duplicate it.
- [ ] The screen has no Reject button.
