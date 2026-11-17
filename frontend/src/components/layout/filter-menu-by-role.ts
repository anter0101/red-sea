import type { SideMenuItem } from '@/utils/icons';

// Admin sees only these office links: office requests and the policy registration flow.
const ADMIN_OFFICE_HREFS = ['/office-requests', '/office/policy'];

// Links only admins should see.
const ADMIN_ONLY_HREFS = ['/office/full'];

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

  // Other roles do not get the admin-only full entry.
  return menuItems.map((item) => {
    if (item.subItems?.some((sub) => ADMIN_ONLY_HREFS.includes(sub.href))) {
      return {
        ...item,
        subItems: item.subItems.filter((sub) => !ADMIN_ONLY_HREFS.includes(sub.href)),
      };
    }
    return item;
  });
}
