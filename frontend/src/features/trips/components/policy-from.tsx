'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import type { Resolver } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { useCreateTripPolicy } from '../api/create/create-policy';
import { useEditTripPolicy } from '../api/update/update-policy';
import { useGetOnePolicy } from '../api/get-one/get-one-policy';
import { useGetOneTrip } from '../api/get-one/get-one';
import { tripPolicySchema, type TripPolicyFormValues } from '../types/activity-schema';
import type { ITripPolicyRes } from '../types/policy';

interface PolicyFormProps {
  journeyId: number;
  mode: 'update' | 'create';
  onSaved?: () => void;
}

/* ------------------------------ Default Values ----------------------------- */
const DEFAULT_VALUES: TripPolicyFormValues = {
  journeyId: undefined,
  deliveryAreaId: undefined,
  deliveryGovId: undefined,
  employeeId: undefined,
  policyNo: '',
  policyDate: '',
  loadingPermitNo: '',
  loadingDate: '',
  bookWeight: undefined,
  actualWeight: undefined,
  deliveryWeight: undefined,
  shortageQty: undefined,
  entryTimeFactory: '',
  exitTimeFactory: '',
  archiveNo: '',
  tripDate: '',
  tripDistance: undefined,
  policyFile: '',
};

function nextDay(isoDate: string): string {
  const [year, month, day] = isoDate.slice(0, 10).split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

function toOptionalNumber(value?: string | number | null): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const num = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(num) ? num : undefined;
}

/* -------------------------- Map API → Form Values ------------------------- */
function mapPolicyToFormValues(policy: ITripPolicyRes): TripPolicyFormValues {
  return {
    policyNo: policy.policyNo ?? '',
    policyDate: policy.policyDate ?? '',
    loadingPermitNo: policy.loadingPermitNo ?? '',
    loadingDate: policy.loadingDate ?? '',

    bookWeight: policy.bookWeight,
    actualWeight: policy.actualWeight,
    deliveryWeight: policy.deliveryWeight,
    shortageQty: policy.shortageQty,

    entryTimeFactory: policy.entryTimeFactory ?? '',
    exitTimeFactory: policy.exitTimeFactory ?? '',

    archiveNo: policy.archiveNo ?? '',
    tripDate: policy.tripDate ?? '',
    tripDistance: policy.tripDistance,
    policyFile: policy.attachments?.[0]?.fileName ?? '',
  };
}

