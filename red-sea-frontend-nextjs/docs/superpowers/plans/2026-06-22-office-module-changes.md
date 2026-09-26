# Office Module Changes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `/office` the vehicle-mode selection, role-gate the sidebar, replace asset inline-create dialogs with inline Select/Create tabs (NOLON only), and turn `packingType` + `custodyAmount` into dropdowns.

**Architecture:** Pure Zod schemas + payload builder in `office-journey-schema.ts` drive the form. A new `AssetSelectOrCreate` component renders a shadcn `Tabs` (Select / Create) per asset in NOLON mode and a plain `SelectWithActions` otherwise. A new `useGetOfficeCustodyAmount` hook feeds the custody dropdown. Sidebar filters its items by `session.user.role`.

**Tech Stack:** Next.js 15 (App Router), React Hook Form + Zod (`@hookform/resolvers/zod`), TanStack Query, next-intl, next-auth v5, shadcn/ui (Tabs, Select), Jest + Testing Library (jsdom).

---

## Important execution notes

- **DO NOT COMMIT.** The user has instructed no commits this session. Every task ends at a passing test, not a commit. Leave all changes in the working tree.
- Run a single test file with: `pnpm test -- <path>`.
- Spec: `docs/superpowers/specs/2026-06-22-office-module-changes-design.md`.
- Authoritative inline payload (from user sample):
  - Car/Trailer create: `{ create: { plateNumber, plateLetters, licenseNumber, licenseExpiryDate } }`
  - Driver create: `{ create: { licenseNumber, licenseExpiryDate, user: { firstName, lastName, nationalId, phoneNumber } } }`
  - Existing asset: `{ id: N }`

---

## File Structure

| File                                                                                          | Responsibility                                                            | Action  |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------- |
| `src/features/office/types/office-journey-schema.ts`                                          | Trimmed inline Zod schemas + factories; payload builder (unchanged logic) | Modify  |
| `src/features/office/types/__tests__/inline-asset-schema.test.ts`                             | Inline schema validation tests                                            | Rewrite |
| `src/features/office/types/__tests__/office-journey-payload.test.ts`                          | Payload builder tests                                                     | Modify  |
| `src/features/office/api/get-custody-amount.ts`                                               | `useGetOfficeCustodyAmount` query hook                                    | Create  |
| `src/features/office/hooks/use-office-journey-form.ts`                                        | Expose custody-amount data to the form                                    | Modify  |
| `src/features/office/components/inline-create/asset-select-or-create.tsx`                     | Tabs (Select/Create) per asset; plain select for non-NOLON                | Create  |
| `src/features/office/components/inline-create/__tests__/asset-select-or-create.test.tsx`      | Render/behavior test                                                      | Create  |
| `src/features/office/components/inline-create/{car,driver,trailer}-inline-dialog.tsx`         | Old dialogs                                                               | Delete  |
| `src/features/office/components/inline-create/__tests__/{car,trailer}-inline-dialog.test.tsx` | Old dialog tests                                                          | Delete  |
| `src/features/office/components/office-journey-form.tsx`                                      | Use `AssetSelectOrCreate`; packingType + custody dropdowns                | Modify  |
| `src/features/office/components/office-landing.tsx`                                           | Old landing                                                               | Delete  |
| `src/features/office/components/vehicle-mode-selection.tsx`                                   | Card hrefs → `/office/{mode}`                                             | Modify  |
| `src/app/[locale]/(loggedIn)/office/page.tsx`                                                 | Render `VehicleModeSelection`                                             | Modify  |
| `src/app/[locale]/(loggedIn)/office/[mode]/page.tsx`                                          | Create page (moved)                                                       | Create  |
| `src/app/[locale]/(loggedIn)/office/issue-delegation/`                                        | Old route tree                                                            | Delete  |
| `src/config/routes.ts`                                                                        | Remove `issue-delegation` nested key                                      | Modify  |
| `src/components/layout/side-menu.tsx`                                                         | Role-filter menu items                                                    | Modify  |
| `src/components/layout/__tests__/side-menu-filter.test.ts`                                    | Filter helper unit test                                                   | Create  |
| `messages/{en,ar}/office.json`                                                                | `packing.*`, `tabs.*` keys                                                | Modify  |

---

## Task 1: Trim inline Zod schemas

**Files:**

