# 12 — Statistics / reporting domain

Standalone guide for KPI cards wired to filters.

## Goal

Every screen with statistic cards uses `GET /api/journeys/stats` (or domain-specific stats) with the **same date and filter params** as the table on that page.

## Prerequisites

- [00-shared-foundation.md](./00-shared-foundation.md) — stats API must exist first

## Requirements

| # | Requirement | What to build |
| --- | --- | --- |
| 1 | KPI cards on relevant screens | Replace hardcoded values |
| 2 | Respect date filter | Pass `createdAtFrom`/`To` to stats |
| 3 | Respect active filters | Pass search, status, scope params |
| 4 | Dedicated API | `GET /api/journeys/stats` — not accounting reports |

## Not the same as

`GET /api/accounting/reports/*` in `financial-stats` — that is accounting-only.

## Backend

**File:** `journey/journey.controller.ts` — `GET /stats`

Reuse `JourneyQueryDTO` + same `applyJourneyFilters` as list.

Response fields used by cards:

| Field | Used on |
| --- | --- |
| `total` / `journeyCount` | Trip count cards |
| `byStatus` | Status breakdown |
| `workingDays` | Driver/assistant detail |
| `currentJourneyId`, `currentCarCode` | Driver list/detail |
| `totalDistance` | Distance card on `/trips` |

## Frontend

### Hook

`features/trips/api/get-journey-stats.ts` — pass same params object as `useGetAllJourneys`.

### Pages to update (remove hardcoded ReusableCard values)

| Page | File |
| --- | --- |
| `/trips` | `trips-client-page.tsx` or `journey-list.tsx` |
| Driver list/detail | `drivers-page-client.tsx`, `driver-page-client.tsx` |
| Assistant list/detail | `driver-assistants-page-client.tsx`, `driver-assistant-page-client.tsx` |
| Car/trailer detail | `car-page-client.tsx`, `trailer-page-client.tsx` |
| Client detail | `client-page-client.tsx` |
| Branch detail | `branch-page-client.tsx` |
| Partners list | `partners/components/list.tsx` (if cards exist) |
| Warehouse list | warehouse page (if cards exist) |

### Pattern

```tsx
const params = { ...usePaginationParams(), ...scope };
const { stats } = useGetJourneyStats(params);
// ReusableCard value={stats?.journeyCount ?? 0}
```

When user changes date preset in `TableFilters`, stats query refetches automatically (same URL params).

## Checklist

- [x] No hardcoded `50`/`70`/`77`/`34` on journey-related pages
- [x] Changing date range updates cards
- [x] Scoped pages pass `driverId`/`carId`/etc. to stats
- [x] Loading state on cards while stats pending

## Done when

KPI cards on all journey-related screens reflect filtered data.

## Can run standalone?

**Partially** — requires 00 first; then this domain is a sweep across existing pages.

## Out of scope

- New accounting reports
- Commune
