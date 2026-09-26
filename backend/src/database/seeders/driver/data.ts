import { UserStatus } from 'src/core/enums/user-status';

export type DriverSeedData = {
  licenseNumber: string;
  licenseExpiryDate: string;
  user: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    status: UserStatus;
  };
  contacts?: Array<{ phone: string; isPrimary?: boolean }>;
};

export const drivers: DriverSeedData[] = [
  {
    licenseNumber: 'DRV-MOCK-001',
    licenseExpiryDate: '2027-06-30',
    user: {
      email: 'driver.mohamed@redsea.test',
      password: 'Driver123!',
      firstName: 'محمد',
      lastName: 'السيد',
      status: UserStatus.AVAILABLE,
    },
    contacts: [{ phone: '01010000001', isPrimary: true }],
  },
  {
    licenseNumber: 'DRV-MOCK-002',
    licenseExpiryDate: '2027-09-15',
    user: {
      email: 'driver.ahmed@redsea.test',
      password: 'Driver123!',
      firstName: 'أحمد',
      lastName: 'حسن',
      status: UserStatus.AVAILABLE,
    },
    contacts: [{ phone: '01010000002', isPrimary: true }],
  },
  {
    licenseNumber: 'DRV-MOCK-003',
    licenseExpiryDate: '2028-01-20',
    user: {
      email: 'driver.khaled@redsea.test',
      password: 'Driver123!',
      firstName: 'خالد',
      lastName: 'إبراهيم',
      status: UserStatus.ONROAD,
    },
    contacts: [{ phone: '01010000003', isPrimary: true }],
  },
  {
    licenseNumber: 'DRV-MOCK-004',
    licenseExpiryDate: '2027-11-05',
    user: {
      email: 'driver.omar@redsea.test',
      password: 'Driver123!',
      firstName: 'عمر',
      lastName: 'محمود',
      status: UserStatus.AVAILABLE,
    },
    contacts: [{ phone: '01010000004', isPrimary: true }],
  },
  {
    licenseNumber: 'DRV-MOCK-005',
    licenseExpiryDate: '2028-03-10',
    user: {
      email: 'driver.youssef@redsea.test',
      password: 'Driver123!',
      firstName: 'يوسف',
      lastName: 'عبدالله',
      status: UserStatus.UNAVAILABLE,
    },
    contacts: [{ phone: '01010000005', isPrimary: true }],
  },
];
