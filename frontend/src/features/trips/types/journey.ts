import { IAuditFields } from '@/types/audit-fields';

export interface IJourney {
  id: number;
  quantity: number;
  direction: string;
  fuelLiters: number;
  tripStatus: 'DELEGATION_ISSUED' | 'POLICY_COLLECTED' | 'INVOICE_ISSUED';
  cementGrade: string;
  packingType: string;
  delegateDate: string;
  delegateNumber: string;
  sellingOrderNo: string | null;
  receivedCompany: string | null;
}

export interface IClient {
  id: number;
  name: string;
  companyCode?: string;
}

export interface ICar {
  id: number;
  model: string;
  plate: string;
  manufacturer: string;
  ownerShip?: string;
}

export interface ITrailer {
  id: number;
  plate: string;
  manufacturer: string;
}

export interface IDriver {
  id: number;
  code: string;
  name: string;
}

export interface IAssistant {
  id: number;
  code: string;
  name: string;
}

export interface ICustodySource {
  id: number;
  name: string;
}

export interface IJourneyTransaction {
  id: number;
  amount: number;
  transactionType: 'ADVANCE' | 'EXPENSE' | 'INCOME';
  quantity?: number;
}

export interface IPolicy {
  id: number;
  policyNo: string;
  policyDate: string;
}
export interface ITripResponse extends IAuditFields {
  journey?: IJourney;
  policy?: IPolicy;
  client?: IClient;
  car?: ICar;
  trailer?: ITrailer;
  driver?: IDriver;
  assistant?: IAssistant;
  custodysource?: ICustodySource;
  transportsupplier?: { id: number | null; name: string | null };
  journeytransaction?: IJourneyTransaction;
}
