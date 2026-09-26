# 02 — Driver domain

Standalone guide for driver detail, statistics, journeys, and account rules.

## Goal

Driver screens show real data: stats, current journey, current car, salary, journey history, uploads — with admin-only soft delete.

## Prerequisites

- [00-shared-foundation.md](./00-shared-foundation.md) — required for journeys tab + KPI cards

## Requirements

| # | Requirement | What to build |
| --- | --- | --- |
| 1 | Statistics cards | Real API data, not hardcoded |
| 2 | Current journey | Latest active journey for driver |
| 3 | Current car code | From current journey's car |
| 4 | Salary (accountant view) | Existing salary relation |
| 5 | Selected tab in URL | `?tab=` persistence |
| 6 | Journey count | From stats |
| 7 | Working days | From stats (distinct delegate dates) |
| 8 | Journey history | Scoped `JourneyList` |
| 9 | Upload | Attachments on detail |
| 10 | Car relation | Via journey (no new entity) |
| 11 | Retrieve by ID | **Exists** |
| 12 | Admin soft delete | BE soft delete + FE admin gate |
| 13 | Paginated journeys | Reuse main journey table |

## Backend

### APIs

| Method | Path | Work |
| --- | --- | --- |
| GET | `/api/drivers/:id` | **Exists** — optionally add `currentJourney`, `currentCarCode` |
| GET | `/api/journeys/stats?driverId=` | From 00 — journey count, working days, current journey |
| GET | `/api/journeys?driverId=` | From 00 — journey table |
| DELETE | `/api/drivers/:id` | Change to soft delete (`deletedAt`) |

### Files

| File | Work |
| --- | --- |
| `modules/driver/driver.service.ts` | `softDelete()` instead of `delete()` |
| `modules/driver/driver.controller.ts` | Keep `@Roles(ADMIN)` on DELETE |
| `modules/journey/journey.service.ts` | Stats: current journey = latest non-terminal for driver |

## Frontend

### Routes

| Route | Component |
| --- | --- |
| `/drivers` | `drivers-page-client.tsx` |
| `/drivers/[driverId]` | `driver-page-client.tsx` |

### Files

| File | Work |
| --- | --- |
| `features/drivers/components/drivers-page-client.tsx` | Stats from API |
| `features/drivers/components/driver-page-client.tsx` | Journeys tab = `<JourneyList scope={{ driverId }} showStats />`; URL tab |
| `features/drivers/components/drivers-table.tsx` | Show real `carCode`, trip — stop `EMPTY_DISPLAY` |
| `features/drivers/api/get-all.ts` | Map current journey/car from API if added |
| `features/drivers/api/get-one.ts` | **Exists** |
| `features/drivers/components/attachments-form.tsx` | Expose on detail if missing |
| `features/drivers/hooks/use-driver-page.ts` | Sync tab with `?tab=` |

### Admin delete

Pattern: `custody-page-client.tsx` / `office-requests-page-client.tsx` — `isAdmin` before showing delete.

## Checklist

- [x] List page stats from `/api/drivers/stats` (by user status)
- [x] Detail journeys tab uses `JourneyList`
- [x] Current car/journey shown on list or detail
- [x] Soft delete on backend
- [x] Delete button admin-only
- [x] Tab persisted in URL
- [x] Upload visible on detail

## Done when

- No hardcoded `50`/`70`/`14` on driver pages
- Double-click journey row opens `/trips/[id]`
- Deleted driver has `deletedAt` set, not removed from DB
## Out of scope

- Driver assistant ([03-driver-assistant.md](./03-driver-assistant.md))
- Journey workflow statuses ([01-journey.md](./01-journey.md))
