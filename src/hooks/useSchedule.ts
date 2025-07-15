'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { format, addDays, subDays, startOfDay, isBefore, isEqual, parse, isSameDay } from 'date-fns';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';
import { showError, showInfo, showSuccess } from '@/lib/utils/notifications';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import { Client, Appointment } from '@/types/appointment';

export interface UseScheduleProps {
  appointments: Appointment[];
  onAppointmentCreated: () => void;
  onAppointmentCancelled: (appointment: Appointment) => void;
  isClient?: boolean;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function useSchedule({ appointments, onAppointmentCreated, isClient = false, selectedDate: propSelectedDate, onDateChange }: UseScheduleProps) {
  const { settings, isHoliday } = useBusinessSettings();
  const { triggerCalendarUpdate: calendarUpdate } = useCalendarSync();
  const { data: session } = useSession();

  const [selectedDate, setSelectedDate] = useState<Date>(propSelectedDate);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [duration, setDuration] = useState<number>(60);
  const [notes, setNotes] = useState<string>('');
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [appointmentType, setAppointmentType] = useState<'individual' | 'group'>('individual');
  const [groupCapacity, setGroupCapacity] = useState(2);
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState(0);
  const [currentClientId, setCurrentClientId] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(selectedDate);

  // Sync with parent component's selected date
  useEffect(() => {
    if (propSelectedDate && !isSameDay(propSelectedDate, selectedDate)) {
      setSelectedDate(propSelectedDate);
    }
  }, [propSelectedDate, selectedDate]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      if (onDateChange) {
        onDateChange(date);
      }
    }
  };

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch('/api/clients');
        if (response.ok) {
          const data = await response.json();
          setClients(data);
        }
      } catch (error) {
        console.error('Failed to fetch clients:', error);
      }
    };

    if (!isClient) {
      fetchClients();
    }
  }, [isClient]);

  useEffect(() => {
    if (settings) {
      setIsLoading(false);
    }
  }, [settings]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Update current month when selected date changes
  useEffect(() => {
    setCurrentMonth(selectedDate);
  }, [selectedDate]);

  const handlePreviousDay = () => {
    const newDate = subDays(selectedDate, 1);
    if (!isBefore(startOfDay(newDate), startOfDay(new Date())) || isEqual(startOfDay(newDate), startOfDay(new Date()))) {
      setSelectedDate(newDate);
      if (onDateChange) {
        onDateChange(newDate);
      }
    }
  };

  const handleNextDay = () => {
    const newDate = addDays(selectedDate, 1);
    setSelectedDate(newDate);
    if (onDateChange) {
      onDateChange(newDate);
    }
  };

  // Set the client ID from the session
  useEffect(() => {
    if (session?.user) {
      if (isClient) {
        const clientId = (session.user as { clientId?: string })?.clientId || (session.user as { id?: string })?.id || session.user?.email;

        const fetchClientId = async () => {
          try {
            const response = await fetch('/api/clients/by-email?email=' + encodeURIComponent(session.user.email || ''));
            if (response.ok) {
              const data = await response.json();
              if (data && data.id) {
                setCurrentClientId(data.id);
              } else if (clientId) {
                setCurrentClientId(clientId);
              }
            } else if (clientId) {
              setCurrentClientId(clientId);
            }
          } catch (error) {
            console.error('Error fetching client ID:', error);
            if (clientId) {
              setCurrentClientId(clientId);
            }
          }
        };

        if (session.user.email) {
          fetchClientId();
        } else if (clientId) {
          setCurrentClientId(clientId);
        } else {
          showError('No client ID found in session');
          console.error('Session user:', session.user);
        }
      } else {
        setCurrentClientId(null);
      }
    } else {
      setCurrentClientId(null);
    }
  }, [session, isClient]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      if (!apt || !apt.date) {
        return false;
      }
      try {
        const appointmentDate = new Date(apt.date);
        if (isNaN(appointmentDate.getTime())) {
          showError('Skipping appointment with invalid date');
          console.error('Invalid appointment:', apt);
          return false;
        }
        return format(appointmentDate, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
      } catch (error) {
        showError(`Error processing appointment`);
        console.error('Appointment error:', { apt, error });
        return false;
      }
    });
  }, [appointments, selectedDate]);

  const generateTimeSlots = () => {
    if (!settings) {
      return [];
    }

    const slots: string[] = [];
    const workingHours = settings.workingHours;
    const dayOfWeek = format(selectedDate, 'EEEE');
    const daySchedule = workingHours[dayOfWeek];

    if (!daySchedule?.enabled) {
      return [];
    }

    if (isHoliday(selectedDate)) {
      showInfo('Selected date is a holiday');
      return [];
    }

    const [startHour, startMinute] = daySchedule.start.split(':').map(Number);
    const [endHour, endMinute] = daySchedule.end.split(':').map(Number);

    let currentTime = new Date(selectedDate);
    currentTime.setHours(startHour, startMinute, 0, 0);
    const endTime = new Date(selectedDate);
    endTime.setHours(endHour, endMinute, 0, 0);

    while (currentTime < endTime) {
      slots.push(format(currentTime, 'h:mm a'));
      currentTime = new Date(currentTime.getTime() + settings.slotDuration * 60000);
    }

    return slots;
  };

  const timeSlots = useMemo(generateTimeSlots, [settings, selectedDate, isHoliday]);

  const handleCreateAppointment = async () => {
    if (!selectedTimeSlot) {
      showError('Please select a time slot');
      return;
    }

    if (!isClient && appointmentType === 'individual' && !selectedClientId) {
      showError('Please select a client');
      return;
    }

    if (!isClient && appointmentType === 'group' && (!selectedClients || selectedClients.length === 0)) {
      showError('Please select at least one client for group session');
      return;
    }

    const appointmentDate = parse(selectedTimeSlot, 'h:mm a', selectedDate);
    const requestData = {
      date: appointmentDate.toISOString(),
      duration,
      notes,
      type: appointmentType,
      isPaid,
      price: isPaid ? price : undefined,
      maxClients: appointmentType === 'group' ? groupCapacity : undefined,
      clientId: appointmentType === 'individual' ? (isClient ? 'self' : selectedClientId) : undefined,
      clientIds: appointmentType === 'group' ? selectedClients : undefined,
    };

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = responseData?.message || 'Failed to create appointment';
        throw new Error(errorMessage);
      }

      const currentSelectedDate = new Date(selectedDate);
      setIsCreateDialogOpen(false);
      setNotes('');
      setSelectedClientId('');
      setDuration(60);
      setSelectedTimeSlot('');

      if (onAppointmentCreated) {
        onAppointmentCreated();
      }
      if (calendarUpdate) {
        calendarUpdate();
      }

      showSuccess('Appointment created successfully');
      setSelectedDate(currentSelectedDate);
      if (onDateChange) {
        onDateChange(currentSelectedDate);
      }
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to create appointment');
    }
  };

  const isTimeSlotBooked = (timeSlot: string) => {
    const slotTime = parse(timeSlot, 'h:mm a', selectedDate);
    const slotEndTime = new Date(slotTime.getTime() + (settings?.slotDuration || 30) * 60000);

    return filteredAppointments.some((appointment) => {
      if (appointment.status === 'cancelled') {
        return false;
      }
      const appointmentStart = new Date(appointment.date);
      const appointmentEnd = new Date(appointmentStart.getTime() + appointment.duration! * 60000);
      const slotStartTime = slotTime.getTime();
      const slotEndTimeMs = slotEndTime.getTime();
      const appointmentStartTime = appointmentStart.getTime();
      const appointmentEndTime = appointmentEnd.getTime();

      return (
        (slotStartTime >= appointmentStartTime && slotStartTime < appointmentEndTime) || (slotEndTimeMs > appointmentStartTime && slotEndTimeMs <= appointmentEndTime) || (slotStartTime <= appointmentStartTime && slotEndTimeMs >= appointmentEndTime)
      );
    });
  };

  const getAppointmentForTimeSlot = (timeSlot: string) => {
    const slotTime = parse(timeSlot, 'h:mm a', selectedDate);
    const slotEndTime = new Date(slotTime.getTime() + (settings?.slotDuration || 30) * 60000);

    return filteredAppointments.find((appointment) => {
      if (appointment.status === 'cancelled') return false;
      const appointmentStart = new Date(appointment.date);
      const appointmentEnd = new Date(appointmentStart.getTime() + appointment.duration! * 60000);
      return (slotTime >= appointmentStart && slotTime < appointmentEnd) || (slotEndTime > appointmentStart && slotEndTime <= appointmentEnd) || (slotTime <= appointmentStart && slotEndTime >= appointmentEnd);
    });
  };

  const standardDurations = [30, 45, 60, 90, 120];

  function getAvailableDurationsForTimeSlot(timeSlot: string) {
    const start = parse(timeSlot, 'h:mm a', selectedDate);
    const sorted = filteredAppointments
      .filter((a) => a.status !== 'cancelled')
      .map((a) => ({
        start: new Date(a.date),
        end: new Date(new Date(a.date).getTime() + a.duration! * 60000),
      }))
      .filter((a) => a.start > start)
      .sort((a, b) => a.start.getTime() - b.start.getTime());

    if (sorted.length === 0) {
      return standardDurations;
    }

    const next = sorted[0].start;
    const maxDuration = Math.floor((next.getTime() - start.getTime()) / 60000);
    return standardDurations.filter((duration) => duration <= maxDuration);
  }

  const availableDurations = selectedTimeSlot ? getAvailableDurationsForTimeSlot(selectedTimeSlot) : standardDurations;

  return {
    settings,
    isHoliday,
    selectedDate,
    setSelectedDate,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    selectedTimeSlot,
    setSelectedTimeSlot,
    duration,
    setDuration,
    notes,
    setNotes,
    clients,
    selectedClientId,
    setSelectedClientId,
    selectedClients,
    setSelectedClients,
    isLoading,
    currentTime,
    appointmentType,
    setAppointmentType,
    groupCapacity,
    setGroupCapacity,
    isPaid,
    setIsPaid,
    price,
    setPrice,
    currentClientId,
    currentMonth,
    setCurrentMonth,
    handleDateSelect,
    handlePreviousDay,
    handleNextDay,
    timeSlots,
    handleCreateAppointment,
    isTimeSlotBooked,
    getAppointmentForTimeSlot,
    availableDurations,
  };
}
