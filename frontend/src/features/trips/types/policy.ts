export interface ITripPolicyRes {
  id?: number;
  journeyId: number;
  deliveryGov?: {
    id: number;
    name: string;
  };

  deliveryArea?: {
    id: number;
    name: string;
  };

  employee?: {
    id: number;
    name: string;
  };

  policyNo?: string;
  policyDate?: string;
  loadingPermitNo?: string;
  loadingDate?: string;

  bookWeight?: number;
  actualWeight?: number;
  deliveryWeight?: number;
  shortageQty?: number;

  entryTimeFactory?: string;
  exitTimeFactory?: string;

  archiveNo?: string;
  tripDate?: string;
  tripDistance?: number;

  attachments?: {
    id: number;
    fileName: string;
    type: string;
  }[];
}

export interface ITripPolicyInfo {
  journeyId: number; // رحلة الرحلة
  deliveryAreaId?: number; // منطقة التحميل
  deliveryGovId?: number; // موقع التسليم
  // محافظة التسليم
  employeeId?: number; // مفوض الاستلام

  policyNo?: string; // رقم البوليصة
  policyDate?: string; // تاريخ البوليصة
  loadingPermitNo?: string; // رقم اذن التحميل
  loadingDate?: string; // تاريخ التحميل

  bookWeight?: number; // الوزن الدفتري
  actualWeight?: number; // الوزن الفعلي
  deliveryWeight?: number; // وزن التسليم
  shortageQty?: number; // عجز الكمية

  entryTimeFactory?: string; // وقت دخول المصنع
  exitTimeFactory?: string; // وقت الخروج من المصنع

  archiveNo?: string; // رقم ارشيف المستندات

  tripDate?: string; // تاريخ الرحلة
  tripDistance?: number; // مسافة الرحلة

  policyFile?: string; // ملف البوليصة

  transportSupplierId?: number;
  custodySupplierId?: number;
  custodySupplierAmount?: number;
}
