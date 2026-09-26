'use client';

import React, { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';

import ExportButton from '@/components/common/export-button';
import ReusableCard from '@/components/common/reusable-card';
import TablePagination from '@/components/common/table-pagination';
import EntityToggleTabs from '@/components/common/toggle-tabs';
import { Button } from '@/components/ui/button';
import DeleteEmployeeDialog from '@/features/employees/components/delete-employee-dialog';
import EmployeesTable from '@/features/employees/components/employees-table';
import { employeesExportColumns, mapEmployeeRow } from '@/features/employees/export.config';
import { useEmployeesPage } from '@/features/employees/hooks/use-employees-page';
import { useTableExport } from '@/hooks/use-table-export';
import { usePaginationParams } from '@/hooks/use-pagination-params';

import JourneyList from '@/features/trips/components/journey-list';
import { useGetJourneyStats } from '@/features/trips/api/get-journey-stats';

import { useBranchPage } from '../hooks/use-branch-page';

function formatMoney(value: number | undefined, pending: boolean): string {
  if (pending) return '...';
  return `${Number(value ?? 0).toLocaleString('en-EG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} EGP`;
}

export default function BranchPageClient({ branchId }: { branchId: string }) {
  const t = useTranslations('branches');
  const tEmployees = useTranslations('employees');
  const tCommon = useTranslations('common');
  const paginationParams = usePaginationParams();

  const {
    branch,
    isGetBranchPending,
    error,
    activeTab,
    setActiveTab,
    handleDelete,
    isDeleteBranchPending,
  } = useBranchPage(Number(branchId));

  const { data: journeyStats, isPending: isJourneyStatsPending } = useGetJourneyStats({
    branchId: Number(branchId),
  });

  const {
    employees,
    isLoading: isEmployeesLoading,
    totalEmployeesCount,
    handleAddEmployee,
    handleEditEmployee,
  } = useEmployeesPage(Number(branchId));

  const employeeExportParams = useMemo(
    () => ({ ...paginationParams, branchId: Number(branchId) }),
    [branchId, paginationParams],
  );

  const { exportData, isExporting } = useTableExport({
    endPoint: '/api/employees',
    params: employeeExportParams,
    columns: employeesExportColumns(tEmployees, tCommon),
    mapRow: mapEmployeeRow,
    fileName: `branch-${branchId}-employees`,
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);

  const handleDeleteEmployee = (id: number) => {
    setSelectedEmployeeId(id);
    setDeleteDialogOpen(true);
  };

  const tabs = [
    { id: 'emp', label: t('tabs.employees') },
    { id: 'trips', label: t('tabs.trips') },
    { id: 'accounts', label: t('tabs.accounts') },
  ];

  return (
    <div className="pageContainer flex flex-col gap-6">
      <div className="w-full flex justify-center">
        <EntityToggleTabs
          tabs={tabs}
          value={activeTab}
          defaultTab="emp"
          onChange={setActiveTab}
        />
      </div>

      {activeTab === 'emp' && (
        <div className="flex flex-col gap-4">
          {/* Stats Cards */}
          <div className="flex gap-2">
            <ReusableCard
              data={{
                title: t('stats.total-expenses'),
                value: formatMoney(journeyStats?.totalExpenses, isJourneyStatsPending),
              }}
              color="primary"
            />
            <ReusableCard
              data={{
                title: t('stats.total-revenue'),
                value: formatMoney(journeyStats?.totalRevenue, isJourneyStatsPending),
              }}
              color="secondary"
            />
            <ReusableCard
              data={{
                title: t('stats.total-net'),
                value: formatMoney(journeyStats?.totalProfit, isJourneyStatsPending),
              }}
              color="primary"
            />
          </div>

          {/* Toolbar */}
          <div className="w-full flex items-center justify-between">
            <h2 className="text-2xl font-bold">{t('sections.employees')}</h2>
            <div className="flex gap-2">
              <Button onClick={handleAddEmployee}>
                <Plus className="w-4 h-4" /> {t('actions.add-employee')}
              </Button>
              <ExportButton onExport={exportData} isExporting={isExporting} />
            </div>
          </div>

          {/* Employees Table */}
          {isEmployeesLoading ? (
            <p className="text-center p-4">{tCommon('loading')}</p>
          ) : (
            <>
              <EmployeesTable
                data={employees ?? []}
                branchId={Number(branchId)}
                onEdit={handleEditEmployee}
                onDelete={handleDeleteEmployee}
              />
              <TablePagination totalCount={totalEmployeesCount} />
            </>
          )}
        </div>
      )}

      {activeTab === 'trips' && (
        <JourneyList scope={{ branchId: Number(branchId) }} showStats />
      )}

      {activeTab === 'accounts' && (
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <ReusableCard
              data={{
                title: t('stats.total-expenses'),
                value: formatMoney(journeyStats?.totalExpenses, isJourneyStatsPending),
              }}
              color="primary"
            />
            <ReusableCard
              data={{
                title: t('stats.total-revenue'),
                value: formatMoney(journeyStats?.totalRevenue, isJourneyStatsPending),
              }}
              color="secondary"
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteEmployeeDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        employeeId={selectedEmployeeId}
      />
    </div>
  );
}
