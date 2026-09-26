'use client';
import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';

import SelectWithActions from '@/components/common/select-with-actions';
import { useDeleteTireModel } from '@/features/cars/apis/delete-tire-model';
import { useGetTireModels } from '@/features/cars/apis/get-tire-models';
import AddTireModelDialog from '@/features/cars/components/add-tire-model-dialog';

interface TireModelDropdownProps {
  value?: string;
  onChange: (value: string | undefined) => void;
}

const TireModelDropdown = ({ value, onChange }: TireModelDropdownProps) => {
  const t = useTranslations('cars.tire-model');

  const [open, setOpen] = useState(false);
  const [addTireModelDialogOpen, setAddTireModelDialogOpen] = useState(false);

  const {
    tireModels,
    isGetTireModelsPending,
    isGetTireModelsFetchingNextPage,
    hasGetTireModelsNextPage,
    fetchNextTireModelPage,
  } = useGetTireModels();

  const { deleteTireModelMutation, isDeleteTireModelPending } = useDeleteTireModel();

  const items =
    tireModels
      .filter((model) => model?.id && model?.name)
      .map((model) => ({
        id: model?.id?.toString(),
        name: model?.name,
      })) ?? [];

  const handleLoadMore = useCallback(() => {
    if (hasGetTireModelsNextPage && !isGetTireModelsFetchingNextPage) {
      fetchNextTireModelPage();
    }
  }, [hasGetTireModelsNextPage, isGetTireModelsFetchingNextPage, fetchNextTireModelPage]);

  const handleDelete = (id: string | undefined) => {
    if (!id) {
      return;
    }
    deleteTireModelMutation(id);
  };

  return (
    <SelectWithActions
      open={open}
      setOpen={setOpen}
      value={value}
      handleSelect={onChange}
      handleDelete={handleDelete}
      showSearch={false}
      items={items}
      handleLoadMore={handleLoadMore}
      hasGetItemsNextPage={hasGetTireModelsNextPage}
      isGetItemsFetchingNextPage={isGetTireModelsFetchingNextPage}
      isGetItemsPending={isGetTireModelsPending}
      deletable
      canAddItem
      isDeletePending={isDeleteTireModelPending}
      setAddDialogOpen={setAddTireModelDialogOpen}
      addDialog={
        <AddTireModelDialog
          open={addTireModelDialogOpen}
          onOpenChange={setAddTireModelDialogOpen}
        />
      }
      addButtonLabel={t('add-button')}
      searchPlaceholder={t('search-placeholder')}
      emptyMessage={t('empty-message')}
      placeholder={t('placeholder')}
    />
  );
};

export default TireModelDropdown;
