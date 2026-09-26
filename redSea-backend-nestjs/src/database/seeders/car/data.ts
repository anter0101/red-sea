import { OwnerShipType } from 'src/core/enums/ownerShip-types';
import { VeachleStatus } from 'src/core/enums/veachle-status';

export type CarSeedData = {
  manufacturer: string;
  model: string;
  status: VeachleStatus;
  manufactureYear: number;
  color: string;
  cylinders: number;
  horsepower: number;
  axleCount: number;
  maxWeight: number;
  plateNumber: string;
  plateLetters: string;
  chassisNumber: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  ownerShip: OwnerShipType;
  notes?: string;
};

export const cars: CarSeedData[] = [
  {
    manufacturer: 'Mercedes-Benz',
    model: 'Actros 2040',
    status: VeachleStatus.AVILABLE,
    manufactureYear: 2021,
    color: 'White',
    cylinders: 6,
    horsepower: 450,
    axleCount: 3,
    maxWeight: 18,
    plateNumber: '1122',
    plateLetters: 'أ ب ج',
    chassisNumber: 'CAR-MOCK-CH-001',
    licenseNumber: 'CAR-MOCK-LIC-001',
    licenseExpiryDate: '2027-10-15',
    ownerShip: OwnerShipType.COMPANY_CAR,
    notes: 'Mock Mercedes Actros head truck',
  },
  {
    manufacturer: 'Volvo',
    model: 'FH16 750',
    status: VeachleStatus.AVILABLE,
    manufactureYear: 2020,
    color: 'Blue',
    cylinders: 6,
    horsepower: 750,
    axleCount: 3,
    maxWeight: 20,
    plateNumber: '3344',
    plateLetters: 'س ص ع',
    chassisNumber: 'CAR-MOCK-CH-002',
    licenseNumber: 'CAR-MOCK-LIC-002',
    licenseExpiryDate: '2028-02-20',
    ownerShip: OwnerShipType.COMPANY_CAR,
    notes: 'Mock Volvo heavy truck',
  },
  {
    manufacturer: 'Scania',
    model: 'R500',
    status: VeachleStatus.ONROAD,
    manufactureYear: 2022,
    color: 'Red',
    cylinders: 6,
    horsepower: 500,
    axleCount: 2,
    maxWeight: 16,
    plateNumber: '5566',
    plateLetters: 'م ن ل',
    chassisNumber: 'CAR-MOCK-CH-003',
    licenseNumber: 'CAR-MOCK-LIC-003',
    licenseExpiryDate: '2027-07-01',
    ownerShip: OwnerShipType.NOLON_CAR,
    notes: 'Mock Scania on road',
  },
  {
    manufacturer: 'MAN',
    model: 'TGX 18.510',
    status: VeachleStatus.UNDER_MAINTENANCE,
    manufactureYear: 2019,
    color: 'Gray',
    cylinders: 6,
    horsepower: 510,
    axleCount: 2,
    maxWeight: 15,
    plateNumber: '7788',
    plateLetters: 'ط ي ر',
    chassisNumber: 'CAR-MOCK-CH-004',
    licenseNumber: 'CAR-MOCK-LIC-004',
    licenseExpiryDate: '2026-12-31',
    ownerShip: OwnerShipType.CONTRACT_CAR,
    notes: 'Mock MAN truck under maintenance',
  },
  {
    manufacturer: 'Isuzu',
    model: 'FVR 34',
    status: VeachleStatus.UNAVILABLE,
    manufactureYear: 2018,
    color: 'Silver',
    cylinders: 4,
    horsepower: 350,
    axleCount: 2,
    maxWeight: 12,
    plateNumber: '9900',
    plateLetters: 'ح خ د',
    chassisNumber: 'CAR-MOCK-CH-005',
    licenseNumber: 'CAR-MOCK-LIC-005',
    licenseExpiryDate: '2028-05-10',
    ownerShip: OwnerShipType.SHARE,
    notes: 'Mock Isuzu medium truck',
  },
];
