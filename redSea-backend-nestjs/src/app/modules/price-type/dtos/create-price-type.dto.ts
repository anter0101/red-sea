import { OmitType } from '@nestjs/swagger';
import { PriceTypeDTO } from './price-type.dto';

export class CreatePriceTypeDTO extends OmitType(PriceTypeDTO, ['id', 'updatedAt'] as const) {}
