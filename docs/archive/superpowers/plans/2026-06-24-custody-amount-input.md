# Custody Amount Input Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `custodyAmount` `<Select>` dropdown in the office journey form with an editable `<Input type="number">` whose maximum value is enforced via Zod validation against the value returned by the custody-amount API.

**Architecture:** A factory function `makeOfficeJourneySchema(maxCustody)` replaces the static `officeJourneySchema` export. The hook derives the Zod resolver via `useMemo` so it reacts when the API value arrives. The form UI swaps the `<Select>` for a `<Input>` that is disabled while loading and shows the max as a placeholder.

**Tech Stack:** Zod, React Hook Form (`@hookform/resolvers/zod`), TanStack Query, Next.js, shadcn/ui `<Input>`, Jest + jsdom

---

## File Map

| File                                                                    | Change                                                                                                                                                         |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/features/office/types/office-journey-schema.ts`                    | Replace static `officeJourneySchema` with `makeOfficeJourneySchema(maxCustody: number)` factory; keep static schemas and `buildOfficeJourneyPayload` unchanged |
| `src/features/office/types/__tests__/office-journey-validation.test.ts` | Update imports to use `makeOfficeJourneySchema`; add 4 new custody-max test cases                                                                              |
| `src/features/office/hooks/use-office-journey-form.ts`                  | Add `useMemo` to derive schema from `officeCustody?.custodyAmount`; pass dynamic resolver to `useForm`                                                         |
| `src/features/office/components/office-journey-form.tsx`                | Replace `<Select>` for `custodyAmount` with `<Input type="number">`                                                                                            |

---

## Task 1: Replace static schema with factory function

**Files:**

- Modify: `src/features/office/types/office-journey-schema.ts`

- [ ] **Step 1: Update the schema export**

In `src/features/office/types/office-journey-schema.ts`, replace the `officeJourneySchema` constant with a factory function. The `superRefine` car-required rule must stay exactly as-is. Replace lines 164–189 with:

```ts
export function makeOfficeJourneySchema(maxCustody: number) {
  return z
    .object({
      vehicleMode: z.enum(['NOLON_CAR', 'CONTRACT_CAR', 'COMPANY_CAR']),
      clientId: z.string().min(1, 'مطلوب'),
      carId: z.string(),
      carInline: carInlineSchema.optional(),
      trailerId: z.string(),
      trailerInline: trailerInlineSchema.optional(),
      driverId: z.string(),
      driverInline: driverInlineSchema.optional(),
      driverAssistantId: z.string(),
      delegateNumber: z.string(),
      direction: z.string(),
      sellingOrderNo: z.string(),
      receivedCompany: z.string(),
      packingType: z.string(),
      cementGrade: z.string(),
      quantity: z.string(),
      custodyAmount: z
        .string()
        .refine((v) => !v || Number(v) <= maxCustody, `لا يمكن أن يتجاوز ${maxCustody}`),
    })
    .superRefine((v, ctx) => {
      const hasCar = !!v.carId || !!v.carInline;
      if (!hasCar) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'السيارة مطلوبة', path: ['carId'] });
      }
    });
}

export const officeJourneySchema = makeOfficeJourneySchema(Infinity);
```

The alias `export const officeJourneySchema = makeOfficeJourneySchema(Infinity)` keeps the existing test file (`office-journey-validation.test.ts`) compiling without changes until Task 2 updates it.

- [ ] **Step 2: Verify TypeScript compiles**

```bash
pnpm tsc --noEmit
```

Expected: no errors related to `office-journey-schema.ts`.

---

## Task 2: Update schema tests

**Files:**

- Modify: `src/features/office/types/__tests__/office-journey-validation.test.ts`

- [ ] **Step 1: Write updated test file**

Replace the entire contents of `src/features/office/types/__tests__/office-journey-validation.test.ts` with:

```ts
import { makeOfficeJourneySchema, emptyOfficeJourneyValues } from '../office-journey-schema';

const schema = makeOfficeJourneySchema(Infinity);

