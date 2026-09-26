import { useTranslations } from 'next-intl';

import ClientCard from '@/features/clients/components/client-card';
import type { IClient } from '@/features/clients/types';

const ClientsList = ({ clients }: { clients: IClient[] }) => {
  const t = useTranslations('clients');
  return (
    <>
      {clients?.length === 0 ? (
        <div className="flex items-center justify-center">
          <p className="text-center p-4">{t('no-clients')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {clients?.map((item) => (
            <ClientCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </>
  );
};

export default ClientsList;
