# Office Module Changes — Design Spec

**Date:** 2026-06-22
**Status:** Approved (pending user review of this spec)

## Goal

Four independent changes to the office module:

1. `/office` becomes the vehicle-mode selection directly (drop the two-card landing and the `issue-delegation` URL segment).
2. Role-gate the sidebar: `EMPLOYEE` sees only Office; `ADMIN` sees everything (incl. Office); other roles see the full menu.
3. Replace the asset inline-create dialogs with inline **tabs** (Select / Create) on NOLON mode; basic fields only, with the rest supplied as payload defaults.
4. `packingType` → enum dropdown; `custodyAmount` → single-option dropdown from `GET /api/journeys/office/custody-amount`.

---

## 1. Office landing → mode selection (URL change)

**Routes:**

- Delete `OfficeLanding` component (`src/features/office/components/office-landing.tsx`).
- Move the create page from `src/app/[locale]/(loggedIn)/office/issue-delegation/[mode]/page.tsx` → `src/app/[locale]/(loggedIn)/office/[mode]/page.tsx` (unchanged content).
- Delete the now-empty `office/issue-delegation/` folder (both `page.tsx` and `[mode]/`).
- `src/app/[locale]/(loggedIn)/office/page.tsx` renders `VehicleModeSelection`.
- `VehicleModeSelection` card hrefs change from `/office/issue-delegation/{mode}` → `/office/{mode}`.

**Route titles** (`src/config/routes.ts`):

- The `nestedRoutes` keys `nolon-car` / `contract-car` / `company-car` already resolve as `parts[2]`. After the move, `parts[1] = 'office'` and `parts[2] = '<mode-slug>'`, so the existing nested-route mapping still works. Remove the `'issue-delegation': 'اصدار تفويض'` key (no longer reachable). The `office` module label stays.

**Edge case:** `slugToVehicleMode` returns `null` for unknown slugs → `notFound()`. Behavior preserved by the move.

---

## 2. Role-gated sidebar

`session.user.role` is populated by the auth callbacks. Roles in use: `ADMIN`, `EMPLOYEE`, `USER`/`user`.

**Component:** `src/components/layout/side-menu.tsx`

- Convert to read role via `useSession()` from `next-auth/react` (already a client component).
- Filter `sideMenuIcons`:
  - `role === 'EMPLOYEE'` → keep only the item whose `key === 'office'`.
  - `role === 'ADMIN'` → keep all (no filter).
  - otherwise → keep all (safe fallback).
- The filter is a pure helper `filterMenuByRole(items, role)` co-located in the component file (or `src/components/layout/`), unit-testable.

**Note:** This is a UI affordance only; the backend enforces real authorization.

---

## 3. Inline create → tabs (NOLON only)

### UX

New component `AssetSelectOrCreate` (in `src/features/office/components/inline-create/`) using shadcn `Tabs`:

- **NOLON mode:** two tabs.
  - Tab "اختيار" (select): renders `SelectWithActions` (dropdown, no add button — `canAddItem={false}`).
  - Tab "إضافة" (create): renders the asset's basic fields inline (no dialog), RHF-controlled.
- **CONTRACT / COMPANY modes:** the component renders a plain `SelectWithActions` only (no tabs, no create).
- Switching to the "Select" tab clears the `*Inline` value and uses `*Id`; switching to "Create" clears `*Id` and uses `*Inline`. Exactly one of id/inline is active per asset, matching the existing payload builder gating.

The three dialog components (`car-inline-dialog.tsx`, `driver-inline-dialog.tsx`, `trailer-inline-dialog.tsx`) are **deleted** and replaced by inline field panels rendered by `AssetSelectOrCreate` (or small per-asset field components it composes).

### Visible basic fields

- **Car** (`carInline`): `plateNumber` (رقم اللوحة), `plateLetters` (حروف اللوحة), `licenseNumber` (رقم الرخصة), `licenseExpiryDate` (تاريخ انتهاء الرخصة, date).
- **Trailer** (`trailerInline`): same four as car.
- **Driver** (`driverInline`): `firstName`, `lastName`, `nationalId`, `phoneNumber`, `licenseNumber`, `licenseExpiryDate` (date) — 6 fields.

### Payload contract (authoritative — from user sample)

Asset payload is object-form `{ id }` (select) or `{ create }` (inline), NOLON-only for `create`:

- **Car create:**
  ```json
  {
    "create": {
      "plateNumber": "...",
      "plateLetters": "...",
      "licenseNumber": "...",
      "licenseExpiryDate": "..."
    }
  }
  ```
- **Trailer create:** same shape as car.
- **Driver create** (matches sample):
  ```json
  {
    "create": {
      "licenseNumber": "...",
      "licenseExpiryDate": "...",
      "user": {
        "firstName": "...",
        "lastName": "...",
        "nationalId": "...",
        "phoneNumber": "..."
      }
    }
  }
  ```

**No `email`, `password`, `role`, `status`, `manufacturer`, `model`, `chaseType`, `axles`** are sent for inline driver. The user sample omits them and the backend now accepts the trimmed shape. The car/trailer inline likewise sends only the four visible fields (no manufacturer/model/status defaults) — the backend fills the rest.

### Schema changes (`src/features/office/types/office-journey-schema.ts`)

Replace the inline schemas with the trimmed shapes:

