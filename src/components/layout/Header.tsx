'use client';

import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Moon, Sun, LogOut, Menu, X } from 'lucide-react';
import Logo from '@/components/Logo';
import { useRouter, usePathname } from 'next/navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useTranslations } from 'next-intl';

export default function Header() {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const t = useTranslations('navigation');
  const tAuth = useTranslations('auth')

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut({
        redirect: false
      });
      router.replace('/en');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Check if we're on the landing page
  const isLandingPage = pathname === '/' || pathname === '/en' || pathname === '/uk';

  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    if (href.startsWith('#') && pathname === '/') {
      // If it's a hash link and we're on the home page, scroll to the section
      const element = document.querySelector(href);
      element?.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Otherwise, navigate to the page
      router.push(href);
    }
  };

  if (!mounted) return null;

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}>
      <div className="container mx-auto px-4 max-w-[1400px]">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link
              href="/"
              onClick={(e) => handleNavigation(e, '/')}
              className="text-2xl font-sans font-bold text-[#0b3559] dark:text-white"
            >
              <Logo />
            </Link>

            {/* Main Navigation */}
            {!session || isLandingPage ? (
              <nav className="hidden md:flex items-center space-x-8 ml-8">
                <Link
                  href="#features"
                  onClick={(e) => handleNavigation(e, '#features')}
                  className="text-[#0f0880] font-sans font-normal hover:text-[#e42627] transition-colors"
                >
                  {t('features')}
                </Link>
                <Link
                  href="#pricing"
                  onClick={(e) => handleNavigation(e, '#pricing')}
                  className="text-[#0f0880] font-sans font-normal hover:text-[#e42627] transition-colors"
                >
                  {t('pricing')}
                </Link>
                <Link
                  href="#testimonials"
                  onClick={(e) => handleNavigation(e, '#testimonials')}
                  className="text-[#0f0880] font-sans font-normal hover:text-[#e42627] transition-colors"
                >
                  {t('testimonials')}
                </Link>
              </nav>
            ) : (
              <nav className="hidden md:flex items-center space-x-8 ml-8">
                <Link
                  href="/dashboard"
                  onClick={(e) => handleNavigation(e, '/dashboard')}
                  className="text-[#0f0880] font-sans font-normal hover:text-[#e42627] transition-colors"
                >
                  {t('dashboard')}
                </Link>
                <Link
                  href="/clients"
                  onClick={(e) => handleNavigation(e, '/clients')}
                  className="text-[#0f0880] font-sans font-normal hover:text-[#e42627] transition-colors"
                >
                  {t('clients')}
                </Link>
                <Link
                  href="/appointments"
                  onClick={(e) => handleNavigation(e, '/appointments')}
                  className="text-[#0f0880] font-sans font-normal hover:text-[#e42627] transition-colors"
                >
                  {t('appointments')}
                </Link>
                <Link
                  href="/settings"
                  onClick={(e) => handleNavigation(e, '/settings')}
                  className="text-[#0f0880] font-sans font-normal hover:text-[#e42627] transition-colors"
                >
                  {t('settings')}
                </Link>
              </nav>
            )}
          </div>

          {/* Right Side Navigation */}
          <div className="flex items-center space-x-6">
            {(!session || isLandingPage) && <LanguageSwitcher />}
            {!session || isLandingPage ? (
              <>
                {session && isLandingPage ? (
                  /* If logged in but on landing page, show Dashboard link */
                  <Link
                    href="/dashboard"
                    onClick={(e) => handleNavigation(e, '/dashboard')}
                    className="text-[#0f0880] font-sans font-normal hover:text-[#e42627] transition-colors"
                  >
                    {t('dashboard')}
                  </Link>
                ) : (
                  /* If not logged in, show login link */
                  <Link
                    href="/auth/login"
                    onClick={(e) => handleNavigation(e, '/auth/login')}
                    className="text-[#0f0880] font-sans font-normal hover:text-[#e42627] transition-colors"
                  >
                    {tAuth('login')}
                  </Link>
                )}

                {session && isLandingPage ? (
                  /* If logged in but on landing page, show logout button */
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-[#0f0880] hover:text-[#e42627] transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{tAuth('logout')}</span>
                  </button>
                ) : (
                  /* If not logged in, show register button */
                  <Link
                    href="/auth/register"
                    onClick={(e) => handleNavigation(e, '/auth/register')}
                    className="bg-[#e42627] hover:bg-[#d41f20] text-white px-6 py-2 rounded-lg font-sans font-semibold transition-colors"
                  >
                    {tAuth('getStarted')}
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link
                  href="/profile"
                  onClick={(e) => handleNavigation(e, '/profile')}
                  className="text-[#0f0880] font-sans font-normal hover:text-[#e42627] transition-colors"
                >
                  {t('profile')}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-[#0f0880] hover:text-[#e42627] transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-sans font-normal">{t('logout')}</span>
                </button>
              </>
            )}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg hover:bg-[#eef0f2] dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-[#0f0880]" />
              ) : (
                <Moon className="w-5 h-5 text-[#0f0880]" />
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-[#0b3559]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 space-y-4">
            <Link
              href="#features"
              className="block text-[#0f0880] font-sans font-normal hover:text-[#e42627] transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('features')}
            </Link>
            <Link
              href="#pricing"
              className="block text-[#0f0880] font-sans font-normal hover:text-[#e42627] transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('pricing')}
            </Link>
            <Link
              href="#testimonials"
              className="block text-[#0f0880] font-sans font-normal hover:text-[#e42627] transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('testimonials')}
            </Link>
            <Link
              href="/auth/login"
              className="block text-[#0f0880] font-sans font-normal hover:text-[#e42627] transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('login')}
            </Link>
            <Link
              href="/auth/register"
              className="block bg-[#e42627] hover:bg-[#d41f20] text-white px-6 py-2 rounded-lg font-sans font-semibold transition-colors text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('getStarted')}
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
} 