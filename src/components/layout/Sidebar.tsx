'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const t = useTranslations('navigation');
  const tAuth = useTranslations('auth');

  const userNavigation = [
    { name: 'dashboard', href: '/dashboard' },
    { name: 'clients', href: '/clients' },
    { name: 'appointments', href: '/appointments' },
    { name: 'calendar', href: '/calendar' },
    { name: 'settings', href: '/settings/user' }
  ];

  const clientNavigation = [
    { name: 'dashboard', href: '/dashboard' },
    { name: 'calendar', href: '/calendar' },
    { name: 'settings', href: '/settings/client' }
  ];

  const navigation = session?.user?.isClient ? clientNavigation : userNavigation;

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/en' });
  };

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 h-screen bg-gradient-to-br from-gray-50 via-sky-50 to-blue-100 border-r border-gray-200">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <Link href="/dashboard" className="text-xl font-semibold text-gray-900">
              Meet LY
            </Link>
          </div>
          <div className="mt-5 flex-1 flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname.includes(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors duration-200',
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                        : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                    )}
                  >
                    <span className="truncate">{t(item.name)}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors duration-200"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {tAuth('logout')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
