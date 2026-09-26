# Export QA checklist

Manual verification after implementation:

## List modules
- [ ] **Drivers** — apply search/date filters, export; row count matches filtered total (not current page only)
- [ ] **Trips** — filters in URL affect exported journeys
- [ ] **GPS devices** — filters affect exported devices

## Accounting reports
- [ ] **General ledger** — select account + date range; export includes all ledger lines for account
- [ ] **Trial balance** — export matches visible tree/flat rows for date range

## Nested tables
- [ ] **Branch employees** — export on branch detail includes all employees for that branch
- [ ] **GPS device tails** — export on device detail includes tail history

## UX
- [ ] Export button shows spinner while fetching
- [ ] Empty result shows warning toast (no file)
- [ ] Filename format: `{module}_{YYYY-MM-DD}.xlsx`

## Automated tests
```bash
pnpm test -- src/lib/export
```
