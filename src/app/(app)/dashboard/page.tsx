'use client';

import { useState, useEffect } from 'react';
import { Clock, Users, DollarSign } from 'lucide-react';
import { DaySchedule } from '@/components/dashboard/DaySchedule';
import { ClientInfo } from '@/components/dashboard/ClientInfo';
import { showError } from '@/lib/utils/notifications';

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
}

interface ApiAppointment {
  id: string;
  date: string;
  duration: number;
  client: Client;
  status: string;
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

export default function DashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/appointments');
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }
      const data = await response.json();
      const transformedAppointments: Appointment[] = data.map((apt: ApiAppointment) => ({
        ...apt,
        date: new Date(apt.date)
      }));
      setAppointments(transformedAppointments);
    } catch (error) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Upcoming Appointments */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Upcoming</p>
              <h3 className="text-2xl font-bold">{appointments.length}</h3>
            </div>
            <div className="p-3 bg-blue-100 rounded-full dark:bg-blue-900">
              <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Total Clients */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Clients</p>
              <h3 className="text-2xl font-bold">24</h3>
            </div>
            <div className="p-3 bg-green-100 rounded-full dark:bg-green-900">
              <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenue</p>
              <h3 className="text-2xl font-bold">$2,850</h3>
            </div>
            <div className="p-3 bg-purple-100 rounded-full dark:bg-purple-900">
              <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Information Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Information about the client</h2>
          <ClientInfo
            appointments={appointments}
            onAppointmentUpdate={fetchAppointments}
          />
        </div>

        {/* Day Schedule Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Ability to change day</h2>
          <DaySchedule
            appointments={appointments}
            onAppointmentUpdate={fetchAppointments}
          />
        </div>
      </div>
    </>
  );
} 