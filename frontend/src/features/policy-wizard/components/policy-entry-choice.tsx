'use client';

import { ScanLine, PencilLine } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

export type PolicyEntryMode = 'scan' | 'manual';

interface EntryOptionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  className?: string;
}

function EntryOptionCard({ title, description, icon, onClick, className }: EntryOptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex min-h-40 w-full flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card p-8',
        'text-center shadow-sm transition-all',
        'hover:-translate-y-1 hover:border-primary hover:shadow-md',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'cursor-pointer',
        className,
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </span>
      <span className="text-lg font-semibold text-foreground">{title}</span>
      <span className="text-sm text-muted-foreground">{description}</span>
    </button>
  );
}

interface PolicyEntryChoiceProps {
  onSelect: (mode: PolicyEntryMode) => void;
}

export default function PolicyEntryChoice({ onSelect }: PolicyEntryChoiceProps) {
  const t = useTranslations('office.policyWizard.entryChoice');

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground">{t('title')}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t('description')}</p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <EntryOptionCard
          title={t('scanUpload')}
          description={t('scanUploadDescription')}
          icon={<ScanLine className="size-6" />}
          onClick={() => onSelect('scan')}
        />
        <EntryOptionCard
          title={t('manualEntry')}
          description={t('manualEntryDescription')}
          icon={<PencilLine className="size-6" />}
          onClick={() => onSelect('manual')}
        />
      </div>
    </div>
  );
}
