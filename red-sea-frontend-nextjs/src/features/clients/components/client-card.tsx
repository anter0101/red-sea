import React from 'react';
import Link from 'next/link';

import { IClient } from '../types';

interface ClientCardProps {
  item: IClient;
}

export default function ClientCard({ item }: ClientCardProps) {
  return (
    <Link
      href={`/clients/${item.id}`}
      className="flex flex-col h-40 items-center justify-center bg-white shadow-xl rounded-lg cursor-pointer"
    >
      <h2 className="text-lg font-bold">{item.name}</h2>
    </Link>
  );
}
