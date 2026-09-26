'use client';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ExportButton from '@/components/common/export-button';

type ActivityToolbarProps = {
  onAdd?: () => void;
  showAdd?: boolean;
  onExport?: () => void | Promise<void>;
  isExporting?: boolean;
};

export default function ActivityToolbar({
  onAdd,
  showAdd,
  onExport,
  isExporting,
}: ActivityToolbarProps) {
  return (
    <div className="w-full flex items-center justify-between">
      <h1 className="text-2xl font-bold">الانشطة</h1>

      <div className="flex gap-2">
        <ExportButton onExport={onExport} isExporting={isExporting} />
        {showAdd && (
          <Button onClick={onAdd}>
            <Plus className="w-4 h-4" />
            اضافة/تعديل النشاط المالـي
          </Button>
        )}
      </div>
    </div>
  );
}
