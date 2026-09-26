import { UserDTO } from 'src/app/modules/user/dtos/user.dto';
import { UserRole } from 'src/core/enums/user-role';
import { UserStatus } from 'src/core/enums/user-status';

export const users: UserDTO[] = [
  {
    id: 1,
    email: 'admin@admin.com',
    password: '12345',
    username: 'Administrator',
    role: UserRole.ADMIN,
    activated: true,
    status: UserStatus.AVAILABLE,
    createdBy: 'system',
  },
  {
    id: 2,
    email: 'user@user.com',
    password: '12345',
    username: 'Standard-User',
    role: UserRole.USER,
    activated: true,
    status: UserStatus.AVAILABLE,
    createdBy: 'system',
  },
];
