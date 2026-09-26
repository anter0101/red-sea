// src/journey-policy/dtos/journey-policy.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseDTO } from 'src/core/utils/base.dto';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';
import { EmployeeDTO } from '../../employee/dtos/employee.dto';
import { AreaDTO } from '../../area/dtos/area.dto';
import { GovernmentDTO } from '../../government/dtos/government.dto';
import { JourneyDTO } from '../../journey/dtos/journey.dto';

export class JourneyPolicyDTO extends BaseDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  goodsType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  bookWeight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  actualWeight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  tripDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  deliveryWeight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  shortageQty?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  policyNo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  policyDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  entryTimeFactory?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  exitTimeFactory?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  loadingDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  archiveNo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  loadingPermitNo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  tripDistance?: number;

  @ApiPropertyOptional({ type: () => AreaDTO })
  deliveryArea: AreaDTO;

  @ApiPropertyOptional({ type: () => GovernmentDTO })
  deliveryGov: GovernmentDTO;

  @ApiPropertyOptional({ type: () => EmployeeDTO })
  employee: EmployeeDTO;

  @ApiPropertyOptional({ type: () => JourneyDTO })
  journey: JourneyDTO;
}
