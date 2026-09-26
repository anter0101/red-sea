import { User } from './user.entity';
import { UserDTO } from './dtos/user.dto';
import { CreateUserDTO } from './dtos/create-user.dto';
import { UpdateUserDTO } from './dtos/update-user.dto';
import { BaseDTO } from 'src/core/utils/base.dto';
import { transformPassword } from 'src/core/security';
import { generateRandomPassword } from 'src/core/utils/generator';
import { UserRole } from 'src/core/enums/user-role';
import { UserStatus } from 'src/core/enums/user-status';

/**
 * Allowed keys for mapping a User entity to UserDTO.
 * Excludes sensitive fields like `password`.
 */
const allowedUserDtoKeys: ReadonlyArray<keyof UserDTO | keyof BaseDTO> = [
  'id',
  'email',
  'username',
  'activated',
  'imageUrl',
  'role',
  'status',
  'firstName',
  'lastName',
  'personalId',
  'personalIdExpiryDate',
  'notes',
  'createdBy',
  'updatedBy',
  'createdAt',
  'updatedAt',
  'contacts',
  'salary',
  'userAttachments',
  'code',
  'currentJourneyId',
  'currentCarId',
  'currentCarCode',
];

/**
 * Maps a User or an array of Users to DTO(s) selectively.
 *
 * @param userOrUsers - User entity or array
 * @param keys - Optional list of keys to include (default: all allowed keys)
 * @returns Partial<UserDTO> | Partial<UserDTO>[]
 */
export function mapUserToUserDtoSelective(
  user: User,
  keys?: (keyof UserDTO | keyof BaseDTO)[],
): Partial<UserDTO>;
export function mapUserToUserDtoSelective(
  users: User[],
  keys?: (keyof UserDTO | keyof BaseDTO)[],
): Partial<UserDTO>[];
export function mapUserToUserDtoSelective(
  userOrUsers: User | User[],
  keys?: (keyof UserDTO | keyof BaseDTO)[],
): Partial<UserDTO> | Partial<UserDTO>[] {
  const mapSingle = (user: User): Partial<UserDTO> => {
    const resultDto: Partial<UserDTO> = {};

    const keysToMap = (keys || allowedUserDtoKeys).filter((key) =>
      allowedUserDtoKeys.includes(key),
    );

    keysToMap.forEach((key) => {
      if (key in user && user[key as keyof User] !== undefined) {
        (resultDto as any)[key] = user[key as keyof User];
      }
    });

    return resultDto;
  };

  return Array.isArray(userOrUsers) ? userOrUsers.map(mapSingle) : mapSingle(userOrUsers);
}

/**
 * Maps CreateUserDTO → User entity
 * Handles hashing password and default values.
 */
export const mapUserCreateDtoToEntity = async (dto: CreateUserDTO): Promise<User> => {
  const user = new User();
  user.email = dto.email;
  user.username = dto.username;
  user.activated = dto.activated ?? false;
  user.imageUrl = dto.imageUrl;
  user.role = dto.role ?? UserRole.USER;
  user.status = dto.status ?? UserStatus.AVAILABLE;
  user.firstName = dto.firstName;
  user.lastName = dto.lastName;
  user.personalId = dto.personalId;
  user.personalIdExpiryDate = dto.personalIdExpiryDate;
  user.notes = dto.notes;
  user.createdAt = dto.createdAt;

  // ✅ Use provided password or generate one
  user.password = dto.password || generateRandomPassword();

  // ✅ Always hash the final password
  await transformPassword(user);

  return user;
};

export const mapUserUpdateDtoToEntity = async (dto: UpdateUserDTO): Promise<User> => {
  const user = new User();

  // Always include id if provided
  if (dto.id !== undefined) user.id = dto.id;

  // Only update provided fields
  if (dto.email !== undefined) user.email = dto.email;
  if (dto.username !== undefined) user.username = dto.username;
  if (dto.activated !== undefined) user.activated = dto.activated;
  if (dto.imageUrl !== undefined) user.imageUrl = dto.imageUrl;
  if (dto.role !== undefined) user.role = dto.role;
  if (dto.status !== undefined) user.status = dto.status;
  if (dto.firstName !== undefined) user.firstName = dto.firstName;
  if (dto.lastName !== undefined) user.lastName = dto.lastName;
  if (dto.personalId !== undefined) user.personalId = dto.personalId;
  if (dto.personalIdExpiryDate !== undefined) user.personalIdExpiryDate = dto.personalIdExpiryDate;
  if (dto.notes !== undefined) user.notes = dto.notes;
  if (dto.createdAt !== undefined) user.createdAt = dto.createdAt;

  // ✅ Update password if provided (and rehash)
  if (dto.password) {
    user.password = dto.password;
    await transformPassword(user);
  }

  return user;
};
