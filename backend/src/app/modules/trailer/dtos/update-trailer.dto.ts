import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreateTrailerDTO } from './create-trailer.dto';

export class UpdateTrailerDTO extends PartialType(CreateTrailerDTO) {
  id?: number;

  @ApiPropertyOptional({ example: 'T001' })
  @IsOptional()
  @IsString()
  code?: string;
}
