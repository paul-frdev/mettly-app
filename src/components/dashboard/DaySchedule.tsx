import { useState } from 'react';
import { format, addDays, subDays, startOfDay, endOfDay } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface Appointment {
  id: string;
  date: Date;
  duration: number;
  client?: {
    name: string;
  };
  status: string;
}

interface DayScheduleProps {
  appointments: Appointment[];
}

export function DaySchedule({ appointments }: DayScheduleProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const filteredAppointments = appointments.filter(
    (appointment) => {
      const appointmentDate = new Date(appointment.date);
      return (
        appointmentDate >= startOfDay(selectedDate) &&
        appointmentDate <= endOfDay(selectedDate)
      );
    }
  );

  const handlePreviousDay = () => {
    setSelectedDate(prev => subDays(prev, 1));
  };

  const handleNextDay = () => {
    setSelectedDate(prev => addDays(prev, 1));
  };

  // Create time slots from 5:00 to 23:00 with 30-minute intervals
  const timeSlots = Array.from({ length: 37 }, (_, i) => {
    const hour = Math.floor(i / 2) + 5; // Start from 5:00
    const minutes = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minutes}`;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePreviousDay}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[200px] justify-start text-left font-normal",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(selectedDate, 'PPP')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Button
          variant="outline"
          size="icon"
          onClick={handleNextDay}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-1 max-h-[500px] overflow-y-auto pr-2">
        {timeSlots.map((timeSlot) => {
          const isBooked = filteredAppointments.some(appointment => {
            const appointmentTime = format(new Date(appointment.date), 'HH:mm');
            const appointmentEndTime = format(
              new Date(new Date(appointment.date).getTime() + appointment.duration * 60000),
              'HH:mm'
            );
            return timeSlot >= appointmentTime && timeSlot < appointmentEndTime;
          });

          const appointment = filteredAppointments.find(appointment => {
            const appointmentTime = format(new Date(appointment.date), 'HH:mm');
            return timeSlot === appointmentTime;
          });

          return (
            <div
              key={timeSlot}
              className={cn(
                "p-2 rounded text-sm flex justify-between items-center",
                isBooked
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  : "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
              )}
            >
              <span>{timeSlot}</span>
              {appointment && (
                <span className="text-xs">
                  {appointment.client?.name || 'No client name'}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
} 