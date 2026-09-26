'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { TransactionType } from '@/enums/transaction-type';
import { useCreatePartner } from '@/features/partners/api/create';
import { zodResolver } from '@hookform/resolvers/zod';

type AddPersonDialogMode = 'partner' | 'owner';

interface AddPartnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Contract car uses owner wording; shared ownership keeps partner. */
  mode?: AddPersonDialogMode;
}

const AddPartnerSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(2, t('validation.name-min-length')),
    phone: z.string().regex(/^(\+2)?01[0-5]\d{8}$/, t('validation.phone-invalid')),
    transactionType: z.enum(['INSTAPAY', 'VODAFONE_CASH']),
    paymentNumber: z.string().optional(),
    email: z.string().email(t('validation.email-invalid')).optional().or(z.literal('')),
    address: z.string().optional(),
    notes: z.string().optional(),
  });

type AddPartnerFormValues = z.infer<ReturnType<typeof AddPartnerSchema>>;

const AddPartnerDialog = ({ open, onOpenChange, mode = 'partner' }: AddPartnerDialogProps) => {
  const translationNamespace =
    mode === 'owner' ? 'cars.ownership.add-owner-dialog' : 'cars.ownership.add-partner';
  const t = useTranslations(translationNamespace);
  const { createPartnerMutation, isCreatePartnerPending } = useCreatePartner();

  const form = useForm<AddPartnerFormValues>({
    resolver: zodResolver(AddPartnerSchema(t)),
    defaultValues: {
      name: '',
      phone: '',
      transactionType: TransactionType.INSTAPAY,
      paymentNumber: '',
      email: '',
      address: '',
      notes: '',
    },
  });

  const onSubmit = (data: AddPartnerFormValues) => {
    createPartnerMutation({
      name: data.name,
      phone: data.phone,
      transactionType: data.transactionType,
      paymentNumber: data.paymentNumber,
      email: data.email,
      address: data.address,
      notes: data.notes,
    });
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">{t('title')}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('name')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('name-placeholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('phone')}</FormLabel>
                  <FormControl>
                    <Input placeholder="01012345678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Transaction Type */}
            <FormField
              control={form.control}
              name="transactionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('transfer-method')}</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INSTAPAY">{t('instapay')}</SelectItem>
                        <SelectItem value="VODAFONE_CASH">{t('vodafone-cash')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Payment Number */}
            <FormField
              control={form.control}
              name="paymentNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('transfer-number')}</FormLabel>
                  <FormControl>
                    <Input placeholder="01012345678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('email')}</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="ex@mail.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Address */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('address')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('notes')}</FormLabel>
                  <FormControl>
                    <Textarea className="resize-none" rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isCreatePartnerPending}
              >
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={isCreatePartnerPending}>
                {isCreatePartnerPending ? t('saving') : t('save')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPartnerDialog;
