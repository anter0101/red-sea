// src/journey-policy/dtos/create-journey-policy.dto.ts
import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { JourneyPolicyDTO } from './journey-policy.dto';
import { IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';
import { PolicyExpensesDTO } from './policy-expenses.dto';

export class CreateJourneyPolicyDTO extends OmitType(JourneyPolicyDTO, [
  'id',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'createdBy',
  'updatedBy',
  'deletedBy',
  'deliveryGov',
  'deliveryArea',
  'employee',
  'journey',
] as const) {
  @IsOptional()
  @IsInt()
  deliveryAreaId: number;
  @IsOptional()
  @IsInt()
  deliveryGovId: number;

  @IsOptional()
  @IsInt()
  employeeId: number;
  @IsInt()
  journeyId: number;

  @IsOptional()
  @IsInt()
  transportSupplierId?: number;

  @IsString()
  policyFile: string;

  @ApiPropertyOptional({ type: PolicyExpensesDTO, description: 'مصروفات الرحلة (سيارات الشركة)' })
  @IsOptional()
  @ValidateNested()
  @Type(() => PolicyExpensesDTO)
  expenses?: PolicyExpensesDTO;
}
