'use client';

import { useState } from 'react';
import { format, parse, addMinutes, isBefore } from 'date-fns';
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
  client: Client;
  status: string;
  notes?: string;
  cancelledAt?: Date;
  cancellationReason?: string;
  attendance?: {
    status: 'confirmed' | 'declined' | null;
  };
}

interface TimeSlotsProps {
  selectedDate: Date;
  appointments?: Appointment[];
  onAppointmentCreated?: () => void;
  isClient?: boolean;
}

export function TimeSlots({ selectedDate, appointments = [], onAppointmentCreated, isClient }: TimeSlotsProps) {
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const {
    settings,
    isLoading,
    isHoliday,
    isWorkingDay,
    getSlotDuration
  } = useBusinessSettings();

  console.log('TimeSlots');

  console.log('selectedTime', selectedTime);

  // Generate time slots based on business settings
  const generateTimeSlots = () => {
    const slots: Date[] = [];
    if (!settings?.workingHours) return slots;

    const dayOfWeek = format(selectedDate, 'EEEE');
    const daySchedule = settings.workingHours[dayOfWeek];
    if (!daySchedule?.enabled) return slots;

    const startTime = parse(daySchedule.start, 'HH:mm', selectedDate);
    const endTime = parse(daySchedule.end, 'HH:mm', selectedDate);
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
      // Skip cancelled appointments
      if (appointment.status === 'cancelled') {
        return false;
      }

      // Skip appointments where client declined
      if (appointment.attendance?.status === 'declined') {
        return false;
      }

      const appointmentStart = new Date(appointment.date);
      const appointmentEnd = addMinutes(appointmentStart, appointment.duration);
      const slotEnd = addMinutes(slotTime, getSlotDuration());

      // Check if the new slot overlaps with existing appointment
      return (
        (slotTime >= appointmentStart && slotTime < appointmentEnd) || // New slot starts during existing appointment
        (slotEnd > appointmentStart && slotEnd <= appointmentEnd) || // New slot ends during existing appointment
        (slotTime <= appointmentStart && slotEnd >= appointmentEnd) // New slot completely contains existing appointment
      );
    });

    // Проверяем, является ли это занятым слотом (маскированная встреча другого клиента)
    const isBusy = bookedAppointment?.client?.id === 'busy';

    return {
      isPast,
      isBooked: !!bookedAppointment,
      isNonWorking,
      appointment: bookedAppointment,
      isBusy
    };
  };

  const handleSlotClick = (time: Date) => {
    const { isPast, isBooked, isNonWorking, isBusy } = getSlotInfo(time);
    if (!isPast && !isBooked && !isNonWorking && !isBusy) {
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
    <div className="container mx-auto py-8 px-4" style={{ background: '#f5f6fa' }}>
      <div className="grid grid-cols-4 gap-2">
        {timeSlots.map((time) => {
          const { isPast, isBooked, isNonWorking, appointment, isBusy } = getSlotInfo(time);

          return (
            <button
              key={time.toISOString()}
              onClick={() => handleSlotClick(time)}
              disabled={isPast || isBooked || isNonWorking || isBusy}
              className={cn(
                "p-2 rounded text-sm text-center transition-colors",
                isPast && "bg-gray-100 text-gray-400 cursor-not-allowed",
                isBusy && "bg-gray-200 text-gray-600 cursor-not-allowed",
                isBooked && !isPast && !isBusy && "bg-blue-100 text-blue-800 cursor-not-allowed",
                isBooked && isPast && "bg-purple-50 text-purple-600 cursor-not-allowed",
                isNonWorking && "bg-gray-100 text-gray-400 cursor-not-allowed",
                !isPast && !isBooked && !isNonWorking && !isBusy && "bg-green-50 hover:bg-green-100 text-green-800"
              )}
            >
              {format(time, 'HH:mm')}
              {isBooked && appointment?.client && (
                <div className="text-xs mt-1 truncate">
                  {isBusy ? 'Busy' : appointment.client.name}
                  <div className="flex items-center justify-center gap-1 mt-1">
                    {appointment.status && !isBusy && (
                      <span className={cn(
                        "px-1 rounded text-[10px]",
                        appointment.status === 'completed' && "bg-green-100 text-green-800",
                        appointment.status === 'scheduled' && "bg-yellow-100 text-yellow-800",
                        appointment.status === 'cancelled' && "bg-red-100 text-red-800"
                      )}>
                        {appointment.status}
                      </span>
                    )}
                    <span className="text-[10px] text-gray-500">
                      {format(new Date(appointment.date), 'HH:mm')}
                    </span>
                  </div>
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
            isClient={isClient}
            appointments={appointments}
          />
        )}
      </div>
    </div>
  );
} 