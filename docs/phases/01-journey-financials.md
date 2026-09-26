# Phase 1 — Journey financials (expected, actual, expenses)

How the journey table gets **الإيراد المتوقع**, **الإيراد الفعلي**, and the expense columns. This is the shipped behavior. It keeps the two price-sheet styles and the sheet tax amount.

Source of the formulas: [15 — Journey trip values](../product/domains/15-journey-trip-values.md).

Code:

- `backend/src/app/modules/journey/journey-revenue.calculator.ts`
- `backend/src/app/modules/journey/journey-revenue.service.ts`
- List columns: `frontend/src/components/main-table/columns.tsx`

## What the system does

- Sheet kind is `WATANIA` (الوطنية) or `ARISH` (العريش and any other factory).
- Watania unit price `x` = مطالبة + سعر الطن + ضريبة, from the money fields `additionalFees + basePrice + taxPrice` (or the stored `totalPrice`). Tax on the sheet is an amount.
- Arish `x` = the packing-type price on the government/city row (`basePrice`).
- **Expected** = `x × journey.quantity`. Written on `POST /api/journeys/office` when `deliveryAreaId` is sent.
- **Actual** = `x × policy.bookWeight`. Written when the policy is created or updated. The list shows `-` until then.
- The policy save looks up the sheet row once and stores `expectedRevenue` and `actualRevenue`. A later edit of the sheet does not rewrite those stored numbers.
- `vehicleMode` does not change revenue. It chooses which expense lines the policy save posts.
- List profit = `COALESCE(actualRevenue, expectedRevenue) −` the sum of expense transactions.

List columns: الإيراد المتوقع, الإيراد الفعلي, نولون, إجمالي المصروفات, إجمالي الربح.

## Uploaded spec vs this behavior

| Topic | Uploaded spec | Shipped system |
| --- | --- | --- |
| Pricing modes | الوطنية, العريش, and Other Factory as its own sheet | `WATANIA` and `ARISH`. Other factories use the Arish columns |
| Watania tax | `pricePerTon ×` client tax percentage | Sheet amount `taxPrice` |
| Load | One car load | `quantity` for expected, `bookWeight` for actual |
| Expenses | NOLON, CONTRACT, and OWN_CAR are separate totals | NOLON and CONTRACT both post sheet `nolonPrice` once. A company car posts salary lines. Fuel, tolls, and مطالبة × load are not auto-posted |
| Stored snapshot | `pricePerTon`, `motalaba`, `taxAmount`, expense amounts, profit | `expectedRevenue` and `actualRevenue` only |

## Office create, then policy

`POST /api/journeys/office`. The body is built by `buildOfficeJourneyPayload` in `frontend/src/features/office/types/office-journey-schema.ts`.

Revenue inputs: `clientId`, `quantity`, `packingType`, and optional `deliveryAreaId`.

Shared Watania sheet for area 15:

- مطالبة `100`
- سعر الطن `500`
- ضريبة `70`
- `x = 670`
- `nolonPrice = 8000` (expense, outside `x`)
- `quantity = 20`
- policy `bookWeight = 18.5`

Revenue is the same for all three types.

After office create with `deliveryAreaId`:

- الإيراد المتوقع = `670 × 20` = **13400**
- الإيراد الفعلي = **-**
- expenses = **0**
- الربح = **13400**

After policy save:

- الإيراد المتوقع stays **13400**
- الإيراد الفعلي = `670 × 18.5` = **12395**

Expense lines are posted on that policy save, for the selected type only. The same `nolonPrice` is posted once.

### 1. NOLON_CAR — driver one-time pay

```json
{
  "vehicleMode": "NOLON_CAR",
  "clientId": 2,
  "packingType": "BAGGED",
  "quantity": 20,
  "deliveryAreaId": 15,
  "driverId": 1,
  "carId": 3,
  "trailerId": 1,
  "direction": "Giza",
  "sellingOrderNo": "SO-003",
  "receivedCompany": "Factory A"
}
```

Policy posts `NOLON_FEES` = sheet `nolonPrice` = **8000**. Driver salary does not add a second nolon line.

- نولون = **8000**
- إجمالي المصروفات = **8000**
- إجمالي الربح = `12395 − 8000` = **4395**

### 2. CONTRACT_CAR — same sheet nolon

```json
{
  "vehicleMode": "CONTRACT_CAR",
  "clientId": 2,
  "packingType": "BAGGED",
  "quantity": 20,
  "deliveryAreaId": 15,
  "driverId": 1,
  "carId": 2,
  "trailerId": 2,
  "direction": "Alexandria",
  "sellingOrderNo": "SO-002",
  "receivedCompany": "Factory A"
}
```

Policy posts `NOLON_FEES` = **8000**. Contract uses that sheet nolon. There is no separate contract price.

- نولون = **8000**
- إجمالي المصروفات = **8000**
- إجمالي الربح = **4395**

### 3. COMPANY_CAR — salary lines

```json
{
  "vehicleMode": "COMPANY_CAR",
  "clientId": 2,
  "packingType": "BAGGED",
  "quantity": 20,
  "deliveryAreaId": 15,
  "driverId": 1,
  "carId": 1,
  "trailerId": 1,
  "direction": "Giza",
  "cementGrade": "42.5",
  "sellingOrderNo": "SO-001",
  "receivedCompany": "Factory A"
}
```

Driver salary scheme شهري (`MONTHLY`), `dailyWorkPrice` = **200**. The policy does not post `NOLON_FEES`. It posts:

- `DRIVER_DAILY_WORK` = **200**
- `DRIVER_COMMISSION` = sheet `nolonPrice` = **8000**

Fuel, tolls, and مطالبة × load stay off this save.

- نولون = **8000** (the commission line; the column sums nolon fees, driver commission, and assistant commission)
- إجمالي المصروفات = `200 + 8000` = **8200**
- إجمالي الربح = `12395 − 8200` = **4195**

كومسيون (`COMMISSION`) posts the same shape: daily work plus sheet nolon. نولون (`NOLON_PERCENT`) posts only the **8000** commission line.

The same three payloads with no `deliveryAreaId` leave both revenue cells as **-** and post no expenses until the policy has an area and a book weight. That save writes expected from `quantity`, actual from `bookWeight`, and the type’s expenses above.

## Arish sheet

Arish (and any other factory on the Arish sheet) changes only `x`. Packing `BAGGED`, cell price `750`, `quantity` 20:

- Expected = **15000**
- Policy `bookWeight` 20 → actual = **15000**

Expense lines still follow `vehicleMode`, using that row’s `nolonPrice`.
