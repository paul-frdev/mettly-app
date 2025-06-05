'use client';

import { useState, useCallback, useEffect } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarEvent, CalendarView } from '@/types/calendar';
import { useCalendar } from '@/hooks/use-calendar';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

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

export function Calendar() {
  const { data: session } = useSession();
  const [view, setView] = useState<CalendarView['type']>('month');
  const [date, setDate] = useState(new Date());
  const { events, loading, error, fetchEvents, createEvent, updateEvent, deleteEvent } = useCalendar();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');

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

  const handleSelectSlot = useCallback((slotInfo: { start: Date; end: Date; slots?: Date[]; action?: string }) => {
    console.log('Slot selected:', slotInfo);
    if (!session?.user) return;
    const now = new Date();
    // Обрезаем секунды и миллисекунды для корректного сравнения
    const startTime = new Date(slotInfo.start);
    startTime.setSeconds(0, 0);
    if (startTime < now) {
      toast.error('Нельзя создавать события в прошлом');
      return;
    }
    setEventTitle('New Appointment');
    setEventDescription('');
    setSelectedEvent({
      id: '',
      title: 'New Appointment',
      start: slotInfo.start,
      end: slotInfo.end,
      status: 'pending',
      trainerId: session.user.id,
    });
    setIsDialogOpen(true);
  }, [session]);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setEventTitle(event.title);
    setEventDescription(event.description || '');
    setSelectedEvent(event);
    setIsDialogOpen(true);
  }, []);

  const handleSaveEvent = useCallback(async () => {
    if (!selectedEvent) return;

    try {
      if (selectedEvent.id) {
        // Update existing event
        await updateEvent(selectedEvent.id, {
          title: eventTitle,
          description: eventDescription,
          start: selectedEvent.start,
          end: selectedEvent.end,
          status: selectedEvent.status,
        });
        toast.success('Appointment updated successfully');
      } else {
        // Create new event
        await createEvent({
          title: eventTitle,
          description: eventDescription,
          start: selectedEvent.start,
          end: selectedEvent.end,
          status: 'pending',
          trainerId: selectedEvent.trainerId,
        });
        toast.success('Appointment created successfully');
      }
      setIsDialogOpen(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save appointment';
      toast.error(errorMessage);
    }
  }, [selectedEvent, eventTitle, eventDescription, createEvent, updateEvent]);

  const handleDeleteEvent = useCallback(async () => {
    if (!selectedEvent?.id) return;

    try {
      await deleteEvent(selectedEvent.id);
      toast.success('Appointment deleted successfully');
      setIsDialogOpen(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete appointment';
      toast.error(errorMessage);
    }
  }, [selectedEvent, deleteEvent]);

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
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <Button
              variant={view === 'month' ? 'default' : 'outline'}
              onClick={() => setView('month')}
            >
              Month
            </Button>
            <Button
              variant={view === 'week' ? 'default' : 'outline'}
              onClick={() => setView('week')}
            >
              Week
            </Button>
            <Button
              variant={view === 'day' ? 'default' : 'outline'}
              onClick={() => setView('day')}
            >
              Day
            </Button>
          </div>
          <Select
            value={view}
            onValueChange={(value) => setView(value as CalendarView['type'])}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month View</SelectItem>
              <SelectItem value="week">Week View</SelectItem>
              <SelectItem value="day">Day View</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <BigCalendar
          localizer={localizer}
          events={events}
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
              backgroundColor: '#ef4444', // Красный
              borderColor: '#dc2626',
              color: 'white',
            },
          })}
          popup
          slotPropGetter={(date) => {
            const now = new Date();
            if (date < now) {
              return { style: { backgroundColor: '#e5e7eb', pointerEvents: 'none', opacity: 0.7 } };
            }
            return { style: { backgroundColor: '#d1fae5' } };
          }}
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedEvent?.id ? 'Edit Appointment' : 'New Appointment'}
            </DialogTitle>
            <DialogDescription>
              {selectedEvent?.id
                ? 'Update the appointment details below.'
                : 'Fill in the appointment details below.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
              />
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <div className="space-x-2">
                {selectedEvent?.id && (
                  <Button variant="destructive" onClick={handleDeleteEvent}>
                    Delete
                  </Button>
                )}
                <Button onClick={handleSaveEvent}>Save</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 