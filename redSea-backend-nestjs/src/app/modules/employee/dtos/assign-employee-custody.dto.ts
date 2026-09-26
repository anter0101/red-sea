import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class AssignEmployeeCustodyDTO {
  @ApiProperty({ description: 'Custody amount in EGP', example: 1000 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;
}
