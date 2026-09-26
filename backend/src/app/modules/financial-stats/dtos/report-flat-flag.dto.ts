import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

/** `flat=true` returns legacy flat account lists; `flat=false` (default) returns nested trees with rollups. */
export class ReportFlatQueryDTO {
  @ApiPropertyOptional({
    default: false,
    description:
      'When true, responses use flat arrays (legacy). When false, nested `children` trees with parent rollups.',
  })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true' || value === '1' || value === 1)
  @IsBoolean()
  flat?: boolean;
}
