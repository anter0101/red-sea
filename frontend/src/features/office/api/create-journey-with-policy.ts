import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import client from '@/lib/client';
import type { ITripPolicyInfo } from '@/features/trips/types/policy';

import type { CreateOfficeJourneyPayload } from '../types/office-journey-schema';

export interface JourneyWithPolicyResponse {
  journey: { id: number; delegateNumber?: string };
  policy: { id: number };
}

export type JourneyWithPolicyPayload = {
  journey: CreateOfficeJourneyPayload;
  /** Policy fields only: the server sets the journey id. */
  policy: Omit<ITripPolicyInfo, 'journeyId'>;
};

/** Creates the office journey and its policy in one server transaction (admin only). */
export const useCreateJourneyWithPolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: JourneyWithPolicyPayload) => {
      const res = await client.post<JourneyWithPolicyResponse>(
        '/api/journey-policies/with-journey',
        body,
      );
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(
        data.journey.delegateNumber
          ? `تم إنشاء الرحلة والبوليصة — رقم التفويض: ${data.journey.delegateNumber}`
          : 'تم إنشاء الرحلة والبوليصة',
      );
      void queryClient.invalidateQueries({ queryKey: ['journeys'] });
      void queryClient.invalidateQueries({ queryKey: ['journey-policies'] });
    },
    onError: (error) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? error.message)
        : String(error);
      toast.error(message);
    },
  });
};
