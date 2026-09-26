import { ApiProperty } from '@nestjs/swagger';
import { BaseDTO } from 'src/core/utils/base.dto';
import { IsString } from 'class-validator';

export class GovernmentDTO extends BaseDTO {
  @ApiProperty({ description: 'إسم المحافظة', example: 'القاهرة' })
  @IsString()
  name: string;
}
