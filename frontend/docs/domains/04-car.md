# 04 — Car domain

Standalone guide for car detail tabs, journeys, maintenance, and physical attachments.

## Goal

Car page: Information default tab, real journeys list, maintenance CRUD, printable physical-attachment checklist with employee confirmation.

## Prerequisites

- [00-shared-foundation.md](./00-shared-foundation.md) — for Journeys tab only
- Maintenance module has **no** dependency on 00

## Requirements

| # | Requirement (AR) | What to build |
| --- | --- | --- |
| 1 | Remove تقييم السيارة | Delete `rate` tab |
| 2 | Information tab | Keep / default |
| 3 | Owner count | **Exists** — `Ownerships.length` |
| 4 | Journeys tab | `JourneyList scope={{ carId }}` |
| 5 | Maintenance CRUD | New backend module + form |
| 6 | Physical attachments checklist | Printable report |
| 7 | Employee confirms OK | Boolean + user on attachment |

## Backend

### Existing

| Module | API |
| --- | --- |
| `car` | `GET/PUT/DELETE /api/cars/:id` with `Ownerships` |
| `physical-attachment` | `GET/POST/PUT/DELETE /api/physical-attachments` |

### New — maintenance

Create `modules/maintenance/`:

| Field | Type |
| --- | --- |
| `carId` | FK (nullable if trailer) |
| `trailerId` | FK (nullable if car) |
| `maintenanceDate` | date |
| `description` | text |
| `cost` | decimal optional |
| `notes` | text optional |

API: `GET/POST/PUT/DELETE /api/maintenances?carId=` or nested under cars.

Migration + register in `app.module.ts`.

### Physical attachment extension

**File:** `physical-attachment.entity.ts`

Add: `confirmedOk: boolean`, `confirmedBy: string`, `confirmedAt: timestamp` (or employee FK).

## Frontend

### Route

`/cars/[carId]` → `car-page-client.tsx`

### Files

| File | Work |
| --- | --- |
| `features/cars/components/car-page-client.tsx` | Remove `rate` tab; default `info`; Journeys = `JourneyList`; Maintenance = real CRUD |
| `features/cars/utils/map-detail-table-row.ts` | Stop using as fake journey table |
| `features/physical-attachments/components/physical-attachments-panel.tsx` | Print button + confirm OK |

## Checklist

- [x] Default tab is Information
- [x] Owner count still shown
- [x] Journeys tab live
- [x] Maintenance create/read/update/delete works
- [x] Checklist printable
- [x] Employee can mark all OK
- [x] Log rate tab removal in [deleted-requirements.md](../deleted-requirements.md)

## Done when

- Car detail has no evaluation tab
- Maintenance records persist in DB
- Physical attachment panel supports print + confirm

## Out of scope

- Trailer ([05-trailer.md](./05-trailer.md)) — copy same pattern
