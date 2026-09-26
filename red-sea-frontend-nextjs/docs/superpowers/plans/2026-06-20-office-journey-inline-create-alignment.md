# Office Journey Create — OpenAPI Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align the office journey create flow (`POST /api/journeys/office`) with the authoritative OpenAPI contract — strict NOLON-only inline create, object-form asset payloads (`{ id }` / `{ create }`), the OpenAPI-required inline fields, and driver/trailer assignment in every vehicle mode.

**Architecture:** Pure-function payload builder + Zod schemas in `office-journey-schema.ts` drive the form. The form (`office-journey-form.tsx`) renders one `SelectWithActions` per asset, gating only the inline-create affordance by mode. Inline dialogs collect asset fields; hidden defaults supply the OpenAPI-required `status`/`role`/`axles`. All behavior is unit-tested via the existing co-located `__tests__/` dirs.

**Tech Stack:** Next.js 15, React Hook Form + Zod (`@hookform/resolvers/zod`), next-intl, Jest + Testing Library (jsdom).

---

## Important execution notes

- **DO NOT COMMIT.** The user has instructed no commits this session. Every task ends at a passing test, not a commit. The repo's pre-commit hook is also currently broken (`next lint` throws `Converting circular structure to JSON`), independent of this work.
- Run a single test file with: `pnpm test -- <path>`.
- Spec: `docs/superpowers/specs/2026-06-20-office-journey-inline-create-alignment-design.md`.
- Canonical payload format (object key form, per OpenAPI):
  - Existing asset: `car: { id: N }` / `trailer: { id: N }` / `driver: { id: N }`
  - Inline (NOLON only): `car: { create: {...} }` / `trailer: { create: {...} }` / `driver: { create: {...} }`

---

## File Structure

| File                                                                                    | Responsibility                                                                  | Action                                |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------- |
| `src/features/office/types/office-journey-schema.ts`                                    | Inline Zod schemas, form-values type, payload type, `buildOfficeJourneyPayload` | Modify                                |
| `src/features/office/types/__tests__/office-journey-payload.test.ts`                    | Payload builder unit tests                                                      | Rewrite (currently failing)           |
| `src/features/office/types/__tests__/inline-asset-schema.test.ts`                       | Inline schema validation tests                                                  | Modify                                |
| `src/features/office/components/inline-create/driver-inline-dialog.tsx`                 | Driver inline form                                                              | Modify (hidden role/status)           |
| `src/features/office/components/inline-create/trailer-inline-dialog.tsx`                | Trailer inline form                                                             | Modify (new fields + hidden defaults) |
| `src/features/office/components/inline-create/__tests__/trailer-inline-dialog.test.tsx` | Trailer dialog test                                                             | Create                                |
| `src/features/office/components/office-journey-form.tsx`                                | Journey create form UX                                                          | Modify (selects in all modes)         |
| `messages/en/office.json`, `messages/ar/office.json`                                    | i18n                                                                            | Modify (`form.chaseType`)             |

---

## Task 1: Payload builder — object form + strict inline gating

**Files:**

- Modify: `src/features/office/types/office-journey-schema.ts` (`CreateOfficeJourneyPayload` type ~136-154, `buildOfficeJourneyPayload` ~156-189)
- Test: `src/features/office/types/__tests__/office-journey-payload.test.ts` (rewrite)

- [ ] **Step 1: Rewrite the failing tests to encode the canonical format**

Replace the entire body of `office-journey-payload.test.ts` with:

