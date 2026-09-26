import client from '@/lib/client';

import { fetchAllPaginated } from '../fetch-all-paginated';

jest.mock('@/lib/client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

const mockedGet = client.get as jest.Mock;

describe('fetchAllPaginated', () => {
  beforeEach(() => {
    mockedGet.mockReset();
  });

  it('fetches all pages using filter params without pagination fields', async () => {
    mockedGet
      .mockResolvedValueOnce({
        data: [{ id: 1 }, { id: 2 }],
        headers: { 'x-total-count': '5' },
      })
      .mockResolvedValueOnce({
        data: [{ id: 3 }, { id: 4 }],
        headers: { 'x-total-count': '5' },
      })
      .mockResolvedValueOnce({
        data: [{ id: 5 }],
        headers: { 'x-total-count': '5' },
      });

    const result = await fetchAllPaginated<{ id: number }>({
      endPoint: '/api/drivers',
      params: { page: 3, pageSize: 10, search: 'ahmed' },
      pageSize: 2,
    });

    expect(result.data).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }]);
    expect(result.totalCount).toBe(5);
    expect(mockedGet).toHaveBeenCalledTimes(3);
    expect(mockedGet.mock.calls[0][1].params).toEqual({ search: 'ahmed', page: 1, pageSize: 2 });
    expect(mockedGet.mock.calls[1][1].params).toEqual({ search: 'ahmed', page: 2, pageSize: 2 });
  });

  it('supports custom parseResponse for non-array payloads', async () => {
    mockedGet.mockResolvedValueOnce({
      data: { lines: [{ date: '2026-01-01' }] },
      headers: { 'x-total-count': '1' },
    });

    const result = await fetchAllPaginated<{ date: string }>({
      endPoint: '/api/accounting/reports/ledger',
      params: { accountId: 1 },
      parseResponse: (data, headers) => ({
        items: (data as { lines: { date: string }[] }).lines,
        totalCount: Number(headers['x-total-count']),
      }),
    });

    expect(result.data).toEqual([{ date: '2026-01-01' }]);
  });

  it('throws when max rows exceeded', async () => {
    mockedGet.mockResolvedValue({
      data: Array.from({ length: 200 }, (_, i) => ({ id: i + 1 })),
      headers: { 'x-total-count': '500' },
    });

    await expect(
      fetchAllPaginated({
        endPoint: '/api/drivers',
        pageSize: 200,
        maxRows: 250,
      }),
    ).rejects.toThrow('EXPORT_MAX_ROWS_EXCEEDED:250');
  });
});
