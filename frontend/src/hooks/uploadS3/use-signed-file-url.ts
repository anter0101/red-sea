import client from '@/lib/client';
import { useQuery } from '@tanstack/react-query';

export type SignedFileUrlResponse = {
  url: string;
  expiresIn: number;
};

/** The bucket is private: stored file URLs only open through a short-lived link signed by the backend. */
export function useSignedFileUrl(storedUrl?: string | null) {
  const value = storedUrl?.trim() ?? '';
  return useQuery({
    queryKey: ['signed-file-url', value],
    queryFn: async () => {
      const res = await client.get<SignedFileUrlResponse>('/api/v1/upload/view-url', {
        params: { url: value },
      });
      return res.data;
    },
    enabled: value.length > 0,
    staleTime: 50 * 60 * 1000,
    gcTime: 55 * 60 * 1000,
    retry: false,
  });
}
