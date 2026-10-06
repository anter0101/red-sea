// src/journey-policy/dtos/create-journey-policy.dto.ts
import { OmitType } from '@nestjs/swagger';
import { JourneyPolicyDTO } from './journey-policy.dto';
import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

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

  @IsOptional()
  @IsInt()
  custodySupplierId?: number;

  @IsOptional()
  @IsNumber()
  custodySupplierAmount?: number;

  @IsString()
  policyFile: string;
}
