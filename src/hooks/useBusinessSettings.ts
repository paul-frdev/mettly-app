'use client';

import { useState, useEffect } from 'react';
import { format, isSameDay } from 'date-fns';

interface BusinessHours {
  start: string;
  end: string;
}

interface BusinessSettings {
  timezone: string;
  workingHours: BusinessHours;
  workingDays: string[];
  slotDuration: number;
  holidays: Date[];
}

export function useBusinessSettings() {
  const [settings, setSettings] = useState<BusinessSettings>({
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    workingHours: {
      start: '09:00',
      end: '18:00',
    },
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    slotDuration: 30,
    holidays: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings/business');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to fetch settings');
      }

      // Convert holidays from string to Date objects
      const processedData = {
        ...data,
        holidays: (data.holidays || []).map((date: string) => new Date(date)),
      };

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
    return settings.workingDays.includes(dayName);
  };

  const isHoliday = (date: Date): boolean => {
    return settings.holidays.some((holiday) => isSameDay(holiday, date));
  };

  const getWorkingHours = (date: Date): BusinessHours | null => {
    if (!isWorkingDay(date) || isHoliday(date)) {
      return null;
    }
    return settings.workingHours;
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
