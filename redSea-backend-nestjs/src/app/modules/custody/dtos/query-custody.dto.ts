import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { PaginateDTO } from 'src/core/utils/paginate.dto';
import { CustodyStatus } from 'src/core/enums/custody-status';

export class CustodyQueryDTO extends PaginateDTO {
  @ApiProperty({ required: false, enum: CustodyStatus })
  @IsOptional()
  @IsEnum(CustodyStatus)
  status?: CustodyStatus;

  @ApiProperty({ required: false, description: 'Filter by employee ID' })
  @IsOptional()
  @IsInt()
  employeeId?: number;

  @ApiProperty({ required: false, description: 'Filter by account ID' })
  @IsOptional()
  @IsInt()
  accountId?: number;

  @ApiProperty({ required: false, description: 'Filter by journey ID' })
  @IsOptional()
  @IsInt()
  journeyId?: number;

  @ApiProperty({ required: false, description: 'Filter by driver ID' })
  @IsOptional()
  @IsInt()
  driverId?: number;

  @ApiProperty({
    required: false,
    description: 'Search across custody status and related employee/account fields',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  createdAtFrom?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  createdAtTo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  updatedAtFrom?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  updatedAtTo?: string;
}
