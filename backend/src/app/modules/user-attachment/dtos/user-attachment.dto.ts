import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseDTO } from 'src/core/utils/base.dto';
import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { UserAttachmentType } from 'src/core/enums/user-attachment-types';
import { UserDTO } from '../../user/dtos/user.dto';

export class UserAttachmentDTO extends BaseDTO {
  @ApiProperty({ type: () => UserDTO })
  @Type(() => UserDTO)
  user: UserDTO;

  @ApiProperty({ example: 'https://example.com/file.pdf' })
  @IsString()
  url: string;

  @ApiProperty({ enum: UserAttachmentType, example: UserAttachmentType.CREMINALRECORD })
  @IsEnum(UserAttachmentType)
  type: UserAttachmentType;

  @ApiPropertyOptional({ example: 'Additional notes about this attachment' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: '2025-12-31' })
  @IsDateString()
  @IsOptional()
  documentExpiryDate: Date;
}
