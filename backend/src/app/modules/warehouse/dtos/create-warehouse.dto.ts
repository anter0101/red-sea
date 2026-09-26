import { ApiProperty, OmitType } from '@nestjs/swagger';
import { WarehouseDTO } from './warehouse.dto';
import { IsNumber } from 'class-validator';

export class CreateWarehouseDTO extends OmitType(WarehouseDTO, [
  'id',
  'updatedAt',
  'supplier',
  'code',
] as const) {
  @ApiProperty({ type: Number, required: true })
  @IsNumber()
  supplierId: number;
}
