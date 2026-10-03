'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { ColumnDef } from '@tanstack/react-table';
import { Loader2 } from 'lucide-react';

import { DataTable } from '@/components/main-table/data-table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useGetAttachmentChecks, useRecordAttachmentCheck } from '../api/checks';
import type { IPhysicalAttachment, IPhysicalAttachmentCheck } from '../types';

type Props = {
  attachment: IPhysicalAttachment | null;
  onOpenChange: (open: boolean) => void;
};

function formatDateTime(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-GB', { hour12: false });
}

export default function AttachmentChecklistDialog({ attachment, onOpenChange }: Props) {
  const t = useTranslations('physicalAttachments');
  const open = !!attachment;
  const { data, isLoading } = useGetAttachmentChecks(attachment?.id, open);
  const { mutate: recordCheck, isPending } = useRecordAttachmentCheck();
  const [status, setStatus] = useState<'checked' | 'unchecked'>('unchecked');

  useEffect(() => {
    if (!attachment) return;
    setStatus(attachment.confirmedOk ? 'checked' : 'unchecked');
  }, [attachment]);

  const columns = useMemo<ColumnDef<IPhysicalAttachmentCheck>[]>(
    () => [
      {
        id: 'status',
        header: t('checklist.status'),
        cell: ({ row }) => (row.original.checked ? t('status.checked') : t('status.unchecked')),
      },
      {
        id: 'time',
        header: t('checklist.time'),
        cell: ({ row }) => formatDateTime(row.original.recordedAt),
      },
      {
        id: 'user',
        accessorKey: 'recordedBy',
        header: t('checklist.user'),
      },
    ],
    [t],
  );

  const handleSave = () => {
    if (!attachment) return;
    recordCheck({ id: attachment.id, checked: status === 'checked' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t('checklist.title')}
            {attachment ? ` — ${attachment.name}` : ''}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <Label>{t('checklist.status')}</Label>
          <Select
            value={status}
            onValueChange={(value) => setStatus(value as 'checked' | 'unchecked')}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="checked">{t('status.checked')}</SelectItem>
              <SelectItem value="unchecked">{t('status.unchecked')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold">{t('checklist.history')}</h3>
          {isLoading ? (
            <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('loading')}
            </div>
          ) : (data?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">{t('checklist.empty-history')}</p>
          ) : (
            <DataTable columns={columns} data={data ?? []} />
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('actions.cancel')}
          </Button>
          <Button type="button" onClick={handleSave} disabled={isPending || !attachment}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {t('actions.save-status')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
