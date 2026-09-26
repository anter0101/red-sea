import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';
import { OfficeRequestStatus, OfficeRequestType } from 'src/core/enums/office-request';
import { PaginateDTO } from 'src/core/utils/paginate.dto';

export class OfficeRequestQueryDTO extends PaginateDTO {
  @ApiProperty({ required: false, description: 'Filter by journey ID' })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  journeyId?: number;

  @ApiProperty({ required: false, description: 'Filter by requesting employee ID' })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  requestedFromId?: number;

  @ApiProperty({ required: false, description: 'Filter by target employee ID' })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  requestedToId?: number;

  @ApiProperty({ required: false, enum: OfficeRequestStatus })
  @IsOptional()
  @IsEnum(OfficeRequestStatus)
  status?: OfficeRequestStatus;

  @ApiProperty({ required: false, enum: OfficeRequestType })
  @IsOptional()
  @IsEnum(OfficeRequestType)
  type?: OfficeRequestType;

  @ApiProperty({
    required: false,
    description:
      'Search across description, journey delegate number, and employee user names',
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
