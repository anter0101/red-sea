'use client';

import ArishDeliveryPricesForm from '@/features/clients/components/arish-delivery-prices-form';
import WataneyaDeliveryPricesForm from '@/features/clients/components/wataneya-delivery-prices-form';
import { useGetOneClient } from '@/features/clients/api/get-one';
import { PricingSheetKind } from '@/features/clients/enums/pricing-sheet-kind';

export default function CreateDeliveryPricesPageClient({ clientId }: { clientId: string }) {
  const { client, isGetClientPending } = useGetOneClient(Number(clientId));

  if (isGetClientPending) {
    return <div className="max-w-4xl mx-auto p-6">...</div>;
  }

  const isWatania = client?.pricingSheetKind === PricingSheetKind.WATANIA;

  return (
    <div className="max-w-4xl mx-auto">
      {isWatania ? (
        <WataneyaDeliveryPricesForm clientId={clientId} />
      ) : (
        <ArishDeliveryPricesForm clientId={clientId} />
      )}
    </div>
  );
}
