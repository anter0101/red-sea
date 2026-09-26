import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { BaseDTO } from 'src/core/utils/base.dto';

export class BranchDTO extends BaseDTO {
  @ApiProperty({ description: 'Branch name', example: 'Cairo Main Branch' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
