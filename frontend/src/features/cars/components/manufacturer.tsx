'use client';
import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

import SelectWithActions from '@/components/common/select-with-actions';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useDeleteCarManufacturer } from '@/features/cars/apis/delete-manufacturer';
import { useGetCarManufacturers } from '@/features/cars/apis/get-manufacturers';
import AddManufacturerDialog from '@/features/cars/components/add-manufacturer-dialog';
import type { ICarsFormValues } from '@/features/cars/types';

const CarManufacturerDropDown = () => {
  const tCars = useTranslations('cars');
  const t = useTranslations('cars.manufacturer');
  const { control } = useFormContext<ICarsFormValues>();

  const [open, setOpen] = useState(false);
  const [addManufacturerDialogOpen, setAddManufacturerDialogOpen] = useState(false);

  const {
    carManufacturers,
    isGetCarManufacturersPending,
    isGetCarManufacturersFetchingNextPage,
    hasGetCarManufacturersNextPage,
    fetchNextCarManufacturerPage,
  } = useGetCarManufacturers();

  const { deleteCarManufacturerMutation, isDeleteCarManufacturerPending } =
    useDeleteCarManufacturer();

  const items =
    carManufacturers
      .filter((manufacturer) => manufacturer?.id && manufacturer?.name)
      .map((manufacturer) => ({
        id: manufacturer?.id?.toString(),
        name: manufacturer?.name,
      })) ?? [];

  const handleLoadMore = useCallback(() => {
    if (hasGetCarManufacturersNextPage && !isGetCarManufacturersFetchingNextPage) {
      fetchNextCarManufacturerPage();
    }
  }, [
    hasGetCarManufacturersNextPage,
    isGetCarManufacturersFetchingNextPage,
    fetchNextCarManufacturerPage,
  ]);

  const handleDelete = (id: string | undefined) => {
    if (!id) {
      return;
    }
    deleteCarManufacturerMutation(id);
  };

  return (
    <FormField
      control={control}
      name="manufacturer"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{tCars('fields.manufacturer')}</FormLabel>
          <FormControl>
            <SelectWithActions
              open={open}
              setOpen={setOpen}
              value={field.value}
              handleSelect={field.onChange}
              handleDelete={handleDelete}
              showSearch={false}
              items={items}
              handleLoadMore={handleLoadMore}
              hasGetItemsNextPage={hasGetCarManufacturersNextPage}
              isGetItemsFetchingNextPage={isGetCarManufacturersFetchingNextPage}
              isGetItemsPending={isGetCarManufacturersPending}
              deletable
              canAddItem
              isDeletePending={isDeleteCarManufacturerPending}
              setAddDialogOpen={setAddManufacturerDialogOpen}
              addDialog={
                <AddManufacturerDialog
                  open={addManufacturerDialogOpen}
                  onOpenChange={setAddManufacturerDialogOpen}
                />
              }
              addButtonLabel={t('add-button')}
              searchPlaceholder={t('search-placeholder')}
              emptyMessage={t('empty-message')}
              placeholder={t('placeholder')}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default CarManufacturerDropDown;
