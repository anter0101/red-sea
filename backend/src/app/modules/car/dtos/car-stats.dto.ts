import { ApiProperty } from '@nestjs/swagger';

export class CarStatsDTO {
  @ApiProperty({ description: 'Cars with status = ONROAD' })
  onRoad: number;

  @ApiProperty({ description: 'Cars with ownerShip = COMPANY_CAR' })
  company: number;

  @ApiProperty({ description: 'Cars with ownerShip = SHARE' })
  share: number;
}
