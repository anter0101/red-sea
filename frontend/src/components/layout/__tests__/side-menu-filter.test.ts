import { filterMenuByRole } from '../filter-menu-by-role';
import type { SideMenuItem } from '@/utils/icons';

const items: SideMenuItem[] = [
  { key: 'trips', alt: 'Trips', href: '/trips' },
  { key: 'cars', alt: 'Cars', href: '/cars' },
  {
    key: 'office',
    alt: 'Office',
    href: '/office',
    subItems: [
      { alt: 'issue', href: '/office/issue' },
      { alt: 'policy', href: '/office/policy' },
      { alt: 'custody', href: '/custody' },
      { alt: 'requests', href: '/office-requests' },
    ],
  },
];

describe('filterMenuByRole', () => {
  it('DATA_ENTRY sees only the office item', () => {
    const result = filterMenuByRole(items, 'DATA_ENTRY');
    expect(result.map((i) => i.key)).toEqual(['office']);
  });

  it('ADMIN keeps the office menu but only the requests link', () => {
    const result = filterMenuByRole(items, 'ADMIN');
    expect(result.map((i) => i.key)).toEqual(['trips', 'cars', 'office']);
    const office = result.find((i) => i.key === 'office');
    expect(office?.subItems?.map((s) => s.href)).toEqual(['/office-requests']);
  });

  it('unknown/other roles see all items (fallback)', () => {
    expect(filterMenuByRole(items, 'user')).toHaveLength(3);
    expect(filterMenuByRole(items, undefined)).toHaveLength(3);
  });
});

describe('admin-only full policy link', () => {
  const trips: SideMenuItem = {
    key: 'trips',
    alt: 'Trips',
    href: '/trips',
    subItems: [{ alt: 'full', href: '/office/full' }],
  };

  it('admin sees the full policy link under trips', () => {
    const result = filterMenuByRole([trips], 'ADMIN');
    expect(result[0].subItems?.map((s) => s.href)).toEqual(['/office/full']);
  });

  it('other roles do not see the full policy link', () => {
    const result = filterMenuByRole([trips], 'USER');
    expect(result[0].subItems).toEqual([]);
  });
});
