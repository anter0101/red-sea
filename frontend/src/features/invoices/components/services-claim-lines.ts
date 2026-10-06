export interface ServicesClaimSource {
  governorate: string | null;
  packingType: string | null;
  quantity: number | null;
  claimUnitPrice: number | null;
}

export interface ServicesClaimLine {
  governorate: string;
  packingType: string | null;
  quantity: number;
  unitPrice: number;
  value: number;
}

function roundMoney(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100) / 100;
}

/** One printed row per governorate, packing type, and مطالبة rate. */
export function servicesClaimLines(journeys: ServicesClaimSource[]): ServicesClaimLine[] {
  const groups = new Map<string, ServicesClaimLine>();

  for (const row of journeys) {
    if (row.claimUnitPrice == null || !Number.isFinite(Number(row.claimUnitPrice))) continue;
    const unitPrice = roundMoney(Number(row.claimUnitPrice));
    const rawQty = Number(row.quantity ?? 0);
    const quantity = Number.isFinite(rawQty) ? rawQty : 0;
    const governorate = row.governorate?.trim() || '—';
    const packingType = row.packingType ?? null;
    const key = `${governorate}\0${packingType ?? ''}\0${unitPrice}`;
    const existing = groups.get(key);
    if (existing) {
      existing.quantity += quantity;
    } else {
      groups.set(key, { governorate, packingType, quantity, unitPrice, value: 0 });
    }
  }

  return [...groups.values()].map((line) => ({
    ...line,
    value: roundMoney(line.quantity * line.unitPrice),
  }));
}
