'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { useFieldArray, useForm, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import SelectWithActions from '@/components/common/select-with-actions';
import TablePagination from '@/components/common/table-pagination';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { OwnerShipTypes } from '@/enums/ownership';
import { AddPartnerDialog } from '@/features/cars/components';
import { zodResolver } from '@hookform/resolvers/zod';

import useGetOwners from './get-all';

const OwnerRow = ({ index }: { index: number }) => {
  const { control } = useFormContext();
  const [open, setOpen] = useState(false);
  const [isAddPartnerOpen, setIsAddPartnerOpen] = useState(false);

  const t = useTranslations('cars.ownership');

  const {
    owners,
    hasNextOwnerPage,
    isGetOwnersPending,
    fetchNextOwnerPage,
    isGetOwnersFetchingNextPage,
  } = useGetOwners();

  const partnerItems =
    owners?.map((owner) => ({
      id: owner?.id?.toString(),
      name: owner.name,
    })) ?? [];

  const handleLoadMore = useCallback(() => {
    if (hasNextOwnerPage && !isGetOwnersFetchingNextPage) {
      fetchNextOwnerPage();
    }
  }, [hasNextOwnerPage, isGetOwnersFetchingNextPage, fetchNextOwnerPage]);

  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={control}
        name={`owners.${index}.id`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('owner-name-label', { number: index + 1 })} :</FormLabel>
            <FormControl>
              <SelectWithActions
                canAddItem
                open={open}
                setOpen={setOpen}
                showSearch={false}
                items={partnerItems ?? []}
                value={field.value?.toString()}
                handleLoadMore={handleLoadMore}
                placeholder={t('select-owner')}
                hasGetItemsNextPage={hasNextOwnerPage}
                isGetItemsPending={isGetOwnersPending}
                setAddDialogOpen={setIsAddPartnerOpen}
                addButtonLabel={t('add-partner.title')}
                emptyMessage={t('no-partners-available')}
                handleSelect={(val) => field.onChange(val ? Number(val) : undefined)}
                addDialog={
                  <AddPartnerDialog open={isAddPartnerOpen} onOpenChange={setIsAddPartnerOpen} />
                }
                isGetItemsFetchingNextPage={isGetOwnersFetchingNextPage}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={`owners.${index}.percentage`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('owner-percentage-label', { number: index + 1 })} :</FormLabel>
            <FormControl>
              <div className="flex">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="0"
                  value={field.value ?? ''}
                  onChange={(e) =>
                    field.onChange(e.target.value ? Number(e.target.value) : undefined)
                  }
                />
                <span className="text-muted-foreground pointer-events-none flex items-center ps-3">
                  %
                </span>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

const OwnersFieldArray = () => {
  const { control } = useFormContext<OwnershipFormValues>();
  const t = useTranslations('cars.ownership');

  const { fields, append } = useFieldArray({
    control,
    name: 'owners',
  });

  const handleAddOwner = () => {
    append({ id: 0, percentage: undefined, contractUrl: '', notes: '' });
  };

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <OwnerRow key={field.id} index={index} />
      ))}

      <Button type="button" variant="outline" onClick={handleAddOwner} className="w-full">
        <Plus className="me-2 h-4 w-4" />
        {t('add-owner')}
      </Button>

      <FormField
        control={control}
        name="owners"
        render={() => (
          <FormItem>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

const ownershipTypeOptions = (t: (key: string) => string) => [
  { value: OwnerShipTypes.NOLON_CAR, label: t('types.NOLON_CAR') },
  { value: OwnerShipTypes.CONTRACT_CAR, label: t('types.CONTRACT_CAR') },
  { value: OwnerShipTypes.COMPANY_CAR, label: t('types.COMPANY_CAR') },
  { value: OwnerShipTypes.SHARE, label: t('types.SHARE') },
];

const OwnershipSchema = (t: (key: string) => string) =>
  z.object({
    ownerShip: z.nativeEnum(OwnerShipTypes, {
      message: t('validation.ownership-required'),
    }),
    owners: z
      .array(
        z
          .object({
            id: z.number(),
            percentage: z.number().optional(),
            contractUrl: z.string().optional(),
            notes: z.string().optional(),
          })
          .refine((data) => data.percentage !== undefined, {
            message: t('validation.percentage-required'),
            path: ['percentage'],
          }),
      )
      .refine(
        (owners) => {
          const total = owners.reduce((sum, owner) => sum + (owner.percentage ?? 0), 0);
          return total === 100;
        },
        {
          message: t('validation.total-percentage-must-be-100'),
        },
      ),
  });

type OwnershipFormValues = z.infer<ReturnType<typeof OwnershipSchema>>;

const TestPage = () => {
  const tOwnership = useTranslations('cars.ownership');

  const form = useForm<OwnershipFormValues>({
    resolver: zodResolver(OwnershipSchema(tOwnership)),
    defaultValues: {
      ownerShip: OwnerShipTypes.CONTRACT_CAR,
      owners: [{ id: 0, percentage: undefined, contractUrl: '', notes: '' }],
    },
    mode: 'onChange',
  });

  const onSubmit = (data: OwnershipFormValues) => {
    console.log(data);
  };

  return (
    <div className="container mx-auto max-w-2xl ">
      {/* <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="ownerShip"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tOwnership("type-label")}</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={tOwnership("select-type")} />
                    </SelectTrigger>
                    <SelectContent>
                      {ownershipTypeOptions(tOwnership).map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <OwnersFieldArray />
          <Button type="submit">Submit</Button>
        </form>
      </Form> */}
      <TablePagination totalCount={100} />
    </div>
  );
};

export default TestPage;
