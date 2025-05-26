'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogOut, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { signOut, useSession } from 'next-auth/react';
import Logo from '@/components/Logo';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { useTranslations } from 'next-intl';

export function AppNavigation() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { data: session } = useSession();
  const [isClient, setIsClient] = useState(false);
  const t = useTranslations('navigation');
  const tAuth = useTranslations('auth');

  const userNavigation = [
    { name: 'dashboard', href: '/dashboard' },
    { name: 'clients', href: '/clients' },
    { name: 'appointments', href: '/appointments' },
    { name: 'settings', href: '/settings/user' }
  ];

  const clientNavigation = [
    { name: 'dashboard', href: '/dashboard' },
    { name: 'settings', href: '/settings/client' }
  ];

  useEffect(() => {
    const checkClientStatus = async () => {
      if (session?.user?.email) {
        const res = await fetch(`/api/clients/check?email=${session.user.email}`);
        const data = await res.json();
        setIsClient(data.isClient);
      }
    };
    checkClientStatus();
  }, [session]);

  const navigation = isClient ? clientNavigation : userNavigation;

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/en' });
  };

  if (!mounted) {
    return null;
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ease-in-out ${isScrolled
        ? 'bg-white/75 backdrop-blur-sm shadow-sm dark:bg-gray-900/75'
        : 'bg-white shadow dark:bg-gray-900'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/dashboard">
                <Logo />
              </Link>
            </div>
            <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${isActive
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
                      } inline-flex items-center px-1 py-2 text-sm font-medium transition-colors duration-200`}
                  >
                    {t(item.name)}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <Link
              href="/profile"
              className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 text-sm font-medium transition-colors duration-200"
            >
              {t('profile')}
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 text-sm font-medium transition-colors duration-200"
            >
              <LogOut className="h-4 w-4" />
              <span>{tAuth('logout')}</span>
            </button>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors duration-200"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
} 