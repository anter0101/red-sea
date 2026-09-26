import { OmitType } from '@nestjs/swagger';
import { BranchDTO } from './branch.dto';

export class CreateBranchDTO extends OmitType(BranchDTO, [
  'id',
  'updatedAt',
  'createdBy',
  'updatedBy',
] as const) {}
