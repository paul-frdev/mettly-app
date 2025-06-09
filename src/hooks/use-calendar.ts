import { useState, useCallback } from 'react';
import { CalendarEvent, CalendarFilters } from '@/types/calendar';
import { toast } from 'sonner';

interface CalendarEventResponse extends Omit<CalendarEvent, 'start' | 'end'> {
  start: string;
  end: string;
  date?: string;
  client?: { name?: string };
  notes?: string;
}

export function useCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async (filters?: CalendarFilters) => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      if (filters?.trainerId) queryParams.append('trainerId', filters.trainerId);
      if (filters?.clientId) queryParams.append('clientId', filters.clientId);
      if (filters?.status) queryParams.append('status', filters.status.join(','));
      if (filters?.startDate) queryParams.append('startDate', filters.startDate.toISOString());
      if (filters?.endDate) queryParams.append('endDate', filters.endDate.toISOString());

      const response = await fetch(`/api/appointments?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch appointment');
      }

      const data = await response.json();
      let appointments: CalendarEventResponse[] = [];
      if (Array.isArray(data)) {
        appointments = data;
      } else if (data && Array.isArray(data.calendar)) {
        appointments = data.calendar;
      } else if (Array.isArray(data.list)) {
        appointments = data.list;
      }
      setEvents(
        appointments.map((appointment: CalendarEventResponse) => ({
          ...appointment,
          start: new Date(appointment.start || appointment.date || ''),
          end: appointment.end ? new Date(appointment.end) : new Date(new Date(appointment.start || appointment.date || '').getTime() + (appointment.duration || 30) * 60000),
          title: appointment.title || (appointment.client?.name ? appointment.client.name : 'Занято'),
          description: appointment.notes || appointment.description || '',
        }))
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch appointments';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const createEvent = useCallback(async (event: Omit<CalendarEvent, 'id'>) => {
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        toast.error('Failed to create appointment');
      }

      const newEvent = (await response.json()) as CalendarEventResponse;
      setEvents((prev) => [...prev, { ...newEvent, start: new Date(newEvent.start), end: new Date(newEvent.end) }]);
      return newEvent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create appointment';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const updateEvent = useCallback(async (id: string, event: Partial<CalendarEvent>) => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        toast.error('Failed to update appointment');
      }

      const updatedAppointment = (await response.json()) as CalendarEventResponse;
      setEvents((prev) => prev.map((e) => (e.id === id ? { ...updatedAppointment, start: new Date(updatedAppointment.start), end: new Date(updatedAppointment.end) } : e)));
      return updatedAppointment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update appointment';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const deleteEvent = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        toast.error('Failed to delete event');
      }

      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete appointment';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  return {
    events,
    loading,
    error,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}
