import {
  clearOfficeJourneyDraft,
  loadOfficeJourneyDraft,
  resolveSafeOfficeReturnTo,
  saveOfficeJourneyDraft,
} from '../office-journey-draft';
import { emptyOfficeJourneyValues } from '../../types/office-journey-schema';

describe('office-journey-draft', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('saves and loads a draft for the matching vehicle mode', () => {
    saveOfficeJourneyDraft({
      vehicleMode: 'NOLON_CAR',
      step: 2,
      values: { ...emptyOfficeJourneyValues, vehicleMode: 'NOLON_CAR', clientId: '9' },
    });

    const draft = loadOfficeJourneyDraft('NOLON_CAR');
    expect(draft?.step).toBe(2);
    expect(draft?.values.clientId).toBe('9');
  });

  it('ignores draft when vehicle mode does not match', () => {
    saveOfficeJourneyDraft({
      vehicleMode: 'NOLON_CAR',
      step: 2,
      values: { ...emptyOfficeJourneyValues, vehicleMode: 'NOLON_CAR' },
    });
    expect(loadOfficeJourneyDraft('CONTRACT_CAR')).toBeNull();
  });

  it('clears the draft', () => {
    saveOfficeJourneyDraft({
      vehicleMode: 'COMPANY_CAR',
      step: 1,
      values: { ...emptyOfficeJourneyValues, vehicleMode: 'COMPANY_CAR' },
    });
    clearOfficeJourneyDraft();
    expect(loadOfficeJourneyDraft('COMPANY_CAR')).toBeNull();
  });
});

describe('resolveSafeOfficeReturnTo', () => {
  it('allows office mode paths with or without locale', () => {
    expect(resolveSafeOfficeReturnTo('/office/nolon-car')).toBe('/office/nolon-car');
    expect(resolveSafeOfficeReturnTo('/ar/office/contract-car')).toBe('/ar/office/contract-car');
    expect(resolveSafeOfficeReturnTo('/en/office/company-car')).toBe('/en/office/company-car');
  });

  it('rejects unsafe or unrelated paths', () => {
    expect(resolveSafeOfficeReturnTo(null)).toBeNull();
    expect(resolveSafeOfficeReturnTo('https://evil.com')).toBeNull();
    expect(resolveSafeOfficeReturnTo('/office-requests')).toBeNull();
    expect(resolveSafeOfficeReturnTo('/office/../admin')).toBeNull();
  });
});
