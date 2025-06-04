'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogOut, Moon, Sun, Menu, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import { signOut, useSession } from 'next-auth/react';
import Logo from '@/components/Logo';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { useDevicePerformance } from '@/hooks/useDevicePerformance';
import { cn } from '@/lib/utils';

export function AppNavigation() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession();
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = useTranslations('navigation');
  const tAuth = useTranslations('auth');
  const isLowPerformance = useDevicePerformance();

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
        try {
          const res = await fetch(`/api/clients/check?email=${session.user.email}`);
          const data = await res.json();
          setIsClient(data.isClient);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
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

  if (!mounted || status === 'loading' || isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 right-0 z-50 h-20 bg-gradient-to-br from-gray-50 via-sky-50 to-blue-100"
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Logo className="h-8 w-auto text-black" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out border-b border-blue-100 shadow-sm",
        isScrolled
          ? "bg-white/70 backdrop-blur-md"
          : "bg-gradient-to-br from-gray-50 via-sky-50 to-blue-100"
      )}
    >
      {/* Animated background elements */}
      {!isLowPerformance && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(isLowPerformance ? 5 : 8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/5 will-change-transform"
              style={{
                width: Math.random() * 50 + 25,
                height: Math.random() * 50 + 25,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                transform: 'translateZ(0)',
              }}
              animate={{
                x: [0, Math.random() * 50 - 25],
                y: [0, Math.random() * 50 - 25],
                scale: [1, 1.2, 1],
                opacity: [0.05, 0.1, 0.05],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}
        </div>
      )}

      {/* Glowing orbs */}
      {!isLowPerformance && (
        <>
          <motion.div
            className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-[#e42627] opacity-10 blur-3xl will-change-transform"
            style={{ transform: 'translateZ(0)' }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.15, 0.1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-[#0f0880] opacity-10 blur-3xl will-change-transform"
            style={{ transform: 'translateZ(0)' }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.15, 0.1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
        </>
      )}

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/dashboard">
                <Logo className="h-8 w-auto text-black" />
              </Link>
            </div>
            <div className="hidden md:ml-10 md:flex md:space-x-6">
              {navigation.map((item) => {
                const isActive = pathname.includes(item.href);
                return (
                  <motion.div
                    key={item.name}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        'text-gray-700 bg-inherit hover:text-blue-700 px-4 py-2 text-sm font-medium transition-all duration-200 relative',
                        isActive && 'bg-inherit text-blue-700'
                      )}
                    >
                      {t(item.name)}
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e42627]"
                          initial={false}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>

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

            {/* Mobile menu button */}
            <div className="md:hidden">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-700 hover:text-blue-700 p-2 transition-all duration-200"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-gradient-to-br from-[#0f0880] via-[#1a1a2e] to-[#16213e] backdrop-blur-xl"
          >
            <div className="px-4 pt-2 pb-4 space-y-2">
              {navigation.map((item, index) => {
                const isActive = pathname.includes(item.href);
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        'text-gray-700 hover:text-blue-700 block px-4 py-3 text-base font-medium transition-all duration-200 relative',
                        isActive && 'bg-blue-100 shadow'
                      )}
                    >
                      {t(item.name)}
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicatorMobile"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e42627]"
                          initial={false}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
} 