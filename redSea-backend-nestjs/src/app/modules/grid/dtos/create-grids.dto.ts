import { IsString, IsArray } from 'class-validator';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { GridsDTO } from './grids.dto';

export class CreateGridsDTO extends OmitType(GridsDTO, [
  'id',
  'user',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'createdBy',
  'updatedBy',
  'deletedBy',
] as const) {
  @IsString()
  pageKey: string;

  @ApiProperty({ type: [Object], required: true })
  @IsArray()
  columns: any[];
}
