import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { useDeletePartner } from '../api/delete';
import { useGetOnePartner } from '../api/get-one';

export const usePartnerPage = (partnerId: number) => {
  const router = useRouter();

  const { partner, isGetPartnerPending, error } = useGetOnePartner(partnerId);

  const { deletePartnerMutation, isDeletePartnerPending } = useDeletePartner();

  const [activeTab, setActiveTab] = useState('cars');

  const handleDelete = () => {
    deletePartnerMutation(partnerId.toString(), {
      onSuccess: () => {
        router.push('/partners');
      },
    });
  };

  return {
    partner,
    isGetPartnerPending,
    error,
    activeTab,
    setActiveTab,
    handleDelete,
    isDeletePartnerPending,
  };
};
