# Phase 6 — Office Requests Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the **Office Requests** module — a paginated list with filters, a create dialog (employee/user), admin **approve/reject** actions on PENDING rows, and delete — over `/api/office-requests`.

**Architecture:** New `src/features/office-requests/` feature following the accounting CRUD pattern. Standard base hooks for list/get-one/create/delete; a bespoke `useRequestAction` mutation for `POST /:id/request-action` (dynamic URL). Admin-only approve/reject + delete; create is available to `ADMIN`/`USER`.

**Tech Stack:** Next.js App Router, TanStack Query, React Hook Form + Zod, next-intl (RTL), shadcn `Table`/`Dialog`/`Select`, Jest + @testing-library/react.

**Spec:** [docs/superpowers/specs/2026-06-12-phase-6-office-custody-requests-design.md](../specs/2026-06-12-phase-6-office-custody-requests-design.md) · **API:** [phase-6-api.md §2](../../../../frontend/phase-6-api.md) · **Prereq:** run Task 0 of the [office-flow plan](./2026-06-12-phase-6-office-flow.md) first (deps install + test runner).

---

## File Structure

| File                                                                      | Responsibility                          |
| ------------------------------------------------------------------------- | --------------------------------------- |
| `src/features/office-requests/enums/office-request-status.ts`             | status values                           |
| `src/features/office-requests/enums/office-request-type.ts`               | type values                             |
| `src/features/office-requests/types/index.ts`                             | DTOs, table-row type, form schema, body |
| `src/features/office-requests/api/get-all.ts`                             | `useGetAllOfficeRequests` (+ mapper)    |
| `src/features/office-requests/api/get-one.ts`                             | `useGetOneOfficeRequest`                |
| `src/features/office-requests/api/create.ts`                              | `useCreateOfficeRequest`                |
| `src/features/office-requests/api/request-action.ts`                      | `useRequestAction` (approve/reject)     |
| `src/features/office-requests/api/delete.ts`                              | `useDeleteOfficeRequest`                |
| `src/features/office-requests/components/office-requests-page-client.tsx` | List page orchestration                 |
| `src/features/office-requests/components/office-requests-table.tsx`       | Table + approve/reject/delete actions   |
| `src/features/office-requests/components/office-request-form-dialog.tsx`  | Create dialog                           |
| `src/app/[locale]/(loggedIn)/office-requests/page.tsx`                    | Route → list                            |
| `messages/{ar,en}/office-requests.json`                                   | i18n namespace `officeRequests`         |
| `src/i18n/request.ts` (modify)                                            | Register `officeRequests` namespace     |

> Nav/breadcrumb for `/office-requests` are added in the office-flow plan (Task 7). Standalone: add `'office-requests': 'طلبات المكتب'` to `modules` in `src/config/routes.ts` and a side-menu item.

---

## Task 1: Status & type enums

**Files:**

- Create: `src/features/office-requests/enums/office-request-status.ts`, `office-request-type.ts`
- Test: `src/features/office-requests/enums/__tests__/enums.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/features/office-requests/enums/__tests__/enums.test.ts
import { OFFICE_REQUEST_STATUSES } from '../office-request-status';
import { OFFICE_REQUEST_TYPES } from '../office-request-type';

it('lists statuses', () => {
  expect(OFFICE_REQUEST_STATUSES).toEqual(['PENDING', 'APPROVED', 'REJECTED']);
});

it('lists types', () => {
  expect(OFFICE_REQUEST_TYPES).toEqual([
    'PRINT_DELEGATION',
    'END_WORKING_SHIFT',
    'ASK_FOR_CUSTODY',
  ]);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/features/office-requests/enums/__tests__/enums.test.ts`
Expected: FAIL — modules not found.

- [ ] **Step 3: Write the implementations**

```ts
// src/features/office-requests/enums/office-request-status.ts
export const OFFICE_REQUEST_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'] as const;
export type OfficeRequestStatus = (typeof OFFICE_REQUEST_STATUSES)[number];
```

