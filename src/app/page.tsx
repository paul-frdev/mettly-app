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

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show landing page only for non-authenticated users
  if (status === 'unauthenticated') {
    return (
      <main className="min-h-screen bg-white dark:bg-gray-900">
        <Hero />
        <Features />
        <TargetAudience />
        <HowItWorks />
        <Footer />
      </main>
    );
  }

  // This return is needed for TypeScript, but won't be rendered
  // because authenticated users will be redirected
  return null;
}
