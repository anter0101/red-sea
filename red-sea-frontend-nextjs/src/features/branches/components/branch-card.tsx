import React from 'react';
import { IBranch } from '../types';
import Link from 'next/link';

interface BranchCardProps {
  item: IBranch;
}

export default function BranchCard({ item }: BranchCardProps) {
  return (
    <Link
      href={`/branches/${item.id}`}
      className="flex flex-col h-40 items-center justify-center bg-white shadow-xl rounded-lg cursor-pointer"
    >
      <h2 className="text-lg font-bold ">{item.name}</h2>
    </Link>
  );
}