```ts
// src/features/office-requests/enums/office-request-type.ts
export const OFFICE_REQUEST_TYPES = [
  'PRINT_DELEGATION',
  'END_WORKING_SHIFT',
  'ASK_FOR_CUSTODY',
] as const;
export type OfficeRequestType = (typeof OFFICE_REQUEST_TYPES)[number];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- src/features/office-requests/enums/__tests__/enums.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/features/office-requests/enums
git commit -m "feat(office-requests): add status and type enums"
```

---

## Task 2: Types, form schema & body mapper

**Files:**

- Create: `src/features/office-requests/types/index.ts`
- Test: `src/features/office-requests/types/__tests__/schema.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/features/office-requests/types/__tests__/schema.test.ts
import { officeRequestFormSchema, toOfficeRequestBody } from '../index';

const valid = {
  type: 'PRINT_DELEGATION',
  description: 'please print',
  journeyId: '12',
  requestedFromId: '3',
  requestedToId: '5',
};

describe('officeRequestFormSchema', () => {
  it('accepts a valid request', () => {
    expect(officeRequestFormSchema.safeParse(valid).success).toBe(true);
  });

  it('requires type, journey, from and to', () => {
    expect(officeRequestFormSchema.safeParse({ ...valid, journeyId: '' }).success).toBe(false);
    expect(officeRequestFormSchema.safeParse({ ...valid, requestedFromId: '' }).success).toBe(
      false,
    );
  });

  it('maps form values to a numeric body and omits empty description', () => {
    const body = toOfficeRequestBody({ ...valid, description: '' });
    expect(body).toEqual({
      type: 'PRINT_DELEGATION',
      journeyId: 12,
      requestedFromId: 3,
      requestedToId: 5,
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/features/office-requests/types/__tests__/schema.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

```ts
// src/features/office-requests/types/index.ts
import { z } from 'zod';

import type { OfficeRequestStatus } from '../enums/office-request-status';
import type { OfficeRequestType } from '../enums/office-request-type';

export interface IOfficeRequestResponse {
  id: number;
  type: OfficeRequestType;
  status: OfficeRequestStatus;
  description?: string | null;
  journey?: { id: number; delegateNumber?: string };
  requestedFrom?: { id: number; user?: { firstName?: string; lastName?: string } };
  requestedTo?: { id: number; user?: { firstName?: string; lastName?: string } };
  createdAt?: string;
}

export interface IOfficeRequestTableRow {
  id: number;
  type: OfficeRequestType;
  status: OfficeRequestStatus;
  journeyNumber: string;
  fromName: string;
  toName: string;
  createdAt: string;
}

export const officeRequestFormSchema = z.object({
  type: z.enum(['PRINT_DELEGATION', 'END_WORKING_SHIFT', 'ASK_FOR_CUSTODY']),
  description: z.string().optional().default(''),
  journeyId: z.string().min(1, 'مطلوب'),
  requestedFromId: z.string().min(1, 'مطلوب'),
  requestedToId: z.string().min(1, 'مطلوب'),
});

export type OfficeRequestFormValues = z.infer<typeof officeRequestFormSchema>;

export interface OfficeRequestBody {
  type: OfficeRequestType;
  description?: string;
  journeyId: number;
  requestedFromId: number;
  requestedToId: number;
}