```ts
import {
  buildOfficeJourneyPayload,
  emptyOfficeJourneyValues,
  type OfficeJourneyFormValues,
} from '../office-journey-schema';

const base: OfficeJourneyFormValues = {
  ...emptyOfficeJourneyValues,
  clientId: '4',
  direction: 'Cairo',
  packingType: 'BAGGED',
  cementGrade: 'Grade 52',
  quantity: '100',
  custodyAmount: '500',
};

const carInline = {
  plateNumber: '9901',
  plateLetters: 'ن ل ن',
  licenseNumber: 'LIC',
  licenseExpiryDate: '2027-01-01',
  manufacturer: 'Toyota',
  model: 'Hilux',
  manufactureYear: 2020,
  color: 'White',
  chassisNumber: 'CH',
  cylinders: 6,
  horsepower: 400,
  axleCount: 3,
  maxWeight: 40000,
  status: 'AVAILABLE',
};

describe('buildOfficeJourneyPayload', () => {
  it('NOLON: existing assets are sent as { id } objects, plus assistant/sellingOrderNo', () => {
    const payload = buildOfficeJourneyPayload({
      ...base,
      vehicleMode: 'NOLON_CAR',
      carId: '7',
      trailerId: '5',
      driverId: '10',
      driverAssistantId: '3',
      sellingOrderNo: 'SO-1',
    });
    expect(payload).toMatchObject({
      vehicleMode: 'NOLON_CAR',
      clientId: 4,
      car: { id: 7 },
      trailer: { id: 5 },
      driver: { id: 10 },
      driverAssistantId: 3,
      sellingOrderNo: 'SO-1',
      direction: 'Cairo',
      packingType: 'BAGGED',
      cementGrade: 'Grade 52',
      quantity: 100,
      custodyAmount: 500,
    });
  });

  it('NOLON: inline asset is wrapped in { create }', () => {
    const payload = buildOfficeJourneyPayload({
      ...base,
      vehicleMode: 'NOLON_CAR',
      carInline,
    });
    expect(payload.car).toEqual({ create: carInline });
  });

  it('CONTRACT: existing car/trailer/driver + assistant + sellingOrderNo are all sent as { id }/values', () => {
    const payload = buildOfficeJourneyPayload({
      ...base,
      vehicleMode: 'CONTRACT_CAR',
      carId: '7',
      trailerId: '5',
      driverId: '10',
      driverAssistantId: '3',
      sellingOrderNo: 'SO-1',
    });
    expect(payload.car).toEqual({ id: 7 });
    expect(payload.trailer).toEqual({ id: 5 });
    expect(payload.driver).toEqual({ id: 10 });
    expect(payload.driverAssistantId).toBe(3);
    expect(payload.sellingOrderNo).toBe('SO-1');
  });

  it('CONTRACT: inline car is IGNORED (never emits { create } for non-NOLON)', () => {
    const payload = buildOfficeJourneyPayload({
      ...base,
      vehicleMode: 'CONTRACT_CAR',
      carInline,
      carId: '7',
    });
    expect(payload.car).toEqual({ id: 7 });
  });

  it('omits empty optional fields', () => {
    const payload = buildOfficeJourneyPayload({
      ...emptyOfficeJourneyValues,
      vehicleMode: 'COMPANY_CAR',
      clientId: '4',
      carId: '9',
    });
    expect(payload).toEqual({
      vehicleMode: 'COMPANY_CAR',
      clientId: 4,
      car: { id: 9 },
    });
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm test -- src/features/office/types/__tests__/office-journey-payload.test.ts`
Expected: FAIL — current code emits `carId` / `car: { create }`, so `car: { id }` and `{ create }` expectations fail; CONTRACT trailer/driver are `undefined`.

- [ ] **Step 3: Update the payload type to object-key form**

In `office-journey-schema.ts`, replace the `CreateOfficeJourneyPayload` interface (lines ~136-154) with:

```ts
export interface CreateOfficeJourneyPayload {
  vehicleMode: VehicleMode;
  clientId: number;
  car?: { id: number } | { create: CarInline };
  trailer?: { id: number } | { create: TrailerInline };
  driver?: { id: number } | { create: DriverInline };
  driverAssistantId?: number;
  sellingOrderNo?: string;
  delegateNumber?: string;
  direction?: string;
  receivedCompany?: string;
  packingType?: string;
  cementGrade?: string;
  quantity?: number;
  custodyAmount?: number;
}
```

- [ ] **Step 4: Rewrite `buildOfficeJourneyPayload`**

Replace the function body (lines ~156-189) with:

