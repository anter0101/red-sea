# 00 — Shared foundation (JourneyList + scopes + stats)

**Run this domain first** if you need journey tables or KPI cards on driver, car, client, branch, or similar detail pages.

## Goal

One reusable journey table and one stats API so every entity page shows the same columns, filters, and pagination as `/trips`.

## Prerequisites

- None (this is the base layer)

## Backend

### APIs to add or extend

| API | Purpose |
| --- | --- |
| `GET /api/journeys` | Add query scopes (see below) |
| `GET /api/journeys/stats` | KPI counts using **same filters** as list |

### Files

| File | Work |
| --- | --- |
| `backend/src/app/modules/journey/dtos/query-journey.dto.ts` | Add optional: `driverId`, `carId`, `trailerId`, `clientId`, `driverAssistantId`, `branchId` |
| `backend/src/app/modules/journey/journey.service.ts` | Extend `applyJourneyFilters()`; add `getStats()` |
| `backend/src/app/modules/journey/journey.controller.ts` | Add `GET /stats` route |
| `backend/src/app/modules/journey/dtos/journey-stats.dto.ts` | Response shape: `total`, `byStatus`, `journeyCount`, `workingDays`, `currentJourneyId`, `currentCarCode`, `totalDistance` |

### Branch filter rule

`branchId` = journeys where **either**:

- `custodySource` (delegation creator employee) has `branchId`, **or**
- latest policy `employee` has `branchId`

### Scope filter mapping

| Query param | DB column / join |
| --- | --- |
| `driverId` | `journeys.driver_id` |
| `carId` | `journeys.car_id` |
| `trailerId` | `journeys.trailer_id` |
| `clientId` | `journeys.client_id` |
| `driverAssistantId` | `journeys.assistant_id` |
| `branchId` | custody source OR policy employee branch |

## Frontend

### New / shared components

| File | Work |
| --- | --- |
| `src/features/trips/types/journey-list-scope.ts` | `JourneyListScope` type |
| `src/features/trips/components/journey-list.tsx` | Reusable list: scope prop, `TableFilters`, status filter, pagination, optional stats cards |
| `src/features/trips/api/get-journey-stats.ts` | Hook calling `/api/journeys/stats` |
| `src/features/trips/api/get-all/get-all-journeys.ts` | Accept scope params |
| `src/hooks/use-pagination-params.ts` | Add `tripStatus` from URL |
| `src/components/main-table/columns.tsx` | Remove print column + initial invoice column from shared columns |
| `src/features/trips/components/trips-client-page.tsx` | Use `JourneyList` with `showStats` |

### Usage on entity pages (later domains)

```tsx
<JourneyList scope={{ driverId: 12 }} showStats detailPathPrefix="/trips" />
```

## Checklist

- [x] Query DTO has all scope params
- [x] List filters by each scope correctly
- [x] Branch filter uses delegation creator OR policy employee
- [x] `GET /api/journeys/stats` returns counts matching list filters
- [x] `JourneyList` works on `/trips` without scope
- [x] Status dropdown filters URL `tripStatus`
- [x] Print + initial invoice columns removed from shared table

## Done when

- `/trips` lists journeys with pagination, search, dates, status filter
- `GET /api/journeys?driverId=1` returns only that driver's journeys
- Stats cards on `/trips` use API (not hardcoded numbers)

## Out of scope

- New journey workflow statuses (see [01-journey.md](./01-journey.md))
- Entity-specific detail pages (see domains 02–08)
