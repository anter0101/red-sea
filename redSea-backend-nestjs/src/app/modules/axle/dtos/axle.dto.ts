import { ApiProperty } from '@nestjs/swagger';
import { BaseDTO } from 'src/core/utils/base.dto';
import { CarDTO } from '../../car/dtos/car.dto';
import { TrailerDTO } from '../../trailer/dtos/trailer.dto';
import { TireDTO } from '../../tire/dtos/tire.dto';

export class AxleDTO extends BaseDTO {
  @ApiProperty({ description: 'Axle number' })
  number: number;

  @ApiProperty({ description: 'Car the axle belongs to', type: () => CarDTO, required: false })
  car?: CarDTO;

  @ApiProperty({
    description: 'Trailer the axle belongs to',
    type: () => TrailerDTO,
    required: false,
  })
  trailer?: TrailerDTO;

  @ApiProperty({
    description: 'Tires attached to this axle',
    type: () => [TireDTO],
    required: false,
  })
  tires?: TireDTO[];
}
