import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseDTO } from 'src/core/utils/base.dto';
import { IsString, IsOptional } from 'class-validator';
import { CarManufacturerDTO } from '../../car-manufacturer/dtos/car-manufacturer.dto';

export class CarModelDTO extends BaseDTO {
  @ApiProperty({ example: 'Corolla' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ type: () => CarManufacturerDTO })
  @IsOptional()
  manufacturer?: CarManufacturerDTO;
}
