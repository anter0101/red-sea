import { Repository, FindOptionsWhere } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { UserRole } from '../enums/user-role';
import { GeneratorTypes } from '../enums/generator-types';

/**
 * Generates a unique code for any entity repository
 * @param repository TypeORM repository
 * @param type Code type (Driver, Car, etc.)
 * @param field Optional field to check uniqueness (default: 'code')
 * @param relation Optional relation path for nested field (e.g., 'user.code')
 */
export const generateUniqueCode = async <T extends Record<string, any>>(
  repository: Repository<T>,
  type: GeneratorTypes | UserRole,
  field: keyof T = 'code' as keyof T,
  relation?: string,
): Promise<string> => {
  let unique = false;
  let code: string;

  const prefixMap = {
    [UserRole.DRIVER]: 'D',
    [UserRole.DRIVER_ASSISTANT]: 'F',
    [GeneratorTypes.CAR]: 'C',
    [GeneratorTypes.TRAILER]: 'T',
    [GeneratorTypes.SUPPLIER]: 'S',
    [UserRole.DATA_ENTRY]: 'E',
    [UserRole.ADMIN]: 'E',
    [UserRole.USER]: 'E',
    [GeneratorTypes.WAREHOUSE]: 'W',
    [GeneratorTypes.ACCOUNT]: 'A',
    [GeneratorTypes.TRANSACTION]: 'TRN',
    [GeneratorTypes.CLIENT]: 'CL',
    [GeneratorTypes.JOURNEY]: 'TRIP',
    [GeneratorTypes.INVOICE]: 'INV',
  };

  if (!prefixMap[type]) throw new BadRequestException('Unknown generator type');

  let attempt = 0;
  do {
    const qb = repository.createQueryBuilder('entity');
    const latestIdResult = await qb.select('MAX(entity.id)', 'latestId').getRawOne();

    // Ensure we get a numeric nextId, incrementing if there are collisions
    const nextId = (latestIdResult?.latestId || 0) + 1 + attempt;

    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    code = `${prefixMap[type]}-${dateStr}${nextId}`;

    if (!relation) {
      // Normal field uniqueness
      const where = { [field]: code } as FindOptionsWhere<T>;
      const existing = await repository.findOne({ where });
      unique = !existing;
    } else {
      // Nested relation uniqueness
      const exists = await repository
        .createQueryBuilder('entity')
        .where(`${relation} = :code`, { code })
        .getOne();
      unique = !exists;
    }

    if (!unique) {
      attempt++;
    }
  } while (!unique);

  return code;
};

export const generateUniqueUsername = async <T extends Record<string, any>>(
  repository: Repository<T>,
  role: UserRole,
  field: keyof T = 'username' as keyof T,
  relation?: string,
): Promise<string> => {
  let unique = false;
  let username: string;

  // Prefix mapping for each role
  const prefixMap: Record<UserRole, string> = {
    [UserRole.DRIVER]: 'dri-',
    [UserRole.DRIVER_ASSISTANT]: 'driAssistant-',
    [UserRole.DATA_ENTRY]: 'dataEntry-',
    [UserRole.ADMIN]: 'admin-',
    [UserRole.USER]: 'user-',
  };

  const prefix = prefixMap[role];
  if (!prefix) throw new BadRequestException('Unknown role for username generator');

  do {
    const random = Math.floor(10000 + Math.random() * 90000); // 5 digits
    username = `${prefix}${random}`;

    let where: FindOptionsWhere<T> | undefined;

    if (!relation) {
      where = { [field]: username } as FindOptionsWhere<T>;
      const existing = await repository.findOne({ where });
      unique = !existing;
    } else {
      const exists = await repository
        .createQueryBuilder('entity')
        .where(`${relation} = :username`, { username })
        .getOne();

      unique = !exists;
    }
  } while (!unique);

  return username;
};

/**
 * Generate a unique trip number (same pattern as other entity codes).
 */
export const generateUniqueJourneyNumber = async <T extends Record<string, any>>(
  repository: Repository<T>,
): Promise<string> => {
  return generateUniqueCode(repository, GeneratorTypes.JOURNEY, 'delegateNumber' as keyof T);
};

/**
 * Generate a random secure password
 */
export const generateRandomPassword = (length = 10): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};
