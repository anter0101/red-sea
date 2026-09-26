'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { VehicleStatus } from '@/enums/vehicle-status';

const VEHICLE_STATUSES = Object.values(VehicleStatus);

type UpdateVehicleStatusDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStatus?: string;
  isPending?: boolean;
  onSave: (status: VehicleStatus) => void;
};

export default function UpdateVehicleStatusDialog({
  open,
  onOpenChange,
  currentStatus,
  isPending = false,
  onSave,
}: UpdateVehicleStatusDialogProps) {
  const t = useTranslations('common.change-status');
  const tStatus = useTranslations('common.statuses');
  const [status, setStatus] = useState<string>(currentStatus ?? VehicleStatus.AVAILABLE);

  useEffect(() => {
    if (open) {
      setStatus(currentStatus && currentStatus !== '—' ? currentStatus : VehicleStatus.AVAILABLE);
    }
  }, [open, currentStatus]);

  const handleSave = () => {
    if (!status) return;
    onSave(status as VehicleStatus);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center">{t('title')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{t('select-status')}</p>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('select-status')} />
            </SelectTrigger>
            <SelectContent>
              {VEHICLE_STATUSES.map((value) => (
                <SelectItem key={value} value={value}>
                  {tStatus(value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter className="gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {t('cancel')}
          </Button>
          <Button type="button" onClick={handleSave} disabled={isPending || !status}>
            {isPending ? t('saving') : t('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
