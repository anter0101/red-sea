import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsEnum,
  IsBoolean,
  IsString,
  IsDateString,
  IsInt,
  ValidateIf,
} from 'class-validator';
import { PaginateDTO } from 'src/core/utils/paginate.dto';
import { AccountType } from './account.dto';
import { Type, Transform } from 'class-transformer';

/** Query string often sends the literal "null" — coerce to real null (root accounts only). */
export function parseParentAccountIdQuery(value: unknown): number | null | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value >= 1 ? value : undefined;
  }
  if (typeof value === 'object' || typeof value === 'bigint' || typeof value === 'symbol') {
    return undefined;
  }
  const s = String(value as string | boolean)
    .trim()
    .toLowerCase();
  if (s === '' || s === 'null' || s === 'undefined') return null;
  const n = parseInt(s, 10);
  if (Number.isNaN(n) || n < 1) return undefined;
  return n;
}

export class QueryAccountDTO extends PaginateDTO {
  @ApiPropertyOptional({
    description: 'Search by account code or name (case-insensitive partial match)',
    example: 'cash',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter accounts created on or after this date (ISO 8601)',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  createdAtFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter accounts created on or before this date (ISO 8601)',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  createdAtTo?: string;

  @ApiPropertyOptional({ description: 'Filter by account type', enum: AccountType })
  @IsOptional()
  @IsEnum(AccountType)
  type?: AccountType;

  @ApiPropertyOptional({
    description: 'Whether to include the parent account relation',
    default: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  includeParent?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by leaf status (true for leaf accounts, false for parent/group accounts)',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isLeaf?: boolean;

  @ApiPropertyOptional({
    description:
      'Omit to list all (other filters apply). Use null, empty, or the string "null" for root accounts only (no parent). Positive integer for direct children of that parent.',
    example: 1,
    nullable: true,
  })
  @IsOptional()
  @Transform(({ value }) => parseParentAccountIdQuery(value))
  @ValidateIf((_, v) => v !== undefined && v !== null)
  @IsInt()
  parentAccountId?: number | null;
}
