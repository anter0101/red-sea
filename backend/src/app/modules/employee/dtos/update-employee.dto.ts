import { PartialType } from '@nestjs/swagger';
import { EmployeeDTO } from './employee.dto';

export class UpdateEmployeeDTO extends PartialType(EmployeeDTO) {}
