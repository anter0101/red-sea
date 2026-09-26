# Red Sea docs

One place for product behavior, accounting, and past implementation plans. App READMEs stay in [`backend/`](../backend) and [`frontend/`](../frontend).

## How to read

1. [Shared foundation](product/domains/00-shared-foundation.md) — journey list, scopes, and stats. Do this before any screen that embeds journeys or KPI cards.
2. Domain guides in [product/domains](product/domains/README.md), in the order that file lists.
3. [Cross-domain rules](product/domains/13-cross-domain.md) — journey table reuse, auth, soft delete, and what is parked.

Domain checklists `00`–`15` are shipped notes. They describe what the product does, not an open backlog.

## Product

| Doc | What it is |
| --- | --- |
| [Domain guides](product/domains/README.md) | One execution guide per business domain |
| [Deleted requirements](product/deleted-requirements.md) | Log a UI or field removal when it ships |
| [Export QA checklist](product/export-qa-checklist.md) | Open manual checks for Excel export |

**Parked:** commune. The codebase uses areas and governments only. Do not implement it until it is discussed.

## Accounting

These notes are the chart and API rules the UI must follow. Paths inside them (`src/app/modules/...`) are relative to [`backend/`](../backend).

| Doc | What it is |
| --- | --- |
| [Frontend integration](accounting/ACCOUNTING_FRONTEND_INTEGRATION.md) | Account, journal, and report rules |
| [Person accounts on create](accounting/PERSON_ACCOUNTS_ON_CREATE.md) | عهد / سلف / رواتب leaves created with a person |
| [Seeded chart mindmap](accounting/SEEDED_CHART_OF_ACCOUNTS_MINDMAP.md) | Hierarchy; diagram source is [chart-of-accounts.mmd](accounting/mermaid/chart-of-accounts.mmd) |

## Repo layout

- **Backend:** [`backend/src/app/modules/`](../backend/src/app/modules)
- **Frontend:** [`frontend/src/features/`](../frontend/src/features)
- **Journey UI:** the `trips` feature (routes under `/trips`, not `/journeys`)

API notes that stayed next to the frontend app:

- [phase-6-api.md](../frontend/phase-6-api.md)
- [journey-create-api.md](../frontend/journey-create-api.md)
- [office-request-create-api.md](../frontend/office-request-create-api.md)

## Archive

[archive/superpowers](archive/superpowers) holds the phase-6 office and custody plans and specs. Those files are history. Unchecked boxes in them are not open work.

## Phases

| Doc | What it is |
| --- | --- |
| [Phase 1 — Journey financials](phases/01-journey-financials.md) | Expected and actual revenue, and the expense lines for nolon, contract, and company cars |
| [Phase 2 — Policy review and posting](phases/02-policy-review-and-posting.md) | Build spec: internal account keys, actor leaves, and TRN1–TRN3 after Apply |
