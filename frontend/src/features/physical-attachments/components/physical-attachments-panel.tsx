'use client';

import { useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { ColumnDef } from '@tanstack/react-table';
import { Loader2, Pencil, Plus, Printer, Trash2 } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

import { DataTable } from '@/components/main-table/data-table';
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
import { useGetCarById } from '@/features/cars/apis/get-by-id';
import { useGetTrailerById } from '@/features/trailers/apis/get-by-id';
import { EMPTY_DISPLAY } from '@/lib/empty-display';
import { formatPlateLettersForDisplay } from '@/lib/plate-letters';

import { useDeletePhysicalAttachment } from '../api/delete';
import { useGetPhysicalAttachments } from '../api/get-list';
import type { IPhysicalAttachment, VehicleType } from '../types';

import AttachmentChecklistDialog from './attachment-checklist-dialog';
import PhysicalAttachmentFormDialog from './physical-attachment-form-dialog';
import { PrintableCheck } from './printable-check';

type Props = {
  vehicleType: VehicleType;
  vehicleId: number;
};

function formatDate(value?: string | null) {
  if (!value) return '—';
  return value.slice(0, 10);
}

function formatDateTime(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 16).replace('T', ' ');
  return date.toLocaleString('en-GB', { hour12: false });
}

function formatPrice(value?: number | string | null) {
  if (value == null || value === '') return '—';
  const num = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(num)) return '—';
  return num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function formatPlate(vehicle?: { plateNumber?: string; plateLetters?: string }) {
  const letters = formatPlateLettersForDisplay(vehicle?.plateLetters);
  return [vehicle?.plateNumber?.trim(), letters === EMPTY_DISPLAY ? '' : letters].filter(Boolean).join(' ');
}

export default function PhysicalAttachmentsPanel({ vehicleType, vehicleId }: Props) {
  const t = useTranslations('physicalAttachments');
  const printRef = useRef<HTMLDivElement>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<IPhysicalAttachment | null>(null);
  const [pendingDelete, setPendingDelete] = useState<IPhysicalAttachment | null>(null);
  const [checking, setChecking] = useState<IPhysicalAttachment | null>(null);

  const { data, isLoading, isError } = useGetPhysicalAttachments(vehicleType, vehicleId);
  const { mutate: deleteAttachment, isPending: isDeleting } = useDeletePhysicalAttachment();
  const { car } = useGetCarById(vehicleType === 'car' ? vehicleId : null);
  const { trailer } = useGetTrailerById(vehicleType === 'trailer' ? vehicleId : null);

  const items = data?.data ?? [];
  const vehicle = vehicleType === 'car' ? car : trailer;
  const axles = vehicle?.axles ?? [];
  const axleCount = vehicle?.axleCount || axles.length;

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const columns = useMemo<ColumnDef<IPhysicalAttachment>[]>(
    () => [
      {
        id: 'name',
        accessorKey: 'name',
        header: t('columns.name'),
      },
      {
        id: 'date',
        accessorKey: 'date',
        header: t('columns.date'),
        cell: ({ row }) => formatDate(row.original.date),
      },
      {
        id: 'status',
        header: t('columns.status'),
        cell: ({ row }) => (row.original.confirmedOk ? t('status.checked') : t('status.unchecked')),
      },
      {
        id: 'lastCheck',
        header: t('columns.lastCheck'),
        cell: ({ row }) => formatDateTime(row.original.confirmedAt),
      },
      {
        id: 'price',
        accessorKey: 'price',
        header: t('columns.price'),
        cell: ({ row }) => formatPrice(row.original.price),
      },
      {
        id: 'actions',
        header: t('columns.actions'),
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={(event) => {
                event.stopPropagation();
                setEditing(row.original);
                setFormOpen(true);
              }}
            >
              <Pencil className="h-3.5 w-3.5" />
              {t('actions.edit')}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={(event) => {
                event.stopPropagation();
                setPendingDelete(row.original);
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
              {t('actions.delete')}
            </Button>
          </div>
        ),
      },
    ],
    [t],
  );

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deleteAttachment(String(pendingDelete.id), {
      onSettled: () => setPendingDelete(null),
    });
  };

  const printDate = new Date().toLocaleDateString('en-GB');
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: ['طباعة فحص', formatPlate(vehicle) || vehicle?.code, printDate].filter(Boolean).join(' '),
    pageStyle: '@page { size: A4; margin: 12mm; }',
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{t('title')}</h2>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={() => handlePrint()} className="gap-2">
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

      {!isLoading && !isError && (
        <DataTable
          columns={columns}
          data={items}
          pageKey="physical-attachments"
          onRowClick={setChecking}
        />
      )}

      <div className="hidden" aria-hidden>
        <PrintableCheck
          ref={printRef}
          vehicleType={vehicleType}
          vehicleCode={vehicle?.code}
          plate={formatPlate(vehicle)}
          printDate={printDate}
          items={items}
          axles={axles}
          axleCount={axleCount}
          formatDateTime={formatDateTime}
        />
      </div>

      <AttachmentChecklistDialog
        attachment={checking}
        onOpenChange={(open) => !open && setChecking(null)}
      />

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
