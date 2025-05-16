'use client';

import { useState, useEffect } from 'react';
import { Clock, Users, DollarSign } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
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
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    totalClients: 0,
    monthlyRevenue: 0
  });

  useEffect(() => {
    fetchAppointments();
    fetchStats();
  }, []);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/appointments');
      if (!response.ok) throw new Error('Failed to fetch appointments');
      const data = await response.json();
      // Transform dates from strings to Date objects
      const transformedData = data.map((apt: ApiAppointment) => ({
        ...apt,
        date: new Date(apt.date)
      }));
      setAppointments(transformedData);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Upcoming Appointments */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                Upcoming Appointments
              </p>
              <h3 className="text-3xl font-bold mt-1">{stats.upcomingAppointments}</h3>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Total Clients */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                Total Clients
              </p>
              <h3 className="text-3xl font-bold mt-1">{stats.totalClients}</h3>
            </div>
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                Monthly Revenue
              </p>
              <h3 className="text-3xl font-bold mt-1">${stats.monthlyRevenue}</h3>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
              <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
    </DashboardLayout>
  );
} 