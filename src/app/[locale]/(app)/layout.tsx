'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { AppNavigation } from '@/components/layout/AppNavigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Toaster } from '@/components/ui/toaster';

export default function AppLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status !== 'loading') {
      setIsLoading(false);
    }
  }, [status]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-sky-50 to-blue-100">
      <div className="flex h-screen">
        {/* Sidebar - full height */}
        <div className="h-screen flex-shrink-0">
          <Sidebar />
        </div>
        
        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="w-full sticky top-0 z-50">
            <AppNavigation />
          </div>
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
      <Toaster />
    </div>
  );
} 