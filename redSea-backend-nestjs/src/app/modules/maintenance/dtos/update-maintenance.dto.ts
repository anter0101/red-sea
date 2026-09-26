import { PartialType } from '@nestjs/swagger';
import { CreateMaintenanceDTO } from './create-maintenance.dto';

export class UpdateMaintenanceDTO extends PartialType(CreateMaintenanceDTO) {
  id?: number;
}
