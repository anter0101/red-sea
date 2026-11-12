import { JourneyTransactionCategoryType } from 'src/core/enums/journey';

export enum AccountSystemKey {
  CLIENTS_IN_PROGRESS = 'CLIENTS_IN_PROGRESS',
  REVENUE_IN_PROGRESS = 'REVENUE_IN_PROGRESS',
  CLIENTS = 'CLIENTS',
  REVENUE_DONE = 'REVENUE_DONE',
  WITHHOLDING_TAX = 'WITHHOLDING_TAX',
  VAT_PAYABLE = 'VAT_PAYABLE',
  NOLON_CONTRACT_CARS = 'NOLON_CONTRACT_CARS',
  TRANSPORT_SUPPLIER = 'TRANSPORT_SUPPLIER',
  CUSTODY = 'CUSTODY',
  TRIP_EXP_DIESEL = 'TRIP_EXP_DIESEL',
  TRIP_EXP_CARD = 'TRIP_EXP_CARD',
  TRIP_EXP_SCALE = 'TRIP_EXP_SCALE',
  TRIP_EXP_TIPS = 'TRIP_EXP_TIPS',
}

export enum AccountActorType {
  CLIENT = 'CLIENT',
  BRANCH = 'BRANCH',
  TRANSPORT_SUPPLIER = 'TRANSPORT_SUPPLIER',
}

/** Trip expense types settled from the driver's custody (TRN3), each with its own expense leaf. */
export const TRIP_EXPENSE_ACCOUNT_KEYS: ReadonlyArray<
  [JourneyTransactionCategoryType, AccountSystemKey]
> = [
  [JourneyTransactionCategoryType.DIESEL_FEES, AccountSystemKey.TRIP_EXP_DIESEL],
  [JourneyTransactionCategoryType.CARD_FEES, AccountSystemKey.TRIP_EXP_CARD],
  [JourneyTransactionCategoryType.SCALE_FEES, AccountSystemKey.TRIP_EXP_SCALE],
  [JourneyTransactionCategoryType.TIPS_FEES, AccountSystemKey.TRIP_EXP_TIPS],
];
