'use client';

import { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function useNavigationLoading() {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleStart = () => {
      setIsLoading(true);
    };

    const handleStop = () => {
      setIsLoading(false);
    };

    // Listen for route change start
    window.addEventListener('beforeunload', handleStart);

    // Listen for route change complete
    window.addEventListener('load', handleStop);

    return () => {
      window.removeEventListener('beforeunload', handleStart);
      window.removeEventListener('load', handleStop);
    };
  }, []);

  // Reset loading state when pathname or search params change
  useEffect(() => {
    setIsLoading(false);
  }, [pathname, searchParams]);

  return isLoading;
}
