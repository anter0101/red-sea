import { ApiProperty, OmitType } from '@nestjs/swagger';
import { CustodyDTO } from './custody.dto';
import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateCustodyDTO extends OmitType(CustodyDTO, [
  'id',
  'updatedAt',
  'employee',
  'account',
] as const) {
  @ApiProperty({ example: 1, description: 'Employee ID linked to this custody' })
  @IsNotEmpty()
  @IsInt()
  employeeId: number;

  @ApiProperty({ example: 1, description: 'Account ID linked to this custody' })
  @IsNotEmpty()
  @IsInt()
  accountId: number;
}
