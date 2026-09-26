'use client';

import { Download } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

type ExportButtonProps = {
  onExport?: () => void | Promise<void>;
  isExporting?: boolean;
  label?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
};

export default function ExportButton({
  onExport,
  isExporting = false,
  label,
  className,
  variant = 'outline',
}: ExportButtonProps) {
  const t = useTranslations('common.export');

  if (!onExport) return null;

  return (
    <Button
      type="button"
      variant={variant}
      className={cn('gap-2', className)}
      onClick={onExport}
      disabled={isExporting}
    >
      {isExporting ? <Spinner /> : <Download className="w-4 h-4" />}
      {label ?? t('label')}
    </Button>
  );
}
