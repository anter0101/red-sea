'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { SideMenuItem } from '@/utils/icons';

type CustomizeMenuDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Items the user is allowed to see (role rules already applied). */
  items: SideMenuItem[];
  hidden: string[];
  isSaving: boolean;
  onSave: (hidden: string[]) => Promise<unknown>;
};

export default function CustomizeMenuDialog({
  open,
  onOpenChange,
  items,
  hidden,
  isSaving,
  onSave,
}: CustomizeMenuDialogProps) {
  const [draft, setDraft] = useState<string[]>(hidden);

  // Reset the draft from saved preferences each time the dialog opens.
  const handleOpenChange = (next: boolean) => {
    if (next) {setDraft(hidden);}
    onOpenChange(next);
  };

  const toggle = (key: string, shown: boolean) => {
    setDraft((prev) => (shown ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const handleSave = async () => {
    await onSave(draft);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent dir="rtl" className="max-w-sm">
        <DialogHeader>
          <DialogTitle>تخصيص القائمة</DialogTitle>
          <DialogDescription>اختر العناصر التي تريد إظهارها في القائمة الجانبية.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          {items.map((item) => {
            const itemShown = !draft.includes(item.key);
            return (
              <div key={item.key} className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <Checkbox
                    checked={itemShown}
                    onCheckedChange={(v) => toggle(item.key, v === true)}
                  />
                  {item.alt}
                </label>
                {item.subItems?.map((sub) => (
                  <label
                    key={sub.href}
                    className="flex items-center gap-2 pe-6 text-sm text-muted-foreground"
                  >
                    <Checkbox
                      checked={!draft.includes(sub.href) && itemShown}
                      disabled={!itemShown}
                      onCheckedChange={(v) => toggle(sub.href, v === true)}
                    />
                    {sub.alt}
                  </label>
                ))}
              </div>
            );
          })}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button type="button" onClick={handleSave} disabled={isSaving}>
            حفظ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