```ts
export function buildOfficeJourneyPayload(
  values: OfficeJourneyFormValues,
): CreateOfficeJourneyPayload {
  const isNolon = values.vehicleMode === 'NOLON_CAR';

  const payload: CreateOfficeJourneyPayload = {
    vehicleMode: values.vehicleMode,
    clientId: Number(values.clientId),
  };

  // Assets: inline { create } only for NOLON; { id } selection in every mode.
  if (isNolon && values.carInline) payload.car = { create: values.carInline };
  else if (values.carId) payload.car = { id: Number(values.carId) };

  if (isNolon && values.trailerInline) payload.trailer = { create: values.trailerInline };
  else if (values.trailerId) payload.trailer = { id: Number(values.trailerId) };

  if (isNolon && values.driverInline) payload.driver = { create: values.driverInline };
  else if (values.driverId) payload.driver = { id: Number(values.driverId) };

  // General optional fields (all modes).
  if (values.driverAssistantId) payload.driverAssistantId = Number(values.driverAssistantId);
  if (values.sellingOrderNo) payload.sellingOrderNo = values.sellingOrderNo;
  if (values.delegateNumber) payload.delegateNumber = values.delegateNumber;
  if (values.direction) payload.direction = values.direction;
  if (values.receivedCompany) payload.receivedCompany = values.receivedCompany;
  if (values.packingType) payload.packingType = values.packingType;
  if (values.cementGrade) payload.cementGrade = values.cementGrade;
  if (values.quantity) payload.quantity = Number(values.quantity);
  if (values.custodyAmount) payload.custodyAmount = Number(values.custodyAmount);

  return payload;
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `pnpm test -- src/features/office/types/__tests__/office-journey-payload.test.ts`
Expected: PASS (5 tests).

---

## Task 2: Inline schemas — add OpenAPI-required fields

**Files:**

- Modify: `src/features/office/types/office-journey-schema.ts` (`driverInlineSchema` ~7-16, `trailerInlineSchema` ~37-46, `makeDriverInlineSchema` ~71-81, `makeTrailerInlineSchema` ~83-93)
- Test: `src/features/office/types/__tests__/inline-asset-schema.test.ts` (modify)

- [ ] **Step 1: Update the schema tests for the new required fields**

In `inline-asset-schema.test.ts`, replace `validDriver` and `validTrailer` and add assertions:

```ts
const validDriver = {
  licenseNumber: 'LIC-001',
  licenseExpiryDate: '2030-12-31',
  user: {
    firstName: 'Ali',
    lastName: 'Hassan',
    email: 'ali@example.com',
    password: 'SecurePass1!',
    role: 'DRIVER',
    status: 'AVAILABLE',
  },
};

const validTrailer = {
  plateNumber: '9902',
  plateLetters: 'م ق ط',
  maxWeight: 25000,
  licenseNumber: 'LIC-TR-001',
  licenseExpiryDate: '2027-06-01',
  manufacturer: 'Volvo',
  model: 'FH16',
  chassisNumber: 'TR-CHASS-001',
  chaseType: 'Semi',
  manufactureYear: 2019,
  color: 'Silver',
  status: 'AVAILABLE',
  axles: [],
};
```

Then add these test cases inside the `describe('inline asset schemas', ...)` block:

```ts
it('rejects a driver missing user.role', () => {
  const { role, ...userNoRole } = validDriver.user;
  const bad = { ...validDriver, user: userNoRole };
  expect(driverInlineSchema.safeParse(bad).success).toBe(false);
});

