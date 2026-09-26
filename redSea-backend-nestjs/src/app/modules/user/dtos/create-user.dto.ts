import { ApiProperty, OmitType } from '@nestjs/swagger';
import { UserDTO } from './user.dto';
import { NestedCreateContactDTO } from '../../contact/dtos/nested-create-contact.dto';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserDTO extends OmitType(UserDTO, [
  'id',
  'updatedAt',
  'contacts',
  'password',
] as const) {
  @ApiProperty({
    example: 'StrongPassword123!',
    description: 'User password (write-only)',
    required: false,
  })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({
    type: [NestedCreateContactDTO],
    required: false,
    description: 'Contacts for this user (userId assigned server-side)',
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => NestedCreateContactDTO)
  contacts?: NestedCreateContactDTO[];
}
