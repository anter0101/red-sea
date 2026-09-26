import { PartialType } from '@nestjs/swagger';
import { ContactDTO } from './contact.dto';

export class UpdateContactDTO extends PartialType(ContactDTO) {}
