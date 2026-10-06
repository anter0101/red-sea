'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';
import { isAxiosError } from 'axios';
import { Loader2, Trash } from 'lucide-react';
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
import { useCreate } from '@/hooks/base/create';
import { uploadFile } from '@/hooks/uploadS3/upload-file';
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

type DocumentFieldName = 'licenseImage' | 'taxCardImage' | 'otherFiles';

const fieldsConfig: Array<{ name: DocumentFieldName; labelKey: string; type: string }> = [
  { name: 'licenseImage', labelKey: 'documents.license-image', type: 'LICENSE' },
  { name: 'taxCardImage', labelKey: 'documents.tax-card-image', type: 'TAX_ID' },
  { name: 'otherFiles', labelKey: 'documents.other-files', type: 'OTHER' },
];

const DocumentsForm = ({ onNext, onPrevious, carId, car }: DocumentsFormProps) => {
  const t = useTranslations('cars');
  const [isUploading, setIsUploading] = useState(false);
  const { mutateAsync: createAttachment, isPending } = useCreate<
    unknown,
    Error,
    { carId: number; type: string; url: string }
  >({
    endPoint: '/api/car-attachments',
    queryKey: ['cars', String(carId ?? '')],
    onSuccess: () => undefined,
  });

  const form = useForm<DocumentsFormValues>({
    defaultValues: {
      licenseImage: undefined,
      taxCardImage: undefined,
      otherFiles: undefined,
    },
  });

  const onSubmit = async (data: DocumentsFormValues) => {
    const selected = fieldsConfig.flatMap((field) => {
      const file = data[field.name];
      return file ? [{ file, type: field.type }] : [];
    });

    if (selected.length === 0) {
      onNext();
      return;
    }

    if (!carId) {
      toast.error(t('documents.upload-error'));
      return;
    }

    setIsUploading(true);
    try {
      for (const item of selected) {
        const url = await uploadFile(item.file);
        await createAttachment({ carId, type: item.type, url });
      }
      onNext();
    } catch (error) {
      if (!isAxiosError(error)) {
        toast.error(t('documents.upload-error'));
      }
    } finally {
      setIsUploading(false);
    }
  };

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
            <Button
              type="submit"
              className="px-8 bg-primary hover:bg-primary/90"
              disabled={isUploading || isPending}
            >
              {isUploading || isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {t('buttons.save')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default DocumentsForm;
