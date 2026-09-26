import React from 'react';
import { renderHook, act } from '@testing-library/react';

const post = jest.fn().mockResolvedValue({ data: {} });
const invalidateQueries = jest.fn();
jest.mock('@/lib/client', () => ({
  __esModule: true,
  default: { post: (...a: any[]) => post(...a) },
}));
jest.mock('@/lib/query-client', () => ({
  __esModule: true,
  default: { invalidateQueries: (...a: any[]) => invalidateQueries(...a) },
}));
jest.mock('next-intl', () => ({ useTranslations: () => (k: string) => k, useLocale: () => 'ar' }));
jest.mock('react-toastify', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRequestAction } from '../request-action';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

const acceptLanguage = { headers: { 'Accept-Language': 'ar' } };

it('posts the action to the request-action endpoint', async () => {
  const { result } = renderHook(() => useRequestAction(), { wrapper });
  await act(async () => {
    await result.current.requestActionMutation({ id: 7, status: 'APPROVED' });
  });
  expect(post).toHaveBeenCalledWith(
    'api/office-requests/7/request-action',
    { status: 'APPROVED' },
    acceptLanguage,
  );
});

it('posts status and custody when custody is provided', async () => {
  const { result } = renderHook(() => useRequestAction(), { wrapper });
  await act(async () => {
    await result.current.requestActionMutation({
      id: 5,
      status: 'APPROVED',
      custody: { amount: 200, transferTo: 'TREASURY' },
    });
  });
  expect(post).toHaveBeenCalledWith(
    'api/office-requests/5/request-action',
    {
      status: 'APPROVED',
      custody: { amount: 200, transferTo: 'TREASURY' },
    },
    acceptLanguage,
  );
});

it('posts custody with targetEmployeeId when transferTo is EMPLOYEE', async () => {
  const { result } = renderHook(() => useRequestAction(), { wrapper });
  await act(async () => {
    await result.current.requestActionMutation({
      id: 9,
      status: 'APPROVED',
      custody: { amount: 150, transferTo: 'EMPLOYEE', targetEmployeeId: 3 },
    });
  });
  expect(post).toHaveBeenCalledWith(
    'api/office-requests/9/request-action',
    {
      status: 'APPROVED',
      custody: { amount: 150, transferTo: 'EMPLOYEE', targetEmployeeId: 3 },
    },
    acceptLanguage,
  );
});

it('shows the backend validation message on the toaster', async () => {
  const { toast } = jest.requireMock('react-toastify');
  post.mockRejectedValueOnce(new Error('الرصيد المتاح غير كافٍ'));

  const { result } = renderHook(() => useRequestAction(), { wrapper });
  await act(async () => {
    await result.current.requestActionMutation({ id: 7, status: 'APPROVED' }).catch(() => {});
  });

  expect(toast.error).toHaveBeenCalledWith('الرصيد المتاح غير كافٍ');
});
