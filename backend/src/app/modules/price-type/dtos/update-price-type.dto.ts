import { PartialType } from '@nestjs/swagger';
import { CreatePriceTypeDTO } from './create-price-type.dto';

export class UpdatePriceTypeDTO extends PartialType(CreatePriceTypeDTO) {}
