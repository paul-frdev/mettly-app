'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Schedule } from '@/components/dashboard/Schedule';
import { showError } from '@/lib/utils/notifications';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ClientFormDialog } from '@/components/dashboard/ClientFormDialog';

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
}

interface ApiAppointment {
  id: string;
  date: string;
  duration: number;
  client: Client;
  status: string;
  notes?: string;
}

interface Appointment {
  id: string;
  date: Date;
  duration: number;
  client: Client;
  status: string;
  notes?: string;
}

export function DashboardContent() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClientFormOpen, setIsClientFormOpen] = useState(false);

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/appointments');
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }
      const data = await response.json();
      const transformedAppointments: Appointment[] = data.map((apt: ApiAppointment) => ({
        ...apt,
        date: new Date(apt.date)
      }));
      setAppointments(transformedAppointments);
    } catch (error) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">24</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$2,850</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Client Information</h2>
            <Button onClick={() => setIsClientFormOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </div>
          <div className="text-gray-500">
            No appointments for today
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Schedule</h2>
          <Schedule appointments={appointments} />
        </Card>
      </div>

      <ClientFormDialog
        isOpen={isClientFormOpen}
        onClose={() => setIsClientFormOpen(false)}
      />
    </div>
  );
} 