'use client';

import { useState } from 'react';

import { useTranslations } from 'next-intl';
import type { UseFormReturn } from 'react-hook-form';

import SelectWithActions from '@/components/common/select-with-actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface CreateField {
  name: string;
  label: string;
  type?: string;
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
          if (tab === 'select') form.setValue(inlineField, undefined);
          else form.setValue(idField, '');
        }}
      >
        <TabsList>
          <TabsTrigger value="select">{t('tabs.select')}</TabsTrigger>
          <TabsTrigger value="create">{t('tabs.create')}</TabsTrigger>
        </TabsList>
        <TabsContent value="select">{SelectPanel}</TabsContent>
        <TabsContent value="create">
          <div className="grid grid-cols-2 gap-3">
            {createFields.map(({ name, label: fieldLabel, type }) => (
              <div key={name} className="flex flex-col gap-1">
                <Label>{fieldLabel}</Label>
                <Input type={type ?? 'text'} {...form.register(`${inlineField}.${name}`)} />
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
