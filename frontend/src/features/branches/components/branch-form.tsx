'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { BranchSchema, BranchFormValues } from '../types/create-schema';
import { IBranch } from '../types';
import { useCreateBranch } from '../api/create';
import { useEditBranch } from '../api/update';

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

interface BranchFormProps {
  branch?: IBranch; // Edit mode if provided
}

export const BranchForm = ({ branch }: BranchFormProps) => {
  const t = useTranslations('branches');
  const router = useRouter();

  const { createBranchMutate, isCreateBranchPending } = useCreateBranch();
  const { editBranchMutation, isEditBranchLoading } = useEditBranch();

  const form = useForm<BranchFormValues>({
    resolver: zodResolver(BranchSchema),
    defaultValues: {
      name: '',
    },
  });

  useEffect(() => {
    if (branch) {
      form.reset({
        name: branch.name ?? '',
      });
    }
  }, [branch, form]);

  const onSubmit = (data: BranchFormValues) => {
    console.log('SUBMIT DATA:', data);

    if (branch?.id) {
      // Edit mode
      editBranchMutation(
        { id: branch.id, data },
        {
          onSuccess: () => router.push('/branches'),
        },
      );
    } else {
      // Create mode
      createBranchMutate(data, {
        onSuccess: () => router.push('/branches'),
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* اسم الفرع */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>اسم الفرع</FormLabel>
              <FormControl>
                <Input placeholder="اسم الفرع" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            إلغاء
          </Button>
          <Button type="submit" disabled={isCreateBranchPending || isEditBranchLoading}>
            {(isCreateBranchPending || isEditBranchLoading) && <Spinner className="mr-2" />}
            حفظ
          </Button>
        </div>
      </form>
    </Form>
  );
};
