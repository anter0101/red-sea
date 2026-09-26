'use client';

import client from '@/lib/client';

type Props = Readonly<{
  children: React.ReactNode;
  token: string;
}>;

export default function AuthTokenProvider({ children, token }: Props) {
  if (token) {
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete client.defaults.headers.common['Authorization'];
  }

  return <>{children}</>;
}
