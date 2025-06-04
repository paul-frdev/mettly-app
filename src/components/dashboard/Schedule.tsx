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
import { CancelDialog } from '@/components/ui/cancel-dialog';

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
  clientId?: string;
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
  const [isCancellationDialogOpen, setIsCancellationDialogOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  let dayEnd: Date | null = null;
  let endHour = 23, endMinute = 59;
  if (settings) {
    dayEnd = new Date(selectedDate);
    [endHour, endMinute] = settings.workingHours[format(selectedDate, 'EEEE')]?.end.split(':').map(Number) || [23, 59];
    dayEnd.setHours(endHour, endMinute, 0, 0);
  }

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

  const handleDeleteAppointment = (appointment: Appointment) => {
    setAppointmentToCancel(appointment);
    setIsCancellationDialogOpen(true);
  };

  const handleCancelAppointment = async (reason: string) => {
    if (!appointmentToCancel) return;

    try {
      const response = await fetch(`/api/appointments/${appointmentToCancel.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cancellationReason: reason,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel appointment');
      }

      onAppointmentCreated();
      setAppointmentToCancel(null);
    } catch (error) {
      showError(error);
    }
  };

  const handleCreateAppointment = async () => {
    if (!selectedTimeSlot) {
      showError('Please select a time slot');
      return;
    }

    if (!isClient && !selectedClientId) {
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
          clientId: isClient ? 'self' : selectedClientId,
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
      // Skip cancelled appointments
      if (appointment.status === 'cancelled') {
        return false;
      }

      const appointmentTime = format(new Date(appointment.date), 'h:mm a');
      const appointmentEndTime = format(
        new Date(new Date(appointment.date).getTime() + appointment.duration * 60000),
        'h:mm a'
      );
      return timeSlot >= appointmentTime && timeSlot < appointmentEndTime;
    });
  };

  const getAppointmentForTimeSlot = (timeSlot: string) => {
    return filteredAppointments.find(appointment => {
      // Skip cancelled appointments
      if (appointment.status === 'cancelled') {
        return false;
      }

      const appointmentTime = format(new Date(appointment.date), 'h:mm a');
      return timeSlot === appointmentTime;
    });
  };

  function getAvailableDurationsForTimeSlot(timeSlot: string) {
    const MIN = 30;
    const MAX = 180;
    const step = 15;
    let maxDuration = MAX;

    // Найти дату и время начала выбранного слота
    const start = parse(timeSlot, 'h:mm a', selectedDate);

    // Отфильтровать все записи на этот день, которые начинаются после выбранного времени
    const sorted = filteredAppointments
      .filter(a => a.status !== 'cancelled')
      .map(a => ({
        start: new Date(a.date),
        end: new Date(new Date(a.date).getTime() + a.duration * 60000)
      }))
      .filter(a => a.start > start)
      .sort((a, b) => a.start.getTime() - b.start.getTime());

    if (sorted.length > 0) {
      const next = sorted[0].start;
      maxDuration = Math.floor((next.getTime() - start.getTime()) / 60000);
      if (maxDuration > MAX) maxDuration = MAX;
    }
    if (maxDuration < MIN) maxDuration = 0;
    const durations = [];
    for (let d = MIN; d <= maxDuration; d += step) {
      durations.push(d);
    }
    return durations;
  }

  const availableDurations = selectedTimeSlot
    ? getAvailableDurationsForTimeSlot(selectedTimeSlot)
    : [30, 45, 60, 90, 120, 150, 180];

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
              className="bg-black/70 border-white/20 text-white hover:bg-black/20"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[280px] justify-start text-left font-normal bg-black/70 border-white/20 text-white hover:bg-white/20 hover:text-black hover:border-black/40"
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
              className="bg-black/70 border-white/20 text-white hover:bg-black/50"
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
            <div className="space-y-2 relative">
              {format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') && (
                <div
                  className="absolute left-0 right-0 h-0.5 bg-red-500 z-10"
                  style={{
                    top: `${(() => {
                      if (!settings) return 0;
                      const now = currentTime;
                      const dayStart = new Date(selectedDate);
                      const [startHour, startMinute] = settings.workingHours[format(selectedDate, 'EEEE')]?.start.split(':').map(Number) || [0, 0];
                      dayStart.setHours(startHour, startMinute, 0, 0);

                      // Calculate total minutes since start of day
                      const totalMinutesSinceStart = (now.getTime() - dayStart.getTime()) / (1000 * 60);

                      // Calculate position based on slot height (40px) and gap (8px)
                      const slotHeight = 48; // height of each time slot
                      const gapHeight = 2; // gap between slots
                      const totalHeight = slotHeight + gapHeight;

                      // Calculate final position
                      if (now > dayEnd!) {
                        const slotsCount = Math.ceil(totalMinutesSinceStart / settings.slotDuration);
                        return (slotsCount - 1) * totalHeight + slotHeight / 2;
                      }
                    })()}px`,
                    transform: 'translateY(-50%)',
                  }}
                >
                  <div className="absolute -left-1 -top-1 w-2 h-2 bg-red-500 rounded-full" />
                  <div className="absolute -left-11 top-1/2 -translate-y-1/2 text-red-500 text-sm font-medium">
                    {format(currentTime, 'HH:mm')}
                  </div>
                </div>
              )}
              {timeSlots.map((timeSlot) => {
                const isBooked = isTimeSlotBooked(timeSlot);
                const appointment = getAppointmentForTimeSlot(timeSlot);
                const isPast = isBefore(
                  parse(timeSlot, 'h:mm a', selectedDate),
                  new Date()
                );

                const isOwnAppointment = isClient && appointment?.clientId === 'self';

                return (
                  <div key={timeSlot} className='relative flex justify-end items-start gap-x-2' style={{ marginTop: '2px' }}>
                    <div className={cn(isBooked ? "bg-[#e42627]/20 text-[#e42627] line-through" : 'text-black', 'absolute left-0 top-0 whitespace-nowrap text-[14px] ')}>{timeSlot}</div>
                    <div
                      className={cn(
                        "p-2 rounded text-sm flex justify-end items-center w-full max-w-[calc(100%-72px)] h-[48px]",
                        isBooked
                          ? "bg-[#e42627]/20 text-[#e42627]"
                          : isPast
                            ? "bg-gray-500/10 text-gray-300"
                            : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 cursor-pointer"
                      )}
                      onClick={() => {
                        if (isBooked && !isPast && appointment) {
                          if (!isClient || (isClient && isOwnAppointment)) {
                            handleDeleteAppointment(appointment);
                          }
                        } else if (!isBooked && !isPast) {
                          setSelectedTimeSlot(timeSlot);
                          setIsCreateDialogOpen(true);
                        }
                      }}

                    >

                      <div className="flex items-center gap-2">
                        {appointment && !isPast && (
                          <>
                            <span className="text-xs text-white">
                              {appointment.client?.name || 'No client name'}
                              {appointment.duration > 60 && ` (${appointment.duration}min)`}
                            </span>
                            {(!isClient || (isClient && isOwnAppointment)) && (
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
                                      handleDeleteAppointment(appointment);
                                    }}
                                  >
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </>
                        )}
                        {!isBooked && !isPast && (
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
                {!isClient && (
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
                )}
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
                  <Select
                    value={duration.toString()}
                    onValueChange={(value) => setDuration(Number(value))}
                    disabled={availableDurations.length === 0}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a2e] border-white/20">
                      {availableDurations.map(d => (
                        <SelectItem key={d} value={d.toString()} className="text-white hover:bg-white/10">
                          {d} мин
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {availableDurations.length === 0 && (
                    <div className="text-red-500 text-xs mt-1">Нет доступных длительностей для этого времени</div>
                  )}
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

          <CancelDialog
            isOpen={isCancellationDialogOpen}
            onOpenChange={setIsCancellationDialogOpen}
            onCancel={handleCancelAppointment}
          />
        </>
      )}
    </div>
  );
} 