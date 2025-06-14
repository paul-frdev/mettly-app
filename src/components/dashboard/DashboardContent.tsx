'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Schedule } from '@/components/dashboard/Schedule';
import { showError } from '@/lib/utils/notifications';
import { Button } from '@/components/ui/button';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { ClientFormDialog } from '@/components/dashboard/ClientFormDialog';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

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

  // Calendar calculations
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({
    start: monthStart,
    end: monthEnd,
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const onDateClick = (day: Date) => setSelectedDate(day);

  // Filter appointments for selected date
  const selectedDateAppointments = appointments.filter(apt => {
    return isSameDay(new Date(apt.date), selectedDate);
  });

  return (
    <div className="container mx-auto py-8">
      <div className="grid md:grid-cols-3 gap-8" key="dashboard-layout">
        <Card className="p-6 bg-white border border-gray-100 shadow-xl">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-blue-700">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <div className="flex space-x-2">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {daysInMonth.map((day, i) => {
              const dayAppointments = appointments.filter(apt =>
                isSameDay(new Date(apt.date), day)
              );
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={day.toString()}
                  onClick={() => onDateClick(day)}
                  className={`
                    h-10 w-10 mx-auto flex items-center justify-center rounded-full cursor-pointer
                    ${isSelected ? 'bg-blue-100 text-blue-700' : ''}
                    ${isToday && !isSelected ? 'bg-gray-100' : ''}
                    ${!isCurrentMonth ? 'text-gray-300' : 'hover:bg-gray-50'}
                    relative
                  `}
                >
                  {format(day, 'd')}
                  {dayAppointments.length > 0 && (
                    <span className="absolute bottom-0 w-1 h-1 rounded-full bg-blue-500"></span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">
                {format(selectedDate, 'EEEE, MMMM d')}
              </h3>
              {!isClient && (
                <Button
                  onClick={() => setIsClientFormOpen(true)}
                  size="sm"
                  variant="outline"
                  className="text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              )}
            </div>

            {selectedDateAppointments.length > 0 ? (
              <div className="space-y-2">
                {selectedDateAppointments.map(apt => (
                  <div key={apt.id} className="p-2 text-sm border rounded-md hover:bg-gray-50">
                    <div className="font-medium">
                      {format(new Date(apt.date), 'h:mm a')}
                      {apt.client.name && ` • ${apt.client.name}`}
                    </div>
                    {apt.notes && (
                      <div className="text-gray-500 text-xs truncate">{apt.notes}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 text-center py-4">
                No appointments for this day
              </div>
            )}
          </div>
        </Card>
        <div className="md:col-span-2">
          <Card className="p-6 bg-sky-50 border border-sky-100 shadow-xl h-full">
            <h2 className="text-xl font-semibold mb-6 text-blue-700">Schedule</h2>
            <Schedule
              appointments={calendarAppointments}
              onAppointmentCreated={fetchAppointments}
              isClient={isClient}
              selectedDate={selectedDate}
              onDateChange={onDateClick}
            />
          </Card>
        </div>
      </div>

      {!isClient && (
        <ClientFormDialog
          isOpen={isClientFormOpen}
          onClose={() => setIsClientFormOpen(false)}
          onSubmit={async (data) => {
            // Handle form submission here
            console.log('New client data:', data);
            // You'll likely want to add your API call to create/update the client here
            // For example:
            // await createClient(data);
            // Then close the dialog
            setIsClientFormOpen(false);
          }}
        />
      )}
    </div>
  );
} 