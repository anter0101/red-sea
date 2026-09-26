# 14 — Admin dashboard (`/home`)

Standalone guide for the ADMIN operations home screen.

## Goal

Give ADMIN a single **operations cockpit** with info from every live module. Not a trips table and not embedded accounting reports.

## Audience

- **ADMIN** (and menu-full `USER`): land on `/home` after login
- **DATA_ENTRY**: stay on `/office` — no change

## Layout

1. Toolbar — brand + today / week / month range (applies to journey stats)
2. KPI strip — journeys count, drivers/cars/trailers onRoad, distance
3. Journey pipeline — `byStatus` bars → `/trips?tripStatus=`
4. Modules grid — one card per domain (counts / fleet split / links)
5. Attention — pending office requests, warehouse low stock

## Per-module signals

| Module | Dashboard signal | Source |
| --- | --- | --- |
| Journeys | count, distance, byStatus | `GET /api/journeys/stats` |
| Drivers | total / onRoad / available | `GET /api/drivers/stats` |
| Assistants | total / onRoad / available | `GET /api/users/stats?role=DRIVER_ASSISTANT` |
| Cars | onRoad / company / share | `GET /api/cars/stats` |
| Trailers | onRoad / company / share / nolon | `GET /api/trailers/stats` |
| Partners | count | `GET /api/owners` totalCount |
| Clients | count | `GET /api/clients` totalCount |
| Branches | count | `GET /api/branches` totalCount |
| Warehouse | products + low-stock (qty ≤ alert on first page) | `GET /api/warehouses` |
| Suppliers | count | `GET /api/suppliers` totalCount |
| GPS | devices count | `GET /api/gps-devices` totalCount |
| Custody | active count | `GET /api/custodies?status=ACTIVE` |
| Office requests | pending count | `GET /api/office-requests?status=PENDING` |
| Accounting | shortcut links only | static |
| Office issuance | shortcut | static |

**Expenses:** removed from product (FE deleted; BE tables already dropped). Not on dashboard.

## Files

| Path | Role |
| --- | --- |
| `app/[locale]/(loggedIn)/home/page.tsx` | Route |
| `features/dashboard/components/admin-home-page.tsx` | Orchestrator |
| `features/dashboard/api/use-module-counts.ts` | List totalCounts |
| `utils/icons.ts` | `/home` sidebar entry |
| `middleware.ts` / `hooks/auth/login.ts` | ADMIN → `/home` |

## Out of scope (v1)

- `GET /api/dashboard/summary` aggregate (add only if latency hurts)
- Embedded accounting reports / GPS map
- Expenses module
