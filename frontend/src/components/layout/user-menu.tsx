'use client';

import { useState } from 'react';
import { ChevronDown, LogOut, MonitorDown, User } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useInstallApp } from '@/hooks/use-install-app';
import type { UserType } from '@/types/user';

import InstallAppDialog from './install-app-dialog';

type Props = {
  user?: UserType;
  onLogout?: () => void;
};

export default function HeaderUserMenu({ user, onLogout }: Props) {
  const { installed, canPrompt, install } = useInstallApp();
  const [installHelpOpen, setInstallHelpOpen] = useState(false);

  const handleInstall = () => {
    if (canPrompt) {
      void install();
    } else {
      setInstallHelpOpen(true);
    }
  };

  return (
    <>
      <DropdownMenu modal={false}>
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
        <DropdownMenuContent className="w-44">
          {!installed && (
            <DropdownMenuItem
              onClick={handleInstall}
              className="flex items-center gap-2 cursor-pointer"
            >
              <MonitorDown className="w-4 h-4" />
              تثبيت التطبيق
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={onLogout}
            className="flex items-center gap-2 text-red-600 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            تسجيل الخروج
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <InstallAppDialog open={installHelpOpen} onOpenChange={setInstallHelpOpen} />
    </>
  );
}
