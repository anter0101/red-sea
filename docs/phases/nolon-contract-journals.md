# Nolon and contract journals

A nolon or contract policy stores the trip expense as what is still owed after the custody already given to the driver. Account paths do not change. A company car stays on TRN1 only.

## Amount

When a nolon or contract policy is saved, `NOLON_FEES` is:

`sheet nolon − custody already given`

The result is not below zero. Custody already given is the sum of this journey’s `CUSTODY` transactions, the same amount the office handed the driver before the trip.

إجمالي المصروفات and TRN2 both read that `NOLON_FEES` line. There is no extra journal.

Example: sheet nolon 50 and custody already given 20 stores `NOLON_FEES` 30. If the custody is 50 or more, the line is 0 and TRN2 is omitted.

## What stays the same

- Asking the main head for money, and paying the driver from the officer’s custody before the trip, is not a trip expense.
- TRN3 office uses that handed-out custody. It credits عهد → {office name} and debits مورد النقل → {supplier name}.
- TRN3 custody-supplier uses its own amount. It credits مورد العهدة → {name} and debits مورد النقل → {supplier name}. A zero amount omits only that pair.
- TRN2 debits سيارات عقود النولون and credits مورد النقل → {supplier name}.
- Apply posts the set once. A second Apply does not duplicate it.
- Journeys that already have a policy are left as stored. The new amount is written the next time a nolon or contract policy is saved.

## Code

- `backend/src/app/modules/journey/journey-revenue.calculator.ts` — `nolonExpenseRemainder`
- `backend/src/app/modules/journey/journey-revenue.service.ts` — writes `NOLON_FEES` on policy save for `NOLON_CAR` and `CONTRACT_CAR`
- `backend/src/app/modules/journey-goods/policy-ledger.service.ts` — TRN2 and both TRN3 pairs, unchanged paths
