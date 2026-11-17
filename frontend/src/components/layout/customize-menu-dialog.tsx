'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

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
import type { MenuPreferences } from '@/hooks/menu/use-menu-preferences';
import type { SideMenuItem } from '@/utils/icons';

import { applyMenuOrder } from './menu-preferences';

type CustomizeMenuDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Items the user is allowed to see (role rules already applied). */
  items: SideMenuItem[];
  prefs: MenuPreferences;
  isSaving: boolean;
  onSave: (prefs: MenuPreferences) => Promise<unknown>;
};

export default function CustomizeMenuDialog({
  open,
  onOpenChange,
  items,
  prefs,
  isSaving,
  onSave,
}: CustomizeMenuDialogProps) {
  const [draftHidden, setDraftHidden] = useState<string[]>(prefs.hidden);
  const [draftItems, setDraftItems] = useState<SideMenuItem[]>(() =>
    applyMenuOrder(items, prefs.order),
  );

  // Reset the draft from saved preferences each time the dialog opens.
  const handleOpenChange = (next: boolean) => {
    if (next) {
      setDraftHidden(prefs.hidden);
      setDraftItems(applyMenuOrder(items, prefs.order));
    }
    onOpenChange(next);
  };

  const toggle = (key: string, shown: boolean) => {
    setDraftHidden((prev) => (shown ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const move = (index: number, direction: -1 | 1) => {
    setDraftItems((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) {return prev;}
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleSave = async () => {
    await onSave({ hidden: draftHidden, order: draftItems.map((item) => item.key) });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent dir="rtl" className="max-w-sm">
        <DialogHeader>
          <DialogTitle>تخصيص القائمة</DialogTitle>
          <DialogDescription>أظهر أو أخفِ العناصر، ورتّبها باستخدام الأسهم.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          {draftItems.map((item, index) => {
            const itemShown = !draftHidden.includes(item.key);
            return (
              <div key={item.key} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={itemShown}
                    onCheckedChange={(v) => toggle(item.key, v === true)}
                    aria-label={`show ${item.alt}`}
                  />
                  <span className="flex-1 text-sm font-semibold">{item.alt}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label={`move ${item.alt} up`}
                  >
                    <ChevronUp className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => move(index, 1)}
                    disabled={index === draftItems.length - 1}
                    aria-label={`move ${item.alt} down`}
                  >
                    <ChevronDown className="size-4" />
                  </Button>
                </div>
                {item.subItems?.map((sub) => (
                  <label
                    key={sub.href}
                    className="flex items-center gap-2 pe-6 text-sm text-muted-foreground"
                  >
                    <Checkbox
                      checked={itemShown && !draftHidden.includes(sub.href)}
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
