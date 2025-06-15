'use client';

import { useState, useEffect, useCallback } from 'react';
import { Appointment } from '@/types/appointment';
import { showError } from '@/lib/utils/notifications';

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAppointments = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/appointments');
      
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }
      
      const data = await response.json();
      // Ensure dates are properly parsed
      const appointmentsWithDates = data.map((appt: any) => ({
        ...appt,
        date: new Date(appt.date),
        createdAt: new Date(appt.createdAt),
        updatedAt: new Date(appt.updatedAt)
      }));
      
      setAppointments(appointmentsWithDates);
      return appointmentsWithDates;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      showError('Failed to load appointments');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return {
    appointments,
    isLoading,
    fetchAppointments,
  };
}
