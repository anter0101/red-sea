import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const post = jest.fn().mockResolvedValue({
  data: { journeyId: 7, status: 'PRINTED', canPrint: false },
});
const invalidateQueries = jest.fn();

jest.mock('@/lib/client', () => ({
  __esModule: true,
  default: { post: (...a: unknown[]) => post(...a) },
}));
jest.mock('@/lib/query-client', () => ({
  __esModule: true,
  default: { invalidateQueries: (...a: unknown[]) => invalidateQueries(...a) },
}));
jest.mock('next-intl', () => ({ useTranslations: () => (k: string) => k }));
jest.mock('react-toastify', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

import { useMarkDelegationPrinted } from '../mark-printed';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

beforeEach(() => {
  jest.clearAllMocks();
  post.mockResolvedValue({
    data: { journeyId: 7, status: 'PRINTED', canPrint: false },
  });
});

it('posts mark-printed for the given journey id', async () => {
  const { result } = renderHook(() => useMarkDelegationPrinted(), { wrapper });

  await act(async () => {
    await result.current.markPrintedMutation(7);
  });

  expect(post).toHaveBeenCalledWith('api/journey-delegation-prints/7/mark-printed');
});

it('invalidates the delegation print query on success', async () => {
  const { result } = renderHook(() => useMarkDelegationPrinted(), { wrapper });

  await act(async () => {
    await result.current.markPrintedMutation(7);
  });

  await waitFor(() => {
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['delegation-print', '7'],
    });
  });
});
