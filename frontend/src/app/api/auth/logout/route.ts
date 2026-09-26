import { NextResponse } from 'next/server';

import { signOut } from '@/app/[locale]/authentication/auth';

export async function POST() {
  await signOut({ redirect: false });

  return NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });
}
