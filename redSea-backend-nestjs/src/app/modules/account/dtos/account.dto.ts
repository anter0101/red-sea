import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseDTO } from 'src/core/utils/base.dto';
import { IsString, IsEnum, IsBoolean, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { AccountType, normalBalanceType } from '../account.entity';

/** Re-export for modules that import the enum from DTOs (single source of truth: entity). */
export { AccountType };

export class AccountDTO extends BaseDTO {
  @ApiProperty({ description: 'Unique account code (generated on create)', example: 'A-202604051' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Account name', example: 'Cash in Bank' })
  @IsString()
  name: string;

  @ApiProperty({
    description:
      'Chart classification. Root: any valid value. Child: must match parent type, or CASH when parent is ASSET; normalBalance always follows the parent.',
    enum: AccountType,
    example: AccountType.ASSET,
  })
  @IsEnum(AccountType)
  type: AccountType;

  @ApiProperty({
    description:
      'True when the account has no sub-accounts; only leaf accounts accept journal lines.',
    default: true,
  })
  @IsBoolean()
  isLeaf: boolean;

  @ApiProperty({
    description:
      'True when the row was created by the system chart seeder. Such accounts cannot be updated or deleted via the API.',
    default: false,
  })
  @IsBoolean()
  isSystem: boolean;

  @ApiProperty({
    description:
      'Normal balance side for this account. For child accounts, always matches the parent.',
    enum: normalBalanceType,
    example: normalBalanceType.DEBIT,
  })
  @IsEnum(normalBalanceType)
  normalBalance: normalBalanceType;

  @ApiPropertyOptional({
    description:
      'User/seed opening balance included in reports before posted activity. Defaults to 0.',
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  openingBalance?: number;

  @ApiPropertyOptional({
    description: 'When true, openingBalance cannot be changed via the API.',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  openingBalanceLocked?: boolean;

  @ApiPropertyOptional({ description: 'Parent account', type: () => AccountDTO })
  @IsOptional()
  @Type(() => AccountDTO)
  parentAccount?: AccountDTO;

  @ApiPropertyOptional({
    description: 'Direct child accounts',
    type: () => AccountDTO,
    isArray: true,
  })
  @IsOptional()
  @Type(() => AccountDTO)
  childAccounts?: AccountDTO[];
}
