# Domain implementation guides

Each file in this folder is a **standalone execution guide** for one business domain. You can implement one domain at a time without reading the others, except where **Prerequisites** are listed.

## Recommended order

| Order | File | Can run alone? | Notes |
| --- | --- | --- | --- |
| 0 | [00-shared-foundation.md](./00-shared-foundation.md) | Yes | Do this first if any screen needs scoped journey lists or KPI cards |
| 1 | [01-journey.md](./01-journey.md) | Yes | Core workflow; other domains often consume its APIs |
| 2 | [02-driver.md](./02-driver.md) | After 00 | Needs `JourneyList` + stats for journeys tab |
| 3 | [03-driver-assistant.md](./03-driver-assistant.md) | After 00 | Same as driver |
| 4 | [04-car.md](./04-car.md) | After 00 | Journeys tab + maintenance is self-contained |
| 5 | [05-trailer.md](./05-trailer.md) | After 00 | Same pattern as car |
| 6 | [06-partner.md](./06-partner.md) | Yes | Small UI removal only |
| 7 | [07-client.md](./07-client.md) | After 00 | Journeys tab |
| 8 | [08-branch.md](./08-branch.md) | After 00 | Branch-scoped journeys |
| 9 | [09-warehouse.md](./09-warehouse.md) | Yes | No journey dependency |
| 10 | [10-supplier.md](./10-supplier.md) | Yes | No journey dependency |
| 11 | [11-employee.md](./11-employee.md) | Yes | Form-only change |
| 12 | [12-statistics-reporting.md](./12-statistics-reporting.md) | After 00 | Wires KPI cards to stats API |
| 13 | [14-admin-dashboard.md](./14-admin-dashboard.md) | After 00 + stats | ADMIN `/home` ops cockpit |
| 14 | [15-journey-trip-values.md](./15-journey-trip-values.md) | After 01 + 07 | Revenue, sheet kind, nolon price (formulas) |
| — | [13-cross-domain.md](./13-cross-domain.md) | Reference | Rules that apply everywhere |

## Repo layout

- **Backend:** `redSea-backend-nestjs/src/app/modules/`
- **Frontend:** `red-sea-frontend-nextjs/src/features/`
- **Journey UI feature name:** `trips` (routes under `/trips`, not `/journeys`)

## Related docs

- [deleted-requirements.md](../deleted-requirements.md) — log every UI/field removal when it ships
- Parked: **commune** — not in codebase; do not implement until discussed
