import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';
import { ContactDTO } from './contact.dto';

export class CreateContactDTO extends OmitType(ContactDTO, [
  'id',
  'createdAt',
  'updatedAt',
  'user',
] as const) {
  @ApiProperty({ example: 12 })
  @IsInt()
  @IsNotEmpty()
  userId: number;
}
