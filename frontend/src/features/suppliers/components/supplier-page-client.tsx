'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import InfoSection from '@/components/common/info-section';
import { useGetOneSupplier } from '../api/get-one';
import { Spinner } from '@/components/ui/spinner';

export default function SupplierPageClient({ supplierId }: { supplierId: string }) {
  const router = useRouter();
  const t = useTranslations('suppliers');

  const { supplier, isGetSupplierPending } = useGetOneSupplier(Number(supplierId));

  const handleEdit = () => {
    router.push(`/suppliers/${supplierId}/update`);
  };

  if (isGetSupplierPending) {
    return (
      <div className="p-4 container mx-auto max-w-4xl">
        <Spinner />
      </div>
    );
  }

  if (!supplier) {
    return <div className="p-4 container mx-auto max-w-4xl">{t('detail.not-found')}</div>;
  }

  const typeLabel = supplier.type ? t(`types.${supplier.type}`) : '—';

  return (
    <div className="pageContainer flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <InfoSection
          title={t('info-section.title')}
          onEdit={handleEdit}
          items={[
            {
              label: t('fields.code'),
              value: supplier.code ?? '—',
            },
            {
              label: t('fields.name'),
              value: supplier.name ?? '—',
            },
            {
              label: t('fields.type'),
              value: typeLabel,
            },
            {
              label: t('fields.governorate'),
              value: supplier.government?.name ?? '—',
            },
            {
              label: t('fields.phone'),
              value: supplier.phone ?? '—',
            },
            {
              label: t('fields.commercial-register'),
              value: supplier.commercialRegister ?? '—',
            },
            {
              label: t('fields.tax-card'),
              value: supplier.taxCard ?? '—',
            },
            {
              label: t('fields.tax-registration-number'),
              value: supplier.taxRegistrationNumber ?? '—',
            },
          ]}
        />
      </div>
    </div>
  );
}
