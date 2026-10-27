import { ApiProperty, OmitType } from '@nestjs/swagger';
import { DriverDTO } from './driver.dto';
import { CreateUserDTO } from '../../user/dtos/create-user.dto';
import { NestedCreateContactDTO } from '../../contact/dtos/nested-create-contact.dto';
import { IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDriverDTO extends OmitType(DriverDTO, ['id', 'updatedAt', 'user'] as const) {
  @ApiProperty({ type: CreateUserDTO, required: true })
  @IsNotEmpty({ message: 'User data is required' })
  @Type(() => CreateUserDTO)
  @ValidateNested()
  user: CreateUserDTO;

  @ApiProperty({
    type: [NestedCreateContactDTO],
    required: false,
    description:
      'Contacts for this driver (alternative to user.contacts; userId assigned server-side)',
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => NestedCreateContactDTO)
  contacts?: NestedCreateContactDTO[];
}
