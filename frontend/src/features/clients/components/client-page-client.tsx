'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ChevronDown, Download, FileSpreadsheet, Plus, Upload } from 'lucide-react';

import { useGetAllAreas } from '@/apis/areas/get-all-areas';
import { useGetAllGovernments } from '@/apis/governments/get-all-governments';
import InfoSection from '@/components/common/info-section';
import ReusableCard from '@/components/common/reusable-card';
import EntityToggleTabs from '@/components/common/toggle-tabs';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import JourneyList from '@/features/trips/components/journey-list';
import { useGetJourneyStats } from '@/features/trips/api/get-journey-stats';

import { useGetDeliveryPrices } from '../api/get-delivery-prices';
import { useClientPage } from '../hooks/use-client-page';
import {
  downloadArishDeliveryPriceTemplate,
  exportArishDeliveryPricesToExcel,
} from '../utils/arish-delivery-price-excel';
import {
  downloadWataneyaDeliveryPriceTemplate,
  exportWataneyaDeliveryPricesToExcel,
} from '../utils/wataneya-delivery-price-excel';

import ArishDeliveryPricesTable from './arish-delivery-prices-table';
import ImportArishDeliveryPricesDialog from './import-arish-delivery-prices-dialog';
import ImportWataneyaDeliveryPricesDialog from './import-wataneya-delivery-prices-dialog';
import WataneyaDeliveryPricesTable from './wataneya-delivery-prices-table';
import { PricingSheetKind } from '../enums/pricing-sheet-kind';

function formatMoney(value: number | undefined, pending: boolean): string {
  if (pending) return '...';
  return `${Number(value ?? 0).toLocaleString('en-EG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} EGP`;
}

