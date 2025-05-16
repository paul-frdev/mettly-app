import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
}

interface Appointment {
  id: string;
  date: Date;
  duration: number;
  client?: {
    name: string;
  };
  status: string;
}

interface ClientInfoProps {
  appointments: Appointment[];
}

export function ClientInfo({ appointments }: ClientInfoProps) {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients');
      if (!response.ok) throw new Error('Failed to fetch clients');
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  // Get today's appointments
  const todayAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    const today = new Date();
    return (
      appointmentDate.getDate() === today.getDate() &&
      appointmentDate.getMonth() === today.getMonth() &&
      appointmentDate.getFullYear() === today.getFullYear()
    );
  });

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-4">
        {todayAppointments.length > 0 ? (
          todayAppointments
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map((appointment) => {
              const client = appointment.client?.name
                ? clients.find(c => c.name === appointment.client?.name)
                : undefined;

              return (
                <Card
                  key={appointment.id}
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedClient(client || null)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">
                        {appointment.client?.name || 'No client name'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {format(new Date(appointment.date), 'HH:mm')}
                        {' - '}
                        {format(
                          new Date(new Date(appointment.date).getTime() + appointment.duration * 60000),
                          'HH:mm'
                        )}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${appointment.status === 'scheduled'
                        ? 'bg-yellow-100 text-yellow-800'
                        : appointment.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                        }`}
                    >
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                  </div>

                  {client && selectedClient?.id === client.id && (
                    <div className="mt-4 space-y-2 text-sm text-gray-600">
                      {client.email && (
                        <p>
                          <span className="font-medium">Email:</span> {client.email}
                        </p>
                      )}
                      {client.phone && (
                        <p>
                          <span className="font-medium">Phone:</span> {client.phone}
                        </p>
                      )}
                      {client.notes && (
                        <p>
                          <span className="font-medium">Notes:</span> {client.notes}
                        </p>
                      )}
                    </div>
                  )}
                </Card>
              );
            })
        ) : (
          <div className="text-center py-8 text-gray-500">
            No appointments for today
          </div>
        )}
      </div>
    </ScrollArea>
  );
} 