'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

export default function ClientSettings() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState({
    telegramRemindersEnabled: true,
    reminderTimeHours: 2,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings/client');
        const data = await res.json();
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
      const res = await fetch('/api/settings/client', {
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

  const handleUpdateReminderTime = async (hours: number) => {
    try {
      const res = await fetch('/api/settings/client', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reminderTimeHours: hours,
        }),
      });

      if (!res.ok) throw new Error('Failed to update settings');

      setSettings({ ...settings, reminderTimeHours: hours });
      toast.success('Settings updated');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    }
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

        {/* Reminder Time */}
        <div className="p-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900">
              Reminder Time
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              How many hours before the appointment should you receive a reminder?
            </p>
          </div>
          <div className="mt-4">
            <select
              value={settings.reminderTimeHours}
              onChange={(e) => handleUpdateReminderTime(Number(e.target.value))}
              className="block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value={1}>1 hour before</option>
              <option value={2}>2 hours before</option>
              <option value={3}>3 hours before</option>
              <option value={6}>6 hours before</option>
              <option value={12}>12 hours before</option>
              <option value={24}>1 day before</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
} 