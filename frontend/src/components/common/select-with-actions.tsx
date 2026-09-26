'use client';

import { CheckIcon, ChevronDownIcon, Loader2, PlusIcon, XIcon } from 'lucide-react';

import InfiniteScrollTrigger from '@/components/common/infinite-scroll-trigger';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type TestProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  value?: string;
  items: { id?: string; name?: string }[];
  search?: string;
  setSearch?: (search: string) => void;
  showSearch?: boolean;
  isGetItemsPending?: boolean;
  getItemsError?: Error;
  handleSelect?: (value: string | undefined) => void;
  handleDelete?: (value: string | undefined) => void;
  deletable?: boolean;
  isDeletePending?: boolean;
  handleLoadMore: () => void;
  hasGetItemsNextPage?: boolean;
  isGetItemsFetchingNextPage?: boolean;
  canAddItem?: boolean;
  triggerClassName?: string;
  className?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  addButtonLabel?: string;
  disabled?: boolean;
  triggerDisabled?: boolean;
  addDialog?: React.ReactNode;
  setAddDialogOpen?: (open: boolean) => void;
  addButtonDisabled?: boolean;
  addButtonDisabledMessage?: string;
};

const SelectWithActions = ({
  open,
  setOpen,
  value,
  items,
  search,
  setSearch,
  showSearch = true,
  isGetItemsPending = false,
  getItemsError,
  handleSelect,
  handleDelete,
  deletable = false,
  isDeletePending = false,
  handleLoadMore,
  hasGetItemsNextPage,
  isGetItemsFetchingNextPage,
  canAddItem = false,
  triggerClassName,
  className,
  placeholder = 'Select Item',
  searchPlaceholder = 'Search Item',
  emptyMessage = 'No Items found',
  addButtonLabel = 'Add new Item',
  addDialog = null,
  setAddDialogOpen,
  addButtonDisabled = false,
  addButtonDisabledMessage,
  disabled = false,
}: TestProps) => {
  return (
    <>
      <Popover open={disabled ? false : open} onOpenChange={disabled ? undefined : setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              'w-full justify-between font-normal',
              !value && 'text-muted-foreground',
              disabled && 'cursor-not-allowed opacity-50',
              triggerClassName,
            )}
          >
            <span className="truncate">
              {items.find((item) => item.id === value)?.name || placeholder}
            </span>
            <ChevronDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={cn('w-[var(--radix-popover-trigger-width)] p-0', className)}
          align="start"
        >
          <Command shouldFilter={false}>
            {showSearch && (
              <CommandInput
                placeholder={searchPlaceholder}
                value={search}
                onValueChange={setSearch}
              />
            )}
            <CommandList>
              {isGetItemsPending ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="size-4 animate-spin" />
                </div>
              ) : getItemsError ? (
                <div className="py-6 text-center text-sm text-destructive">
                  getItemsError.message
                </div>
              ) : items.length === 0 ? (
                <CommandEmpty>{emptyMessage}</CommandEmpty>
              ) : (
                <CommandGroup>
                  {items.map((item) => {
                    const isSelected = item.id === value;
                    return (
                      <CommandItem
                        key={item.id}
                        value={item.id}
                        onSelect={() => handleSelect?.(item.id)}
                        className="group"
                      >
                        <CheckIcon
                          className={cn(
                            'size-4 shrink-0',
                            isSelected ? 'opacity-100' : 'opacity-0',
                          )}
                        />
                        <span className="flex-1 truncate">{item.name}</span>
                        {deletable && (
                          <button
                            type="button"
                            onClick={() => handleDelete?.(item.id)}
                            className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded"
                          >
                            {isDeletePending ? (
                              <Loader2 className="size-3 animate-spin" />
                            ) : (
                              <XIcon className="size-3 text-destructive" />
                            )}
                          </button>
                        )}
                      </CommandItem>
                    );
                  })}

                  {/* Infinite scroll trigger */}
                  <InfiniteScrollTrigger
                    onIntersect={handleLoadMore}
                    enabled={hasGetItemsNextPage && !isGetItemsFetchingNextPage}
                  />

                  {/* Loading more indicator */}
                  {isGetItemsFetchingNextPage && (
                    <div className="flex items-center justify-center py-2">
                      <Loader2 className="size-4 animate-spin" />
                    </div>
                  )}
                </CommandGroup>
              )}

              {/* Add new item button */}
              {canAddItem && (
                <>
                  <div className="border-t" />
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 rounded-none"
                    disabled={addButtonDisabled}
                    onClick={() => {
                      setAddDialogOpen?.(true);
                      setOpen(false);
                    }}
                    title={addButtonDisabled ? addButtonDisabledMessage : undefined}
                  >
                    <PlusIcon className="size-4" />
                    {addButtonDisabled && addButtonDisabledMessage
                      ? addButtonDisabledMessage
                      : addButtonLabel}
                  </Button>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>{' '}
      {addDialog}
    </>
  );
};

export default SelectWithActions;
