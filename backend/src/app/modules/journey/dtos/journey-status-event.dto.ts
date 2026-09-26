import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JourneyStatus } from 'src/core/enums/journey';

export class JourneyStatusEventDTO {
  @ApiProperty()
  id: number;

  @ApiPropertyOptional({ enum: JourneyStatus, nullable: true })
  fromStatus?: JourneyStatus | null;

  @ApiProperty({ enum: JourneyStatus })
  toStatus: JourneyStatus;

  @ApiPropertyOptional()
  changedBy?: string;

  @ApiPropertyOptional()
  createdAt?: Date;
}
