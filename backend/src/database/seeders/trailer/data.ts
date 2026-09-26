import { OwnerShipType } from 'src/core/enums/ownerShip-types';
import { VeachleStatus } from 'src/core/enums/veachle-status';

export type TrailerSeedData = {
  manufacturer: string;
  chaseType: string;
  status: VeachleStatus;
  manufactureYear: number;
  color: string;
  maxWeight: number;
  plateNumber: string;
  plateLetters: string;
  chassisNumber: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  axleCount: number;
  ownerShip: OwnerShipType;
  notes?: string;
};

export const trailers: TrailerSeedData[] = [
  {
    manufacturer: 'Schmitz',
    chaseType: 'Flatbed',
    status: VeachleStatus.AVILABLE,
    manufactureYear: 2020,
    color: 'White',
    maxWeight: 24,
    plateNumber: '4521',
    plateLetters: 'أ ب ج',
    chassisNumber: 'TRL-MOCK-CH-001',
    licenseNumber: 'TRL-MOCK-LIC-001',
    licenseExpiryDate: '2027-12-31',
    axleCount: 2,
    ownerShip: OwnerShipType.COMPANY_CAR,
    notes: 'Mock flatbed trailer',
  },
  {
    manufacturer: 'Krone',
    chaseType: 'Tipper',
    status: VeachleStatus.AVILABLE,
    manufactureYear: 2019,
    color: 'Blue',
    maxWeight: 26,
    plateNumber: '7832',
    plateLetters: 'س ص ع',
    chassisNumber: 'TRL-MOCK-CH-002',
    licenseNumber: 'TRL-MOCK-LIC-002',
    licenseExpiryDate: '2028-04-15',
    axleCount: 3,
    ownerShip: OwnerShipType.COMPANY_CAR,
    notes: 'Mock tipper trailer',
  },
  {
    manufacturer: 'Wabash',
    chaseType: 'Lowbed',
    status: VeachleStatus.ONROAD,
    manufactureYear: 2021,
    color: 'Red',
    maxWeight: 30,
    plateNumber: '9014',
    plateLetters: 'م ن ل',
    chassisNumber: 'TRL-MOCK-CH-003',
    licenseNumber: 'TRL-MOCK-LIC-003',
    licenseExpiryDate: '2027-08-20',
    axleCount: 3,
    ownerShip: OwnerShipType.NOLON_CAR,
    notes: 'Mock lowbed trailer',
  },
  {
    manufacturer: 'Hyundai',
    chaseType: 'Container',
    status: VeachleStatus.UNDER_MAINTENANCE,
    manufactureYear: 2018,
    color: 'Gray',
    maxWeight: 22,
    plateNumber: '3345',
    plateLetters: 'ط ي ر',
    chassisNumber: 'TRL-MOCK-CH-004',
    licenseNumber: 'TRL-MOCK-LIC-004',
    licenseExpiryDate: '2026-11-30',
    axleCount: 2,
    ownerShip: OwnerShipType.CONTRACT_CAR,
    notes: 'Mock container trailer under maintenance',
  },
  {
    manufacturer: 'Arabian',
    chaseType: 'Bulk Cement',
    status: VeachleStatus.UNAVILABLE,
    manufactureYear: 2022,
    color: 'Silver',
    maxWeight: 28,
    plateNumber: '6678',
    plateLetters: 'ح خ د',
    chassisNumber: 'TRL-MOCK-CH-005',
    licenseNumber: 'TRL-MOCK-LIC-005',
    licenseExpiryDate: '2028-06-01',
    axleCount: 3,
    ownerShip: OwnerShipType.SHARE,
    notes: 'Mock cement bulk trailer',
  },
];
