'use client';

import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

import EntityHeader from '@/components/common/entity-header';
import InfoSection from '@/components/common/info-section';

import { useEmployeePage } from '../hooks/use-employee-page';

export default function EmployeePageClient({
  branchId,
  employeeId,
}: {
  branchId: string;
  employeeId: string;
}) {
  const t = useTranslations('employees');
  const tCommon = useTranslations('common');

  const { employee, isGetEmployeePending, error, handleDelete, handleEdit } = useEmployeePage(
    Number(branchId),
    Number(employeeId),
  );

  const formatDate = (date: Date | string | undefined) => {
    if (!date) {
      return '—';
    }
    return format(new Date(date), 'dd/MM/yyyy');
  };

  if (isGetEmployeePending) {
    return (
      <div className="flex items-center justify-center h-60">
        <Loader2 className="animate-spin text-primary" size={36} />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600 text-center py-8">{t('messages.loading-error')}</div>;
  }

  if (!employee) {
    return <div className="text-center py-8">{t('messages.not-found')}</div>;
  }

  const user = employee.user;
  const fullName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || '—';

  return (
    <div className="pageContainer flex flex-col gap-6">
      <EntityHeader name={fullName} onDelete={handleDelete} />

      <InfoSection
        showEdit
        onEdit={handleEdit}
        title={t('detail-page.personal-info')}
        items={[
          { label: t('detail-page.name'), value: fullName },
          { label: t('fields.phone'), value: user?.contacts?.[0]?.phone ?? '—' },
          { label: t('fields.personal-id'), value: user?.personalId ?? '—' },
          {
            label: t('fields.personal-id-expiry-date'),
            value: formatDate(user?.personalIdExpiryDate),
          },
          { label: t('fields.role'), value: user?.role ? t(`roles.${user.role}`) : '—' },
          {
            label: t('fields.salary'),
            value: user?.salary?.salaryAmount ? `${user.salary.salaryAmount} EGP` : '—',
          },
          {
            label: t('fields.salary-type'),
            value: user?.salary?.salaryType ? t(`salary-types.${user.salary.salaryType}`) : '—',
          },
          {
            label: t('fields.custody'),
            value: employee.custody != null ? `${employee.custody} EGP` : '—',
          },
          {
            label: t('fields.status'),
            value: user?.status ? tCommon(`statuses.${user.status}`) : '—',
          },
          { label: t('fields.join-date'), value: formatDate(employee.createdAt) },
          { label: t('fields.last-seen'), value: formatDate(employee.updatedAt) },
        ]}
      />
    </div>
  );
}