it('rejects a trailer missing chaseType', () => {
  const { chaseType, ...noChase } = validTrailer;
  expect(trailerInlineSchema.safeParse(noChase).success).toBe(false);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm test -- src/features/office/types/__tests__/inline-asset-schema.test.ts`
Expected: FAIL — `role`/`status`/`chaseType`/`axles` are not yet in the schemas (the "rejects" tests fail because the current loose schemas accept the missing fields).

- [ ] **Step 3: Add fields to `driverInlineSchema`**

Replace `driverInlineSchema` (lines ~7-16) with:

```ts
export const driverInlineSchema = z.object({
  licenseNumber: z.string().min(1),
  licenseExpiryDate: z.string().min(1),
  user: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.string().min(1),
    status: z.string().min(1),
  }),
});
```

- [ ] **Step 4: Add fields to `trailerInlineSchema`**

Replace `trailerInlineSchema` (lines ~37-46) with:

```ts
export const trailerInlineSchema = z.object({
  plateNumber: z.string().min(1),
  plateLetters: z.string().min(1),
  maxWeight: z.number().min(0),
  licenseNumber: z.string().min(1),
  licenseExpiryDate: z.string().min(1),
  manufacturer: z.string().min(1),
  model: z.string().min(1),
  chassisNumber: z.string().min(1),
  chaseType: z.string().min(1),
  manufactureYear: z.number().int().min(1900),
  color: z.string().min(1),
  status: z.string().min(1),
  axles: z.array(z.unknown()),
});
```

- [ ] **Step 5: Update the translated factory schemas**

Replace `makeDriverInlineSchema` (lines ~71-81) with:

```ts
export const makeDriverInlineSchema = (t: T) =>
  z.object({
    licenseNumber: z.string().min(1, t('validation.required')),
    licenseExpiryDate: z.string().min(1, t('validation.required')),
    user: z.object({
      firstName: z.string().min(1, t('validation.required')),
      lastName: z.string().min(1, t('validation.required')),
      email: z.string().email(t('validation.emailInvalid')),
      password: z.string().min(8, t('validation.passwordMin')),
      role: z.string().min(1),
      status: z.string().min(1),
    }),
  });
```

Replace `makeTrailerInlineSchema` (lines ~83-93) with:

```ts
export const makeTrailerInlineSchema = (t: T) =>
  z.object({
    plateNumber: z.string().min(1, t('validation.required')),
    plateLetters: z.string().min(1, t('validation.required')),
    maxWeight: z.number().min(1, t('validation.numberMin')),
    licenseNumber: z.string().min(1, t('validation.required')),
    licenseExpiryDate: z.string().min(1, t('validation.required')),
    manufacturer: z.string().min(1, t('validation.required')),
    model: z.string().min(1, t('validation.required')),
    chassisNumber: z.string().min(1, t('validation.required')),
    chaseType: z.string().min(1, t('validation.required')),
    manufactureYear: z.number().int().min(1900, t('validation.yearMin')),
    color: z.string().min(1, t('validation.required')),
    status: z.string().min(1),
    axles: z.array(z.unknown()),
  });
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `pnpm test -- src/features/office/types/__tests__/inline-asset-schema.test.ts`
Expected: PASS.

---

## Task 3: Driver inline dialog — hidden role/status defaults

**Files:**

- Modify: `src/features/office/components/inline-create/driver-inline-dialog.tsx`

- [ ] **Step 1: Provide hidden defaults and register hidden inputs**

In `driver-inline-dialog.tsx`, change the `useForm` call to supply defaults:

```tsx
const form = useForm<DriverInline>({
  resolver: zodResolver(makeDriverInlineSchema(t)),
  defaultValues: { user: { role: 'DRIVER', status: 'AVAILABLE' } },
});
```

Then add the two hidden inputs immediately inside the `<form>` element, before the `TOP_FIELDS.map(...)` call:

```tsx
<input type="hidden" {...form.register('user.role')} />
<input type="hidden" {...form.register('user.status')} />
```

- [ ] **Step 2: Verify the existing dialog still type-checks and the form runs**

Run: `pnpm test -- src/features/office/components/inline-create/__tests__/car-inline-dialog.test.tsx`
Expected: PASS (unrelated, confirms inline dialog test harness/imports still resolve). Driver dialog has no dedicated test yet; it is covered indirectly. (A driver dialog test is optional and out of scope.)

---

## Task 4: Trailer inline dialog — new fields + hidden defaults

**Files:**

- Modify: `src/features/office/components/inline-create/trailer-inline-dialog.tsx`
- Test: `src/features/office/components/inline-create/__tests__/trailer-inline-dialog.test.tsx` (create)

