'use client';

import { Check, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import type { OfficeRequestStatus } from '../enums/office-request-status';
import type { IOfficeRequestTableRow } from '../types';

const STATUS_COLORS: Record<OfficeRequestStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800 border-transparent',
  APPROVED: 'bg-badge-active-bg text-badge-active-fg border-transparent',
  REJECTED: 'bg-red-100 text-red-800 border-transparent',
};

type PendingAction = { id: number; action: 'APPROVED' | 'REJECTED' } | null;

interface OfficeRequestsTableProps {
  data: IOfficeRequestTableRow[];
  isAdmin?: boolean;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
  onApproveEndShift?: (id: number) => void;
  onApproveCustody?: (id: number) => void;
}

export default function OfficeRequestsTable({
  data,
  isAdmin,
  onApprove,
  onReject,
  onApproveEndShift,
  onApproveCustody,
}: OfficeRequestsTableProps) {
  const t = useTranslations('officeRequests');
  const [pending, setPending] = useState<PendingAction>(null);

  const handleConfirm = () => {
    if (!pending) return;
    if (pending.action === 'APPROVED') onApprove?.(pending.id);
    else onReject?.(pending.id);
    setPending(null);
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('table.type')}</TableHead>
            <TableHead>{t('table.journey')}</TableHead>
            <TableHead>{t('table.amount')}</TableHead>
            <TableHead>{t('table.from')}</TableHead>
            <TableHead>{t('table.to')}</TableHead>
            <TableHead className="w-32 text-center">{t('table.status')}</TableHead>
            {isAdmin && <TableHead className="text-left">{t('table.actions')}</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={isAdmin ? 7 : 6}
                className="py-8 text-center text-muted-foreground"
              >
                {t('table.noData')}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium text-foreground">
                  {t(`types.${row.type}`)}
                </TableCell>
                <TableCell className="text-foreground">{row.journeyNumber}</TableCell>
                <TableCell className="text-foreground">{row.amount}</TableCell>
                <TableCell className="text-foreground">{row.fromName}</TableCell>
                <TableCell className="text-foreground">{row.toName}</TableCell>
                <TableCell className="text-center">
                  <Badge
                    className={`rounded-full px-4 py-1 text-xs font-semibold ${STATUS_COLORS[row.status]}`}
                  >
                    {t(`statuses.${row.status}`)}
                  </Badge>
                </TableCell>
                {isAdmin && (
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      {row.status === 'PENDING' && (
                        <>
                          {row.type === 'PRINT_DELEGATION' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-emerald-700"
                              onClick={() => setPending({ id: row.id, action: 'APPROVED' })}
                            >
                              <Check className="mr-1 h-4 w-4" />
                              {t('rowActions.approve')}
                            </Button>
                          )}
                          {row.type === 'END_WORKING_SHIFT' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-emerald-700"
                              onClick={() => onApproveEndShift?.(row.id)}
                            >
                              <Check className="mr-1 h-4 w-4" />
                              {t('rowActions.approve')}
                            </Button>
                          )}
                          {row.type === 'ASK_FOR_CUSTODY' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-emerald-700"
                              onClick={() => onApproveCustody?.(row.id)}
                            >
                              <Check className="mr-1 h-4 w-4" />
                              {t('rowActions.approve')}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-700"
                            onClick={() => setPending({ id: row.id, action: 'REJECTED' })}
                          >
                            <X className="mr-1 h-4 w-4" />
                            {t('rowActions.reject')}
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <AlertDialog open={!!pending} onOpenChange={(open) => !open && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pending?.action === 'APPROVED' ? t('rowActions.approve') : t('rowActions.reject')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pending?.action === 'APPROVED'
                ? t('actions.confirmApprove')
                : t('actions.confirmReject')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className={
                pending?.action === 'APPROVED'
                  ? 'bg-emerald-700 hover:bg-emerald-800'
                  : 'bg-destructive hover:bg-destructive/90'
              }
              onClick={handleConfirm}
            >
              {t('actions.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
