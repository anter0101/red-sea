import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';
import { JourneyAttachmentType } from 'src/core/enums/journey';
import { PaginateDTO } from 'src/core/utils/paginate.dto';

export class JourneyAttachmentQueryDTO extends PaginateDTO {
  @ApiProperty({ required: false, description: 'Filter by journey ID' })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  journeyId?: number;

  @ApiProperty({ required: false, enum: JourneyAttachmentType })
  @IsOptional()
  @IsEnum(JourneyAttachmentType)
  type?: JourneyAttachmentType;

  @ApiProperty({
    required: false,
    description: 'Search across attachment URL / file name',
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
