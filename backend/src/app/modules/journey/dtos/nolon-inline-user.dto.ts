import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

/** NOLON inline driver user — phone is stored on Contact, nationalId maps to personalId. */
export class NolonInlineUserDTO {
  @ApiProperty({ example: 'Nolon' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Driver' })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ description: 'Stored as user.personalId', example: '2' })
  @IsOptional()
  @Type(() => String)
  nationalId?: string | number;

  @ApiPropertyOptional({
    description: 'Primary contact phone (Contact entity)',
    example: '010051515',
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  password?: string;
}