- [ ] **Step 1: Write the failing dialog test**

Create `src/features/office/components/inline-create/__tests__/trailer-inline-dialog.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';

import messages from '@/../messages/en/office.json';

import TrailerInlineDialog from '../trailer-inline-dialog';

const renderDialog = (onCreated = jest.fn()) =>
  render(
    <NextIntlClientProvider locale="en" messages={{ office: messages }}>
      <TrailerInlineDialog open onOpenChange={jest.fn()} onCreated={onCreated} />
    </NextIntlClientProvider>,
  );

describe('TrailerInlineDialog', () => {
  it('renders the new chaseType, manufactureYear and color fields', () => {
    renderDialog();
    expect(screen.getByText(messages.form.chaseType)).toBeInTheDocument();
    expect(screen.getByText(messages.form.manufactureYear)).toBeInTheDocument();
    expect(screen.getByText(messages.form.color)).toBeInTheDocument();
  });

  it('includes hidden status and axles defaults in the onCreated payload', () => {
    const onCreated = jest.fn();
    renderDialog(onCreated);

    fireEvent.change(screen.getByLabelText(messages.form.plateNumber), {
      target: { value: '9902' },
    });
    fireEvent.change(screen.getByLabelText(messages.form.plateLetters), {
      target: { value: 'م ق ط' },
    });
    fireEvent.change(screen.getByLabelText(messages.form.licenseNumber), {
      target: { value: 'LIC-TR' },
    });
    fireEvent.change(screen.getByLabelText(messages.form.licenseExpiryDate), {
      target: { value: '2027-06-01' },
    });
    fireEvent.change(screen.getByLabelText(messages.form.manufacturer), {
      target: { value: 'Volvo' },
    });
    fireEvent.change(screen.getByLabelText(messages.form.model), { target: { value: 'FH16' } });
    fireEvent.change(screen.getByLabelText(messages.form.chassisNumber), {
      target: { value: 'TR-CH' },
    });
    fireEvent.change(screen.getByLabelText(messages.form.maxWeight), {
      target: { value: '25000' },
    });
    fireEvent.change(screen.getByLabelText(messages.form.chaseType), { target: { value: 'Semi' } });
    fireEvent.change(screen.getByLabelText(messages.form.manufactureYear), {
      target: { value: '2019' },
    });
    fireEvent.change(screen.getByLabelText(messages.form.color), { target: { value: 'Silver' } });

    fireEvent.click(screen.getByText(messages.form.save));

    return Promise.resolve().then(() => {
      expect(onCreated).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'AVAILABLE', axles: [], chaseType: 'Semi' }),
      );
    });
  });
});
```

