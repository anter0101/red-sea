'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

import SelectWithActions from '@/components/common/select-with-actions';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useDeleteCarModel } from '@/features/cars/apis/delete-model';
import { useGetCarModels } from '@/features/cars/apis/get-models';
import AddModelDialog from '@/features/cars/components/add-model-dialog';
import type { ICarsFormValues } from '@/features/cars/types';

const CarModelDropDown = () => {
  const tCars = useTranslations('cars');
  const t = useTranslations('cars.model');
  const { control, watch, setValue } = useFormContext<ICarsFormValues>();

  const [open, setOpen] = useState(false);
  const [addModelDialogOpen, setAddModelDialogOpen] = useState(false);

  // Watch the manufacturer field to enable/disable the model dropdown
  const manufacturerId = watch('manufacturer');
  const prevManufacturerId = useRef(manufacturerId);

  // Reset model when manufacturer changes
  useEffect(() => {
    if (prevManufacturerId.current && prevManufacturerId.current !== manufacturerId) {
      setValue('model', '');
    }
    prevManufacturerId.current = manufacturerId;
  }, [manufacturerId, setValue]);

  const {
    carModels,
    isGetCarModelsPending,
    isGetCarModelsFetchingNextPage,
    hasGetCarModelsNextPage,
    fetchNextCarModelPage,
  } = useGetCarModels(manufacturerId);

  const { deleteCarModelMutation, isDeleteCarModelPending } = useDeleteCarModel();

  const items =
    carModels
      .filter((model) => model?.id && model?.name)
      .map((model) => ({
        id: model?.id?.toString(),
        name: model?.name,
      })) ?? [];

  const handleLoadMore = useCallback(() => {
    if (hasGetCarModelsNextPage && !isGetCarModelsFetchingNextPage) {
      fetchNextCarModelPage();
    }
  }, [hasGetCarModelsNextPage, isGetCarModelsFetchingNextPage, fetchNextCarModelPage]);

  const handleDelete = (id: string | undefined) => {
    if (!id) {
      return;
    }
    deleteCarModelMutation(id);
  };

  // Check if manufacturer is selected
  const isManufacturerSelected = !!manufacturerId;

  return (
    <FormField
      control={control}
      name="model"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{tCars('fields.model')}</FormLabel>
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
              hasGetItemsNextPage={hasGetCarModelsNextPage}
              isGetItemsFetchingNextPage={isGetCarModelsFetchingNextPage}
              isGetItemsPending={isGetCarModelsPending}
              deletable
              canAddItem
              isDeletePending={isDeleteCarModelPending}
              setAddDialogOpen={setAddModelDialogOpen}
              disabled={!isManufacturerSelected}
              addButtonDisabled={!isManufacturerSelected}
              addButtonDisabledMessage={t('select-manufacturer-first')}
              addDialog={
                isManufacturerSelected ? (
                  <AddModelDialog
                    open={addModelDialogOpen}
                    onOpenChange={setAddModelDialogOpen}
                    manufacturerId={manufacturerId}
                  />
                ) : null
              }
              addButtonLabel={t('add-button')}
              searchPlaceholder={t('search-placeholder')}
              emptyMessage={
                isManufacturerSelected ? t('empty-message') : t('select-manufacturer-first')
              }
              placeholder={
                isManufacturerSelected ? t('placeholder') : t('select-manufacturer-first')
              }
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default CarModelDropDown;
