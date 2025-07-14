'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { format, addDays, subDays, startOfDay, isBefore, isEqual, parse, isSameDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { stringToColor, getContrastTextColor } from '@/lib/utils/colors';
import { ChevronLeft, ChevronRight, CalendarIcon, MoreVertical, Plus } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';
import { showError, showInfo, showSuccess } from '@/lib/utils/notifications';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import { AppointmentDialog } from '../dialogs/AppointmentDialog';
import { Client } from '@/types/appointment';

interface Appointment {
  id: string;
  date: Date | string;
  end?: Date | string;
  clientId?: string | null;
  client?: Client | null;
  status: string;
  duration?: number;
  notes?: string | null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
}

interface ScheduleProps {
  appointments: Appointment[];
  onAppointmentCreated: () => void;
  onAppointmentCancelled: (appointment: Appointment) => void;
  isClient?: boolean;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  triggerCalendarUpdate?: () => void;
}

export function Schedule({
  appointments,
  onAppointmentCreated,
  onAppointmentCancelled,
  isClient,
  selectedDate: propSelectedDate,
  onDateChange,
}: ScheduleProps) {
  const { settings, isHoliday } = useBusinessSettings();
  const { triggerCalendarUpdate: calendarUpdate } = useCalendarSync();

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

  let dayEnd: Date | null = null;
  let endHour = 23, endMinute = 59;

  if (settings) {
    dayEnd = new Date(selectedDate);
    [endHour, endMinute] = settings.workingHours[format(selectedDate, 'EEEE')]?.end.split(':').map(Number) || [23, 59];
    dayEnd.setHours(endHour, endMinute, 0, 0);
  }

  // Sync with parent component's selected date
  useEffect(() => {
    if (propSelectedDate && !isSameDay(propSelectedDate, selectedDate)) {
      setSelectedDate(propSelectedDate);
    }
  }, [propSelectedDate]);

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

  const [currentMonth, setCurrentMonth] = useState<Date>(selectedDate);

  // Update current month when selected date changes
  useEffect(() => {
    setCurrentMonth(selectedDate);
  }, [selectedDate]);

  const handlePreviousDay = () => {
    const newDate = subDays(selectedDate, 1);
    if (!isBefore(startOfDay(newDate), startOfDay(new Date())) ||
      isEqual(startOfDay(newDate), startOfDay(new Date()))) {
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

  const timeSlots = generateTimeSlots();

  // Get the current user's client ID from the session
  const { data: session } = useSession();
  const [currentClientId, setCurrentClientId] = useState<string | null>(null);

  // Set the client ID from the session
  useEffect(() => {
    console.log('Setting client ID from session:', session?.user);

    if (session?.user) {
      // Get client ID from different possible locations in the session
      const clientId =
        (session.user as { clientId?: string })?.clientId ||  // Try clientId on user
        (session.user as { id?: string })?.id ||       // Fall back to user id
        session.user?.email;               // Last resort: use email as identifier

      console.log('Derived client ID:', clientId);

      // Fetch the actual client ID from the database
      const fetchClientId = async () => {
        try {
          const response = await fetch('/api/clients/by-email?email=' + encodeURIComponent(session.user.email || ''));
          if (response.ok) {
            const data = await response.json();
            console.log('Client data from API:', data);
            if (data && data.id) {
              console.log('Setting client ID from API:', data.id);
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
  }, [session]);

  const filteredAppointments = useMemo(() => {

    return appointments.filter((apt) => {
      if (!apt || !apt.date) {
        return false;
      }

      try {
        // Note: We no longer filter out appointments for clients
        // The useAppointments hook now returns the calendar data which already includes
        // all appointments (including busy slots) for clients

        const appointmentDate = new Date(apt.date);
        if (isNaN(appointmentDate.getTime())) {
          showError('Skipping appointment with invalid date');
          console.error('Invalid appointment:', apt);
          return false;
        }

        const isSameDay = format(appointmentDate, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');

        return isSameDay;
      } catch (error) {
        showError(`Error processing appointment`);
        console.error('Appointment error:', { apt, error });
        return false;
      }
    });
  }, [appointments, currentClientId, isClient, selectedDate, session?.user]);


  // Function to handle editing an appointment
  const handleEditAppointment = (appointment: Appointment) => {
    // TODO: Implement edit functionality
    console.log('Edit appointment:', appointment.id);
  };

  const handleDeleteAppointment = (appointment: Appointment) => {
    onAppointmentCancelled(appointment);
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = responseData?.message || 'Failed to create appointment';
        throw new Error(errorMessage);
      }

      // Save the current date before triggering the update
      const currentSelectedDate = new Date(selectedDate);

      // Reset form state
      setIsCreateDialogOpen(false);
      setNotes('');
      setSelectedClientId('');
      setDuration(60);
      setSelectedTimeSlot('');

      // Call the callback to refresh appointments
      if (onAppointmentCreated) {
        onAppointmentCreated();
      }

      if (calendarUpdate) {
        calendarUpdate();
      }

      // Show success message
      showSuccess('Appointment created successfully');

      // Restore the selected date after the update
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

    return filteredAppointments.some(appointment => {
      // Skip cancelled appointments
      if (appointment.status === 'cancelled') {
        return false;
      }

      const appointmentStart = new Date(appointment.date);
      const appointmentEnd = new Date(appointmentStart.getTime() + appointment.duration! * 60000);

      // Convert all times to timestamps for comparison
      const slotStartTime = slotTime.getTime();
      const slotEndTimeMs = slotEndTime.getTime();
      const appointmentStartTime = appointmentStart.getTime();
      const appointmentEndTime = appointmentEnd.getTime();

      // Check for overlap
      return (
        (slotStartTime >= appointmentStartTime && slotStartTime < appointmentEndTime) || // Slot starts during appointment
        (slotEndTimeMs > appointmentStartTime && slotEndTimeMs <= appointmentEndTime) || // Slot ends during appointment
        (slotStartTime <= appointmentStartTime && slotEndTimeMs >= appointmentEndTime) // Slot completely contains appointment
      );
    });
  };

  const getAppointmentForTimeSlot = (timeSlot: string) => {
    const slotTime = parse(timeSlot, 'h:mm a', selectedDate);
    const slotEndTime = new Date(slotTime.getTime() + (settings?.slotDuration || 30) * 60000);

    return filteredAppointments.find(appointment => {
      if (appointment.status === 'cancelled') return false;

      const appointmentStart = new Date(appointment.date);
      const appointmentEnd = new Date(appointmentStart.getTime() + appointment.duration! * 60000);

      // Проверка на пересечение слота и встречи
      return (
        (slotTime >= appointmentStart && slotTime < appointmentEnd) ||
        (slotEndTime > appointmentStart && slotEndTime <= appointmentEnd) ||
        (slotTime <= appointmentStart && slotEndTime >= appointmentEnd)
      );
    });
  };

  // Standard duration options
  const standardDurations = [30, 45, 60, 90, 120];

  function getAvailableDurationsForTimeSlot(timeSlot: string) {
    // Найти дату и время начала выбранного слота
    const start = parse(timeSlot, 'h:mm a', selectedDate);

    // Отфильтровать все записи на этот день, которые начинаются после выбранного времени
    const sorted = filteredAppointments
      .filter(a => a.status !== 'cancelled')
      .map(a => ({
        start: new Date(a.date),
        end: new Date(new Date(a.date).getTime() + a.duration! * 60000)
      }))
      .filter(a => a.start > start)
      .sort((a, b) => a.start.getTime() - b.start.getTime());

    if (sorted.length === 0) {
      // If there are no appointments after this time slot, return all standard durations
      return standardDurations;
    }

    // Calculate maximum available duration in minutes
    const next = sorted[0].start;
    const maxDuration = Math.floor((next.getTime() - start.getTime()) / 60000);

    // Filter standard durations to only include those that fit before the next appointment
    return standardDurations.filter(duration => duration <= maxDuration);
  }

  const availableDurations = selectedTimeSlot
    ? getAvailableDurationsForTimeSlot(selectedTimeSlot)
    : standardDurations;

  // Helper function to format time with leading zeros
  const formatTimeWithLeadingZero = (timeStr: string) => {
    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split(':');

    // Format hours and minutes to have leading zeros
    const formattedHours = hours.padStart(2, '0');
    const formattedMinutes = minutes.padStart(2, '0');

    return `${formattedHours}:${formattedMinutes} ${period}`;
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
              className="bg-black/70 border-white/20 text-white hover:bg-black/20"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-[260px] justify-start text-left font-normal',
                    !selectedDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, 'PPP')} • {format(selectedDate, 'EEEE')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  month={currentMonth}
                  onMonthChange={setCurrentMonth}
                  onSelect={handleDateSelect}
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
                  className="absolute left-12 right-0 h-0.5 bg-red-500 z-10"
                  style={{
                    top: `${(() => {
                      if (!settings) return 0;
                      const now = currentTime;
                      const dayStart = new Date(selectedDate);
                      const [startHour, startMinute] = settings.workingHours[format(selectedDate, 'EEEE')]?.start.split(':').map(Number) || [0, 0];
                      const [endHour, endMinute] = settings.workingHours[format(selectedDate, 'EEEE')]?.end.split(':').map(Number) || [23, 59];
                      dayStart.setHours(startHour, startMinute, 0, 0);
                      const dayEnd = new Date(selectedDate);
                      dayEnd.setHours(endHour, endMinute, 0, 0);

                      // Calculate total minutes since start of day
                      const totalMinutesSinceStart = (now.getTime() - dayStart.getTime()) / (1000 * 60);
                      const totalMinutesInDay = (dayEnd.getTime() - dayStart.getTime()) / (1000 * 60);

                      // Calculate position based on slot height (40px) and gap (8px)
                      const slotHeight = 48; // height of each time slot
                      const gapHeight = 2; // gap between slots
                      const totalHeight = slotHeight + gapHeight;
                      const slotsCount = Math.ceil(totalMinutesInDay / settings.slotDuration);
                      const maxHeight = (slotsCount - 1) * totalHeight + slotHeight / 2;

                      if (now > dayEnd) {
                        return maxHeight;
                      }
                      if (now < dayStart) {
                        return 0;
                      }

                      // Основной расчёт:
                      const slotIndex = Math.floor(totalMinutesSinceStart / settings.slotDuration);
                      const minutesInCurrentSlot = totalMinutesSinceStart % settings.slotDuration;
                      const positionInSlot = minutesInCurrentSlot / settings.slotDuration;
                      return (slotIndex * totalHeight) + (positionInSlot * slotHeight);
                    })()}px`,
                    transform: 'translateY(-50%)',
                  }}
                >
                  <div className="absolute -left-1 -top-1 w-2 h-2 bg-red-500 rounded-full" />
                  <div className="absolute -left-12 top-1/2 -translate-y-1/2 text-red-500 text-sm font-medium">
                    {format(currentTime, 'H:mm')}
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

                // Check if this appointment belongs to the current client
                // Add debugging to see the values
                console.log('Appointment clientId:', appointment?.clientId);
                console.log('Current clientId:', currentClientId);

                // Consider appointments with clientId "self" as the client's own appointments
                // Also check for direct match between appointment clientId and current clientId
                const isOwnAppointment = isClient && (
                  appointment?.clientId === currentClientId ||
                  appointment?.clientId === 'self'
                );

                return (
                  <div key={timeSlot} className='relative flex justify-end items-start gap-x-2' style={{ marginTop: '2px' }}>
                    <div className={cn(isBooked ? " text-[#e42627] line-through" : 'text-slate-500', 'absolute left-0 -top-2 whitespace-nowrap text-[14px] ')}>{formatTimeWithLeadingZero(timeSlot)}</div>
                    <div
                      className={cn(
                        "p-2 rounded text-sm flex justify-end items-center w-full max-w-[calc(100%-72px)] h-[48px]",
                        isBooked
                          ? "" // Remove default background color for booked slots
                          : isPast
                            ? "bg-gray-500/10 text-gray-300"
                            : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 cursor-pointer"
                      )}
                      style={isBooked && appointment?.clientId ? {
                        backgroundColor: `${stringToColor(appointment.clientId)}33`, // Add transparency
                        color: getContrastTextColor(stringToColor(appointment.clientId)),
                        borderLeft: `4px solid ${stringToColor(appointment.clientId)}`,
                      } : {}}
                      onClick={() => {
                        if (isBooked && !isPast && appointment) {
                          // Only allow deletion of own appointments
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
                            {/* For clients, only show details of their own appointments */}
                            {(!isClient || (isClient && isOwnAppointment)) ? (
                              // Show full details for own appointments or for trainers
                              <>
                                <span className="text-sm text-black">
                                  {appointment.notes || (appointment.client?.name || 'No description')}
                                  {appointment.duration! > 60 && ` (${Math.floor(appointment.duration! / 60)}h ${appointment.duration! % 60 > 0 ? `${appointment.duration! % 60}min` : ''})`}
                                  {appointment.duration! <= 60 && appointment.duration! > 0 && ` (${appointment.duration}min)`}
                                </span>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-black">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="bg-[#1a1a2e] border-white/20">
                                    <DropdownMenuItem
                                      onClick={() => handleEditAppointment(appointment)}
                                      className="text-white hover:bg-white/10 cursor-pointer"
                                    >
                                      Edit time
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-red-400 hover:bg-red-500/20 cursor-pointer"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteAppointment(appointment);
                                      }}
                                    >
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </>
                            ) : (
                              // For other clients' appointments, only show that the slot is booked without details
                              <span className="text-sm text-black opacity-50">
                                Booked
                              </span>
                            )}
                          </>
                        )}
                        {!isBooked && !isPast && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-black hover:bg-white/10"
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

          <AppointmentDialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
            clients={clients}
            isClient={isClient}
            selectedClientId={selectedClientId}
            onClientChange={setSelectedClientId}
            notes={notes}
            onNotesChange={setNotes}
            duration={duration}
            onDurationChange={setDuration}
            availableDurations={availableDurations}
            maxAvailableDuration={availableDurations.length > 0 ? Math.max(...availableDurations) : 120}
            onSubmit={handleCreateAppointment}
            onCancel={() => setIsCreateDialogOpen(false)}
            onDelete={() => { }}
            timeLabel={selectedTimeSlot}
            dateLabel={format(selectedDate, 'PPP')}
            isEditing={false} // This is always for creating new appointments
            appointmentType={appointmentType}
            onAppointmentTypeChange={setAppointmentType}
            selectedClients={selectedClients}
            onSelectedClientsChange={setSelectedClients}
            groupCapacity={groupCapacity}
            onGroupCapacityChange={setGroupCapacity}
            isPaid={isPaid}
            onIsPaidChange={setIsPaid}
            price={price}
            onPriceChange={setPrice}
          />
        </>
      )}
    </div>
  );
}
