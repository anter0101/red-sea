import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsOptional, IsString, ValidateNested } from 'class-validator';
import { NolonInlineUserDTO } from './nolon-inline-user.dto';

export class NolonInlineDriverDTO {
  @ApiPropertyOptional({ example: 'LIC-NOLON-001' })
  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @ApiPropertyOptional({ example: '2030-12-31' })
  @IsOptional()
  @IsDateString()
  licenseExpiryDate?: string;

  @ValidateNested()
  @Type(() => NolonInlineUserDTO)
  user: NolonInlineUserDTO;
}
