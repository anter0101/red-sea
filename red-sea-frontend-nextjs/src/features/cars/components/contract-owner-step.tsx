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
import { useGetOwners } from '@/features/cars/apis/get-owners';
import AddPartnerDialog from '@/features/cars/components/add-partner-dialog';
import {
  ContractOwnerSchema,
  type IContractOwnerValues,
} from '@/features/cars/types/ownership-schema';
import type { ICar } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';

interface ContractOwnerStepProps {
  onNext: (ownerId: number) => void;
  onPrevious: () => void;
  car?: ICar;
  initialOwnerId?: number | null;
}

export default function ContractOwnerStep({
  onNext,
  onPrevious,
  car,
  initialOwnerId,
}: ContractOwnerStepProps) {
  const t = useTranslations('cars');
  const tOwnership = useTranslations('cars.ownership');
  const { owners: availableOwners, isPending: isOwnersLoading, refetch } = useGetOwners();
  const [isAddPartnerOpen, setIsAddPartnerOpen] = useState(false);
  const [selectOpen, setSelectOpen] = useState(false);

  const defaultOwnerId = useMemo(() => {
    if (initialOwnerId) return initialOwnerId;
    const ownerships = car?.Ownerships ?? [];
    if (ownerships.length === 1) {
      return ownerships[0].ownerId ?? ownerships[0].owner?.id;
    }
    return undefined;
  }, [car, initialOwnerId]);

  const form = useForm<IContractOwnerValues>({
    resolver: zodResolver(ContractOwnerSchema(t)),
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

  const onSubmit = (data: IContractOwnerValues) => {
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
      />
    </div>
  );
}
