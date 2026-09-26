import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseDTO } from 'src/core/utils/base.dto';
import { UserDTO } from '../../user/dtos/user.dto';
import { BranchDTO } from '../../branch/dtos/branch.dto';

export class EmployeeDTO extends BaseDTO {
  @ApiPropertyOptional({
    description: 'Custody balance in EGP (computed on read from عهد account)',
    example: 1000,
  })
  custody?: number;

  @ApiPropertyOptional({
    description: 'Associated user for the employee',
    type: () => UserDTO,
  })
  user?: UserDTO;

  @ApiPropertyOptional({
    description: 'Associated branch for the employee',
    type: () => UserDTO,
  })
  branch?: BranchDTO;
}
