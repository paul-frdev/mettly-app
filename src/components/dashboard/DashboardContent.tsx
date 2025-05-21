'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Schedule } from '@/components/dashboard/Schedule';
import { showError } from '@/lib/utils/notifications';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ClientFormDialog } from '@/components/dashboard/ClientFormDialog';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useSession, signOut } from 'next-auth/react';

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
  cancelledAt?: string;
  cancellationReason?: string;
  attendance?: {
    status: 'confirmed' | 'declined' | null;
  };
}

interface Appointment {
  id: string;
  date: Date;
  duration: number;
  client: Client;
  status: string;
  notes?: string;
  cancelledAt?: Date;
  cancellationReason?: string;
  attendance?: {
    status: 'confirmed' | 'declined' | null;
  };
}

export function DashboardContent() {
  const { status } = useSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClientFormOpen, setIsClientFormOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      signOut({ callbackUrl: '/auth/login' });
    }
  }, [status]);

  const fetchAppointments = useCallback(async () => {
    if (status !== 'authenticated') return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/appointments', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
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
  }, [status]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchAppointments();
    }
  }, [fetchAppointments, status]);

  // Get today's appointments
  const todayAppointments = appointments.filter(apt =>
    format(apt.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  ).sort((a, b) => a.date.getTime() - b.date.getTime());

  // Get upcoming appointments (excluding today)
  const upcomingAppointments = appointments.filter(apt =>
    apt.date > new Date() && format(apt.date, 'yyyy-MM-dd') !== format(new Date(), 'yyyy-MM-dd')
  ).sort((a, b) => a.date.getTime() - b.date.getTime());

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

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
            <div className="text-3xl font-bold">{upcomingAppointments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{todayAppointments.length}</div>
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
            <h2 className="text-xl font-semibold">Today&apos;s Appointments</h2>
            <Button onClick={() => setIsClientFormOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </div>

          {todayAppointments.length === 0 ? (
            <div className="text-gray-500">No appointments for today</div>
          ) : (
            <div className="space-y-4">
              {todayAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div>
                    <div className="font-medium">{appointment.client.name}</div>
                    <div className="text-sm text-gray-500">
                      {format(appointment.date, 'h:mm a')} ({appointment.duration} minutes)
                    </div>
                    {appointment.notes && (
                      <div className="text-sm text-gray-600 mt-1">{appointment.notes}</div>
                    )}
                    {appointment.cancelledAt && (
                      <div className="text-sm text-red-600 mt-1">
                        Cancelled: {format(new Date(appointment.cancelledAt), 'MMM d, h:mm a')}
                        {appointment.cancellationReason && ` - ${appointment.cancellationReason}`}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status}
                    </Badge>
                    {appointment.attendance && (
                      <Badge
                        className={
                          appointment.attendance.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : appointment.attendance.status === 'declined'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                        }
                      >
                        {appointment.attendance.status === 'confirmed'
                          ? 'Confirmed'
                          : appointment.attendance.status === 'declined'
                            ? 'Declined'
                            : 'Pending'}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {upcomingAppointments.length > 0 && (
            <>
              <h2 className="text-xl font-semibold mt-8 mb-4">Upcoming Appointments</h2>
              <div className="space-y-4">
                {upcomingAppointments.slice(0, 3).map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div>
                      <div className="font-medium">{appointment.client.name}</div>
                      <div className="text-sm text-gray-500">
                        {format(appointment.date, 'MMM d, h:mm a')} ({appointment.duration} minutes)
                      </div>
                      {appointment.notes && (
                        <div className="text-sm text-gray-600 mt-1">{appointment.notes}</div>
                      )}
                    </div>
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Schedule</h2>
          <Schedule
            appointments={appointments}
            onAppointmentCreated={fetchAppointments}
          />
        </Card>
      </div>

      <ClientFormDialog
        isOpen={isClientFormOpen}
        onClose={() => setIsClientFormOpen(false)}
      />
    </div>
  );
} 