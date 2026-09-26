---
name: custody-amount-input
description: Replace custodyAmount Select with an editable number Input bounded by the API-returned custody max, with Zod dynamic validation
metadata:
  type: project
---

# Custody Amount — Editable Input with API-driven Max Validation

## Context

The office journey form has a `custodyAmount` field currently rendered as a `<Select>` with a hardcoded `3000` option and the API value. The requirement is to replace it with a free-entry `<Input type="number">` where:

- The API (`/api/journeys/office/custody-amount`) returns the maximum allowed custody amount for the logged-in employee.
- The user can type any value but cannot exceed the API maximum.
- The placeholder shows the maximum value so the user knows the ceiling.
- The field is disabled while the API is loading.
- This applies to **all vehicle modes** (NOLON_CAR, CONTRACT_CAR, COMPANY_CAR).

## Architecture

### Schema (`office-journey-schema.ts`)

Replace the static `officeJourneySchema` with a factory function:

```ts
export function makeOfficeJourneySchema(maxCustody: number) {
  return z
    .object({
      // ...all existing fields unchanged...
      custodyAmount: z
        .string()
        .refine((v) => !v || Number(v) <= maxCustody, `لا يمكن أن يتجاوز ${maxCustody}`),
    })
    .superRefine(/* existing car-required rule */);
}
```

- Remove the static `officeJourneySchema` export (or keep as `makeOfficeJourneySchema(Infinity)` alias for tests that don't assert max behaviour).
- All other fields and the `superRefine` car-required rule remain unchanged.

### Hook (`use-office-journey-form.ts`)

Derive the resolver dynamically via `useMemo`:

```ts
const max = officeCustody?.custodyAmount ?? Infinity;
const schema = useMemo(() => makeOfficeJourneySchema(max), [max]);

const form = useForm<OfficeJourneyFormValues>({
  resolver: zodResolver(schema),
  defaultValues: { ...emptyOfficeJourneyValues, vehicleMode },
});
```

- `isCustodyAmountPending` is already returned from the hook; it's forwarded to the form component to control the disabled state.
- No other hook changes needed.

### Form UI (`office-journey-form.tsx`)

Replace the `<Select>` block for `custodyAmount` with:

```tsx
<div className="flex flex-col gap-1">
  <Label>{t('form.custodyAmount')}</Label>
  <Input
    type="number"
    placeholder={isCustodyAmountPending ? '...' : String(officeCustody?.custodyAmount ?? '')}
    disabled={isCustodyAmountPending}
    {...form.register('custodyAmount')}
  />
  {form.formState.errors.custodyAmount && (
    <p className="text-sm text-destructive">
      {form.formState.errors.custodyAmount.message as string}
    </p>
  )}
</div>
```

- The hardcoded `3000` option is removed entirely.
- The `<Select>` and its `<SelectContent>` are removed.

## Error Handling

- If the API fails to load, `officeCustody` is `undefined`, `max` defaults to `Infinity`, and the input is enabled with no placeholder — user can enter any value. This is the safe fallback (no false blocking).
- Validation message is in Arabic: `لا يمكن أن يتجاوز <max>`.

## Testing

- Update `src/features/office/types/__tests__/office-journey-validation.test.ts` (or equivalent) to call `makeOfficeJourneySchema(maxCustody)` instead of the static export, and add cases:
  - Value equal to max → valid
  - Value below max → valid
  - Value above max → invalid with correct message
  - Empty string → valid (field is optional)
