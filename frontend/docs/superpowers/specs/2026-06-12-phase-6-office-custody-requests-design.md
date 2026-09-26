# Phase 6 — Office Flow, Custody & Office Requests — Design

**Date:** 2026-06-12
**Status:** Approved (pending written-spec review)
**Source of truth:** [`phase-6-api.md`](../../../phase-6-api.md) (backend API), Figma RedSea System V1 nodes `1134-14954`, `1134-15180`, `1134-15405`, `1134-15855`.

## 1. Overview

Phase 6 adds three backend modules to the RedSea frontend. This spec covers all three:

1. **Office create-journey flow** (employee-facing) — the only part with Figma designs. Landing → vehicle-mode choice → journey creation form, wired to `POST /api/journeys/office`.
2. **Custody module** (عُهدة) — admin CRUD over custody records.
3. **Office Requests module** — employee-created requests on a journey, approved/rejected by admin.

Implementation follows the existing feature conventions (`src/features/{feature}/{api,components,hooks,types,enums}`), the base TanStack-Query hooks (`useGetPaginated`, `useGetAll`, `useCreate`, `useUpdate`, `useDelete`), and the shared UI primitives (`DataTable`, `EntitiesToolbar`, `TableFilters`, `TablePagination`, `SelectWithActions`, `BreadCrumb`).

### Decisions locked during brainstorming

| Decision                               | Choice                                                                                   |
| -------------------------------------- | ---------------------------------------------------------------------------------------- |
| Scope                                  | All of Phase 6 (3 modules)                                                               |
| NOLON assets                           | Select existing **and** inline-create (driver/car/trailer on the fly)                    |
| Vehicle modes                          | Three: `NOLON_CAR`, `CONTRACT_CAR`, `COMPANY_CAR` (add a 3rd card beyond the 2 in Figma) |
| Custody & Office-Request UI (no Figma) | Reuse existing accounting-style `DataTable` + form-dialog patterns                       |
| Feature organization                   | Option A — new `office` feature + sibling `custody` and `office-requests` features       |

## 2. Navigation, routing & roles

### Side menu

Add an `office` entry (briefcase icon from the design) to `sideMenuIcons` in [`src/utils/icons.ts`](../../../src/utils/icons.ts), with sub-items:

```
المكتب (/office)
  ├─ اصدار تفويض / تسجيل بوليصة     → /office (landing)
  ├─ العُهد (custody)               → /custody
  └─ طلبات المكتب (office-requests)  → /office-requests
```

### Routes (under `src/app/[locale]/(loggedIn)/`)

- `/office` — landing, 2 cards (`تسجيل بوليصة`, `اصدار تفويض`)
- `/office/issue-delegation` — vehicle-mode choice, 3 cards (`سيارات بالناولون`, `سيارات تعاقد`, `سيارات الشركة`)
- `/office/issue-delegation/[mode]` — create form, `mode ∈ nolon-car | contract-car | company-car`
- `/custody` — list; `/custody/[custodyId]` — detail
- `/office-requests` — list

Each route `page.tsx` is a thin server component rendering the feature client component (mirrors [`trips/create-delegate/page.tsx`](<../../../src/app/[locale]/(loggedIn)/trips/create-delegate/page.tsx>)).

### Roles

`session.user.role` is already populated by the auth callbacks ([`auth.config.ts`](../../../src/app/[locale]/authentication/auth.config.ts)). Gate **UI affordances** by role; the backend enforces the hard rules:

- Office create flow — `EMPLOYEE`
- Custody create/edit/delete, Office-request approve/reject/delete — `ADMIN`
- `GET /custodies` auto-scopes to the caller's own records for `EMPLOYEE` (read-only list for them).

## 3. `office` feature — create-journey flow

### Folder layout

```
src/features/office/
  api/        create-office-journey.ts        # POST /api/journeys/office
  components/ office-landing.tsx
              vehicle-mode-selection.tsx
              office-journey-form.tsx
              choice-card.tsx
              inline-create/driver-inline-dialog.tsx
              inline-create/car-inline-dialog.tsx
              inline-create/trailer-inline-dialog.tsx
  hooks/      use-office-journey-form.ts
  types/      office-journey-schema.ts
  enums/      vehicle-mode.ts
```

### Screens

- **`office-landing.tsx`** — two `ChoiceCard`s. `اصدار تفويض` → `/office/issue-delegation`. `تسجيل بوليصة` → links to the **existing** policy flow (not a new Phase-6 endpoint; link-out only).
- **`vehicle-mode-selection.tsx`** — three `ChoiceCard`s → `/office/issue-delegation/{mode}`.
- **`choice-card.tsx`** — large white card, centered Arabic label, hover-lift. Reused by both screens.
- Both use the shared [`BreadCrumb`](../../../src/components/common/bread-crumb.tsx) (`اسم المكتب • اصدار تفويض`).

