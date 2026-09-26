# 03 — Driver assistant domain

Standalone guide for assistant accounts, multi-journey assignment, and journeys tab.

## Goal

Assistants can be on multiple journeys; detail page shows real stats and filtered journey list; admin-only soft delete.

## Prerequisites

- [00-shared-foundation.md](./00-shared-foundation.md) — for journeys tab + stats

## Requirements

| # | Requirement | What to build |
| --- | --- | --- |
| 1 | Multiple journeys at once | Remove blocking validation if any |
| 2 | Retrieve by ID | **Exists** (user API) |
| 3 | Admin soft delete | User soft delete + FE gate |
| 4 | Paginated journeys | `JourneyList` with `driverAssistantId` |
| 5 | Statistics cards | Same pattern as driver |

## Backend

### Data model

- `journeys.assistant_id` → one assistant **per journey** (already supports many journeys per assistant)
- Verify no unique constraint or UI message blocking concurrent assignment

### APIs

| Method | Path | Work |
| --- | --- | --- |
| GET | `/api/users/:id` | **Exists** — assistant is USER role |
| GET | `/api/journeys?driverAssistantId=` | From 00 |
| GET | `/api/journeys/stats?driverAssistantId=` | From 00 |
| DELETE | `/api/users/:id` | Soft delete; `@Roles(ADMIN)` |

### Files

| File | Work |
| --- | --- |
| `modules/user/user.service.ts` | Soft delete |
| `modules/user/user.controller.ts` | Admin-only delete |
| `modules/journey/journey.mapper.ts` | Confirm no assistant uniqueness check |
| `features/office/types/office-journey-schema.ts` | Confirm no "already assigned" block |

## Frontend

### Routes

| Route | Component |
| --- | --- |
| `/driver-assistants` | `driver-assistants-page-client.tsx` |
| `/driver-assistants/[id]` | `driver-assistant-page-client.tsx` |

### Files

| File | Work |
| --- | --- |
| `features/driver-assistants/components/driver-assistant-page-client.tsx` | Replace mock cards; `JourneyList scope={{ driverAssistantId: userId }}` |
| `features/driver-assistants/components/driver-assistants-page-client.tsx` | List stats if needed |
| `features/driver-assistants/hooks/use-driver-assistant-page.ts` | Tab URL `?tab=` |

## Checklist

- [x] Same assistant on 2+ active journeys works end-to-end
- [x] Journeys tab paginated and filtered
- [x] Stats cards wired
- [x] Soft delete + admin-only delete button
- [x] Tab in URL

## Done when

- Assistant detail trips tab matches `/trips` table behavior
- Assigning assistant to new office journey does not fail if they are on another journey

## Out of scope

- Driver domain ([02-driver.md](./02-driver.md))