export default function ClientPageClient({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  const handleEdit = () => {
    router.push(`/clients/${clientId}/update`);
  };

  const t = useTranslations('clients');
  const {
    client,
    isGetClientPending,
    error,
    activeTab,
    setActiveTab,
    handleDelete,
    isDeleteClientPending,
  } = useClientPage(Number(clientId));

  const { governorates } = useGetDeliveryPrices(clientId);
  const { data: journeyStats, isPending: isJourneyStatsPending } = useGetJourneyStats({
    clientId: Number(clientId),
  });

  // Fetch all governments and areas for template generation
  const { governments } = useGetAllGovernments();
  const { areas } = useGetAllAreas();

  const tabs = [
    { id: 'info', label: t('tabs.info') },
    { id: 'trips', label: t('tabs.trips') },
    { id: 'accounts', label: t('tabs.accounts') },
  ];

  const isWataneyaClient = client?.pricingSheetKind === PricingSheetKind.WATANIA;
  const isArishClient = !isWataneyaClient;

  // Export handler based on client type
  const handleExport = async () => {
    if (!governorates || !client) {
      return;
    }

    if (isWataneyaClient) {
      await exportWataneyaDeliveryPricesToExcel(governorates, client.name || 'الوطنية');
    } else {
      await exportArishDeliveryPricesToExcel(governorates, client.name || 'العريش');
    }
  };

  // Download template handler based on client type
  const handleDownloadTemplate = async () => {
    // Prepare governments and areas for template
    const governmentsForTemplate = governments?.map((g) => ({ id: g.id, name: g.name })) ?? [];
    const areasForTemplate = areas?.map((a) => ({ id: a.id, name: a.name })) ?? [];

    if (isWataneyaClient) {
      await downloadWataneyaDeliveryPriceTemplate(governmentsForTemplate, areasForTemplate);
    } else {
      await downloadArishDeliveryPriceTemplate(governmentsForTemplate, areasForTemplate);
    }
  };

  // Get client-specific label for dropdown
  const getClientLabel = () => {
    if (isWataneyaClient) {
      return t('pricing-sheet-kind.WATANIA');
    }
    return t('pricing-sheet-kind.ARISH');
  };

  return (
    <div className="pageContainer flex flex-col gap-6">
      <div className="w-full flex justify-center">
        <EntityToggleTabs
          tabs={tabs}
          value={activeTab}
          defaultTab="info"
          onChange={setActiveTab}
        />
      </div>

      {activeTab === 'info' && client && (
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <ReusableCard
              data={{
                title: t('cards.total-expenses'),
                value: formatMoney(journeyStats?.totalExpenses, isJourneyStatsPending),
              }}
              color="primary"
            />
            <ReusableCard
              data={{
                title: t('cards.total-revenue'),
                value: formatMoney(journeyStats?.totalRevenue, isJourneyStatsPending),
              }}
              color="secondary"
            />
            <ReusableCard
              data={{
                title: t('cards.total-net'),
                value: formatMoney(journeyStats?.totalProfit, isJourneyStatsPending),
              }}
              color="primary"
            />
          </div>

          <InfoSection
            title={t('info-section.title')}
            onEdit={handleEdit}
            showEdit
            items={[
              {
                label: t('fields.name'),
                value: client.name ?? '—',
              },
              {
                label: t('fields.company-code'),
                value: client.companyCode ?? '—',
              },
              {
                label: t('fields.tax-card'),
                value: client.taxInvoice ?? client.taxCard ?? '—',
              },
              {
                label: t('fields.commercial-record'),
                value: client.commercialRecord ?? '—',
              },
              {
                label: t('fields.pricing-sheet-kind'),
                value: isWataneyaClient
                  ? t('pricing-sheet-kind.WATANIA')
                  : t('pricing-sheet-kind.ARISH'),
              },
            ]}
          />

          {/* Destinations/Delivery Prices Section */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {t('delivery-prices.title')} - {getClientLabel()}
              </h3>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <FileSpreadsheet className="h-4 w-4 ml-2" />
                      {t('delivery-prices.excel-options')}
                      <ChevronDown className="h-4 w-4 mr-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setImportDialogOpen(true)}>
                      <Upload className="h-4 w-4 ml-2" />
                      {t('delivery-prices.import-excel')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExport}>
                      <Download className="h-4 w-4 ml-2" />
                      {t('delivery-prices.export-excel')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleDownloadTemplate}>
                      <FileSpreadsheet className="h-4 w-4 ml-2" />
                      {t('delivery-prices.download-template')} ({getClientLabel()})
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  onClick={() => router.push(`/clients/${clientId}/delivery-prices/create`)}
                  size="sm"
                >
                  <Plus className="h-4 w-4 ml-2" />
                  {t('delivery-prices.add-button')}
                </Button>
              </div>
            </div>

            {/* Render client-specific table */}
            {isArishClient ? (
              <ArishDeliveryPricesTable clientId={clientId} />
            ) : isWataneyaClient ? (
              <WataneyaDeliveryPricesTable clientId={clientId} />
            ) : (
              // Default to Arish table for other clients
              <ArishDeliveryPricesTable clientId={clientId} />
            )}
          </div>
        </div>
      )}

      {activeTab === 'trips' && (
        <JourneyList scope={{ clientId: Number(clientId) }} showStats />
      )}

      {activeTab === 'accounts' && (
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <ReusableCard
              data={{
                title: t('cards.total-expenses'),
                value: formatMoney(journeyStats?.totalExpenses, isJourneyStatsPending),
              }}
              color="primary"
            />
            <ReusableCard
              data={{
                title: t('cards.total-revenue'),
                value: formatMoney(journeyStats?.totalRevenue, isJourneyStatsPending),
              }}
              color="secondary"
            />
          </div>
        </div>
      )}

      {/* Import Dialog - Render client-specific dialog */}
      {isWataneyaClient ? (
        <ImportWataneyaDeliveryPricesDialog
          open={importDialogOpen}
          onOpenChange={setImportDialogOpen}
          clientId={clientId}
        />
      ) : (
        <ImportArishDeliveryPricesDialog
          open={importDialogOpen}
          onOpenChange={setImportDialogOpen}
          clientId={clientId}
        />
      )}
    </div>
  );
}
