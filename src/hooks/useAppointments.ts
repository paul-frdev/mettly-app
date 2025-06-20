'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Appointment } from '@/types/appointment';
import { showError } from '@/lib/utils/notifications';

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
      
      let appointmentsData: any[] = [];
      
      // Handle different response formats
      if (Array.isArray(responseData)) {
        // Direct array response (trainer view)
        appointmentsData = responseData;
      } else if (responseData.list && Array.isArray(responseData.list)) {
        // Client view with list and calendar
        appointmentsData = responseData.list;
      } else if (responseData.data && Array.isArray(responseData.data)) {
        // Alternative format with data array
        appointmentsData = responseData.data;
      } else if (responseData.calendar && Array.isArray(responseData.calendar)) {
        // Calendar format
        appointmentsData = responseData.calendar;
      } else {
        console.error('Unexpected API response format:', responseData);
        throw new Error('Invalid data format received from server');
      }
      
      // Process appointments
      const processedAppointments = appointmentsData
        .filter((appt: any) => appt && (appt.date || appt.start)) // Filter out invalid entries
        .map((appt: any) => ({
          ...appt,
          // Use start date if available (from calendar format), otherwise use date
          date: appt.start ? new Date(appt.start) : new Date(appt.date),
          // Include end date if available
          end: appt.end ? new Date(appt.end) : null,
          // Ensure client info is properly set
          clientId: appt.clientId || (appt.client ? appt.client.id : null),
          client: appt.client || null,
          // Parse dates
          createdAt: appt.createdAt ? new Date(appt.createdAt) : null,
          updatedAt: appt.updatedAt ? new Date(appt.updatedAt) : null
        }))
        .filter((appt: any) => !isNaN(new Date(appt.date).getTime())); // Filter out invalid dates
      
      setAppointments(processedAppointments);
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
