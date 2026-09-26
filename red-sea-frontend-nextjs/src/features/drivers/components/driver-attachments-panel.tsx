'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';
import { Loader2, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dropzone, DropzoneEmptyState } from '@/components/ui/dropzone';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreate } from '@/hooks/base/create';
import { uploadFile } from '@/hooks/uploadS3/upload-file';
import queryClient from '@/lib/query-client';
import { UserAttachmentType } from '@/enums/users/user-attachment-type';

export type DriverAttachment = {
  id: number;
  url: string;
  type: string;
  notes?: string;
  documentExpiryDate?: string | Date;
};

const ATTACHMENT_TYPES = Object.values(UserAttachmentType);

type DriverAttachmentsPanelProps = {
  userId: number;
  driverId: number;
  attachments?: DriverAttachment[];
};

export default function DriverAttachmentsPanel({
  userId,
  driverId,
  attachments = [],
}: DriverAttachmentsPanelProps) {
  const t = useTranslations('drivers');
  const [type, setType] = useState<string>(UserAttachmentType.DRIVERLICENSE);
  const [file, setFile] = useState<File | undefined>();
  const [isUploading, setIsUploading] = useState(false);

  const { mutate: createAttachment, isPending } = useCreate<
    unknown,
    Error,
    { userId: number; url: string; type: string }
  >({
    endPoint: '/api/user-attachments',
    queryKey: ['drivers', String(driverId)],
    onSuccess: () => {
      toast.success(t('attachments.upload-success'));
      setFile(undefined);
      queryClient.invalidateQueries({ queryKey: ['drivers', String(driverId)] });
    },
  });

  const handleUpload = async () => {
    if (!file) {
      toast.error(t('attachments.file-required'));
      return;
    }
    setIsUploading(true);
    try {
      const url = await uploadFile(file);
      createAttachment({ userId, url, type });
    } catch {
      toast.error(t('attachments.upload-error'));
    } finally {
      setIsUploading(false);
    }
  };

  const typeLabel = (value: string) =>
    t(`attachments.types.${value}` as 'attachments.types.DRIVERLICENSE');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">{t('attachments.title')}</h2>
        {attachments.length === 0 ? (
          <p className="text-muted-foreground text-sm">{t('attachments.empty')}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {attachments.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-2 border-b border-border py-2"
              >
                <span className="text-sm font-medium">{typeLabel(item.type)}</span>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary underline"
                >
                  {t('attachments.view')}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-3 max-w-md">
        <h3 className="text-base font-medium">{t('attachments.add')}</h3>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder={t('attachments.select-type')} />
          </SelectTrigger>
          <SelectContent>
            {ATTACHMENT_TYPES.map((value) => (
              <SelectItem key={value} value={value}>
                {typeLabel(value)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Dropzone
          accept={{ 'image/*': [], 'application/pdf': [] }}
          maxFiles={1}
          onDrop={(files) => setFile(files[0])}
        >
          <DropzoneEmptyState />
          {file ? <p className="text-sm mt-2">{file.name}</p> : null}
        </Dropzone>

        <Button
          type="button"
          onClick={handleUpload}
          disabled={isUploading || isPending || !file}
          className="w-fit"
        >
          {isUploading || isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          {t('attachments.upload')}
        </Button>
      </div>
    </div>
  );
}
