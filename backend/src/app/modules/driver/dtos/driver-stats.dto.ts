import { ApiProperty } from '@nestjs/swagger';

export class DriverStatsDTO {
  @ApiProperty({ description: 'Total non-deleted drivers' })
  total: number;

  @ApiProperty({ description: 'Drivers with user.status = ONROAD' })
  onRoad: number;

  @ApiProperty({ description: 'Drivers with user.status = AVAILABLE' })
  available: number;
}
