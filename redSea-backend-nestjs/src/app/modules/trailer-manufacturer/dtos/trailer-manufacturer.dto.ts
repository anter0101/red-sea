import { ApiProperty } from '@nestjs/swagger';
import { BaseDTO } from 'src/core/utils/base.dto';
import { IsString } from 'class-validator';

export class TrailerManufacturerDTO extends BaseDTO {
  @ApiProperty({ example: 'Schmitz' })
  @IsString()
  name: string;
}
