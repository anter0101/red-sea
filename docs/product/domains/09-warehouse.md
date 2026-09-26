# 09 — Warehouse / inventory domain

Standalone guide — no journey dependency.

## Goal

Inventory table shows real product code and correct status (including `NEW` if required as **status**, not condition).

## Prerequisites

None.

## Requirements

| # | Requirement | What to build |
| --- | --- | --- |
| 1 | Inventory status | Show status column; add `NEW` to status enum if product confirms |
| 2 | Inventory code | Display backend-generated `code`, not row `id` |

## Backend

| File | Work |
| --- | --- |
| `warehouse/warehouse.entity.ts` | `code` field **exists** |
| `warehouse/warehouse.service.ts` | Code generation **exists** |
| `warehouse/warehouse.enums.ts` | Add `NEW` to `ProductStatus` if needed (today `NEW` is only `ProductCondition`) |

### Product decision

Notes say "inventory status should include NEW". Current code:

- `ProductStatus`: AVAILABLE, OUT_OF_STOCK, PENDING, RESERVED, DISCONTINUED
- `ProductCondition.NEW`: جديد

**Confirm with product:** add `NEW` to status, or relabel UI to show condition as "status".

## Frontend

| File | Work |
| --- | --- |
| `features/warehouse/api/get-all.ts` | Change `productCode: String(product.id)` → `product.code` |
| `features/warehouse/components/table.tsx` | Show status column clearly |
| `features/warehouse/types/products.ts` | Add `NEW` to status enum if BE adds it |
| `features/warehouse/components/product-form.tsx` | Status dropdown includes NEW |

## Checklist

- [x] Table shows `code` from API
- [x] Status column visible and correct
- [x] NEW available where product expects it
- [x] Create product gets generated code from backend
- [x] Product profile with info + stock movement tabs
- [x] Stock IN/OUT movements with snapshot fields (unit, price, weight note, …)
- [x] Product update edits basic info only (quantity via movements)

## Done when

Warehouse list/export uses real codes; product profile tracks stock logs; update form does not change stock quantity.

## Out of scope

- KPI cards ([12-statistics-reporting.md](./12-statistics-reporting.md))
- Weight column on product entity (weight is movement `weightNote` only)
