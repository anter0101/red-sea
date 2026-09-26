import { BaseDTO } from 'src/core/utils/base.dto';
import { UserDTO } from '../../user/dtos/user.dto';
import { IsOptional, IsString } from 'class-validator';

export class ContactDTO extends BaseDTO {
  @IsString()
  phone: string;

  @IsOptional()
  isPrimary?: boolean;

  user: UserDTO;
}
