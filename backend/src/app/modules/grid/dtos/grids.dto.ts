import { ApiProperty } from '@nestjs/swagger';
import { BaseDTO } from 'src/core/utils/base.dto';
import { IsString, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { UserDTO } from '../../user/dtos/user.dto';

export class GridsDTO extends BaseDTO {
  @ApiProperty({ type: () => UserDTO })
  @ValidateNested()
  @Type(() => UserDTO)
  user: UserDTO;

  @ApiProperty()
  @IsString()
  pageKey: string;

  @ApiProperty({ type: [Object] })
  @IsArray()
  columns: any[];
}
