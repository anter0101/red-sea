# Phase 6 — Custody Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the admin **Custody** (عُهدة) module — a paginated list with filters, create/edit dialog, detail view, and delete — over `/api/custodies`.

**Architecture:** New `src/features/custody/` feature following the accounting CRUD pattern: `useGetPaginated`-backed list with a co-located row-mapper, a `Dialog`-based create/edit form (RHF + Zod), and base `useCreate`/`usePut`/`useDelete`/`useGetOne` hooks. Thin route pages render the client components. Admin-only affordances; the backend auto-scopes the list to the caller's own records for `EMPLOYEE`.

**Tech Stack:** Next.js App Router, TanStack Query (base hooks), React Hook Form + Zod, next-intl (RTL), shadcn `Table`/`Dialog`/`Select`, Jest + @testing-library/react.

**Spec:** [docs/superpowers/specs/2026-06-12-phase-6-office-custody-requests-design.md](../specs/2026-06-12-phase-6-office-custody-requests-design.md) · **API:** [phase-6-api.md §1](../../../phase-6-api.md) · **Prereq:** run Task 0 of the [office-flow plan](./2026-06-12-phase-6-office-flow.md) first (deps install + test runner).

---

## File Structure

| File                                                       | Responsibility                                        |
| ---------------------------------------------------------- | ----------------------------------------------------- |
| `src/features/custody/enums/custody-status.ts`             | `CustodyStatus` values                                |
| `src/features/custody/types/index.ts`                      | DTOs, table-row type, `custodyFormSchema`, body types |
| `src/features/custody/api/get-all.ts`                      | `useGetAllCustodies` (+ row mapper)                   |
| `src/features/custody/api/get-one.ts`                      | `useGetOneCustody`                                    |
| `src/features/custody/api/create.ts`                       | `useCreateCustody`                                    |
| `src/features/custody/api/update.ts`                       | `useUpdateCustody`                                    |
| `src/features/custody/api/delete.ts`                       | `useDeleteCustody`                                    |
| `src/features/custody/components/custody-page-client.tsx`  | List page orchestration                               |
| `src/features/custody/components/custody-table.tsx`        | Table + row actions                                   |
| `src/features/custody/components/custody-form-dialog.tsx`  | Create/edit dialog                                    |
| `src/features/custody/components/custody-detail.tsx`       | Detail read view                                      |
| `src/app/[locale]/(loggedIn)/custody/page.tsx`             | Route → list                                          |
| `src/app/[locale]/(loggedIn)/custody/[custodyId]/page.tsx` | Route → detail                                        |
| `messages/{ar,en}/custody.json`                            | i18n namespace `custody`                              |
| `src/i18n/request.ts` (modify)                             | Register `custody` namespace                          |

> Nav entry and breadcrumb labels for `/custody` are added in the office-flow plan (Task 7). If executing this plan standalone, add `custody: 'العُهد'` to `modules` in `src/config/routes.ts` and a side-menu item in `src/utils/icons.ts`.

---

## Task 1: Custody status enum

**Files:**

- Create: `src/features/custody/enums/custody-status.ts`
- Test: `src/features/custody/enums/__tests__/custody-status.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/features/custody/enums/__tests__/custody-status.test.ts
import { CUSTODY_STATUSES } from '../custody-status';

it('lists the three custody statuses', () => {
  expect(CUSTODY_STATUSES).toEqual(['ACTIVE', 'INACTIVE', 'CLOSED']);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/features/custody/enums/__tests__/custody-status.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

```ts
// src/features/custody/enums/custody-status.ts
export const CUSTODY_STATUSES = ['ACTIVE', 'INACTIVE', 'CLOSED'] as const;
export type CustodyStatus = (typeof CUSTODY_STATUSES)[number];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- src/features/custody/enums/__tests__/custody-status.test.ts`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add src/features/custody/enums
git commit -m "feat(custody): add custody-status enum"
```

---

## Task 2: Types & form schema

