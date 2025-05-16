import './globals.css';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/Providers';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'metTly.io - Client Management Made Easy',
  description: 'Schedule meetings, process payments, and receive reminders — all in one place',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
