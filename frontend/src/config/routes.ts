export const modules = {
  home: 'الصفحة الرئيسية',
  drivers: 'السائقين',
  'driver-assistants': 'التباعين',
  cars: 'السيارات',
  trailers: 'المقطورات',
  partners: 'الشركاء',
  clients: 'العملاء',
  branches: 'الفروع',
  trips: 'الرحلات',
  warehouse: 'المخزن',
  suppliers: 'الموردين',
  employees: 'الموظفين',
  gps: 'الخريطة',
  accounting: 'الحسابات',
  office: 'المكتب',
  custody: 'العُهد',
  'office-requests': 'طلبات المكتب',
  invoices: 'الفواتير',
  settings: 'إعدادات الشركة',
} as const;

// Detail page labels for dynamic ID segments (e.g., /drivers/[id])
export const moduleDetails = {
  drivers: 'تفاصيل السائق',
  'driver-assistants': 'تفاصيل التابع',
  cars: 'تفاصيل السيارة',
  trailers: 'تفاصيل المقطورة',
  partners: 'تفاصيل الشريك',
  clients: 'تفاصيل العميل',
  branches: 'تفاصيل الفرع',
  trips: 'تفاصيل الرحلة',
  suppliers: 'تفاصيل المورد',
  employees: 'تفاصيل الموظف',
  gps: 'تفاصيل الجهاز',
  invoices: 'تفاصيل الفاتورة',
} as const;

// Nested route labels for special pages
export const nestedRoutes = {
  'delivery-prices': 'أسعار التوصيل',
  policy: 'السياسة',
  transactions: 'المعاملات',
  'update-delegate': 'تعديل',
  'create-delegate': 'إضافة',
  'create-employee': 'إضافة',
  accounts: 'الحسابات',
  journals: 'القيود اليومية',
  'transaction-lines': 'التقارير',
  'nolon-car': 'سيارات بالناولون',
  'contract-car': 'سيارات تعاقد',
  'company-car': 'سيارات الشركة',
  company: 'إعدادات الشركة',
} as const;

export const actions = {
  create: 'إضافة',
  update: 'تعديل',
  'update-employee': 'تعديل',
} as const;

export function getRouteTitle(path: string) {
  const parts = path.split('/').filter(Boolean);

  const moduleValue = modules[parts[1] as keyof typeof modules];
  const nestedValue = nestedRoutes[parts[2] as keyof typeof nestedRoutes];
  const action =
    actions[parts[2] as keyof typeof actions] || actions[parts[3] as keyof typeof actions];

  // CREATE / UPDATE & convert regular to single
  if (moduleValue && action) {
    const singular = moduleValue.replace(/ات$/, 'ة').replace(/ين$/, '');
    return `${action} ${singular}`;
  }

  // NESTED ROUTE
  if (nestedValue) {
    return nestedValue;
  }

  // MODULE ONLY
  if (moduleValue) {
    return moduleValue;
  }

  return '';
}