- Modify: `src/features/office/types/office-journey-schema.ts` (`driverInlineSchema` ~7-19, `carInlineSchema` ~21-37, `trailerInlineSchema` ~39-54, `makeCarInlineSchema` ~60-76, `makeDriverInlineSchema` ~78-90, `makeTrailerInlineSchema` ~92-107)
- Test: `src/features/office/types/__tests__/inline-asset-schema.test.ts` (rewrite)

- [ ] **Step 1: Rewrite the schema test to the trimmed shapes**

Replace the entire body of `inline-asset-schema.test.ts` with:

```ts
import { driverInlineSchema, carInlineSchema, trailerInlineSchema } from '../office-journey-schema';

const validDriver = {
  licenseNumber: 'LIC-001',
  licenseExpiryDate: '2030-12-31',
  user: {
    firstName: 'Ali',
    lastName: 'Hassan',
    nationalId: '2002015000001',
    phoneNumber: '01001000100',
  },
};

const validCar = {
  plateNumber: '9901',
  plateLetters: 'ن ل ن',
  licenseNumber: 'LIC-CAR-001',
  licenseExpiryDate: '2027-01-01',
};

const validTrailer = {
  plateNumber: '9902',
  plateLetters: 'م ق ط',
  licenseNumber: 'LIC-TR-001',
  licenseExpiryDate: '2027-06-01',
};

describe('inline asset schemas', () => {
  it('accepts a valid inline driver', () => {
    expect(driverInlineSchema.safeParse(validDriver).success).toBe(true);
  });

  it('rejects a driver missing user.nationalId', () => {
    const { nationalId, ...userNoId } = validDriver.user;
    const bad = { ...validDriver, user: userNoId };
    expect(driverInlineSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects a driver missing user.phoneNumber', () => {
    const { phoneNumber, ...userNoPhone } = validDriver.user;
    const bad = { ...validDriver, user: userNoPhone };
    expect(driverInlineSchema.safeParse(bad).success).toBe(false);
  });

  it('accepts a valid inline car and trailer', () => {
    expect(carInlineSchema.safeParse(validCar).success).toBe(true);
    expect(trailerInlineSchema.safeParse(validTrailer).success).toBe(true);
  });

  it('rejects a car missing licenseExpiryDate', () => {
    const { licenseExpiryDate, ...noExpiry } = validCar;
    expect(carInlineSchema.safeParse(noExpiry).success).toBe(false);
  });

  it('rejects a trailer missing plateNumber', () => {
    const { plateNumber, ...noPlate } = validTrailer;
    expect(trailerInlineSchema.safeParse(noPlate).success).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test -- src/features/office/types/__tests__/inline-asset-schema.test.ts`
Expected: FAIL — current driver schema requires `email`/`password`/`role`/`status` (so `validDriver` without them fails), and current car/trailer schemas require `manufacturer` etc. (so `validCar`/`validTrailer` fail).

- [ ] **Step 3: Replace the three static inline schemas**

In `office-journey-schema.ts`, replace `driverInlineSchema`, `carInlineSchema`, and `trailerInlineSchema` (lines ~7-54) with:

```ts
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
export type DriverInline = z.infer<typeof driverInlineSchema>;

export const carInlineSchema = z.object({
  plateNumber: z.string().min(1),
  plateLetters: z.string().min(1),
  licenseNumber: z.string().min(1),
  licenseExpiryDate: z.string().min(1),
});
export type CarInline = z.infer<typeof carInlineSchema>;

export const trailerInlineSchema = z.object({
  plateNumber: z.string().min(1),
  plateLetters: z.string().min(1),
  licenseNumber: z.string().min(1),
  licenseExpiryDate: z.string().min(1),
});
export type TrailerInline = z.infer<typeof trailerInlineSchema>;
```

- [ ] **Step 4: Replace the three translated factory schemas**

Replace `makeCarInlineSchema`, `makeDriverInlineSchema`, and `makeTrailerInlineSchema` (lines ~60-107) with:

