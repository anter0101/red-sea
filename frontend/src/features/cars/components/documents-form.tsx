'use client';

import { useTranslations } from 'next-intl';
import { Trash } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Dropzone, DropzoneEmptyState } from '@/components/ui/dropzone';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import type { ICar } from '@/types';

interface DocumentsFormProps {
  onNext: () => void;
  onPrevious: () => void;
  carId: number | null;
  car?: ICar;
}

interface DocumentsFormValues {
  licenseImage?: File;
  taxCardImage?: File;
  otherFiles?: File;
}

const DocumentsForm = ({ onNext, onPrevious, carId, car }: DocumentsFormProps) => {
  const t = useTranslations('cars');

  const form = useForm<DocumentsFormValues>({
    defaultValues: {
      licenseImage: undefined,
      taxCardImage: undefined,
      otherFiles: undefined,
    },
  });

  const onSubmit = (data: DocumentsFormValues) => {
    console.log('Documents form data:', data);
    // TODO: Implement file upload API
    onNext();
  };

  type DocumentFieldName = 'licenseImage' | 'taxCardImage' | 'otherFiles';

  const fieldsConfig: Array<{ name: DocumentFieldName; labelKey: string }> = [
    { name: 'licenseImage', labelKey: 'documents.license-image' },
    { name: 'taxCardImage', labelKey: 'documents.tax-card-image' },
    { name: 'otherFiles', labelKey: 'documents.other-files' },
  ];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
        {t('documents.title')}
        {car?.code && <span className="text-gray-500 text-lg ms-2">: {car.code}</span>}
      </h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {fieldsConfig.map(({ name, labelKey }) => (
            <FormField
              key={name}
              control={form.control}
              name={name}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t(labelKey)}</FormLabel>
                  <FormControl>
                    <div>
                      {!field.value && (
                        <Dropzone
                          accept={{ 'image/*': [], 'application/pdf': [] }}
                          onDrop={(accepted) => {
                            const file = accepted?.[0];
                            if (file) {
                              field.onChange(file);
                            }
                          }}
                          maxFiles={1}
                          className="w-full border-dashed"
                        >
                          <DropzoneEmptyState />
                        </Dropzone>
                      )}
                      {field.value && (
                        <div className="flex items-center justify-between p-2 border rounded-md">
                          <span className="truncate text-sm">{field.value.name}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            type="button"
                            onClick={() => field.onChange(undefined)}
                          >
                            <Trash size={16} />
                          </Button>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}

          <div className="flex flex-row justify-between pt-6">
            <Button type="button" variant="outline" className="px-8" onClick={onPrevious}>
              {t('buttons.previous')}
            </Button>
            <Button type="submit" className="px-8 bg-primary hover:bg-primary/90">
              {t('buttons.save')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default DocumentsForm;
