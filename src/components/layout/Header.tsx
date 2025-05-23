'use client';

import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Moon, Sun, LogOut } from 'lucide-react';
import Logo from '@/components/Logo';
import { useRouter, usePathname } from 'next/navigation';

export default function Header() {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

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
      router.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

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
              className="text-[#0b3559] dark:text-white"
            >
              <Logo />
            </Link>

            {/* Main Navigation */}
            {!session ? (
              <nav className="hidden md:flex items-center space-x-8 ml-8">
                <a
                  href="#features"
                  onClick={(e) => handleNavigation(e, '#features')}
                  className="font-display text-[#0b3559] hover:text-[#0f0880] transition-colors cursor-pointer"
                >
                  Features
                </a>
                <a
                  href="#pricing"
                  onClick={(e) => handleNavigation(e, '#pricing')}
                  className="font-display text-[#0b3559] hover:text-[#0f0880] transition-colors cursor-pointer"
                >
                  Pricing
                </a>
                <a
                  href="#about"
                  onClick={(e) => handleNavigation(e, '#about')}
                  className="font-display text-[#0b3559] hover:text-[#0f0880] transition-colors cursor-pointer"
                >
                  About
                </a>
              </nav>
            ) : (
              <nav className="hidden md:flex items-center space-x-8 ml-8">
                <Link
                  href="/dashboard"
                  onClick={(e) => handleNavigation(e, '/dashboard')}
                  className="font-display text-[#0b3559] hover:text-[#0f0880] transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/clients"
                  onClick={(e) => handleNavigation(e, '/clients')}
                  className="font-display text-[#0b3559] hover:text-[#0f0880] transition-colors"
                >
                  Clients
                </Link>
                <Link
                  href="/appointments"
                  onClick={(e) => handleNavigation(e, '/appointments')}
                  className="font-display text-[#0b3559] hover:text-[#0f0880] transition-colors"
                >
                  Appointment
                </Link>
                <Link
                  href="/settings"
                  onClick={(e) => handleNavigation(e, '/settings')}
                  className="font-display text-[#0b3559] hover:text-[#0f0880] transition-colors"
                >
                  Settings
                </Link>
              </nav>
            )}
          </div>

          {/* Right Side Navigation */}
          <div className="flex items-center space-x-6">
            {!session ? (
              <>
                <Link
                  href="/auth/login"
                  onClick={(e) => handleNavigation(e, '/auth/login')}
                  className="font-display text-[#0b3559] hover:text-[#0f0880] transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  onClick={(e) => handleNavigation(e, '/auth/register')}
                  className="font-display bg-[#e42627] text-white px-6 py-2.5 rounded-lg hover:bg-[#d41f20] transition-colors shadow-lg hover:shadow-xl"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/profile"
                  onClick={(e) => handleNavigation(e, '/profile')}
                  className="font-display text-[#0b3559] hover:text-[#0f0880] transition-colors"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-[#0b3559] hover:text-[#e42627] transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-display">Logout</span>
                </button>
              </>
            )}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg hover:bg-[#eef0f2] dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-[#0b3559]" />
              ) : (
                <Moon className="w-5 h-5 text-[#0b3559]" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
} 