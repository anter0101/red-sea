import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  Min,
  ValidateNested,
} from 'class-validator';
import { OfficeRequestStatus } from 'src/core/enums/office-request';

/** Status values allowed when an admin performs a request action. */
export const OFFICE_REQUEST_ACTION_STATUSES = [
  OfficeRequestStatus.APPROVED,
  OfficeRequestStatus.REJECTED,
] as const;

export enum CustodyTransferParty {
  TREASURY = 'TREASURY',
  EMPLOYEE = 'EMPLOYEE',
}

export class OfficeRequestCustodyActionDTO {
  @ApiProperty({ description: 'Custody amount to transfer on approve' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Type(() => Number)
  amount: number;

  @ApiPropertyOptional({
    enum: CustodyTransferParty,
    description: 'END_WORKING_SHIFT: transfer requester custody to treasury or employee',
    default: CustodyTransferParty.TREASURY,
  })
  @IsOptional()
  @IsEnum(CustodyTransferParty)
  transferTo?: CustodyTransferParty;

  @ApiPropertyOptional({ description: 'Required when transferTo is EMPLOYEE' })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  targetEmployeeId?: number;

  @ApiPropertyOptional({
    enum: CustodyTransferParty,
    description: 'ASK_FOR_CUSTODY: source of custody (treasury or employee)',
    default: CustodyTransferParty.TREASURY,
  })
  @IsOptional()
  @IsEnum(CustodyTransferParty)
  transferFrom?: CustodyTransferParty;

  @ApiPropertyOptional({ description: 'Required when transferFrom is EMPLOYEE' })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  sourceEmployeeId?: number;
}

export class OfficeRequestActionDTO {
  @ApiProperty({
    enum: OFFICE_REQUEST_ACTION_STATUSES,
    description: 'Approve or reject the request',
  })
  @IsEnum(OFFICE_REQUEST_ACTION_STATUSES)
  status: OfficeRequestStatus.APPROVED | OfficeRequestStatus.REJECTED;

  @ApiPropertyOptional({
    type: OfficeRequestCustodyActionDTO,
    description: 'Required for END_WORKING_SHIFT and ASK_FOR_CUSTODY when approving',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => OfficeRequestCustodyActionDTO)
  custody?: OfficeRequestCustodyActionDTO;
}
