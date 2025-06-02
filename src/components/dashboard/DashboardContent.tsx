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
  const { data: session, status } = useSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [calendarAppointments, setCalendarAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClientFormOpen, setIsClientFormOpen] = useState(false);
  const isClient = session?.user?.isClient;

  useEffect(() => {
    if (status === 'unauthenticated') {
      signOut({ callbackUrl: '/en' });
    }
  }, [status]);

  const fetchAppointments = useCallback(async () => {
    if (status !== 'authenticated') {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/appointments', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Failed to fetch appointments');
      }

      const data = await response.json();

      // Handle both client and trainer response formats
      let transformedAppointments: Appointment[];
      let transformedCalendarAppointments: Appointment[];

      if (Array.isArray(data)) {
        // Trainer response format - direct array
        transformedAppointments = data.map((apt: ApiAppointment) => ({
          ...apt,
          date: new Date(apt.date),
          cancelledAt: apt.cancelledAt ? new Date(apt.cancelledAt) : undefined
        }));
        transformedCalendarAppointments = transformedAppointments;
      } else {
        // Client response format - object with list and calendar
        transformedAppointments = data.list.map((apt: ApiAppointment) => ({
          ...apt,
          date: new Date(apt.date),
          cancelledAt: apt.cancelledAt ? new Date(apt.cancelledAt) : undefined
        }));
        transformedCalendarAppointments = data.calendar.map((apt: ApiAppointment) => ({
          ...apt,
          date: new Date(apt.date),
          cancelledAt: apt.cancelledAt ? new Date(apt.cancelledAt) : undefined
        }));
      }

      // Sort appointments by date
      transformedAppointments.sort((a, b) => a.date.getTime() - b.date.getTime());
      transformedCalendarAppointments.sort((a, b) => a.date.getTime() - b.date.getTime());

      setAppointments(transformedAppointments);
      setCalendarAppointments(transformedCalendarAppointments);
    } catch (error) {
      console.error('Error in fetchAppointments:', error);
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

  useEffect(() => {
    const updateStatuses = async () => {
      try {
        await fetch('/api/appointments/update-status', { method: 'POST' });
      } catch (e) {
        // Можно добавить обработку ошибок, если нужно
        console.error(e)
      }
    };

    // Сразу обновить при монтировании
    updateStatuses();

    // Обновлять статусы каждую минуту
    const interval = setInterval(updateStatuses, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.date);
    return aptDate >= today && aptDate < tomorrow && apt.status !== 'completed';
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const upcomingAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.date);
    return aptDate >= tomorrow && apt.status !== 'completed';
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const completedAppointments = appointments.filter(apt => {
    return apt.status === 'completed';
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const cancelledAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.date);
    return aptDate >= today && aptDate < tomorrow && apt.status === 'cancelled';
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e42627]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {!isClient && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 mb-8">
          <Card className="bg-blue-50 border-none shadow-xl">
            <CardHeader>
              <CardTitle className="text-blue-700">Upcoming</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700">{upcomingAppointments.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-sky-50 border-none shadow-xl">
            <CardHeader>
              <CardTitle className="text-sky-700">Today&apos;s Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-sky-700">{todayAppointments.length}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="p-6 bg-white border border-gray-100 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-blue-700">
              {isClient ? 'My Appointments' : 'Today\'s Appointments'}
            </h2>
            {!isClient && (
              <Button
                onClick={() => setIsClientFormOpen(true)}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Client
              </Button>
            )}
          </div>

          <div className="h-[calc(100vh-300px)] overflow-y-auto pr-2">
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-sky-700">Today&apos;s Appointments</h2>
                  {todayAppointments.length === 0 ? (
                    <p className="text-gray-500">No appointments scheduled for today.</p>
                  ) : (
                    <div className="space-y-2">
                      {todayAppointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          className="p-4 rounded-lg bg-sky-50 border border-sky-100"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-blue-800">
                                {appointment.client?.name || 'No client name'}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {format(new Date(appointment.date), 'h:mm a')} • {appointment.duration} min
                              </p>
                            </div>
                            <Badge variant={appointment.status === 'cancelled' ? 'destructive' : 'default'}>
                              {appointment.status === 'cancelled' ? 'Cancelled' : 'Scheduled'}
                            </Badge>
                          </div>
                          {appointment.status === 'cancelled' && appointment.cancellationReason && (
                            <p className="mt-2 text-sm text-red-500">
                              Cancellation reason: {appointment.cancellationReason}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-blue-700">Upcoming Appointments</h2>
                  {upcomingAppointments.length === 0 ? (
                    <p className="text-gray-500">No upcoming appointments.</p>
                  ) : (
                    <div className="space-y-2">
                      {upcomingAppointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          className="p-4 rounded-lg bg-blue-50 border border-blue-100"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-blue-800">
                                {appointment.client?.name || 'No client name'}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {format(new Date(appointment.date), 'PPP')} • {format(new Date(appointment.date), 'h:mm a')} • {appointment.duration} min
                              </p>
                            </div>
                            <Badge variant={appointment.status === 'cancelled' ? 'destructive' : 'default'}>
                              {appointment.status === 'cancelled' ? 'Cancelled' : 'Scheduled'}
                            </Badge>
                          </div>
                          {appointment.status === 'cancelled' && appointment.cancellationReason && (
                            <p className="mt-2 text-sm text-red-500">
                              Cancellation reason: {appointment.cancellationReason}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {completedAppointments.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-green-700">Completed Appointments</h2>
                  <div className="space-y-2">
                    {completedAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="p-4 rounded-lg bg-green-50 border border-green-100"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-green-800">
                              {appointment.client?.name || 'No client name'}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {format(new Date(appointment.date), 'PPP')} • {format(new Date(appointment.date), 'h:mm a')} • {appointment.duration} min
                            </p>
                          </div>
                          <Badge variant="secondary">Completed</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {cancelledAppointments.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-red-700">Cancelled Appointments</h2>
                  <div className="space-y-2">
                    {cancelledAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="p-4 rounded-lg bg-red-50 border border-red-100"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-red-800">
                              {appointment.client?.name || 'No client name'}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {format(new Date(appointment.date), 'h:mm a')} • {appointment.duration} min
                            </p>
                          </div>
                          <Badge variant="destructive">Cancelled</Badge>
                        </div>
                        {appointment.cancellationReason && (
                          <p className="mt-2 text-sm text-red-500">
                            Cancellation reason: {appointment.cancellationReason}
                          </p>
                        )}
                        {appointment.cancelledAt && (
                          <p className="mt-1 text-sm text-gray-500">
                            Cancelled on: {format(new Date(appointment.cancelledAt), 'PPP h:mm a')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-sky-50 border border-sky-100 shadow-xl">
          <h2 className="text-xl font-semibold mb-6 text-blue-700">Schedule</h2>
          <Schedule
            appointments={calendarAppointments}
            onAppointmentCreated={fetchAppointments}
            isClient={isClient}
          />
        </Card>
      </div>

      {!isClient && (
        <ClientFormDialog
          isOpen={isClientFormOpen}
          onClose={() => setIsClientFormOpen(false)}
        />
      )}
    </div>
  );
} 