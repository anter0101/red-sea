export interface IAuditFields {
  id?: number;
  createdBy?: string;
  createdAt?: Date | string;
  updatedBy?: string;
  updatedAt?: Date | string;
  deletedBy?: string;
  deletedAt?: Date | string;
}
