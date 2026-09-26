# Phase 6 — Office Create-Journey Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the employee "Office" flow — a landing screen, a vehicle-mode chooser, and a journey-creation form (NOLON / Contract / Company) with inline NOLON asset creation — wired to `POST /api/journeys/office`.

**Architecture:** New `src/features/office/` feature (Option A). Pure, unit-tested logic (Zod schema + a `buildOfficeJourneyPayload` mapper) is separated from React components. One `office-journey-form` component renders fields conditionally by `vehicleMode`; NOLON asset selects use the existing `SelectWithActions` with a "+ New" dialog that writes an _inline asset object_ into form state, sent inside the journey body so the backend creates it atomically. Thin Next.js route pages render feature client components, matching the existing `trips/create-delegate` pattern.

**Tech Stack:** Next.js App Router (RSC + client components), TanStack Query (base `useCreate`), React Hook Form + Zod, next-intl (RTL Arabic), Tailwind/shadcn UI, Jest + @testing-library/react.

**Spec:** [docs/superpowers/specs/2026-06-12-phase-6-office-custody-requests-design.md](../specs/2026-06-12-phase-6-office-custody-requests-design.md) · **API:** [phase-6-api.md §3.1](../../../../frontend/phase-6-api.md)

---

## File Structure

| File                                                                     | Responsibility                                                                                                   |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `src/features/office/enums/vehicle-mode.ts`                              | `VehicleMode` enum, URL-slug ↔ enum mapping                                                                     |
| `src/features/office/types/office-journey-schema.ts`                     | Inline asset Zod schemas, form-values type, journey Zod schema, `buildOfficeJourneyPayload` mapper, payload type |
| `src/features/office/api/create-office-journey.ts`                       | `useCreateOfficeJourney` (wraps base `useCreate`)                                                                |
| `src/features/office/components/choice-card.tsx`                         | Large white clickable card used by the two landing screens                                                       |
| `src/features/office/components/office-landing.tsx`                      | 2 cards: register-policy / issue-delegation                                                                      |
| `src/features/office/components/vehicle-mode-selection.tsx`              | 3 cards: NOLON / Contract / Company                                                                              |
| `src/features/office/components/inline-create/driver-inline-dialog.tsx`  | Dialog collecting inline driver fields                                                                           |
| `src/features/office/components/inline-create/car-inline-dialog.tsx`     | Dialog collecting inline car fields                                                                              |
| `src/features/office/components/inline-create/trailer-inline-dialog.tsx` | Dialog collecting inline trailer fields                                                                          |
| `src/features/office/components/office-journey-form.tsx`                 | The create form (mode-conditional fields + asset selects + submit)                                               |
| `src/features/office/hooks/use-office-journey-form.ts`                   | Orchestration: RHF setup, dropdown data, submit handler                                                          |
| `src/app/[locale]/(loggedIn)/office/page.tsx`                            | Route → `OfficeLanding`                                                                                          |
| `src/app/[locale]/(loggedIn)/office/issue-delegation/page.tsx`           | Route → `VehicleModeSelection`                                                                                   |
| `src/app/[locale]/(loggedIn)/office/issue-delegation/[mode]/page.tsx`    | Route → `OfficeJourneyForm`                                                                                      |
| `messages/{ar,en}/office.json`                                           | i18n namespace `office`                                                                                          |
| `src/i18n/request.ts` (modify)                                           | Register the `office` namespace                                                                                  |
| `src/utils/icons.ts` (modify)                                            | Add `office` side-menu entry + icon                                                                              |
| `src/config/routes.ts` (modify)                                          | Breadcrumb labels for the new segments                                                                           |

---

## Task 0: Prerequisite — install deps & verify test runner

**Files:** none (environment setup)

- [ ] **Step 1: Install dependencies**

Run: `pnpm install`
Expected: completes; `node_modules/` now exists.

- [ ] **Step 2: Verify the test runner works**

Run: `pnpm test -- --passWithNoTests`
Expected: Jest starts and exits 0. If it fails with `jest: command not found` / `Cannot find module 'jest'`, add it: `pnpm add -D jest`, then re-run.

- [ ] **Step 3: Verify the build baseline is green**

Run: `pnpm build`
Expected: build succeeds (the pre-commit hook runs prettier→lint→build, so this must pass for commits to land).

---

## Task 1: Vehicle-mode enum & URL-slug mapping

**Files:**

- Create: `src/features/office/enums/vehicle-mode.ts`
- Test: `src/features/office/enums/__tests__/vehicle-mode.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/features/office/enums/__tests__/vehicle-mode.test.ts
import { VEHICLE_MODES, slugToVehicleMode, vehicleModeToSlug } from '../vehicle-mode';

describe('vehicle-mode', () => {
  it('lists the three backend modes', () => {
    expect(VEHICLE_MODES).toEqual(['NOLON_CAR', 'CONTRACT_CAR', 'COMPANY_CAR']);
  });

  it('maps url slugs to enum values', () => {
    expect(slugToVehicleMode('nolon-car')).toBe('NOLON_CAR');
    expect(slugToVehicleMode('contract-car')).toBe('CONTRACT_CAR');
    expect(slugToVehicleMode('company-car')).toBe('COMPANY_CAR');
  });

  it('returns undefined for an unknown slug', () => {
    expect(slugToVehicleMode('bus')).toBeUndefined();
  });

  it('maps enum values back to slugs', () => {
    expect(vehicleModeToSlug('NOLON_CAR')).toBe('nolon-car');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/features/office/enums/__tests__/vehicle-mode.test.ts`
Expected: FAIL — `Cannot find module '../vehicle-mode'`.

- [ ] **Step 3: Write the implementation**

```ts
// src/features/office/enums/vehicle-mode.ts
export const VEHICLE_MODES = ['NOLON_CAR', 'CONTRACT_CAR', 'COMPANY_CAR'] as const;
export type VehicleMode = (typeof VEHICLE_MODES)[number];

const SLUG_TO_MODE = {
  'nolon-car': 'NOLON_CAR',
  'contract-car': 'CONTRACT_CAR',
  'company-car': 'COMPANY_CAR',
} as const satisfies Record<string, VehicleMode>;

export type VehicleModeSlug = keyof typeof SLUG_TO_MODE;

export function slugToVehicleMode(slug: string): VehicleMode | undefined {
  return SLUG_TO_MODE[slug as VehicleModeSlug];
}

export function vehicleModeToSlug(mode: VehicleMode): VehicleModeSlug {
  return (Object.keys(SLUG_TO_MODE) as VehicleModeSlug[]).find(
    (slug) => SLUG_TO_MODE[slug] === mode,
  )!;
}

export const VEHICLE_MODE_SLUGS = Object.keys(SLUG_TO_MODE) as VehicleModeSlug[];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- src/features/office/enums/__tests__/vehicle-mode.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/features/office/enums
git commit -m "feat(office): add vehicle-mode enum and slug mapping"
```

