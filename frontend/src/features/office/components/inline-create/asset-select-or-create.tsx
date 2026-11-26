'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { UseFormReturn } from 'react-hook-form';

import PlateInput from '@/components/common/plate-input';
import SelectWithActions from '@/components/common/select-with-actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatPlateLettersForApi } from '@/lib/plate-letters';

const PLATE_LETTERS_LENGTH = 3;
const PLATE_NUMBER_LENGTH = 4;

export interface CreateField {
  name: string;
  label: string;
  /** 'plate-letters' / 'plate-number' render RTL plate boxes; anything else is an <input> type. */
  type?: 'plate-letters' | 'plate-number' | 'date' | 'text';
}

interface AssetSelectOrCreateProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
  label: string;
  required?: boolean;
  isNolon: boolean;
  idField: string;
  inlineField: string;
  items: { id: string; name: string }[];
  createFields: CreateField[];
}

export default function AssetSelectOrCreate({
  form,
  label,
  required,
  isNolon,
  idField,
  inlineField,
  items,
  createFields,
}: AssetSelectOrCreateProps) {
  const t = useTranslations('office');
  const [open, setOpen] = useState(false);

  const SelectPanel = (
    <SelectWithActions
      open={open}
      setOpen={setOpen}
      value={form.watch(idField)}
      items={items}
      handleSelect={(v) => {
        form.setValue(idField, v ?? '');
        form.setValue(inlineField, undefined);
      }}
      handleLoadMore={() => {}}
      showSearch
      canAddItem={false}
      placeholder={t('form.selectPlaceholder')}
    />
  );

  if (!isNolon) {
    return (
      <div className="flex flex-col gap-1">
        <Label>
          {label}
          {required && <span className="text-destructive mr-1">*</span>}
        </Label>
        {SelectPanel}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <Label>{label}</Label>
      <Tabs
        defaultValue="select"
        onValueChange={(tab) => {
          if (tab === 'select') {
            form.setValue(inlineField, undefined);
          } else {
            form.setValue(idField, '');
          }
        }}
      >
        <TabsList>
          <TabsTrigger value="select">{t('tabs.select')}</TabsTrigger>
          <TabsTrigger value="create">{t('tabs.create')}</TabsTrigger>
        </TabsList>
        <TabsContent value="select">{SelectPanel}</TabsContent>
        <TabsContent value="create">
          <div className="grid grid-cols-2 gap-3">
            {createFields.map(({ name, label: fieldLabel, type }) => {
              const path = `${inlineField}.${name}`;
              const isPlate = type === 'plate-letters' || type === 'plate-number';
              return (
                <div key={name} className="flex flex-col gap-1">
                  <Label>{fieldLabel}</Label>
                  {isPlate ? (
                    <PlateInput
                      value={form.watch(path) ?? ''}
                      onChange={(v) =>
                        form.setValue(
                          path,
                          type === 'plate-letters' ? formatPlateLettersForApi(v) : v,
                          { shouldValidate: true },
                        )
                      }
                      length={type === 'plate-letters' ? PLATE_LETTERS_LENGTH : PLATE_NUMBER_LENGTH}
                      type={type === 'plate-letters' ? 'letters' : 'numbers'}
                      dir="rtl"
                    />
                  ) : (
                    <Input type={type ?? 'text'} {...form.register(path)} />
                  )}
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
