'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

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

interface CustodyActionDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly requestId: number;
  readonly requestedAmount?: number | null;
}

export default function CustodyActionDialog({
  open,
  onOpenChange,
  requestId,
  requestedAmount,
}: CustodyActionDialogProps) {
  const t = useTranslations('officeRequests');
  const { requestActionMutation, isRequestActionPending } = useRequestAction();
  const { employees } = useGetAllEmployees();

  const [amount, setAmount] = useState('');
  const [transferFrom, setTransferFrom] = useState<'TREASURY' | 'EMPLOYEE'>('TREASURY');
  const [sourceEmployeeId, setSourceEmployeeId] = useState<number | null>(null);

  useEffect(() => {
    if (open && requestedAmount != null) {
      setAmount(String(requestedAmount));
    }
    if (!open) {
      setAmount('');
      setTransferFrom('TREASURY');
      setSourceEmployeeId(null);
    }
  }, [open, requestedAmount]);

  const isSubmitDisabled =
    amount === '' ||
    (transferFrom === 'EMPLOYEE' && sourceEmployeeId === null) ||
    isRequestActionPending;

  const handleSubmit = async () => {
    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      toast.error(t('dialogs.custody.invalidAmount'));
      return;
    }

    const custody =
      transferFrom === 'TREASURY'
        ? { amount: numericAmount, transferFrom: 'TREASURY' as const }
        : {
            amount: numericAmount,
            transferFrom: 'EMPLOYEE' as const,
            sourceEmployeeId: sourceEmployeeId ?? 0,
          };

    try {
      await requestActionMutation({ id: requestId, status: 'APPROVED', custody });
      onOpenChange(false);
    } catch {
      // Backend validation is shown on the toaster by useRequestAction.
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('dialogs.custody.title')}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {requestedAmount != null && (
            <p className="text-sm text-muted-foreground">
              {t('dialogs.custody.requestedAmount', { amount: requestedAmount })}
            </p>
          )}

          <div className="flex flex-col gap-1.5">
            <Label>{t('dialogs.custody.amount')}</Label>
            <Input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>{t('dialogs.custody.transferFrom')}</Label>
            <Select
              value={transferFrom}
              onValueChange={(v) => {
                setTransferFrom(v as 'TREASURY' | 'EMPLOYEE');
                setSourceEmployeeId(null);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TREASURY">{t('dialogs.custody.treasury')}</SelectItem>
                <SelectItem value="EMPLOYEE">{t('dialogs.custody.employee')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {transferFrom === 'EMPLOYEE' && (
            <div className="flex flex-col gap-1.5">
              <Label>{t('dialogs.custody.selectEmployee')}</Label>
              <Select
                value={sourceEmployeeId?.toString() ?? ''}
                onValueChange={(v) => setSourceEmployeeId(Number(v))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('dialogs.custody.selectEmployee')} />
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
