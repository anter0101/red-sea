import { renderHook } from '@testing-library/react';
import { useCreateOfficeJourney } from '../create-office-journey';

jest.mock('@/hooks/base/create', () => ({
  useCreate: jest.fn(() => ({ mutate: jest.fn(), isPending: false })),
}));
jest.mock('next-intl', () => ({ useTranslations: () => (k: string) => k, useLocale: () => 'ar' }));

import { useCreate } from '@/hooks/base/create';

describe('useCreateOfficeJourney', () => {
  it('calls the office endpoint with the journeys query key', () => {
    renderHook(() => useCreateOfficeJourney());
    expect(useCreate).toHaveBeenCalledWith(
      expect.objectContaining({ endPoint: 'api/journeys/office', queryKey: ['journeys'] }),
    );
  });

  it('exposes the mutation and pending flag', () => {
    const { result } = renderHook(() => useCreateOfficeJourney());
    expect(typeof result.current.createOfficeJourneyMutation).toBe('function');
    expect(result.current.isCreateOfficeJourneyPending).toBe(false);
  });
});
