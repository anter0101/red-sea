// Centralized icon imports
import branches from '../../public/assets/icons/branches.png';
import cars from '../../public/assets/icons/car-outline__white.svg';
import driverAssistants from '../../public/assets/icons/driver-assistants-icon.svg';
import drivers from '../../public/assets/icons/drivers-icon.png';
import clients from '../../public/assets/icons/factories.png';
import home from '../../public/assets/icons/home-icon.png';
import partners from '../../public/assets/icons/partners.png';
import redSeaLogo from '../../public/assets/icons/red-sea-logo.svg';
import trailers from '../../public/assets/icons/trailers.png';
import trips from '../../public/assets/icons/trips.png';
import suppliers from '../../public/assets/icons/supplies-white.svg';
import warehouse from '../../public/assets/icons/warehouse.svg';
import gps from '../../public/assets/icons/gps.svg';
import accounting from '../../public/assets/icons/accounting.svg';
// office reuses accounting icon as placeholder until a dedicated asset is added
const office = accounting;

export const icons = {
  home,
  drivers,
  driverAssistants,
  cars,
  trailers,
  partners,
  clients,
  branches,
  trips,
  redSeaLogo,
  warehouse,
  suppliers,
  gps,
  accounting,
  office,
};

export type IconKey = keyof typeof icons;

export type SideMenuItem = {
  key: IconKey;
  alt: string;
  href: string;
  subItems?: { alt: string; href: string }[];
};

export const sideMenuIcons: SideMenuItem[] = [
  { key: 'home', alt: 'الصفحة الرئيسية', href: '/home' },
  { key: 'trips', alt: 'الرحلات', href: '/trips' },
  { key: 'drivers', alt: 'السائقين', href: '/drivers' },
  { key: 'driverAssistants', alt: 'التباعين', href: '/driver-assistants' },
  { key: 'cars', alt: 'السيارات', href: '/cars' },
  { key: 'trailers', alt: 'المقطورات', href: '/trailers' },
  { key: 'partners', alt: 'الشركاء', href: '/partners' },
  { key: 'clients', alt: 'العملاء', href: '/clients' },
  { key: 'branches', alt: 'فروع الشركة', href: '/branches' },
  { key: 'warehouse', alt: 'المخزن', href: '/warehouse' },
  { key: 'suppliers', alt: 'الموردين', href: '/suppliers' },
  { key: 'gps', alt: 'الخريطة', href: '/gps' },
  {
    key: 'accounting',
    alt: 'الحسابات',
    href: '/accounting',
    subItems: [
      { alt: 'الحسابات', href: '/accounting/accounts' },
      { alt: 'المعاملات', href: '/accounting/transactions' },
      { alt: 'التقارير', href: '/accounting/transaction-lines' },
    ],
  },
  {
    key: 'office',
    alt: 'المكتب',
    href: '/office',
    subItems: [
      { alt: 'اصدار تفويض', href: '/office/issue' },
      { alt: 'تسجيل بوليصة', href: '/office/policy' },
      { alt: 'العُهد', href: '/custody' },
      { alt: 'طلبات المكتب', href: '/office-requests' },
    ],
  },
];
