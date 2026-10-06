'use client';

import { Fragment } from 'react';
import { useTranslations } from 'next-intl';
import { Pencil, Trash2, ChevronDown, ChevronLeft, Loader2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';

import { useGetAllAccounts } from '../api/get-all';
import type { IAccountTableRow } from '../api/get-all';
import type { AccountType } from '../enums';

const ACCOUNT_TYPE_COLORS: Record<AccountType, string> = {
  ASSET: 'bg-[#DFFBFF] text-[#2D7CA3] hover:opacity-95 border-0',
  LIABILITY: 'bg-[#FFDFDF] text-[#810000] hover:opacity-95 border-0',
  EQUITY: 'bg-[#E8E5F6] text-[#9054AE] hover:opacity-95 border-0',
  REVENUE: 'bg-[#DFFFEC] text-[#00810D] hover:opacity-95 border-0',
  EXPENSE: 'bg-[#FFFDDF] text-[#9D7B0B] hover:opacity-95 border-0',
  CASH: 'bg-[#DFFBFF] text-[#2D7CA3] hover:opacity-95 border-0',
};

const CHILD_PAGE_SIZE = 500;

export interface AccountTreeRowProps {
  account: IAccountTableRow;
  depth: number;
  expandedIds: Set<number>;
  onToggleExpand: (id: number) => void;
  onEdit?: (id: number, account?: IAccountTableRow) => void;
  onDelete?: (id: number) => void;
}

export default function AccountTreeRow({
  account,
  depth,
  expandedIds,
  onToggleExpand,
  onEdit,
  onDelete,
}: AccountTreeRowProps) {
  const t = useTranslations('accounting.accounts');
  const isExpanded = expandedIds.has(account.id);
  const canExpand = !account.isLeaf;

  const { accounts: childAccounts, isGetAccountsPending } = useGetAllAccounts(
    { parentAccountId: account.id, page: 1, pageSize: CHILD_PAGE_SIZE },
    { enabled: canExpand && isExpanded },
  );

  const indentPx = depth * 14;

  return (
    <Fragment>
      <TableRow
        className={`hover:bg-muted/10 transition-colors ${isExpanded && canExpand ? 'bg-muted/5' : ''}`}
      >
        <TableCell className="text-center w-14 p-2 align-middle">
          <div
            className={`flex items-center justify-center min-h-8 ${
              depth > 0 ? 'border-s border-muted/80' : ''
            }`}
            style={{ marginInlineStart: indentPx, paddingInlineStart: depth > 0 ? 6 : 0 }}
          >
            {canExpand ? (
              <Button
                variant="ghost"
                size="icon"
                className={`h-7 w-7 shrink-0 transition-colors ${
                  isExpanded ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                }`}
                title={isExpanded ? 'إخفاء الحسابات الفرعية' : 'عرض الحسابات الفرعية'}
                onClick={() => onToggleExpand(account.id)}
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </Button>
            ) : (
              <span
                className="inline-flex w-7 justify-center text-muted-foreground/40 text-xs select-none"
                title={t('table.is-leaf')}
              >
                ·
              </span>
            )}
          </div>
        </TableCell>

        <TableCell className="font-medium text-foreground align-middle">{account.code}</TableCell>
        <TableCell className="text-foreground align-middle">{account.name}</TableCell>
        <TableCell className="align-middle">
          <Badge
            variant="secondary"
            className={`${ACCOUNT_TYPE_COLORS[account.type]} font-medium px-3 py-1`}
          >
            {t(`types.${account.type}`)}
          </Badge>
        </TableCell>
        <TableCell className="text-foreground align-middle">
          {t(`balance-types.${account.normalBalance}`)}
        </TableCell>
        <TableCell className="text-foreground align-middle font-medium">
          {account.openingBalance != null
            ? new Intl.NumberFormat('en-EG', { style: 'decimal', minimumFractionDigits: 2 }).format(
                account.openingBalance,
              )
            : '-'}
        </TableCell>
        <TableCell className="align-middle">
          <div className="flex justify-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-action-icon hover:bg-muted hover:text-action-icon"
              onClick={() => onEdit?.(account.id, account)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-action-icon hover:bg-muted hover:text-action-icon"
              onClick={() => onDelete?.(account.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      {canExpand && isExpanded && isGetAccountsPending && (
        <TableRow className="bg-muted/5">
          <TableCell colSpan={7} className="py-3 text-muted-foreground text-sm">
            <div className="flex items-center gap-2" style={{ marginInlineStart: indentPx + 14 }}>
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              <span>جاري التحميل...</span>
            </div>
          </TableCell>
        </TableRow>
      )}

      {canExpand && isExpanded && !isGetAccountsPending && childAccounts.length === 0 && (
        <TableRow className="bg-muted/5">
          <TableCell colSpan={7} className="py-2 text-sm text-muted-foreground">
            <span style={{ marginInlineStart: indentPx + 14 }}>لا توجد حسابات فرعية</span>
          </TableCell>
        </TableRow>
      )}

      {canExpand &&
        isExpanded &&
        !isGetAccountsPending &&
        childAccounts.map((child) => (
          <AccountTreeRow
            key={child.id}
            account={child}
            depth={depth + 1}
            expandedIds={expandedIds}
            onToggleExpand={onToggleExpand}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
    </Fragment>
  );
}
