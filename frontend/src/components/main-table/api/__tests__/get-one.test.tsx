import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError } from 'axios';

const get = jest.fn();

jest.mock('@/lib/client', () => ({
  __esModule: true,
  default: { get: (...a: unknown[]) => get(...a) },
}));

import { useGetGridByPageKey } from '../get-one';

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  jest.clearAllMocks();
});

it('returns empty columns when no prefs saved (200 empty DTO)', async () => {
  get.mockResolvedValue({ data: { pageKey: 'trips', columns: [] } });

  const { result } = renderHook(() => useGetGridByPageKey('trips'), { wrapper });

  await waitFor(() => {
    expect(result.current.isGetGridLoading).toBe(false);
  });

  expect(result.current.gridConfig).toEqual({ pageKey: 'trips', columns: [] });
  // DataTable treats empty columns as defaults via columns?.length
  expect(result.current.gridConfig?.columns?.length).toBe(0);
});

it('maps 404 to null gridConfig (legacy BE)', async () => {
  const error = new AxiosError('Not Found');
  error.response = {
    status: 404,
    data: { message: 'Grid not found for this user and pageKey' },
    statusText: 'Not Found',
    headers: {},
    config: {} as never,
  };
  get.mockRejectedValue(error);

  const { result } = renderHook(() => useGetGridByPageKey('cars'), { wrapper });

  await waitFor(() => {
    expect(result.current.isGetGridLoading).toBe(false);
  });

  expect(result.current.gridConfig).toBeNull();
  expect(result.current.error).toBeNull();
});

it('returns saved columns when grid exists', async () => {
  get.mockResolvedValue({
    data: { pageKey: 'drivers', columns: ['driverName', 'driverCode'] },
  });

  const { result } = renderHook(() => useGetGridByPageKey('drivers'), { wrapper });

  await waitFor(() => {
    expect(result.current.gridConfig).toEqual({
      pageKey: 'drivers',
      columns: ['driverName', 'driverCode'],
    });
  });
});
