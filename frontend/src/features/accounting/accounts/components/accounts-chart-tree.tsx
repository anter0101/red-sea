'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { GitBranch, ListTree, Pencil, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import type { IAccountTableRow } from '../api/get-all';
import type { AccountType } from '../enums';
import type { AccountTreeNode } from '../utils/build-account-tree';

const ACCOUNT_TYPE_COLORS: Record<AccountType, string> = {
  ASSET: 'bg-[#DFFBFF] text-[#2D7CA3] hover:opacity-95 border-0',
  LIABILITY: 'bg-[#FFDFDF] text-[#810000] hover:opacity-95 border-0',
  EQUITY: 'bg-[#E8E5F6] text-[#9054AE] hover:opacity-95 border-0',
  REVENUE: 'bg-[#DFFFEC] text-[#00810D] hover:opacity-95 border-0',
  EXPENSE: 'bg-[#FFFDDF] text-[#9D7B0B] hover:opacity-95 border-0',
  CASH: 'bg-[#DFFBFF] text-[#2D7CA3] hover:opacity-95 border-0',
};

function formatOpeningBalance(value?: number) {
  if (value == null) return null;
  return new Intl.NumberFormat('en-EG', {
    style: 'decimal',
    minimumFractionDigits: 2,
  }).format(value);
}

interface NodeActionsProps {
  account: IAccountTableRow;
  onEdit?: (id: number, account?: IAccountTableRow) => void;
  onDelete?: (id: number) => void;
}

function NodeActions({ account, onEdit, onDelete }: NodeActionsProps) {
  return (
    <span className="ms-2 inline-flex shrink-0 gap-0.5 opacity-70 hover:opacity-100">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted-foreground hover:text-foreground"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onEdit?.(account.id, account);
        }}
      >
        <Pencil className="h-3.5 w-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted-foreground hover:text-foreground"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete?.(account.id);
        }}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </span>
  );
}

interface AccountTreeNodeViewProps {
  node: AccountTreeNode;
  depth: number;
  onEdit?: (id: number, account?: IAccountTableRow) => void;
  onDelete?: (id: number) => void;
}

function AccountTreeNodeView({ node, depth, onEdit, onDelete }: AccountTreeNodeViewProps) {
  const t = useTranslations('accounting.accounts');
  const hasChildren = node.children.length > 0;
  const isFolder = hasChildren || !node.isLeaf;
  const opening = formatOpeningBalance(node.openingBalance);
  const [isOpen, setIsOpen] = useState(depth === 0);

  const label = (
    <span className="inline-flex min-w-0 flex-wrap items-center gap-2">
      <span className="font-medium">
        {node.code} — {node.name}
      </span>
      <Badge
        variant="secondary"
        className={`${ACCOUNT_TYPE_COLORS[node.type]} px-2 py-0 text-[10px] font-medium`}
      >
        {t(`types.${node.type}`)}
      </Badge>
      {opening != null && (
        <span className="text-xs text-muted-foreground tabular-nums">{opening}</span>
      )}
      <NodeActions account={node} onEdit={onEdit} onDelete={onDelete} />
    </span>
  );

  if (!isFolder) {
    return (
      <li className="my-1.5 list-none">
        <span className="inline-flex max-w-full items-center gap-1.5 rounded-md bg-white px-2.5 py-1.5 text-[#2e7d32] shadow-sm dark:bg-card">
          <GitBranch className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
          {label}
        </span>
      </li>
    );
  }

  return (
    <li className="my-1.5 list-none">
      <details
        open={isOpen}
        onToggle={(e) => setIsOpen(e.currentTarget.open)}
        className="rounded-md bg-white px-2.5 py-1.5 shadow-sm dark:bg-card"
      >
        <summary className="flex cursor-pointer list-none items-center gap-1.5 font-semibold text-[#1565c0] dark:text-blue-400 [&::-webkit-details-marker]:hidden">
          <ListTree className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
          <span className="inline-flex min-w-0 flex-1 flex-wrap items-center gap-2">
            <span className="font-medium">
              {node.code} — {node.name}
            </span>
            <Badge
              variant="secondary"
              className={`${ACCOUNT_TYPE_COLORS[node.type]} px-2 py-0 text-[10px] font-medium`}
            >
              {t(`types.${node.type}`)}
            </Badge>
            {opening != null && (
              <span className="text-xs text-muted-foreground tabular-nums">{opening}</span>
            )}
          </span>
        </summary>
        <div className="flex justify-end pt-1">
          <NodeActions account={node} onEdit={onEdit} onDelete={onDelete} />
        </div>
        {hasChildren ? (
          <ul className="m-0 list-none ps-5 pe-0 pt-1">
            {node.children.map((child) => (
              <AccountTreeNodeView
                key={child.id}
                node={child}
                depth={depth + 1}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </ul>
        ) : (
          <p className="ps-5 pt-1 text-sm text-muted-foreground">{t('list.no-children')}</p>
        )}
      </details>
    </li>
  );
}

interface AccountsChartTreeProps {
  roots: AccountTreeNode[];
  onEdit?: (id: number, account?: IAccountTableRow) => void;
  onDelete?: (id: number) => void;
}

export default function AccountsChartTree({ roots, onEdit, onDelete }: AccountsChartTreeProps) {
  const t = useTranslations('accounting.accounts');

  if (roots.length === 0) {
    return (
      <div className="rounded-xl bg-muted/40 px-4 py-12 text-center text-muted-foreground">
        {t('list.no-data')}
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-muted/40 p-4 sm:p-5" dir="rtl">
      <ul className="m-0 list-none p-0">
        {roots.map((root) => (
          <AccountTreeNodeView
            key={root.id}
            node={root}
            depth={0}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </ul>
    </div>
  );
}
