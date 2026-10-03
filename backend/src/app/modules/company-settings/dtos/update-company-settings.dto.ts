import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateCompanySettingsDTO {
  @ApiProperty({ example: 'البحر الاحمر لتجارة الاسمنت' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: '758-003-633' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  taxCard: string;

  @ApiProperty({ example: '220842' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  commercialRegister: string;
}
