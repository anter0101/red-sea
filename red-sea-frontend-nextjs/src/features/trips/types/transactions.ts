export enum TripTransactionCategory {
  OFFICE_FEES = 'Office Fees',
  LOADING_FEES = 'Loading Fees',
  WEIGHING_FEES = 'Weighing Fees',
  CARD_FEES = 'Card Fees',
  CROSSING_FEES = 'Crossing Fees',
  PORT_PERMIT_FEES = 'Port Permit Fees',
  PORT_FEES = 'Port Fees',
  DIESEL_FEES = 'Diesel Fees',
  OTHER_EXPENSES = 'Other Expenses',
}
export interface ITripTransaction {
  category: TripTransactionCategory;
  amount: number;
  description?: string;
  quantity?: number;
}
export interface ITripFeesPayload {
  journeyId?: number;
  fuelLiters?: number;
  cardName?: string;
  transactionType: 'EXPENSE' | 'INCOME';
  transactions: ITripTransaction[];
}

export interface ITripFees {
  journeyId?: number; // رحلة الرحلة
  officeFee?: number; // رسوم مكتبية
  loadingFee?: number; // رسوم تحميل
  weightingFee?: number; // رسوم ميزان
  cardName?: string; // اسم الكارتة
  cardFee?: number; // رسوم الكارتة
  crossingFee?: number; // رسوم عبور
  permitPortFee?: number; // رسوم تصاريح ميناء
  portFee?: number; // رسوم ميناء
  solarFee?: number; // رسوم سولار
  solarLiters?: number; // عدد اللترات للرحلة
  otherExpenses?: number; // مصروفات آخرى
}

export interface ITripTransactionRes {
  id: number;
  transactionType: 'EXPENSE' | 'INCOME' | 'ADVANCE';
  category: TripTransactionCategory | string; // backend may send strings not in enum
  amount: number;
  description?: string | null;
  quantity: number;
}

export interface IFeesRes {
  journeyId?: number;
  fuelLiters?: number;
  cardName?: string;
  transactions: ITripTransactionRes[];
}
