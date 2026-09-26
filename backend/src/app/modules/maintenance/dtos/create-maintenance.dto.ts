import { OmitType } from '@nestjs/swagger';
import { MaintenanceDTO } from './maintenance.dto';

export class CreateMaintenanceDTO extends OmitType(MaintenanceDTO, [
  'id',
  'updatedAt',
  'deletedAt',
  'createdBy',
  'updatedBy',
  'deletedBy',
  'car',
  'trailer',
] as const) {}
