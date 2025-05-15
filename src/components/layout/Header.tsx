'use client';

import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Moon, Sun, LogOut } from 'lucide-react';
import Logo from '@/components/Logo';

export default function Header() {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  if (!mounted) return null;

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md' : 'bg-transparent'
      }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-gray-900 dark:text-white">
              <Logo />
            </Link>

            {/* Main Navigation */}
            {!session ? (
              <nav className="hidden md:flex items-center space-x-8 ml-8">
                <Link href="#features" className="hover:text-blue-500 transition-colors">
                  Features
                </Link>
                <Link href="#pricing" className="hover:text-blue-500 transition-colors">
                  Pricing
                </Link>
                <Link href="#about" className="hover:text-blue-500 transition-colors">
                  About
                </Link>
              </nav>
            ) : (
              <nav className="hidden md:flex items-center space-x-8 ml-8">
                <Link href="/dashboard" className="hover:text-blue-500 transition-colors">
                  Dashboard
                </Link>
                <Link href="/clients" className="hover:text-blue-500 transition-colors">
                  Clients
                </Link>
                <Link href="/calendar" className="hover:text-blue-500 transition-colors">
                  Calendar
                </Link>
                <Link href="/settings" className="hover:text-blue-500 transition-colors">
                  Settings
                </Link>
              </nav>
            )}
          </div>

          {/* Right Side Navigation */}
          <div className="flex items-center space-x-4">
            {!session ? (
              <>
                <Link href="/auth/login" className="hover:text-blue-500 transition-colors">
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <>
                <Link href="/profile" className="hover:text-blue-500 transition-colors">
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </>
            )}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
} 