'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import TargetAudience from '@/components/landing/TargetAudience';
import HowItWorks from '@/components/landing/HowItWorks';
import Footer from '@/components/landing/Footer';

export default function Home() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard');
    }
  }, [status, router]);

  // Show landing page for unauthenticated users and during loading
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      {status === 'loading' ? (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <Hero />
          <Features />
          <TargetAudience />
          <HowItWorks />
          <Footer />
        </>
      )}
    </main>
  );
}