---

## Task 2: Inline asset Zod schemas

**Files:**

- Create: `src/features/office/types/office-journey-schema.ts` (schemas only in this task)
- Test: `src/features/office/types/__tests__/inline-asset-schema.test.ts`

These mirror the inline shapes in [phase-6-api.md §3.1](../../../../frontend/phase-6-api.md).

- [ ] **Step 1: Write the failing test**

```ts
// src/features/office/types/__tests__/inline-asset-schema.test.ts
import { driverInlineSchema, carInlineSchema, trailerInlineSchema } from '../office-journey-schema';

const validDriver = {
  licenseNumber: 'LIC-001',
  licenseExpiryDate: '2030-12-31',
  user: {
    firstName: 'Ali',
    lastName: 'Hassan',
    nationalId: '29801010012345',
    phoneNumber: '01001234567',
    email: 'ali@example.com',
    password: 'SecurePass1!',
  },
};

const validCar = {
  plateNumber: '9901',
  plateLetters: 'ن ل ن',
  licenseNumber: 'LIC-CAR-001',
  licenseExpiryDate: '2027-01-01',
  manufacturer: 'Toyota',
  model: 'Hilux',
  manufactureYear: 2020,
  color: 'White',
  chassisNumber: 'CHASS-001',
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
};

describe('inline asset schemas', () => {
  it('accepts a valid inline driver', () => {
    expect(driverInlineSchema.safeParse(validDriver).success).toBe(true);
  });

  it('rejects a driver with a bad email', () => {
    const bad = { ...validDriver, user: { ...validDriver.user, email: 'nope' } };
    expect(driverInlineSchema.safeParse(bad).success).toBe(false);
  });

  it('accepts a valid inline car and trailer', () => {
    expect(carInlineSchema.safeParse(validCar).success).toBe(true);
    expect(trailerInlineSchema.safeParse(validTrailer).success).toBe(true);
  });

  it('coerces numeric car/trailer fields from strings', () => {
    const parsed = carInlineSchema.safeParse({ ...validCar, manufactureYear: '2020' });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.manufactureYear).toBe(2020);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/features/office/types/__tests__/inline-asset-schema.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

```ts
// src/features/office/types/office-journey-schema.ts
import { z } from 'zod';

export const driverInlineSchema = z.object({
  licenseNumber: z.string().min(1),
  licenseExpiryDate: z.string().min(1),
  user: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    nationalId: z.string().min(1),
    phoneNumber: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
  }),
});
export type DriverInline = z.infer<typeof driverInlineSchema>;

export const carInlineSchema = z.object({
  plateNumber: z.string().min(1),
  plateLetters: z.string().min(1),
  licenseNumber: z.string().min(1),
  licenseExpiryDate: z.string().min(1),
  manufacturer: z.string().min(1),
  model: z.string().min(1),
  manufactureYear: z.coerce.number().int().min(1900),
  color: z.string().min(1),
  chassisNumber: z.string().min(1),
});
export type CarInline = z.infer<typeof carInlineSchema>;

export const trailerInlineSchema = z.object({
  plateNumber: z.string().min(1),
  plateLetters: z.string().min(1),
  maxWeight: z.coerce.number().min(0),
  licenseNumber: z.string().min(1),
  licenseExpiryDate: z.string().min(1),
  manufacturer: z.string().min(1),
  model: z.string().min(1),
  chassisNumber: z.string().min(1),
});
export type TrailerInline = z.infer<typeof trailerInlineSchema>;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- src/features/office/types/__tests__/inline-asset-schema.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/features/office/types
git commit -m "feat(office): add inline driver/car/trailer zod schemas"
```

---

## Task 3: Form-values type, journey schema & payload mapper

This is the core logic of the feature. The form holds a flat shape; `buildOfficeJourneyPayload` converts it to the API body, choosing `{ id }` vs. the inline object per asset and dropping fields not relevant to the mode.

**Files:**

- Modify: `src/features/office/types/office-journey-schema.ts` (append)
- Test: `src/features/office/types/__tests__/office-journey-payload.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/features/office/types/__tests__/office-journey-payload.test.ts
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