export function toOfficeRequestBody(values: OfficeRequestFormValues): OfficeRequestBody {
  const body: OfficeRequestBody = {
    type: values.type,
    journeyId: Number(values.journeyId),
    requestedFromId: Number(values.requestedFromId),
    requestedToId: Number(values.requestedToId),
  };
  if (values.description) body.description = values.description;
  return body;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- src/features/office-requests/types/__tests__/schema.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/features/office-requests/types
git commit -m "feat(office-requests): add types, schema and body mapper"
```

---

## Task 3: `useGetAllOfficeRequests` + row mapper

**Files:**

- Create: `src/features/office-requests/api/get-all.ts`
- Test: `src/features/office-requests/api/__tests__/row-mapper.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/features/office-requests/api/__tests__/row-mapper.test.ts
import { toOfficeRequestRow } from '../get-all';

it('maps a response to a flat row', () => {
  const row = toOfficeRequestRow({
    id: 1,
    type: 'PRINT_DELEGATION',
    status: 'PENDING',
    journey: { id: 12, delegateNumber: 'DEL-001' },
    requestedFrom: { id: 3, user: { firstName: 'Ahmed', lastName: 'Ali' } },
    requestedTo: { id: 5, user: { firstName: 'Sara', lastName: 'Mohamed' } },
    createdAt: '2026-06-10T09:00:00.000Z',
  });
  expect(row).toMatchObject({
    id: 1,
    type: 'PRINT_DELEGATION',
    status: 'PENDING',
    journeyNumber: 'DEL-001',
    fromName: 'Ahmed Ali',
    toName: 'Sara Mohamed',
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/features/office-requests/api/__tests__/row-mapper.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

```ts
// src/features/office-requests/api/get-all.ts
import { useGetPaginated } from '@/hooks/base/get-paginated';
import type { IQueryParams } from '@/types/query-params';

import type { OfficeRequestStatus } from '../enums/office-request-status';
import type { OfficeRequestType } from '../enums/office-request-type';
import type { IOfficeRequestResponse, IOfficeRequestTableRow } from '../types';

export interface IOfficeRequestQueryParams extends IQueryParams {
  journeyId?: number;
  requestedFromId?: number;
  requestedToId?: number;
  status?: OfficeRequestStatus;
  type?: OfficeRequestType;
  updatedAtFrom?: string;
  updatedAtTo?: string;
}

const fullName = (u?: { firstName?: string; lastName?: string }) =>
  u && (u.firstName || u.lastName) ? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() : '—';

export function toOfficeRequestRow(r: IOfficeRequestResponse): IOfficeRequestTableRow {
  return {
    id: r.id,
    type: r.type,
    status: r.status,
    journeyNumber: r.journey?.delegateNumber ?? '—',
    fromName: fullName(r.requestedFrom?.user),
    toName: fullName(r.requestedTo?.user),
    createdAt: r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-GB') : '—',
  };
}

export const useGetAllOfficeRequests = (params?: IOfficeRequestQueryParams) => {
  const { data, isPending: isGetOfficeRequestsPending } = useGetPaginated<
    IOfficeRequestResponse,
    IOfficeRequestQueryParams
  >({
    endPoint: '/api/office-requests',
    queryKey: ['office-requests'],
    params,
  });

  const officeRequests: IOfficeRequestTableRow[] = (data?.data ?? []).map(toOfficeRequestRow);
  const totalOfficeRequestsCount = data?.totalCount ?? 0;

  return { officeRequests, isGetOfficeRequestsPending, totalOfficeRequestsCount };
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- src/features/office-requests/api/__tests__/row-mapper.test.ts`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add src/features/office-requests/api/get-all.ts src/features/office-requests/api/__tests__
git commit -m "feat(office-requests): add list hook and row mapper"
```

---

## Task 4: get-one / create / delete / request-action hooks

**Files:**

- Create: `src/features/office-requests/api/get-one.ts`, `create.ts`, `delete.ts`, `request-action.ts`
- Test: `src/features/office-requests/api/__tests__/request-action.test.tsx`

- [ ] **Step 1: Write `get-one.ts`**

```ts
// src/features/office-requests/api/get-one.ts
import { useGetOne } from '@/hooks/base/get-one';

import type { IOfficeRequestResponse } from '../types';

export const useGetOneOfficeRequest = (id: number | null) => {
  const { data: officeRequest, isPending: isGetOfficeRequestLoading } = useGetOne<
    IOfficeRequestResponse,
    Error
  >({
    endPoint: `/api/office-requests/${id}`,
    queryKey: ['office-requests', id],
    enabled: id != null,
  });
  return { officeRequest, isGetOfficeRequestLoading };
};
```

- [ ] **Step 2: Write `create.ts`**

```ts
// src/features/office-requests/api/create.ts
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { useCreate } from '@/hooks/base/create';

import type { IOfficeRequestResponse, OfficeRequestBody } from '../types';

export const useCreateOfficeRequest = () => {
  const t = useTranslations('officeRequests');
  const { mutate: createOfficeRequestMutation, isPending: isCreateOfficeRequestPending } =
    useCreate<IOfficeRequestResponse, Error, OfficeRequestBody>({
      endPoint: 'api/office-requests',
      queryKey: ['office-requests'],
      onSuccess: () => toast.success(t('actions.created')),
    });
  return { createOfficeRequestMutation, isCreateOfficeRequestPending };
};
```

- [ ] **Step 3: Write `delete.ts`**

```ts
// src/features/office-requests/api/delete.ts
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { useDelete } from '@/hooks/base/delete';

export const useDeleteOfficeRequest = () => {
  const t = useTranslations('officeRequests');
  const { mutate: deleteOfficeRequestMutation, isPending: isDeleteOfficeRequestPending } =
    useDelete<unknown, Error>({
      endPoint: 'api/office-requests',
      queryKey: ['office-requests'],
      onSuccess: () => toast.success(t('actions.deleted')),
    });
  return { deleteOfficeRequestMutation, isDeleteOfficeRequestPending };
};
```

- [ ] **Step 4: Write the request-action test (bespoke hook)**

```tsx
// src/features/office-requests/api/__tests__/request-action.test.tsx
import { renderHook, act } from '@testing-library/react';

const post = jest.fn().mockResolvedValue({ data: {} });
const invalidateQueries = jest.fn();
jest.mock('@/lib/client', () => ({
  __esModule: true,
  default: { post: (...a: any[]) => post(...a) },
}));
jest.mock('@/lib/query-client', () => ({
  __esModule: true,
  default: { invalidateQueries: (...a: any[]) => invalidateQueries(...a) },
}));
jest.mock('next-intl', () => ({ useTranslations: () => (k: string) => k, useLocale: () => 'ar' }));
jest.mock('react-toastify', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRequestAction } from '../request-action';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

it('posts the action to the request-action endpoint', async () => {
  const { result } = renderHook(() => useRequestAction(), { wrapper });
  await act(async () => {
    await result.current.requestActionMutation({ id: 7, status: 'APPROVED' });
  });
  expect(post).toHaveBeenCalledWith('api/office-requests/7/request-action', { status: 'APPROVED' });
});
```

- [ ] **Step 5: Write `request-action.ts`**

```ts
// src/features/office-requests/api/request-action.ts
import { useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import client from '@/lib/client';
import queryClient from '@/lib/query-client';

import type { IOfficeRequestResponse } from '../types';

export interface RequestActionArgs {
  id: number;
  status: 'APPROVED' | 'REJECTED';
}

export const useRequestAction = () => {
  const t = useTranslations('officeRequests');
  const mutation = useMutation<IOfficeRequestResponse, Error, RequestActionArgs>({
    mutationFn: async ({ id, status }) => {
      const res = await client.post(`api/office-requests/${id}/request-action`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['office-requests'] });
      toast.success(t('actions.actioned'));
    },
    onError: () => toast.error(t('actions.actionError')),
  });
  return {
    requestActionMutation: mutation.mutateAsync,
    isRequestActionPending: mutation.isPending,
  };
};
```

- [ ] **Step 6: Run the request-action test & build**

Run: `pnpm test -- src/features/office-requests/api/__tests__/request-action.test.tsx` then `pnpm build`
Expected: PASS (1 test); build succeeds.

- [ ] **Step 7: Commit**

```bash
git add src/features/office-requests/api
git commit -m "feat(office-requests): add get-one/create/delete/request-action hooks"
```

---

## Task 5: i18n `officeRequests` namespace

**Files:**

- Create: `messages/ar/office-requests.json`, `messages/en/office-requests.json`
- Modify: `src/i18n/request.ts`

- [ ] **Step 1: Create `messages/ar/office-requests.json`**

```json
{
  "title": "طلبات المكتب",
  "table": {
    "type": "النوع",
    "status": "الحالة",
    "journey": "الرحلة",
    "from": "مقدم الطلب",
    "to": "إلى",
    "createdAt": "تاريخ الإنشاء",
    "actions": "إجراءات",
    "noData": "لا توجد بيانات"
  },
  "types": {
    "PRINT_DELEGATION": "طباعة التفويض",
    "END_WORKING_SHIFT": "إنهاء وردية العمل",
    "ASK_FOR_CUSTODY": "طلب عُهدة"
  },
  "statuses": { "PENDING": "قيد الانتظار", "APPROVED": "مقبول", "REJECTED": "مرفوض" },
  "form": {
    "createTitle": "إضافة طلب",
    "type": "النوع",
    "description": "تفاصيل",
    "journey": "الرحلة",
    "from": "مقدم الطلب",
    "to": "إلى",
    "selectPlaceholder": "اختر",
    "save": "حفظ",
    "cancel": "إلغاء"
  },
  "rowActions": { "approve": "قبول", "reject": "رفض", "delete": "حذف" },
  "actions": {
    "created": "تم إنشاء الطلب",
    "deleted": "تم حذف الطلب",
    "actioned": "تم تحديث حالة الطلب",
    "actionError": "تعذر تنفيذ الإجراء",
    "confirmDelete": "هل أنت متأكد من حذف هذا الطلب؟"
  },
  "loading": "جارٍ التحميل..."
}
```

- [ ] **Step 2: Create `messages/en/office-requests.json`**

```json
{
  "title": "Office Requests",
  "table": {
    "type": "Type",
    "status": "Status",
    "journey": "Journey",
    "from": "Requested by",
    "to": "To",
    "createdAt": "Created",
    "actions": "Actions",
    "noData": "No data"
  },
  "types": {
    "PRINT_DELEGATION": "Print Delegation",
    "END_WORKING_SHIFT": "End Working Shift",
    "ASK_FOR_CUSTODY": "Ask for Custody"
  },
  "statuses": { "PENDING": "Pending", "APPROVED": "Approved", "REJECTED": "Rejected" },
  "form": {
    "createTitle": "Add Request",
    "type": "Type",
    "description": "Description",
    "journey": "Journey",
    "from": "Requested by",
    "to": "To",
    "selectPlaceholder": "Select",
    "save": "Save",
    "cancel": "Cancel"
  },
  "rowActions": { "approve": "Approve", "reject": "Reject", "delete": "Delete" },
  "actions": {
    "created": "Request created",
    "deleted": "Request deleted",
    "actioned": "Request status updated",
    "actionError": "Could not perform the action",
    "confirmDelete": "Are you sure you want to delete this request?"
  },
  "loading": "Loading..."
}
```

- [ ] **Step 3: Register in `src/i18n/request.ts`**

Add `import(\`../../messages/${locale}/office-requests.json\`)`to the`Promise.all`, capture as `officeRequestsMessages`, and add `officeRequests: officeRequestsMessages.default`to the returned`messages` object.

- [ ] **Step 4: Verify build & commit**

Run: `pnpm build`
Expected: success.

```bash
git add messages/ar/office-requests.json messages/en/office-requests.json src/i18n/request.ts
git commit -m "feat(office-requests): add i18n namespace"
```

---

## Task 6: `OfficeRequestsTable` (with approve/reject/delete)

**Files:**

- Create: `src/features/office-requests/components/office-requests-table.tsx`
- Test: `src/features/office-requests/components/__tests__/office-requests-table.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/features/office-requests/components/__tests__/office-requests-table.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
jest.mock('next-intl', () => ({ useTranslations: () => (k: string) => k }));
import OfficeRequestsTable from '../office-requests-table';

const pendingRow = {
  id: 1,
  type: 'PRINT_DELEGATION' as const,
  status: 'PENDING' as const,
  journeyNumber: 'DEL-001',
  fromName: 'A A',
  toName: 'S M',
  createdAt: '10/06/2026',
};

it('shows approve/reject only for PENDING rows when admin', async () => {
  const onApprove = jest.fn();
  render(
    <OfficeRequestsTable
      data={[pendingRow]}
      isAdmin
      onApprove={onApprove}
      onReject={() => {}}
      onDelete={() => {}}
    />,
  );
  const approveBtn = screen.getByRole('button', { name: 'rowActions.approve' });
  await userEvent.click(approveBtn);
  expect(onApprove).toHaveBeenCalledWith(1);
});

it('hides approve/reject for terminal rows', () => {
  render(
    <OfficeRequestsTable
      data={[{ ...pendingRow, status: 'APPROVED' }]}
      isAdmin
      onApprove={() => {}}
      onReject={() => {}}
      onDelete={() => {}}
    />,
  );
  expect(screen.queryByRole('button', { name: 'rowActions.approve' })).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- src/features/office-requests/components/__tests__/office-requests-table.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

```tsx
// src/features/office-requests/components/office-requests-table.tsx
'use client';

import { Check, Trash2, X } from 'lucide-react';
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

import type { OfficeRequestStatus } from '../enums/office-request-status';
import type { IOfficeRequestTableRow } from '../types';

const STATUS_COLORS: Record<OfficeRequestStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800 border-transparent',
  APPROVED: 'bg-badge-active-bg text-badge-active-fg border-transparent',
  REJECTED: 'bg-red-100 text-red-800 border-transparent',
};

interface OfficeRequestsTableProps {
  data: IOfficeRequestTableRow[];
  isAdmin?: boolean;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export default function OfficeRequestsTable({
  data,
  isAdmin,
  onApprove,
  onReject,
  onDelete,
}: OfficeRequestsTableProps) {
  const t = useTranslations('officeRequests');
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('table.type')}</TableHead>
          <TableHead>{t('table.journey')}</TableHead>
          <TableHead>{t('table.from')}</TableHead>
          <TableHead>{t('table.to')}</TableHead>
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
              <TableCell className="font-medium text-foreground">
                {t(`types.${row.type}`)}
              </TableCell>
              <TableCell className="text-foreground">{row.journeyNumber}</TableCell>
              <TableCell className="text-foreground">{row.fromName}</TableCell>
              <TableCell className="text-foreground">{row.toName}</TableCell>
              <TableCell className="text-center">
                <Badge
                  className={`rounded-full px-4 py-1 text-xs font-semibold ${STATUS_COLORS[row.status]}`}
                >
                  {t(`statuses.${row.status}`)}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  {isAdmin && row.status === 'PENDING' && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-emerald-700"
                        onClick={() => onApprove?.(row.id)}
                      >
                        <Check className="mr-1 h-4 w-4" />
                        {t('rowActions.approve')}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-700"
                        onClick={() => onReject?.(row.id)}
                      >
                        <X className="mr-1 h-4 w-4" />
                        {t('rowActions.reject')}
                      </Button>
                    </>
                  )}
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onDelete?.(row.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
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

Run: `pnpm test -- src/features/office-requests/components/__tests__/office-requests-table.test.tsx`
Expected: PASS (2 tests). (Add `@testing-library/user-event` if missing: `pnpm add -D @testing-library/user-event`.)

- [ ] **Step 5: Commit**

```bash
git add src/features/office-requests/components/office-requests-table.tsx src/features/office-requests/components/__tests__
git commit -m "feat(office-requests): add table with approve/reject/delete actions"
```

---

## Task 7: `OfficeRequestFormDialog` (create)

**Files:**

- Create: `src/features/office-requests/components/office-request-form-dialog.tsx`

Option lists (journeys, employees) are passed in from the page.

- [ ] **Step 1: Write the component**

```tsx
// src/features/office-requests/components/office-request-form-dialog.tsx
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

import { useCreateOfficeRequest } from '../api/create';
import { OFFICE_REQUEST_TYPES } from '../enums/office-request-type';
import {
  officeRequestFormSchema,
  toOfficeRequestBody,
  type OfficeRequestFormValues,
} from '../types';

interface OfficeRequestFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  journeys: { id: number; name: string }[];
  employees: { id: number; name: string }[];
}

const EMPTY: OfficeRequestFormValues = {
  type: 'PRINT_DELEGATION',
  description: '',
  journeyId: '',
  requestedFromId: '',
  requestedToId: '',
};

export default function OfficeRequestFormDialog({
  open,
  onOpenChange,
  journeys,
  employees,
}: OfficeRequestFormDialogProps) {
  const t = useTranslations('officeRequests');
  const { createOfficeRequestMutation, isCreateOfficeRequestPending } = useCreateOfficeRequest();
  const form = useForm<OfficeRequestFormValues>({
    resolver: zodResolver(officeRequestFormSchema),
    defaultValues: EMPTY,
  });

  const onSubmit = (values: OfficeRequestFormValues) => {
    createOfficeRequestMutation(toOfficeRequestBody(values), {
      onSuccess: () => {
        form.reset(EMPTY);
        onOpenChange(false);
      },
    });
  };

  const Select = ({
    label,
    name,
    options,
  }: {
    label: string;
    name: keyof OfficeRequestFormValues;
    options: { id: number; name: string }[];
  }) => (
    <div className="flex flex-col gap-1">
      <Label>{label} *</Label>
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
          <DialogTitle>{t('form.createTitle')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-3">
          <div className="flex flex-col gap-1">
            <Label>{t('form.type')} *</Label>
            <select
              className="h-10 rounded-md border border-input bg-background px-3"
              {...form.register('type')}
            >
              {OFFICE_REQUEST_TYPES.map((ty) => (
                <option key={ty} value={ty}>
                  {t(`types.${ty}`)}
                </option>
              ))}
            </select>
          </div>
          <Select label={t('form.journey')} name="journeyId" options={journeys} />
          <Select label={t('form.from')} name="requestedFromId" options={employees} />
          <Select label={t('form.to')} name="requestedToId" options={employees} />
          <div className="flex flex-col gap-1">
            <Label>{t('form.description')}</Label>
            <Input {...form.register('description')} />
          </div>
          <DialogFooter className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('form.cancel')}
            </Button>
            <Button type="submit" disabled={isCreateOfficeRequestPending}>
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
git add src/features/office-requests/components/office-request-form-dialog.tsx
git commit -m "feat(office-requests): add create form dialog"
```

---

## Task 8: List page client + route

**Files:**

- Create: `src/features/office-requests/components/office-requests-page-client.tsx`
- Create: `src/app/[locale]/(loggedIn)/office-requests/page.tsx`

- [ ] **Step 1: Write `office-requests-page-client.tsx`**

```tsx
// src/features/office-requests/components/office-requests-page-client.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

import EntitiesToolbar from '@/components/common/entities-toolbar';
import TableFilters from '@/components/common/table-filters';
import TablePagination from '@/components/common/table-pagination';
import { usePaginationParams } from '@/hooks/use-pagination-params';
import { useGetAllEmployees } from '@/features/employees/api/get-all';

import { useGetAllOfficeRequests } from '../api/get-all';
import { useDeleteOfficeRequest } from '../api/delete';
import { useRequestAction } from '../api/request-action';
import OfficeRequestsTable from './office-requests-table';
import OfficeRequestFormDialog from './office-request-form-dialog';

export default function OfficeRequestsPageClient() {
  const t = useTranslations('officeRequests');
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'admin' || session?.user?.role === 'ADMIN';

  const params = usePaginationParams();
  const { officeRequests, isGetOfficeRequestsPending, totalOfficeRequestsCount } =
    useGetAllOfficeRequests(params);
  const { deleteOfficeRequestMutation } = useDeleteOfficeRequest();
  const { requestActionMutation } = useRequestAction();
  const { employees } = useGetAllEmployees();

  const [formOpen, setFormOpen] = useState(false);

  const employeeOptions = (employees ?? []).map((e: any) => ({
    id: e.id,
    name: e.name ?? e.user?.firstName ?? String(e.id),
  }));

  const handleDelete = (id: number) => {
    if (window.confirm(t('actions.confirmDelete'))) deleteOfficeRequestMutation(String(id));
  };

  return (
    <main>
      <div className="pageContainer">
        <EntitiesToolbar onAdd={() => setFormOpen(true)} />
        <TableFilters applyDefaultDateRange={false} />
        {isGetOfficeRequestsPending ? (
          <p className="p-4 text-center">{t('loading')}</p>
        ) : (
          <>
            <OfficeRequestsTable
              data={officeRequests}
              isAdmin={isAdmin}
              onApprove={(id) => requestActionMutation({ id, status: 'APPROVED' })}
              onReject={(id) => requestActionMutation({ id, status: 'REJECTED' })}
              onDelete={handleDelete}
            />
            <TablePagination totalCount={totalOfficeRequestsCount} />
          </>
        )}
        <OfficeRequestFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          journeys={[]}
          employees={employeeOptions}
        />
      </div>
    </main>
  );
}
```

> `journeys` passed empty to keep this task focused — wire `useGetAllJourneys` (`@/features/trips/api/get-all/get-all-journeys`) into a `{ id, name: delegateNumber }` list once its return shape is confirmed.

- [ ] **Step 2: Write the route page**

```tsx
// src/app/[locale]/(loggedIn)/office-requests/page.tsx
import OfficeRequestsPageClient from '@/features/office-requests/components/office-requests-page-client';

export default function OfficeRequestsPage() {
  return <OfficeRequestsPageClient />;
}
```

- [ ] **Step 3: Verify build & full suite**

Run: `pnpm test -- src/features/office-requests` then `pnpm build`
Expected: tests PASS; build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/features/office-requests/components "src/app/[locale]/(loggedIn)/office-requests"
git commit -m "feat(office-requests): add list page and route"
```

---

## Task 9: Manual verification

- [ ] **Step 1:** `pnpm dev`, sign in as a user → `/office-requests` lists, "add" creates a PENDING request.
- [ ] **Step 2:** Sign in as admin → approve/reject buttons appear on PENDING rows; clicking updates the status (PENDING → APPROVED/REJECTED) and the buttons disappear; delete removes a row. Confirm the Network calls hit `POST /api/office-requests/:id/request-action`.

---

## Self-Review (completed during planning)

- **Spec coverage:** list + filters ✓ (Tasks 3/8), create (ADMIN/USER) ✓ (Task 7), approve/reject (ADMIN, PENDING only) ✓ (Tasks 4/6/8), delete ✓ (Tasks 4/8), type/status localized ✓ (Tasks 5/6), i18n ✓ (Task 5). Query params from [phase-6-api.md §2](../../../../frontend/phase-6-api.md) covered by `IOfficeRequestQueryParams`.
- **Placeholder scan:** empty `journeys` list in Task 8 is an explicit scoped follow-up with the mapping given. No TODOs.
- **Type consistency:** `IOfficeRequestResponse`, `IOfficeRequestTableRow`, `OfficeRequestFormValues`, `OfficeRequestBody`, `toOfficeRequestBody`, `toOfficeRequestRow`, `useGetAllOfficeRequests`, `useCreateOfficeRequest`, `useRequestAction` (args `{ id, status }`), `useDeleteOfficeRequest` consistent across tasks.

## Open follow-ups

1. Confirm the admin role string and tighten `isAdmin`.
2. Wire `useGetAllJourneys` into the create dialog's journey list.
3. The `request-action` 400 ("not PENDING") surfaces via the generic error toast; add a specific message if desired.
