'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Trash } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Dropzone, DropzoneEmptyState } from '@/components/ui/dropzone';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { uploadFile } from '@/hooks/uploadS3/upload-file';
import { getApiErrorMessage } from '@/lib/api-error';

import { useCreatePhysicalAttachment } from '../api/create';
import { useUpdatePhysicalAttachment } from '../api/update';
import {
  physicalAttachmentFormSchema,
  type IPhysicalAttachment,
  type PhysicalAttachmentFormValues,
  type VehicleType,
} from '../types';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicleType: VehicleType;
  vehicleId: number;
  attachment?: IPhysicalAttachment | null;
};

function toDateInputValue(value?: string) {
  if (!value) return '';
  return value.slice(0, 10);
}

function parseOptionalPrice(value?: string): number | undefined {
  if (value == null || value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export default function PhysicalAttachmentFormDialog({
  open,
  onOpenChange,
  vehicleType,
  vehicleId,
  attachment,
}: Props) {
  const t = useTranslations('physicalAttachments');
  const tCommon = useTranslations('common.message');
  const isEdit = !!attachment;

  const { mutateAsync: createAttachment, isPending: isCreating } = useCreatePhysicalAttachment();
  const { mutateAsync: updateAttachment, isPending: isUpdating } = useUpdatePhysicalAttachment();
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<PhysicalAttachmentFormValues>({
    resolver: zodResolver(physicalAttachmentFormSchema(t)),
    defaultValues: {
      name: '',
      date: '',
      description: '',
      price: '',
      photo: undefined,
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      name: attachment?.name ?? '',
      date: toDateInputValue(attachment?.date),
      description: attachment?.description ?? '',
      price:
        attachment?.price != null && attachment.price !== ''
          ? String(attachment.price)
          : '',
      photo: attachment?.photoUrl ?? undefined,
    });
  }, [open, attachment, form]);

  const isPending = isCreating || isUpdating || isUploading;

  const onSubmit = async (values: PhysicalAttachmentFormValues) => {
    try {
      setIsUploading(true);
      let photoUrl: string | undefined;
      if (values.photo instanceof File) {
        photoUrl = await uploadFile(values.photo);
      } else if (typeof values.photo === 'string' && values.photo.length > 0) {
        photoUrl = values.photo;
      }

      const price = parseOptionalPrice(values.price);
      const payload = {
        name: values.name,
        date: values.date,
        description: values.description || undefined,
        photoUrl,
        price,
      };

      if (isEdit && attachment) {
        await updateAttachment({
          id: attachment.id,
          data: {
            ...payload,
            photoUrl: photoUrl ?? null,
            price: price ?? null,
          },
        });
      } else {
        await createAttachment({
          ...payload,
          ...(vehicleType === 'car' ? { carId: vehicleId } : { trailerId: vehicleId }),
        });
      }

      onOpenChange(false);
    } catch (error) {
      if (!(error as { response?: unknown })?.response) {
        toast.error(getApiErrorMessage(error, tCommon('on-error')));
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? t('form.edit-title') : t('form.add-title')}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.name')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.date')}</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.price')}</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} step="0.01" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.description')}</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="photo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.photo')}</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      {!field.value && (
                        <Dropzone
                          accept={{ 'image/*': [], 'application/pdf': [] }}
                          onDrop={(accepted) => {
                            const file = accepted?.[0];
                            if (file) field.onChange(file);
                          }}
                          maxFiles={1}
                          className="w-full border-dashed"
                        >
                          <DropzoneEmptyState />
                        </Dropzone>
                      )}
                      {field.value instanceof File && (
                        <div className="flex items-center justify-between rounded-md border p-2">
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
                      {typeof field.value === 'string' && field.value && (
                        <div className="flex items-center justify-between gap-2 rounded-md border p-2">
                          <a
                            href={field.value}
                            target="_blank"
                            rel="noreferrer"
                            className="truncate text-sm text-primary underline"
                          >
                            {t('form.current-photo')}
                          </a>
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

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('actions.cancel')}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? t('actions.saving') : isEdit ? t('actions.update') : t('actions.create')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
