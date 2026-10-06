import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JourneyStatus } from 'src/core/enums/journey';

export class JourneyStatsByStatusDTO {
  @ApiProperty({ enum: JourneyStatus })
  status: JourneyStatus;

  @ApiProperty()
  count: number;
}

export class JourneyStatsDTO {
  @ApiProperty({ description: 'Total journeys matching filters' })
  total: number;

  @ApiProperty({ description: 'Same as total — journey count for KPI cards' })
  journeyCount: number;

  @ApiProperty({ type: [JourneyStatsByStatusDTO] })
  byStatus: JourneyStatsByStatusDTO[];

  @ApiPropertyOptional({ description: 'Sum of latest-policy trip distances (km)' })
  totalDistance?: number;

  @ApiPropertyOptional({ description: 'Sum of latest-policy book weights (tons)' })
  totalBookWeight?: number;

  @ApiPropertyOptional({
    description: 'Sum of actualRevenue for matching journeys',
  })
  totalRevenue?: number;

  @ApiPropertyOptional({ description: 'Sum of expense journey transactions for matching journeys' })
  totalExpenses?: number;

  @ApiPropertyOptional({ description: 'totalRevenue − totalExpenses' })
  totalProfit?: number;

  @ApiPropertyOptional({ description: 'Distinct working days (driver/assistant scope)' })
  workingDays?: number;

  @ApiPropertyOptional({ description: 'Active journey id (driver/assistant scope)' })
  currentJourneyId?: number;

  @ApiPropertyOptional({ description: 'Car code on current active journey' })
  currentCarCode?: string;
}
