import { AppNavigation } from '@/components/layout/AppNavigation';
import { Toaster } from '@/components/ui/toaster';

export default function AppLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#1a1a2e]">
      <AppNavigation />
      <main className="pt-20">
        {children}
      </main>
      <Toaster />
    </div>
  );
} 