**Files:**

- Create: `src/features/custody/types/index.ts`
- Test: `src/features/custody/types/__tests__/custody-schema.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/features/custody/types/__tests__/custody-schema.test.ts
import { custodyFormSchema } from '../index';

const valid = { employeeId: '3', accountId: '7', status: 'ACTIVE', journeyId: '', driverId: '' };

describe('custodyFormSchema', () => {
  it('accepts a valid custody (required employee + account)', () => {
    expect(custodyFormSchema.safeParse(valid).success).toBe(true);
  });

  it('requires employeeId and accountId', () => {
    expect(custodyFormSchema.safeParse({ ...valid, employeeId: '' }).success).toBe(false);
    expect(custodyFormSchema.safeParse({ ...valid, accountId: '' }).success).toBe(false);
  });

  it('allows optional journeyId and driverId to be empty', () => {
    const r = custodyFormSchema.safeParse({ ...valid, journeyId: '', driverId: '' });
    expect(r.success).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/features/custody/types/__tests__/custody-schema.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

```ts
// src/features/custody/types/index.ts
import { z } from 'zod';

import type { CustodyStatus } from '../enums/custody-status';

export interface ICustodyResponse {
  id: number;
  employeeId: number;
  accountId: number;
  journeyId?: number | null;
  driverId?: number | null;
  status: CustodyStatus;
  employee?: { id: number; user?: { firstName?: string; lastName?: string } };
  account?: { id: number; name?: string };
  journey?: { id: number; delegateNumber?: string } | null;
  driver?: { id: number; user?: { firstName?: string; lastName?: string } } | null;
  createdAt?: string;
}

export interface ICustodyTableRow {
  id: number;
  employeeName: string;
  accountName: string;
  journeyNumber: string;
  driverName: string;
  status: CustodyStatus;
  createdAt: string;
}

export const custodyFormSchema = z.object({
  employeeId: z.string().min(1, 'مطلوب'),
  accountId: z.string().min(1, 'مطلوب'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'CLOSED']),
  journeyId: z.string().optional().default(''),
  driverId: z.string().optional().default(''),
});

export type CustodyFormValues = z.infer<typeof custodyFormSchema>;

export interface CustodyBody {
  employeeId: number;
  accountId: number;
  status: CustodyStatus;
  journeyId?: number;
  driverId?: number;
}

