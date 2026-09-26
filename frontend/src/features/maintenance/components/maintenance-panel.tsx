'use client';

import { useState } from 'react';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';

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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { useCreateMaintenance } from '../api/create';
import { useDeleteMaintenance } from '../api/delete';
import { useGetMaintenances, type IMaintenance } from '../api/get-list';
import { useUpdateMaintenance } from '../api/update';

type Props = {
  carId?: number;
  trailerId?: number;
};

function formatDate(value?: string) {
  if (!value) return '—';
  return value.slice(0, 10);
}

function formatCost(value?: number | string | null) {
  if (value == null || value === '') return null;
  const num = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(num)) return null;
  return num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export default function MaintenancePanel({ carId, trailerId }: Props) {
  const { data, isLoading, isError } = useGetMaintenances({ carId, trailerId });
  const { mutate: createMaintenance, isPending: isCreating } = useCreateMaintenance();
  const { mutate: updateMaintenance, isPending: isUpdating } = useUpdateMaintenance();
  const { mutate: deleteMaintenance, isPending: isDeleting } = useDeleteMaintenance();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<IMaintenance | null>(null);
  const [pendingDelete, setPendingDelete] = useState<IMaintenance | null>(null);
  const [maintenanceDate, setMaintenanceDate] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');

  const items = data?.data ?? [];

  const openCreate = () => {
    setEditing(null);
    setMaintenanceDate(new Date().toISOString().slice(0, 10));
    setDescription('');
    setCost('');
    setNotes('');
    setFormOpen(true);
  };

  const openEdit = (item: IMaintenance) => {
    setEditing(item);
    setMaintenanceDate(formatDate(item.maintenanceDate));
    setDescription(item.description ?? '');
    setCost(item.cost != null ? String(item.cost) : '');
    setNotes(item.notes ?? '');
    setFormOpen(true);
  };

  const handleSubmit = () => {
    if (!maintenanceDate || !description.trim()) return;

    const payload = {
      maintenanceDate,
      description: description.trim(),
      cost: cost ? Number(cost) : undefined,
      notes: notes.trim() || undefined,
      ...(carId != null ? { carId } : { trailerId }),
    };

    if (editing) {
      updateMaintenance(
        { id: editing.id, data: payload },
        { onSuccess: () => setFormOpen(false) },
      );
    } else {
      createMaintenance(payload, { onSuccess: () => setFormOpen(false) });
    }
  };

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
          <h2 className="text-lg font-semibold text-foreground">الصيانات</h2>
          <p className="text-sm text-muted-foreground">سجل صيانة المركبة</p>
        </div>
        <Button type="button" onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          إضافة صيانة
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          جاري التحميل...
        </div>
      )}

      {isError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          حدث خطأ أثناء التحميل
        </div>
      )}

      {!isLoading && !isError && items.length === 0 && (
        <div className="rounded-md border border-dashed p-10 text-center text-sm text-muted-foreground">
          لا توجد سجلات صيانة
        </div>
      )}

      {!isLoading && !isError && items.length > 0 && (
        <ul className="divide-y rounded-md border bg-background">
          {items.map((item) => (
            <li key={item.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground">{item.description}</p>
                <p className="text-sm text-muted-foreground">{formatDate(item.maintenanceDate)}</p>
                {formatCost(item.cost) != null ? (
                  <p className="mt-1 text-sm font-medium">{formatCost(item.cost)} EGP</p>
                ) : null}
                {item.notes ? (
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.notes}</p>
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button type="button" size="sm" variant="outline" onClick={() => openEdit(item)}>
                  <Pencil className="h-3.5 w-3.5" />
                  تعديل
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setPendingDelete(item)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  حذف
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'تعديل صيانة' : 'إضافة صيانة'}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-2">
            <div className="flex flex-col gap-1.5">
              <Label>تاريخ الصيانة</Label>
              <Input
                type="date"
                value={maintenanceDate}
                onChange={(e) => setMaintenanceDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>الوصف</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>التكلفة (اختياري)</Label>
              <Input
                type="number"
                min={0}
                value={cost}
                onChange={(e) => setCost(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>ملاحظات (اختياري)</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
              إلغاء
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isCreating || isUpdating || !maintenanceDate || !description.trim()}
            >
              {isCreating || isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الصيانة</AlertDialogTitle>
            <AlertDialogDescription>هل أنت متأكد من حذف سجل الصيانة؟</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
