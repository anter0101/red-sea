'use client';

import { useEffect, useMemo } from 'react';
import { Resolver, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { tripFeesFormSchema, TripFeesFormSchema } from '../types/transactions-schema';

import { ITripFeesPayload, ITripTransaction, TripTransactionCategory } from '../types/transactions';
import { useGetOneTransaction } from '../api/get-one/get-one-transaction';
import { useCreateTransactionActivity } from '../api/create/create-transactions';

interface TransactionsFormProps {
  journeyId: number;
}

export const TransactionsForm = ({ journeyId }: TransactionsFormProps) => {
  const router = useRouter();
  /* ----------------------- Data Mutation ----------------------- */ const {
    transactions,
    isGettransactionsPending,
  } = useGetOneTransaction(journeyId);
  const { createTransactionActivityMutation, isCreateTransactionActivityPending } =
    useCreateTransactionActivity();

  const isSubmitting = isCreateTransactionActivityPending;

  /* -------------------------- Form Init ------------------------ */
  const form = useForm<TripFeesFormSchema>({
    resolver: zodResolver(tripFeesFormSchema) as Resolver<TripFeesFormSchema>,
    defaultValues: {
      cardName: '',
      fuelLiters: undefined,
      officeFee: undefined,
      loadingFee: undefined,
      weighingFee: undefined,
      cardFee: undefined,
      crossingFee: undefined,
      permitPortFee: undefined,
      portFee: undefined,
      solarFee: undefined,
      otherExpenses: undefined,
    },
  });

  /* ---------------------- Reset Form If Editing ---------------- */
  useEffect(() => {
    if (!transactions) {
      return;
    }

    const categoryMap: Record<string, number> = {};

    let cardName: string | undefined;
    let fuelLiters: number | undefined;

    transactions.transactions.forEach((t) => {
      categoryMap[t.category] = t.amount;

      if (t.category === TripTransactionCategory.CARD_FEES) {
        cardName = t.description ?? '';
      }

      if (t.category === TripTransactionCategory.DIESEL_FEES) {
        fuelLiters = t.quantity;
      }
    });

    form.reset({
      cardName,
      fuelLiters,
      officeFee: categoryMap[TripTransactionCategory.OFFICE_FEES],
      loadingFee: categoryMap[TripTransactionCategory.LOADING_FEES],
      weighingFee: categoryMap[TripTransactionCategory.WEIGHING_FEES],
      cardFee: categoryMap[TripTransactionCategory.CARD_FEES],
      crossingFee: categoryMap[TripTransactionCategory.CROSSING_FEES],
      permitPortFee: categoryMap[TripTransactionCategory.PORT_PERMIT_FEES],
      portFee: categoryMap[TripTransactionCategory.PORT_FEES],
      solarFee: categoryMap[TripTransactionCategory.DIESEL_FEES],
      otherExpenses: categoryMap[TripTransactionCategory.OTHER_EXPENSES],
    });
  }, [transactions, form]);

  /* ------------------------- Submit Logic --------------------- */
  const onSubmit = (data: TripFeesFormSchema) => {
    const transactions: ITripTransaction[] = [];

    if (data.officeFee) {
      transactions.push({
        category: TripTransactionCategory.OFFICE_FEES,
        amount: data.officeFee,
        description: 'رسوم مكتبية',
      });
    }

    if (data.loadingFee) {
      transactions.push({
        category: TripTransactionCategory.LOADING_FEES,
        amount: data.loadingFee,
        description: 'رسوم تحميل',
      });
    }

    if (data.weighingFee) {
      transactions.push({
        category: TripTransactionCategory.WEIGHING_FEES,
        amount: data.weighingFee,
        description: 'رسوم ميزان',
      });
    }

    if (data.cardFee) {
      transactions.push({
        category: TripTransactionCategory.CARD_FEES,
        amount: data.cardFee,
        description: data.cardName,
      });
    }

    if (data.crossingFee) {
      transactions.push({
        category: TripTransactionCategory.CROSSING_FEES,
        amount: data.crossingFee,
        description: 'رسوم عبور',
      });
    }

    if (data.permitPortFee) {
      transactions.push({
        category: TripTransactionCategory.PORT_PERMIT_FEES,
        amount: data.permitPortFee,
        description: 'رسوم تصاريح ميناء',
      });
    }

    if (data.portFee) {
      transactions.push({
        category: TripTransactionCategory.PORT_FEES,
        amount: data.portFee,
        description: 'رسوم ميناء',
      });
    }

    if (data.solarFee) {
      transactions.push({
        category: TripTransactionCategory.DIESEL_FEES,
        amount: data.solarFee,
        quantity: data.fuelLiters,
        description: 'رسوم سولار',
      });
    }

    if (data.otherExpenses) {
      transactions.push({
        category: TripTransactionCategory.OTHER_EXPENSES,
        amount: data.otherExpenses,
        description: 'مصروفات أخرى',
      });
    }

    const payload: ITripFeesPayload = {
      journeyId,
      transactionType: 'EXPENSE',
      transactions,
    };

    createTransactionActivityMutation(payload, {
      onSuccess: () => {
        router.push(`/trips/${journeyId}`);
      },
    });
  };

  /* ------------------------ Loading Guard --------------------- */

  /* -------------------------- Form UI ------------------------- */
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" dir="rtl">
        <FormField
          control={form.control}
          name="cardName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>اسم الكارته</FormLabel>
              <FormControl>
                <Input placeholder="اسم الكارته" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fuelLiters"
          render={({ field }) => (
            <FormItem>
              <FormLabel>عدد لترات الوقود</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
                  value={field.value ?? ''}
                  onChange={(e) =>
                    field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="officeFee"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الرسوم المكتبية</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
                  value={field.value ?? ''}
                  onChange={(e) =>
                    field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="loadingFee"
          render={({ field }) => (
            <FormItem>
              <FormLabel>رسوم التحميل</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
                  value={field.value ?? ''}
                  onChange={(e) =>
                    field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="weighingFee"
          render={({ field }) => (
            <FormItem>
              <FormLabel>رسوم الميزان</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
                  value={field.value ?? ''}
                  onChange={(e) =>
                    field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cardFee"
          render={({ field }) => (
            <FormItem>
              <FormLabel>رسوم الكارت</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
                  value={field.value ?? ''}
                  onChange={(e) =>
                    field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="crossingFee"
          render={({ field }) => (
            <FormItem>
              <FormLabel>رسوم العبور</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
                  value={field.value ?? ''}
                  onChange={(e) =>
                    field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="permitPortFee"
          render={({ field }) => (
            <FormItem>
              <FormLabel>رسوم تصاريح الميناء</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
                  value={field.value ?? ''}
                  onChange={(e) =>
                    field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="portFee"
          render={({ field }) => (
            <FormItem>
              <FormLabel>رسوم الميناء</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
                  value={field.value ?? ''}
                  onChange={(e) =>
                    field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="solarFee"
          render={({ field }) => (
            <FormItem>
              <FormLabel>رسوم الديزل</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
                  value={field.value ?? ''}
                  onChange={(e) =>
                    field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="otherExpenses"
          render={({ field }) => (
            <FormItem>
              <FormLabel>مصروفات أخرى</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
                  value={field.value ?? ''}
                  onChange={(e) =>
                    field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={isSubmitting}>
            حفظ
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            إلغاء
          </Button>
        </div>
      </form>
    </Form>
  );
};
