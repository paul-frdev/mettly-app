'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

type DaySchedule = {
  enabled: boolean;
  start: string;
  end: string;
};

type WorkingHours = {
  [key in 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday']: DaySchedule;
};

export default function Settings() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState({
    telegramRemindersEnabled: false,
    reminderTimeHours: 2,
    refCode: '',
    timezone: 'UTC',
    workingHours: {
      Monday: { enabled: true, start: '09:00', end: '17:00' },
      Tuesday: { enabled: true, start: '09:00', end: '17:00' },
      Wednesday: { enabled: true, start: '09:00', end: '17:00' },
      Thursday: { enabled: true, start: '09:00', end: '17:00' },
      Friday: { enabled: true, start: '09:00', end: '17:00' },
      Saturday: { enabled: false, start: '10:00', end: '15:00' },
      Sunday: { enabled: false, start: '10:00', end: '15:00' }
    } as WorkingHours,
    slotDuration: 30,
    holidays: [] as string[]
  });
  const [loading, setLoading] = useState(true);

  const daysOfWeek = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ] as const;

  type DayOfWeek = typeof daysOfWeek[number];

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        console.log('Fetching user settings...');
        const res = await fetch('/api/settings/user');
        if (!res.ok) {
          throw new Error('Failed to fetch settings');
        }
        const data = await res.json();
        console.log('Received settings:', data);
        setSettings(data);
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchSettings();
    }
  }, [session]);

  const handleToggleReminders = async () => {
    try {
      const newValue = !settings.telegramRemindersEnabled;
      const res = await fetch('/api/settings/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramRemindersEnabled: newValue,
        }),
      });

      if (!res.ok) throw new Error('Failed to update settings');

      setSettings({ ...settings, telegramRemindersEnabled: newValue });
      toast.success('Settings updated');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    }
  };

  const handleUpdateWorkingHours = async (day: string, start: string, end: string, enabled: boolean) => {
    try {
      const newWorkingHours = {
        ...settings.workingHours,
        [day]: { start, end, enabled },
      };

      const res = await fetch('/api/settings/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workingHours: newWorkingHours,
        }),
      });

      if (!res.ok) throw new Error('Failed to update settings');

      setSettings({ ...settings, workingHours: newWorkingHours });
      toast.success('Working hours updated');
    } catch (error) {
      console.error('Error updating working hours:', error);
      toast.error('Failed to update working hours');
    }
  };

  const handleUpdateTimezone = async (timezone: string) => {
    try {
      const res = await fetch('/api/settings/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timezone,
        }),
      });

      if (!res.ok) throw new Error('Failed to update settings');

      setSettings({ ...settings, timezone });
      toast.success('Timezone updated');
    } catch (error) {
      console.error('Error updating timezone:', error);
      toast.error('Failed to update timezone');
    }
  };

  const handleUpdateSlotDuration = async (duration: number) => {
    try {
      const res = await fetch('/api/settings/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotDuration: duration,
        }),
      });

      if (!res.ok) throw new Error('Failed to update settings');

      setSettings({ ...settings, slotDuration: duration });
      toast.success('Slot duration updated');
    } catch (error) {
      console.error('Error updating slot duration:', error);
      toast.error('Failed to update slot duration');
    }
  };

  const handleAddHoliday = async (date: string) => {
    try {
      const newHolidays = [...settings.holidays, date];
      const res = await fetch('/api/settings/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          holidays: newHolidays,
        }),
      });

      if (!res.ok) throw new Error('Failed to update settings');

      setSettings({ ...settings, holidays: newHolidays });
      toast.success('Holiday added');
    } catch (error) {
      console.error('Error adding holiday:', error);
      toast.error('Failed to add holiday');
    }
  };

  const handleRemoveHoliday = async (date: string) => {
    try {
      const newHolidays = settings.holidays.filter((d) => d !== date);
      const res = await fetch('/api/settings/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          holidays: newHolidays,
        }),
      });

      if (!res.ok) throw new Error('Failed to update settings');

      setSettings({ ...settings, holidays: newHolidays });
      toast.success('Holiday removed');
    } catch (error) {
      console.error('Error removing holiday:', error);
      toast.error('Failed to remove holiday');
    }
  };

  const handleCopyRefCode = () => {
    navigator.clipboard.writeText(settings.refCode);
    toast.success('Trainer code copied to clipboard', {
      description: 'Share this code with your clients'
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">Settings</h1>

      <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
        {/* Telegram Reminders */}
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                Telegram Reminders
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Enable or disable appointment reminders via Telegram
              </p>
            </div>
            <button
              type="button"
              className={`${settings.telegramRemindersEnabled
                ? 'bg-indigo-600'
                : 'bg-gray-200'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
              onClick={handleToggleReminders}
            >
              <span
                className={`${settings.telegramRemindersEnabled
                  ? 'translate-x-5'
                  : 'translate-x-0'
                  } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </button>
          </div>
        </div>

        {/* Referral Code */}
        <div className="p-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900">
              Your Referral Code
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Share this code with your clients to let them register and book
              appointments with you
            </p>
          </div>
          <div className="mt-4 flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative rounded-md shadow-sm">
                <input
                  type="text"
                  readOnly
                  value={settings.refCode || 'Loading...'}
                  className="block w-full rounded-md border-gray-300 pr-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleCopyRefCode}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Copy Invite Link
            </button>
          </div>
          {!settings.refCode && (
            <p className="mt-2 text-sm text-red-500">
              No referral code found. Please contact support if this persists.
            </p>
          )}
        </div>

        {/* Working Hours */}
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Working Hours
          </h2>
          <div className="space-y-4">
            {daysOfWeek.map((day: DayOfWeek) => (
              <div key={day} className="flex items-center space-x-4">
                <div className="w-32">
                  <label className="block text-sm font-medium text-gray-700">
                    {day}
                  </label>
                </div>
                <div className="flex-1 grid grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => {
                        const newEnabled = !settings.workingHours[day].enabled;
                        handleUpdateWorkingHours(day, settings.workingHours[day].start, settings.workingHours[day].end, newEnabled);
                      }}
                      className={`${settings.workingHours[day].enabled
                        ? 'bg-indigo-600'
                        : 'bg-gray-200'
                        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                    >
                      <span
                        className={`${settings.workingHours[day].enabled
                          ? 'translate-x-5'
                          : 'translate-x-0'
                          } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                      />
                    </button>
                  </div>
                  <div>
                    <input
                      type="time"
                      value={settings.workingHours[day].start}
                      onChange={(e) =>
                        handleUpdateWorkingHours(day, e.target.value, settings.workingHours[day].end, settings.workingHours[day].enabled)
                      }
                      disabled={!settings.workingHours[day].enabled}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-400"
                    />
                  </div>
                  <div>
                    <input
                      type="time"
                      value={settings.workingHours[day].end}
                      onChange={(e) =>
                        handleUpdateWorkingHours(day, settings.workingHours[day].start, e.target.value, settings.workingHours[day].enabled)
                      }
                      disabled={!settings.workingHours[day].enabled}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-400"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timezone */}
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Timezone</h2>
          <div className="max-w-xs">
            <select
              value={settings.timezone}
              onChange={(e) => handleUpdateTimezone(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
            </select>
          </div>
        </div>

        {/* Slot Duration */}
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Appointment Duration
          </h2>
          <div className="max-w-xs">
            <select
              value={settings.slotDuration}
              onChange={(e) => handleUpdateSlotDuration(Number(e.target.value))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
            </select>
          </div>
        </div>

        {/* Holidays */}
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Holidays</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <input
                  type="date"
                  onChange={(e) => handleAddHoliday(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
            <div className="mt-4">
              <ul className="divide-y divide-gray-200">
                {(settings.holidays || []).map((date) => (
                  <li
                    key={date}
                    className="py-3 flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-900">
                      {new Date(date).toLocaleDateString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveHoliday(date)}
                      className="text-sm text-red-600 hover:text-red-900"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 