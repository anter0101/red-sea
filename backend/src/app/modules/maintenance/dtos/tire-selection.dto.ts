import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { TIRE_POSITIONS, type TireSelection, type TireSnapshot } from '../tire-selection';

export class TireSnapshotDTO implements TireSnapshot {
  @ApiProperty()
  @IsString()
  serialNumber: string;

  @ApiProperty()
  @IsString()
  type: string;

  @ApiProperty()
  @IsString()
  healthPercentage: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  createdDate?: string;
}

export class TireSelectionDTO implements TireSelection {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  axleNumber: number;

  @ApiProperty({ example: 'leftOuter', enum: TIRE_POSITIONS })
  @IsIn(TIRE_POSITIONS)
  position: TireSelection['position'];

  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @IsInt()
  tireId?: number;

  @ApiProperty({ example: 'FRONT_LEFT' })
  @IsString()
  location: string;

  @ApiPropertyOptional({ type: TireSnapshotDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => TireSnapshotDTO)
  previous?: TireSnapshotDTO;

  @ApiPropertyOptional({ type: TireSnapshotDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => TireSnapshotDTO)
  next?: TireSnapshotDTO;
}
