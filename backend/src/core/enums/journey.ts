export enum JourneyStatus {
  DELEGATION_ISSUED = 'DELEGATION_ISSUED',
  POLICY_COLLECTED = 'POLICY_COLLECTED',
  INVOICE_ISSUED = 'INVOICE_ISSUED',
}

/** Arabic labels for UI (also mirrored in FE i18n). */
export const JOURNEY_STATUS_LABELS: Record<JourneyStatus, string> = {
  [JourneyStatus.DELEGATION_ISSUED]: 'تم اصدار التفويض',
  [JourneyStatus.POLICY_COLLECTED]: 'تم تحصيل البوليصه',
  [JourneyStatus.INVOICE_ISSUED]: 'تم اصدار فاتوره',
};

export enum JourneyAttachmentType {
  RECEIPT = 'RECEIPT',
  RECEIPT_POLICY = 'RECEIPT_POLICY',
  SHIPPING_POLICY = 'SHIPPING_POLICY',
  DELEGATE = 'DELEGATE',
  POLICY = 'POLICY',
}

export enum JourneyTransactionCategoryType {
  DIESEL_FEES = 'Diesel Fees',
  CARD_FEES = 'Card Fees',
  SCALE_FEES = 'Weighing Fees',
  TIPS_FEES = 'Tips Fees',
  CUSTODY = 'Custody',
  NOLON_FEES = 'Nolon Fees',
  DRIVER_COMMISSION = 'Driver Commission',
  ASSISTANT_COMMISSION = 'Assistant Commission',
  DRIVER_DAILY_WORK = 'Driver Daily Work',
  ASSISTANT_DAILY_WORK = 'Assistant Daily Work',
  DRIVER_EMPLOYEE_NOLON = 'Driver Employee Nolon',
  ASSISTANT_EMPLOYEE_NOLON = 'Assistant Employee Nolon',
}

export enum JourneyTransactionType {
  EXPENSE = 'EXPENSE',
  REVENUE = 'REVENUE',
  ADVANCE = 'ADVANCE',
}
