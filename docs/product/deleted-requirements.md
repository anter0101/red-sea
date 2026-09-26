# Deleted requirements (review log)

Fill a row **when the removal ships**, not before. Source: domain notes — anything removed from the product must be listed here for review.

**Implementation guides:** [domains/README.md](./domains/README.md)

| Item | Arabic / UI label | Removed from | Replacement / notes | Date | PR |
| --- | --- | --- | --- | --- | --- |
| Journey duration | مدة الرحلة | Policy form, journey table, `JourneyPolicy.tripDuration` | Removed BE + FE | 2026-08-27 | |
| Print on journey table | الطباعة | `/trips` listing | Removed from list; office print-after-create kept | 2026-08-27 | |
| Initial invoice | الفاتوره الاوليه / فاتورة أولية | Shared journey table columns (`columns.tsx`) | Removed from default list; backend still returns NULL placeholder | 2026-08-26 | |
| Financial Add/Edit | اضافة/تعديل النشاط المالـي | Journey detail activity toolbar | Hidden from UI; transactions view-only; API writes remain admin-only | 2026-08-27 | |
| Car evaluation tab | تقييم السيارة | Car detail `rate` tab | Information tab is default | 2026-08-30 | |
| Trailer evaluation tab | تقييم المقطوره | Trailer detail `rate` tab | Information tab is default | 2026-08-30 | |
| Partner car ownership section | ملكية السيارة | Partner details | Partner details kept | 2026-08-31 | |
| Supplier city | City | Supplier entity/form/table | Governorate dropdown (seeded Egyptian governments) | 2026-08-31 | |
| Expenses module | المصروفات | FE routes/feature/i18n/menu; BE already dropped | Removed; journey totalExpenses + accounting P&L expenses[] kept | 2026-09-01 | |

## Not deleted (still in product)

- Delivery governorate (`محافظة التسليم`)
- Receiving delegate (`مفوض الاستلام`) on policy + listing
- Journey listing pagination/search/dates
- Physical attachment CRUD (checklist/print/confirm are **additions**)
- Employee create route `/ar/branches/:id/employees/create`

## Parked

- **Commune** — not discussed; no entity in repo (areas/governments only).
