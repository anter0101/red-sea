import type { VehicleMode } from '../enums/vehicle-mode';
import type { OfficeJourneyFormValues } from '../types/office-journey-schema';

const STORAGE_KEY = 'office-journey-draft';

export interface OfficeJourneyDraft {
  vehicleMode: VehicleMode;
  step: number;
  values: OfficeJourneyFormValues;
  updatedAt: number;
}

export function saveOfficeJourneyDraft(draft: Omit<OfficeJourneyDraft, 'updatedAt'>): void {
  if (typeof window === 'undefined') return;
  const payload: OfficeJourneyDraft = { ...draft, updatedAt: Date.now() };
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore quota / private mode
  }
}

export function loadOfficeJourneyDraft(vehicleMode: VehicleMode): OfficeJourneyDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as OfficeJourneyDraft;
    if (!parsed || parsed.vehicleMode !== vehicleMode || !parsed.values) return null;
    if (typeof parsed.step !== 'number' || parsed.step < 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearOfficeJourneyDraft(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

const SAFE_RETURN_TO =
  /^\/office\/(nolon-car|contract-car|company-car)$/;

/** Locale-prefixed paths like `/ar/office/nolon-car` are normalized for matching. */
export function resolveSafeOfficeReturnTo(returnTo: string | null): string | null {
  if (!returnTo || !returnTo.startsWith('/')) return null;
  if (returnTo.includes('://') || returnTo.includes('..')) return null;

  const withoutLocale = returnTo.replace(/^\/(ar|en)(?=\/)/, '');
  if (!SAFE_RETURN_TO.test(withoutLocale)) return null;

  return returnTo;
}
