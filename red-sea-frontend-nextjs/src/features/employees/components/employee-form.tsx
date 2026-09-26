'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { CalendarIcon, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { UserRoles } from '@/enums/users/user-roles';
import { UserStatus } from '@/enums/users/user-status';
import { SalaryTypes } from '@/enums/salary-types';
import { cn } from '@/lib/utils';

import { useCreateEmployee } from '@/features/employees/api/create';
import { useUpdateEmployee } from '@/features/employees/api/update';
import { useGetOneEmployee } from '@/features/employees/api/get-one';
import type { IEmployee } from '@/features/employees/types';
import {
  createEmployeeSchema,
  type CreateEmployeeFormValues,
} from '@/features/employees/types/employee-schema';

interface EmployeeFormProps {
  branchId: number;
  employeeId?: number | null;
}

export default function EmployeeForm({ branchId, employeeId }: EmployeeFormProps) {
  const router = useRouter();
  const t = useTranslations('employees');

  const isEdit = employeeId !== null && employeeId !== undefined;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { employee, isGetEmployeePending } = useGetOneEmployee(employeeId ?? null, isEdit);
  const { createEmployeeMutation, isCreateEmployeePending } = useCreateEmployee();
  const { updateEmployeeMutation, isUpdateEmployeePending } = useUpdateEmployee();

  const form = useForm<CreateEmployeeFormValues>({
    resolver: zodResolver(createEmployeeSchema(t, isEdit)),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      personalId: '',
      personalIdExpiryDate: undefined,
      branchId: branchId,
      joinDate: new Date(),
      salaryAmount: '',
      salaryType: 'MONTHLY',
      status: 'AVAILABLE',
      activated: true,
    },
  });

  useEffect(() => {
    if (employee && isEdit) {
      form.reset({
        id: employee.id,
        firstName: employee.user?.firstName ?? '',
        lastName: employee.user?.lastName ?? '',
        email: employee.user?.email ?? '',
        password: '',
        confirmPassword: '',
        phone: employee.user?.contacts?.[0]?.phone ?? '',
        personalId: employee.user?.personalId ?? '',
        personalIdExpiryDate: employee.user?.personalIdExpiryDate
          ? new Date(employee.user.personalIdExpiryDate)
          : undefined,
        branchId: employee.branchId ?? branchId,
        joinDate: employee.createdAt ? new Date(employee.createdAt) : new Date(),
        salaryAmount: employee.user?.salary?.salaryAmount?.toString() ?? '',
        salaryType: employee.user?.salary?.salaryType ?? 'MONTHLY',
        status: employee.user?.status ?? 'AVAILABLE',
        activated: employee.user?.status === UserStatus.AVAILABLE,
      });
    }
  }, [employee, isEdit, form, branchId]);

  const buildUserPayload = (data: CreateEmployeeFormValues) => {
    const salaryAmount = Number(data.salaryAmount);
    const user: IEmployee['user'] = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      role: UserRoles.DATA_ENTRY,
      personalId: data.personalId,
      personalIdExpiryDate: data.personalIdExpiryDate,
      status: data.status === 'AVAILABLE' ? UserStatus.AVAILABLE : UserStatus.UNAVAILABLE,
      createdAt: data.joinDate,
      contacts: data.phone ? [{ phone: data.phone, isPrimary: true }] : [],
    };

    if (!Number.isNaN(salaryAmount) && salaryAmount > 0 && data.salaryType) {
      user.salary = {
        salaryAmount,
        salaryType: data.salaryType as SalaryTypes,
      };
    }

    if (data.password) {
      user.password = data.password;
    }

    return user;
  };

  const onSubmit = async (data: CreateEmployeeFormValues) => {
    if (isEdit && employee?.id) {
      const employeeData: IEmployee = {
        id: employee.id,
        branchId: branchId,
        user: buildUserPayload(data),
      };

      updateEmployeeMutation(
        { id: employee.id, data: employeeData },
        {
          onSuccess: () => {
            router.push(`/branches/${branchId}/employees/${employee.id}`);
          },
        },
      );
      return;
    }

    const employeeData: IEmployee = {
      branchId: branchId,
      user: buildUserPayload(data),
    };

    createEmployeeMutation(employeeData, {
      onSuccess: () => {
        router.push(`/branches/${branchId}`);
      },
    });
  };

  const isLoading = isCreateEmployeePending || isUpdateEmployeePending;

  if (isGetEmployeePending && isEdit) {
    return (
      <div className="flex items-center justify-center h-60">
        <Loader2 className="animate-spin text-primary" size={36} />
      </div>
    );
  }

  return (
    <>
      <h3 className="text-xl font-bold text-right">
        {isEdit ? t('edit-employee') : t('add-employee')}
      </h3>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.first-name')} :</FormLabel>
                  <FormControl>
                    <Input placeholder={t('placeholders.first-name')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.last-name')} :</FormLabel>
                  <FormControl>
                    <Input placeholder={t('placeholders.last-name')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fields.email')} :</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={t('placeholders.email')}
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {isEdit ? t('fields.new-password') : t('fields.password')} :
                  </FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder={t('placeholders.password')}
                        autoComplete="new-password"
                        className="pr-10"
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword((prev) => !prev)}
                      tabIndex={-1}
                      aria-label={showPassword ? t('hide-password') : t('show-password')}
                    >
                      {showPassword ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.confirm-password')} :</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder={t('placeholders.confirm-password')}
                        autoComplete="new-password"
                        className="pr-10"
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      tabIndex={-1}
                      aria-label={
                        showConfirmPassword ? t('hide-password') : t('show-password')
                      }
                    >
                      {showConfirmPassword ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fields.phone')} :</FormLabel>
                <FormControl>
                  <Input placeholder={t('placeholders.phone')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="personalId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fields.personal-id')} :</FormLabel>
                <FormControl>
                  <Input placeholder={t('placeholders.personal-id')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="personalIdExpiryDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t('fields.personal-id-expiry-date')} :</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full pl-3 text-left font-normal justify-start',
                          !field.value && 'text-muted-foreground',
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, 'dd/MM/yyyy') : <span>DD/MM/YYYY</span>}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="salaryType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.salary-type')} :</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t('fields.salary-type')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MONTHLY">{t('salary-types.MONTHLY')}</SelectItem>
                      <SelectItem value="DAILY">{t('salary-types.DAILY')}</SelectItem>
                      <SelectItem value="HOURLY">{t('salary-types.HOURLY')}</SelectItem>
                      <SelectItem value="FIXED">{t('salary-types.FIXED')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="salaryAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.salary')} :</FormLabel>
                  <FormControl>
                    <Input placeholder={t('placeholders.salary')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="joinDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t('fields.join-date')} :</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full pl-3 text-left font-normal justify-start',
                          !field.value && 'text-muted-foreground',
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, 'dd/MM/yyyy') : <span>DD/MM/YYYY</span>}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {isEdit && (
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.status')} :</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t('fields.status')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="AVAILABLE">{t('statuses.AVAILABLE')}</SelectItem>
                      <SelectItem value="UNAVAILABLE">{t('statuses.UNAVAILABLE')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <div className="flex gap-2 pt-4 justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Spinner className="mr-2" />}
              {isEdit ? t('buttons.save') : t('add-employee')}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              {t('buttons.cancel')}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
