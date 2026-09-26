# 06 — Partner domain

Standalone guide — small scope, no journey dependency.

## Goal

Show partner details; remove car ownership section from the UI.

## Prerequisites

None.

## Requirements

| # | Requirement (AR) | What to build |
| --- | --- | --- |
| 1 | Partner details | **Exists** |
| 2 | Remove ملكية السيارة | Remove section from detail page |

## Backend

| API | Notes |
| --- | --- |
| `GET /api/owners/:id` | **Exists** — may still return `carOwnerships`; FE simply hides section |

**File:** `modules/owner/owner.controller.ts` — optional: stop selecting car ownerships if unused elsewhere.

## Frontend

### Route

`/partners/[partnerId]` → `features/partners/components/client-page.tsx`

### Change

Remove block around lines 108–115 that renders `ملكية السيارة` / car ownership list.

Keep: name, contacts, other partner fields from `partners/api/get-one.ts`.

## Checklist

- [x] Partner detail loads without car ownership section
- [x] Create/update partner still works
- [x] Row in [deleted-requirements.md](../deleted-requirements.md)

## Done when

Partner detail shows business info only; no car ownership UI.

## Estimated effort

Small — single FE file change (+ optional BE cleanup).