### The form (`office-journey-form.tsx`)

One component driven by `vehicleMode`. Fields rendered conditionally:

| Field (Arabic) | API field           | NOLON                                | Contract / Company         |
| -------------- | ------------------- | ------------------------------------ | -------------------------- |
| السيارة        | `car`               | `SelectWithActions` + inline "+ New" | plain select, existing IDs |
| المقطورة       | `trailer`           | `SelectWithActions` + inline "+ New" | hidden                     |
| السائق         | `driver`            | `SelectWithActions` + inline "+ New" | hidden                     |
| التابع         | `driverAssistantId` | select                               | hidden                     |
| امر بيع رقم    | `sellingOrderNo`    | shown                                | hidden                     |
| التحميل لصالح  | `clientId`          | shown                                | shown                      |
| الجهه          | `direction`         | shown                                | shown                      |
| لتسليمها لشركة | `receivedCompany`   | shown                                | shown                      |
| نوع التعبئة    | `packingType`       | shown                                | shown                      |
| رتبة الاسمنت   | `cementGrade`       | shown                                | shown                      |
| الكمية         | `quantity`          | shown                                | shown                      |
| مصدر العهدة    | (derived)           | read-only current employee           | read-only current employee |
| العهدة         | `custodyAmount`     | shown                                | shown                      |
| تفويض رقم      | `delegateNumber`    | read-only / auto                     | read-only / auto           |

Field set for Contract/Company matches Figma node `1134-15405` (no trailer/driver/assistant/sale-order).

### Inline NOLON asset creation (key mechanic)

Each asset's form value is a union:

```ts
type AssetValue<TInline> = { id: number } | TInline; // selected vs. inline-created
```

The "+ New" affordance in `SelectWithActions` (`canAddItem` + `addDialog`) opens a dialog that collects the asset fields (reusing the existing driver/car/trailer create schemas) and writes the **inline object** into form state. On submit the inline object is sent **inside** the `POST /api/journeys/office` body (`driver: {...}`, `car: {...}`, `trailer: {...}`); the backend creates the asset atomically within its DB transaction. No separate create API calls are made.

Inline payload shapes follow [`phase-6-api.md §3.1`](../../../phase-6-api.md):

- **Driver:** `licenseNumber`, `licenseExpiryDate`, `user{ firstName, lastName, nationalId, phoneNumber, email, password }`
- **Car:** `plateNumber`, `plateLetters`, `licenseNumber`, `licenseExpiryDate`, `manufacturer`, `model`, `manufactureYear`, `color`, `chassisNumber`
- **Trailer:** `plateNumber`, `plateLetters`, `maxWeight`, `licenseNumber`, `licenseExpiryDate`, `manufacturer`, `model`, `chassisNumber`

### Ownership filtering

Asset dropdowns show only assets whose ownership matches `vehicleMode` (NOLON-owned for NOLON, CONTRACT-owned for Contract, COMPANY-owned for Company). Reuse the existing `useGetAllDrivers/Cars/Trailers`; add/confirm an ownership filter param against the cars ownership code (`features/cars/apis/get-owners.ts`, `ownership-schema.ts`) during implementation.

### Data & submit

- Dropdown sources reuse `useGetAllCars`, `useGetAllTrailers`, `useGetAllDrivers`, `useGetAllEmployees`/users (assistant), `useGetAllClients`.
- `useCreateOfficeJourney` wraps base `useCreate` (`endPoint: 'api/journeys/office'`), invalidates journeys, toasts, redirects to `/office`.
- `custodySource` is **not** sent — the backend derives it from the authenticated employee.

### Validation (`office-journey-schema.ts`)

Zod schema with a discriminated shape per mode:

- `vehicleMode` required.
- NOLON: `car`/`trailer`/`driver` each `{ id } | inlineSchema`; `driverAssistantId` optional.
- Contract/Company: `carId` required (existing), no trailer/driver/assistant.
- Common: `clientId` required; `direction`, `receivedCompany`, `packingType`, `cementGrade`, `quantity`, `sellingOrderNo`, `custodyAmount` per the table above.

## 4. `custody` feature (admin CRUD)

### Folder layout

