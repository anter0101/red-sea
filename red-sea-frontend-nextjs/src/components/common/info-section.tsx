// components/ui/info-section.tsx
'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type InfoItem = {
  label: string;
  value: string | number;
};

type InfoSectionProps = {
  title?: string;
  items: InfoItem[];
  showEdit?: boolean;
  onEdit?: () => void;
  showCreate?: boolean;
  onCreate?: () => void;
  className?: string;
};

export default function InfoSection({
  title,
  items,
  showEdit = true,
  onEdit,
  showCreate = false,
  onCreate,
  className,
}: InfoSectionProps) {
  return (
    <div className={cn('w-full flex flex-col gap-2 bg-white shadow-sm border rounded-xl p-4 ')}>
      {/* Header */}
      {title && (
        <div className="flex items-center justify-between pb-2 border-b h-12">
          <h2 className="text-lg font-semibold ">{title}</h2>

          {showCreate && (
            <Button
              onClick={onCreate}
              variant="ghost"
              className="text-primary cursor-pointer hover:text-primary border-primary hover:bg-primary/10 border rounded-md text-sm"
            >
              إنشاء
            </Button>
          )}

          {showEdit && (
            <Button
              onClick={onEdit}
              variant="ghost"
              className="text-primary cursor-pointer hover:text-primary border-primary hover:bg-primary/10 border rounded-md text-sm"
            >
              تعديل
            </Button>
          )}
        </div>
      )}

      {/* Info Items */}
      <div className="flex flex-wrap gap-y-4 gap-x-8">
        {items.map((item, id) => (
          <div key={id} className={cn('w-[calc(50%-18px)]  flex justify-between', className)}>
            <span className="text-gray-700 font-medium">{item.label} :</span>
            <span className="text-gray-900 font-semibold">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
