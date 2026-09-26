import { ApiProperty } from '@nestjs/swagger';

export class UserStatsDTO {
  @ApiProperty({ description: 'Total non-deleted users matching filters' })
  total: number;

  @ApiProperty({ description: 'Users with status = ONROAD' })
  onRoad: number;

  @ApiProperty({ description: 'Users with status = AVAILABLE' })
  available: number;
}
