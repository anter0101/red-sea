import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';
import { FileExtensions } from 'src/core/enums/file-extension';
import { MimeTypes } from 'src/core/enums/mime-type';
import type { MimeType } from 'src/core/enums/mime-type';
import { BaseDTO } from 'src/core/utils/base.dto';

export class CreatePresignedUrlDto extends BaseDTO {
  @ApiProperty({
    example: 'example.jpg',
    description: 'Name of the file to be uploaded',
    required: true,
  })
  @IsNotEmpty()
  readonly name: string;

  @ApiProperty({
    example: FileExtensions.JPG,
    description: 'Type of the file to be uploaded',
    enum: FileExtensions,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @IsEnum(MimeTypes, {
    message: `Type must be ${Object.values(MimeTypes).join(', ')}`,
  })
  readonly type: MimeType;

  @ApiProperty({
    example: 5242880, // 5MB in bytes
    description: 'File size in bytes',
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  readonly size: number;
}
