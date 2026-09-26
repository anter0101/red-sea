import type { User as NextAuthUser } from 'next-auth';

export type UserType = NextAuthUser & {
  id?: string;
  email?: string | null;
  name?: string | null;
  password?: string;
};
