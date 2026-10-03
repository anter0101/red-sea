'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { ColumnDef } from '@tanstack/react-table';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';

import type { TirePositionKey } from '@/components/common/axle-overview';
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

import { useDeleteMaintenance } from '../api/delete';
import { useGetMaintenances, type IMaintenance, type MaintenanceType } from '../api/get-list';

import MaintenanceFormDialog from './maintenance-form-dialog';

type Props = {
  carId?: number;
  trailerId?: number;
};

const POSITION_LABELS: Record<TirePositionKey, string> = {
  leftOuter: 'positions.left-outer',
  leftInner: 'positions.left-inner',
  rightOuter: 'positions.right-outer',
  rightInner: 'positions.right-inner',
};

function formatDate(value?: string) {
  if (!value) return '—';
  return value.slice(0, 10);
}

function formatCost(value?: number | string | null) {
  if (value == null || value === '') return '—';
  const num = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(num)) return '—';
  return num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export default function MaintenancePanel({ carId, trailerId }: Props) {
  const t = useTranslations('maintenance');
  const vehicleType = carId != null ? 'car' : 'trailer';
  const vehicleId = carId ?? trailerId ?? 0;

  const { data, isLoading, isError } = useGetMaintenances({ carId, trailerId });
  const { mutate: deleteMaintenance, isPending: isDeleting } = useDeleteMaintenance();
  const { car } = useGetCarById(carId ?? null);
  const { trailer } = useGetTrailerById(trailerId ?? null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<IMaintenance | null>(null);
  const [pendingDelete, setPendingDelete] = useState<IMaintenance | null>(null);

  const items = data?.data ?? [];
  const vehicle = vehicleType === 'car' ? car : trailer;
  const axles = vehicle?.axles ?? [];
  const axleCount = vehicle?.axleCount || axles.length;

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const columns = useMemo<ColumnDef<IMaintenance>[]>(
    () => [
      {
        id: 'date',
        accessorKey: 'maintenanceDate',
        header: t('columns.date'),
        cell: ({ row }) => formatDate(row.original.maintenanceDate),
      },
      {
        id: 'type',
        accessorKey: 'type',
        header: t('columns.type'),
        cell: ({ row }) => {
          const type = row.original.type;
          return type ? t(`types.${type as MaintenanceType}`) : '—';
        },
      },
      {
        id: 'description',
        accessorKey: 'description',
        header: t('columns.description'),
      },
      {
        id: 'cost',
        accessorKey: 'cost',
        header: t('columns.cost'),
        cell: ({ row }) => formatCost(row.original.cost),
      },
      {
        id: 'tires',
        header: t('columns.tires'),
        cell: ({ row }) => {
          const tires = row.original.tireSelections ?? [];
          if (tires.length === 0) return '—';
          return tires
            .map(
              (tire) =>
                `${t('axle-short', { number: tire.axleNumber })} ${t(POSITION_LABELS[tire.position])}`,
            )
            .join('، ');
        },
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
              onClick={() => {
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
              onClick={() => setPendingDelete(row.original)}
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
    deleteMaintenance(String(pendingDelete.id), {
      onSettled: () => setPendingDelete(null),
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{t('title')}</h2>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>
        <Button type="button" onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          {t('actions.add')}
        </Button>
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

      {!isLoading && !isError && <DataTable columns={columns} data={items} pageKey="maintenance" />}

      <MaintenanceFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        vehicleType={vehicleType}
        vehicleId={vehicleId}
        axles={axles}
        axleCount={axleCount}
        editing={editing}
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
              {t('actions.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
