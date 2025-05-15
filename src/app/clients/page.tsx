'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ClientList from '@/components/clients/ClientList';
import ClientSearch from '@/components/clients/ClientSearch';
import AddClientButton from '@/components/clients/AddClientButton';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function ClientsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else {
      setIsLoading(false);
    }
  }, [status, router]);

  if (status === 'loading' || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Clients</h1>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              A list of all your clients including their name, phone, and appointment history.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <AddClientButton onClientAdded={() => router.refresh()} />
          </div>
        </div>

        <div className="mt-8">
          <ClientSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterStatus={filterStatus}
            onFilterChange={setFilterStatus}
          />
        </div>

        <div className="mt-6">
          <ClientList
            searchQuery={searchQuery}
            filterStatus={filterStatus}
            onClientUpdated={() => router.refresh()}
          />
        </div>
      </div>
    </DashboardLayout>
  );
} 