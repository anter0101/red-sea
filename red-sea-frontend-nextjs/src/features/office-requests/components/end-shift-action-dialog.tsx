'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

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
import { useGetAllEmployees } from '@/features/employees/api/get-all';

import { useRequestAction } from '../api/request-action';

interface EndShiftActionDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly requestId: number;
}

export default function EndShiftActionDialog({
  open,
  onOpenChange,
  requestId,
}: EndShiftActionDialogProps) {
  const t = useTranslations('officeRequests');
  const { requestActionMutation, isRequestActionPending } = useRequestAction();
  const { employees } = useGetAllEmployees();

  const [amount, setAmount] = useState('');
  const [transferTo, setTransferTo] = useState<'TREASURY' | 'EMPLOYEE'>('TREASURY');
  const [targetEmployeeId, setTargetEmployeeId] = useState<number | null>(null);

  const isSubmitDisabled =
    amount === '' ||
    (transferTo === 'EMPLOYEE' && targetEmployeeId === null) ||
    isRequestActionPending;

  const handleSubmit = async () => {
    const numericAmount = Number(amount);
    const custody =
      transferTo === 'TREASURY'
        ? { amount: numericAmount, transferTo: 'TREASURY' as const }
        : {
            amount: numericAmount,
            transferTo: 'EMPLOYEE' as const,
            targetEmployeeId: targetEmployeeId ?? 0,
          };

    try {
      await requestActionMutation({ id: requestId, status: 'APPROVED', custody });
      onOpenChange(false);
      setAmount('');
      setTransferTo('TREASURY');
      setTargetEmployeeId(null);
    } catch {
      // Backend validation is shown on the toaster by useRequestAction.
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('dialogs.endShift.title')}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>{t('dialogs.endShift.amount')}</Label>
            <Input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>{t('dialogs.endShift.transferTo')}</Label>
            <Select
              value={transferTo}
              onValueChange={(v) => {
                setTransferTo(v as 'TREASURY' | 'EMPLOYEE');
                setTargetEmployeeId(null);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TREASURY">{t('dialogs.endShift.treasury')}</SelectItem>
                <SelectItem value="EMPLOYEE">{t('dialogs.endShift.employee')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {transferTo === 'EMPLOYEE' && (
            <div className="flex flex-col gap-1.5">
              <Label>{t('dialogs.endShift.selectEmployee')}</Label>
              <Select
                value={targetEmployeeId?.toString() ?? ''}
                onValueChange={(v) => setTargetEmployeeId(Number(v))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('dialogs.endShift.selectEmployee')} />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id.toString()}>
                      {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('dialogs.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitDisabled}>
            {t('dialogs.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
