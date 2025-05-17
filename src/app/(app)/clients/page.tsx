'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Phone, Mail } from 'lucide-react';
import Link from 'next/link';
import { showError } from '@/lib/utils/notifications';
import { Card } from '@/components/ui/card';

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
  createdAt: string;
  _count?: {
    appointments: number;
  };
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    try {
      const response = await fetch('/api/clients');
      if (!response.ok) {
        throw new Error('Failed to fetch clients');
      }
      const data = await response.json();
      setClients(data);
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to fetch clients');
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Clients</h1>
        <Link href="/clients/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New Client
          </Button>
        </Link>
      </div>

      {clients.length === 0 ? (
        <Card className="p-6">
          <div className="text-center">
            <p className="text-gray-500 mb-4">No clients yet. Add your first client to get started!</p>
            <Link href="/clients/add">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Client
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <Card key={client.id} className="p-6">
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium">{client.name}</h3>
                    <div className="space-y-1 mt-2">
                      {client.email && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Mail className="h-4 w-4 mr-2" />
                          {client.email}
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Phone className="h-4 w-4 mr-2" />
                          {client.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {client.notes && (
                  <p className="text-sm text-gray-600 mb-4">{client.notes}</p>
                )}
                <div className="mt-auto pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {client._count?.appointments || 0} appointments
                    </span>
                    <Link href={`/clients/${client.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 