export function toCustodyBody(values: CustodyFormValues): CustodyBody {
  const body: CustodyBody = {
    employeeId: Number(values.employeeId),
    accountId: Number(values.accountId),
    status: values.status,
  };
  if (values.journeyId) body.journeyId = Number(values.journeyId);
  if (values.driverId) body.driverId = Number(values.driverId);
  return body;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- src/features/custody/types/__tests__/custody-schema.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/features/custody/types
git commit -m "feat(custody): add types, form schema and body mapper"
```

---

## Task 3: `useGetAllCustodies` list hook + row mapper

**Files:**

- Create: `src/features/custody/api/get-all.ts`
- Test: `src/features/custody/api/__tests__/custody-row-mapper.test.ts`

Extract the row mapping as a pure `toCustodyRow` so it's unit-testable.

- [ ] **Step 1: Write the failing test**

```ts
// src/features/custody/api/__tests__/custody-row-mapper.test.ts
import { toCustodyRow } from '../get-all';

it('maps a custody response to a flat table row', () => {
  const row = toCustodyRow({
    id: 1,
    employeeId: 3,
    accountId: 7,
    status: 'ACTIVE',
    employee: { id: 3, user: { firstName: 'Ahmed', lastName: 'Ali' } },
    account: { id: 7, name: 'Ahmed Ali' },
    journey: { id: 12, delegateNumber: 'DEL-001' },
    driver: { id: 5, user: { firstName: 'Mahmoud', lastName: 'Hassan' } },
  });
  expect(row).toMatchObject({
    id: 1,
    employeeName: 'Ahmed Ali',
    accountName: 'Ahmed Ali',
    journeyNumber: 'DEL-001',
    driverName: 'Mahmoud Hassan',
    status: 'ACTIVE',
  });
});

it('falls back to dashes when relations are missing', () => {
  const row = toCustodyRow({ id: 2, employeeId: 3, accountId: 7, status: 'CLOSED' });
  expect(row.employeeName).toBe('—');
  expect(row.journeyNumber).toBe('—');
  expect(row.driverName).toBe('—');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/features/custody/api/__tests__/custody-row-mapper.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

```ts
// src/features/custody/api/get-all.ts
import { useGetPaginated } from '@/hooks/base/get-paginated';
import type { IQueryParams } from '@/types/query-params';

import type { CustodyStatus } from '../enums/custody-status';
import type { ICustodyResponse, ICustodyTableRow } from '../types';

export interface ICustodyQueryParams extends IQueryParams {
  status?: CustodyStatus;
  employeeId?: number;
  accountId?: number;
  journeyId?: number;
  driverId?: number;
  updatedAtFrom?: string;
  updatedAtTo?: string;
}

const fullName = (u?: { firstName?: string; lastName?: string }) =>
  u && (u.firstName || u.lastName) ? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() : '—';

export function toCustodyRow(c: ICustodyResponse): ICustodyTableRow {
  return {
    id: c.id,
    employeeName: fullName(c.employee?.user),
    accountName: c.account?.name ?? '—',
    journeyNumber: c.journey?.delegateNumber ?? '—',
    driverName: fullName(c.driver?.user),
    status: c.status,
    createdAt: c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-GB') : '—',
  };
}

export const useGetAllCustodies = (params?: ICustodyQueryParams) => {
  const { data, isPending: isGetCustodiesPending } = useGetPaginated<
    ICustodyResponse,
    ICustodyQueryParams
  >({
    endPoint: '/api/custodies',
    queryKey: ['custodies'],
    params,
  });

  const custodies: ICustodyTableRow[] = (data?.data ?? []).map(toCustodyRow);
  const totalCustodiesCount = data?.totalCount ?? 0;

  return { custodies, isGetCustodiesPending, totalCustodiesCount };
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- src/features/custody/api/__tests__/custody-row-mapper.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/features/custody/api/get-all.ts src/features/custody/api/__tests__
git commit -m "feat(custody): add list hook and row mapper"
```

---

## Task 4: get-one / create / update / delete hooks

**Files:**

- Create: `src/features/custody/api/get-one.ts`, `create.ts`, `update.ts`, `delete.ts`

No new logic to unit-test (thin wrappers over base hooks, like accounting). Verified by `pnpm build`.

- [ ] **Step 1: Write `get-one.ts`**

```ts
// src/features/custody/api/get-one.ts
import { useGetOne } from '@/hooks/base/get-one';

import type { ICustodyResponse } from '../types';

export const useGetOneCustody = (id: number | null) => {
  const { data: custody, isPending: isGetCustodyLoading } = useGetOne<ICustodyResponse, Error>({
    endPoint: `/api/custodies/${id}`,
    queryKey: ['custodies', id],
    enabled: id != null,
  });
  return { custody, isGetCustodyLoading };
};
```

- [ ] **Step 2: Write `create.ts`**

```ts
// src/features/custody/api/create.ts
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { useCreate } from '@/hooks/base/create';

import type { CustodyBody, ICustodyResponse } from '../types';

export const useCreateCustody = () => {
  const t = useTranslations('custody');
  const { mutate: createCustodyMutation, isPending: isCreateCustodyPending } = useCreate<
    ICustodyResponse,
    Error,
    CustodyBody
  >({
    endPoint: 'api/custodies',
    queryKey: ['custodies'],
    onSuccess: () => toast.success(t('actions.created')),
  });
  return { createCustodyMutation, isCreateCustodyPending };
};
```

- [ ] **Step 3: Write `update.ts`**

```ts
// src/features/custody/api/update.ts
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { usePut } from '@/hooks/base/update';

import type { CustodyBody, ICustodyResponse } from '../types';

export const useUpdateCustody = () => {
  const t = useTranslations('custody');
  const { mutate: updateCustodyMutation, isPending: isUpdateCustodyPending } = usePut<
    ICustodyResponse,
    Error,
    Partial<CustodyBody>
  >({
    endPoint: 'api/custodies',
    queryKey: ['custodies'],
    onSuccess: () => toast.success(t('actions.updated')),
  });
  return { updateCustodyMutation, isUpdateCustodyPending };
};
```

- [ ] **Step 4: Write `delete.ts`**

```ts
// src/features/custody/api/delete.ts
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { useDelete } from '@/hooks/base/delete';

export const useDeleteCustody = () => {
  const t = useTranslations('custody');
  const { mutate: deleteCustodyMutation, isPending: isDeleteCustodyPending } = useDelete<
    unknown,
    Error
  >({
    endPoint: 'api/custodies',
    queryKey: ['custodies'],
    onSuccess: () => toast.success(t('actions.deleted')),
  });
  return { deleteCustodyMutation, isDeleteCustodyPending };
};
```

- [ ] **Step 5: Verify build & commit**

Run: `pnpm build`
Expected: success.

```bash
git add src/features/custody/api
git commit -m "feat(custody): add get-one/create/update/delete hooks"
```

---

## Task 5: i18n `custody` namespace

**Files:**

- Create: `messages/ar/custody.json`, `messages/en/custody.json`
- Modify: `src/i18n/request.ts`

- [ ] **Step 1: Create `messages/ar/custody.json`**

```json
{
  "title": "العُهد",
  "table": {
    "employee": "الموظف",
    "account": "الحساب",
    "journey": "الرحلة",
    "driver": "السائق",
    "status": "الحالة",
    "createdAt": "تاريخ الإنشاء",
    "actions": "إجراءات",
    "noData": "لا توجد بيانات"
  },
  "statuses": { "ACTIVE": "نشطة", "INACTIVE": "غير نشطة", "CLOSED": "مغلقة" },
  "form": {
    "createTitle": "إضافة عهدة",
    "editTitle": "تعديل العهدة",
    "employee": "الموظف",
    "account": "الحساب",
    "status": "الحالة",
    "journey": "الرحلة",
    "driver": "السائق",
    "selectPlaceholder": "اختر",
    "save": "حفظ",
    "cancel": "إلغاء"
  },
  "actions": {
    "created": "تم إنشاء العهدة",
    "updated": "تم تحديث العهدة",
    "deleted": "تم حذف العهدة",
    "confirmDelete": "هل أنت متأكد من حذف هذه العهدة؟"
  },
  "loading": "جارٍ التحميل..."
}
```

- [ ] **Step 2: Create `messages/en/custody.json`**

```json
{
  "title": "Custodies",
  "table": {
    "employee": "Employee",
    "account": "Account",
    "journey": "Journey",
    "driver": "Driver",
    "status": "Status",
    "createdAt": "Created",
    "actions": "Actions",
    "noData": "No data"
  },
  "statuses": { "ACTIVE": "Active", "INACTIVE": "Inactive", "CLOSED": "Closed" },
  "form": {
    "createTitle": "Add Custody",
    "editTitle": "Edit Custody",
    "employee": "Employee",
    "account": "Account",
    "status": "Status",
    "journey": "Journey",
    "driver": "Driver",
    "selectPlaceholder": "Select",
    "save": "Save",
    "cancel": "Cancel"
  },
  "actions": {
    "created": "Custody created",
    "updated": "Custody updated",
    "deleted": "Custody deleted",
    "confirmDelete": "Are you sure you want to delete this custody?"
  },
  "loading": "Loading..."
}
```

- [ ] **Step 3: Register in `src/i18n/request.ts`**

Add `import(\`../../messages/${locale}/custody.json\`)`to the`Promise.all`, capture as `custodyMessages`, and add `custody: custodyMessages.default`to the returned`messages` object.

- [ ] **Step 4: Verify build & commit**

Run: `pnpm build`
Expected: success.

```bash
git add messages/ar/custody.json messages/en/custody.json src/i18n/request.ts
git commit -m "feat(custody): add custody i18n namespace"
```

---

## Task 6: `CustodyTable` component

**Files:**

- Create: `src/features/custody/components/custody-table.tsx`
- Test: `src/features/custody/components/__tests__/custody-table.test.tsx`

Mirrors [transactions-table.tsx](../../../src/features/accounting/transactions/components/transactions-table.tsx).

- [ ] **Step 1: Write the failing test**

```tsx
// src/features/custody/components/__tests__/custody-table.test.tsx
import { render, screen } from '@testing-library/react';
jest.mock('next-intl', () => ({ useTranslations: () => (k: string) => k }));
import CustodyTable from '../custody-table';

const rows = [
  {
    id: 1,
    employeeName: 'Ahmed Ali',
    accountName: 'Acc',
    journeyNumber: 'DEL-001',
    driverName: 'M H',
    status: 'ACTIVE' as const,
    createdAt: '01/06/2026',
  },
];

it('renders a custody row and an empty state', () => {
  const { rerender } = render(<CustodyTable data={rows} />);
  expect(screen.getByText('Ahmed Ali')).toBeInTheDocument();
  expect(screen.getByText('DEL-001')).toBeInTheDocument();

  rerender(<CustodyTable data={[]} />);
  expect(screen.getByText('table.noData')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/features/custody/components/__tests__/custody-table.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

```tsx
// src/features/custody/components/custody-table.tsx
'use client';

import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import type { CustodyStatus } from '../enums/custody-status';
import type { ICustodyTableRow } from '../types';

const STATUS_COLORS: Record<CustodyStatus, string> = {
  ACTIVE: 'bg-badge-active-bg text-badge-active-fg border-transparent',
  INACTIVE: 'bg-amber-100 text-amber-800 border-transparent',
  CLOSED: 'bg-slate-100 text-slate-700 border-transparent',
};

interface CustodyTableProps {
  data: ICustodyTableRow[];
  onView?: (id: number) => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  canManage?: boolean;
}

export default function CustodyTable({
  data,
  onView,
  onEdit,
  onDelete,
  canManage,
}: CustodyTableProps) {
  const t = useTranslations('custody');
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('table.employee')}</TableHead>
          <TableHead>{t('table.account')}</TableHead>
          <TableHead>{t('table.journey')}</TableHead>
          <TableHead>{t('table.driver')}</TableHead>
          <TableHead className="w-32 text-center">{t('table.status')}</TableHead>
          <TableHead className="text-left">{t('table.actions')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
              {t('table.noData')}
            </TableCell>
          </TableRow>
        ) : (
          data.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium text-foreground">{row.employeeName}</TableCell>
              <TableCell className="text-foreground">{row.accountName}</TableCell>
              <TableCell className="text-foreground">{row.journeyNumber}</TableCell>
              <TableCell className="text-foreground">{row.driverName}</TableCell>
              <TableCell className="text-center">
                <Badge
                  className={`rounded-full px-4 py-1 text-xs font-semibold ${STATUS_COLORS[row.status]}`}
                >
                  {t(`statuses.${row.status}`)}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onView?.(row.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {canManage && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onEdit?.(row.id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onDelete?.(row.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- src/features/custody/components/__tests__/custody-table.test.tsx`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add src/features/custody/components/custody-table.tsx src/features/custody/components/__tests__
git commit -m "feat(custody): add custody table component"
```

---

## Task 7: `CustodyFormDialog` (create/edit)

**Files:**

- Create: `src/features/custody/components/custody-form-dialog.tsx`

Selects reuse existing hooks: employees `useGetAllEmployees` (`@/features/employees/api/get-all`), drivers `useGetAllDrivers`, journeys `useGetAllJourneys` (`@/features/trips/api/get-all/get-all-journeys`), accounts `useGetAllAccounts` (`@/features/accounting/accounts/api/get-all`). Verify each hook's returned field/array names before mapping (they differ per feature).

- [ ] **Step 1: Write the component**

```tsx
// src/features/custody/components/custody-form-dialog.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
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
import { Label } from '@/components/ui/label';

import { useCreateCustody } from '../api/create';
import { useGetOneCustody } from '../api/get-one';
import { useUpdateCustody } from '../api/update';
import { CUSTODY_STATUSES } from '../enums/custody-status';
import { custodyFormSchema, toCustodyBody, type CustodyFormValues } from '../types';

interface CustodyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editId?: number | null;
  // option lists provided by the page (already fetched there to avoid duplicate queries)
  employees: { id: number; name: string }[];
  accounts: { id: number; name: string }[];
  journeys: { id: number; name: string }[];
  drivers: { id: number; name: string }[];
}

const EMPTY: CustodyFormValues = {
  employeeId: '',
  accountId: '',
  status: 'ACTIVE',
  journeyId: '',
  driverId: '',
};

export default function CustodyFormDialog({
  open,
  onOpenChange,
  editId,
  employees,
  accounts,
  journeys,
  drivers,
}: CustodyFormDialogProps) {
  const t = useTranslations('custody');
  const isEditing = !!editId;
  const { custody } = useGetOneCustody(editId ?? null);
  const { createCustodyMutation, isCreateCustodyPending } = useCreateCustody();
  const { updateCustodyMutation, isUpdateCustodyPending } = useUpdateCustody();

  const form = useForm<CustodyFormValues>({
    resolver: zodResolver(custodyFormSchema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (open && isEditing && custody) {
      form.reset({
        employeeId: String(custody.employeeId),
        accountId: String(custody.accountId),
        status: custody.status,
        journeyId: custody.journeyId ? String(custody.journeyId) : '',
        driverId: custody.driverId ? String(custody.driverId) : '',
      });
    } else if (open && !isEditing) {
      form.reset(EMPTY);
    }
  }, [open, isEditing, custody, form]);

  const onSubmit = (values: CustodyFormValues) => {
    const body = toCustodyBody(values);
    if (isEditing && editId) {
      updateCustodyMutation({ id: editId, data: body }, { onSuccess: () => onOpenChange(false) });
    } else {
      createCustodyMutation(body, { onSuccess: () => onOpenChange(false) });
    }
  };

  const SelectField = ({
    label,
    name,
    options,
    optional,
  }: {
    label: string;
    name: keyof CustodyFormValues;
    options: { id: number; name: string }[];
    optional?: boolean;
  }) => (
    <div className="flex flex-col gap-1">
      <Label>
        {label}
        {!optional && ' *'}
      </Label>
      <select
        className="h-10 rounded-md border border-input bg-background px-3"
        {...form.register(name)}
      >
        <option value="">{t('form.selectPlaceholder')}</option>
        {options.map((o) => (
          <option key={o.id} value={String(o.id)}>
            {o.name}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl">
        <DialogHeader>
          <DialogTitle>{isEditing ? t('form.editTitle') : t('form.createTitle')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-3">
          <SelectField label={t('form.employee')} name="employeeId" options={employees} />
          <SelectField label={t('form.account')} name="accountId" options={accounts} />
          <div className="flex flex-col gap-1">
            <Label>{t('form.status')} *</Label>
            <select
              className="h-10 rounded-md border border-input bg-background px-3"
              {...form.register('status')}
            >
              {CUSTODY_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t(`statuses.${s}`)}
                </option>
              ))}
            </select>
          </div>
          <SelectField label={t('form.journey')} name="journeyId" options={journeys} optional />
          <SelectField label={t('form.driver')} name="driverId" options={drivers} optional />
          <DialogFooter className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('form.cancel')}
            </Button>
            <Button type="submit" disabled={isCreateCustodyPending || isUpdateCustodyPending}>
              {t('form.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Verify build & commit**

Run: `pnpm build`
Expected: success.

```bash
git add src/features/custody/components/custody-form-dialog.tsx
git commit -m "feat(custody): add create/edit form dialog"
```

---

## Task 8: List page client + route, detail view + route

**Files:**

- Create: `src/features/custody/components/custody-page-client.tsx`
- Create: `src/features/custody/components/custody-detail.tsx`
- Create: `src/app/[locale]/(loggedIn)/custody/page.tsx`
- Create: `src/app/[locale]/(loggedIn)/custody/[custodyId]/page.tsx`

- [ ] **Step 1: Write `custody-page-client.tsx`**

Fetches custodies + the option lists once and passes them down. Role gating via `useSession().data?.user?.role === 'admin'` (the session stores a lowercased role; adjust the comparison to the actual admin role string returned by the backend).

```tsx
// src/features/custody/components/custody-page-client.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

import EntitiesToolbar from '@/components/common/entities-toolbar';
import TableFilters from '@/components/common/table-filters';
import TablePagination from '@/components/common/table-pagination';
import { usePaginationParams } from '@/hooks/use-pagination-params';
import { useGetAllEmployees } from '@/features/employees/api/get-all';
import { useGetAllDrivers } from '@/features/drivers/api/get-all';

import { useGetAllCustodies } from '../api/get-all';
import { useDeleteCustody } from '../api/delete';
import CustodyTable from './custody-table';
import CustodyFormDialog from './custody-form-dialog';

export default function CustodyPageClient() {
  const t = useTranslations('custody');
  const router = useRouter();
  const { data: session } = useSession();
  const canManage = session?.user?.role === 'admin' || session?.user?.role === 'ADMIN';

  const params = usePaginationParams();
  const { custodies, isGetCustodiesPending, totalCustodiesCount } = useGetAllCustodies(params);
  const { deleteCustodyMutation } = useDeleteCustody();

  const { employees } = useGetAllEmployees();
  const { drivers } = useGetAllDrivers();

  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const handleDelete = (id: number) => {
    if (window.confirm(t('actions.confirmDelete'))) deleteCustodyMutation(String(id));
  };

  return (
    <main>
      <div className="pageContainer">
        {canManage && (
          <EntitiesToolbar
            onAdd={() => {
              setEditId(null);
              setFormOpen(true);
            }}
          />
        )}
        <TableFilters applyDefaultDateRange={false} />
        {isGetCustodiesPending ? (
          <p className="p-4 text-center">{t('loading')}</p>
        ) : (
          <>
            <CustodyTable
              data={custodies}
              canManage={canManage}
              onView={(id) => router.push(`/custody/${id}`)}
              onEdit={(id) => {
                setEditId(id);
                setFormOpen(true);
              }}
              onDelete={handleDelete}
            />
            <TablePagination totalCount={totalCustodiesCount} />
          </>
        )}
        {canManage && (
          <CustodyFormDialog
            open={formOpen}
            onOpenChange={setFormOpen}
            editId={editId}
            employees={(employees ?? []).map((e: any) => ({
              id: e.id,
              name: e.name ?? e.user?.firstName ?? String(e.id),
            }))}
            accounts={[]}
            journeys={[]}
            drivers={(drivers ?? []).map((d: any) => ({ id: d.id, name: d.driverName }))}
          />
        )}
      </div>
    </main>
  );
}
```

> `accounts`/`journeys` are passed empty here to keep this task focused; wire `useGetAllAccounts` and `useGetAllJourneys` into the two arrays once their return shapes are confirmed (both follow the same `{ id, name }` mapping). This is a concrete follow-up, not a placeholder for unknown behavior.

- [ ] **Step 2: Write `custody-detail.tsx`**

```tsx
// src/features/custody/components/custody-detail.tsx
'use client';

import { useTranslations } from 'next-intl';

import { useGetOneCustody } from '../api/get-one';

export default function CustodyDetail({ custodyId }: { custodyId: number }) {
  const t = useTranslations('custody');
  const { custody, isGetCustodyLoading } = useGetOneCustody(custodyId);

  if (isGetCustodyLoading) return <p className="p-4">{t('loading')}</p>;
  if (!custody) return <p className="p-4">{t('table.noData')}</p>;

  const rows: { label: string; value: string }[] = [
    {
      label: t('form.employee'),
      value: custody.employee?.user
        ? `${custody.employee.user.firstName ?? ''} ${custody.employee.user.lastName ?? ''}`.trim()
        : '—',
    },
    { label: t('form.account'), value: custody.account?.name ?? '—' },
    { label: t('form.journey'), value: custody.journey?.delegateNumber ?? '—' },
    { label: t('form.status'), value: t(`statuses.${custody.status}`) },
  ];

  return (
    <div className="max-w-xl space-y-2" dir="rtl">
      <h1 className="titleStyle mb-4">{t('title')}</h1>
      {rows.map((r) => (
        <div key={r.label} className="flex justify-between border-b py-2">
          <span className="text-muted-foreground">{r.label}</span>
          <span className="font-medium">{r.value}</span>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Write the two route pages**

```tsx
// src/app/[locale]/(loggedIn)/custody/page.tsx
import CustodyPageClient from '@/features/custody/components/custody-page-client';

export default function CustodyPage() {
  return <CustodyPageClient />;
}
```

```tsx
// src/app/[locale]/(loggedIn)/custody/[custodyId]/page.tsx
import CustodyDetail from '@/features/custody/components/custody-detail';

interface PageProps {
  params: Promise<{ custodyId: string; locale: string }>;
}

export default async function CustodyDetailPage({ params }: PageProps) {
  const { custodyId } = await params;
  return (
    <div className="container mx-auto">
      <CustodyDetail custodyId={Number(custodyId)} />
    </div>
  );
}
```

- [ ] **Step 4: Verify build & full custody suite**

Run: `pnpm test -- src/features/custody` then `pnpm build`
Expected: tests PASS; build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/features/custody/components "src/app/[locale]/(loggedIn)/custody"
git commit -m "feat(custody): add list page, detail view and routes"
```

---

## Task 9: Manual verification

- [ ] **Step 1:** `pnpm dev`, sign in as admin → `/custody` lists records, filters work, add/edit dialog saves, delete confirms and removes, row "view" opens `/custody/[id]`.
- [ ] **Step 2:** Sign in as an employee → `/custody` shows a read-only list (no toolbar/manage actions), auto-scoped to own records.

---

## Self-Review (completed during planning)

- **Spec coverage:** list + filters ✓ (Tasks 3/8), create/edit ✓ (Task 7), detail ✓ (Task 8), delete ✓ (Tasks 4/8), status badge ✓ (Task 6), role gating ✓ (Task 8 `canManage`), i18n ✓ (Task 5). Query params from [phase-6-api.md §1](../../../phase-6-api.md) covered by `ICustodyQueryParams`.
- **Placeholder scan:** the empty `accounts`/`journeys` arrays in Task 8 are an explicit, scoped follow-up (mapping pattern given), not an unknown. No TODOs.
- **Type consistency:** `ICustodyResponse`, `ICustodyTableRow`, `CustodyFormValues`, `CustodyBody`, `toCustodyBody`, `toCustodyRow`, `useGetAllCustodies`, `useGetOneCustody`, `useCreateCustody`, `useUpdateCustody`, `useDeleteCustody` consistent across tasks.

## Open follow-ups

1. Confirm the admin role string (`'admin'` vs `'ADMIN'`) the backend returns and tighten `canManage`.
2. Wire `useGetAllAccounts` and `useGetAllJourneys` into the form option lists.
