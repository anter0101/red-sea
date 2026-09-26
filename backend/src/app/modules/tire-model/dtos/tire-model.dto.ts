import { ApiProperty } from '@nestjs/swagger';
import { BaseDTO } from 'src/core/utils/base.dto';
import { IsString } from 'class-validator';

export class TireModelDTO extends BaseDTO {
  @ApiProperty({ example: 'Michelin X' })
  @IsString()
  name: string;
}