```ts
export const makeCarInlineSchema = (t: T) =>
  z.object({
    plateNumber: z.string().min(1, t('validation.required')),
    plateLetters: z.string().min(1, t('validation.required')),
    licenseNumber: z.string().min(1, t('validation.required')),
    licenseExpiryDate: z.string().min(1, t('validation.required')),
  });

export const makeTrailerInlineSchema = (t: T) =>
  z.object({
    plateNumber: z.string().min(1, t('validation.required')),
    plateLetters: z.string().min(1, t('validation.required')),
    licenseNumber: z.string().min(1, t('validation.required')),
    licenseExpiryDate: z.string().min(1, t('validation.required')),
  });

export const makeDriverInlineSchema = (t: T) =>
  z.object({
    licenseNumber: z.string().min(1, t('validation.required')),
    licenseExpiryDate: z.string().min(1, t('validation.required')),
    user: z.object({
      firstName: z.string().min(1, t('validation.required')),
      lastName: z.string().min(1, t('validation.required')),
      nationalId: z.string().min(1, t('validation.required')),
      phoneNumber: z.string().min(1, t('validation.required')),
    }),
  });
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `pnpm test -- src/features/office/types/__tests__/inline-asset-schema.test.ts`
Expected: PASS (6 tests).

---

## Task 2: Update payload builder tests for trimmed inline shapes

**Files:**

- Modify: `src/features/office/types/__tests__/office-journey-payload.test.ts` (the `carInline` fixture ~17-32, and the inline assertions)

> The builder logic in `buildOfficeJourneyPayload` does not change — it spreads `values.carInline`/`driverInline`/`trailerInline` into `{ create }`. Only the fixture shape changes.

- [ ] **Step 1: Update the `carInline` fixture and inline assertion**

In `office-journey-payload.test.ts`, replace the `carInline` constant (lines ~17-32) with:

```ts
const carInline = {
  plateNumber: '9901',
  plateLetters: 'ن ل ن',
  licenseNumber: 'LIC',
  licenseExpiryDate: '2027-01-01',
};
```

The existing test `'NOLON: inline asset is wrapped in { create }'` asserts `expect(payload.car).toEqual({ create: carInline })` — leave that assertion as-is; it now checks the trimmed shape.

- [ ] **Step 2: Add a driver-inline assertion**

Inside the `describe('buildOfficeJourneyPayload', ...)` block, add:

```ts
it('NOLON: inline driver is wrapped in { create } with trimmed user shape', () => {
  const driverInline = {
    licenseNumber: 'LIC-002',
    licenseExpiryDate: '2030-12-31',
    user: {
      firstName: 'Fatima',
      lastName: 'Ibrahim',
      nationalId: '2002015000001',
      phoneNumber: '01001000100',
    },
  };
  const payload = buildOfficeJourneyPayload({
    ...base,
    vehicleMode: 'NOLON_CAR',
    driverInline,
  });
  expect(payload.driver).toEqual({ create: driverInline });
});
```

- [ ] **Step 3: Run the test to verify it passes**

Run: `pnpm test -- src/features/office/types/__tests__/office-journey-payload.test.ts`
Expected: PASS (6 tests). If the build complains that `driverInline` does not match `DriverInline`, confirm Task 1 Step 3 ran (the type is now the trimmed shape).

---

## Task 3: Delete obsolete inline dialogs and their tests

**Files:**

- Delete: `src/features/office/components/inline-create/car-inline-dialog.tsx`
- Delete: `src/features/office/components/inline-create/driver-inline-dialog.tsx`
- Delete: `src/features/office/components/inline-create/trailer-inline-dialog.tsx`
- Delete: `src/features/office/components/inline-create/__tests__/car-inline-dialog.test.tsx` (if present)
- Delete: `src/features/office/components/inline-create/__tests__/trailer-inline-dialog.test.tsx` (if present)

- [ ] **Step 1: Delete the dialog components and their tests**

Run:

```bash
rm -f "src/features/office/components/inline-create/car-inline-dialog.tsx" \
      "src/features/office/components/inline-create/driver-inline-dialog.tsx" \
      "src/features/office/components/inline-create/trailer-inline-dialog.tsx" \
      "src/features/office/components/inline-create/__tests__/car-inline-dialog.test.tsx" \
      "src/features/office/components/inline-create/__tests__/trailer-inline-dialog.test.tsx"
```

- [ ] **Step 2: Verify nothing else imports the deleted files**

Run: `pnpm test -- src/features/office 2>&1 | head -40`
Expected: The only failures (if any) are "Cannot find module './inline-create/...-dialog'" coming from `office-journey-form.tsx`, which Task 6 rewrites. Note them and continue — do not fix `office-journey-form.tsx` yet. Schema/payload suites (Tasks 1-2) must still PASS.

> If a stray import exists outside `office-journey-form.tsx`, grep for `inline-dialog` and remove it.

---

## Task 4: Custody-amount query hook

**Files:**

- Create: `src/features/office/api/get-custody-amount.ts`

- [ ] **Step 1: Write the hook**

Create `src/features/office/api/get-custody-amount.ts`:

```ts
import { useQuery } from '@tanstack/react-query';

