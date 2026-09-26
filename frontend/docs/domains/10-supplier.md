# 10 — Supplier domain

Standalone guide — no journey dependency.

## Goal

Remove city field; governorate is a dropdown of seeded Egyptian governments.

## Prerequisites

None (governments already seeded).

## Requirements

| # | Requirement | What to build |
| --- | --- | --- |
| 1 | Remove city | Drop from entity, forms, table |
| 2 | Egyptian governorates | Use seeded list in dropdown |
| 3 | Governorate selection | Replace free-text input |

## Backend

| File | Work |
| --- | --- |
| `supplier/supplier.entity.ts` | Remove `city`; prefer `governmentId` FK over string `governorate` |
| `supplier/dtos/*.ts` | Remove city; add `governmentId` |
| `supplier/supplier.mapper.ts` | Map government relation |
| Migration | Drop `city`; add `government_id` if switching from string |
| `government/government.controller.ts` | **Exists** — list for dropdown |
| `database/seeders/area/area-seeder.service.ts` | **Exists** — Egyptian governorates |

## Frontend

| File | Work |
| --- | --- |
| `features/suppliers/components/supplier-form.tsx` | Remove city (~L142–154); governorate Select from `apis/governments/get-all-governments.ts` |
| `features/suppliers/components/supplier-page-client.tsx` | Remove city from detail |
| List/table component | Remove city column |

## Checklist

- [x] No city in create/update/list/detail
- [x] Governorate dropdown populated from API
- [x] Migration applied
- [x] Log city removal in deleted-requirements.md

## Done when

Supplier form only has governorate select (no city text field).

## Out of scope

- Areas/commune ([13-cross-domain.md](./13-cross-domain.md) — commune parked)
