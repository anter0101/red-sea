import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseDTO } from 'src/core/utils/base.dto';
import { IsDateString, IsOptional, IsString } from 'class-validator';
import { UserDTO } from '../../user/dtos/user.dto';

export class DriverDTO extends BaseDTO {
  @ApiProperty({
    description: 'Unique license number of the driver',
    example: 'LIC1234567',
  })
  @IsString()
  licenseNumber: string;

  @ApiPropertyOptional({
    description: 'Expiry date of the driver’s license',
    example: '2025-12-31',
  })
  @IsDateString()
  licenseExpiryDate: Date;

  @ApiPropertyOptional({
    description: 'Associated user for the driver',
    type: () => UserDTO,
  })
  user: UserDTO;

  @ApiPropertyOptional({ description: 'Latest non-terminal journey id for this driver' })
  @IsOptional()
  currentJourneyId?: number;

  @ApiPropertyOptional({ description: 'Car id on the current active journey' })
  @IsOptional()
  currentCarId?: number;

  @ApiPropertyOptional({ description: 'Car code on the current active journey' })
  @IsOptional()
  @IsString()
  currentCarCode?: string;
}
