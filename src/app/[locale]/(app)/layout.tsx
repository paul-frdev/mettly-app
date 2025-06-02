import { AppNavigation } from '@/components/layout/AppNavigation';
import { Toaster } from '@/components/ui/toaster';

export default function AppLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-sky-50 to-blue-100">
      <AppNavigation />
      <main className="pt-20">
        {children}
      </main>
      <Toaster />
    </div>
  );
} 