import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsEnum, IsOptional, IsBoolean, IsDateString } from 'class-validator';
import { Exclude, Type } from 'class-transformer';
import { BaseDTO } from 'src/core/utils/base.dto';
import { UserRole } from 'src/core/enums/user-role';
import { UserStatus } from 'src/core/enums/user-status';
import { ContactDTO } from '../../contact/dtos/contact.dto';
import { SalaryDTO } from '../../salary/dtos/salary.dto';
import { UserAttachmentDTO } from '../../user-attachment/dtos/user-attachment.dto';

/**
 * A User Data Transfer Object (DTO).
 */
export class UserDTO extends BaseDTO {
  @ApiProperty({
    example: 'email@domain.com',
    description: 'User email address',
    uniqueItems: true,
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @Exclude()
  @ApiProperty({
    example: 'StrongPassword123!',
    description: 'User password (write-only)',
    required: false,
  })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({
    example: 'john_doe',
    description: 'username (alias)',
    required: false,
  })
  @IsString()
  @IsOptional()
  username: string;

  @ApiProperty({
    example: true,
    description: 'Account activation status',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  activated?: boolean;

  @ApiProperty({
    example: 'https://cdn.example.com/avatar.png',
    description: 'Profile image URL',
    required: false,
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.DRIVER,
    description: 'System role for this user',
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({
    example: 'John',
    description: 'First name of the user',
    required: false,
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Last name of the user',
    required: false,
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({
    example: '9876543210',
    description: 'Personal identification number',
    required: false,
  })
  @IsOptional()
  @IsString()
  personalId?: string;

  @ApiProperty({
    example: '2025-12-31',
    description: 'Expiry date of personal ID',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  personalIdExpiryDate?: Date;

  @ApiProperty({
    example: 'Notes about the user',
    description: 'Optional notes or remarks',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Current status of the user',
    example: UserStatus.AVAILABLE,
    enum: UserStatus,
  })
  @IsEnum(UserStatus)
  status: UserStatus;

  @ApiProperty({
    example: 'USR00123',
    description: 'Unique code assigned to the user',
    required: false,
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({
    description: 'List of attachments belonging to the user',
    type: () => [UserAttachmentDTO],
    required: false,
  })
  @IsOptional()
  @Type(() => UserAttachmentDTO)
  userAttachments?: UserAttachmentDTO[];

  @ApiProperty({
    description: 'List of contacts associated with the user',
    type: () => [ContactDTO],
    required: false,
  })
  @IsOptional()
  @Type(() => ContactDTO)
  contacts?: ContactDTO[];

  @ApiProperty({
    description: 'Salary record associated with the user',
    type: () => SalaryDTO,
    required: false,
  })
  @IsOptional()
  @Type(() => SalaryDTO)
  salary?: SalaryDTO;

  @ApiProperty({
    description: 'Latest non-terminal journey id (driver assistants)',
    required: false,
  })
  @IsOptional()
  currentJourneyId?: number;

  @ApiProperty({
    description: 'Car id on the current active journey (driver assistants)',
    required: false,
  })
  @IsOptional()
  currentCarId?: number;

  @ApiProperty({
    description: 'Car code on the current active journey (driver assistants)',
    required: false,
  })
  @IsOptional()
  @IsString()
  currentCarCode?: string;
}
