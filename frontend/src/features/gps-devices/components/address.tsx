'use client';

import { useReverseGeocode } from '../hooks/use-reverse-geocode';

type Props = {
  lat?: number;
  lng?: number;
};

export function AddressCell({ lat, lng }: Props) {
  const { data, isLoading, isError } = useReverseGeocode(lat, lng);

  if (!lat || !lng) return <span>-</span>;

  if (isLoading) return <span className="text-gray-400">جارٍ التحميل...</span>;

  if (isError) return <span className="text-red-500">غير متوفر</span>;

  return <span className="truncate block max-w-[250px]">{data}</span>;
}
