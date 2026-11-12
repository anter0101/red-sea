'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { CodeLink } from '@/components/main-table/code-link';
import { Badge } from '../ui/badge';
import { PackingType, packingTypeLabels } from '@/features/clients/enums/packing-type';
import {
  JOURNEY_STATUS_COLORS,
  JOURNEY_STATUS_LABELS,
  JOURNEY_STATUS_TEXT_COLORS,
} from '@/features/trips/constants/journey-status';

const tripStatusLabels: Record<string, { label: string; bgColor: string; textColor: string }> =
  Object.fromEntries(
    Object.entries(JOURNEY_STATUS_LABELS).map(([key, label]) => [
      key,
      {
        label,
        bgColor: JOURNEY_STATUS_COLORS[key] ?? '#EEE',
        textColor: JOURNEY_STATUS_TEXT_COLORS[key] ?? '#111827',
      },
    ]),
  );

const vehicleTypeLabels: Record<string, string> = {
  NOLON_CAR: 'نولون',
  CONTRACT_CAR: 'عقد',
  COMPANY_CAR: 'ملك الشركة',
};
export type TripRow = {
  id: number;
  createdAt: string;

  delegateNumber: string;
  delegateDate: string;
  tripStatus: string;
  clientId?: number | null;
  clientName?: string | null;

  fuelLiters: number | null;
  fuelConsumptionPer1000km: number;

  driverId?: number | null;
  driverCode: string;
  driverName: string | null;
  assistantId?: number | null;
  assistantName: string | null;
  assistantCode: string | null;
  carId?: number | null;
  carCode: string | null;
  trailerId?: number | null;
  officeEmployeeName?: string; // optional

  carCylinders: number;
  carAxleCount: number;

  carPlateNumber: string;
  carPlateLetters: string;
  trailerPlateNumber: string;
  trailerPlateLetters: string;

  bookWeight: number;
  actualWeight: number;
  deliveryWeight: number;
  shortageQty: number;

  policyNo: string;
  policyDate: string;

  entryTimeFactory: string;
  exitTimeFactory: string;

  loadingDate: string;
  loadingPermitNo: string;

  archiveNo: string;

  tripDate: string;
  tripDistance: number;

  deliverySiteName: string;
  deliveryGovName: string;
  deliveryDelegate: string;

  totalExpenses: number;
  /** Sheet nolon posted as NOLON_FEES and/or driver/assistant commission */
  nolonExpense: number;
  /** car.ownerShip: NOLON_CAR | CONTRACT_CAR | COMPANY_CAR | … */
  vehicleType: string | null;
  actualRevenue: number | null;
  /** API coalesce — used for profit calc; not shown as a list column */
  totalRevenue: number;
  totalProfit: number;

  notes: string | null;
  collectionStatus: string | null;

  electronicInvoiceNo: string | null;
  preliminaryInvoiceNo: string | null;
  policiesReceivedAtAdmin: string;

  loadingWaitingTime: string | null;
  loadingDuration: string | null;

  packingType: PackingType | null;

  dieselValue: number | null;
  cardFees: number | null;
  scaleFees: number | null;
  tipsFees: number | null;
};

