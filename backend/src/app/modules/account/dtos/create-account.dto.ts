import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsInt, IsOptional, ValidateIf, IsEnum, IsNumber } from 'class-validator';
import { AccountDTO, AccountType } from './account.dto';
import { normalBalanceType } from '../account.entity';

/**
 * Create body: `type` / `normalBalance` are required for root accounts only (set once; not updatable later).
 * With `parentAccountId`, omit `normalBalance` — it is always taken from the parent; type defaults to parent or may be CASH under ASSET — see AccountService.
 */
export class CreateAccountDTO extends OmitType(AccountDTO, [
  'id',
  'code',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'createdBy',
  'updatedBy',
  'deletedBy',
  'isLeaf',
  'isSystem',
  'type',
  'normalBalance',
  'parentAccount',
  'childAccounts',
  'openingBalance',
  'openingBalanceLocked',
] as const) {
  @ApiPropertyOptional({
    description:
      'Parent account id. When set, normalBalance is inherited from the parent; type is optional and must be valid under that parent (same type, or CASH under ASSET).',
    example: 12,
  })
  @IsOptional()
  @IsInt()
  parentAccountId?: number;

  @ApiPropertyOptional({
    description:
      'Required when creating a root account (no parent). When creating under a parent, omit to inherit parent type, or send ASSET/CASH etc. per hierarchy rules.',
    enum: AccountType,
  })
  @ValidateIf((o: CreateAccountDTO) => o.parentAccountId == null)
  @IsEnum(AccountType)
  type?: AccountType;

  @ApiPropertyOptional({
    description:
      'Required when creating a root account. When creating under a parent, omit — always taken from the parent.',
    enum: normalBalanceType,
  })
  @ValidateIf((o: CreateAccountDTO) => o.parentAccountId == null)
  @IsEnum(normalBalanceType)
  normalBalance?: normalBalanceType;

  @ApiPropertyOptional({
    description:
      'Optional opening balance at creation. When supplied (including 0), it is saved and locked; it cannot be edited later via the API.',
    example: 5000,
  })
  @IsOptional()
  @IsNumber()
  openingBalance?: number;
}
