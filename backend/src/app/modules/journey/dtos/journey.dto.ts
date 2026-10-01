import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseDTO } from 'src/core/utils/base.dto';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { DriverDTO } from '../../driver/dtos/driver.dto';
import { CarDTO } from '../../car/dtos/car.dto';
import { TrailerDTO } from '../../trailer/dtos/trailer.dto';
import { JourneyStatus } from 'src/core/enums/journey';
import { UserDTO } from '../../user/dtos/user.dto';
import { ClientDTO } from '../../factory/dtos/client.dto';
import { EmployeeDTO } from '../../employee/dtos/employee.dto';
import { PackingType } from 'src/core/enums/packing-type';

export class JourneyDTO extends BaseDTO {
  @ApiPropertyOptional({
    description: 'Delegation number (auto-generated on create)',
    example: 'TRIP-202609021',
  })
  @IsOptional()
  @IsString()
  delegateNumber?: string;

  @ApiPropertyOptional({ description: 'Authorization date' })
  @IsOptional()
  @IsDateString()
  delegateDate?: Date;

  @ApiPropertyOptional({ description: 'Current status of the trip' })
  @IsString()
  @IsOptional()
  tripStatus: JourneyStatus;

  @ApiProperty({ type: () => DriverDTO })
  driver: DriverDTO;

  @ApiPropertyOptional({ type: () => UserDTO })
  @IsOptional()
  driverAssistant: UserDTO;

  @ApiProperty({ type: () => CarDTO })
  car: CarDTO;

  @ApiPropertyOptional({ type: () => TrailerDTO })
  @IsOptional()
  trailer: TrailerDTO;

  @ApiProperty({ type: () => ClientDTO })
  client: ClientDTO;

  // ----------------- New fields -----------------
  @ApiPropertyOptional({ description: 'Direction / جهة' })
  @IsOptional()
  @IsString()
  direction?: string;

  @ApiPropertyOptional({ description: 'Quantity / الكمية' })
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiPropertyOptional({ description: 'Expected revenue (x × quantity)' })
  @IsOptional()
  @IsNumber()
  expectedRevenue?: number;

  @ApiPropertyOptional({ description: 'Actual revenue (x × bookWeight)' })
  @IsOptional()
  @IsNumber()
  actualRevenue?: number;

  @ApiPropertyOptional({ description: 'Cement grade / رتبة الاسمنت' })
  @IsOptional()
  @IsString()
  cementGrade?: string;

  @ApiPropertyOptional({ description: 'Packing type / نوع التعبئة' })
  @IsOptional()
  @IsEnum(PackingType)
  packingType?: PackingType;

  @ApiPropertyOptional({ description: 'Selling order number' })
  @IsOptional()
  @IsString()
  sellingOrderNo?: string;

  @ApiPropertyOptional({ description: 'Received company' })
  @IsOptional()
  @IsString()
  receivedCompany?: string;

  @ApiPropertyOptional({ description: 'Source of custody' })
  @IsOptional()
  @IsString()
  custodySource: EmployeeDTO;
}
