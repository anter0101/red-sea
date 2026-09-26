import { ApiProperty, OmitType } from '@nestjs/swagger';
import { EmployeeDTO } from './employee.dto';
import { CreateUserDTO } from '../../user/dtos/create-user.dto';
import { IsNotEmpty, ValidateNested, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEmployeeDTO extends OmitType(EmployeeDTO, [
  'id',
  'updatedAt',
  'user',
  'branch',
  'custody',
] as const) {
  @ApiProperty({ type: CreateUserDTO, required: true })
  @IsNotEmpty({ message: 'User data is required' })
  @Type(() => CreateUserDTO)
  @ValidateNested()
  user: CreateUserDTO;

  @ApiProperty({ description: 'ID of the branch', example: 1, required: false })
  @IsOptional()
  @IsInt({ message: 'branchId must be an integer' })
  branchId?: number;
}
