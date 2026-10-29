import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { AxiosError } from 'axios';

import client from '@/lib/client';
import {
  isSessionPastMaxAge,
  SESSION_MAX_AGE_SECONDS,
  sessionExpiresAt,
} from '@/lib/session-lifetime';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
        token: { label: 'Token', type: 'text' },
        user: { label: 'User', type: 'text' },
      },
      async authorize(credentials) {
        const { email, password, token, user } = credentials as {
          email: string;
          password: string;
          token?: string;
          user?: string;
        };

        // Case 1: Direct user and token provided (from OTP verification)
        if (token && user) {
          try {
            const userData = typeof user === 'string' ? JSON.parse(user) : user;
            return {
              ...userData,
              token,
              role: userData.role || 'user',
            };
          } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
          }
        }

        // Case 2: Regular email/password login
        try {
          const response = await client.post('/api/auth/login', {
            email,
            password,
          });
          if (!response?.data?.user || !response?.data?.token) {
            throw new Error('Invalid credentials');
          }

          return {
            ...response.data.user,
            token: response.data.token,
            role: response.data.user.role || 'user',
          };
        } catch (error) {
          console.error('Authentication error:', error);
          if (error instanceof AxiosError && error.response) {
            console.error('Error response data:', error.response.data);
            console.error('Error response status:', error.response.status);
            console.error('Error response headers:', error.response.headers);
            // Don't throw error, return null instead
            // NextAuth will handle this as failed authentication
            return null;
          }
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: SESSION_MAX_AGE_SECONDS,
  },
  callbacks: {
    // Access control + locale redirects live in `src/middleware.ts`.
    authorized: () => true,
    async jwt({ token, user }) {
      const now = Math.floor(Date.now() / 1000);
      if (user) {
        token.id = user.id as string;
        token.email = user.email;
        token.token = user.token;
        token.role = user.role || 'user';
        token.loggedInAt = now;
        return token;
      }

      // Auth.js re-issues the cookie on every session read. loggedInAt is the
      // real clock, so the session still ends 6 hours after login.
      if (isSessionPastMaxAge(token.loggedInAt, now)) {
        return null;
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.token = token.token as string;
        session.user.role = token.role as string;
        if (typeof token.loggedInAt === 'number') {
          session.expires = sessionExpiresAt(token.loggedInAt);
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
} satisfies NextAuthConfig;