> Note: the `getByLabelText` calls require the dialog's `FormLabel`/`Input` to be associated. The shared `Form` primitives wire `htmlFor`/`id` via `FormField` context, so labels resolve by text. If a query fails to associate, fall back to `getByText` for the label assertions only (first test) and keep the payload assertion driven by direct field changes through `screen.getByRole('textbox', { name })`.

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test -- src/features/office/components/inline-create/__tests__/trailer-inline-dialog.test.tsx`
Expected: FAIL — `chaseType`/`manufactureYear`/`color` fields and `form.chaseType` translation do not exist yet.

- [ ] **Step 3: Add the i18n key (en + ar)** — see Task 6, do that first, then continue.

- [ ] **Step 4: Update the trailer dialog component**

In `trailer-inline-dialog.tsx`, supply hidden defaults in `useForm`:

```tsx
const form = useForm<TrailerInline>({
  resolver: zodResolver(makeTrailerInlineSchema(t)),
  defaultValues: { status: 'AVAILABLE', axles: [] },
});
```

Add the new entries to the `FIELDS` array (after `model`, before `chassisNumber` is fine — order is cosmetic):

```tsx
const FIELDS: { name: keyof TrailerInline; type?: string; isNumber?: boolean }[] = [
  { name: 'plateNumber' },
  { name: 'plateLetters' },
  { name: 'licenseNumber' },
  { name: 'licenseExpiryDate', type: 'date' },
  { name: 'manufacturer' },
  { name: 'model' },
  { name: 'chaseType' },
  { name: 'manufactureYear', type: 'number', isNumber: true },
  { name: 'color' },
  { name: 'chassisNumber' },
  { name: 'maxWeight', type: 'number', isNumber: true },
];
```

Register the hidden inputs immediately inside the `<form>`, before the `FIELDS.map(...)`:

```tsx
<input type="hidden" {...form.register('status')} />
```

> `axles` is an array default; it does not need a hidden text input — RHF carries it from `defaultValues`. Leave it out of the JSX.

- [ ] **Step 5: Run the test to verify it passes**

Run: `pnpm test -- src/features/office/components/inline-create/__tests__/trailer-inline-dialog.test.tsx`
Expected: PASS.

---

## Task 5: Form UX — driver + trailer selects in every mode

**Files:**

- Modify: `src/features/office/components/office-journey-form.tsx`

- [ ] **Step 1: Make the car select use `SelectWithActions` in all modes**

Replace the entire `{/* Car ... */}` block (lines ~47-90) with a single `SelectWithActions` whose add affordance is gated by `isNolon`:

```tsx
{
  /* Car — all modes; inline create only for NOLON */
}
<div className="flex flex-col gap-1">
  <Label>{t('form.car')}</Label>
  <SelectWithActions
    open={carOpen}
    setOpen={setCarOpen}
    value={form.watch('carId')}
    items={cars.map((c: any) => ({ id: String(c.id), name: `${c.carCode} - ${c.model}` }))}
    handleSelect={(v) => {
      form.setValue('carId', v ?? '');
      form.setValue('carInline', undefined);
    }}
    handleLoadMore={() => {}}
    showSearch
    canAddItem={isNolon}
    addButtonLabel={t('form.addNew')}
    setAddDialogOpen={setCarDialogOpen}
    placeholder={t('form.selectPlaceholder')}
    addDialog={
      isNolon ? (
        <CarInlineDialog
          open={carDialogOpen}
          onOpenChange={setCarDialogOpen}
          onCreated={(data) => {
            form.setValue('carInline', data);
            form.setValue('carId', '');
          }}
        />
      ) : undefined
    }
  />
</div>;
```

- [ ] **Step 2: Move trailer + driver selects out of the `{isNolon && ...}` block**

Replace the whole `{/* NOLON-only fields */}` block (lines ~92-161) with trailer + driver selects that always render, gating only the add affordance, followed by the assistant + sellingOrderNo fields (now shown in all modes):

```tsx
<div className="flex flex-col gap-1">
  <Label>{t('form.trailer')}</Label>
  <SelectWithActions
    open={trailerOpen}
    setOpen={setTrailerOpen}
    value={form.watch('trailerId')}
    items={trailers.map((tr: any) => ({ id: String(tr.id), name: tr.chassis ?? String(tr.id) }))}
    handleSelect={(v) => {
      form.setValue('trailerId', v ?? '');
      form.setValue('trailerInline', undefined);
    }}
    handleLoadMore={() => {}}
    showSearch
    canAddItem={isNolon}
    addButtonLabel={t('form.addNew')}
    setAddDialogOpen={setTrailerDialogOpen}
    placeholder={t('form.selectPlaceholder')}
    addDialog={
      isNolon ? (
        <TrailerInlineDialog
          open={trailerDialogOpen}
          onOpenChange={setTrailerDialogOpen}
          onCreated={(data) => {
            form.setValue('trailerInline', data);
            form.setValue('trailerId', '');
          }}
        />
      ) : undefined
    }
  />
</div>

