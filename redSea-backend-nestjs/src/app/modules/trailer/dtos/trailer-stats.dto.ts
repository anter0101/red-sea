import { ApiProperty } from '@nestjs/swagger';

export class TrailerStatsDTO {
  @ApiProperty({ description: 'Trailers with status = ONROAD' })
  onRoad: number;

  @ApiProperty({ description: 'Trailers with ownerShip = COMPANY_CAR' })
  company: number;

  @ApiProperty({ description: 'Trailers with ownerShip = SHARE' })
  share: number;

  @ApiProperty({ description: 'Trailers with ownerShip = NOLON_CAR' })
  nolon: number;
}
