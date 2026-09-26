import Link from 'next/link';
import type { ReactNode } from 'react';

import { EMPTY_DISPLAY } from '@/lib/empty-display';

type CodeLinkProps = {
  href?: string | null;
  children: ReactNode;
};

/** Renders a detail link when href is set; otherwise plain text (or dash). */
export function CodeLink({ href, children }: CodeLinkProps) {
  const value = children == null || children === '' ? EMPTY_DISPLAY : children;
  if (!href || value === EMPTY_DISPLAY || value === '-') {
    return <>{value}</>;
  }
  return (
    <Link href={href} className="text-blue-600 hover:underline" onClick={(e) => e.stopPropagation()}>
      {value}
    </Link>
  );
}
