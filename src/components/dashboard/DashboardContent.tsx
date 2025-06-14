'use client';

import { useState, useEffect, useCallback } from 'react';
import { Schedule } from '@/components/dashboard/Schedule';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppointments } from '@/hooks/useAppointments';
import { Appointment, Client } from '@/types/appointment';
import { showError, showSuccess } from '@/lib/utils/notifications';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { ClientFormDialog } from '@/components/dashboard/ClientFormDialog';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useSession, signOut } from 'next-auth/react';
import { Loader } from '../Loader';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CancelDialog } from '../dialogs/CancelDialog';

export function DashboardContent() {
  const { data: session, status } = useSession();
  const { appointments, isLoading, fetchAppointments } = useAppointments();
  const [calendarAppointments, setCalendarAppointments] = useState<Appointment[]>([]);
  const [isClientFormOpen, setIsClientFormOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null);
  const [isCancellationDialogOpen, setIsCancellationDialogOpen] = useState(false);

  const isClient = session?.user?.isClient;

  useEffect(() => {
    if (status === 'unauthenticated') {
      signOut({ callbackUrl: '/en' });
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

  const handleCancelAppointment = useCallback(async (reason: string) => {
    if (!appointmentToCancel) return;

    try {
      const response = await fetch(`/api/appointments/${appointmentToCancel.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancellationReason: reason }),
      });

      if (!response.ok) throw new Error('Failed to cancel appointment');

      // Refresh appointments
      await fetchAppointments();

      // Close dialog and reset state
      setIsCancellationDialogOpen(false);
      setAppointmentToCancel(null);

      showSuccess('Appointment cancelled successfully');
    } catch (error) {
      showError(error);
    }
  }, [appointmentToCancel, fetchAppointments]);

  const handleCreateAppointment = async (appointmentData: any) => {
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) throw new Error('Failed to create appointment');

      await fetchAppointments();
      showSuccess('Appointment created successfully');
      return true;
    } catch (error) {
      showError(error);
      return false;
    }
  };

  const handleUpdateAppointment = async (id: string, updateData: any) => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) throw new Error('Failed to update appointment');

      await fetchAppointments();
      showSuccess('Appointment updated successfully');
      return true;
    } catch (error) {
      showError(error);
      return false;
    }
  };

  if (isLoading) {
    return <Loader />;
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
    return isSameDay(new Date(apt.date), selectedDate) &&
      apt.status !== 'cancelled' &&
      apt.attendance?.status !== 'declined';
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
                isSameDay(new Date(apt.date), day) &&
                apt.status !== 'cancelled' &&
                apt.attendance?.status !== 'declined'
              );
              const hasAppointments = dayAppointments.length > 0;
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={day.toString()}
                  onClick={() => onDateClick(day)}
                  className={`
                    h-10 w-10 mx-auto flex items-center justify-center rounded-full cursor-pointer relative
                    ${isSelected
                      ? 'bg-blue-600 text-white font-medium'
                      : isToday
                        ? 'bg-blue-100 text-blue-700'
                        : 'hover:bg-gray-50'}
                    ${!isCurrentMonth ? 'text-gray-300' : ''}
                  `}
                >
                  {format(day, 'd')}
                  {hasAppointments && (
                    <span className={`absolute -bottom-1 w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-500'
                      }`}></span>
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
                      {apt?.client?.name && ` • ${apt.client.name}`}
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
              onAppointmentCancelled={(appointment) => {
                setAppointmentToCancel(appointment);
                setIsCancellationDialogOpen(true);
              }}
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

      <CancelDialog
        isOpen={isCancellationDialogOpen}
        onOpenChange={setIsCancellationDialogOpen}
        onCancel={(reason) => handleCancelAppointment(reason)}
      />
    </div>
  );
}