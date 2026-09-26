import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';
import { SalaryDTO } from './salary.dto';

export class CreateSalaryDTO extends OmitType(SalaryDTO, ['id'] as const) {
  @ApiProperty({ example: 12 })
  @IsInt()
  @IsPositive()
  userId: number;
}
