'use client';

import React from 'react';

import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { DragEndEvent } from '@dnd-kit/core';
import { closestCenter, DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type {
  ColumnDef,
  ColumnFiltersState,
  ColumnOrderState,
  Header,
  OnChangeFn,
  Row,
  RowSelectionState,
} from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { cn } from '@/lib/utils';
import { useGetGridByPageKey } from './api/get-one';
import { useUpdateGrid } from './api/update';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterKey?: string;
  pageKey?: string;
  onRowDoubleClick?: (row: TData) => void;
  onRowClick?: (row: TData) => void;
  enableRowSelection?: boolean | ((row: Row<TData>) => boolean);
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  getRowId?: (originalRow: TData, index: number, parent?: Row<TData>) => string;
  getRowClassName?: (row: Row<TData>) => string | undefined;
}

function SortableHeader<TData, TValue>({ header }: { header: Header<TData, TValue> }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: header.column.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };

  return (
    <TableHead ref={setNodeRef} style={style} {...attributes} className="hover:bg-gray-300 ">
      <div {...listeners} className="inline-block w-full">
        {flexRender(header.column.columnDef.header, header.getContext())}
      </div>
    </TableHead>
  );
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filterKey,
  pageKey,
  onRowDoubleClick,
  onRowClick,
  enableRowSelection,
  rowSelection,
  onRowSelectionChange,
  getRowId,
  getRowClassName,
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const { gridConfig } = useGetGridByPageKey(pageKey ?? null);
  const { updateGridMutation } = useUpdateGrid();

  // Derive initial columnOrder from backend or fallback to default column ids
  const defaultColumnOrder = React.useMemo(
    () =>
      columns
        .map((col) => col.id)
        .filter((id): id is string => typeof id === 'string' && id.length > 0),
    [columns],
  );

  const sanitizeColumnOrder = React.useCallback(
    (candidate: unknown): string[] => {
      const allowed = new Set(defaultColumnOrder);
      const incoming = Array.isArray(candidate) ? candidate : [];
      const validIncoming = incoming
        .filter((id): id is string => typeof id === 'string' && id.length > 0)
        .filter((id) => allowed.has(id));

      const missing = defaultColumnOrder.filter((id) => !validIncoming.includes(id));
      return [...validIncoming, ...missing];
    },
    [defaultColumnOrder],
  );

  const [columnOrder, setColumnOrder] = React.useState<ColumnOrderState>(() => {
    if (gridConfig?.columns?.length) {
      return sanitizeColumnOrder(gridConfig.columns);
    }
    return defaultColumnOrder;
  });

  // Sync when gridConfig loads/changes
  React.useEffect(() => {
    if (gridConfig?.columns?.length) {
      setColumnOrder(sanitizeColumnOrder(gridConfig.columns));
    }
  }, [gridConfig, sanitizeColumnOrder]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    // Parent pages own server pagination; show all rows passed in.
    manualPagination: true,
    enableRowSelection,
    getRowId,
    state: {
      columnFilters,
      columnOrder,
      ...(rowSelection ? { rowSelection } : {}),
    },
    onColumnFiltersChange: setColumnFilters,
    onColumnOrderChange: setColumnOrder,
    ...(onRowSelectionChange ? { onRowSelectionChange } : {}),
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }
    // Use the current columnOrder value to compute the new order.
    // Avoid side effects inside setState to prevent duplicate calls in React Strict Mode.
    const currentOrder = table
      .getState()
      .columnOrder.filter((id): id is string => typeof id === 'string' && id.length > 0);
    const oldIndex = currentOrder.indexOf(active.id as string);
    const newIndex = currentOrder.indexOf(over.id as string);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const newOrder = arrayMove(currentOrder, oldIndex, newIndex);
    setColumnOrder(newOrder);

    // Persist via PUT upsert — backend creates if missing.
    if (pageKey) {
      updateGridMutation({
        data: {
          pageKey,
          columns: newOrder,
        },
      });
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {filterKey && (
        <Input
          placeholder="بحث..."
          value={(table.getColumn(filterKey)?.getFilterValue() as string) ?? ''}
          onChange={(e) => table.getColumn(filterKey)?.setFilterValue(e.target.value)}
          className="max-w-sm"
        />
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={table.getState().columnOrder}
          strategy={horizontalListSortingStrategy}
        >
          <div className=" max-w-1 min-w-full  rounded-md border">
            <Table>
              <TableHeader className="h-14 text-lg">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className=" bg-gray-200">
                    {headerGroup.headers.map((header) => (
                      <SortableHeader key={header.id} header={header} />
                    ))}
                  </TableRow>
                ))}
              </TableHeader>

              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      onClick={() => onRowClick?.(row.original)}
                      onDoubleClick={() => onRowDoubleClick?.(row.original)}
                      className={cn(
                        (onRowClick || onRowDoubleClick) && 'cursor-pointer',
                        getRowClassName?.(row) ??
                          (onRowClick || onRowDoubleClick ? 'hover:bg-muted' : ''),
                      )}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      لا توجد نتائج
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
