import React from 'react';

import { Skeleton } from '@/components/ui/skeleton';

export default function LevelCardSkeleton() {
  return (
    <div>
      <div className="flex flex-col gap-1">
        <Skeleton className="h-24 w-34 rounded-xl" />
        <Skeleton className="h-4 w-34" />
        <Skeleton className="h-4 w-34" />
      </div>
    </div>
  );
}