import client from '@/lib/client';

export interface OfficeCustodyAmount {
  employeeId: number;
  accountId: number;
  accountName: string;
  custodyAmount: number;
}

export const useGetOfficeCustodyAmount = () => {
  const { data, isPending: isCustodyAmountPending } = useQuery<OfficeCustodyAmount>({
    queryKey: ['office-custody-amount'],
    queryFn: async () => {
      const res = await client.get('/api/journeys/office/custody-amount');
      return res.data;
    },
  });

  return { custodyAmount: data, isCustodyAmountPending };
};
```

- [ ] **Step 2: Type-check the new file compiles**

Run: `pnpm test -- src/features/office/types` (proxy that the feature still imports cleanly — no dedicated test for this thin hook).
Expected: PASS. (The hook is exercised indirectly via the form; a dedicated test is out of scope per the codebase's pattern for thin query hooks like `drivers/api/get-all.ts`.)

---

## Task 5: `AssetSelectOrCreate` component

**Files:**

- Create: `src/features/office/components/inline-create/asset-select-or-create.tsx`
- Test: `src/features/office/components/inline-create/__tests__/asset-select-or-create.test.tsx`

This component renders, per asset:

- **NOLON:** a `Tabs` with "Select" (a `SelectWithActions` dropdown, no add button) and "Create" (inline text inputs bound to RHF).
- **non-NOLON:** just the `SelectWithActions` dropdown.

It is generic over the field names so car/trailer/driver reuse it.

- [ ] **Step 1: Write the failing component test**

Create `src/features/office/components/inline-create/__tests__/asset-select-or-create.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { useForm, FormProvider } from 'react-hook-form';

import messages from '@/../messages/en/office.json';

import AssetSelectOrCreate from '../asset-select-or-create';

function Harness({ isNolon }: { isNolon: boolean }) {
  const form = useForm({ defaultValues: { carId: '', carInline: undefined } });
  return (
    <NextIntlClientProvider locale="en" messages={{ office: messages }}>
      <FormProvider {...form}>
        <AssetSelectOrCreate
          form={form}
          label="Car"
          isNolon={isNolon}
          idField="carId"
          inlineField="carInline"
          items={[{ id: '1', name: 'Car One' }]}
          createFields={[
            { name: 'plateNumber', label: messages.form.plateNumber },
            { name: 'plateLetters', label: messages.form.plateLetters },
          ]}
        />
      </FormProvider>
    </NextIntlClientProvider>
  );
}