```ts
export const carInlineSchema = z.object({
  plateNumber: z.string().min(1),
  plateLetters: z.string().min(1),
  licenseNumber: z.string().min(1),
  licenseExpiryDate: z.string().min(1),
});

export const trailerInlineSchema = z.object({
  plateNumber: z.string().min(1),
  plateLetters: z.string().min(1),
  licenseNumber: z.string().min(1),
  licenseExpiryDate: z.string().min(1),
});

export const driverInlineSchema = z.object({
  licenseNumber: z.string().min(1),
  licenseExpiryDate: z.string().min(1),
  user: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    nationalId: z.string().min(1),
    phoneNumber: z.string().min(1),
  }),
});
```

Translated factories (`makeCarInlineSchema`, `makeTrailerInlineSchema`, `makeDriverInlineSchema`) updated to match these fields with `t('validation.required')` messages.

`buildOfficeJourneyPayload` keeps its object-form, NOLON-gated logic (already correct) — only the inline object shape changes, which flows through unchanged since it spreads `values.carInline` / `values.driverInline` / `values.trailerInline`.

The `CreateOfficeJourneyPayload` type's asset members stay `{ id: number } | { create: CarInline | TrailerInline | DriverInline }`, now typed by the trimmed inline types.

### Tests

- `office-journey-payload.test.ts`: update fixtures to the trimmed inline shapes; assert driver create produces `{ create: { licenseNumber, licenseExpiryDate, user: { firstName, lastName, nationalId, phoneNumber } } }`.
- `inline-asset-schema.test.ts`: assert the trimmed schemas reject missing required fields and accept the new shapes (e.g. driver requires `user.nationalId` and `user.phoneNumber`; no longer references `email`/`password`/`role`).
- Delete the trailer/car dialog tests that assert removed fields (`chaseType`, `manufactureYear`, `status`, `axles`, hidden defaults). Replace with a render test for `AssetSelectOrCreate` covering: tabs present in NOLON, plain select in CONTRACT, switching tabs toggles id/inline.

---

## 4. packingType dropdown

- In `office-journey-form.tsx`, replace the `packingType` `<Field>` text input with a shadcn `Select`.
- Options come from the `PackingType` enum (`src/features/clients/enums/packing-type.ts`).
- Labels via new i18n keys in `messages/{locale}/office.json` under `packing.*` (e.g. `packing.BAGGED`, `packing.JUMBO_BAG`, `packing.SILO10`, `packing.SILO12`, `packing.LOOSE`). English + Arabic.
- Submitted value = enum key (`BAGGED`, etc.). `buildOfficeJourneyPayload` already passes `packingType` through as a string.

---

## 5. custody dropdown

**API hook:** `src/features/office/api/get-custody-amount.ts`

```ts
interface OfficeCustodyAmount {
  employeeId: number;
  accountId: number;
  accountName: string;
  custodyAmount: number;
}
```

- `useGetOfficeCustodyAmount()` → `useQuery` (or `useGetOne`-style) hitting `GET /api/journeys/office/custody-amount`, `queryKey: ['office-custody-amount']`. Returns the single object.

**Form field:** replace the `custodyAmount` text `<Field>` with a shadcn `Select` containing one option:

- Label: `{accountName} — {custodyAmount} {currency}` (currency from `form.currency` key, "جنيه").
- Selecting it sets `form.custodyAmount` to `String(custodyAmount)`.
- While loading / if no data → placeholder, disabled.

---

## File Summary

| File                                                                                  | Action                                                                                    |
| ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `src/app/[locale]/(loggedIn)/office/page.tsx`                                         | Render `VehicleModeSelection`                                                             |
| `src/app/[locale]/(loggedIn)/office/[mode]/page.tsx`                                  | Create (moved from issue-delegation)                                                      |
| `src/app/[locale]/(loggedIn)/office/issue-delegation/**`                              | Delete                                                                                    |
| `src/features/office/components/office-landing.tsx`                                   | Delete                                                                                    |
| `src/features/office/components/vehicle-mode-selection.tsx`                           | Update hrefs → `/office/{mode}`                                                           |
| `src/config/routes.ts`                                                                | Remove `issue-delegation` nested key                                                      |
| `src/components/layout/side-menu.tsx`                                                 | Role-filter menu                                                                          |
| `src/features/office/components/office-journey-form.tsx`                              | Use `AssetSelectOrCreate`; packingType + custody selects                                  |
| `src/features/office/components/inline-create/asset-select-or-create.tsx`             | Create                                                                                    |
| `src/features/office/components/inline-create/{car,driver,trailer}-inline-dialog.tsx` | Delete                                                                                    |
| `src/features/office/types/office-journey-schema.ts`                                  | Trim inline schemas                                                                       |
| `src/features/office/hooks/use-office-journey-form.ts`                                | Expose custody-amount data                                                                |
| `src/features/office/api/get-custody-amount.ts`                                       | Create                                                                                    |
| `messages/{en,ar}/office.json`                                                        | Add `packing.*`; tab labels                                                               |
| Co-located `__tests__/`                                                               | Update payload/schema tests; add `AssetSelectOrCreate` test; delete obsolete dialog tests |

## Out of Scope

- Backend authorization (UI gating only).
- Custody/office-requests features beyond the custody-amount dropdown.
- The broken `next lint` pre-commit hook.
- No commits this session — leave changes in the working tree.
