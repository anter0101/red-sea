import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, ValidateNested } from 'class-validator';
import { JourneyVehicleMode } from 'src/core/enums/journey-vehicle-mode';
import { JourneyDTO } from './journey.dto';
import {
  JourneyCarAssignmentDTO,
  JourneyDriverAssignmentDTO,
  JourneyTrailerAssignmentDTO,
  transformCarAssignment,
  transformDriverAssignment,
  transformTrailerAssignment,
} from './journey-asset-assignment.dto';

export class CreateJourneyDTO extends OmitType(JourneyDTO, [
  'id',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'createdBy',
  'updatedBy',
  'deletedBy',
  'driver',
  'driverAssistant',
  'car',
  'custodySource',
  'trailer',
  'expectedRevenue',
  'actualRevenue',
  'delegateNumber',
] as const) {
  @ApiProperty({
    enum: JourneyVehicleMode,
    description:
      'NOLON_CAR / CONTRACT_CAR / COMPANY_CAR — car & trailer ownerShip must match this mode. NOLON: inline driver/car/trailer objects (no create wrapper).',
  })
  @IsEnum(JourneyVehicleMode)
  vehicleMode: JourneyVehicleMode;

  @ApiPropertyOptional({
    description:
      'Existing driver id. CONTRACT_CAR / COMPANY_CAR: use flat driverId. NOLON: driverId or driver { id } or driver { user: { ... } }.',
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  driverId?: number;

  @ApiPropertyOptional({
    description:
      'NOLON: `{ user: { firstName, lastName, nationalId, phoneNumber } }` or `{ id }`. Legacy `{ create: ... }` still accepted.',
  })
  @IsOptional()
  @ValidateNested()
  @Transform(transformDriverAssignment, { toClassOnly: true })
  @Type(() => JourneyDriverAssignmentDTO)
  driver?: JourneyDriverAssignmentDTO;

  @ApiPropertyOptional({ description: 'Assistant driver user id', required: false })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  driverAssistantId?: number;

  @ApiPropertyOptional({
    description:
      'Existing car id. NOLON inline: car { plateNumber, plateLetters, ... } without create wrapper.',
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  carId?: number;

  @ApiPropertyOptional({ description: 'NOLON inline car or `{ id }` for select' })
  @IsOptional()
  @ValidateNested()
  @Transform(transformCarAssignment, { toClassOnly: true })
  @Type(() => JourneyCarAssignmentDTO)
  car?: JourneyCarAssignmentDTO;

  @ApiPropertyOptional({
    description:
      'Existing trailer id. NOLON inline: trailer { plateNumber, plateLetters, maxWeight, ... }.',
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  trailerId?: number;

  @ApiPropertyOptional({ description: 'NOLON inline trailer or `{ id }` for select' })
  @IsOptional()
  @ValidateNested()
  @Transform(transformTrailerAssignment, { toClassOnly: true })
  @Type(() => JourneyTrailerAssignmentDTO)
  trailer?: JourneyTrailerAssignmentDTO;

  @ApiProperty({ description: 'Client id' })
  @IsInt()
  @Type(() => Number)
  clientId: number;

  @ApiPropertyOptional({ description: 'Custody advance amount' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  custodyAmount?: number;

  @ApiPropertyOptional({
    description:
      'Delivery area chosen when the delegation is issued. Stored on the journey and copied onto the policy.',
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  deliveryAreaId?: number;
}
