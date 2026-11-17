import { applyHiddenMenu, menuItemKeys } from '../menu-preferences';
import type { SideMenuItem } from '@/utils/icons';

const items: SideMenuItem[] = [
  { key: 'trips', alt: 'Trips', href: '/trips' },
  {
    key: 'office',
    alt: 'Office',
    href: '/office',
    subItems: [
      { alt: 'issue', href: '/office/issue' },
      { alt: 'policy', href: '/office/policy' },
    ],
  },
];

describe('menuItemKeys', () => {
  it('lists the item key and each sub-item href', () => {
    expect(menuItemKeys(items[1])).toEqual(['office', '/office/issue', '/office/policy']);
    expect(menuItemKeys(items[0])).toEqual(['trips']);
  });
});

describe('applyHiddenMenu', () => {
  it('returns the same items when nothing is hidden', () => {
    expect(applyHiddenMenu(items, [])).toBe(items);
  });

  it('removes a hidden top-level item', () => {
    expect(applyHiddenMenu(items, ['trips']).map((i) => i.key)).toEqual(['office']);
  });

  it('removes hidden sub-items and keeps the rest', () => {
    const result = applyHiddenMenu(items, ['/office/issue']);
    expect(result[1].subItems?.map((s) => s.href)).toEqual(['/office/policy']);
  });

  it('drops a group when every sub-item is hidden', () => {
    const result = applyHiddenMenu(items, ['/office/issue', '/office/policy']);
    expect(result.map((i) => i.key)).toEqual(['trips']);
  });
});
