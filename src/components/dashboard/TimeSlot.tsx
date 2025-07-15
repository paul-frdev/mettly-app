'use client';

// No date-fns imports needed in this component
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { stringToColor, getContrastTextColor } from '@/lib/utils/colors';
import { Appointment } from '@/types/appointment';

interface TimeSlotProps {
  timeSlot: string;
  appointment: Appointment | undefined;
  isBooked: boolean;
  isPast: boolean;
  isClient: boolean;
  currentClientId: string | null;
  onDeleteAppointment: (appointment: Appointment) => void;
  onEditAppointment: (appointment: Appointment) => void;
  onCreateAppointment: (timeSlot: string) => void;
}

// Helper function to format time with leading zeros
const formatTimeWithLeadingZero = (timeStr: string) => {
  const [time, period] = timeStr.split(' ');
  const [hours, minutes] = time.split(':');

  // Format hours and minutes to have leading zeros
  const formattedHours = hours.padStart(2, '0');
  const formattedMinutes = minutes.padStart(2, '0');

  return `${formattedHours}:${formattedMinutes} ${period}`;
};

export function TimeSlot({
  timeSlot,
  appointment,
  isBooked,
  isPast,
  isClient,
  currentClientId,
  onDeleteAppointment,
  onEditAppointment,
  onCreateAppointment,
}: TimeSlotProps) {
  const isOwnAppointment = isClient && appointment && (
    appointment.clientId === currentClientId ||
    appointment.clientId === 'self'
  ); const canInteract = !isPast && (!isClient || (isClient && isOwnAppointment));

  const handleSlotClick = () => {
    if (isBooked && canInteract && appointment) {
      onDeleteAppointment(appointment);
    } else if (!isBooked && !isPast) {
      onCreateAppointment(timeSlot);
    }
  };

  return (
    <div className='relative flex justify-end items-start gap-x-2' style={{ marginTop: '2px' }}>
      <div className={cn(isBooked ? " text-[#e42627] line-through" : 'text-slate-500', 'absolute left-0 -top-2 whitespace-nowrap text-[14px] ')}>
        {formatTimeWithLeadingZero(timeSlot)}
      </div>
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
        onClick={handleSlotClick}
      >
        <div className="flex items-center gap-2">
          {appointment && !isPast ? (
            <>
              {(!isClient || isOwnAppointment) ? (
                <>
                  <span className="text-sm text-black">
                    {/* Отображаем описание записи */}
                    {appointment.notes || (appointment.client?.name || 'No description')}

                    {/* Показываем информацию о типе записи */}
                    {appointment.type === 'group' && (() => {
                      const groupSize = appointment.clientIds?.length || appointment.clients?.length || 0;
                      return groupSize > 0 ? ` (Группа: ${groupSize} чел.)` : '';
                    })()}

                    {/* Показываем длительность */}
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
                        onClick={() => onEditAppointment(appointment)}
                        className="text-white hover:bg-white/10 cursor-pointer"
                      >
                        Edit time
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-400 hover:bg-red-500/20 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteAppointment(appointment);
                        }}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <span className="text-sm text-black opacity-50">
                  Booked
                </span>
              )}
            </>
          ) : !isBooked && !isPast ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-black hover:bg-white/10"
              onClick={(e) => {
                e.stopPropagation();
                onCreateAppointment(timeSlot);
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