describe('buildOfficeJourneyPayload', () => {
  it('NOLON: sends selected ids as { id } objects and includes trailer/driver/assistant', () => {
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

  it('NOLON: sends the inline object when an asset was created inline', () => {
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
    };
    const payload = buildOfficeJourneyPayload({
      ...base,
      vehicleMode: 'NOLON_CAR',
      carInline,
    });
    expect(payload.car).toEqual(carInline);
  });

  it('CONTRACT: sends only car and common fields, no trailer/driver/assistant/sellingOrderNo', () => {
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
    expect(payload).not.toHaveProperty('trailer');
    expect(payload).not.toHaveProperty('driver');
    expect(payload).not.toHaveProperty('driverAssistantId');
    expect(payload).not.toHaveProperty('sellingOrderNo');
  });

  it('omits empty optional fields', () => {
    const payload = buildOfficeJourneyPayload({
      ...emptyOfficeJourneyValues,
      vehicleMode: 'COMPANY_CAR',
      clientId: '4',
      carId: '9',
    });
    expect(payload).toEqual({ vehicleMode: 'COMPANY_CAR', clientId: 4, car: { id: 9 } });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/features/office/types/__tests__/office-journey-payload.test.ts`
Expected: FAIL — `buildOfficeJourneyPayload`/`emptyOfficeJourneyValues` not exported.

- [ ] **Step 3: Write the implementation (append to `office-journey-schema.ts`)**

```ts
// --- appended to src/features/office/types/office-journey-schema.ts ---
import type { VehicleMode } from '../enums/vehicle-mode';

export interface OfficeJourneyFormValues {
  vehicleMode: VehicleMode;
  clientId: string;
  // assets — selected id ('' if none) OR inline object (NOLON only)
  carId: string;
  carInline?: CarInline;
  trailerId: string;
  trailerInline?: TrailerInline;
  driverId: string;
  driverInline?: DriverInline;
  driverAssistantId: string;
  // journey fields
  delegateNumber: string;
  direction: string;
  sellingOrderNo: string;
  receivedCompany: string;
  packingType: string;
  cementGrade: string;
  quantity: string;
  custodyAmount: string;
}

export const emptyOfficeJourneyValues: OfficeJourneyFormValues = {
  vehicleMode: 'NOLON_CAR',
  clientId: '',
  carId: '',
  trailerId: '',
  driverId: '',
  driverAssistantId: '',
  delegateNumber: '',
  direction: '',
  sellingOrderNo: '',
  receivedCompany: '',
  packingType: '',
  cementGrade: '',
  quantity: '',
  custodyAmount: '',
};

export interface CreateOfficeJourneyPayload {
  vehicleMode: VehicleMode;
  clientId: number;
  car?: { id: number } | CarInline;
  trailer?: { id: number } | TrailerInline;
  driver?: { id: number } | DriverInline;
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

export function buildOfficeJourneyPayload(
  values: OfficeJourneyFormValues,
): CreateOfficeJourneyPayload {
  const isNolon = values.vehicleMode === 'NOLON_CAR';

  const payload: CreateOfficeJourneyPayload = {
    vehicleMode: values.vehicleMode,
    clientId: Number(values.clientId),
  };

  // Car — all modes
  if (isNolon && values.carInline) payload.car = values.carInline;
  else if (values.carId) payload.car = { id: Number(values.carId) };

  // Trailer / Driver / Assistant / sale-order — NOLON only
  if (isNolon) {
    if (values.trailerInline) payload.trailer = values.trailerInline;
    else if (values.trailerId) payload.trailer = { id: Number(values.trailerId) };

    if (values.driverInline) payload.driver = values.driverInline;
    else if (values.driverId) payload.driver = { id: Number(values.driverId) };

    if (values.driverAssistantId) payload.driverAssistantId = Number(values.driverAssistantId);
    if (values.sellingOrderNo) payload.sellingOrderNo = values.sellingOrderNo;
  }

  // Common optional journey fields
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

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- src/features/office/types/__tests__/office-journey-payload.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/features/office/types
git commit -m "feat(office): add form-values type and office-journey payload mapper"
```

---

## Task 4: Validation schema (mode-conditional required fields)

A `superRefine` enforces: `clientId` always required; NOLON requires a car (selected or inline); Contract/Company require a selected `carId`.

**Files:**

- Modify: `src/features/office/types/office-journey-schema.ts` (append)
- Test: `src/features/office/types/__tests__/office-journey-validation.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/features/office/types/__tests__/office-journey-validation.test.ts
import { officeJourneySchema, emptyOfficeJourneyValues } from '../office-journey-schema';

describe('officeJourneySchema', () => {
  it('requires clientId', () => {
    const r = officeJourneySchema.safeParse({
      ...emptyOfficeJourneyValues,
      vehicleMode: 'NOLON_CAR',
    });
    expect(r.success).toBe(false);
  });

  it('NOLON passes with a selected car id', () => {
    const r = officeJourneySchema.safeParse({
      ...emptyOfficeJourneyValues,
      vehicleMode: 'NOLON_CAR',
      clientId: '4',
      carId: '7',
    });
    expect(r.success).toBe(true);
  });

  it('NOLON passes with an inline car (no id)', () => {
    const r = officeJourneySchema.safeParse({
      ...emptyOfficeJourneyValues,
      vehicleMode: 'NOLON_CAR',
      clientId: '4',
      carInline: {
        plateNumber: '9901',
        plateLetters: 'ن',
        licenseNumber: 'L',
        licenseExpiryDate: '2027-01-01',
        manufacturer: 'T',
        model: 'H',
        manufactureYear: 2020,
        color: 'W',
        chassisNumber: 'C',
      },
    });
    expect(r.success).toBe(true);
  });

  it('CONTRACT fails without a car id', () => {
    const r = officeJourneySchema.safeParse({
      ...emptyOfficeJourneyValues,
      vehicleMode: 'CONTRACT_CAR',
      clientId: '4',
    });
    expect(r.success).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/features/office/types/__tests__/office-journey-validation.test.ts`
Expected: FAIL — `officeJourneySchema` not exported.

- [ ] **Step 3: Write the implementation (append to `office-journey-schema.ts`)**

```ts
// --- appended to src/features/office/types/office-journey-schema.ts ---
export const officeJourneySchema = z
  .object({
    vehicleMode: z.enum(['NOLON_CAR', 'CONTRACT_CAR', 'COMPANY_CAR']),
    clientId: z.string().min(1, 'مطلوب'),
    carId: z.string().optional().default(''),
    carInline: carInlineSchema.optional(),
    trailerId: z.string().optional().default(''),
    trailerInline: trailerInlineSchema.optional(),
    driverId: z.string().optional().default(''),
    driverInline: driverInlineSchema.optional(),
    driverAssistantId: z.string().optional().default(''),
    delegateNumber: z.string().optional().default(''),
    direction: z.string().optional().default(''),
    sellingOrderNo: z.string().optional().default(''),
    receivedCompany: z.string().optional().default(''),
    packingType: z.string().optional().default(''),
    cementGrade: z.string().optional().default(''),
    quantity: z.string().optional().default(''),
    custodyAmount: z.string().optional().default(''),
  })
  .superRefine((v, ctx) => {
    const hasCar = !!v.carId || !!v.carInline;
    if (!hasCar) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'السيارة مطلوبة', path: ['carId'] });
    }
  });
```

> Note: the form is typed by `OfficeJourneyFormValues`; this schema is used as the RHF resolver. Because `carInline`/`trailerInline`/`driverInline` are objects (not strings), the resolver validates them when present.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- src/features/office/types/__tests__/office-journey-validation.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/features/office/types
git commit -m "feat(office): add mode-conditional validation schema"
```

---

## Task 5: `useCreateOfficeJourney` API hook

**Files:**

- Create: `src/features/office/api/create-office-journey.ts`
- Test: `src/features/office/api/__tests__/create-office-journey.test.tsx`

Mirrors [accounting create.ts](../../../../frontend/src/features/accounting/transactions/api/create.ts).

- [ ] **Step 1: Write the failing test**

```tsx
// src/features/office/api/__tests__/create-office-journey.test.tsx
import { renderHook } from '@testing-library/react';
import { useCreateOfficeJourney } from '../create-office-journey';

jest.mock('@/hooks/base/create', () => ({
  useCreate: jest.fn(() => ({ mutate: jest.fn(), isPending: false })),
}));
jest.mock('next-intl', () => ({ useTranslations: () => (k: string) => k, useLocale: () => 'ar' }));

import { useCreate } from '@/hooks/base/create';

describe('useCreateOfficeJourney', () => {
  it('calls the office endpoint with the journeys query key', () => {
    renderHook(() => useCreateOfficeJourney());
    expect(useCreate).toHaveBeenCalledWith(
      expect.objectContaining({ endPoint: 'api/journeys/office', queryKey: ['journeys'] }),
    );
  });

  it('exposes the mutation and pending flag', () => {
    const { result } = renderHook(() => useCreateOfficeJourney());
    expect(typeof result.current.createOfficeJourneyMutation).toBe('function');
    expect(result.current.isCreateOfficeJourneyPending).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/features/office/api/__tests__/create-office-journey.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

```ts
// src/features/office/api/create-office-journey.ts
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { useCreate } from '@/hooks/base/create';

import type { CreateOfficeJourneyPayload } from '../types/office-journey-schema';

export interface OfficeJourneyResponse {
  id: number;
  delegateNumber?: string;
}

export const useCreateOfficeJourney = () => {
  const t = useTranslations('office');
  const { mutate: createOfficeJourneyMutation, isPending: isCreateOfficeJourneyPending } =
    useCreate<OfficeJourneyResponse, Error, CreateOfficeJourneyPayload>({
      endPoint: 'api/journeys/office',
      queryKey: ['journeys'],
      onSuccess: () => {
        toast.success(t('form.created'));
      },
    });

  return { createOfficeJourneyMutation, isCreateOfficeJourneyPending };
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- src/features/office/api/__tests__/create-office-journey.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/features/office/api
git commit -m "feat(office): add useCreateOfficeJourney hook"
```

---

## Task 6: i18n `office` namespace + registration

**Files:**

- Create: `messages/ar/office.json`, `messages/en/office.json`
- Modify: `src/i18n/request.ts`

- [ ] **Step 1: Create `messages/ar/office.json`**

```json
{
  "title": "المكتب",
  "landing": {
    "registerPolicy": "تسجيل بوليصة",
    "issueDelegation": "اصدار تفويض"
  },
  "modes": {
    "title": "اصدار تفويض",
    "nolon": "سيارات بالناولون",
    "contract": "سيارات تعاقد",
    "company": "سيارات الشركة"
  },
  "form": {
    "delegateNumber": "تفويض رقم",
    "car": "السيارة",
    "trailer": "المقطورة",
    "driver": "السائق",
    "assistant": "التابع",
    "client": "التحميل لصالح",
    "direction": "الجهة",
    "sellingOrderNo": "امر بيع رقم",
    "receivedCompany": "لتسليمها لشركة",
    "packingType": "نوع التعبئة",
    "cementGrade": "رتبة الاسمنت",
    "quantity": "الكمية",
    "custodySource": "مصدر العهدة",
    "custodyAmount": "العهدة",
    "currency": "جنيه",
    "addNew": "إضافة جديد",
    "save": "حفظ",
    "cancel": "إلغاء",
    "selectPlaceholder": "اختر",
    "created": "تم اصدار التفويض بنجاح"
  },
  "inline": {
    "newDriver": "سائق جديد",
    "newCar": "سيارة جديدة",
    "newTrailer": "مقطورة جديدة"
  }
}
```

- [ ] **Step 2: Create `messages/en/office.json`**

```json
{
  "title": "Office",
  "landing": {
    "registerPolicy": "Register Policy",
    "issueDelegation": "Issue Delegation"
  },
  "modes": {
    "title": "Issue Delegation",
    "nolon": "NOLON Cars",
    "contract": "Contract Cars",
    "company": "Company Cars"
  },
  "form": {
    "delegateNumber": "Delegation No.",
    "car": "Car",
    "trailer": "Trailer",
    "driver": "Driver",
    "assistant": "Assistant",
    "client": "Loading for",
    "direction": "Direction",
    "sellingOrderNo": "Sale Order No.",
    "receivedCompany": "Deliver to company",
    "packingType": "Packing Type",
    "cementGrade": "Cement Grade",
    "quantity": "Quantity",
    "custodySource": "Custody Source",
    "custodyAmount": "Custody",
    "currency": "EGP",
    "addNew": "Add new",
    "save": "Save",
    "cancel": "Cancel",
    "selectPlaceholder": "Select",
    "created": "Delegation issued successfully"
  },
  "inline": {
    "newDriver": "New Driver",
    "newCar": "New Car",
    "newTrailer": "New Trailer"
  }
}
```

- [ ] **Step 3: Register the namespace in `src/i18n/request.ts`**

Add to the `Promise.all` array (after `accountingMessages`):

```ts
    import(`../../messages/${locale}/office.json`),
```

Capture it in the destructured array as `officeMessages`, and add to the returned `messages` object:

```ts
      office: officeMessages.default,
```

- [ ] **Step 4: Verify the build still compiles**

Run: `pnpm build`
Expected: success (JSON imports resolve).

- [ ] **Step 5: Commit**

```bash
git add messages/ar/office.json messages/en/office.json src/i18n/request.ts
git commit -m "feat(office): add office i18n namespace"
```

---

## Task 7: Side-menu entry + breadcrumb route labels

**Files:**

- Modify: `src/utils/icons.ts`
- Modify: `src/config/routes.ts`
- Asset: `public/assets/icons/office.svg` (reuse an existing icon if no asset is provided — see step 1)

- [ ] **Step 1: Add the office icon import & entry in `src/utils/icons.ts`**

If `public/assets/icons/office.svg` does not exist, reuse the existing `accounting` icon import as a placeholder by pointing `office` at it; otherwise import the new asset. Add to the `icons` object an `office` key, then append to `sideMenuIcons`:

```ts
  {
    key: 'office',
    alt: 'المكتب',
    href: '/office',
    subItems: [
      { alt: 'اصدار تفويض', href: '/office' },
      { alt: 'العُهد', href: '/custody' },
      { alt: 'طلبات المكتب', href: '/office-requests' },
    ],
  },
```

> The `key` must exist in `icons`; add `office` to the `icons` map (and the `import`) so `IconKey` includes it.

- [ ] **Step 2: Add breadcrumb labels in `src/config/routes.ts`**

Add to `modules`:

```ts
  office: 'المكتب',
  custody: 'العُهد',
  'office-requests': 'طلبات المكتب',
```

Add to `nestedRoutes`:

```ts
  'issue-delegation': 'اصدار تفويض',
  'nolon-car': 'سيارات بالناولون',
  'contract-car': 'سيارات تعاقد',
  'company-car': 'سيارات الشركة',
```

- [ ] **Step 3: Verify the build compiles**

Run: `pnpm build`
Expected: success.

- [ ] **Step 4: Commit**

```bash
git add src/utils/icons.ts src/config/routes.ts public/assets/icons
git commit -m "feat(office): add side-menu entry and breadcrumb labels"
```

---

## Task 8: `ChoiceCard` component

**Files:**

- Create: `src/features/office/components/choice-card.tsx`
- Test: `src/features/office/components/__tests__/choice-card.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/features/office/components/__tests__/choice-card.test.tsx
import { render, screen } from '@testing-library/react';
import ChoiceCard from '../choice-card';

describe('ChoiceCard', () => {
  it('renders its title', () => {
    render(<ChoiceCard title="اصدار تفويض" href="/office/issue-delegation" />);
    expect(screen.getByText('اصدار تفويض')).toBeInTheDocument();
  });

  it('links to the given href', () => {
    render(<ChoiceCard title="x" href="/office/issue-delegation" />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/office/issue-delegation');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/features/office/components/__tests__/choice-card.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

```tsx
// src/features/office/components/choice-card.tsx
import Link from 'next/link';

import { cn } from '@/lib/utils';

interface ChoiceCardProps {
  title: string;
  href: string;
  className?: string;
}

export default function ChoiceCard({ title, href, className }: ChoiceCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        'flex min-h-32 items-center justify-center rounded-xl border border-border bg-card p-8',
        'text-center text-lg font-semibold text-foreground shadow-sm transition-all',
        'hover:-translate-y-1 hover:shadow-md',
        className,
      )}
    >
      {title}
    </Link>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- src/features/office/components/__tests__/choice-card.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/features/office/components/choice-card.tsx src/features/office/components/__tests__
git commit -m "feat(office): add ChoiceCard component"
```

---

## Task 9: Landing & vehicle-mode screens + their routes

**Files:**

- Create: `src/features/office/components/office-landing.tsx`
- Create: `src/features/office/components/vehicle-mode-selection.tsx`
- Create: `src/app/[locale]/(loggedIn)/office/page.tsx`
- Create: `src/app/[locale]/(loggedIn)/office/issue-delegation/page.tsx`
- Test: `src/features/office/components/__tests__/vehicle-mode-selection.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/features/office/components/__tests__/vehicle-mode-selection.test.tsx
import { render, screen } from '@testing-library/react';
jest.mock('next-intl', () => ({ useTranslations: () => (k: string) => k }));
import VehicleModeSelection from '../vehicle-mode-selection';

describe('VehicleModeSelection', () => {
  it('renders three mode cards linking to each mode route', () => {
    render(<VehicleModeSelection />);
    const links = screen.getAllByRole('link');
    const hrefs = links.map((l) => l.getAttribute('href'));
    expect(hrefs).toEqual(
      expect.arrayContaining([
        '/office/issue-delegation/nolon-car',
        '/office/issue-delegation/contract-car',
        '/office/issue-delegation/company-car',
      ]),
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/features/office/components/__tests__/vehicle-mode-selection.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `vehicle-mode-selection.tsx`**

```tsx
// src/features/office/components/vehicle-mode-selection.tsx
'use client';

import { useTranslations } from 'next-intl';

import ChoiceCard from './choice-card';

export default function VehicleModeSelection() {
  const t = useTranslations('office');
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3" dir="rtl">
      <ChoiceCard title={t('modes.nolon')} href="/office/issue-delegation/nolon-car" />
      <ChoiceCard title={t('modes.contract')} href="/office/issue-delegation/contract-car" />
      <ChoiceCard title={t('modes.company')} href="/office/issue-delegation/company-car" />
    </div>
  );
}
```

- [ ] **Step 4: Write `office-landing.tsx`**

```tsx
// src/features/office/components/office-landing.tsx
'use client';

import { useTranslations } from 'next-intl';

import ChoiceCard from './choice-card';

export default function OfficeLanding() {
  const t = useTranslations('office');
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2" dir="rtl">
      <ChoiceCard title={t('landing.registerPolicy')} href="/trips" />
      <ChoiceCard title={t('landing.issueDelegation')} href="/office/issue-delegation" />
    </div>
  );
}
```

> `registerPolicy` links to the existing trips/policy area (open item #3 in the spec); adjust the href if a dedicated policy route is provided later.

- [ ] **Step 5: Write the two route pages**

```tsx
// src/app/[locale]/(loggedIn)/office/page.tsx
import OfficeLanding from '@/features/office/components/office-landing';

export default function OfficePage() {
  return <OfficeLanding />;
}
```

```tsx
// src/app/[locale]/(loggedIn)/office/issue-delegation/page.tsx
import VehicleModeSelection from '@/features/office/components/vehicle-mode-selection';

export default function IssueDelegationPage() {
  return <VehicleModeSelection />;
}
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `pnpm test -- src/features/office/components/__tests__/vehicle-mode-selection.test.tsx`
Expected: PASS (1 test).

- [ ] **Step 7: Commit**

```bash
git add src/features/office/components src/app/[locale]/\(loggedIn\)/office
git commit -m "feat(office): add landing and vehicle-mode screens with routes"
```

---

## Task 10: Inline-create dialogs (driver / car / trailer)

Each dialog renders a small RHF form validated by the matching inline schema; on submit it calls `onCreated(data)` with the parsed inline object and closes. It makes **no API call** — the object is sent inside the journey body later.

**Files:**

- Create: `src/features/office/components/inline-create/car-inline-dialog.tsx`
- Create: `src/features/office/components/inline-create/driver-inline-dialog.tsx`
- Create: `src/features/office/components/inline-create/trailer-inline-dialog.tsx`
- Test: `src/features/office/components/inline-create/__tests__/car-inline-dialog.test.tsx`

- [ ] **Step 1: Write the failing test (car dialog)**

```tsx
// src/features/office/components/inline-create/__tests__/car-inline-dialog.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
jest.mock('next-intl', () => ({ useTranslations: () => (k: string) => k }));
import CarInlineDialog from '../car-inline-dialog';

it('submits a valid inline car to onCreated', async () => {
  const onCreated = jest.fn();
  render(<CarInlineDialog open onOpenChange={() => {}} onCreated={onCreated} />);

  await userEvent.type(screen.getByLabelText('form.plateNumber'), '9901');
  await userEvent.type(screen.getByLabelText('form.plateLetters'), 'ن ل ن');
  await userEvent.type(screen.getByLabelText('form.licenseNumber'), 'LIC');
  await userEvent.type(screen.getByLabelText('form.licenseExpiryDate'), '2027-01-01');
  await userEvent.type(screen.getByLabelText('form.manufacturer'), 'Toyota');
  await userEvent.type(screen.getByLabelText('form.model'), 'Hilux');
  await userEvent.type(screen.getByLabelText('form.manufactureYear'), '2020');
  await userEvent.type(screen.getByLabelText('form.color'), 'White');
  await userEvent.type(screen.getByLabelText('form.chassisNumber'), 'CH');
  await userEvent.click(screen.getByRole('button', { name: 'form.save' }));

  expect(onCreated).toHaveBeenCalledWith(
    expect.objectContaining({ plateNumber: '9901', manufactureYear: 2020 }),
  );
});
```

> Add `@testing-library/user-event` if missing: `pnpm add -D @testing-library/user-event`.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/features/office/components/inline-create/__tests__/car-inline-dialog.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `car-inline-dialog.tsx`**

```tsx
// src/features/office/components/inline-create/car-inline-dialog.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { carInlineSchema, type CarInline } from '../../types/office-journey-schema';

interface CarInlineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (car: CarInline) => void;
}

const FIELDS: { name: keyof CarInline; type?: string }[] = [
  { name: 'plateNumber' },
  { name: 'plateLetters' },
  { name: 'licenseNumber' },
  { name: 'licenseExpiryDate', type: 'date' },
  { name: 'manufacturer' },
  { name: 'model' },
  { name: 'manufactureYear', type: 'number' },
  { name: 'color' },
  { name: 'chassisNumber' },
];

export default function CarInlineDialog({ open, onOpenChange, onCreated }: CarInlineDialogProps) {
  const t = useTranslations('office');
  const form = useForm<CarInline>({ resolver: zodResolver(carInlineSchema) });

  const onSubmit = (data: CarInline) => {
    onCreated(data);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl">
        <DialogHeader>
          <DialogTitle>{t('inline.newCar')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-3">
          {FIELDS.map(({ name, type }) => (
            <div key={name} className="flex flex-col gap-1">
              <Label htmlFor={name}>{t(`form.${name}`)}</Label>
              <Input
                id={name}
                aria-label={`form.${name}`}
                type={type ?? 'text'}
                {...form.register(name)}
              />
            </div>
          ))}
          <DialogFooter className="col-span-2">
            <Button type="submit">{t('form.save')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

> Add the missing form labels (`form.plateNumber`, `form.plateLetters`, `form.licenseNumber`, `form.licenseExpiryDate`, `form.manufacturer`, `form.model`, `form.manufactureYear`, `form.color`, `form.chassisNumber`, `form.maxWeight`, and driver labels `form.firstName`, `form.lastName`, `form.nationalId`, `form.phoneNumber`, `form.email`, `form.password`) to both `office.json` files. The `t(...)` calls fall back to the key in tests via the mock.

- [ ] **Step 4: Write `trailer-inline-dialog.tsx`**

Identical structure to the car dialog, but import `trailerInlineSchema` / `TrailerInline`, title `t('inline.newTrailer')`, and `FIELDS`:

```tsx
const FIELDS: { name: keyof TrailerInline; type?: string }[] = [
  { name: 'plateNumber' },
  { name: 'plateLetters' },
  { name: 'maxWeight', type: 'number' },
  { name: 'licenseNumber' },
  { name: 'licenseExpiryDate', type: 'date' },
  { name: 'manufacturer' },
  { name: 'model' },
  { name: 'chassisNumber' },
];
```

- [ ] **Step 5: Write `driver-inline-dialog.tsx`**

Same dialog shell, import `driverInlineSchema` / `DriverInline`, title `t('inline.newDriver')`. Driver has a nested `user` object, so register nested paths:

```tsx
const TOP_FIELDS: { name: 'licenseNumber' | 'licenseExpiryDate'; type?: string }[] = [
  { name: 'licenseNumber' },
  { name: 'licenseExpiryDate', type: 'date' },
];
const USER_FIELDS: { name: keyof DriverInline['user']; type?: string }[] = [
  { name: 'firstName' },
  { name: 'lastName' },
  { name: 'nationalId' },
  { name: 'phoneNumber' },
  { name: 'email', type: 'email' },
  { name: 'password', type: 'password' },
];
```

Render `TOP_FIELDS` with `form.register(name)` and `USER_FIELDS` with `form.register(\`user.${name}\`)`, each `aria-label={\`form.${name}\`}`.

- [ ] **Step 6: Run the test to verify it passes**

Run: `pnpm test -- src/features/office/components/inline-create/__tests__/car-inline-dialog.test.tsx`
Expected: PASS (1 test).

- [ ] **Step 7: Commit**

```bash
git add src/features/office/components/inline-create messages/ar/office.json messages/en/office.json
git commit -m "feat(office): add inline driver/car/trailer create dialogs"
```

---

## Task 11: Form orchestration hook (`use-office-journey-form`)

Centralizes RHF setup, dropdown data (filtered by ownership), and the submit→payload→mutation wiring so the form component stays presentational.

**Files:**

- Create: `src/features/office/hooks/use-office-journey-form.ts`
- Test: `src/features/office/hooks/__tests__/ownership-filter.test.ts`

The ownership filter is the one piece of pure logic worth testing in isolation; extract it as `filterByOwnership`.

- [ ] **Step 1: Write the failing test**

```ts
// src/features/office/hooks/__tests__/ownership-filter.test.ts
import { filterByOwnership } from '../use-office-journey-form';

const cars = [
  { id: 1, ownership: 'NOLON_CAR' },
  { id: 2, ownership: 'CONTRACT_CAR' },
  { id: 3, ownership: 'COMPANY_CAR' },
];

it('keeps only cars whose ownership matches the mode', () => {
  expect(filterByOwnership(cars, 'NOLON_CAR').map((c) => c.id)).toEqual([1]);
  expect(filterByOwnership(cars, 'CONTRACT_CAR').map((c) => c.id)).toEqual([2]);
});

it('returns all rows when ownership data is absent', () => {
  const noOwnership = [{ id: 9, ownership: 'N/A' }];
  expect(filterByOwnership(noOwnership, 'NOLON_CAR')).toEqual([]);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/features/office/hooks/__tests__/ownership-filter.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

```ts
// src/features/office/hooks/use-office-journey-form.ts
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { useGetAllCars } from '@/features/cars/api/get-all';
import { useGetAllClients } from '@/features/clients/api/get-all';
import { useGetAllDrivers } from '@/features/drivers/api/get-all';
import { useGetAllTrailers } from '@/features/trailers/api/get-all';

import { useCreateOfficeJourney } from '../api/create-office-journey';
import type { VehicleMode } from '../enums/vehicle-mode';
import {
  buildOfficeJourneyPayload,
  emptyOfficeJourneyValues,
  officeJourneySchema,
  type OfficeJourneyFormValues,
} from '../types/office-journey-schema';

export function filterByOwnership<T extends { ownership?: string }>(
  rows: T[],
  mode: VehicleMode,
): T[] {
  return rows.filter((r) => r.ownership === mode);
}

export function useOfficeJourneyForm(vehicleMode: VehicleMode) {
  const router = useRouter();
  const { cars } = useGetAllCars();
  const { trailers } = useGetAllTrailers();
  const { drivers } = useGetAllDrivers();
  const { clients } = useGetAllClients();
  const { createOfficeJourneyMutation, isCreateOfficeJourneyPending } = useCreateOfficeJourney();

  const form = useForm<OfficeJourneyFormValues>({
    resolver: zodResolver(officeJourneySchema),
    defaultValues: { ...emptyOfficeJourneyValues, vehicleMode },
  });

  const onSubmit = (values: OfficeJourneyFormValues) => {
    const payload = buildOfficeJourneyPayload(values);
    createOfficeJourneyMutation(payload, {
      onSuccess: () => {
        form.reset({ ...emptyOfficeJourneyValues, vehicleMode });
        router.push('/office');
      },
    });
  };

  return {
    form,
    onSubmit,
    isSubmitting: isCreateOfficeJourneyPending,
    cars: filterByOwnership(cars, vehicleMode),
    trailers: filterByOwnership(trailers, vehicleMode),
    drivers, // drivers are filtered server-side / not ownership-scoped; see note
    clients,
  };
}
```

> Note on drivers/trailers ownership: cars expose `ownership` via `useGetAllCars`. Verify `useGetAllTrailers`/`useGetAllDrivers` expose an equivalent field; if trailers lack `ownership`, drop the `filterByOwnership(trailers, …)` call and pass `trailers` through. Do not block on this — the mapper still sends correct ids.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- src/features/office/hooks/__tests__/ownership-filter.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/features/office/hooks
git commit -m "feat(office): add office journey form orchestration hook"
```

---

## Task 12: `OfficeJourneyForm` component (mode-conditional fields + asset selects)

**Files:**

- Create: `src/features/office/components/office-journey-form.tsx`
- Test: `src/features/office/components/__tests__/office-journey-form.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/features/office/components/__tests__/office-journey-form.test.tsx
import { render, screen } from '@testing-library/react';

jest.mock('next-intl', () => ({ useTranslations: () => (k: string) => k }));
jest.mock('../../hooks/use-office-journey-form', () => ({
  useOfficeJourneyForm: () => ({
    form: {
      control: {},
      register: () => ({}),
      handleSubmit: (fn: any) => (e: any) => {
        e?.preventDefault?.();
        fn({});
      },
      watch: () => '',
      setValue: jest.fn(),
      formState: { errors: {} },
    },
    onSubmit: jest.fn(),
    isSubmitting: false,
    cars: [],
    trailers: [],
    drivers: [],
    clients: [],
  }),
}));

import OfficeJourneyForm from '../office-journey-form';

describe('OfficeJourneyForm', () => {
  it('shows trailer/driver/assistant fields in NOLON mode', () => {
    render(<OfficeJourneyForm vehicleMode="NOLON_CAR" />);
    expect(screen.getByText('form.trailer')).toBeInTheDocument();
    expect(screen.getByText('form.driver')).toBeInTheDocument();
    expect(screen.getByText('form.assistant')).toBeInTheDocument();
  });

  it('hides trailer/driver/assistant fields in CONTRACT mode', () => {
    render(<OfficeJourneyForm vehicleMode="CONTRACT_CAR" />);
    expect(screen.queryByText('form.trailer')).not.toBeInTheDocument();
    expect(screen.queryByText('form.driver')).not.toBeInTheDocument();
    expect(screen.getByText('form.car')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/features/office/components/__tests__/office-journey-form.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

```tsx
// src/features/office/components/office-journey-form.tsx
'use client';

import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import type { VehicleMode } from '../enums/vehicle-mode';
import { useOfficeJourneyForm } from '../hooks/use-office-journey-form';

interface OfficeJourneyFormProps {
  vehicleMode: VehicleMode;
}

export default function OfficeJourneyForm({ vehicleMode }: OfficeJourneyFormProps) {
  const t = useTranslations('office');
  const { form, onSubmit, isSubmitting, cars, trailers, drivers, clients } =
    useOfficeJourneyForm(vehicleMode);
  const isNolon = vehicleMode === 'NOLON_CAR';

  const Field = ({ label, name }: { label: string; name: string }) => (
    <div className="flex flex-col gap-1">
      <Label>{label}</Label>
      <Input {...form.register(name as never)} />
    </div>
  );

  const Select = ({
    label,
    name,
    options,
  }: {
    label: string;
    name: string;
    options: { id: number | string; label: string }[];
  }) => (
    <div className="flex flex-col gap-1">
      <Label>{label}</Label>
      <select
        className="h-10 rounded-md border border-input bg-background px-3"
        {...form.register(name as never)}
      >
        <option value="">{t('form.selectPlaceholder')}</option>
        {options.map((o) => (
          <option key={o.id} value={String(o.id)}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4" dir="rtl">
      <Field label={t('form.delegateNumber')} name="delegateNumber" />

      <Select
        label={t('form.car')}
        name="carId"
        options={cars.map((c: any) => ({ id: c.id, label: `${c.carCode} - ${c.model}` }))}
      />

      {isNolon && (
        <>
          <Select
            label={t('form.trailer')}
            name="trailerId"
            options={trailers.map((tr: any) => ({ id: tr.id, label: tr.chassis ?? String(tr.id) }))}
          />
          <Select
            label={t('form.driver')}
            name="driverId"
            options={drivers.map((d: any) => ({ id: d.id, label: d.driverName }))}
          />
          <Field label={t('form.assistant')} name="driverAssistantId" />
          <Field label={t('form.sellingOrderNo')} name="sellingOrderNo" />
        </>
      )}

      <Select
        label={t('form.client')}
        name="clientId"
        options={clients.map((c: any) => ({ id: c.id, label: c.name }))}
      />
      <Field label={t('form.direction')} name="direction" />
      <Field label={t('form.receivedCompany')} name="receivedCompany" />
      <Field label={t('form.packingType')} name="packingType" />
      <Field label={t('form.cementGrade')} name="cementGrade" />
      <Field label={t('form.quantity')} name="quantity" />
      <Field label={t('form.custodyAmount')} name="custodyAmount" />

      <div className="flex justify-start gap-2 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {t('form.save')}
        </Button>
      </div>
    </form>
  );
}
```

> This task ships the **select-existing** path end-to-end. The inline "+ New" wiring (swapping the plain `<select>` for `SelectWithActions` with `canAddItem` + the Task 10 dialogs, writing `carInline`/`trailerInline`/`driverInline` into form state via `form.setValue`) is layered on in Task 13 so this task stays reviewable.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- src/features/office/components/__tests__/office-journey-form.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/features/office/components/office-journey-form.tsx src/features/office/components/__tests__/office-journey-form.test.tsx
git commit -m "feat(office): add office journey form with mode-conditional fields"
```

---

## Task 13: Wire inline-create into NOLON asset selects + the `[mode]` route

Replace the three NOLON plain `<select>`s (car, trailer, driver) with `SelectWithActions` (existing component at [select-with-actions.tsx](../../../../frontend/src/components/common/select-with-actions.tsx)) wired to the Task 10 dialogs. Selecting an existing item sets `carId`/`trailerId`/`driverId`; "+ New" opens the dialog and `onCreated` does `form.setValue('carInline', data)` (clearing the corresponding id), so the mapper sends the inline object.

**Files:**

- Modify: `src/features/office/components/office-journey-form.tsx`
- Create: `src/app/[locale]/(loggedIn)/office/issue-delegation/[mode]/page.tsx`
- Test: `src/features/office/components/__tests__/office-journey-form-inline.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/features/office/components/__tests__/office-journey-form-inline.test.tsx
import { render, screen } from '@testing-library/react';

const setValue = jest.fn();
jest.mock('next-intl', () => ({ useTranslations: () => (k: string) => k }));
jest.mock('../../hooks/use-office-journey-form', () => ({
  useOfficeJourneyForm: () => ({
    form: {
      register: () => ({}),
      handleSubmit: (fn: any) => (e: any) => {
        e?.preventDefault?.();
        fn({});
      },
      watch: () => '',
      setValue,
      formState: { errors: {} },
    },
    onSubmit: jest.fn(),
    isSubmitting: false,
    cars: [],
    trailers: [],
    drivers: [],
    clients: [],
  }),
}));

import OfficeJourneyForm from '../office-journey-form';

it('renders an add-new affordance for the NOLON car select', () => {
  render(<OfficeJourneyForm vehicleMode="NOLON_CAR" />);
  expect(screen.getByText('form.addNew')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/features/office/components/__tests__/office-journey-form-inline.test.tsx`
Expected: FAIL — no `form.addNew` text yet.

- [ ] **Step 3: Implement the inline wiring**

In `office-journey-form.tsx`, for the NOLON car/trailer/driver selects, replace the plain `Select` with `SelectWithActions` configured with `canAddItem`, `addButtonLabel={t('form.addNew')}`, an `open`/`setOpen` state per asset, and an `addDialog` rendering the matching Task-10 dialog. Example for the car select:

```tsx
const [carOpen, setCarOpen] = useState(false);
const [carDialogOpen, setCarDialogOpen] = useState(false);
// ...
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
  canAddItem
  addButtonLabel={t('form.addNew')}
  setAddDialogOpen={setCarDialogOpen}
  placeholder={t('form.selectPlaceholder')}
  addDialog={
    <CarInlineDialog
      open={carDialogOpen}
      onOpenChange={setCarDialogOpen}
      onCreated={(car) => {
        form.setValue('carInline', car);
        form.setValue('carId', '');
      }}
    />
  }
/>;
```

Repeat for trailer (`TrailerInlineDialog`, `trailerId`/`trailerInline`) and driver (`DriverInlineDialog`, `driverId`/`driverInline`). Import `useState` from React and the three dialogs. Keep the Contract/Company car select as a plain `<select>` (no inline). Add `'use client'` is already present.

- [ ] **Step 4: Write the `[mode]` route page**

```tsx
// src/app/[locale]/(loggedIn)/office/issue-delegation/[mode]/page.tsx
import { notFound } from 'next/navigation';

import OfficeJourneyForm from '@/features/office/components/office-journey-form';
import { slugToVehicleMode } from '@/features/office/enums/vehicle-mode';

interface PageProps {
  params: Promise<{ mode: string; locale: string }>;
}

export default async function IssueDelegationModePage({ params }: PageProps) {
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

- [ ] **Step 5: Run the test to verify it passes**

Run: `pnpm test -- src/features/office/components/__tests__/office-journey-form-inline.test.tsx`
Expected: PASS (1 test).

- [ ] **Step 6: Run the full office test suite + build**

Run: `pnpm test -- src/features/office` then `pnpm build`
Expected: all office tests PASS; build succeeds.

- [ ] **Step 7: Commit**

```bash
git add src/features/office/components/office-journey-form.tsx src/features/office/components/__tests__/office-journey-form-inline.test.tsx "src/app/[locale]/(loggedIn)/office"
git commit -m "feat(office): wire inline NOLON asset creation and the [mode] route"
```

---

## Task 14: Manual verification

**Files:** none

- [ ] **Step 1: Run the dev server**

Run: `pnpm dev` and sign in as an employee.

- [ ] **Step 2: Walk the flow**
  - Side menu shows المكتب → `/office` renders two cards.
  - `اصدار تفويض` → `/office/issue-delegation` shows three mode cards; breadcrumb reads `… • اصدار تفويض`.
  - NOLON form shows car/trailer/driver/assistant/sale-order; Contract & Company show only car + common fields.
  - On a NOLON select, "+ New" opens the inline dialog; saving it shows the asset as chosen.
  - Submitting posts to `/api/journeys/office`; on success a toast shows and it redirects to `/office`.
  - Confirm the Network tab: selected assets send `{ id }`; inline assets send the full object inside the body.

- [ ] **Step 3: Final commit (if any tweaks were needed)**

```bash
git add -A
git commit -m "fix(office): manual-verification adjustments"
```

---

## Self-Review (completed during planning)

- **Spec coverage:** office landing ✓ (Task 9), vehicle-mode choice incl. Company ✓ (Task 9), NOLON form + inline create ✓ (Tasks 10/13), Contract/Company reduced form ✓ (Task 12), payload mapping ✓ (Task 3), custodySource derived/not-sent ✓ (mapper omits it), delegateNumber editable/optional ✓ (Field, optional in mapper), nav/routes/i18n ✓ (Tasks 6/7), roles — backend-enforced; nav visibility gating is a follow-up noted in the spec.
- **Placeholder scan:** none — every code step has full content; ownership-on-trailers and the icon asset are explicit conditional instructions, not TODOs.
- **Type consistency:** `OfficeJourneyFormValues`, `CreateOfficeJourneyPayload`, `buildOfficeJourneyPayload`, `officeJourneySchema`, `slugToVehicleMode`, `useOfficeJourneyForm`, `useCreateOfficeJourney`, the three `*InlineDialog`s and `*Inline` types are used consistently across tasks.

## Open follow-ups (from spec §7, non-blocking)

1. `delegateNumber` source (auto-generated vs. endpoint) — currently an editable/optional field.
2. `direction` & `sellingOrderNo` are text inputs; switch to selects if option lists are provided.
3. `registerPolicy` card links to `/trips`; repoint when a dedicated policy route exists.
4. Role-based nav visibility (show `/office` to employees, custody/requests admin actions to admins) — handle in the Custody/Office-Requests plans where the admin gating lives.
