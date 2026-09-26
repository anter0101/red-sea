'use client';

import { useQuery } from '@tanstack/react-query';

type NominatimResponse = {
  display_name?: string;
  address?: {
    road?: string;
    suburb?: string;
    neighbourhood?: string;
    city?: string;
    state?: string;
    country?: string;
  };
};

export function useReverseGeocode(lat?: number, lng?: number) {
  return useQuery({
    queryKey: ['reverse-geocode', lat, lng],

    enabled: !!lat && !!lng,

    staleTime: 1000 * 60 * 60 * 24,
    // cacheTime: 1000 * 60 * 60 * 24,

    retry: 1,

    queryFn: async () => {
      if (!lat || !lng) return null;

      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ar`,
        {
          headers: {
            'User-Agent': 'GPS-Dashboard/1.0',
          },
        },
      );

      if (!res.ok) throw new Error('Reverse geocode failed');

      const data: NominatimResponse = await res.json();

      const a = data.address;

      return (
        [a?.road, a?.suburb, a?.neighbourhood, a?.city, a?.state, a?.country]
          .filter(Boolean)
          .join('، ') ||
        data.display_name ||
        'غير معروف'
      );
    },
  });
}