<div className="flex flex-col gap-1">
  <Label>{t('form.driver')}</Label>
  <SelectWithActions
    open={driverOpen}
    setOpen={setDriverOpen}
    value={form.watch('driverId')}
    items={drivers.map((d: any) => ({ id: String(d.id), name: d.driverName }))}
    handleSelect={(v) => {
      form.setValue('driverId', v ?? '');
      form.setValue('driverInline', undefined);
    }}
    handleLoadMore={() => {}}
    showSearch
    canAddItem={isNolon}
    addButtonLabel={t('form.addNew')}
    setAddDialogOpen={setDriverDialogOpen}
    placeholder={t('form.selectPlaceholder')}
    addDialog={
      isNolon ? (
        <DriverInlineDialog
          open={driverDialogOpen}
          onOpenChange={setDriverDialogOpen}
          onCreated={(data) => {
            form.setValue('driverInline', data);
            form.setValue('driverId', '');
          }}
        />
      ) : undefined
    }
  />
</div>

<Field label={t('form.assistant')} name="driverAssistantId" />
<Field label={t('form.sellingOrderNo')} name="sellingOrderNo" />
```

> The state hooks (`carOpen`, `carDialogOpen`, `trailerOpen`, `trailerDialogOpen`, `driverOpen`, `driverDialogOpen`) already exist at the top of the component — keep them.

- [ ] **Step 3: Run the office feature test suite to confirm no regressions**

Run: `pnpm test -- src/features/office`
Expected: PASS for all office tests (payload, inline schema, validation, vehicle-mode, ownership-filter, choice-card, vehicle-mode-selection, car/trailer inline dialog). If `SelectWithActions` is unmocked and pulls heavy deps, the form itself has no dedicated render test, so this step validates the surrounding units.

---

## Task 6: i18n — add `form.chaseType`

**Files:**

- Modify: `messages/en/office.json`, `messages/ar/office.json`

- [ ] **Step 1: Add the key to English**

In `messages/en/office.json`, inside `"form"`, after `"chassisNumber": "Chassis Number",` add:

```json
"chaseType": "Chassis Type",
```

- [ ] **Step 2: Add the key to Arabic**

In `messages/ar/office.json`, inside `"form"`, add the matching key (place it after the existing `chassisNumber` entry):

```json
"chaseType": "نوع الشاسيه",
```

- [ ] **Step 3: Verify both files parse as valid JSON**

Run: `pnpm test -- src/features/office/components/inline-create/__tests__/trailer-inline-dialog.test.tsx`
Expected: PASS (the dialog test imports `messages/en/office.json` and asserts `form.chaseType` renders — a parse error or missing key would fail here).

> If executing strictly top-to-bottom, do Task 6 before Task 4 Step 5 (the trailer dialog test depends on this key). Task 4 Step 3 already calls this out.

---

## Task 7: Full office suite green

**Files:** none (verification only)

- [ ] **Step 1: Run the entire office feature test suite**

Run: `pnpm test -- src/features/office`
Expected: All suites PASS.

- [ ] **Step 2: Type-check the changed files**

Run: `pnpm check-types`
Expected: No errors. (If `check-types` surfaces pre-existing errors elsewhere in the repo unrelated to `src/features/office`, note them but do not fix — out of scope.)

- [ ] **Step 3: Report completion**

Summarize: payload now object-form + NOLON-gated inline; inline schemas carry OpenAPI-required fields; dialogs supply hidden defaults; driver/trailer selectable in all modes. **Do not commit** — leave changes in the working tree for the user to review.

---

## Self-Review Notes

- **Spec coverage:** Task 1 ↔ spec §1; Task 2 ↔ spec §2; Tasks 3–4 ↔ spec §3; Task 5 ↔ spec §4; spec §5 (validation) intentionally unchanged — `officeJourneySchema.superRefine` keeps only the car-required rule, so no task touches it; Task 6 ↔ spec §6; Tasks 1–2, 4, 7 ↔ spec §7.
- **Type consistency:** `CreateOfficeJourneyPayload` asset fields are `{ id } | { create }` (Task 1) and the builder only ever assigns those shapes. `CarInline`/`TrailerInline`/`DriverInline` gain fields in Task 2 and are consumed unchanged by name elsewhere.
- **Out of scope (unchanged):** `officeJourneySchema` required-ness, the `OfficeJourneyFormValues` shape (string-based form fields stay as-is), custody/office-requests, the broken `next lint` hook.
