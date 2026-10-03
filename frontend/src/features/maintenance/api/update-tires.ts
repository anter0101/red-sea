import client from '@/lib/client';
import queryClient from '@/lib/query-client';

import type { ITireSelection } from './get-list';

function toPayload(item: ITireSelection) {
  const next = item.next;
  if (!next || !item.tireId) return null;
  return {
    serialNumber: next.serialNumber.trim(),
    type: next.type.trim(),
    healthPercentage: next.healthPercentage.trim(),
    location: item.location,
    ...(next.createdDate ? { createdDate: new Date(next.createdDate).toISOString() } : {}),
  };
}

export async function updateChangedTires(selections: ITireSelection[], locale: string) {
  const updates = selections
    .map((item) => ({ id: item.tireId, data: toPayload(item) }))
    .filter((item): item is { id: number; data: NonNullable<ReturnType<typeof toPayload>> } =>
      Boolean(item.id && item.data),
    );

  await Promise.all(
    updates.map((item) =>
      client.put(`/api/tires/${item.id}`, item.data, {
        headers: { 'Accept-Language': locale },
      }),
    ),
  );

  await queryClient.invalidateQueries({ queryKey: ['cars'] });
  await queryClient.invalidateQueries({ queryKey: ['trailers'] });
}
