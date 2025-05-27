'use client';

import { useState, useEffect } from 'react';
import { format, addDays, subDays, startOfDay, isBefore, isEqual, parse } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CalendarIcon, MoreVertical, Plus } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { showError } from '@/lib/utils/notifications';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useBusinessSettings } from '@/hooks/useBusinessSettings';
import { toast } from 'sonner';

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface Appointment {
  id: string;
  date: Date;
  duration: number;
  client?: Client;
  status: string;
}

interface ScheduleProps {
  appointments: Appointment[];
  onAppointmentCreated: () => void;
  isClient?: boolean;
}

export function Schedule({ appointments, onAppointmentCreated, isClient }: ScheduleProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [duration, setDuration] = useState<number>(60);
  const [notes, setNotes] = useState<string>('');
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const { settings, isHoliday } = useBusinessSettings();
  const [isLoading, setIsLoading] = useState(true);

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

    fetchClients();
  }, []);

  useEffect(() => {
    if (settings) {
      setIsLoading(false);
    }
  }, [settings]);

  const handlePreviousDay = () => {
    const newDate = subDays(selectedDate, 1);
    if (!isBefore(startOfDay(newDate), startOfDay(new Date()))) {
      setSelectedDate(newDate);
    }
  };

  const handleNextDay = () => {
    setSelectedDate(addDays(selectedDate, 1));
  };

  const generateTimeSlots = () => {
    if (!settings) {
      return [];
    }

    const slots: string[] = [];
    const workingHours = settings.workingHours;
    const dayOfWeek = format(selectedDate, 'EEEE');
    const daySchedule = workingHours[dayOfWeek];

    if (!daySchedule?.enabled) {
      toast.info('Day is not enabled in schedule');
      return [];
    }

    if (isHoliday(selectedDate)) {
      toast.info('Selected date is a holiday');
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

  const timeSlots = generateTimeSlots();

  const filteredAppointments = appointments.filter(
    (apt) => format(new Date(apt.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
  );

  const handleEditAppointment = (appointment: Appointment) => {
    // TODO: Implement edit functionality
    console.log('Edit appointment:', appointment);
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete appointment');
      }

      onAppointmentCreated(); // Обновляем список встреч после удаления
    } catch (error) {
      showError(error);
    }
  };

  const handleCreateAppointment = async () => {
    if (!selectedTimeSlot || !selectedClientId) {
      showError('Please select a client');
      return;
    }

    const appointmentDate = parse(selectedTimeSlot, 'h:mm a', selectedDate);

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: appointmentDate.toISOString(),
          duration,
          clientId: selectedClientId,
          notes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create appointment');
      }

      setIsCreateDialogOpen(false);
      setNotes('');
      setSelectedClientId('');
      setDuration(60);
      onAppointmentCreated();
    } catch (error) {
      showError(error);
    }
  };

  const isTimeSlotBooked = (timeSlot: string) => {
    return filteredAppointments.some(appointment => {
      const appointmentTime = format(appointment.date, 'h:mm a');
      const appointmentEndTime = format(
        new Date(new Date(appointment.date).getTime() + appointment.duration * 60000),
        'h:mm a'
      );
      return timeSlot >= appointmentTime && timeSlot < appointmentEndTime;
    });
  };

  const getAppointmentForTimeSlot = (timeSlot: string) => {
    return filteredAppointments.find(appointment => {
      const appointmentTime = format(appointment.date, 'h:mm a');
      const appointmentEndTime = format(
        new Date(new Date(appointment.date).getTime() + appointment.duration * 60000),
        'h:mm a'
      );
      return timeSlot >= appointmentTime && timeSlot < appointmentEndTime;
    });
  };

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : !settings ? (
        <div className="text-center p-4 text-red-400">
          Failed to load business settings. Please try refreshing the page.
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePreviousDay}
              disabled={isBefore(startOfDay(selectedDate), startOfDay(new Date())) ||
                isEqual(startOfDay(selectedDate), startOfDay(new Date()))}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[280px] justify-start text-left font-normal bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, 'PPP')} • {format(selectedDate, 'EEEE')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-[#1a1a2e] border-white/20" align="center">
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
                  className="bg-[#1a1a2e] text-white"
                />
              </PopoverContent>
            </Popover>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextDay}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {timeSlots.length === 0 ? (
            <div className="text-center p-4 text-gray-400">
              {isHoliday(selectedDate)
                ? "This is a holiday. No appointments available."
                : "No working hours set for this day."}
            </div>
          ) : (
            <div className="space-y-2">
              {timeSlots.map((timeSlot) => {
                const isBooked = isTimeSlotBooked(timeSlot);
                const appointment = getAppointmentForTimeSlot(timeSlot);
                const isPast = isBefore(
                  parse(timeSlot, 'h:mm a', selectedDate),
                  new Date()
                );

                return (
                  <div
                    key={timeSlot}
                    className={cn(
                      "p-2 rounded text-sm flex justify-between items-center",
                      isBooked
                        ? "bg-[#e42627]/20 text-[#e42627]"
                        : isPast
                          ? "bg-gray-500/10 text-gray-300"
                          : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 cursor-pointer"
                    )}
                    onClick={() => {
                      if (!isBooked && !isPast && !isClient) {
                        setSelectedTimeSlot(timeSlot);
                        setIsCreateDialogOpen(true);
                      }
                    }}
                  >
                    <span className={cn(isBooked && "line-through")}>{timeSlot}</span>
                    <div className="flex items-center gap-2">
                      {appointment && !isPast && (
                        <>
                          <span className="text-xs text-white">
                            {appointment.client?.name || 'No client name'}
                            {appointment.duration > 60 && ` (${appointment.duration}min)`}
                          </span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white hover:bg-white/10">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-[#1a1a2e] border-white/20">
                              <DropdownMenuItem
                                onClick={() => handleEditAppointment(appointment)}
                                className="text-white hover:bg-white/10"
                              >
                                Edit time
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-400 hover:bg-red-500/20"
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
                      {!isBooked && !isPast && !isClient && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-white hover:bg-white/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTimeSlot(timeSlot);
                            setIsCreateDialogOpen(true);
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent className="bg-[#1a1a2e] border-white/20 text-white">
              <DialogHeader>
                <DialogTitle className="text-white">Create New Appointment</DialogTitle>
                <DialogDescription className="text-gray-300">
                  Create a new appointment for {selectedTimeSlot} on {format(selectedDate, 'PPP')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="client" className="text-white">Select Client</Label>
                  <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a2e] border-white/20">
                      {clients.map((client) => (
                        <SelectItem
                          key={client.id}
                          value={client.id}
                          className="text-white hover:bg-white/10"
                        >
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-white">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="bg-white/10 border-white/20 text-white resize-none"
                    placeholder="Add any notes about the appointment"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-white">Duration</Label>
                  <Select value={duration.toString()} onValueChange={(value) => setDuration(Number(value))}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a2e] border-white/20">
                      <SelectItem value="30" className="text-white hover:bg-white/10">30 minutes</SelectItem>
                      <SelectItem value="45" className="text-white hover:bg-white/10">45 minutes</SelectItem>
                      <SelectItem value="60" className="text-white hover:bg-white/10">1 hour</SelectItem>
                      <SelectItem value="90" className="text-white hover:bg-white/10">1.5 hours</SelectItem>
                      <SelectItem value="120" className="text-white hover:bg-white/10">2 hours</SelectItem>
                      <SelectItem value="150" className="text-white hover:bg-white/10">2.5 hours</SelectItem>
                      <SelectItem value="180" className="text-white hover:bg-white/10">3 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateAppointment}
                  className="bg-[#e42627] hover:bg-[#d41f20] text-white"
                >
                  Create Appointment
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
} 