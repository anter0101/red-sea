# 13 — Cross-domain rules

Reference for rules that apply across multiple domains. **Not a standalone implementation** — apply while executing other domain guides.

## Journey table reuse

All of these must use the same component and columns:

| Screen | Scope param |
| --- | --- |
| `/trips` | none |
| Driver detail | `driverId` |
| Assistant detail | `driverAssistantId` |
| Car detail | `carId` |
| Trailer detail | `trailerId` |
| Client detail | `clientId` |
| Branch detail | `branchId` |

**Component:** `features/trips/components/journey-list.tsx`  
**Columns:** `components/main-table/columns.tsx`

## Pagination and filters

- `components/common/table-filters.tsx` — search + date range
- `hooks/use-pagination-params.ts` — page, limit, dates, tripStatus
- `components/common/table-pagination.tsx`

## Authorization

| Layer | Pattern |
| --- | --- |
| Backend | `@Roles(UserRole.ADMIN)` on destructive/write endpoints |
| Frontend | `isAdmin` from session — see `custody-page-client.tsx`, `office-requests-page-client.tsx` |

Operations that must be admin-only per requirements:

- Delete driver / assistant accounts
- Edit journey / policy (UI; API already restricted)
- Financial activity add/edit on trip detail

## Soft delete

`BaseEntity` has `deletedAt`. Soft delete applied on:

- `driver.service.ts`
- `user.service.ts` (assistants)
- `car.service.ts`
- `trailer.service.ts`
- `owner.service.ts` (partners)
- `factory/client.service.ts`

List/get queries exclude rows with `deleted_at` set.

## Deleted requirements log

When removing UI or fields, add a row to [deleted-requirements.md](../deleted-requirements.md) **when the change ships**.

Items to log across domains:

- Journey duration, print column, initial invoice, financial Add/Edit
- Car/trailer evaluation tabs
- Partner car ownership section
- Supplier city

## Parked — do not implement

| Topic | Reason |
| --- | --- |
| Commune | Not discussed; codebase uses `areas` + `governments` only |

## Office print vs journey table print

| Feature | Action |
| --- | --- |
| Print column on `/trips` table | **Remove** |
| Print dialog after office delegation create | **Keep** |

## DATA_ENTRY role

Office employees (`DATA_ENTRY`) can create journeys via office flow but should not see admin edit buttons on trip detail. List may be scoped to their custody source user on backend.

## File index (quick lookup)

| Domain | Backend module | Frontend feature |
| --- | --- | --- |
| Journey | `journey`, `journey-goods`, `journey-transaction` | `trips`, `office` |
| Driver | `driver` | `drivers` |
| Assistant | `user` | `driver-assistants` |
| Car | `car`, `maintenance`, `physical-attachment` | `cars`, `physical-attachments` |
| Trailer | `trailer`, `maintenance` | `trailers` |
| Partner | `owner` | `partners` |
| Client | `factory` (client) | `clients` |
| Branch | `branch`, `employee` | `branches` |
| Warehouse | `warehouse` | `warehouse` |
| Supplier | `supplier`, `government` | `suppliers` |
| Employee | `employee`, `user` | `employees` |
| Stats | `journey` (stats endpoint) | all pages with `ReusableCard` |

## Suggested PR boundaries

One PR per domain file (01–11) where possible; 00 first; 12 last as cleanup sweep.
