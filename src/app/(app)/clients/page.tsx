'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { showError } from '@/lib/utils/notifications';

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients');
      if (!response.ok) {
        throw new Error('Failed to fetch clients');
      }
      const data = await response.json();
      setClients(data);
    } catch (error) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Clients</h1>
        <Link href="/clients/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Client
          </Button>
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {clients.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">No clients yet. Add your first client to get started!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {clients.map((client) => (
              <div key={client.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium">{client.name}</h3>
                    {client.email && (
                      <p className="text-gray-500 dark:text-gray-400">{client.email}</p>
                    )}
                    {client.phone && (
                      <p className="text-gray-500 dark:text-gray-400">{client.phone}</p>
                    )}
                  </div>
                  <Link href={`/clients/${client.id}`}>
                    <Button variant="outline">View Details</Button>
                  </Link>
                </div>
                {client.notes && (
                  <p className="mt-2 text-gray-600 dark:text-gray-300">{client.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
} 