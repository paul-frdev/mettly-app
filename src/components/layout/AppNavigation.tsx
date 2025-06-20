'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { LogOut, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { signOut } from 'next-auth/react';
import Logo from '@/components/Logo';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function AppNavigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const t = useTranslations('navigation');
  const tAuth = useTranslations('auth');

  // Use a ref to track the scrollable container
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const container = containerRef.current?.parentElement?.parentElement; // Get the scrollable container
    
    if (!container) return;

    const handleScroll = () => {
      const scrollPosition = container.scrollTop;
      setIsScrolled(scrollPosition > 10);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/en' });
  };

  console.log('isScrolled', isScrolled);

  return (
    <motion.nav
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "sticky top-0 z-50 transition-all duration-300 ease-in-out border-b border-blue-100 shadow-sm",
        isScrolled
          ? "bg-white/70 backdrop-blur-md"
          : "bg-gradient-to-br from-gray-50 via-sky-50 to-blue-100"
      )}
    >
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 h-16">
        <div className="flex justify-end items-center h-full">

          <div className="flex items-center space-x-4">
            <div className="text-white">
              <LanguageSwitcher />
            </div>
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              <Link
                href="/profile"
                className="text-gray-700 hover:text-blue-700 px-4 py-2 text-sm font-medium transition-all duration-200"
              >
                {t('profile')}
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.2 }}
            >
              <button
                onClick={handleLogout}
                className="text-gray-700 hover:text-blue-700 flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span>{tAuth('logout')}</span>
              </button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.3 }}
            >
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="text-gray-700 hover:text-blue-700 p-2 transition-all duration-200"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}