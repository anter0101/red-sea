'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetAllBranches } from '@/features/branches/api/get-all';
import { createQueryString } from '@/lib/utils';

const ALL = 'all';

/** Branch dropdown. Writes `branchId` into the URL so the list hooks pick it up. */
export default function BranchFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { branches } = useGetAllBranches({ pageSize: 500 });

  const selected = searchParams.get('branchId') ?? ALL;

  const onChange = (value: string) => {
    router.push(
      pathname +
        '?' +
        createQueryString(searchParams, {
          branchId: value === ALL ? null : value,
          page: 1,
        }),
    );
  };

  return (
    <Select value={selected} onValueChange={onChange}>
      <SelectTrigger className="h-10 w-full bg-white sm:w-[180px]">
        <SelectValue placeholder="الفرع" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>كل الفروع</SelectItem>
        {branches.map((branch) => (
          <SelectItem key={String(branch.id)} value={String(branch.id)}>
            {branch.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
