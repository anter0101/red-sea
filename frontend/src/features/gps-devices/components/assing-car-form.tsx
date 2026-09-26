'use client';

import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { zodResolver } from '@hookform/resolvers/zod';

import { useAssignCarDevice } from '../api/update';
import { useGetAllCars } from '@/features/cars/api/get-all';
import { IAssignCarRequest } from '../types/device';
import { useQueryClient } from '@tanstack/react-query';

/* ================= Schema ================= */

const formSchema = z.object({
  carId: z.string().min(1, 'السيارة مطلوبة'),
});

type FormValues = z.infer<typeof formSchema>;

/* ================= Props ================= */

interface AssignCarDialogProps {
  deviceId: string | number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/* ================= Component ================= */

export default function AssignCarDeviceDialog({
  open,
  onOpenChange,
  deviceId,
}: AssignCarDialogProps) {
  const { assignCarMutation, isAssignCarLoading } = useAssignCarDevice(deviceId);

  const { cars, isGetCarsPending } = useGetAllCars();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      carId: '',
    },
  });

  /* ================= Submit ================= */

  const onSubmit = (values: FormValues) => {
    const payload: IAssignCarRequest = {
      carId: Number(values.carId),
    };

    assignCarMutation(
      { data: payload },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['api', 'gps-devices'] });
          form.reset();
          onOpenChange(false);
        },
      },
    );
  };

  /* ================= Cancel ================= */

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  /* ================= Render ================= */

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl">
        <DialogHeader>
          <DialogTitle>تعيين سيارة للجهاز</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* ================= Select ================= */}
            <FormField
              control={form.control}
              name="carId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>السيارة *</FormLabel>

                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isGetCarsPending}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="اختر السيارة" />
                      </SelectTrigger>

                      <SelectContent>
                        {cars?.map((car) => (
                          <SelectItem key={car.id} value={String(car.id)} className="w-full">
                            {car.plateNumber} - {car.model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ================= Buttons ================= */}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleCancel}>
                إلغاء
              </Button>

              <Button type="submit" disabled={isAssignCarLoading}>
                {isAssignCarLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'حفظ'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
