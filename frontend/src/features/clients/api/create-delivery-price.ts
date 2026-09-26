import { useCreate } from '@/hooks/base/create';

export interface IDeliveryPricePayload {
  clientId: number;
  priceTypeId: number;
  areaId: number;
  basePrice: number;
  additionalFees: number;
  taxPrice: number;
  totalPrice: number;
  nolonPrice?: number;
  validFrom: string;
  validTo: string;
  notes?: string;
}

export interface IDeliveryPriceResponse {
  id: number;
  client: { id: number };
  area: { id: number };
  priceType: { id: number };
  basePrice: number;
  additionalFees: string;
  taxPrice: string;
  totalPrice: number;
  validFrom: string;
  validTo: string;
  notes: string | null;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export const useCreateDeliveryPrice = () => {
  const mutation = useCreate<IDeliveryPriceResponse, Error, IDeliveryPricePayload>({
    endPoint: '/api/delivery-prices',
    queryKey: ['delivery-prices'],
  });

  return {
    createDeliveryPriceMutation: mutation.mutate,
    isCreateDeliveryPricePending: mutation.isPending,
  };
};
