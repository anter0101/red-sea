'use client';

import { usePathname, useRouter } from 'next/navigation';
import type { UserType } from '@/types/user';
import Breadcrumb from '../common/bread-crumb';
import { getRouteTitle } from '@/config/routes';
import { startTransition } from 'react';
import HeaderUserMenu from './user-menu';

type Props = {
  user?: UserType;
};

export default function Header({ user }: Readonly<Props>) {
  const pathname = usePathname();
  const router = useRouter();
  const currentTitle = getRouteTitle(pathname);

  const handleLogout = async () => {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      startTransition(() => router.replace('/login'));
    } else {
      console.error('Logout failed');
    }
  };

  return (
    <header className="bg-nav-header flex h-20 px-10 items-center justify-between text-white z-50">
      <section className="flex flex-col">
        {/* <h1 className="titleStyle">{currentTitle}</h1> */}
        <Breadcrumb />
      </section>

      <HeaderUserMenu user={user} onLogout={handleLogout} />
    </header>
  );
}