```
src/features/custody/
  api/        get-all.ts, get-one.ts, create.ts, update.ts, delete.ts
  components/ custody-page-client.tsx, custody-table.tsx,
              custody-form-dialog.tsx, custody-detail.tsx
  types/      index.ts
  enums/      custody-status.ts
```

### List (`/custody`)

`EntitiesToolbar` + `TableFilters` + `DataTable` + `TablePagination` (mirrors [`transactions-page-client.tsx`](../../../src/features/accounting/transactions/components/transactions-page-client.tsx)).

- **Columns:** id, employee name, account name, journey `delegateNumber`, driver name, `status` (badge), createdAt, row actions (view / edit / delete).
- **Filters → query params:** `status`, `employeeId`, `accountId`, `journeyId`, `driverId`, `search`, `createdAtFrom/To`, `updatedAtFrom/To`.
- `useGetPaginated` reads `X-Total-Count` for pagination.

### Create / Edit (`custody-form-dialog.tsx`)

Fields: `employeeId` (select, required), `accountId` (select, required), `status` (select, default `ACTIVE`), `journeyId` (optional select), `driverId` (optional select). `useCreate`/`useUpdate` auto-invalidate `['custodies']` and toast. Surface the 400 "custody already exists for employee+account" error as a form/toast message.

### Detail (`/custody/[custodyId]`) & delete

Read view via [`info-section`](../../../src/components/common/info-section.tsx). Delete → confirm → `useDelete`.

### Roles

Create/edit/delete affordances render for `ADMIN` only. For `EMPLOYEE`, `/custody` is a read-only list auto-scoped server-side to their own records.

## 5. `office-requests` feature

### Folder layout

```
src/features/office-requests/
  api/        get-all.ts, get-one.ts, create.ts, request-action.ts, delete.ts
  components/ office-requests-page-client.tsx, office-requests-table.tsx,
              office-request-form-dialog.tsx
  types/      index.ts
  enums/      office-request-status.ts, office-request-type.ts
```

### List (`/office-requests`)

Same table scaffold.

- **Columns:** id, `type` (localized label), `status` (badge), journey `delegateNumber`, `requestedFrom` name, `requestedTo` name, createdAt, actions.
- **Filters → query params:** `journeyId`, `requestedFromId`, `requestedToId`, `status`, `type`, `search`, date ranges.

### Create (`ADMIN`, `USER`)

Dialog: `type` (enum select — `PRINT_DELEGATION` / `END_WORKING_SHIFT` / `ASK_FOR_CUSTODY`), `description` (textarea), `journeyId` (select), `requestedFromId` (employee select), `requestedToId` (employee select). Status defaults to `PENDING` server-side.

### Approve / Reject (`ADMIN`)

On `PENDING` rows, two action buttons → `request-action.ts` posts `POST /api/office-requests/:id/request-action { status: APPROVED | REJECTED }`. `APPROVED`/`REJECTED` are terminal — no actions shown. Surface the 400 "not in PENDING status" error as a toast.

### Delete (`ADMIN`)

Confirm → `useDelete`.

## 6. Shared concerns

- **Enums** ([`phase-6-api.md §4`](../../../phase-6-api.md)): `JourneyVehicleMode`, `CustodyStatus`, `OfficeRequestStatus`, `OfficeRequestType` in their feature `enums/`. Reuse the existing `PackingType` and cement-grade constants from `trips`/`clients`.
- **i18n:** new namespaces `messages/{en,ar}/office.json`, `custody.json`, `office-requests.json`, loaded via `getLocaleMessages`. All Arabic labels from the screens live here; RTL throughout.
- **Shared selects:** reuse `useGetAllDrivers/Cars/Trailers/Employees/Clients`; add an ownership filter param where needed.
- **Tests:** Jest unit tests co-located in `__tests__/` for: the office Zod schema (esp. the `{id} | inline` union and the mode-conditional fields), the form→office-payload mapper, and the custody/request-action mutation hooks. Maintain the 70% coverage threshold. `pnpm build` (pre-commit) must stay green.

## 7. Open items (assumptions, non-blocking)

1. **`delegateNumber` source** — assumed backend auto-generates it (display read-only/auto). Revisit if there's an endpoint returning the next number.
2. **`direction` & `sale-order`** — rendered as text inputs per the API string types (Figma shows selects but no option source is defined). Switch to selects if a list is provided.
3. **`تسجيل بوليصة` card** — links to the existing policy flow; not a new Phase-6 endpoint.

## 8. Out of scope

- Backend changes (API is provided and assumed live).
- Policy registration internals (existing flow).
- Editing journeys via the admin `PUT /api/journeys/:id` (covered by existing `trips` feature; only referenced where custody amounts interact).
