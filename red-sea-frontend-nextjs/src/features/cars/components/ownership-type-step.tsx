'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
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
import { OwnerShipTypes } from '@/enums/ownership';
import {
  OwnershipTypeSchema,
  type IOwnershipTypeValues,
} from '@/features/cars/types/ownership-schema';
import { zodResolver } from '@hookform/resolvers/zod';

interface OwnershipTypeStepProps {
  initialOwnerShip?: OwnerShipTypes | null;
  onNext: (ownerShip: OwnerShipTypes) => void;
  onPrevious: () => void;
  isEditMode?: boolean;
}

const OWNERSHIP_OPTIONS = [
  OwnerShipTypes.NOLON_CAR,
  OwnerShipTypes.CONTRACT_CAR,
  OwnerShipTypes.COMPANY_CAR,
  OwnerShipTypes.SHARE,
] as const;

export default function OwnershipTypeStep({
  initialOwnerShip,
  onNext,
  onPrevious,
  isEditMode = false,
}: OwnershipTypeStepProps) {
  const t = useTranslations('cars');
  const tOwnership = useTranslations('cars.ownership');

  const form = useForm<IOwnershipTypeValues>({
    resolver: zodResolver(OwnershipTypeSchema(t)),
    defaultValues: {
      ownerShip: initialOwnerShip ?? undefined,
    },
    mode: 'onChange',
  });

  const onSubmit = (data: IOwnershipTypeValues) => {
    onNext(data.ownerShip);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <h2 className="text-xl font-semibold text-right">{tOwnership('type-label')}</h2>

        <FormField
          control={form.control}
          name="ownerShip"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{tOwnership('select-type')}</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isEditMode}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={tOwnership('select-type')} />
                  </SelectTrigger>
                  <SelectContent>
                    {OWNERSHIP_OPTIONS.map((value) => (
                      <SelectItem key={value} value={value}>
                        {tOwnership(`types.${value}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between gap-4">
          <Button type="button" variant="outline" onClick={onPrevious}>
            {t('buttons.cancel')}
          </Button>
          <Button type="submit">{t('buttons.next')}</Button>
        </div>
      </form>
    </Form>
  );
}
