import { PartialType } from '@nestjs/swagger';
import { ClientDTO } from './client.dto';

export class UpdateClientDTO extends PartialType(ClientDTO) {}
