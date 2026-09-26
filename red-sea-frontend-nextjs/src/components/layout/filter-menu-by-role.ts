import type { SideMenuItem } from '@/utils/icons';

export function filterMenuByRole(
  menuItems: SideMenuItem[],
  role: string | undefined,
): SideMenuItem[] {
  const isDataEntry = role?.toUpperCase() === 'DATA_ENTRY';

  if (isDataEntry) return menuItems.filter((item) => item.key === 'office');

  return menuItems.map((item) => {
    if (item.key === 'office' && item.subItems) {
      return { ...item, subItems: item.subItems.filter((sub) => sub.href !== '/office') };
    }
    return item;
  });
}
