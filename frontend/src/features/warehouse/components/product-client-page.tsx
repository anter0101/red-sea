'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

import EntityHeader from '@/components/common/entity-header';
import InfoSection from '@/components/common/info-section';
import EntityToggleTabs from '@/components/common/toggle-tabs';
import { Badge } from '@/components/ui/badge';

import { ProductStatusLabels } from '../api/get-all';
import { useProductPage } from '../hooks/use-product-page';
import {
  ProductCondition,
  ProductConditionLabels,
  ProductStatus,
} from '../types/products';
import StockMovementsPanel from './stock-movements-panel';

export default function ProductClientPage({ productId }: { productId: number }) {
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role?.toUpperCase() === 'ADMIN';
  const {
    product,
    isGetProductLoading,
    error,
    activeTab,
    setActiveTab,
    handleDelete,
  } = useProductPage(productId);

  const tabs = [
    { id: 'info', label: 'المعلومات' },
    { id: 'stock', label: 'حركات المخزون' },
  ];

  if (isGetProductLoading) {
    return (
      <div className="flex items-center justify-center h-60">
        <Loader2 className="animate-spin text-primary" size={36} />
      </div>
    );
  }

  if (error || !product) {
    return <div className="text-red-600">حدث خطأ أثناء التحميل</div>;
  }

  const statusLabel =
    ProductStatusLabels[product.status as ProductStatus] || product.status || '—';
  const conditionLabel =
    ProductConditionLabels[product.condition as ProductCondition] || product.condition || '—';
  const isLowStock =
    product.quantity != null &&
    product.alertQuantity != null &&
    product.quantity <= product.alertQuantity;

  return (
    <div className="pageContainer flex flex-col gap-6">
      <EntityHeader
        name={product.code ?? product.name ?? `منتج ${productId}`}
        onDelete={isAdmin ? handleDelete : undefined}
      />

      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">الكمية: {product.quantity ?? 0}</Badge>
        <Badge variant="outline">{statusLabel}</Badge>
        {isLowStock && <Badge variant="destructive">مخزون منخفض</Badge>}
      </div>

      <div className="w-full flex justify-center">
        <EntityToggleTabs
          tabs={tabs}
          value={activeTab}
          defaultTab="info"
          onChange={setActiveTab}
          containerClassName="max-w-full flex-wrap justify-center"
        />
      </div>

      {activeTab === 'info' && (
        <InfoSection
          title="معلومات المنتج"
          onEdit={() => router.push(`/warehouse/${productId}/update`)}
          items={[
            { label: 'اسم المنتج', value: product.name ?? '—' },
            { label: 'كود المنتج', value: product.code ?? '—' },
            { label: 'حالة المنتج', value: statusLabel },
            { label: 'حالة الاستخدام', value: conditionLabel },
            { label: 'الفئة', value: product.category ?? '—' },
            { label: 'الكمية', value: product.quantity ?? '—' },
            { label: 'حد التنبيه', value: product.alertQuantity ?? '—' },
            { label: 'وحدة القياس', value: product.unit ?? '—' },
            { label: 'المورد', value: product.supplier?.name ?? '—' },
            { label: 'سعر الوحدة', value: product.unitPrice ?? '—' },
            { label: 'سنة التصنيع', value: product.manufacturingYear ?? '—' },
            { label: 'تاريخ الشراء', value: product.purchaseDate ?? '—' },
            { label: 'تاريخ الانتهاء', value: product.expiryDate ?? '—' },
            {
              label: 'آخر تاريخ صرف',
              value: product.lastUsedDate
                ? new Date(product.lastUsedDate).toLocaleDateString('ar-EG')
                : '—',
            },
          ]}
        />
      )}

      {activeTab === 'stock' && <StockMovementsPanel productId={productId} />}
    </div>
  );
}
