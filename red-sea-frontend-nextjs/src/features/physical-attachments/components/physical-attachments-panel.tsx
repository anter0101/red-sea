'use client';

import { useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { CheckCircle2, Loader2, Pencil, Plus, Printer, Trash2 } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

import { useDeletePhysicalAttachment } from '../api/delete';
import { useGetPhysicalAttachments } from '../api/get-list';
import { useUpdatePhysicalAttachment } from '../api/update';
import type { IPhysicalAttachment, VehicleType } from '../types';

import PhysicalAttachmentFormDialog from './physical-attachment-form-dialog';

type Props = {
  vehicleType: VehicleType;
  vehicleId: number;
};

function formatDate(value?: string | null) {
  if (!value) return '—';
  return value.slice(0, 10);
}

function formatPrice(value?: number | string | null) {
  if (value == null || value === '') return null;
  const num = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(num)) return null;
  return num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export default function PhysicalAttachmentsPanel({ vehicleType, vehicleId }: Props) {
  const t = useTranslations('physicalAttachments');
  const { data: session } = useSession();
  const printRef = useRef<HTMLDivElement>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<IPhysicalAttachment | null>(null);
  const [pendingDelete, setPendingDelete] = useState<IPhysicalAttachment | null>(null);

  const { data, isLoading, isError } = useGetPhysicalAttachments(vehicleType, vehicleId);
  const { mutate: deleteAttachment, isPending: isDeleting } = useDeletePhysicalAttachment();
  const { mutate: updateAttachment, isPending: isUpdating } = useUpdatePhysicalAttachment();

  const items = data?.data ?? [];

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (item: IPhysicalAttachment) => {
    setEditing(item);
    setFormOpen(true);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deleteAttachment(String(pendingDelete.id), {
      onSettled: () => setPendingDelete(null),
    });
  };

  const confirmOk = (item: IPhysicalAttachment) => {
    updateAttachment({
      id: item.id,
      data: {
        confirmedOk: true,
        confirmedBy: session?.user?.email ?? session?.user?.name ?? 'user',
        confirmedAt: new Date().toISOString(),
      },
    });
  };

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const win = window.open('', '_blank', 'noopener,noreferrer,width=900,height=700');
    if (!win) return;
    win.document.write(`<!doctype html><html dir="rtl"><head><title>${t('print.title')}</title>
      <style>
        body{font-family:sans-serif;padding:24px}
        h1{font-size:18px;margin-bottom:16px}
        table{width:100%;border-collapse:collapse}
        th,td{border:1px solid #ccc;padding:8px;text-align:right;font-size:13px}
        th{background:#f5f5f5}
      </style></head><body>${content.innerHTML}</body></html>`);
    win.document.close();
    win.focus();
    win.print();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{t('title')}</h2>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrint}
            disabled={items.length === 0}
            className="gap-2"
          >
            <Printer className="h-4 w-4" />
            {t('actions.print')}
          </Button>
          <Button type="button" onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            {t('actions.add')}
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          {t('loading')}
        </div>
      )}

      {isError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {t('error')}
        </div>
      )}

      {!isLoading && !isError && items.length === 0 && (
        <div className="rounded-md border border-dashed p-10 text-center text-sm text-muted-foreground">
          {t('empty')}
        </div>
      )}

      {!isLoading && !isError && items.length > 0 && (
        <ul className="divide-y rounded-md border bg-background">
          {items.map((item) => (
            <li key={item.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
                {item.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.photoUrl}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="px-2 text-center text-xs text-muted-foreground">
                    {t('no-photo')}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">{item.name}</p>
                <p className="text-sm text-muted-foreground">{formatDate(item.date)}</p>
                {formatPrice(item.price) != null ? (
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {t('fields.price')}: {formatPrice(item.price)}
                  </p>
                ) : null}
                {item.description ? (
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                ) : null}
                {item.confirmedOk ? (
                  <p className="mt-1 text-sm text-green-700">
                    {t('confirmed')} — {item.confirmedBy ?? ''} {formatDate(item.confirmedAt)}
                  </p>
                ) : null}
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {!item.confirmedOk && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => confirmOk(item)}
                    disabled={isUpdating}
                    className="gap-1"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {t('actions.confirm-ok')}
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => openEdit(item)}
                  className="gap-1"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  {t('actions.edit')}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setPendingDelete(item)}
                  className="gap-1 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t('actions.delete')}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div ref={printRef} className="hidden">
        <h1>{t('print.title')}</h1>
        <table>
          <thead>
            <tr>
              <th>{t('fields.name')}</th>
              <th>{t('fields.date')}</th>
              <th>{t('fields.price')}</th>
              <th>{t('fields.description')}</th>
              <th>{t('print.status')}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{formatDate(item.date)}</td>
                <td>{formatPrice(item.price) ?? '—'}</td>
                <td>{item.description ?? '—'}</td>
                <td>{item.confirmedOk ? t('confirmed') : t('print.pending')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PhysicalAttachmentFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        vehicleType={vehicleType}
        vehicleId={vehicleId}
        attachment={editing}
      />

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('delete.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('delete.description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? t('actions.saving') : t('actions.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
