import { IAuditFields } from '@/types/audit-fields';
import { ITripPolicyInfo } from './policy';
import { ITripFees } from './transactions';

export interface ITrip extends IAuditFields {
  delegationNumber?: string; // تفويض رقم

  carId?: number; // السيارة
  trailerId?: number; // المقطورة
  driverId?: number; // السائق
  driverAssistantId?: number | null; // التابع (اختياري)
  clientId?: number | null; // التحميل لصالح

  direction?: string; // الجهة
  packingType?: string; // نوع التعبئة
  cementGrade?: string; // رتبة الأسمنت
  quantity?: number; // الكمية

  custodySourceId?: number; // مصدر العهدة
  custodyAmount?: number; // قيمة العهدة
  deliveryCompany?: string;
  saleOrderNumber?: string;
  deliveryInfo?: ITripPolicyInfo;

  fees?: ITripFees;
}

export interface IContact {
  type: string;
  value: string;
}

export interface IEmployee {
  journey: {
    id: number;
    transactions?: { id: number; type: string; amount: number; description?: string | null }[];
  };
  driver: {
    code: string;
    fullName: string;
    personalId: string | null;
    personalIdExpiry: string | null;
    contacts: IContact[];
  };
  assistant: {
    code: string | null;
    fullName: string;
    personalId: string | null;
    personalIdExpiry: string | null;
    contacts: IContact[];
  };
}

export interface IVehicle {
  journey: {
    id: number;
    fuelLiters: number | null;
  };
  car: {
    id: number;
    plate: string;
    licenseNumber: string;
    manufacturer: string;
    model: string;
    manufactureYear: number;
    color: string;
    cylinders: number;
    axleCount: number;
    fuelConsumptionPer1000km: number;
  };
  trailer?: {
    plate?: string;
    licenseNumber?: string;
    axleCount?: number;
  };
}

export interface IInfo {
  journeyinfo: {
    delegateNumber: string | null;
    eInvoiceNo: string | null;
    archiveNo?: number | null;
    totalCost: number | null;
    expectedRevenue: number | null;
    actualRevenue: number | null;
    totalProfit: number | null;
    direction: string | null;
    cementGrade: string | null;

    packingType: string | null;
    dqm: number | null;
    officeEmployee?: {
      name: string;
    };
  };

  policyinfo: {
    loadingArea: string | null;
    deliveryGov: string | null;
    deliveryArea: string | null;
    receivingDelegate: string | null;
    quantity: number | null;
    tripDistance: number | null;
    bookWeight: number | null;
    actualWeight: number | null;
    deliveryWeight: number | null;
    deliveryShortage: number | null;
    ats: number | null;
    revenue: number | null;
  };
}
