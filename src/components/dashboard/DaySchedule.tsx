import { useState } from 'react';
import { format, addDays, subDays, startOfDay, endOfDay, isBefore, isEqual } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { showError, showPromise } from '@/lib/utils/notifications';

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
  onAppointmentUpdate?: () => void;
}

export function DaySchedule({ appointments, onAppointmentUpdate }: DayScheduleProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");

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
    const newDate = subDays(selectedDate, 1);
    if (!isBefore(startOfDay(newDate), startOfDay(new Date()))) {
      setSelectedDate(newDate);
    }
  };

  const handleNextDay = () => {
    setSelectedDate(addDays(selectedDate, 1));
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete appointment');
      }

      await showPromise(
        Promise.resolve(response),
        {
          loading: 'Deleting appointment...',
          success: 'Appointment deleted successfully',
          error: 'Failed to delete appointment',
        }
      );

      if (onAppointmentUpdate) {
        onAppointmentUpdate();
      }
    } catch (error) {
      showError(error);
    }
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setSelectedTime(format(new Date(appointment.date), 'HH:mm'));
    setIsEditDialogOpen(true);
  };

  const isTimeSlotAvailable = (timeSlot: string, excludeAppointmentId?: string) => {
    const [hours, minutes] = timeSlot.split(':').map(Number);
    const timeSlotDate = new Date(selectedDate);
    timeSlotDate.setHours(hours, minutes, 0, 0);

    const now = new Date();
    const todayStart = startOfDay(now);
    const selectedDayStart = startOfDay(selectedDate);

    // If selected day is before today, slot is not available
    if (isBefore(selectedDayStart, todayStart)) {
      return false;
    }

    // If it's today, check the actual time
    if (isEqual(selectedDayStart, todayStart)) {
      // Convert both dates to minutes since midnight for easier comparison
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const slotMinutes = hours * 60 + minutes;

      if (slotMinutes <= currentMinutes) {
        return false;
      }
    }

    // Check if there's any active appointment at this time (excluding the one being edited)
    return !filteredAppointments.some(appointment => {
      // Skip cancelled appointments
      if (appointment.status === 'cancelled') {
        return false;
      }

      if (appointment.id === excludeAppointmentId) {
        return false;
      }

      const appointmentDate = new Date(appointment.date);
      const appointmentEnd = new Date(appointmentDate.getTime() + appointment.duration * 60000);

      return (
        timeSlotDate >= appointmentDate && timeSlotDate < appointmentEnd
      );
    });
  };

  const handleSaveEdit = async () => {
    if (!selectedAppointment || !selectedTime) return;

    const [hours, minutes] = selectedTime.split(':');
    const newDate = new Date(selectedDate);
    newDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));

    // Check if the new time slot is available
    if (!isTimeSlotAvailable(selectedTime, selectedAppointment.id)) {
      showError(new Error('This time slot is not available or is in the past'));
      return;
    }

    try {
      await showPromise(
        fetch(`/api/appointments/${selectedAppointment.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            date: newDate.toISOString(),
          }),
        }),
        {
          loading: 'Updating appointment...',
          success: 'Appointment updated successfully',
          error: 'Failed to update appointment',
        }
      );
      setIsEditDialogOpen(false);
      onAppointmentUpdate?.();
    } catch (error) {
      showError(error);
    }
  };

  // Create time slots from 5:00 to 23:00 with 30-minute intervals
  const timeSlots = Array.from({ length: 37 }, (_, i) => {
    const hour = Math.floor(i / 2) + 5;
    const minutes = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minutes}`;
  });

  // Filter available time slots for the select dropdown
  const availableTimeSlots = timeSlots.filter(timeSlot =>
    isTimeSlotAvailable(timeSlot, selectedAppointment?.id)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePreviousDay}
          disabled={isBefore(startOfDay(selectedDate), startOfDay(new Date())) ||
            isEqual(startOfDay(selectedDate), startOfDay(new Date()))}
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
              disabled={(date) => {
                const today = startOfDay(new Date());
                const checkDate = startOfDay(date);
                return isBefore(checkDate, today);
              }}
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

          const [hours, minutes] = timeSlot.split(':').map(Number);
          const timeSlotDate = new Date(selectedDate);
          timeSlotDate.setHours(hours, minutes, 0, 0);

          const isPast = !isTimeSlotAvailable(timeSlot);

          return (
            <div
              key={timeSlot}
              className={cn(
                "p-2 rounded text-sm flex justify-between items-center",
                isBooked
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  : isPast
                    ? "bg-gray-50 text-gray-400 dark:bg-gray-800 dark:text-gray-600"
                    : "bg-green-50 text-gray-600 hover:bg-green-100 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
              )}
            >
              <span className={cn(isBooked && "line-through")}>{timeSlot}</span>
              <div className="flex items-center gap-2">
                {appointment && !isPast && (
                  <>
                    <span className="text-xs">
                      {appointment.client?.name || 'No client name'}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleEditAppointment(appointment)}
                        >
                          Edit time
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAppointment(appointment.id);
                          }}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Appointment Time</DialogTitle>
            <DialogDescription>
              Change the appointment time for {selectedAppointment?.client?.name}
            </DialogDescription>
          </DialogHeader>
          <Select value={selectedTime} onValueChange={setSelectedTime}>
            <SelectTrigger>
              <SelectValue placeholder="Select a time" />
            </SelectTrigger>
            <SelectContent>
              {availableTimeSlots.map((slot) => (
                <SelectItem key={slot} value={slot}>
                  {slot}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 