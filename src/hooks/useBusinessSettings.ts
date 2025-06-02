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

interface BusinessSettings {
  timezone: string;
  workingHours: {
    [key: string]: DaySchedule;
  };
  slotDuration: number;
  holidays: Date[];
}

export function useBusinessSettings() {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings/business');
      if (response.ok) {
        const data = await response.json();
        if (!data || !data.workingHours) {
          console.error('Invalid business settings data:', data);
          return;
        }
        setSettings(data);
      } else {
        console.error('Failed to fetch business settings:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch business settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleSettingsUpdate = () => {
      setIsLoading(true);
      fetchSettings();
    };

    // Initial fetch
    fetchSettings();

    // Listen for settings updates
    window.addEventListener(SETTINGS_UPDATED_EVENT, handleSettingsUpdate);

    return () => {
      window.removeEventListener(SETTINGS_UPDATED_EVENT, handleSettingsUpdate);
    };
  }, []);

  const isWorkingDay = (date: Date): boolean => {
    if (!settings?.workingHours) return false;
    const dayName = format(date, 'EEEE');
    return settings.workingHours[dayName]?.enabled || false;
  };

  const isHoliday = (date: Date): boolean => {
    if (!settings?.holidays) return false;
    return settings.holidays.some((holiday) => isSameDay(holiday, date));
  };

  const getSlotDuration = (): number => {
    return settings?.slotDuration || 0;
  };

  const getTimezonedDate = (date: Date): Date => {
    if (!settings?.timezone) return date;
    // Convert date to the business timezone
    return new Date(date.toLocaleString('en-US', { timeZone: settings.timezone }));
  };

  return {
    settings,
    isLoading,
    isWorkingDay,
    isHoliday,
    getSlotDuration,
    getTimezonedDate,
  };
}

export function triggerSettingsUpdate() {
  window.dispatchEvent(new Event(SETTINGS_UPDATED_EVENT));
}
