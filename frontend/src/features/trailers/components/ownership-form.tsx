'use client';

import { useCallback, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';
import { Plus, Trash2 } from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';

import SelectWithActions from '@/components/common/select-with-actions';
import { StoredFileLink } from '@/components/common/stored-file-link';
import { Button } from '@/components/ui/button';
import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/components/ui/dropzone';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { uploadFile } from '@/hooks/uploadS3/upload-file';
import { useTrailerBulkAssignOwners } from '@/features/trailers/apis/bulk-assign-owners';
import { useGetTrailerOwners } from '@/features/trailers/apis/get-owners';
import AddPartnerDialog from '@/features/trailers/components/add-partner-dialog';
import {
  type ITrailerSharePartnersValues,
  TrailerSharePartnersSchema,
} from '@/features/trailers/types';
import type { ITrailer } from '@/types';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';

interface OwnershipFormProps {
  onNext: () => void;
  onPrevious: () => void;
  trailerId: number | null;
  trailer?: ITrailer;
}

const OwnershipForm = ({ onNext, onPrevious, trailerId, trailer }: OwnershipFormProps) => {
  const t = useTranslations('trailers');
  const tOwnership = useTranslations('trailers.ownership');

  const { bulkAssignOwnersMutation, isBulkAssignOwnersPending } = useTrailerBulkAssignOwners();
  const {
    owners: availablePartners,
    isPending: isPartnersLoading,
    refetch: refetchOwners,
  } = useGetTrailerOwners();
  const [isAddPartnerOpen, setIsAddPartnerOpen] = useState(false);
  const [partnerSelectOpenIndex, setPartnerSelectOpenIndex] = useState<number | null>(null);
  const [uploadingContractIndex, setUploadingContractIndex] = useState<number | null>(null);

  const getFormValuesFromTrailer = useMemo((): ITrailerSharePartnersValues => {
    const ownerships = trailer?.Ownerships || [];
    if (ownerships.length === 0) {
      return { partners: [] };
    }

    return {
      partners: ownerships.map((ownership) => ({
        partnerId: ownership.ownerId ?? ownership.owner?.id,
        partnerName: ownership.owner?.name || '',
        percentage:
          typeof ownership.percentage === 'string'
            ? parseFloat(ownership.percentage)
            : ownership.percentage,
        contractUrl: ownership.contractUrl || '',
        notes: ownership.notes || '',
        isNew: false,
      })),
    };
  }, [trailer]);

  const form = useForm<ITrailerSharePartnersValues>({
    resolver: zodResolver(TrailerSharePartnersSchema(t)),
    defaultValues: getFormValuesFromTrailer,
    values: trailer ? getFormValuesFromTrailer : undefined,
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'partners',
  });

  const partners = form.watch('partners') || [];
  const totalPercentage = partners.reduce((sum, p) => sum + (p.percentage || 0), 0);
  const remainingPercentage = 100 - totalPercentage;

  const onSubmit = (data: ITrailerSharePartnersValues) => {
    if (!trailerId) {
      return;
    }

    if (trailer?.Ownerships?.length && trailer.Ownerships.length > 0) {
      onNext();
      return;
    }

    const owners = data.partners
      .filter((partner) => partner.partnerId !== undefined)
      .map((partner) => ({
        id: partner.partnerId!,
        percentage: partner.percentage,
        contractUrl: partner.contractUrl,
        notes: partner.notes,
      }));

    if (owners.length === 0) {
      onNext();
      return;
    }

    bulkAssignOwnersMutation(
      { trailerId, owners },
      {
        onSuccess: () => {
          onNext();
        },
      },
    );
  };

  const handleAddPartner = () => {
    append({
      partnerId: undefined,
      partnerName: '',
      percentage: 0,
      contractUrl: '',
      notes: '',
      isNew: false,
    });
  };

  const getPartnerById = (id: number | undefined) => {
    return availablePartners?.find((p) => p.id === id);
  };

  const partnerItems = useMemo(
    () =>
      availablePartners?.map((partner) => ({
        id: partner.id.toString(),
        name: partner.name,
      })) ?? [],
    [availablePartners],
  );

  const getAvailablePartnersForIndex = useCallback(
    (currentIndex: number) => {
      const selectedPartnerIds = partners
        .map((p, idx) => (idx !== currentIndex ? p.partnerId : null))
        .filter((id) => id !== null && id !== undefined);

      return partnerItems.filter((item) => !selectedPartnerIds.includes(Number(item.id)));
    },
    [partners, partnerItems],
  );

  return (
    <div className="flex gap-6">
      {partners.length > 0 && partners.some((p) => p.partnerId || p.percentage > 0) && (
        <div className="w-64 shrink-0">
          <div className="bg-emerald-50 rounded-lg p-4 space-y-4">
            {partners.map((partner, index) => {
              if (!partner.partnerId && partner.percentage === 0) {
                return null;
              }

              return (
                <div key={index} className="border-b border-emerald-200 pb-3 last:border-0">
                  <div className="text-sm text-gray-600 text-right">
                    {tOwnership('partner-number', { number: index + 1 })}:
                  </div>
                  <div className="text-xs text-gray-500 text-right">
                    {tOwnership('partner-name')}:
                  </div>
                  <div className="font-medium text-right">
                    {partner.partnerName ||
                      getPartnerById(partner.partnerId)?.name ||
                      tOwnership('partner-name')}
                  </div>
                  <div className="text-xs text-gray-500 text-right">
                    {tOwnership('share-percentage')}:
                  </div>
                  <div className="text-sm text-right">{partner.percentage}%</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex-1">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <h2 className="text-xl font-semibold text-right">
              {tOwnership('title')}
              {trailer?.code && (
                <span className="text-gray-500 text-lg ms-2">
                  {tOwnership('trailer-code', { code: trailer.code })}
                </span>
              )}
            </h2>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 bg-gray-50 rounded-lg space-y-4">
                  <div className="flex items-end gap-3">
                    <FormField
                      control={form.control}
                      name={`partners.${index}.partnerId`}
                      render={({ field: partnerField }) => (
                        <FormItem className="flex-1">
                          <FormLabel>
                            {tOwnership('partner-name-label', { number: index + 1 })}
                          </FormLabel>
                          <FormControl>
                            <SelectWithActions
                              open={partnerSelectOpenIndex === index}
                              setOpen={(open) => setPartnerSelectOpenIndex(open ? index : null)}
                              value={partnerField.value?.toString()}
                              handleSelect={(val) => {
                                partnerField.onChange(val ? Number(val) : undefined);
                                const partner = availablePartners?.find(
                                  (p) => p.id === Number(val),
                                );
                                if (partner) {
                                  form.setValue(`partners.${index}.partnerName`, partner.name);
                                }
                              }}
                              showSearch={false}
                              items={getAvailablePartnersForIndex(index)}
                              handleLoadMore={() => {}}
                              isGetItemsPending={isPartnersLoading}
                              canAddItem
                              setAddDialogOpen={setIsAddPartnerOpen}
                              addDialog={null}
                              addButtonLabel={tOwnership('add-partner.title')}
                              emptyMessage={tOwnership('no-partners-available')}
                              placeholder={tOwnership('select-partner')}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`partners.${index}.percentage`}
                      render={({ field: percentField }) => (
                        <FormItem className="w-32">
                          <FormLabel>
                            {tOwnership('percentage-label', { number: index + 1 })}
                          </FormLabel>
                          <div className="flex gap-2 items-center">
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                {...percentField}
                                onChange={(e) => percentField.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <span className="text-sm text-gray-500">%</span>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {fields.length > 1 && (
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="shrink-0 mb-0.5"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name={`partners.${index}.contractUrl`}
                    render={({ field: contractField }) => (
                      <FormItem>
                        <FormLabel>{tOwnership('contract-image-label')}</FormLabel>
                        <FormControl>
                          <Dropzone
                            accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
                            maxFiles={1}
                            disabled={uploadingContractIndex === index}
                            onDrop={async (acceptedFiles) => {
                              const file = acceptedFiles[0];
                              if (!file) return;
                              setUploadingContractIndex(index);
                              try {
                                const url = await uploadFile(file);
                                contractField.onChange(url);
                              } catch {
                                toast.error(t('documents.upload-error'));
                              } finally {
                                setUploadingContractIndex(null);
                              }
                            }}
                          >
                            <DropzoneEmptyState />
                            <DropzoneContent />
                          </Dropzone>
                          {typeof contractField.value === 'string' && contractField.value ? (
                            <StoredFileLink url={contractField.value} className="truncate">
                              {contractField.value.split('/').pop()}
                            </StoredFileLink>
                          ) : null}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                className="w-full border-dashed"
                onClick={handleAddPartner}
              >
                <Plus className="h-4 w-4 me-2" />
                {tOwnership('add-partner-btn')}
              </Button>

              {partners.length > 0 && (
                <div
                  className={cn(
                    'text-sm p-3 rounded-lg',
                    totalPercentage === 100
                      ? 'bg-green-50 text-green-700'
                      : 'bg-yellow-50 text-yellow-700',
                  )}
                >
                  {tOwnership('total-percentage', { total: totalPercentage })}
                  {totalPercentage !== 100 && (
                    <span className="ms-2">
                      ({tOwnership('remaining', { remaining: remainingPercentage })})
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-between gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={onPrevious}
                disabled={isBulkAssignOwnersPending || uploadingContractIndex !== null}
              >
                {t('buttons.previous')}
              </Button>
              <Button
                type="submit"
                disabled={isBulkAssignOwnersPending || uploadingContractIndex !== null}
              >
                {isBulkAssignOwnersPending || uploadingContractIndex !== null
                  ? t('buttons.loading')
                  : t('buttons.next')}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      <AddPartnerDialog
        open={isAddPartnerOpen}
        onOpenChange={(open) => {
          setIsAddPartnerOpen(open);
          if (!open) refetchOwners();
        }}
        onPartnerCreated={() => refetchOwners()}
      />
    </div>
  );
};

export default OwnershipForm;
