import '../../styles/globals.css';
import { Inter, Outfit } from 'next/font/google';
import { Providers } from '@/components/Providers';
import { Toaster } from 'sonner';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

export const metadata = {
  title: 'metTly.io - Client Management Made Easy',
  description: 'Schedule meetings, process payments, and receive reminders — all in one place',
};

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {

  // Ensure that the incoming `locale` is valid
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} font-sans`}>
        <Providers>
          <NextIntlClientProvider>
            {children}
          </NextIntlClientProvider>
        </Providers>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
