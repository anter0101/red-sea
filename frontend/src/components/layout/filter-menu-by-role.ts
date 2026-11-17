import type { SideMenuItem } from '@/utils/icons';

// Admin sees only these office links: office requests and the policy registration flow.
const ADMIN_OFFICE_HREFS = ['/office-requests', '/office/policy'];

export function filterMenuByRole(
  menuItems: SideMenuItem[],
  role: string | undefined,
): SideMenuItem[] {
  const normalized = role?.toUpperCase();

  // Data entry only works in the office area.
  if (normalized === 'DATA_ENTRY') {
    return menuItems.filter((item) => item.key === 'office');
  }

  if (normalized === 'ADMIN') {
    return menuItems.map((item) => {
      if (item.key === 'office' && item.subItems) {
        return {
          ...item,
          subItems: item.subItems.filter((sub) => ADMIN_OFFICE_HREFS.includes(sub.href)),
        };
      }
      return item;
    });
  }

  return menuItems;
}
