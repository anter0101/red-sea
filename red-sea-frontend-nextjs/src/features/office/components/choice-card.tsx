import Link from 'next/link';

import { cn } from '@/lib/utils';

interface ChoiceCardProps {
  title: string;
  href: string;
  className?: string;
}

export default function ChoiceCard({ title, href, className }: ChoiceCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        'flex min-h-32 items-center justify-center rounded-xl border border-border bg-card p-8',
        'text-center text-lg font-semibold text-foreground shadow-sm transition-all',
        'hover:-translate-y-1 hover:shadow-md',
        className,
      )}
    >
      {title}
    </Link>
  );
}
