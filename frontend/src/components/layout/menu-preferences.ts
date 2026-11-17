import type { SideMenuItem } from '@/utils/icons';

/**
 * Keys a user can hide: a top-level item uses its `key`,
 * a sub-item uses its `href` (which always starts with "/", so it never clashes with a key).
 */
export function menuItemKeys(item: SideMenuItem): string[] {
  return [item.key, ...(item.subItems ?? []).map((sub) => sub.href)];
}

/** Removes hidden top-level items and hidden sub-items. Role rules are applied before this. */
export function applyHiddenMenu(items: SideMenuItem[], hidden: string[]): SideMenuItem[] {
  if (hidden.length === 0) {return items;}
  const hiddenSet = new Set(hidden);

  return items.flatMap((item) => {
    if (hiddenSet.has(item.key)) {return [];}
    if (!item.subItems) {return [item];}

    const subItems = item.subItems.filter((sub) => !hiddenSet.has(sub.href));
    if (item.subItems.length > 0 && subItems.length === 0) {return [];}
    return [{ ...item, subItems }];
  });
}

/**
 * Sorts top-level items by the saved order. Items not in the saved order keep their
 * default position and go after the ordered ones.
 */
export function applyMenuOrder(items: SideMenuItem[], order: string[]): SideMenuItem[] {
  if (order.length === 0) {return items;}
  const rank = new Map(order.map((key, index) => [key, index]));
  const fallback = order.length;
  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const ra = rank.get(a.item.key) ?? fallback;
      const rb = rank.get(b.item.key) ?? fallback;
      return ra - rb || a.index - b.index;
    })
    .map(({ item }) => item);
}
