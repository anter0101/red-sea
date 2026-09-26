import { PartialType } from '@nestjs/swagger';
import { SalaryDTO } from './salary.dto';

export class UpdateSalaryDTO extends PartialType(SalaryDTO) {}
