import { AppNavigation } from '@/components/layout/AppNavigation';
import { Toaster } from '@/components/ui/toaster';

export default function AppLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0880] via-[#1a1a2e] to-[#16213e]">
      <AppNavigation />
      <main className="container mx-auto px-4 py-8 mt-16">
        {children}
      </main>
      <Toaster />
    </div>
  );
} 