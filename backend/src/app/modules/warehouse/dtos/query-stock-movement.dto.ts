import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { PaginateDTO } from 'src/core/utils/paginate.dto';

export class QueryStockMovementDTO extends PaginateDTO {
  @ApiPropertyOptional({ description: 'Unused; warehouse id comes from path' })
  @IsOptional()
  _?: string;
}
