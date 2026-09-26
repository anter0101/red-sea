# 01 — Journey domain

Standalone guide for journey workflow, listing cleanup, admin rules, and history.

## Goal

Align journeys with the business workflow: delegation → policy → invoice; remove obsolete fields; restrict edits to admin; prevent premature transfers.

## Prerequisites

- [00-shared-foundation.md](./00-shared-foundation.md) recommended for list/stats (can be done in parallel)

## Requirements

| # | Requirement (AR) | What to build |
| --- | --- | --- |
| 1 | Remove journey duration | Drop `tripDuration` everywhere |
| 2 | Statuses: تم اصدار التفويض / تم تحصيل البوليصه / تم اصدار فاتوره | Replace old enum + migration |
| 3 | محافظة التسليم | **Exists** — verify only |
| 4 | مفوض الاستلام | Policy employee; show on detail |
| 5 | Remove print from journey table | Listing only |
| 6 | Remove الفاتوره الاوليه | Table + detail fields |
| 7 | Admin-only journey/policy edit | FE hide for non-admin |
| 8 | No accelerated transfers | Gate custody/office approve |
| 9 | Hide financial Add/Edit | Toolbar on trip detail |
| 10 | Journey history | Status change audit |
| 11 | Pagination + filtering | **Partial** — finish status filter via 00 |

## Backend

### Status enum

**File:** `backend/src/core/enums/journey.ts`

Replace:

- `NOTSTATED`, `ONROAD`, `COMPLETED`, `CANCELLED`

With:

| Enum key | Arabic label | Set when |
| --- | --- | --- |
| `DELEGATION_ISSUED` | تم اصدار التفويض | Office/delegation create |
| `POLICY_COLLECTED` | تم تحصيل البوليصه | Policy saved |
| `INVOICE_ISSUED` | تم اصدار فاتوره | Invoice issued (confirm trigger) |

**Migration:** map old values to new; document rule in migration comment.

### Status transitions

| File | Change |
| --- | --- |
| `journey/journey.service.ts` | Stop forcing `NOTSTATED` on every save; set status on workflow events |
| `journey/journey.controller.ts` | Office create → `DELEGATION_ISSUED` |
| `journey-goods/journey-policy.controller.ts` | Policy create/update → `POLICY_COLLECTED` |

### Remove duration

| File | Change |
| --- | --- |
| `journey-goods/journey-policy.entity.ts` | Remove `tripDuration` column |
| `journey-goods/dtos/*.ts` | Remove from DTOs |
| `journey/journey.service.ts` | Remove from list select |

### Transfer gate

**File:** `office-request/office-request.controller.ts`

Before approving custody / transfer side effects: require journey at allowed status (default: no invoice without policy).

### Journey history

New table e.g. `journey_status_events` (journey_id, from_status, to_status, changed_by, changed_at) or append-only log service.

**Expose:** `GET /api/journeys/:id/history` or include in detail DTO.

### Key APIs (existing)

| Method | Path | Roles |
| --- | --- | --- |
| GET | `/api/journeys` | ADMIN, USER, DATA_ENTRY |
| PUT/DELETE | `/api/journeys/:id` | ADMIN |
| POST | `/api/journeys/office` | DATA_ENTRY |
| GET/POST/PUT | `/api/journey-policies` | ADMIN write |
| GET/POST | `/api/journey-transactions` | ADMIN write |

## Frontend

### Routes

| Route | Page |
| --- | --- |
| `/trips` | Main listing |
| `/trips/[journeyId]` | Detail |
| `/trips/[journeyId]/policy/create` | Policy entry |
| `/office/issue-delegation/[mode]` | Delegation create |

### Files

| File | Work |
| --- | --- |
| `features/trips/components/trip-client-page.tsx` | `isAdmin` gates for edit, policy, financial toolbar |
| `features/trips/components/transactions-toolbar.tsx` | Hide Add/Edit unless admin |
| `features/trips/components/policy-from.tsx` | Remove duration field |
| `features/trips/mappers/logistics-info.fields.ts` | Add receiving delegate |
| `features/trips/mappers/trip-info.fields.ts` | Remove initial invoice |
| `components/main-table/columns.tsx` | New status labels; remove duration + preliminary invoice |
| `messages/ar/*.json`, `messages/en/*.json` | Status i18n |

### Keep (do not remove)

- Office print after create: `features/office/components/office-journey-form.tsx`

## Checklist

- [x] Migration for new statuses
- [x] Status set on create / policy / invoice
- [x] Duration removed BE + FE
- [x] Initial invoice removed from UI
- [x] Print column removed from list (00)
- [x] Non-admin cannot see edit/financial add buttons
- [x] Transfer gate returns 400 when status wrong
- [x] Receiving delegate on detail logistics
- [x] History tab or section on trip detail
- [x] Log removals in [deleted-requirements.md](../deleted-requirements.md)

## Done when

- List shows three workflow statuses in Arabic
- Employee (DATA_ENTRY) can create delegation but not edit journey/policy in UI
- Policy save advances status; transfers blocked when inappropriate

## Out of scope

- Driver/car/client journey tabs ([02–08](./README.md))
- Commune
