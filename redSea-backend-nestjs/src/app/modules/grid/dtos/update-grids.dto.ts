import { PartialType } from '@nestjs/swagger';
import { CreateGridsDTO } from './create-grids.dto';

export class UpdateGridsDTO extends PartialType(CreateGridsDTO) {}
