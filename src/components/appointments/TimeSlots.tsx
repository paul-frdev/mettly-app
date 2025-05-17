'use client';

import { useState } from 'react';
import { format, parse, addMinutes, isWithinInterval, isBefore } from 'date-fns';
import { cn } from '@/lib/utils';
import { AppointmentForm } from './AppointmentForm';

interface Client {
  id: string;
  name: string;
}

interface Appointment {
  date: Date;
  duration: number;
  client: Client;
}

interface TimeSlotsProps {
  selectedDate: Date;
  appointments?: Appointment[];
  onAppointmentCreated?: () => void;
}

export function TimeSlots({ selectedDate, appointments = [], onAppointmentCreated }: TimeSlotsProps) {
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Generate time slots from 5:00 to 23:00 with 30-minute intervals
  const timeSlots = [];
  const startTime = parse('05:00', 'HH:mm', selectedDate);
  const endTime = parse('23:00', 'HH:mm', selectedDate);
  let currentTime = startTime;

  while (currentTime <= endTime) {
    timeSlots.push(currentTime);
    currentTime = addMinutes(currentTime, 30);
  }

  const getSlotInfo = (slotTime: Date) => {
    const now = new Date();
    const isPast = isBefore(slotTime, now);

    const bookedAppointment = appointments.find(appointment => {
      const appointmentStart = new Date(appointment.date);
      const appointmentEnd = addMinutes(appointmentStart, appointment.duration);
      return isWithinInterval(slotTime, { start: appointmentStart, end: appointmentEnd });
    });

    return {
      isPast,
      isBooked: !!bookedAppointment,
      appointment: bookedAppointment
    };
  };

  const handleSlotClick = (time: Date) => {
    const { isPast, isBooked } = getSlotInfo(time);
    if (!isPast && !isBooked) {
      setSelectedTime(time);
      setIsFormOpen(true);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedTime(null);
  };

  return (
    <>
      <div className="space-y-1">
        {timeSlots.map((time, index) => {
          const { isPast, isBooked, appointment } = getSlotInfo(time);

          return (
            <button
              key={index}
              onClick={() => handleSlotClick(time)}
              disabled={isPast || isBooked}
              className={cn(
                'w-full text-left px-4 py-2 rounded transition-colors relative',
                isPast && 'bg-gray-100 cursor-not-allowed opacity-50 line-through',
                isBooked && 'bg-blue-100 cursor-not-allowed',
                !isPast && !isBooked && 'hover:bg-green-100 bg-green-50 cursor-pointer'
              )}
            >
              <span className="inline-block w-16">{format(time, 'HH:mm')}</span>
              {isBooked && appointment && (
                <span className="text-sm text-blue-600 ml-2">
                  {appointment.client.name}
                </span>
              )}
              {isPast && (
                <span className="text-sm text-gray-500 ml-2">
                  Past
                </span>
              )}
            </button>
          );
        })}
      </div>

      {selectedTime && (
        <AppointmentForm
          isOpen={isFormOpen}
          onClose={handleFormClose}
          selectedTime={selectedTime}
          onSuccess={onAppointmentCreated}
        />
      )}
    </>
  );
} 