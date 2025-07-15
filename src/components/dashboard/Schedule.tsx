'use client';

import { format, isBefore, parse } from 'date-fns';
import { AppointmentDialog } from '../dialogs/AppointmentDialog';
import { Appointment } from '@/types/appointment';
import { useSchedule } from '@/hooks/useSchedule';
import { ScheduleHeader } from './ScheduleHeader';
import { TimeSlot } from './TimeSlot';

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
  isClient = false,
  selectedDate: propSelectedDate,
  onDateChange,
}: ScheduleProps) {
  const {
    settings,
    isHoliday,
    selectedDate,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    editingAppointment,
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
    handleEditAppointment,
    handleUpdateAppointment,
    isTimeSlotBooked,
    getAppointmentForTimeSlot,
    availableDurations,
  } = useSchedule({
    appointments,
    onAppointmentCreated,
    onAppointmentCancelled,
    isClient,
    selectedDate: propSelectedDate,
    onDateChange,
  });

  const handleDeleteAppointment = (appointment: Appointment) => {
    onAppointmentCancelled(appointment);
  };

  const handleCreateAppointmentClick = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot);
    setIsCreateDialogOpen(true);
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
          <ScheduleHeader
            selectedDate={selectedDate}
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
            onDateSelect={handleDateSelect}
            onPreviousDay={handlePreviousDay}
            onNextDay={handleNextDay}
          />

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

                      const totalMinutesSinceStart = (now.getTime() - dayStart.getTime()) / (1000 * 60);
                      const totalMinutesInDay = (dayEnd.getTime() - dayStart.getTime()) / (1000 * 60);

                      const slotHeight = 48;
                      const gapHeight = 2;
                      const totalHeight = slotHeight + gapHeight;
                      const slotsCount = Math.ceil(totalMinutesInDay / settings.slotDuration);
                      const maxHeight = (slotsCount - 1) * totalHeight + slotHeight / 2;

                      if (now > dayEnd) return maxHeight;
                      if (now < dayStart) return 0;

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
                const appointment = getAppointmentForTimeSlot(timeSlot);
                return (
                  <TimeSlot
                    key={timeSlot}
                    timeSlot={timeSlot}
                    appointment={appointment}
                    isBooked={isTimeSlotBooked(timeSlot)}
                    isPast={isBefore(parse(timeSlot, 'h:mm a', selectedDate), new Date())}
                    isClient={isClient}
                    currentClientId={currentClientId}
                    onDeleteAppointment={handleDeleteAppointment}
                    onEditAppointment={handleEditAppointment}
                    onCreateAppointment={handleCreateAppointmentClick}
                  />
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
            isEditing={false}
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

          <AppointmentDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
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
            onSubmit={handleUpdateAppointment}
            onCancel={() => setIsEditDialogOpen(false)}
            onDelete={() => editingAppointment && handleDeleteAppointment(editingAppointment)}
            timeLabel={selectedTimeSlot}
            dateLabel={format(selectedDate, 'PPP')}
            isEditing={true}
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
