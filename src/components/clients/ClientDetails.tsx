'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Phone, Mail, Calendar, ArrowLeft, Trash } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { showSuccess, showError } from '@/lib/utils/notifications';

interface Appointment {
  id: string;
  date: string;
  notes?: string;
  status: string;
}

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
  createdAt: string;
  appointments: Appointment[];
}

interface ClientDetailsProps {
  clientId: string;
}

export function ClientDetails({ clientId }: ClientDetailsProps) {
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchClient();
  }, [clientId]);

  async function fetchClient() {
    try {
      const response = await fetch(`/api/clients/${clientId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch client');
      }
      const data = await response.json();
      setClient(data);
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to fetch client');
      router.push('/clients');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteClient() {
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete client');
      }

      showSuccess('Client deleted successfully');
      router.push('/clients');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to delete client');
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!client) {
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/clients">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{client.name}</h1>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <Trash className="h-4 w-4 mr-2" />
              Delete Client
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the client and all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteClient}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Client Information</h2>
          <div className="space-y-4">
            {client.email && (
              <div className="flex items-center text-gray-600">
                <Mail className="h-4 w-4 mr-3" />
                <span>{client.email}</span>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center text-gray-600">
                <Phone className="h-4 w-4 mr-3" />
                <span>{client.phone}</span>
              </div>
            )}
            {client.notes && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
                <p className="text-gray-600">{client.notes}</p>
              </div>
            )}
            <div className="text-sm text-gray-500">
              Client since {format(new Date(client.createdAt), 'MMMM d, yyyy')}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Appointments</h2>
            <Link href={`/appointments/create?clientId=${client.id}`}>
              <Button>
                <Calendar className="h-4 w-4 mr-2" />
                New Appointment
              </Button>
            </Link>
          </div>
          {client.appointments.length === 0 ? (
            <p className="text-gray-500">No appointments yet.</p>
          ) : (
            <div className="space-y-4">
              {client.appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div>
                    <div className="font-medium">
                      {format(new Date(appointment.date), 'MMMM d, yyyy')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(appointment.date), 'h:mm a')}
                    </div>
                    {appointment.notes && (
                      <div className="text-sm text-gray-600 mt-1">{appointment.notes}</div>
                    )}
                  </div>
                  <div
                    className={`px-2 py-1 rounded text-sm ${appointment.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : appointment.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                      }`}
                  >
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
} 