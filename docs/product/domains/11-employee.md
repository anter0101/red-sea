# 11 — Employee domain

Standalone guide — form-only, no journey dependency.

## Goal

Employee create under branch works with Monthly salary and Available status defaults, without showing status on the create form.

## Prerequisites

None.

## Requirements

| # | Requirement | What to build |
| --- | --- | --- |
| 1 | Create route | **Exists** `/ar/branches/:id/employees/create` |
| 2 | Salary type Monthly | Default in form |
| 3 | Status Available | Default in form + backend |
| 4 | Hide status on create | Do not render status field on create |

## Backend

| File | Work |
| --- | --- |
| `employee/employee.controller.ts` | **Exists** — POST create |
| `user/user.entity.ts` | Default status AVAILABLE if not sent |
| `core/enums/salary.ts` | MONTHLY enum **exists** |

No API change required if FE omits status and BE defaults correctly.

## Frontend

### Route

`src/app/[locale]/(loggedIn)/branches/[branchesId]/employees/create/page.tsx`

### Files

| File | Work |
| --- | --- |
| `features/employees/components/employee-form.tsx` | Hide status Select when `mode === 'create'` (~L441–461); keep defaults `MONTHLY` + `AVAILABLE` in form state |
| `features/employees/components/employee-page-client.tsx` | Status can remain visible on **edit** |

## Checklist

- [x] Create form has no status dropdown
- [x] New employee saved as Available
- [x] Salary type defaults to Monthly
- [x] Update form still allows status change if needed

## Done when

`/ar/branches/4/employees/create` shows no status field; created employee is Available with Monthly salary.

## Out of scope

- Branch journeys ([08-branch.md](./08-branch.md))
