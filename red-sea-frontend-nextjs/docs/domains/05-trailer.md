# 05 — Trailer domain

Standalone guide for trailer detail tabs, journeys, and maintenance.

## Goal

Same as car, minus physical-attachment checklist (unless product extends it to trailers later).

## Prerequisites

- [00-shared-foundation.md](./00-shared-foundation.md) — for Journeys tab
- [04-car.md](./04-car.md) — share maintenance module (add `trailerId` FK)

## Requirements

| # | Requirement (AR) | What to build |
| --- | --- | --- |
| 1 | Remove تقييم المقطوره | Delete `rate` tab |
| 2 | Information tab | Keep / default |
| 3 | Owner count | **Exists** |
| 4 | Journeys tab | `JourneyList scope={{ trailerId }}` |
| 5 | Maintenance CRUD | Same module as car with `trailerId` |

## Backend

| Module | API |
| --- | --- |
| `trailer` | `GET/PUT/DELETE /api/trailers/:id` |
| `maintenance` | Filter by `trailerId` (from 04) |

## Frontend

### Route

`/trailers/[trailerId]` → `trailer-page-client.tsx`

### Files

| File | Work |
| --- | --- |
| `features/trailers/components/trailer-page-client.tsx` | Remove `rate`; default `info`; Journeys + Maintenance tabs |
| `features/trailers/components/trailer-table.tsx` | Not used as journey table |

## Checklist

- [x] Default tab Information
- [x] Journeys tab live
- [x] Maintenance CRUD for trailer
- [x] Log rate tab in deleted-requirements.md

## Done when

- Trailer detail mirrors car detail (without physical checklist unless requested)

## Can run standalone?

**Yes**, if maintenance module is created in the same PR (copy car maintenance work).

## Out of scope

- Car physical attachments ([04-car.md](./04-car.md))
