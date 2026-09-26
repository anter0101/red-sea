import React from 'react';
import { useTranslations } from 'next-intl';
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
import { Input } from '@/components/ui/input';
import { useCreateTireModel } from '@/features/cars/apis/create-tire-model';
import { zodResolver } from '@hookform/resolvers/zod';

interface AddTireModelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(1, { message: t('name-required') }),
  });

type FormValues = z.infer<ReturnType<typeof formSchema>>;

const AddTireModelDialog = ({ open, onOpenChange }: AddTireModelDialogProps) => {
  const t = useTranslations('cars.tire-model');

  const { createTireModelMutation, isCreateTireModelPending } = useCreateTireModel();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema(t)),
    defaultValues: {
      name: '',
    },
  });

  const onSubmit = (data: FormValues) => {
    createTireModelMutation(data, {
      onSuccess: () => {
        onOpenChange(false);
        form.reset();
      },
    });
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.stopPropagation();
              form.handleSubmit(onSubmit)(e);
            }}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('name-label')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('name-placeholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={handleCancel}>
                {t('cancel-button')}
              </Button>

              <Button type="submit" disabled={isCreateTireModelPending}>
                {isCreateTireModelPending ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  t('add-button')
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTireModelDialog;
