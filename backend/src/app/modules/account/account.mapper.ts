import { Account } from './account.entity';
import { AccountDTO } from './dtos/account.dto';
import { CreateAccountDTO } from './dtos/create-account.dto';
import { BaseDTO } from 'src/core/utils/base.dto';
import { UpdateAccountDTO } from './dtos/update-account.dto';

/**
 * Allowed keys for selective DTO mapping
 */
const allowedAccountDtoKeys: ReadonlyArray<keyof AccountDTO | keyof BaseDTO> = [
  'id',
  'code',
  'name',
  'type',
  'isLeaf',
  'isSystem',
  'parentAccount',
  'childAccounts',
  'normalBalance',
  'openingBalance',
  'openingBalanceLocked',
  'createdBy',
  'updatedBy',
  'createdAt',
  'updatedAt',
] as const;

/**
 * Selective mapper: maps Account → AccountDTO (single or array)
 */
export function mapAccountToAccountDtoSelective(
  account: Account,
  keys?: (keyof AccountDTO | keyof BaseDTO)[],
): Partial<AccountDTO>;

export function mapAccountToAccountDtoSelective(
  accounts: Account[],
  keys?: (keyof AccountDTO | keyof BaseDTO)[],
): Partial<AccountDTO>[];

export function mapAccountToAccountDtoSelective(
  data: Account | Account[],
  keys?: (keyof AccountDTO | keyof BaseDTO)[],
): Partial<AccountDTO> | Partial<AccountDTO>[] {
  const mapSingle = (account: Account): Partial<AccountDTO> => {
    const dto: Partial<AccountDTO> = {};

    const keysToMap = (keys || allowedAccountDtoKeys).filter((key) =>
      (allowedAccountDtoKeys as readonly string[]).includes(key),
    );

    keysToMap.forEach((key) => {
      if (key in account && account[key as keyof Account] !== undefined) {
        (dto as any)[key] = account[key as keyof Account];
      }
    });

    return dto;
  };

  return Array.isArray(data) ? data.map(mapSingle) : mapSingle(data);
}

/**
 * Create DTO → Entity
 */
export const mapCreateAccountDtoToEntity = (dto: CreateAccountDTO): Account => {
  const entity = new Account();

  entity.name = dto.name;
  entity.isLeaf = true; // every new account starts as a leaf; service marks parent non-leaf

  if (dto.type !== undefined) entity.type = dto.type;
  if (dto.normalBalance !== undefined) entity.normalBalance = dto.normalBalance;

  if (dto.parentAccountId != null) {
    const parentAccount = new Account();
    parentAccount.id = dto.parentAccountId;
    entity.parentAccount = parentAccount;
  }

  if (dto.openingBalance !== undefined) {
    entity.openingBalance = dto.openingBalance as unknown as number;
    entity.openingBalanceLocked = true;
  }

  return entity;
};

/**
 * Update DTO → Entity
 */
export const mapUpdateAccountDtoToEntity = (dto: UpdateAccountDTO, existing: Account): Account => {
  if (dto.name !== undefined) existing.name = dto.name;
  if (dto.type !== undefined) existing.type = dto.type;
  if (dto.parentAccountId != null) {
    const parentAccount = new Account();
    parentAccount.id = dto.parentAccountId;
    existing.parentAccount = parentAccount;
    existing.isLeaf = true;
  }

  return existing;
};
