'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Phone, Mail, ArrowLeft, Trash, ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';
import { format, addDays, subDays } from 'date-fns';
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
import { TimeSlots } from '@/components/appointments/TimeSlots';
import { Badge } from '@/components/ui/badge';

interface Appointment {
  id: string;
  date: string;
  notes?: string;
  status: string;
  duration: number;
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
  const [selectedDate, setSelectedDate] = useState(new Date());

  const fetchClient = useCallback(async () => {
    try {
      const response = await fetch(`/api/clients/${clientId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch client');
      }
      const data = await response.json();
      setClient(data);
    } catch (error) {
      console.error('Error fetching client:', error);
      showError('Failed to fetch client details');
    } finally {
      setIsLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchClient();
  }, [fetchClient]);

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/appointments`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: appointmentId,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update appointment status');
      }

      fetchClient();
      showSuccess('Appointment status updated successfully');
    } catch (error) {
      console.error('Error updating appointment status:', error);
      showError('Failed to update appointment status');
    }
  };

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

  if (isLoading || !client) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const upcomingAppointments = client.appointments.filter(
    apt => new Date(apt.date) >= new Date() && apt.status !== 'cancelled'
  );
  const pastAppointments = client.appointments.filter(
    apt => new Date(apt.date) < new Date() || apt.status === 'cancelled'
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/clients">
            <Button variant="outline" size="icon" className="rounded-full">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
            <p className="text-muted-foreground">Client since {format(new Date(client.createdAt), 'MMMM d, yyyy')}</p>
          </div>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="bg-destructive hover:bg-destructive/90">
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
              <AlertDialogAction onClick={handleDeleteClient} className="bg-destructive hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
            <CardDescription>Contact details and notes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {client.email && (
              <div className="flex items-center text-muted-foreground">
                <Mail className="h-4 w-4 mr-3" />
                <span>{client.email}</span>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center text-muted-foreground">
                <Phone className="h-4 w-4 mr-3" />
                <span>{client.phone}</span>
              </div>
            )}
            {client.notes && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Notes</h3>
                <p className="text-muted-foreground">{client.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Schedule Appointment</CardTitle>
            <CardDescription>Select a date and time for the appointment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSelectedDate(subDays(selectedDate, 1))}
                className="rounded-full"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-center">
                <div className="text-lg font-semibold">
                  {format(selectedDate, 'EEEE, MMMM d')}
                </div>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                className="rounded-full"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <TimeSlots
              selectedDate={selectedDate}
              onAppointmentCreated={fetchClient}
              appointments={client?.appointments.filter(
                (apt) => format(new Date(apt.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
              ).map(apt => ({
                ...apt,
                date: new Date(apt.date),
                client: client
              })) || []}
            />
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Appointments</CardTitle>
            <CardDescription>View and manage client appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {upcomingAppointments.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Upcoming Appointments</h3>
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => (
                      <Card key={appointment.id} className="bg-card/50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="rounded-full bg-primary/10 p-2">
                                <Calendar className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <div className="font-medium">
                                  {format(new Date(appointment.date), 'EEEE, MMMM d')}
                                </div>
                                <div className="text-sm text-muted-foreground flex items-center gap-2">
                                  <Clock className="h-3 w-3" />
                                  {format(new Date(appointment.date), 'h:mm a')} • {appointment.duration} min
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="capitalize">
                                {appointment.status}
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusChange(appointment.id, 'completed')}
                              >
                                Mark as Completed
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {pastAppointments.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Past Appointments</h3>
                  <div className="space-y-4">
                    {pastAppointments.map((appointment) => (
                      <Card key={appointment.id} className="bg-card/50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="rounded-full bg-muted p-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div>
                                <div className="font-medium">
                                  {format(new Date(appointment.date), 'EEEE, MMMM d')}
                                </div>
                                <div className="text-sm text-muted-foreground flex items-center gap-2">
                                  <Clock className="h-3 w-3" />
                                  {format(new Date(appointment.date), 'h:mm a')} • {appointment.duration} min
                                </div>
                              </div>
                            </div>
                            <Badge
                              variant={appointment.status === 'cancelled' ? 'destructive' : 'secondary'}
                              className="capitalize"
                            >
                              {appointment.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 