# Phase 3 — Client invoices

Build spec. Phase 1 stays the calculator: [Phase 1 — Journey financials](01-journey-financials.md). Phase 2 stays the trip ledger: [Phase 2 — Policy review and ledger posting](02-policy-review-and-posting.md). This phase closes the trip: it moves a client's revenue out of تحت التنفيذ, records the taxes, and leaves the client owing the net.

## What to build

1. Two new chart parents and two system keys on accounts that already exist. Each client grows from two leaves to four.
2. An `invoices` row and one `invoice_journeys` row per selected journey. A journey can sit on one invoice only.
3. On the trips list, an admin ticks journeys of one client that already have a posted TRN1. The dialog chooses tax on or off and the two percentages. Issue posts one journal.
4. The invoice list and a printable invoice show the total, the VAT, the withholding, the net, and the journeys.

There is no Reject button. An admin corrects a posted invoice later. A company car and a nolon car use the same invoice. The vehicle mode does not change these lines.

## Trips screen

The trips tab is the only place an invoice starts. The admin filters to one client, then ticks the journeys.

A journey can be ticked when its status is **تم تحصيل البوليصه**, it belongs to that client, its TRN1 is already posted, and it is not on an invoice. The grid can hide journeys that are already billed. The invoice number column shows the invoice code once one exists.

The bar above the table shows how many journeys are ticked and **إنشاء فاتورة**. Journeys of two clients disable the button. The dialog then has:

- **Tax off.** VAT is zero. The VAT line is omitted.
- **Tax on.** VAT percentage, default 14.
- **Withholding.** Percentage, default 3. Used in both modes.

Issue is the only action. Saving does not happen on the trips list until Issue. Phase 1 numbers and the Phase 2 TRN lines stay as they were.

## Names

| Spec word | Account |
| --- | --- |
| `3ARE4` | The client. العريش is **مصنع اسمنت العريش**. الوطنية is **مصنع وطنيه**. |
| revenue under progress | **ايرادات تحت التنفيذ** |
| revenue done already | **ايرادات تم تنفيذها** |
| clients under progress | **العملاء تحت التنفيذ** |
| clients | **عملاء** |
| madene warsda madina ao5ra | **مدينين وارصده مدينه اخرى** |
| tax el manb3 | **ضرائب منبع** |
| da2nen warsda da2na ao5ra | **دائنين وارصده دائنه اخرى** |
| add tax | **ضريبة القيمة المضافة** |

“Assets usable” is **الاصول المتداوله**. “Usable liabilities” is **الالتزامات المتداوله**. “Revenue” is **الإيرادات**. Those are not extra nodes. The amount is the money on the line, not another child account.

## Account lookup

`accounts.code` is a generated number. It changes between databases, so it is not the lookup. `accounts.name` is the label on screen. Search does not use the label, so spelling and a later rename do not matter.

Phase 2 already stores `system_key`, `actor_type`, and `actor_id`. This phase adds four keys:

- `CLIENTS` — existing **عملاء**. It stops being a leaf.
- `REVENUE_DONE` — new **ايرادات تم تنفيذها**, under **الإيرادات**. Not a leaf.
- `WITHHOLDING_TAX` — existing **ضرائب منبع**. One leaf, no actor. Found by `system_key` alone.
- `VAT_PAYABLE` — new **ضريبة القيمة المضافة**, under **دائنين وارصده دائنه اخرى**. One leaf, no actor. Found by `system_key` alone.

A client leaf is found by parent `system_key` + `actor_type = CLIENT` + `actor_id`. **ضرائب منبع** and **ضريبة القيمة المضافة** have no actor.

Example after client 1 exists:

| name | system_key | actor_type | actor_id | parent |
| --- | --- | --- | --- | --- |
| عملاء | CLIENTS | | | الاصول المتداوله |
| مصنع اسمنت العريش | | CLIENT | 1 | عملاء |
| ايرادات تم تنفيذها | REVENUE_DONE | | | الإيرادات |
| ايرادات تم تنفيذها مصنع اسمنت العريش | | CLIENT | 1 | ايرادات تم تنفيذها |
| ضرائب منبع | WITHHOLDING_TAX | | | مدينين وارصده مدينه اخرى |
| ضريبة القيمة المضافة | VAT_PAYABLE | | | دائنين وارصده دائنه اخرى |

## Auto leaves