export const columns: ColumnDef<TripRow>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
  },
  {
    id: 'delegateNumber',
    accessorKey: 'delegateNumber',
    header: 'رقم التفويض',
    cell: ({ row }) => (
      <CodeLink href={`/trips/${row.original.id}`}>{row.original.delegateNumber || '-'}</CodeLink>
    ),
  },
  {
    id: 'tripDate',
    accessorKey: 'tripDate',
    header: 'تاريخ الرحلة',
    cell: ({ row }) =>
      row.original.tripDate ? new Date(row.original.tripDate).toLocaleDateString() : '-',
  },
  {
    id: 'tripStatus',
    accessorKey: 'tripStatus',
    header: 'حالة الرحلة',
    cell: ({ row }) => {
      const status = row.original.tripStatus;
      const info = tripStatusLabels[status] || {
        label: status || '-',
        bgColor: '#EEE',
        textColor: '#111827',
      };
      return (
        <Badge
          className="capitalize px-4 py-1"
          style={{ backgroundColor: info.bgColor, color: info.textColor }}
        >
          {info.label}
        </Badge>
      );
    },
  },
  {
    id: 'driverName',
    accessorKey: 'driverName',
    header: 'اسم السائق',
    cell: ({ row }) => row.original.driverName || '-',
  },
  {
    id: 'driverCode',
    accessorKey: 'driverCode',
    header: 'كود السائق',
    cell: ({ row }) => (
      <CodeLink
        href={row.original.driverId != null ? `/drivers/${row.original.driverId}` : null}
      >
        {row.original.driverCode || '-'}
      </CodeLink>
    ),
  },
  {
    id: 'assistantName',
    accessorKey: 'assistantName',
    header: 'اسم التباع',
    cell: ({ row }) => row.original.assistantName || '-',
  },
  {
    id: 'assistantCode',
    accessorKey: 'assistantCode',
    header: 'كود التباع',
    cell: ({ row }) => (
      <CodeLink
        href={
          row.original.assistantId != null
            ? `/driver-assistants/${row.original.assistantId}`
            : null
        }
      >
        {row.original.assistantCode || '-'}
      </CodeLink>
    ),
  },
  {
    id: 'carCode',
    accessorKey: 'carCode',
    header: 'كود السيارة',
    cell: ({ row }) => (
      <CodeLink href={row.original.carId != null ? `/cars/${row.original.carId}` : null}>
        {row.original.carCode || '-'}
      </CodeLink>
    ),
  },
  {
    id: 'officeEmployeeName',
    accessorKey: 'officeEmployeeName',
    header: 'موظف المكتب',
    cell: ({ row }) => row.original.officeEmployeeName || '-',
  },
  {
    id: 'carCylinders',
    accessorKey: 'carCylinders',
    header: 'سلندرات السيارة',
    cell: ({ row }) => row.original.carCylinders ?? '-',
  },
  {
    id: 'carAxleCount',
    accessorKey: 'carAxleCount',
    header: 'محاور السيارة',
    cell: ({ row }) => row.original.carAxleCount ?? '-',
  },
  {
    id: 'fuelLiters',
    accessorKey: 'fuelLiters',
    header: 'عدد اللترات للرحلة',
    cell: ({ row }) => row.original.fuelLiters ?? '-',
  },
  {
    id: 'fuelConsumptionPer1000km',
    accessorKey: 'fuelConsumptionPer1000km',
    header: 'معدل استهلاك الوقود / ١٠٠٠ كم',
    cell: ({ row }) => row.original.fuelConsumptionPer1000km ?? '-',
  },
  {
    id: 'bookWeight',
    accessorKey: 'bookWeight',
    header: 'الوزن الدفتري',
    cell: ({ row }) => row.original.bookWeight ?? '-',
  },
  {
    id: 'actualWeight',
    accessorKey: 'actualWeight',
    header: 'الوزن الفعلي',
    cell: ({ row }) => row.original.actualWeight ?? '-',
  },
  {
    id: 'deliveryWeight',
    accessorKey: 'deliveryWeight',
    header: 'وزن التسليم',
    cell: ({ row }) => row.original.deliveryWeight ?? '-',
  },
  {
    id: 'shortageQty',
    accessorKey: 'shortageQty',
    header: 'عجز الكمية',
    cell: ({ row }) => row.original.shortageQty ?? '-',
  },
  {
    id: 'policyNo',
    accessorKey: 'policyNo',
    header: 'رقم البوليصة',
    cell: ({ row }) => row.original.policyNo || '-',
  },
  {
    id: 'policyDate',
    accessorKey: 'policyDate',
    header: 'تاريخ البوليصة',
    cell: ({ row }) =>
      row.original.policyDate ? new Date(row.original.policyDate).toLocaleString() : '-',
  },
  {
    id: 'loadingDate',
    accessorKey: 'loadingDate',
    header: 'تاريخ التحميل',
    cell: ({ row }) =>
      row.original.loadingDate ? new Date(row.original.loadingDate).toLocaleString() : '-',
  },
  {
    id: 'loadingPermitNo',
    accessorKey: 'loadingPermitNo',
    header: 'رقم إذن التحميل',
    cell: ({ row }) => row.original.loadingPermitNo || '-',
  },

  {
    id: 'entryTimeFactory',
    accessorKey: 'entryTimeFactory',
    header: 'وقت دخول المصنع',
    cell: ({ row }) =>
      row.original.entryTimeFactory
        ? ` ${new Date(row.original.entryTimeFactory).toLocaleTimeString()}`
        : '-',
  },
  {
    id: 'exitTimeFactory',
    accessorKey: 'exitTimeFactory',
    header: 'وقت الخروج من المصنع',
    cell: ({ row }) =>
      row.original.exitTimeFactory
        ? ` ${new Date(row.original.exitTimeFactory).toLocaleTimeString()}`
        : '-',
  },
  {
    id: 'loadingWaitingTime',
    accessorKey: 'loadingWaitingTime',
    header: 'وقت انتظار التحميل',
    cell: ({ row }) => row.original.loadingWaitingTime || '-',
  },
  {
    id: 'loadingDuration',
    accessorKey: 'loadingDuration',
    header: 'مدة التحميل',
    cell: ({ row }) => row.original.loadingDuration || '-',
  },
  {
    id: 'delegateDate',
    accessorKey: 'delegateDate',
    header: 'تاريخ التفويض',
    cell: ({ row }) =>
      row.original.delegateDate ? new Date(row.original.delegateDate).toLocaleString() : '-',
  },
  {
    id: 'tripDistance',
    accessorKey: 'tripDistance',
    header: 'مسافة الرحلة (كم)',
    cell: ({ row }) => row.original.tripDistance ?? '-',
  },
  {
    id: 'deliverySiteName',
    accessorKey: 'deliverySiteName',
    header: 'موقع التسليم',
    cell: ({ row }) => row.original.deliverySiteName || '-',
  },
  {
    id: 'deliveryGovName',
    accessorKey: 'deliveryGovName',
    header: 'محافظة التسليم',
    cell: ({ row }) => row.original.deliveryGovName || '-',
  },
  {
    id: 'deliveryDelegate',
    accessorKey: 'deliveryDelegate',
    header: 'مفوض الاستلام',
    cell: ({ row }) => row.original.deliveryDelegate || '-',
  },
  {
    id: 'archiveNo',
    accessorKey: 'archiveNo',
    header: 'رقم أرشيف المستندات',
    cell: ({ row }) => row.original.archiveNo || '-',
  },
  {
    id: 'collectionStatus',
    accessorKey: 'collectionStatus',
    header: 'موقف التحصيل',
    cell: ({ row }) => row.original.collectionStatus || '-',
  },
  {
    id: 'electronicInvoiceNo',
    accessorKey: 'electronicInvoiceNo',
    header: 'فاتورة إلكترونية',
    cell: ({ row }) => row.original.electronicInvoiceNo || '-',
  },
  {
    id: 'policiesReceivedAtAdmin',
    accessorKey: 'policiesReceivedAtAdmin',
    header: 'استلام البوالص بالإدارة',
    cell: ({ row }) => row.original.policiesReceivedAtAdmin || '-',
  },
  {
    id: 'vehicleType',
    accessorKey: 'vehicleType',
    header: 'نوع الرحلة',
    cell: ({ row }) => {
      const value = row.original.vehicleType;
      if (!value) return '-';
      return vehicleTypeLabels[value] ?? value;
    },
  },
  {
    id: 'nolonExpense',
    accessorKey: 'nolonExpense',
    header: 'نولون',
    cell: ({ row }) => row.original.nolonExpense ?? '-',
  },
  {
    id: 'totalExpenses',
    accessorKey: 'totalExpenses',
    header: 'إجمالي المصروفات',
    cell: ({ row }) => row.original.totalExpenses ?? '-',
  },
  {
    id: 'actualRevenue',
    accessorKey: 'actualRevenue',
    header: 'الإيراد الفعلي',
    cell: ({ row }) => row.original.actualRevenue ?? '-',
  },
  {
    id: 'totalProfit',
    accessorKey: 'totalProfit',
    header: 'إجمالي الربح',
    cell: ({ row }) => row.original.totalProfit ?? '-',
  },
  {
    id: 'dieselValue',
    accessorKey: 'dieselValue',
    header: 'سولار',
    cell: ({ row }) => row.original.dieselValue ?? '-',
  },
  {
    id: 'cardFees',
    accessorKey: 'cardFees',
    header: 'كارته',
    cell: ({ row }) => row.original.cardFees ?? '-',
  },
  {
    id: 'scaleFees',
    accessorKey: 'scaleFees',
    header: 'ميزان',
    cell: ({ row }) => row.original.scaleFees ?? '-',
  },
  {
    id: 'tipsFees',
    accessorKey: 'tipsFees',
    header: 'اكراميات',
    cell: ({ row }) => row.original.tipsFees ?? '-',
  },
  {
    id: 'packingType',
    accessorKey: 'packingType',
    header: 'نوع البضاعة',
    cell: ({ row }) => {
      const value = row.original.packingType;
      if (!value) return '-';
      return packingTypeLabels[value as PackingType] ?? value;
    },
  },
];
