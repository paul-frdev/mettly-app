'use client';

import { useState } from 'react';
import { format, parse, addMinutes, isWithinInterval } from 'date-fns';
import { cn } from '@/lib/utils';
import { AppointmentForm } from './AppointmentForm';

interface TimeSlotsProps {
  selectedDate: Date;
  appointments?: Array<{
    date: Date;
    duration: number;
  }>;
  clientId?: string;
  onAppointmentCreated?: () => void;
}

export function TimeSlots({ selectedDate, appointments = [], clientId, onAppointmentCreated }: TimeSlotsProps) {
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

  // Check if a time slot is available
  const isSlotAvailable = (slotTime: Date) => {
    return !appointments.some(appointment => {
      const appointmentStart = new Date(appointment.date);
      const appointmentEnd = addMinutes(appointmentStart, appointment.duration);
      return isWithinInterval(slotTime, { start: appointmentStart, end: appointmentEnd });
    });
  };

  const handleSlotClick = (time: Date) => {
    if (isSlotAvailable(time)) {
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
          const isAvailable = isSlotAvailable(time);
          return (
            <button
              key={index}
              onClick={() => handleSlotClick(time)}
              disabled={!isAvailable}
              className={cn(
                'w-full text-left px-4 py-2 rounded transition-colors',
                isAvailable
                  ? 'hover:bg-green-100 bg-green-50 cursor-pointer'
                  : 'bg-gray-100 cursor-not-allowed opacity-50'
              )}
            >
              {format(time, 'HH:mm')}
            </button>
          );
        })}
      </div>

      {selectedTime && (
        <AppointmentForm
          isOpen={isFormOpen}
          onClose={handleFormClose}
          selectedTime={selectedTime}
          clientId={clientId}
          onSuccess={onAppointmentCreated}
        />
      )}
    </>
  );
} 