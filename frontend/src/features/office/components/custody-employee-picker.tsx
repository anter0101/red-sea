'use client';

import { useTranslations } from 'next-intl';
import { type UseFormReturn, useWatch } from 'react-hook-form';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGetAllBranches } from '@/features/branches/api/get-all';
import { useGetAllEmployees } from '@/features/employees/api/get-all';

import type { OfficeJourneyFormValues } from '../types/office-journey-schema';

interface CustodyEmployeePickerProps {
  form: UseFormReturn<OfficeJourneyFormValues>;
}

/** Admin only: pick the office, then the employee of that office whose custody funds the journey. */
export default function CustodyEmployeePicker({ form }: CustodyEmployeePickerProps) {
  const t = useTranslations('office.form');
  const branchId = useWatch({ control: form.control, name: 'custodyBranchId' });
  const employeeId = useWatch({ control: form.control, name: 'custodyEmployeeId' });

  const { branches } = useGetAllBranches({ pageSize: 100 });
  const { employees, isGetEmployeesPending } = useGetAllEmployees(
    { branchId: Number(branchId) || undefined, pageSize: 100 },
    { enabled: !!branchId },
  );

  const onBranchChange = (value: string) => {
    form.setValue('custodyBranchId', value, { shouldValidate: true });
    form.setValue('custodyEmployeeId', '', { shouldValidate: true });
    form.setValue('custodyAmount', '');
  };

  const onEmployeeChange = (value: string) => {
    form.setValue('custodyEmployeeId', value, { shouldValidate: true });
    form.setValue('custodyAmount', '');
  };

  const { errors } = form.formState;
  const showNoEmployees = !!branchId && !isGetEmployeesPending && employees.length === 0;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="flex flex-col gap-1">
        <Label>{t('custodyOffice')}</Label>
        <Select value={branchId || undefined} onValueChange={onBranchChange}>
          <SelectTrigger className="w-full" aria-label={t('custodyOffice')}>
            <SelectValue placeholder={t('custodyOfficePlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            {branches.map((branch) => (
              <SelectItem key={branch.id} value={String(branch.id)}>
                {branch.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.custodyBranchId && (
          <p className="text-sm text-destructive">{errors.custodyBranchId.message as string}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <Label>{t('custodyEmployee')}</Label>
        <Select
          value={employeeId || undefined}
          onValueChange={onEmployeeChange}
          disabled={!branchId || showNoEmployees}
        >
          <SelectTrigger className="w-full" aria-label={t('custodyEmployee')}>
            <SelectValue placeholder={t('custodyEmployeePlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            {employees.map((employee) => (
              <SelectItem key={employee.id} value={String(employee.id)}>
                {employee.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {showNoEmployees ? (
          <p className="text-xs text-muted-foreground">{t('noEmployeesInOffice')}</p>
        ) : (
          <p className="text-xs text-muted-foreground">{t('custodyEmployeeHint')}</p>
        )}
        {errors.custodyEmployeeId && (
          <p className="text-sm text-destructive">{errors.custodyEmployeeId.message as string}</p>
        )}
      </div>
    </div>
  );
}
