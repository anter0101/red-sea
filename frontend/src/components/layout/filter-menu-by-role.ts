import type { SideMenuItem } from '@/utils/icons';

export function filterMenuByRole(
  menuItems: SideMenuItem[],
  role: string | undefined,
): SideMenuItem[] {
  const normalized = role?.toUpperCase();

  // Data entry only works in the office area.
  if (normalized === 'DATA_ENTRY') return menuItems.filter((item) => item.key === 'office');

  // Admins do not get the office menu.
  if (normalized === 'ADMIN') return menuItems.filter((item) => item.key !== 'office');

  return menuItems;
}
