'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';

import SelectWithActions from '@/components/common/select-with-actions';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useGetTrailerOwners } from '@/features/trailers/apis/get-owners';
import AddPartnerDialog from '@/features/trailers/components/add-partner-dialog';
import {
  TrailerContractOwnerSchema,
  type ITrailerContractOwnerValues,
} from '@/features/trailers/types/ownership-schema';
import type { ITrailer } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';

interface ContractOwnerStepProps {
  onNext: (ownerId: number) => void;
  onPrevious: () => void;
  trailer?: ITrailer;
  initialOwnerId?: number | null;
}

export default function ContractOwnerStep({
  onNext,
  onPrevious,
  trailer,
  initialOwnerId,
}: ContractOwnerStepProps) {
  const t = useTranslations('trailers');
  const tOwnership = useTranslations('trailers.ownership');
  const { owners: availableOwners, isPending: isOwnersLoading, refetch } = useGetTrailerOwners();
  const [isAddPartnerOpen, setIsAddPartnerOpen] = useState(false);
  const [selectOpen, setSelectOpen] = useState(false);

  const defaultOwnerId = useMemo(() => {
    if (initialOwnerId) return initialOwnerId;
    const ownerships = trailer?.Ownerships ?? [];
    if (ownerships.length === 1) {
      return ownerships[0].ownerId ?? ownerships[0].owner?.id;
    }
    return undefined;
  }, [trailer, initialOwnerId]);

  const form = useForm<ITrailerContractOwnerValues>({
    resolver: zodResolver(TrailerContractOwnerSchema(t)),
    defaultValues: {
      singleOwnerId: defaultOwnerId,
    },
    values: defaultOwnerId ? { singleOwnerId: defaultOwnerId } : undefined,
    mode: 'onChange',
  });

  const ownerItems = useMemo(
    () =>
      availableOwners?.map((owner) => ({
        id: owner.id.toString(),
        name: owner.name,
      })) ?? [],
    [availableOwners],
  );

  const onSubmit = (data: ITrailerContractOwnerValues) => {
    onNext(data.singleOwnerId);
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <h2 className="text-xl font-semibold text-right">{tOwnership('owner-label')}</h2>

          <FormField
            control={form.control}
            name="singleOwnerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tOwnership('select-owner')}</FormLabel>
                <FormControl>
                  <SelectWithActions
                    open={selectOpen}
                    setOpen={setSelectOpen}
                    value={field.value?.toString()}
                    handleSelect={(val) => field.onChange(val ? Number(val) : undefined)}
                    showSearch={false}
                    items={ownerItems}
                    handleLoadMore={() => {}}
                    isGetItemsPending={isOwnersLoading}
                    canAddItem
                    setAddDialogOpen={setIsAddPartnerOpen}
                    addDialog={null}
                    addButtonLabel={tOwnership('add-owner')}
                    emptyMessage={tOwnership('no-owners-available')}
                    placeholder={tOwnership('select-owner')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-between gap-4">
            <Button type="button" variant="outline" onClick={onPrevious}>
              {t('buttons.previous')}
            </Button>
            <Button type="submit">{t('buttons.next')}</Button>
          </div>
        </form>
      </Form>

      <AddPartnerDialog
        mode="owner"
        open={isAddPartnerOpen}
        onOpenChange={(open) => {
          setIsAddPartnerOpen(open);
          if (!open) refetch();
        }}
        onPartnerCreated={() => refetch()}
      />
    </div>
  );
}
