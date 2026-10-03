'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { IAxle } from '@/types/axles';

import { useCreateMaintenance } from '../api/create';
import {
  MAINTENANCE_TYPES,
  type IMaintenance,
  type ITireSelection,
  type MaintenanceType,
} from '../api/get-list';
import { useUpdateMaintenance } from '../api/update';

import TireChangePicker from './tire-change-picker';

type VehicleType = 'car' | 'trailer';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicleType: VehicleType;
  vehicleId: number;
  axles: IAxle[];
  axleCount: number;
  editing: IMaintenance | null;
};

function formatDate(value?: string) {
  if (!value) return '';
  return value.slice(0, 10);
}

export default function MaintenanceFormDialog({
  open,
  onOpenChange,
  vehicleType,
  vehicleId,
  axles,
  axleCount,
  editing,
}: Props) {
  const t = useTranslations('maintenance');
  const { mutate: createMaintenance, isPending: isCreating } = useCreateMaintenance();
  const { mutate: updateMaintenance, isPending: isUpdating } = useUpdateMaintenance();

  const [type, setType] = useState<MaintenanceType | ''>('');
  const [maintenanceDate, setMaintenanceDate] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');
  const [tireSelections, setTireSelections] = useState<ITireSelection[]>([]);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setType(editing.type ?? 'GENERAL');
      setMaintenanceDate(formatDate(editing.maintenanceDate));
      setDescription(editing.description ?? '');
      setCost(editing.cost != null ? String(editing.cost) : '');
      setNotes(editing.notes ?? '');
      setTireSelections(editing.tireSelections ?? []);
      return;
    }
    setType('');
    setMaintenanceDate(new Date().toISOString().slice(0, 10));
    setDescription('');
    setCost('');
    setNotes('');
    setTireSelections([]);
  }, [open, editing]);

  const isTireChange = type === 'TIRE_CHANGE';
  const tiresMissing = isTireChange && tireSelections.length === 0;
  const canSave = Boolean(type && maintenanceDate && description.trim() && !tiresMissing);

  const handleTypeChange = (value: MaintenanceType) => {
    setType(value);
    if (value !== 'TIRE_CHANGE') setTireSelections([]);
  };

  const handleSubmit = () => {
    if (!canSave || !type) return;

    const payload = {
      maintenanceDate,
      type,
      description: description.trim(),
      cost: cost ? Number(cost) : undefined,
      notes: notes.trim() || undefined,
      tireSelections: isTireChange ? tireSelections : null,
      ...(vehicleType === 'car' ? { carId: vehicleId } : { trailerId: vehicleId }),
    };

    if (editing) {
      updateMaintenance(
        { id: editing.id, data: payload },
        { onSuccess: () => onOpenChange(false) },
      );
      return;
    }
    createMaintenance(payload, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={isTireChange ? 'sm:max-w-3xl max-h-[90vh] overflow-y-auto' : undefined}
      >
        <DialogHeader>
          <DialogTitle>{editing ? t('form.edit-title') : t('form.add-title')}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-2">
          <div className="flex flex-col gap-1.5">
            <Label>{t('fields.type')}</Label>
            <Select
              value={type || undefined}
              onValueChange={(value) => handleTypeChange(value as MaintenanceType)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('form.type-placeholder')} />
              </SelectTrigger>
              <SelectContent>
                {MAINTENANCE_TYPES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {t(`types.${item}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isTireChange ? (
            <div className="flex flex-col gap-2">
              <TireChangePicker
                vehicleType={vehicleType}
                axles={axles}
                axleCount={axleCount}
                selected={tireSelections}
                onChange={setTireSelections}
              />
              {tiresMissing ? (
                <p className="text-sm text-destructive">{t('validation.tires-required')}</p>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-col gap-1.5">
            <Label>{t('fields.date')}</Label>
            <Input
              type="date"
              value={maintenanceDate}
              onChange={(event) => setMaintenanceDate(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>{t('fields.description')}</Label>
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>{t('fields.cost')}</Label>
            <Input
              type="number"
              min={0}
              value={cost}
              onChange={(event) => setCost(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>{t('fields.notes')}</Label>
            <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('actions.cancel')}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isCreating || isUpdating || !canSave}
          >
            {isCreating || isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {t('actions.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