/* --------------------------- Main Component ------------------------------- */
export const PolicyForm = ({ journeyId, mode, onSaved }: PolicyFormProps) => {
  const router = useRouter();

  /* ---------------------------- Data Fetching ----------------------------- */

  const { policy, isGetPolicyPending } = useGetOnePolicy(journeyId ?? null);
  const { tripResponse } = useGetOneTrip(journeyId ?? null);

  const { createTripPolicyMutation, isCreateTripPolicyPending } = useCreateTripPolicy();
  const { editTripPolicyMutation, isEditTripPolicyLoading } = useEditTripPolicy(journeyId);

  const isEditMode = mode ? mode === 'update' : !!policy;
  const isSubmitting = isEditMode ? isEditTripPolicyLoading : isCreateTripPolicyPending;
  /* --------------------------- Form Init ---------------------------------- */
  const form = useForm<TripPolicyFormValues>({
    resolver: zodResolver(tripPolicySchema) as Resolver<TripPolicyFormValues>,
    defaultValues: DEFAULT_VALUES,
  });

  /* --------------------------- Reset Form Logic --------------------------- */

  const delegateDate = tripResponse?.journey?.delegateDate?.slice(0, 10);
  const minPolicyDate = delegateDate ? nextDay(delegateDate) : undefined;

  useEffect(() => {
    if (isEditMode && policy) {
      form.reset(mapPolicyToFormValues(policy));
      return;
    }
    if (!isEditMode) form.reset(DEFAULT_VALUES);
  }, [isEditMode, policy, form]);

  /* ----------------------------- Submit Logic ----------------------------- */
  const onSubmit = (data: TripPolicyFormValues) => {
    const normalizedJourneyId = toOptionalNumber(journeyId);
    if (!normalizedJourneyId || !Number.isInteger(normalizedJourneyId)) {
      toast.error('رقم الرحلة غير صالح');
      return;
    }

    if (delegateDate && data.policyDate && data.policyDate.slice(0, 10) <= delegateDate) {
      toast.error('تاريخ البوليصة لازم يكون بعد تاريخ إصدار التفويض');
      return;
    }

    const payload: ITripPolicyInfo = {
      ...data,
      journeyId: normalizedJourneyId,
      bookWeight: data.bookWeight,
      actualWeight: data.actualWeight,
      deliveryWeight: data.deliveryWeight,
      shortageQty: data.shortageQty,
    };
    if (isEditMode) {
      editTripPolicyMutation(
        {
          data: payload,
        },
        {
          onSuccess: () => {
            toast.success('تم تحديث البوليصة بنجاح');
            if (onSaved) onSaved();
            else router.push(`/trips/${journeyId}`);
          },
        },
      );
    } else {
      createTripPolicyMutation(payload, {
        onSuccess: () => {
          toast.success('تم إنشاء البوليصة بنجاح');
          if (onSaved) onSaved();
          else router.push(`/trips/${journeyId}`);
        },
      });
    }
  };

  /* ---------------------------- Loading Guard ----------------------------- */
  if (isEditMode && isGetPolicyPending) {
    return <div className="p-4">Loading policy data...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" dir="rtl">
        {/* Policy Number */}
        <FormField
          control={form.control}
          name="policyNo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>رقم البوليصة</FormLabel>
              <FormControl>
                <Input placeholder="POL-2025-009" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Policy Date */}
        <FormField
          control={form.control}
          name="policyDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>تاريخ البوليصة</FormLabel>
              <FormControl>
                <Input type="date" min={minPolicyDate} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Loading Permit Number */}
        <FormField
          control={form.control}
          name="loadingPermitNo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>رقم اذن التحميل</FormLabel>
              <FormControl>
                <Input placeholder="LPM-0092" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Loading Date */}
        <FormField
          control={form.control}
          name="loadingDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>تاريخ التحميل</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Book Weight */}
        <FormField
          control={form.control}
          name="bookWeight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الوزن الدفتري</FormLabel>
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

        {/* Actual Weight */}
        <FormField
          control={form.control}
          name="actualWeight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الوزن الفعلي</FormLabel>
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

        {/* Delivery Weight */}
        <FormField
          control={form.control}
          name="deliveryWeight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>وزن التسليم</FormLabel>
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

        {/* Shortage Quantity */}
        <FormField
          control={form.control}
          name="shortageQty"
          render={({ field }) => (
            <FormItem>
              <FormLabel>عجز الكمية</FormLabel>
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

        {/* Entry & Exit Times */}
        <FormField
          control={form.control}
          name="entryTimeFactory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>وقت دخول المصنع</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="exitTimeFactory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>وقت الخروج من المصنع</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Archive Number */}
        <FormField
          control={form.control}
          name="archiveNo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>رقم ارشيف المستندات</FormLabel>
              <FormControl>
                <Input type="text" placeholder="" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Trip Date */}
        <FormField
          control={form.control}
          name="tripDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>تاريخ الرحلة</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Trip Distance */}
        <FormField
          control={form.control}
          name="tripDistance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>مسافة الرحلة</FormLabel>
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

        {/* Policy File */}
        <FormField
          control={form.control}
          name="policyFile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ملف البوليصة</FormLabel>
              <FormControl>
                <Input type="text" placeholder="abc.pdf" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isEditMode ? 'تحديث' : 'حفظ'}
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
