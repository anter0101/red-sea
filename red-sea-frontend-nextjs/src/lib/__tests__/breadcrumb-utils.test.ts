/// <reference types="jest" />

import {
  buildBreadcrumbItems,
  getLocaleFromPath,
  isDynamicSegment,
  resolveBreadcrumbHref,
} from '@/lib/breadcrumb-utils';
describe('breadcrumb-utils', () => {
  describe('isDynamicSegment', () => {
    it('detects numeric ids', () => {
      expect(isDynamicSegment('42')).toBe(true);
      expect(isDynamicSegment('branches')).toBe(false);
    });
  });

  describe('resolveBreadcrumbHref', () => {
    it('links employees under a branch to the branch detail page', () => {
      const parts = ['branches', '5', 'employees', '12'];
      expect(resolveBreadcrumbHref(parts, 2)).toBe('/branches/5');
    });

    it('keeps normal branch id links', () => {
      const parts = ['branches', '5', 'employees', '12'];
      expect(resolveBreadcrumbHref(parts, 1)).toBe('/branches/5');
    });

    it('keeps branches list link', () => {
      expect(resolveBreadcrumbHref(['branches', '5'], 0)).toBe('/branches');
    });
  });

  describe('buildBreadcrumbItems', () => {
    it('strips locale and builds locale-free hrefs for next-intl Link', () => {
      const items = buildBreadcrumbItems('/ar/branches/5/employees/12');

      expect(items).toHaveLength(4);
      expect(items[0]).toMatchObject({ label: 'الفروع', href: '/branches' });
      expect(items[1]).toMatchObject({ label: 'تفاصيل الفرع', href: '/branches/5' });
      expect(items[2]).toMatchObject({ label: 'الموظفين', href: '/branches/5' });
      expect(items[3]).toMatchObject({ label: 'تفاصيل الموظف', isCurrentPage: true });
      expect(items[3].href).toBeUndefined();
    });

    it('handles branch create path', () => {
      const items = buildBreadcrumbItems('/ar/branches/create');
      expect(items).toHaveLength(2);
      expect(items[1]).toMatchObject({ label: 'إضافة', isCurrentPage: true });
    });
  });

  describe('getLocaleFromPath', () => {
    it('reads ar and en', () => {
      expect(getLocaleFromPath('/ar/branches')).toBe('ar');
      expect(getLocaleFromPath('/en/branches')).toBe('en');
    });
  });
});
