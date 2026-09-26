'use client';

import { ChevronDown, LogOut, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { UserType } from '@/types/user';

type Props = {
  user?: UserType;
  onLogout?: () => void;
};

export default function HeaderUserMenu({ user, onLogout }: Props) {
  return (
    <DropdownMenu>
      {/* Trigger */}
      <DropdownMenuTrigger asChild>
        <div className="flex cursor-pointer items-center gap-2 text-white">
          <User className="size-5 shrink-0" aria-hidden />
          <div className="text-right">
            <h2 className="font-semibold">{user?.name}</h2>
            <h4 className="text-sm text-white/90">{user?.email}</h4>
          </div>
          <ChevronDown className="size-4 shrink-0 text-breadcrumb-muted" aria-hidden />
        </div>
      </DropdownMenuTrigger>

      {/* Menu */}
      <DropdownMenuContent className="w-40">
        <DropdownMenuItem
          onClick={onLogout}
          className="flex items-center gap-2 text-red-600 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          تسجيل الخروج
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
