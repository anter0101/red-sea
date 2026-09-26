// src/tire/dtos/tire.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { BaseDTO } from 'src/core/utils/base.dto';
import { AxleDTO } from '../../axle/dtos/axle.dto';

export class TireDTO extends BaseDTO {
  @ApiProperty({ description: 'Serial number of the tire' })
  serialNumber: string;

  @ApiProperty({ description: 'Type of the tire (e.g., SUMMER, WINTER)' })
  type: string;

  @ApiProperty({
    description: 'Health condition of the tire',
  })
  healthPercentage: string;

  @ApiProperty({
    description: 'Location of the tire on the axle',
    example: 'FRONT_LEFT',
  })
  location: string;

  @ApiProperty({
    description: 'Date when the tire was created',
    example: '2023-01-01T00:00:00Z',
  })
  createdDate: Date;

  @ApiProperty({
    description: 'Axle the tire belongs to',
    type: () => AxleDTO,
    required: false,
  })
  axle?: AxleDTO;
}