`createClientAccounts` find-or-creates four leaves, keyed by client id. Issue looks them up. If a leaf is still missing, find-or-create it with the same key and actor id.

- `{name}` under `CLIENTS_IN_PROGRESS`
- `ايرادات تحت التنفيذ {name}` under `REVENUE_IN_PROGRESS`
- `{name}` under `CLIENTS`
- `ايرادات تم تنفيذها {name}` under `REVENUE_DONE`

All four use `actor_type = CLIENT` and the client id. The visible name is copied at create time. Renaming the client does not rename the leaf and does not change `actor_id`.

Backfill the two new leaves for every client that already exists. The two Phase 2 leaves stay as they are.

## Ledger lines

One transaction. It is not a set of pairs. The idempotency key is `invoice:{invoiceId}`. A second Issue does not insert another copy.

`T` is the sum of the TRN1 amounts already posted for the selected journeys. That posted amount is snapshotted on `invoice_journeys`. It is not a fresh read of the journey. That is what makes **العملاء تحت التنفيذ** and **ايرادات تحت التنفيذ** clear by exactly the amount Phase 2 put there.

`V` is the VAT and `W` is the withholding. Each is rounded to two decimals first. The net is `T + V − W`, taken from that rounded pair, so the journal stays balanced. A line whose amount is zero is not inserted. Tax off forces `V` to zero and omits the VAT line.

```text
Debit   REVENUE_IN_PROGRESS + client id     T
Credit  REVENUE_DONE + client id            T
Debit   WITHHOLDING_TAX                     W
Credit  CLIENTS_IN_PROGRESS + client id     T
Debit   CLIENTS + client id                 T + V − W
Credit  VAT_PAYABLE                         V
```

Debits are `T + W + (T + V − W)`. Credits are `T + T + V`. They match with tax on and with tax off.

## Review

The dialog lists the totals and the lines above with the Arabic path, debit or credit, and amount. The only action is Issue. There is no Reject. A wrong posted invoice is corrected later by an admin. Journey numbers written at policy save stay as they are. After Issue the journey status is **تم اصدار فاتوره**.

## Worked case

Client **مصنع وطنيه** (`actor_id = 2`). Phase 2 already posted TRN1 for **12,395**. Withholding is 3. VAT, when tax is on, is 14.

`W` = `12,395 × 3%` = **371.85**

Tax off. `V` = **0**. Net = `12,395 − 371.85` = **12,023.15**. Five lines:

- Debit **ايرادات تحت التنفيذ → ايرادات تحت التنفيذ مصنع وطنيه** 12,395
- Credit **ايرادات تم تنفيذها → ايرادات تم تنفيذها مصنع وطنيه** 12,395
- Debit **ضرائب منبع** 371.85
- Credit **العملاء تحت التنفيذ → مصنع وطنيه** 12,395
- Debit **عملاء → مصنع وطنيه** 12,023.15

Tax on. `V` = `12,395 × 14%` = **1,735.30**. Net = `12,395 + 1,735.30 − 371.85` = **13,758.45**. The five lines above, with the client debit at 13,758.45, plus:

- Credit **ضريبة القيمة المضافة** 1,735.30

After either invoice, the Phase 2 debit on **العملاء تحت التنفيذ** and the Phase 2 credit on **ايرادات تحت التنفيذ** for this client are cleared by 12,395. The journey reads **تم اصدار فاتوره** and cannot go on a second invoice.

## Acceptance

- [ ] عملاء and ضرائب منبع store `CLIENTS` and `WITHHOLDING_TAX`. ايرادات تم تنفيذها and ضريبة القيمة المضافة exist, on a seeded database and on one that only ran migrations.
- [ ] Every client has four leaves: in-progress client, in-progress revenue, client, and done revenue. Lookup never uses the Arabic name or `accounts.code`.
- [ ] Ticking journeys of two clients blocks إنشاء فاتورة.
- [ ] A journey with no posted TRN1 is refused. An empty selection is refused. A percentage outside 0 to 100 is refused.
- [ ] Tax off posts five lines and balances. Tax on posts six and balances. A zero amount omits only that line.
- [ ] After Issue, العملاء تحت التنفيذ and ايرادات تحت التنفيذ for that client are reduced by exactly the TRN1 amounts.
- [ ] The journeys read تم اصدار فاتوره and cannot be put on a second invoice. A retry does not post the journal twice.
- [ ] The invoice list and the printable invoice show the total, the VAT, the withholding, the net, and the journeys.
