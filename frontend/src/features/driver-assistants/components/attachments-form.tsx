'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';
import { isAxiosError } from 'axios';
import { Loader2, Trash } from 'lucide-react';
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
import { UserAttachmentType } from '@/enums/users/user-attachment-type';
import { useCreate } from '@/hooks/base/create';
import { uploadFile } from '@/hooks/uploadS3/upload-file';
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

const fieldsConfig: Array<{
  name: AttachmentFieldName;
  labelKey: string;
  type: UserAttachmentType;
}> = [
  {
    name: 'drivingLicenseImage',
    labelKey: 'fields.driving-license-image',
    type: UserAttachmentType.DRIVERLICENSE,
  },
  {
    name: 'nationalIdImage',
    labelKey: 'fields.national-id-image',
    type: UserAttachmentType.PERSONALID,
  },
  {
    name: 'criminalRecordCheckImage',
    labelKey: 'fields.criminal-record-check-image',
    type: UserAttachmentType.CREMINALRECORD,
  },
  {
    name: 'securityClearanceImage',
    labelKey: 'fields.security-clearance-image',
    type: UserAttachmentType.SECURITYCLEARANCE,
  },
  {
    name: 'medicalInsuranceImage',
    labelKey: 'fields.medical-insurance-image',
    type: UserAttachmentType.MEDICALINSURANCE,
  },
  {
    name: 'socialInsuranceImage',
    labelKey: 'fields.social-insurance-image',
    type: UserAttachmentType.INSURANCE,
  },
  {
    name: 'militaryServiceStatusImage',
    labelKey: 'fields.military-service-status-image',
    type: UserAttachmentType.MILITITARYSTATUS,
  },
];

export default function DriverAssistantAttachmentsForm({
  onNext,
  onPrevious,
  userId,
}: {
  onNext: () => void;
  onPrevious: () => void;
  userId?: number | null;
}) {
  const t = useTranslations('driverAssistants');
  const [isUploading, setIsUploading] = useState(false);
  const { mutateAsync: createAttachment, isPending } = useCreate<
    unknown,
    Error,
    { userId: number; url: string; type: string }
  >({
    endPoint: '/api/user-attachments',
    queryKey: ['driver-assistants'],
    onSuccess: () => undefined,
  });

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

  const onSubmit = async (data: AttachmentsFormValues) => {
    const selected = fieldsConfig.flatMap((field) => {
      const file = data[field.name];
      return file instanceof File ? [{ file, type: field.type }] : [];
    });

    if (selected.length === 0) {
      onNext();
      return;
    }

    if (!userId) {
      toast.error(t('attachments.upload-error'));
      return;
    }

    setIsUploading(true);
    try {
      for (const item of selected) {
        const url = await uploadFile(item.file);
        await createAttachment({ userId, url, type: item.type });
      }
      onNext();
    } catch (error) {
      if (!isAxiosError(error)) {
        toast.error(t('attachments.upload-error'));
      }
    } finally {
      setIsUploading(false);
    }
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
            <Button type="submit" className="px-8" disabled={isUploading || isPending}>
              {isUploading || isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {t('buttons.next')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
