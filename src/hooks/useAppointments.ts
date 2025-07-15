'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Appointment, Client, AppointmentStatus } from '@/types/appointment';
import { showError } from '@/lib/utils/notifications';

// Extended appointment interface that includes additional properties used in this hook
interface ExtendedAppointment extends Appointment {
  end: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

// Define a type for the raw appointment data from API
type RawAppointmentData = {
  id?: string;
  date?: string | Date;
  start?: string | Date;
  end?: string | Date;
  duration?: number;
  status?: string;
  client?: Client;
  clientId?: string;
  clientIds?: string[]; // For group appointments
  clients?: Array<{ client: Client }>; // From Prisma ClientOnAppointment relation
  type?: 'individual' | 'group'; // Type of appointment
  isPaid?: boolean; // Whether the appointment is paid
  price?: number; // Price for the appointment
  maxClients?: number; // Maximum clients for group appointments
  notes?: string;
  description?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  cancelledAt?: string | Date;
  cancellationReason?: string;
  cancelledById?: string;
  attendance?: {
    status: AppointmentStatus;
  };
  // Additional properties might exist but we don't need to access them directly
};

export function useAppointments() {
  const { data: session } = useSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    if (!session) return [];

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/appointments');

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to fetch appointments:', response.status, errorData);
        throw new Error(errorData.message || 'Failed to fetch appointments');
      }

      const responseData = await response.json();

      let appointmentsData: RawAppointmentData[] = [];

      // Handle different response formats
      if (Array.isArray(responseData)) {
        // Direct array response (trainer view)
        appointmentsData = responseData;
      } else if (responseData.calendar && Array.isArray(responseData.calendar)) {
        // Calendar format (prioritize calendar for Schedule view to show all slots)
        appointmentsData = responseData.calendar;
      } else if (responseData.list && Array.isArray(responseData.list)) {
        // Client view with list and calendar
        appointmentsData = responseData.list;
      } else if (responseData.data && Array.isArray(responseData.data)) {
        // Alternative format with data array
        appointmentsData = responseData.data;
      } else {
        console.error('Unexpected API response format:', responseData);
        throw new Error('Invalid data format received from server');
      }

      // Process appointments
      const processedAppointments = appointmentsData
        .filter((appt: RawAppointmentData) => appt && (appt.date || appt.start)) // Filter out invalid entries
        .map((appt: RawAppointmentData) => {
          // Ensure we have a valid date
          const date = appt.start ? new Date(appt.start as string | Date) : appt.date ? new Date(appt.date as string | Date) : new Date();

          // Create a properly typed appointment object with extended properties
          const processedAppointment: ExtendedAppointment = {
            id: appt.id || `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Generate a temporary ID if none exists
            date: date,
            duration: appt.duration || 60, // Default to 60 minutes if not specified
            status: appt.status || 'pending', // Default status
            clientId: appt.clientId || (appt.client ? appt.client.id : undefined),
            client: appt.client,
            clientIds: appt.clientIds, // Group appointment client IDs
            clients: appt.clients, // Group appointment client objects
            type: appt.type || 'individual', // Default to individual
            isPaid: appt.isPaid,
            price: appt.price,
            maxClients: appt.maxClients,
            notes: appt.notes,
            description: appt.description,
            cancelledAt: appt.cancelledAt ? new Date(appt.cancelledAt as string | Date) : undefined,
            cancellationReason: appt.cancellationReason,
            cancelledById: appt.cancelledById,
            attendance: appt.attendance,
            // Extended properties
            end: appt.end ? new Date(appt.end as string | Date) : null,
            createdAt: appt.createdAt ? new Date(appt.createdAt as string | Date) : null,
            updatedAt: appt.updatedAt ? new Date(appt.updatedAt as string | Date) : null,
          };

          return processedAppointment;
        })
        .filter((appt) => !isNaN(appt.date.getTime())); // Filter out invalid dates

      // The processedAppointments are ExtendedAppointment[], but they're compatible with Appointment[]
      // since ExtendedAppointment extends Appointment
      setAppointments(processedAppointments as unknown as Appointment[]);
      return processedAppointments;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load appointments';
      setError(errorMessage);
      showError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  // Fetch appointments when the component mounts or the session changes
  useEffect(() => {
    if (session) {
      fetchAppointments();
    }
  }, [session, fetchAppointments]);

  return {
    appointments,
    isLoading,
    error,
    fetchAppointments,
  };
}