describe('officeJourneySchema', () => {
  it('requires clientId', () => {
    const r = schema.safeParse({
      ...emptyOfficeJourneyValues,
      vehicleMode: 'NOLON_CAR',
    });
    expect(r.success).toBe(false);
  });

  it('NOLON passes with a selected car id', () => {
    const r = schema.safeParse({
      ...emptyOfficeJourneyValues,
      vehicleMode: 'NOLON_CAR',
      clientId: '4',
      carId: '7',
    });
    expect(r.success).toBe(true);
  });

  it('NOLON passes with an inline car (no id)', () => {
    const r = schema.safeParse({
      ...emptyOfficeJourneyValues,
      vehicleMode: 'NOLON_CAR',
      clientId: '4',
      carInline: {
        plateNumber: '9901',
        plateLetters: 'ن',
        licenseNumber: 'L',
        licenseExpiryDate: '2027-01-01',
      },
    });
    expect(r.success).toBe(true);
  });

  it('CONTRACT fails without a car id', () => {
    const r = schema.safeParse({
      ...emptyOfficeJourneyValues,
      vehicleMode: 'CONTRACT_CAR',
      clientId: '4',
    });
    expect(r.success).toBe(false);
  });
});

describe('makeOfficeJourneySchema — custodyAmount max validation', () => {
  const base = {
    ...emptyOfficeJourneyValues,
    vehicleMode: 'NOLON_CAR' as const,
    clientId: '4',
    carId: '7',
  };

  it('empty custodyAmount is valid (field is optional)', () => {
    const s = makeOfficeJourneySchema(5000);
    expect(s.safeParse({ ...base, custodyAmount: '' }).success).toBe(true);
  });

  it('value equal to max is valid', () => {
    const s = makeOfficeJourneySchema(5000);
    expect(s.safeParse({ ...base, custodyAmount: '5000' }).success).toBe(true);
  });

  it('value below max is valid', () => {
    const s = makeOfficeJourneySchema(5000);
    expect(s.safeParse({ ...base, custodyAmount: '4999' }).success).toBe(true);
  });

  it('value above max is invalid with Arabic error message', () => {
    const s = makeOfficeJourneySchema(5000);
    const r = s.safeParse({ ...base, custodyAmount: '5001' });
    expect(r.success).toBe(false);
    if (!r.success) {
      const custodyError = r.error.issues.find((i) => i.path.includes('custodyAmount'));
      expect(custodyError?.message).toBe('لا يمكن أن يتجاوز 5000');
    }
  });
});
```

- [ ] **Step 2: Run the tests and confirm they all pass**

```bash
pnpm test -- src/features/office/types/__tests__/office-journey-validation.test.ts
```

Expected: all 8 tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/features/office/types/office-journey-schema.ts src/features/office/types/__tests__/office-journey-validation.test.ts
git commit -m "feat(office): replace static officeJourneySchema with makeOfficeJourneySchema factory with custody max validation"
```

---

## Task 3: Update hook to use dynamic resolver

**Files:**

- Modify: `src/features/office/hooks/use-office-journey-form.ts`

- [ ] **Step 1: Add `useMemo` import and derive schema dynamically**

Replace the entire contents of `src/features/office/hooks/use-office-journey-form.ts` with:

```ts
'use client';

import { useMemo } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import { useGetAllCars } from '@/features/cars/api/get-all';
import { useGetAllClients } from '@/features/clients/api/get-all';
import { useGetAllDriverAssistants } from '@/features/driver-assistants/api/get-all';
import { useGetAllDrivers } from '@/features/drivers/api/get-all';
import { useGetAllTrailers } from '@/features/trailers/api/get-all';

import { useCreateOfficeJourney } from '../api/create-office-journey';
import { useGetOfficeCustodyAmount } from '../api/get-custody-amount';
import type { VehicleMode } from '../enums/vehicle-mode';
import {
  buildOfficeJourneyPayload,
  emptyOfficeJourneyValues,
  makeOfficeJourneySchema,
  type OfficeJourneyFormValues,
} from '../types/office-journey-schema';

export function useOfficeJourneyForm(
  vehicleMode: VehicleMode,
  onCreated: (journeyId: number) => void,
) {
  const { cars } = useGetAllCars();
  const { trailers } = useGetAllTrailers();
  const { drivers } = useGetAllDrivers();
  const { clients } = useGetAllClients();
  const { driverAssistants, isGetDriverAssistantsPending } = useGetAllDriverAssistants();
  const { custodyAmount: officeCustody, isCustodyAmountPending } = useGetOfficeCustodyAmount();
  const { createOfficeJourneyMutation, isCreateOfficeJourneyPending } = useCreateOfficeJourney();

  const max = officeCustody?.custodyAmount ?? Infinity;
  const schema = useMemo(() => makeOfficeJourneySchema(max), [max]);

  const form = useForm<OfficeJourneyFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { ...emptyOfficeJourneyValues, vehicleMode },
  });

  const submitFn = (values: OfficeJourneyFormValues) => {
    const payload = buildOfficeJourneyPayload(values);
    createOfficeJourneyMutation(payload, {
      onSuccess: (data) => {
        form.reset({ ...emptyOfficeJourneyValues, vehicleMode });
        onCreated(data.id);
      },
    });
  };

  return {
    form,
    onSubmit: form.handleSubmit(submitFn, () => toast.error('يرجى تعبئة الحقول المطلوبة')),
    isSubmitting: isCreateOfficeJourneyPending,
    cars: cars ?? [],
    trailers: trailers ?? [],
    drivers: drivers ?? [],
    clients: clients ?? [],
    driverAssistants: driverAssistants ?? [],
    isGetDriverAssistantsPending,
    officeCustody,
    isCustodyAmountPending,
  };
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/office/hooks/use-office-journey-form.ts
git commit -m "feat(office): derive officeJourneySchema resolver dynamically from API custody max"
```

---

## Task 4: Replace Select with Input in form UI

**Files:**

- Modify: `src/features/office/components/office-journey-form.tsx`

- [ ] **Step 1: Remove unused Select imports and replace the custodyAmount block**

In `src/features/office/components/office-journey-form.tsx`:

1. Remove these imports (they are no longer used after this change if no other `<Select>` remains — check first; `packing-type` Select still uses them so keep them):
   - No import removal needed — the packing-type and assistant fields still use `Select`.

2. Find the `custodyAmount` `<Select>` block (lines 188–206) and replace it entirely with:

```tsx
<div className="flex flex-col gap-1">
  <Label>{t('form.custodyAmount')}</Label>
  <Input
    type="number"
    placeholder={isCustodyAmountPending ? '...' : String(officeCustody?.custodyAmount ?? '')}
    disabled={isCustodyAmountPending}
    {...form.register('custodyAmount')}
  />
  {form.formState.errors.custodyAmount && (
    <p className="text-sm text-destructive">
      {form.formState.errors.custodyAmount.message as string}
    </p>
  )}
</div>
```

The `<Select>`, `<SelectTrigger>`, `<SelectValue>`, `<SelectContent>`, and both `<SelectItem>` children for custody are deleted.

- [ ] **Step 2: Verify TypeScript compiles**

```bash
pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Run all office tests**

```bash
pnpm test -- src/features/office
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/features/office/components/office-journey-form.tsx
git commit -m "feat(office): replace custodyAmount Select with number Input bounded by API max"
```

---

## Self-Review

**Spec coverage:**

- ✅ API value used as max (factory + `useMemo`)
- ✅ User can type freely (plain `<Input type="number">`)
- ✅ Exceeding max → validation error in Arabic
- ✅ Placeholder shows max value
- ✅ Disabled while loading (`isCustodyAmountPending`)
- ✅ Applies to all vehicle modes (schema has no mode condition)
- ✅ API failure fallback → `Infinity` max, no placeholder, input enabled
- ✅ Tests: empty valid, equal valid, below valid, above invalid with message

**Placeholder scan:** None found.

**Type consistency:**

- `makeOfficeJourneySchema` defined in Task 1, imported in Task 2 (tests) and Task 3 (hook) — consistent.
- `officeJourneySchema` alias kept so `inline-asset-schema.test.ts` and `office-journey-payload.test.ts` (which don't import it) are unaffected; `office-journey-validation.test.ts` is explicitly updated in Task 2.
- `officeCustody` and `isCustodyAmountPending` already returned from hook — used in Task 4 form — consistent.
