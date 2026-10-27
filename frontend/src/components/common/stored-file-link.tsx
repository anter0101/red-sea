'use client';

import type { ReactNode } from 'react';

import { useSignedFileUrl } from '@/hooks/uploadS3/use-signed-file-url';
import { cn } from '@/lib/utils';

type StoredFileLinkProps = {
  url?: string | null;
  children: ReactNode;
  className?: string;
};

export function StoredFileLink({ url, children, className }: StoredFileLinkProps) {
  const { data, isPending, isError } = useSignedFileUrl(url);
  const href = data?.url;

  if (!href) {
    return (
      <span
        aria-disabled="true"
        title={isError ? 'تعذر فتح الملف' : undefined}
        className={cn('text-sm text-muted-foreground', isPending && 'animate-pulse', className)}
      >
        {children}
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn('text-sm text-primary underline', className)}
    >
      {children}
    </a>
  );
}
