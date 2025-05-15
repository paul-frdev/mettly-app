'use client';

import { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, User } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface Appointment {
  id: string;
  date: Date;
  clientId: string | null;
  client?: {
    name: string;
  };
  duration: number | null;
  notes: string | null;
  status: string;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/appointments');
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Appointments</h1>
          <Link
            href="/appointments/create"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Appointment
          </Link>
        </div>

        <div className="grid gap-4">
          {appointments.map((appointment) => (
            <Link
              key={appointment.id}
              href={`/appointments/${appointment.id}`}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(appointment.date), 'PPP')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <Clock className="w-4 h-4" />
                    <span>{format(new Date(appointment.date), 'p')}</span>
                  </div>
                  {appointment.client && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <User className="w-4 h-4" />
                      <span>{appointment.client.name}</span>
                    </div>
                  )}
                  {appointment.notes && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      {appointment.notes}
                    </p>
                  )}
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-sm ${appointment.status === 'scheduled'
                    ? 'bg-yellow-100 text-yellow-800'
                    : appointment.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                    }`}
                >
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </span>
              </div>
            </Link>
          ))}

          {appointments.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No appointments found</p>
              <Link
                href="/appointments/create"
                className="text-blue-500 hover:text-blue-600 mt-2 inline-block"
              >
                Create your first appointment
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 