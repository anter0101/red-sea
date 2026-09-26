# 07 — Client domain

Standalone guide for client info and scoped journeys tab.

## Goal

Client detail shows complete base info; Journeys tab lists that client's trips with date filters.

## Prerequisites

- [00-shared-foundation.md](./00-shared-foundation.md) — for Journeys tab

## Requirements

| # | Requirement | What to build |
| --- | --- | --- |
| 1 | Base information | Client name + company fields on info tab |
| 2 | Date filter | Shared `TableFilters` on journeys tab |
| 3 | Journeys tab | `JourneyList scope={{ clientId }}` |
| 4 | Same table as main Journey module | Shared `columns.tsx` |

## Backend

| API | Work |
| --- | --- |
| `GET /api/clients/:id` | **Exists** — `factory/client.entity.ts` |
| `GET /api/journeys?clientId=` | From 00 |

### Field naming

Verify FE `taxCard` vs BE `taxInvoice` — align in `clients/types` and mappers.

## Frontend

### Route

`/clients/[clientId]` → `client-page-client.tsx`

### Files

| File | Work |
| --- | --- |
| `features/clients/components/client-page-client.tsx` | Fix info tab; replace stub trips tab with `JourneyList` |
| `features/clients/api/get-one.ts` | Map all base fields |

## Checklist

- [x] Client name visible on detail
- [x] Journeys tab paginated + date filter
- [x] Only this client's journeys shown
- [x] tax field names match backend

## Done when

Client trips tab behaves like `/trips` filtered to one client.

## Out of scope

- Journey workflow ([01-journey.md](./01-journey.md))
