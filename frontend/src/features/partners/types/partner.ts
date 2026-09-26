import type { TransactionType } from '@/enums/transaction-type';
import type { ITrailer } from '@/types';
import type { ICar } from '@/types';
import type { IAuditFields } from '@/types/audit-fields';

interface IOwnership {
  id?: number;
  percentage?: string;
  contractUrl?: string | null;
  notes?: string;
}

interface ICarOwnershipForPartner extends IOwnership {
  car?: ICar;
}

interface ITrailerOwnershipForPartner extends IOwnership {
  trailer?: ITrailer;
}

export interface IPartner extends IAuditFields {
  name?: string;
  phone?: string;
  address?: string;
  email?: string;
  bankAccountNumber?: string | null;
  bankName?: string | null;
  transactionType?: TransactionType;
  trailerOwnerships?: ITrailerOwnershipForPartner[];
  carOwnerships?: ICarOwnershipForPartner[];
}
