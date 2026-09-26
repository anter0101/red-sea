import { PartialType } from '@nestjs/swagger';
import { CustodyDTO } from './custody.dto';

export class UpdateCustodyDTO extends PartialType(CustodyDTO) {}
