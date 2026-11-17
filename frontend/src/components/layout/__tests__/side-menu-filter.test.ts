import { filterMenuByRole } from '../filter-menu-by-role';
import type { SideMenuItem } from '@/utils/icons';

const items: SideMenuItem[] = [
  { key: 'trips', alt: 'Trips', href: '/trips' },
  { key: 'cars', alt: 'Cars', href: '/cars' },
  { key: 'office', alt: 'Office', href: '/office' },
];

describe('filterMenuByRole', () => {
  it('DATA_ENTRY sees only the office item', () => {
    const result = filterMenuByRole(items, 'DATA_ENTRY');
    expect(result.map((i) => i.key)).toEqual(['office']);
  });

  it('ADMIN does not see the office item', () => {
    const result = filterMenuByRole(items, 'ADMIN');
    expect(result.map((i) => i.key)).toEqual(['trips', 'cars']);
  });

  it('unknown/other roles see all items (fallback)', () => {
    expect(filterMenuByRole(items, 'user')).toHaveLength(3);
    expect(filterMenuByRole(items, undefined)).toHaveLength(3);
  });
});
