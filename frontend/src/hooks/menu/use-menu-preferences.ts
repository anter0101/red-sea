import { toast } from 'react-toastify';

import client from '@/lib/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

type MenuPreferences = { hidden: string[] };

const QUERY_KEY = ['menu-preferences'];
const STALE_TIME_MS = 5 * 60 * 1000;

export function useMenuPreferences() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const res = await client.get<MenuPreferences>('/api/users/me/menu-preferences');
      return res.data;
    },
    staleTime: STALE_TIME_MS,
  });

  const save = useMutation({
    mutationFn: async (hidden: string[]) => {
      const res = await client.put<MenuPreferences>('/api/users/me/menu-preferences', { hidden });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEY, data);
      toast.success('تم حفظ القائمة');
    },
    onError: () => {
      toast.error('تعذر حفظ القائمة');
    },
  });

  return { hidden: query.data?.hidden ?? [], save };
}
