'use client';

import { usePathname } from 'next/navigation';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

import ExportButton from '@/components/common/export-button';
import { Button } from '@/components/ui/button';
import { getRouteTitle } from '@/config/routes';

type EntityToolbarProps = {
  onAdd?: () => void;
  onExport?: () => void | Promise<void>;
  isExporting?: boolean;
  exportLabel?: string;
  description?: string;
};

export default function EntitiesToolbar({
  onAdd,
  onExport,
  isExporting,
  exportLabel,
  description,
}: EntityToolbarProps) {
  const pathname = usePathname();
  const t = useTranslations('common.toolbar');

  const currentTitle = getRouteTitle(pathname);

  return (
    <div className="w-full flex items-center justify-between mb-2">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">{currentTitle}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>

      <div className="flex gap-2">
        {onAdd && (
          <Button onClick={onAdd}>
            <Plus className="w-4 h-4" />
            {t('add', { title: currentTitle })}
          </Button>
        )}

        <ExportButton onExport={onExport} isExporting={isExporting} label={exportLabel} />
      </div>
    </div>
  );
}
