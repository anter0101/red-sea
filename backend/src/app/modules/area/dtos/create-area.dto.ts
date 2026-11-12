import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsPositive } from 'class-validator';
import { AreaDTO } from './area.dto';

export class CreateAreaDTO extends OmitType(AreaDTO, ['id', 'updatedAt', 'government'] as const) {
  @ApiProperty({ description: 'رقم المحافظة', example: 1 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  governmentId: number;
}
