export enum TripTransactionCategory {
  DIESEL_FEES = 'Diesel Fees',
  CARD_FEES = 'Card Fees',
  WEIGHING_FEES = 'Weighing Fees',
  TIPS_FEES = 'Tips Fees',
}

export interface ITripTransactionRes {
  id: number;
  transactionType: 'EXPENSE' | 'INCOME' | 'ADVANCE';
  category: TripTransactionCategory | string; // backend may send strings not in enum
  amount: number;
  description?: string | null;
  quantity: number;
}
