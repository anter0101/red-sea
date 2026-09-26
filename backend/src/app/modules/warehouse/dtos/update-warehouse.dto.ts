import { ApiProperty, PartialType } from '@nestjs/swagger';
import { WarehouseDTO } from './warehouse.dto';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsPositive } from 'class-validator';

export class UpdateWarehouseDTO extends PartialType(WarehouseDTO) {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @Type(() => Number)
  @IsPositive()
  @IsOptional()
  supplierId?: number;
}
