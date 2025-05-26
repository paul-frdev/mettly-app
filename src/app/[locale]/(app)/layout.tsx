import { AppNavigation } from '@/components/layout/AppNavigation';
import { Toaster } from '@/components/ui/toaster';

export default function AppLayout({
  children
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AppNavigation />
      <main className="container mx-auto px-4 py-8 mt-16">
        {children}
      </main>
      <Toaster />
    </div>
  );
} 