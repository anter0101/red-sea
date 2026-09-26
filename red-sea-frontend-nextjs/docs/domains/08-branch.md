# 08 — Branch domain

Standalone guide for branch-scoped journeys.

## Goal

Branch detail shows journeys performed by employees of that branch (delegation creator or policy receiver).

## Prerequisites

- [00-shared-foundation.md](./00-shared-foundation.md) — **required** (`branchId` filter)

## Requirements

| # | Requirement | What to build |
| --- | --- | --- |
| 1 | Journeys by branch employees | Filter journeys where delegation or policy employee belongs to branch |

## Business rule

Include journey if **either**:

1. `journey.custodySource` employee's `branchId` = branch, **or**
2. Latest policy's `employee.branchId` = branch

## Backend

| File | Work |
| --- | --- |
| `journey/dtos/query-journey.dto.ts` | `branchId` param |
| `journey/journey.service.ts` | Branch filter in `applyJourneyFilters` |
| `branch/branch.entity.ts` | **Exists** — `employees` relation |
| `employee/employee.entity.ts` | **Exists** — `branch` ManyToOne |

## Frontend

### Route

`/branches/[branchesId]` → `branch-page-client.tsx`

### Files

| File | Work |
| --- | --- |
| `features/branches/components/branch-page-client.tsx` | Replace stub trips tab with `<JourneyList scope={{ branchId }} showStats />` |

Employees tab **already exists** — no change required for this requirement.

## Checklist

- [x] Branch trips tab shows filtered journeys
- [x] Pagination and date filters work
- [x] Journey appears when branch employee created delegation OR entered policy

## Done when

Branch manager can see all journeys tied to their branch staff.

## Out of scope

- Employee create under branch ([11-employee.md](./11-employee.md))
