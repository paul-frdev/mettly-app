import { useState } from 'react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MoreVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { showError, showPromise } from '@/lib/utils/notifications';

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
}

interface Appointment {
  id: string;
  date: Date;
  duration: number;
  client: Client;
  status: string;
  notes?: string;
}

interface ClientInfoProps {
  appointments: Appointment[];
  onAppointmentUpdate?: () => void;
}

export function ClientInfo({ appointments, onAppointmentUpdate }: ClientInfoProps) {
  const [expandedAppointments, setExpandedAppointments] = useState<Set<string>>(new Set());

  const toggleAppointment = (appointmentId: string) => {
    setExpandedAppointments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(appointmentId)) {
        newSet.delete(appointmentId);
      } else {
        newSet.add(appointmentId);
      }
      return newSet;
    });
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

  // Get today's appointments
  const todayAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    const today = new Date();
    return (
      appointmentDate.getDate() === today.getDate() &&
      appointmentDate.getMonth() === today.getMonth() &&
      appointmentDate.getFullYear() === today.getFullYear()
    );
  });

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-4">
        {todayAppointments.length > 0 ? (
          todayAppointments
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map((appointment) => {
              const isExpanded = expandedAppointments.has(appointment.id);
              const appointmentDate = new Date(appointment.date);
              const endTime = new Date(appointmentDate.getTime() + appointment.duration * 60000);

              return (
                <Card
                  key={appointment.id}
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div
                    className="flex justify-between items-start"
                    onClick={() => toggleAppointment(appointment.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">
                          {appointment.client?.name || 'No client name'}
                        </h3>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {format(appointmentDate, 'HH:mm')}
                        {' - '}
                        {format(endTime, 'HH:mm')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${appointment.status === 'scheduled'
                          ? 'bg-yellow-100 text-yellow-800'
                          : appointment.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                          }`}
                      >
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
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
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 space-y-4 text-sm text-gray-600 border-t pt-4">
                      {/* Appointment Details */}
                      <div>
                        <h4 className="font-medium text-gray-900">Appointment Details</h4>
                        <div className="mt-2 space-y-2">
                          <p>
                            <span className="font-medium">Duration:</span> {appointment.duration} minutes
                          </p>
                          {appointment.notes && (
                            <p>
                              <span className="font-medium">Appointment Notes:</span> {appointment.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Client Details */}
                      {appointment.client && (
                        <div>
                          <h4 className="font-medium text-gray-900">Client Details</h4>
                          <div className="mt-2 space-y-2">
                            {appointment.client.email && (
                              <p>
                                <span className="font-medium">Email:</span> {appointment.client.email}
                              </p>
                            )}
                            {appointment.client.phone && (
                              <p>
                                <span className="font-medium">Phone:</span> {appointment.client.phone}
                              </p>
                            )}
                            {appointment.client.notes && (
                              <p>
                                <span className="font-medium">Client Notes:</span> {appointment.client.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })
        ) : (
          <div className="text-center py-8 text-gray-500">
            No appointments for today
          </div>
        )}
      </div>
    </ScrollArea>
  );
} 