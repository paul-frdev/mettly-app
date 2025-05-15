'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';

export default function CalendarPage() {
  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Calendar</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <p className="text-gray-500 dark:text-gray-400">Calendar view coming soon...</p>
        </div>
      </div>
    </DashboardLayout>
  );
} 