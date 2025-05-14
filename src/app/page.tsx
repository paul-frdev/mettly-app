import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import TargetAudience from '@/components/landing/TargetAudience';
import HowItWorks from '@/components/landing/HowItWorks';

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      <Hero />
      <Features />
      <TargetAudience />
      <HowItWorks />
    </main>
  );
}
