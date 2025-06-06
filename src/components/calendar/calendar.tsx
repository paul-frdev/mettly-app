'use client';

import { useState, useCallback, useEffect } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useSession } from 'next-auth/react';

import { CalendarEvent, CalendarView } from '@/types/calendar';
import { useCalendar } from '@/hooks/use-calendar';
import { toast } from 'sonner';
import { AppointmentDialog } from '@/components/dialogs/AppointmentDialog';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';
import { useCalendarSync } from '@/hooks/useCalendarSync';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Кастомный компонент для отображения события
const CustomEvent = ({ event }: { event: CalendarEvent }) => (
  <span>
    {event.title}
    {event.duration ? ` (${event.duration} мин)` : ''}
  </span>
);

interface Client {
  id: string;
  name: string;
}

export function Calendar() {
  const { data: session } = useSession();
  const [view, setView] = useState<CalendarView['type']>('month');
  const [date, setDate] = useState(new Date());
  const { events, loading, error, fetchEvents, createEvent, updateEvent, deleteEvent } = useCalendar();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [eventDescription, setEventDescription] = useState('');
  const { settings, isHoliday } = useBusinessSettings();
  const [eventDuration, setEventDuration] = useState(60);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const isClient = !!session?.user?.isClient;
  const { subscribeCalendarUpdate } = useCalendarSync();

  useEffect(() => {
    if (session?.user) {
      fetchEvents();
    }
  }, [session, fetchEvents]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Загрузка клиентов
  useEffect(() => {
    async function fetchClients() {
      try {
        const response = await fetch('/api/clients');
        if (!response.ok) throw new Error('Failed to fetch clients');
        const data = await response.json();
        setClients(data);
      } catch {
        // Можно добавить обработку ошибок
      }
    }
    fetchClients();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeCalendarUpdate(() => {
      fetchEvents();
    });
    return unsubscribe;
  }, [fetchEvents, subscribeCalendarUpdate]);

  const isBusinessSlot = (date: Date) => {
    if (!settings) return false;
    const dayName = format(date, 'EEEE');
    const daySchedule = settings.workingHours[dayName];
    if (!daySchedule?.enabled) return false;
    if (isHoliday && isHoliday(date)) return false;
    const [startHour, startMinute] = daySchedule.start.split(':').map(Number);
    const [endHour, endMinute] = daySchedule.end.split(':').map(Number);
    const slotMinutes = date.getHours() * 60 + date.getMinutes();
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    return slotMinutes >= startMinutes && slotMinutes < endMinutes;
  };

  const handleSelectSlot = useCallback((slotInfo: { start: Date; end: Date; slots?: Date[]; action?: string }) => {
    if (!session?.user) return;
    const now = new Date();
    const startTime = new Date(slotInfo.start);
    startTime.setSeconds(0, 0);
    if (startTime < now) {
      toast.error('Нельзя создавать события в прошлом');
      return;
    }
    if (!isBusinessSlot(startTime)) {
      toast.error('Слот вне рабочих часов или нерабочий день');
      return;
    }
    setSelectedEvent({
      id: '',
      title: '',
      start: slotInfo.start,
      end: slotInfo.end,
      status: 'pending',
      trainerId: session.user.id,
    });
    setIsDialogOpen(true);
  }, [session, settings]);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setEventDescription(event.description || '');
    setSelectedEvent(event);
    setIsDialogOpen(true);
  }, []);

  const isSlotBooked = useCallback((start: Date, end: Date, excludeId?: string) => {
    return events.some(event => {
      if (event.status === 'cancelled') return false;
      if (excludeId && event.id === excludeId) return false;
      return start < event.end && end > event.start;
    });
  }, [events]);

  const handleSaveEvent = useCallback(async () => {
    if (!selectedEvent) return;
    const client = clients.find(c => c.id === selectedClientId);
    const eventTitle = client ? client.name : 'Appointment';
    const durationMinutes = eventDuration;
    const start = selectedEvent.start;
    const end = new Date(start.getTime() + durationMinutes * 60000);
    if (isSlotBooked(start, end, selectedEvent.id)) {
      toast.error('Этот слот уже занят');
      return;
    }
    try {
      if (selectedEvent.id) {
        await updateEvent(selectedEvent.id, {
          title: eventTitle,
          description: eventDescription,
          start,
          end,
          status: selectedEvent.status,
          clientId: isClient ? 'self' : selectedClientId,
          duration: durationMinutes,
        });
        toast.success('Appointment updated successfully');
      } else {
        const eventData: Partial<CalendarEvent> = {
          title: eventTitle,
          description: eventDescription,
          start,
          end,
          status: 'pending',
          clientId: isClient ? 'self' : selectedClientId,
          duration: durationMinutes,
        };
        if (!isClient && session?.user?.id) {
          eventData.trainerId = String(session.user.id);
        }
        await createEvent(eventData as Omit<CalendarEvent, 'id'>);
        toast.success('Appointment created successfully');
      }
      await fetchEvents();
      setIsDialogOpen(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save appointment';
      toast.error(errorMessage);
    }
  }, [selectedEvent, eventDescription, eventDuration, createEvent, updateEvent, clients, selectedClientId, fetchEvents, isSlotBooked, isClient, session]);

  const handleDeleteEvent = useCallback(async () => {
    if (!selectedEvent?.id) return;
    try {
      await deleteEvent(selectedEvent.id);
      await fetchEvents();
      setIsDialogOpen(false);
      toast.success('Appointment deleted successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete appointment';
      toast.error(errorMessage);
    }
  }, [selectedEvent, deleteEvent, fetchEvents]);

  const visibleEvents = events.filter(event => event.status !== 'cancelled');

  // Получить минимальное и максимальное время из business settings
  const hours = Object.values(settings?.workingHours || {})
    .filter(day => day.enabled)
    .map(day => ({
      start: day.start,
      end: day.end,
    }));

  const minTime = hours.reduce((min, h) => h.start < min ? h.start : min, '23:59');
  const maxTime = hours.reduce((max, h) => h.end > max ? h.end : max, '00:00');

  const [minHour, minMinute] = minTime.split(':').map(Number);
  const [maxHour, maxMinute] = maxTime.split(':').map(Number);

  if (loading) {
    return (
      <div className="h-[800px] flex items-center justify-center">
        <div className="text-gray-500">Loading calendar...</div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full overflow-x-auto" style={{ height: 700 }}>

        <BigCalendar
          localizer={localizer}
          events={visibleEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          view={view}
          views={['month', 'week', 'day']}
          onView={(newView) => setView(newView as CalendarView['type'])}
          date={date}
          onNavigate={(newDate) => setDate(newDate)}
          selectable={true}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: event.status === 'pending' || event.status === 'confirmed'
                ? '#d1fae5'
                : '#ef4444',
              borderColor: event.status === 'pending' || event.status === 'confirmed'
                ? '#10b981'
                : '#dc2626',
              color: 'black',
            },
          })}
          popup
          slotPropGetter={(date) => {
            const now = new Date();
            if (date < now) {
              return { style: { backgroundColor: '#e5e7eb', pointerEvents: 'none', opacity: 0.7 } };
            }
            if (!isBusinessSlot(date)) {
              return { style: { backgroundColor: '#f3f4f6', pointerEvents: 'none', opacity: 0.5 } };
            }
            return { style: { backgroundColor: '#d1fae5' } };
          }}
          components={{ event: CustomEvent }}
          min={new Date(1970, 1, 1, minHour, minMinute)}
          max={new Date(1970, 1, 1, maxHour, maxMinute)}
        />
      </div>

      <AppointmentDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        clients={clients}
        isClient={isClient}
        selectedClientId={selectedClientId}
        onClientChange={setSelectedClientId}
        notes={eventDescription}
        onNotesChange={setEventDescription}
        duration={eventDuration}
        onDurationChange={setEventDuration}
        availableDurations={[30, 45, 60, 90, 120]}
        onSubmit={handleSaveEvent}
        onDelete={handleDeleteEvent}
        onCancel={() => setIsDialogOpen(false)}
        timeLabel={selectedEvent ? format(selectedEvent.start, 'HH:mm') : ''}
        dateLabel={selectedEvent ? format(selectedEvent.start, 'PPP') : ''}
      />
    </>
  );
} 