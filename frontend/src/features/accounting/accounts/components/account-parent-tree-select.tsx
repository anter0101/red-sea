'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, ChevronDown, ChevronLeft, Loader2, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/debounce';

import { useGetAllAccounts } from '../api/get-all';
import type { IAccountTableRow } from '../api/get-all';
import { useGetOneAccount } from '../api/get-one';

const PAGE_SIZE = 500;

/** Any account may be chosen as parent; backend accepts leaf or group. Only exclude self when editing. */
function filterTreeRows(list: IAccountTableRow[], excludeId?: number) {
  return list.filter((a) => a.id !== excludeId);
}

function ParentTreeNode({
  account,
  depth,
  excludeId,
  selectedId,
  onSelect,
}: {
  account: IAccountTableRow;
  depth: number;
  excludeId?: number;
  selectedId: number | null;
  onSelect: (account: IAccountTableRow) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const canExpand = !account.isLeaf;
  const { accounts: rawChildren, isGetAccountsPending } = useGetAllAccounts(
    { parentAccountId: account.id, page: 1, pageSize: PAGE_SIZE },
    { enabled: canExpand && expanded },
  );
  const children = filterTreeRows(rawChildren, excludeId);
  const indentPx = depth * 12;
  const isSelected = selectedId === account.id;

  return (
    <div className="select-none">
      <div
        className={cn(
          'flex items-center gap-0.5 rounded-sm py-1 pe-1 hover:bg-muted/60',
          isSelected && 'bg-primary/10',
        )}
        style={{ paddingInlineStart: indentPx }}
      >
        {canExpand ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
          >
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        ) : (
          <span className="inline-block w-7 shrink-0" />
        )}
        <button
          type="button"
          className={cn(
            'min-w-0 flex-1 truncate rounded px-2 py-0.5 text-start text-sm',
            isSelected && 'font-medium text-primary',
          )}
          onClick={() => onSelect(account)}
        >
          <span className="text-muted-foreground tabular-nums">{account.code}</span>
          <span className="mx-1 text-muted-foreground">—</span>
          <span>{account.name}</span>
        </button>
        {isSelected && <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden />}
      </div>
      {canExpand && expanded && (
        <div className="border-s border-muted/70 ms-3">
          {isGetAccountsPending ? (
            <div
              className="flex items-center gap-2 py-2 text-muted-foreground text-xs"
              style={{ paddingInlineStart: indentPx + 8 }}
            >
              <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
            </div>
          ) : children.length === 0 ? (
            <p
              className="py-1 text-xs text-muted-foreground"
              style={{ paddingInlineStart: indentPx + 8 }}
            >
              —
            </p>
          ) : (
            children.map((child) => (
              <ParentTreeNode
                key={child.id}
                account={child}
                depth={depth + 1}
                excludeId={excludeId}
                selectedId={selectedId}
                onSelect={onSelect}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export interface AccountParentTreeSelectProps {
  value: number | null;
  onChange: (parentId: number | null, parentAccount?: IAccountTableRow | null) => void;
  disabled?: boolean;
  excludeAccountId?: number;
  placeholder?: string;
}

export default function AccountParentTreeSelect({
  value,
  onChange,
  disabled,
  excludeAccountId,
  placeholder,
}: AccountParentTreeSelectProps) {
  const t = useTranslations('accounting.accounts');
  const tCommon = useTranslations('common.filters');
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { accounts: roots, isGetAccountsPending } = useGetAllAccounts({
    parentAccountId: debouncedSearchTerm ? undefined : null,
    search: debouncedSearchTerm || undefined,
    page: 1,
    pageSize: PAGE_SIZE,
  });
  const rootRows = filterTreeRows(roots, excludeAccountId);

  const { account: selectedAccount, isGetAccountLoading } = useGetOneAccount(value, value != null);

  const ph = placeholder ?? t('form.select-parent');
  const displayLabel =
    value == null
      ? ph
      : selectedAccount
        ? `${selectedAccount.code} — ${selectedAccount.name}`
        : isGetAccountLoading
          ? '…'
          : ph;

  const handleSelect = (acc: IAccountTableRow) => {
    onChange(acc.id, acc);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className="h-10 w-full justify-between px-3 font-normal"
        >
          <span className="truncate text-start">{displayLabel}</span>
          <ChevronDown className="ms-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(100vw-2rem,22rem)] max-h-[min(24rem,70vh)] flex flex-col p-0">
        <div className="border-b px-2 py-1.5 flex flex-col gap-1.5">
          <div className="relative">
            <Search className="absolute right-2 top-2 h-4 w-4 text-muted-foreground rtl:left-2 rtl:right-auto" />
            <Input
              placeholder={tCommon('search')}
              className="h-8 px-8 text-xs bg-slate-50 border-slate-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-full justify-start text-muted-foreground text-xs"
            onClick={() => {
              onChange(null, null);
              setOpen(false);
            }}
          >
            {t('form.no-parent')}
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {isGetAccountsPending ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : rootRows.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">{t('list.no-data')}</p>
          ) : (
            rootRows.map((account) => (
              <ParentTreeNode
                key={account.id}
                account={account}
                depth={0}
                excludeId={excludeAccountId}
                selectedId={value}
                onSelect={handleSelect}
              />
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