describe('AssetSelectOrCreate', () => {
  it('shows the Select and Create tabs in NOLON mode', () => {
    render(<Harness isNolon />);
    expect(screen.getByRole('tab', { name: messages.tabs.select })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: messages.tabs.create })).toBeInTheDocument();
  });

  it('shows no tabs (plain select only) outside NOLON', () => {
    render(<Harness isNolon={false} />);
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Add the `tabs.*` i18n keys (en + ar)**

In `messages/en/office.json`, after the `"inline"` block's closing `}` add a new top-level `"tabs"` block (inside the root object):

```json
"tabs": {
  "select": "Select",
  "create": "Create"
}
```

In `messages/ar/office.json`, add the matching block:

```json
"tabs": {
  "select": "اختيار",
  "create": "إضافة"
}
```

> Place it as a sibling of `"inline"` (mind the trailing commas so the JSON stays valid).

- [ ] **Step 3: Run the test to verify it fails**

Run: `pnpm test -- src/features/office/components/inline-create/__tests__/asset-select-or-create.test.tsx`
Expected: FAIL — `asset-select-or-create.tsx` does not exist yet.

- [ ] **Step 4: Implement the component**

Create `src/features/office/components/inline-create/asset-select-or-create.tsx`:

```tsx
'use client';

import { useState } from 'react';

import { useTranslations } from 'next-intl';
import type { UseFormReturn } from 'react-hook-form';

import SelectWithActions from '@/components/common/select-with-actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface CreateField {
  /** dot-path under inlineField, e.g. "plateNumber" or "user.firstName" */
  name: string;
  label: string;
  type?: string;
}

interface AssetSelectOrCreateProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
  label: string;
  isNolon: boolean;
  idField: string;
  inlineField: string;
  items: { id: string; name: string }[];
  createFields: CreateField[];
}

export default function AssetSelectOrCreate({
  form,
  label,
  isNolon,
  idField,
  inlineField,
  items,
  createFields,
}: AssetSelectOrCreateProps) {
  const t = useTranslations('office');
  const [open, setOpen] = useState(false);

  const SelectPanel = (
    <SelectWithActions
      open={open}
      setOpen={setOpen}
      value={form.watch(idField)}
      items={items}
      handleSelect={(v) => {
        form.setValue(idField, v ?? '');
        form.setValue(inlineField, undefined);
      }}
      handleLoadMore={() => {}}
      showSearch
      canAddItem={false}
      placeholder={t('form.selectPlaceholder')}
    />
  );

  if (!isNolon) {
    return (
      <div className="flex flex-col gap-1">
        <Label>{label}</Label>
        {SelectPanel}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <Label>{label}</Label>
      <Tabs
        defaultValue="select"
        onValueChange={(tab) => {
          if (tab === 'select') form.setValue(inlineField, undefined);
          else form.setValue(idField, '');
        }}
      >
        <TabsList>
          <TabsTrigger value="select">{t('tabs.select')}</TabsTrigger>
          <TabsTrigger value="create">{t('tabs.create')}</TabsTrigger>
        </TabsList>
        <TabsContent value="select">{SelectPanel}</TabsContent>
        <TabsContent value="create">
          <div className="grid grid-cols-2 gap-3">
            {createFields.map(({ name, label: fieldLabel, type }) => (
              <div key={name} className="flex flex-col gap-1">
                <Label>{fieldLabel}</Label>
                <Input type={type ?? 'text'} {...form.register(`${inlineField}.${name}`)} />
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `pnpm test -- src/features/office/components/inline-create/__tests__/asset-select-or-create.test.tsx`
Expected: PASS (2 tests).

---

## Task 6: Rewrite the journey form (assets via tabs, packing + custody dropdowns)

**Files:**

- Modify: `src/features/office/components/office-journey-form.tsx` (full rewrite)
- Modify: `src/features/office/hooks/use-office-journey-form.ts` (expose custody data)

- [ ] **Step 1: Expose custody-amount + packing options from the hook**

In `use-office-journey-form.ts`, add the import and return the custody data. Replace the import block top (after the existing feature imports) and the return statement.

Add this import near the other imports:

```ts
import { useGetOfficeCustodyAmount } from '../api/get-custody-amount';
```

Inside `useOfficeJourneyForm`, after `const { clients } = useGetAllClients();`, add:

```ts
const { custodyAmount: officeCustody, isCustodyAmountPending } = useGetOfficeCustodyAmount();
```

Then extend the returned object (the `return { ... }` near line 47-55) to include:

```ts
    officeCustody,
    isCustodyAmountPending,
```

(Keep all existing returned keys.)

- [ ] **Step 2: Rewrite `office-journey-form.tsx`**

Replace the entire contents of `src/features/office/components/office-journey-form.tsx` with:

```tsx
'use client';

import { useTranslations } from 'next-intl';

import SelectWithActions from '@/components/common/select-with-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PackingType, packingTypeLabels } from '@/features/clients/enums/packing-type';

import type { VehicleMode } from '../enums/vehicle-mode';
import { useOfficeJourneyForm } from '../hooks/use-office-journey-form';
import AssetSelectOrCreate from './inline-create/asset-select-or-create';

interface OfficeJourneyFormProps {
  vehicleMode: VehicleMode;
}

export default function OfficeJourneyForm({ vehicleMode }: OfficeJourneyFormProps) {
  const t = useTranslations('office');
  const { form, onSubmit, isSubmitting, cars, trailers, drivers, clients, officeCustody } =
    useOfficeJourneyForm(vehicleMode);
  const isNolon = vehicleMode === 'NOLON_CAR';

  const Field = ({ label, name }: { label: string; name: string }) => (
    <div className="flex flex-col gap-1">
      <Label>{label}</Label>
      <Input {...form.register(name as never)} />
    </div>
  );

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4" dir="rtl">
      <Field label={t('form.delegateNumber')} name="delegateNumber" />

      <AssetSelectOrCreate
        form={form}
        label={t('form.car')}
        isNolon={isNolon}
        idField="carId"
        inlineField="carInline"
        items={cars.map((c: any) => ({ id: String(c.id), name: `${c.carCode} - ${c.model}` }))}
        createFields={[
          { name: 'plateNumber', label: t('form.plateNumber') },
          { name: 'plateLetters', label: t('form.plateLetters') },
          { name: 'licenseNumber', label: t('form.licenseNumber') },
          { name: 'licenseExpiryDate', label: t('form.licenseExpiryDate'), type: 'date' },
        ]}
      />

      <AssetSelectOrCreate
        form={form}
        label={t('form.trailer')}
        isNolon={isNolon}
        idField="trailerId"
        inlineField="trailerInline"
        items={trailers.map((tr: any) => ({
          id: String(tr.id),
          name: tr.chassis ?? String(tr.id),
        }))}
        createFields={[
          { name: 'plateNumber', label: t('form.plateNumber') },
          { name: 'plateLetters', label: t('form.plateLetters') },
          { name: 'licenseNumber', label: t('form.licenseNumber') },
          { name: 'licenseExpiryDate', label: t('form.licenseExpiryDate'), type: 'date' },
        ]}
      />

      <AssetSelectOrCreate
        form={form}
        label={t('form.driver')}
        isNolon={isNolon}
        idField="driverId"
        inlineField="driverInline"
        items={drivers.map((d: any) => ({ id: String(d.id), name: d.driverName }))}
        createFields={[
          { name: 'user.firstName', label: t('form.firstName') },
          { name: 'user.lastName', label: t('form.lastName') },
          { name: 'user.nationalId', label: t('form.nationalId') },
          { name: 'user.phoneNumber', label: t('form.phoneNumber') },
          { name: 'licenseNumber', label: t('form.licenseNumber') },
          { name: 'licenseExpiryDate', label: t('form.licenseExpiryDate'), type: 'date' },
        ]}
      />

      <Field label={t('form.assistant')} name="driverAssistantId" />
      <Field label={t('form.sellingOrderNo')} name="sellingOrderNo" />

      <div className="flex flex-col gap-1">
        <Label>{t('form.client')}</Label>
        <SelectWithActions
          open={false}
          setOpen={() => {}}
          value={form.watch('clientId')}
          items={clients.map((c: any) => ({ id: String(c.id), name: c.name }))}
          handleSelect={(v) => form.setValue('clientId', v ?? '')}
          handleLoadMore={() => {}}
          showSearch
          placeholder={t('form.selectPlaceholder')}
        />
      </div>

      <Field label={t('form.direction')} name="direction" />
      <Field label={t('form.receivedCompany')} name="receivedCompany" />

      {/* Packing type — enum dropdown */}
      <div className="flex flex-col gap-1">
        <Label>{t('form.packingType')}</Label>
        <Select
          value={form.watch('packingType')}
          onValueChange={(v) => form.setValue('packingType', v)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t('form.selectPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            {Object.values(PackingType).map((pt) => (
              <SelectItem key={pt} value={pt}>
                {t(`packing.${pt}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Field label={t('form.cementGrade')} name="cementGrade" />
      <Field label={t('form.quantity')} name="quantity" />

      {/* Custody — single option from custody-amount endpoint */}
      <div className="flex flex-col gap-1">
        <Label>{t('form.custodyAmount')}</Label>
        <Select
          value={form.watch('custodyAmount')}
          onValueChange={(v) => form.setValue('custodyAmount', v)}
          disabled={!officeCustody}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t('form.selectPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            {officeCustody && (
              <SelectItem value={String(officeCustody.custodyAmount)}>
                {officeCustody.accountName} — {officeCustody.custodyAmount} {t('form.currency')}
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-start gap-2 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {t('form.save')}
        </Button>
      </div>
    </form>
  );
}
```

> Note: `packingTypeLabels` is imported but the JSX uses i18n keys `t('packing.${pt}')` per the spec. Keep the import only if used; if lint flags it unused, drop `packingTypeLabels` from the import (leave `PackingType`).

- [ ] **Step 3: Add the `packing.*` i18n keys (en + ar)**

In `messages/en/office.json`, add a top-level `"packing"` block (sibling of `"form"`):

```json
"packing": {
  "BAGGED": "Bagged",
  "JUMBO_BAG": "Jumbo Bag",
  "SILO10": "Silo 10%",
  "SILO12": "Silo 12%",
  "LOOSE": "Loose"
}
```

In `messages/ar/office.json`, add:

```json
"packing": {
  "BAGGED": "معبأ",
  "JUMBO_BAG": "جامبو",
  "SILO10": "سليو %10",
  "SILO12": "سليو %12",
  "LOOSE": "سايب"
}
```

> Mind trailing commas so both files stay valid JSON.

- [ ] **Step 4: Run the office suite to confirm form + schema integration**

Run: `pnpm test -- src/features/office`
Expected: PASS for all office suites (inline-asset-schema, office-journey-payload, asset-select-or-create, plus pre-existing validation/vehicle-mode/ownership/choice-card tests). The form has no dedicated render test, so this validates the surrounding units and that imports resolve.

---

## Task 7: Office landing → mode selection + URL move

**Files:**

- Modify: `src/features/office/components/vehicle-mode-selection.tsx`
- Modify: `src/app/[locale]/(loggedIn)/office/page.tsx`
- Create: `src/app/[locale]/(loggedIn)/office/[mode]/page.tsx`
- Delete: `src/app/[locale]/(loggedIn)/office/issue-delegation/` (recursively)
- Delete: `src/features/office/components/office-landing.tsx`
- Modify: `src/config/routes.ts`

- [ ] **Step 1: Point the mode cards at `/office/{mode}`**

Replace `src/features/office/components/vehicle-mode-selection.tsx` with:

```tsx
'use client';

import { useTranslations } from 'next-intl';

import ChoiceCard from './choice-card';

export default function VehicleModeSelection() {
  const t = useTranslations('office');
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3" dir="rtl">
      <ChoiceCard title={t('modes.nolon')} href="/office/nolon-car" />
      <ChoiceCard title={t('modes.contract')} href="/office/contract-car" />
      <ChoiceCard title={t('modes.company')} href="/office/company-car" />
    </div>
  );
}
```

- [ ] **Step 2: Make `/office` render the mode selection**

Replace `src/app/[locale]/(loggedIn)/office/page.tsx` with:

```tsx
import VehicleModeSelection from '@/features/office/components/vehicle-mode-selection';

export default function OfficePage() {
  return <VehicleModeSelection />;
}
```

- [ ] **Step 3: Create the moved create page at `/office/[mode]`**

Create `src/app/[locale]/(loggedIn)/office/[mode]/page.tsx`:

```tsx
import { notFound } from 'next/navigation';

import OfficeJourneyForm from '@/features/office/components/office-journey-form';
import { slugToVehicleMode } from '@/features/office/enums/vehicle-mode';

interface PageProps {
  params: Promise<{ mode: string; locale: string }>;
}

export default async function OfficeModePage({ params }: PageProps) {
  const { mode } = await params;
  const vehicleMode = slugToVehicleMode(mode);
  if (!vehicleMode) notFound();
  return (
    <div className="container mx-auto max-w-3xl">
      <OfficeJourneyForm vehicleMode={vehicleMode} />
    </div>
  );
}
```

- [ ] **Step 4: Delete the old route tree and landing component**

Run:

```bash
rm -rf "src/app/[locale]/(loggedIn)/office/issue-delegation"
rm -f "src/features/office/components/office-landing.tsx"
```

- [ ] **Step 5: Remove the stale route-title key**

In `src/config/routes.ts`, delete this line from the `nestedRoutes` object:

```ts
  'issue-delegation': 'اصدار تفويض',
```

(Leave `nolon-car` / `contract-car` / `company-car` — they still resolve as `parts[2]` for `/office/<slug>`.)

- [ ] **Step 6: Verify the office suite still passes and the build resolves routes**

Run: `pnpm test -- src/features/office`
Expected: PASS. `office-landing.tsx` has no test; deleting it must not break any suite. If a test imported `OfficeLanding`, remove that test (none expected).

Run: `pnpm build 2>&1 | tail -30`
Expected: Build succeeds and shows a route for `/[locale]/office/[mode]` and no `/office/issue-delegation`. (If `pnpm build` is too slow/flaky in this environment, `pnpm check-types` is an acceptable substitute to confirm no dangling imports.)

---

## Task 8: Role-gated sidebar

**Files:**

- Modify: `src/components/layout/side-menu.tsx`
- Create: `src/components/layout/__tests__/side-menu-filter.test.ts`

- [ ] **Step 1: Write the failing filter test**

Create `src/components/layout/__tests__/side-menu-filter.test.ts`:

```ts
import { filterMenuByRole } from '../side-menu';
import type { SideMenuItem } from '@/utils/icons';

const items: SideMenuItem[] = [
  { key: 'trips', alt: 'Trips', href: '/trips' },
  { key: 'cars', alt: 'Cars', href: '/cars' },
  { key: 'office', alt: 'Office', href: '/office' },
];

describe('filterMenuByRole', () => {
  it('EMPLOYEE sees only the office item', () => {
    const result = filterMenuByRole(items, 'EMPLOYEE');
    expect(result.map((i) => i.key)).toEqual(['office']);
  });

  it('ADMIN sees all items including office', () => {
    expect(filterMenuByRole(items, 'ADMIN')).toHaveLength(3);
  });

  it('unknown/other roles see all items (fallback)', () => {
    expect(filterMenuByRole(items, 'user')).toHaveLength(3);
    expect(filterMenuByRole(items, undefined)).toHaveLength(3);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test -- src/components/layout/__tests__/side-menu-filter.test.ts`
Expected: FAIL — `filterMenuByRole` is not exported yet.

- [ ] **Step 3: Add the filter helper and wire role into `SideMenu`**

In `src/components/layout/side-menu.tsx`:

Add the import for the session hook and the type at the top (after the existing imports):

```tsx
import { useSession } from 'next-auth/react';

import type { SideMenuItem } from '@/utils/icons';
```

Add the exported pure helper above the `SideMenu` component:

```tsx
export function filterMenuByRole(items: SideMenuItem[], role: string | undefined): SideMenuItem[] {
  if (role === 'EMPLOYEE') return items.filter((item) => item.key === 'office');
  return items;
}
```

Inside `SideMenu`, read the role and filter before mapping. Change the start of the component body:

```tsx
export default function SideMenu() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const cleanPath = pathname.replace(/^\/(ar|en)/, '');
  const items = filterMenuByRole(sideMenuIcons, session?.user?.role);
```

Then change the map to iterate `items` instead of `sideMenuIcons`:

```tsx
      {items.map(({ key, alt, href, subItems }) => {
```

(Leave the rest of the JSX unchanged.)

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test -- src/components/layout/__tests__/side-menu-filter.test.ts`
Expected: PASS (3 tests).

> If `session.user.role` is not typed on the next-auth `Session`, the helper still takes `string | undefined`, so `session?.user?.role` may need a cast: `(session?.user as { role?: string } | undefined)?.role`. Use that cast if `pnpm check-types` complains.

---

## Task 9: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Run the entire office suite + sidebar test**

Run: `pnpm test -- src/features/office src/components/layout`
Expected: All suites PASS.

- [ ] **Step 2: Type-check the whole project**

Run: `pnpm check-types`
Expected: No errors in `src/features/office`, `src/components/layout`, `src/app/[locale]/(loggedIn)/office`, `src/config/routes.ts`. Pre-existing errors unrelated to this work may be noted but not fixed (out of scope).

- [ ] **Step 3: Report completion**

Summarize: `/office` is the mode selection at `/office/[mode]`; sidebar is role-gated (EMPLOYEE→office only, ADMIN→all); car/trailer/driver use Select/Create tabs on NOLON with trimmed inline payloads; packingType + custody are dropdowns. **Do not commit** — leave changes in the working tree for the user to review.

---

## Self-Review Notes

- **Spec coverage:** §1 ↔ Task 7; §2 ↔ Task 8; §3 ↔ Tasks 1-3, 5, 6; §4 ↔ Task 6 (Step 2-3); §5 ↔ Tasks 4, 6. File-summary table ↔ tasks 1-9.
- **Type consistency:** `CarInline`/`TrailerInline`/`DriverInline` are redefined once (Task 1) and consumed unchanged by `buildOfficeJourneyPayload` (already spreads them) and `AssetSelectOrCreate` (writes via dot-path `inlineField.name`). `OfficeCustodyAmount` defined in Task 4, consumed in Task 6. `SideMenuItem` imported from `@/utils/icons` in both the test and `side-menu.tsx`. `filterMenuByRole` named consistently across Task 8.
- **Driver dot-paths:** `AssetSelectOrCreate` registers `driverInline.user.firstName` etc. via `${inlineField}.${name}` with `name='user.firstName'` → `driverInline.user.firstName`, matching the `DriverInline` shape. ✓
- **Out of scope (unchanged):** `officeJourneySchema.superRefine` (car-required rule stays), backend auth, broken `next lint` hook, commits.
- **YAGNI:** No `manufacturer`/`model`/`status`/`axles`/`email`/`password` collected or sent — backend fills the rest per the user's sample payload.

```

```
