'use client';

import { EllipsisVertical } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const STEPS = [
  <>
    افتح قائمة المتصفح <EllipsisVertical className="inline size-4 align-text-bottom" aria-hidden />{' '}
    أعلى نافذة Google Chrome.
  </>,
  <>
    اختر <b>الإرسال والحفظ والمشاركة</b> <span dir="ltr">(Cast, save, and share)</span>.
  </>,
  <>
    اختر <b>تثبيت الصفحة كتطبيق</b> <span dir="ltr">(Install page as app)</span> ثم اضغط{' '}
    <b>تثبيت</b>.
  </>,
];

export default function InstallAppDialog({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir="rtl"
        className="sm:max-w-md [&>[data-slot=dialog-close]]:left-4 [&>[data-slot=dialog-close]]:right-auto"
      >
        <DialogHeader className="text-right sm:text-right">
          <DialogTitle>تثبيت التطبيق على سطح المكتب</DialogTitle>
          <DialogDescription>
            يفتح التطبيق في نافذة مستقلة مع أيقونة على سطح المكتب وقائمة ابدأ.
          </DialogDescription>
        </DialogHeader>
        <ol className="list-decimal space-y-3 pr-5 text-sm leading-6">
          {STEPS.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      </DialogContent>
    </Dialog>
  );
}
