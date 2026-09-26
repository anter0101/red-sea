import { OmitType } from '@nestjs/swagger';
import { ClientDTO } from './client.dto';

export class CreateClientDTO extends OmitType(ClientDTO, [
  'id',
  'updatedAt',
  'companyCode',
] as const) {}
