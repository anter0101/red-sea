import { ApiProperty } from '@nestjs/swagger';

export class EmployeeCustodyBalanceDTO {
  @ApiProperty({ description: 'Office employee id' })
  employeeId: number;

  @ApiProperty({ description: 'Employee custody account id' })
  accountId: number;

  @ApiProperty({ description: 'Employee custody account name' })
  accountName: string;

  @ApiProperty({ description: 'Available custody balance from the employee account' })
  custodyAmount: number;
}
