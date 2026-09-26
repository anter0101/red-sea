import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseDTO } from 'src/core/utils/base.dto';
import { IsString, IsOptional, IsArray } from 'class-validator';
import { CarModelDTO } from '../../car-model/dtos/car-model.dto';

export class CarManufacturerDTO extends BaseDTO {
  @ApiProperty({ example: 'Toyota' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ type: () => [CarModelDTO] })
  @IsOptional()
  @IsArray()
  carModels?: CarModelDTO[];
}
