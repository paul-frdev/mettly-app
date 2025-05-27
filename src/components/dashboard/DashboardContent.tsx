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
      console.log('Received appointments:', data);

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e42627]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {!isClient && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 mb-8">
          <Card className="bg-white/10 backdrop-blur-lg border-none shadow-xl">
            <CardHeader>
              <CardTitle className="text-white">Upcoming</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{upcomingAppointments.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-none shadow-xl">
            <CardHeader>
              <CardTitle className="text-white">Today&apos;s Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{todayAppointments.length}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="p-6 bg-white/10 backdrop-blur-lg border-none shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">
              {isClient ? 'My Appointments' : 'Today\'s Appointments'}
            </h2>
            {!isClient && (
              <Button
                onClick={() => setIsClientFormOpen(true)}
                size="sm"
                className="bg-[#e42627] hover:bg-[#d41f20] text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Client
              </Button>
            )}
          </div>

          {todayAppointments.length === 0 ? (
            <div className="text-gray-300">No appointments for today</div>
          ) : (
            <div className="space-y-4">
              {todayAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10"
                >
                  <div>
                    <div className="font-medium text-white">
                      {isClient ? session?.user?.name : appointment.client.name}
                    </div>
                    <div className="text-sm text-gray-300">
                      {format(appointment.date, 'h:mm a')} ({appointment.duration} minutes)
                    </div>
                    {appointment.notes && (
                      <div className="text-sm text-gray-400 mt-1">{appointment.notes}</div>
                    )}
                    {appointment.cancelledAt && (
                      <div className="text-sm text-red-400 mt-1">
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
              <h2 className="text-xl font-semibold mt-8 mb-4 text-white">
                {isClient ? 'Upcoming Sessions' : 'Upcoming Appointments'}
              </h2>
              <div className="space-y-4">
                {upcomingAppointments.slice(0, 3).map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10"
                  >
                    <div>
                      <div className="font-medium text-white">
                        {isClient ? session?.user?.name : appointment.client.name}
                      </div>
                      <div className="text-sm text-gray-300">
                        {format(appointment.date, 'MMM d, h:mm a')} ({appointment.duration} minutes)
                      </div>
                      {appointment.notes && (
                        <div className="text-sm text-gray-400 mt-1">{appointment.notes}</div>
                      )}
                    </div>
                    <Badge className={`${appointment.status === 'completed'
                        ? 'bg-green-500/20 text-green-300'
                        : appointment.status === 'cancelled'
                          ? 'bg-red-500/20 text-red-300'
                          : 'bg-blue-500/20 text-blue-300'
                      }`}>
                      {appointment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>

        <Card className="p-6 bg-white/10 backdrop-blur-lg border-none shadow-xl">
          <h2 className="text-xl font-semibold mb-6 text-white">Schedule</h2>
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