import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseDTO } from 'src/core/utils/base.dto';
import { OfficeRequestStatus, OfficeRequestType } from 'src/core/enums/office-request';
import { JourneyDTO } from '../../journey/dtos/journey.dto';
import { EmployeeDTO } from '../../employee/dtos/employee.dto';

export class OfficeRequestDTO extends BaseDTO {
  @ApiProperty({ enum: OfficeRequestStatus })
  @IsEnum(OfficeRequestStatus)
  status: OfficeRequestStatus;

  @ApiProperty({ enum: OfficeRequestType })
  @IsEnum(OfficeRequestType)
  type: OfficeRequestType;

  @ApiPropertyOptional({ description: 'Request details' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Requested custody amount (ASK_FOR_CUSTODY only)' })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({ type: () => JourneyDTO })
  journey?: JourneyDTO;

  @ApiProperty({ type: () => EmployeeDTO, description: 'Employee who submitted the request' })
  requestedFrom: EmployeeDTO;

  @ApiProperty({ type: () => EmployeeDTO, description: 'Employee the request is assigned to' })
  requestedTo: EmployeeDTO;
}
