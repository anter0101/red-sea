'use client';

import { useTranslations } from 'next-intl';
import { Trash } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

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
import { zodResolver } from '@hookform/resolvers/zod';

type AttachmentFieldName =
  | 'drivingLicenseImage'
  | 'nationalIdImage'
  | 'criminalRecordCheckImage'
  | 'securityClearanceImage'
  | 'medicalInsuranceImage'
  | 'socialInsuranceImage'
  | 'militaryServiceStatusImage';

const attachmentsSchema = z.object({
  drivingLicenseImage: z.any().optional(),
  nationalIdImage: z.any().optional(),
  criminalRecordCheckImage: z.any().optional(),
  securityClearanceImage: z.any().optional(),
  medicalInsuranceImage: z.any().optional(),
  socialInsuranceImage: z.any().optional(),
  militaryServiceStatusImage: z.any().optional(),
});

type AttachmentsFormValues = z.infer<typeof attachmentsSchema>;

export default function DriverAssistantAttachmentsForm({
  onNext,
  onPrevious,
}: {
  onNext: () => void;
  onPrevious: () => void;
}) {
  const t = useTranslations('driverAssistants');

  const form = useForm<AttachmentsFormValues>({
    resolver: zodResolver(attachmentsSchema),
    defaultValues: {
      drivingLicenseImage: undefined,
      nationalIdImage: undefined,
      criminalRecordCheckImage: undefined,
      securityClearanceImage: undefined,
      medicalInsuranceImage: undefined,
      socialInsuranceImage: undefined,
      militaryServiceStatusImage: undefined,
    },
  });

  const fieldsConfig: Array<{ name: AttachmentFieldName; labelKey: string }> = [
    { name: 'drivingLicenseImage', labelKey: 'fields.driving-license-image' },
    { name: 'nationalIdImage', labelKey: 'fields.national-id-image' },
    {
      name: 'criminalRecordCheckImage',
      labelKey: 'fields.criminal-record-check-image',
    },
    {
      name: 'securityClearanceImage',
      labelKey: 'fields.security-clearance-image',
    },
    {
      name: 'medicalInsuranceImage',
      labelKey: 'fields.medical-insurance-image',
    },
    { name: 'socialInsuranceImage', labelKey: 'fields.social-insurance-image' },
    {
      name: 'militaryServiceStatusImage',
      labelKey: 'fields.military-service-status-image',
    },
  ];

  const onSubmit = (data: AttachmentsFormValues) => {
    // Future: hook API for driver assistant attachments here
    void data;
    onNext();
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">{t('driver-files')}</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {fieldsConfig.map(({ name, labelKey }) => (
            <FormField
              key={name}
              control={form.control}
              name={name as keyof AttachmentsFormValues}
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
            <Button type="submit" className="px-8">
              {t('buttons.next')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
