# Office Journey Create — OpenAPI Alignment

**Date:** 2026-06-20
**Status:** Approved design, ready for implementation plan
**Scope:** `src/features/office/` — journey create payload, schemas, inline dialogs, form UX

## Problem

The office journey create flow (`POST /api/journeys/office`) diverges from the
backend contract documented in `Default module.openapi.json` (authoritative) and
`phase-6-api.md` (guide). Three classes of mismatch:

1. **Inline `.create` leaks past the NOLON guard.** In
   `buildOfficeJourneyPayload`, the `car` branch sits outside the `isNolon`
   guard, so a non-NOLON journey could structurally emit `car: { create }`. The
   backend rejects inline create for non-NOLON modes with **400** ("Inline create
   attempted for non-NOLON mode").
2. **CONTRACT_CAR / COMPANY_CAR never send a driver or trailer.** The form wraps
   the trailer + driver selects in `{isNolon && ...}` and the payload builder
   only adds `trailerId`/`driverId` inside `if (isNolon)`. Contract/company
   journeys submit with a car only. Per the OpenAPI field reference, driver/car/
   trailer are selectable by ID in every mode — only _inline create_ is
   NOLON-only.
3. **Inline payloads omit OpenAPI-required fields.**
   - Driver `user` is missing `role` and `status` (both required).
   - Trailer `create` is missing `chaseType`, `status`, `manufactureYear`,
     `color`, `axles` (all required).

## Decisions

- **OpenAPI export is authoritative** where it conflicts with `phase-6-api.md`
  (i.e. add the strict required fields).
- **CONTRACT_CAR / COMPANY_CAR** get existing-only driver + trailer selects (by
  ID, no inline).
- Driver/trailer remain **optional** in validation (docs mark them "Depends");
  only `car` stays required, preserving current behavior.

## Design

### 1. Payload builder — strict inline gating

`buildOfficeJourneyPayload` in `office-journey-schema.ts` uses the **object key
form** for every asset (`car` / `trailer` / `driver`), matching the OpenAPI
example structure: `{ id }` to select an existing asset, `{ create }` to create
inline. Inline `.create` is emitted **only when `vehicleMode === 'NOLON_CAR'`**;
`{ id }` selection applies in every mode. Per asset:

```ts
// car
if (isNolon && values.carInline) payload.car = { create: values.carInline };
else if (values.carId) payload.car = { id: Number(values.carId) };
// trailer
if (isNolon && values.trailerInline) payload.trailer = { create: values.trailerInline };
else if (values.trailerId) payload.trailer = { id: Number(values.trailerId) };
// driver
if (isNolon && values.driverInline) payload.driver = { create: values.driverInline };
else if (values.driverId) payload.driver = { id: Number(values.driverId) };
```

`driverAssistantId` and `sellingOrderNo` move **out** of the `isNolon` block —
they are general optional fields in the OpenAPI field reference.

Result: contract/company journeys carry `car: { id }` + `trailer: { id }` +
`driver: { id }`; inline can never reach a non-NOLON request.

> **Note:** The 4 existing tests in `office-journey-payload.test.ts` currently
> **fail** against the shipped code (code emits flat `carId` + `car: { create }`;
> tests expect `car: { id }` + flat inline). This plan makes both converge on the
> object form above. The CONTRACT test, which asserts no trailer/driver, is
> rewritten to assert they ARE present (per decision 2). The inline test, which
> asserts flat, is rewritten to assert `{ create }`.

### 2. Schemas — add OpenAPI-required fields

In `office-journey-schema.ts`, update both the static `*InlineSchema` (type
source) and the `make*InlineSchema(t)` factory (validation with translated
messages) so they stay in sync.

- **Driver** `user`: add `role` (default `"DRIVER"`), `status` (default
  `"AVAILABLE"`). Hidden, not user-entered.
- **Trailer**: add `chaseType` (string), `manufactureYear` (int), `color`
  (string) as user-entered; `status` (default `"AVAILABLE"`) and `axles`
  (default `[]`) as hidden defaults.

### 3. Inline dialogs

- **Driver dialog** (`driver-inline-dialog.tsx`): two hidden defaulted fields
  (`user.role`, `user.status`) via `useForm` `defaultValues` + hidden inputs,
  mirroring the car dialog's `status` pattern.
- **Trailer dialog** (`trailer-inline-dialog.tsx`): add visible inputs for
  `chaseType`, `manufactureYear` (number), `color`; hidden `status` default and
  `axles: []` default.
- **Car dialog**: no change (already complete).

### 4. Form UX — driver + trailer in all modes

In `office-journey-form.tsx`, render **car, trailer, driver selects in every
mode** using the shared `SelectWithActions`. Gate only the inline-create
affordance by mode: `canAddItem={isNolon}` and mount `addDialog` only when
NOLON. This also removes the native `<select>` used for non-NOLON car
(CLAUDE.md shadcn rule). `driverAssistant` + `sellingOrderNo` stay visible in
all modes. The `{isNolon && ...}` block is dissolved.

### 5. Validation

`officeJourneySchema` `superRefine`: keep `car` required. Driver/trailer stay
optional. No new required-ness.

### 6. i18n

Add to `messages/{en,ar}/office.json` any missing keys: `form.chaseType` (new).
`form.color`, `form.manufactureYear` already exist (reused by car) — reuse.
`role`/`status` are hidden, no labels.

### 7. Tests

- `office-journey-payload.test.ts` (rewrite all 4, currently failing): object
  form `{ id }` for existing in all modes; `{ create }` for inline gated to
  NOLON only; CONTRACT carries `trailer`/`driver`; `driverAssistantId`/
  `sellingOrderNo` emitted unconditionally.
- `inline-asset-schema.test.ts`: new driver `role`/`status` and trailer
  `chaseType`/`status`/`manufactureYear`/`color`/`axles` required/defaulted.
- Dialog tests: trailer new fields render; driver defaults present in `onCreated`
  payload.

## Out of scope

- Backend changes.
- Making driver/trailer required.
- Custody / office-requests payloads (verified already matching).
