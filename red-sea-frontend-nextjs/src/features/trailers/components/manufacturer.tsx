'use client';
import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

import SelectWithActions from '@/components/common/select-with-actions';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useDeleteTrailerManufacturer } from '@/features/trailers/apis/delete-manufacturer';
import { useGetTrailerManufacturers } from '@/features/trailers/apis/get-manufacturers';
import AddManufacturerDialog from '@/features/trailers/components/add-manufacturer-dialog';
import type { ITrailersFormValues } from '@/features/trailers/types';

const TrailerManufacturerDropDown = () => {
  const tTrailers = useTranslations('trailers');
  const t = useTranslations('trailers.manufacturer');
  const { control } = useFormContext<ITrailersFormValues>();

  const [open, setOpen] = useState(false);
  const [addManufacturerDialogOpen, setAddManufacturerDialogOpen] = useState(false);

  const {
    trailerManufacturers,
    isGetTrailerManufacturersPending,
    isGetTrailerManufacturersFetchingNextPage,
    hasGetTrailerManufacturersNextPage,
    fetchNextTrailerManufacturerPage,
  } = useGetTrailerManufacturers();

  const { deleteTrailerManufacturerMutation, isDeleteTrailerManufacturerPending } =
    useDeleteTrailerManufacturer();

  const items =
    trailerManufacturers
      .filter((manufacturer) => manufacturer?.id && manufacturer?.name)
      .map((manufacturer) => ({
        id: manufacturer?.id?.toString(),
        name: manufacturer?.name,
      })) ?? [];

  const handleLoadMore = useCallback(() => {
    if (hasGetTrailerManufacturersNextPage && !isGetTrailerManufacturersFetchingNextPage) {
      fetchNextTrailerManufacturerPage();
    }
  }, [
    hasGetTrailerManufacturersNextPage,
    isGetTrailerManufacturersFetchingNextPage,
    fetchNextTrailerManufacturerPage,
  ]);

  const handleDelete = (id: string | undefined) => {
    if (!id) {
      return;
    }
    deleteTrailerManufacturerMutation(id);
  };

  return (
    <FormField
      control={control}
      name="manufacturer"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{tTrailers('fields.manufacturer')}</FormLabel>
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
              hasGetItemsNextPage={hasGetTrailerManufacturersNextPage}
              isGetItemsFetchingNextPage={isGetTrailerManufacturersFetchingNextPage}
              isGetItemsPending={isGetTrailerManufacturersPending}
              deletable
              canAddItem
              isDeletePending={isDeleteTrailerManufacturerPending}
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

export default TrailerManufacturerDropDown;
