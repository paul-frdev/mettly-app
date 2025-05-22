'use client';

import { useState, useEffect } from 'react';
import { format, isSameDay } from 'date-fns';

// Custom event for settings updates
const SETTINGS_UPDATED_EVENT = 'businessSettingsUpdated';

interface DaySchedule {
  enabled: boolean;
  start: string;
  end: string;
}

interface WorkingHours {
  [key: string]: DaySchedule;
}

interface BusinessSettings {
  timezone: string;
  workingHours: WorkingHours;
  slotDuration: number;
  holidays: Date[];
}

export function useBusinessSettings() {
  const [settings, setSettings] = useState<BusinessSettings>({
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    workingHours: {
      Monday: { enabled: true, start: '09:00', end: '18:00' },
      Tuesday: { enabled: true, start: '09:00', end: '18:00' },
      Wednesday: { enabled: true, start: '09:00', end: '18:00' },
      Thursday: { enabled: true, start: '09:00', end: '18:00' },
      Friday: { enabled: true, start: '09:00', end: '18:00' },
      Saturday: { enabled: false, start: '09:00', end: '18:00' },
      Sunday: { enabled: false, start: '09:00', end: '18:00' },
    },
    slotDuration: 30,
    holidays: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    console.log('Setting up settings update listener');
    fetchSettings();

    // Subscribe to settings updates
    const handleSettingsUpdate = () => {
      console.log('Settings update event received');
      fetchSettings();
    };

    window.addEventListener(SETTINGS_UPDATED_EVENT, handleSettingsUpdate);

    return () => {
      console.log('Cleaning up settings update listener');
      window.removeEventListener(SETTINGS_UPDATED_EVENT, handleSettingsUpdate);
    };
  }, []);

  const fetchSettings = async () => {
    try {
      console.log('Fetching business settings...');
      const response = await fetch('/api/settings/user');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to fetch settings');
      }

      // Convert holidays from string to Date objects
      const processedData = {
        ...data,
        holidays: (data.holidays || []).map((date: string) => new Date(date)),
      };

      console.log('Received settings:', processedData);
      setSettings(processedData);
      setError(null);
    } catch (err) {
      console.error('Error fetching business settings:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const isWorkingDay = (date: Date): boolean => {
    const dayName = format(date, 'EEEE');
    return settings.workingHours[dayName]?.enabled || false;
  };

  const isHoliday = (date: Date): boolean => {
    return settings.holidays.some((holiday) => isSameDay(holiday, date));
  };

  const getWorkingHours = (date: Date): { start: string; end: string } | null => {
    if (!isWorkingDay(date) || isHoliday(date)) {
      return null;
    }
    const dayName = format(date, 'EEEE');
    const daySchedule = settings.workingHours[dayName];
    return {
      start: daySchedule.start,
      end: daySchedule.end,
    };
  };

  const getSlotDuration = (): number => {
    return settings.slotDuration;
  };

  const isWithinWorkingHours = (date: Date): boolean => {
    const workingHours = getWorkingHours(date);
    if (!workingHours) return false;

    const timeString = format(date, 'HH:mm');
    const startTime = workingHours.start;
    const endTime = workingHours.end;

    return timeString >= startTime && timeString < endTime;
  };

  const getTimezonedDate = (date: Date): Date => {
    // Convert date to the business timezone
    return new Date(date.toLocaleString('en-US', { timeZone: settings.timezone }));
  };

  return {
    settings,
    isLoading,
    error,
    isWorkingDay,
    isHoliday,
    getWorkingHours,
    getSlotDuration,
    isWithinWorkingHours,
    getTimezonedDate,
    refreshSettings: fetchSettings,
  };
}

// Export function to trigger settings update
export function triggerSettingsUpdate() {
  window.dispatchEvent(new Event(SETTINGS_UPDATED_EVENT));
}
