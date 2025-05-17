'use client';

import { useState } from 'react';
import { format, parse, addMinutes, isWithinInterval, isBefore } from 'date-fns';
import { cn } from '@/lib/utils';
import { AppointmentForm } from './AppointmentForm';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';

interface Client {
  id: string;
  name: string;
}

interface Appointment {
  id: string;
  date: Date;
  duration: number;
  client?: Client;
}

interface TimeSlotsProps {
  selectedDate: Date;
  appointments?: Appointment[];
  onAppointmentCreated?: () => void;
}

export function TimeSlots({ selectedDate, appointments = [], onAppointmentCreated }: TimeSlotsProps) {
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const {
    isLoading,
    isHoliday,
    isWorkingDay,
    getWorkingHours,
    getSlotDuration
  } = useBusinessSettings();

  // Generate time slots based on business settings
  const generateTimeSlots = () => {
    const slots: Date[] = [];
    const workingHours = getWorkingHours(selectedDate);

    // If it's a holiday or non-working day, return empty array
    if (!workingHours) return slots;

    const startTime = parse(workingHours.start, 'HH:mm', selectedDate);
    const endTime = parse(workingHours.end, 'HH:mm', selectedDate);
    const duration = getSlotDuration();

    let currentTime = startTime;
    while (currentTime <= endTime) {
      slots.push(currentTime);
      currentTime = addMinutes(currentTime, duration);
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();

  const getSlotInfo = (slotTime: Date) => {
    const now = new Date();
    const isPast = isBefore(slotTime, now);
    const isNonWorking = !isWorkingDay(selectedDate) || isHoliday(selectedDate);

    const bookedAppointment = appointments.find(appointment => {
      const appointmentStart = new Date(appointment.date);
      const appointmentEnd = addMinutes(appointmentStart, appointment.duration);
      return isWithinInterval(slotTime, { start: appointmentStart, end: appointmentEnd });
    });

    return {
      isPast,
      isBooked: !!bookedAppointment,
      isNonWorking,
      appointment: bookedAppointment
    };
  };

  const handleSlotClick = (time: Date) => {
    const { isPast, isBooked, isNonWorking } = getSlotInfo(time);
    if (!isPast && !isBooked && !isNonWorking) {
      setSelectedTime(time);
      setIsFormOpen(true);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedTime(null);
  };

  if (isLoading) {
    return <div>Loading schedule...</div>;
  }

  if (isHoliday(selectedDate)) {
    return (
      <div className="p-4 bg-orange-50 text-orange-800 rounded">
        This day is marked as a holiday in your business settings.
      </div>
    );
  }

  if (!isWorkingDay(selectedDate)) {
    return (
      <div className="p-4 bg-gray-50 text-gray-800 rounded">
        This is not a working day according to your business hours.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-2">
      {timeSlots.map((time) => {
        const { isPast, isBooked, isNonWorking, appointment } = getSlotInfo(time);

        return (
          <button
            key={time.toISOString()}
            onClick={() => handleSlotClick(time)}
            disabled={isPast || isBooked || isNonWorking}
            className={cn(
              "p-2 rounded text-sm text-center transition-colors",
              isPast && "bg-gray-100 text-gray-400 cursor-not-allowed",
              isBooked && "bg-blue-100 text-blue-800 cursor-not-allowed",
              isNonWorking && "bg-gray-100 text-gray-400 cursor-not-allowed",
              !isPast && !isBooked && !isNonWorking && "bg-green-50 hover:bg-green-100 text-green-800"
            )}
          >
            {format(time, 'HH:mm')}
            {isBooked && appointment?.client && (
              <div className="text-xs mt-1 truncate">
                {appointment.client.name}
              </div>
            )}
          </button>
        );
      })}

      {selectedTime && (
        <AppointmentForm
          isOpen={isFormOpen}
          onClose={handleFormClose}
          selectedTime={selectedTime}
          onSuccess={() => {
            handleFormClose();
            onAppointmentCreated?.();
          }}
        />
      )}
    </div>
  );
} 