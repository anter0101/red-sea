import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';
import { SupplierDTO } from './supplier.dto';

export class CreateSupplierDTO extends OmitType(SupplierDTO, [
  'id',
  'updatedAt',
  'code',
  'government',
] as const) {
  @ApiProperty({ description: 'معرف المحافظة', example: 1 })
  @Type(() => Number)
  @IsInt()
  governmentId: number;
}
