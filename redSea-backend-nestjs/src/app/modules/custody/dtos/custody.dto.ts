import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseDTO } from 'src/core/utils/base.dto';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { CustodyStatus } from 'src/core/enums/custody-status';
import { EmployeeDTO } from '../../employee/dtos/employee.dto';
import { AccountDTO } from '../../account/dtos/account.dto';
import { JourneyDTO } from '../../journey/dtos/journey.dto';
import { DriverDTO } from '../../driver/dtos/driver.dto';

export class CustodyDTO extends BaseDTO {
  @ApiProperty({ example: 1, description: 'Employee ID linked to this custody' })
  @IsNumber()
  employeeId: number;

  @ApiProperty({ example: 1, description: 'Account ID linked to this custody' })
  @IsNumber()
  accountId: number;

  @ApiPropertyOptional({ enum: CustodyStatus, example: CustodyStatus.ACTIVE })
  @IsOptional()
  @IsEnum(CustodyStatus)
  status?: CustodyStatus;

  @ApiPropertyOptional({ example: 1, description: 'Journey ID linked to this custody' })
  @IsOptional()
  @IsNumber()
  journeyId?: number;

  @ApiPropertyOptional({ example: 1, description: 'Driver ID linked to this custody' })
  @IsOptional()
  @IsNumber()
  driverId?: number;

  @ApiPropertyOptional({
    description: 'Associated employee',
    type: () => EmployeeDTO,
  })
  @IsOptional()
  employee?: EmployeeDTO;

  @ApiPropertyOptional({
    description: 'Associated account',
    type: () => AccountDTO,
  })
  @IsOptional()
  account?: AccountDTO;

  @ApiPropertyOptional({
    description: 'Associated journey',
    type: () => JourneyDTO,
  })
  @IsOptional()
  journey?: JourneyDTO;

  @ApiPropertyOptional({
    description: 'Associated driver',
    type: () => DriverDTO,
  })
  @IsOptional()
  driver?: DriverDTO;

  @ApiPropertyOptional({
    description: 'Current account balance for this custody (EGP)',
    example: 5000,
  })
  @IsOptional()
  @IsNumber()
  custodyAmount?: number;
}
