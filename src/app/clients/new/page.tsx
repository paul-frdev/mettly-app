'use client';

import { ClientForm } from '@/components/clients/ClientForm';
import { Client } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function NewClientPage() {
  const router = useRouter();

  const handleSubmit = async (data: Partial<Client>) => {
    // TODO: Implement API call to create client
    console.log('Creating client:', data);
    router.push('/clients');
  };

  const handleCancel = () => {
    router.push('/clients');
  };

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Add New Client
          </h2>
        </div>
      </div>

      <div className="mt-6">
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
          <div className="px-4 py-6 sm:p-8">
            <ClientForm onSubmit={handleSubmit} onCancel={handleCancel} />
          </div>
        </div>
      </div>
    </div>
  );
} 