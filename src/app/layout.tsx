import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navigation } from "@/components/layout/Navigation";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MicroCRM - Simple Client Management",
  description: "Efficient client management for self-employed professionals",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Navigation />
        <div className="min-h-screen bg-gray-50 pt-16">
          <main className="py-10">
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
