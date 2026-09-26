import { useCreate } from '@/hooks/base/create';

export interface IBulkDeliveryPriceItem {
  areaId: number;
  priceTypeId: number;
  basePrice: number;
  additionalFees: number;
  taxPrice: number;
  nolonPrice?: number;
  validFrom: string;
  validTo: string;
  notes?: string;
}

export interface IBulkDeliveryPricePayload {
  clientId: number;
  items: IBulkDeliveryPriceItem[];
}

export const useCreateBulkDeliveryPrices = () => {
  const mutation = useCreate<unknown, Error, IBulkDeliveryPricePayload>({
    endPoint: '/api/delivery-prices/bulk',
    queryKey: ['delivery-prices'],
  });

  return {
    createBulkDeliveryPricesMutation: mutation.mutate,
    isCreateBulkDeliveryPricesPending: mutation.isPending,
  };
};
