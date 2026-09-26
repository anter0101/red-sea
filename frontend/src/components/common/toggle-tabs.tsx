'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Tab = {
  id: string;
  label: string;
};

type EntityToggleTabsProps = {
  tabs: Tab[];
  defaultTab?: string;
  /** Controlled active tab. When set, internal state follows this value. */
  value?: string;
  onChange?: (tabId: string) => void;
  containerClassName?: string;
};

export default function EntityToggleTabs({
  tabs,
  defaultTab,
  value,
  onChange,
  containerClassName,
}: EntityToggleTabsProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultTab ?? tabs[0]?.id);
  const active = value ?? uncontrolled;

  const handleSelect = (id: string) => {
    if (value === undefined) {
      setUncontrolled(id);
    }
    onChange?.(id);
  };

  return (
    <div
      className={cn(
        'w-fit flex items-center justify-center gap-1 rounded-full border border-border bg-card p-1 shadow-sm',
        containerClassName,
      )}
    >
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          variant="ghost"
          className={cn(
            'rounded-full px-4 text-sm font-medium transition-all',
            active === tab.id
              ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          )}
          onClick={() => handleSelect(tab.id)}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  );
}
