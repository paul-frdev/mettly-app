'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showError, showSuccess } from '@/lib/utils/notifications';
import { Calendar } from '@/components/ui/calendar';
import { Switch } from '@/components/ui/switch';
import { triggerSettingsUpdate } from '@/hooks/useBusinessSettings';

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

export function BusinessSettings() {
  const [settings, setSettings] = useState<BusinessSettings>({
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    workingHours: {
      Monday: { enabled: true, start: '09:00', end: '18:00' },
      Tuesday: { enabled: true, start: '09:00', end: '18:00' },
      Wednesday: { enabled: true, start: '09:00', end: '18:00' },
      Thursday: { enabled: true, start: '09:00', end: '18:00' },
      Friday: { enabled: true, start: '09:00', end: '18:00' },
      Saturday: { enabled: false, start: '09:00', end: '18:00' },
      Sunday: { enabled: false, start: '09:00', end: '18:00' }
    },
    slotDuration: 30,
    holidays: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [timezones, setTimezones] = useState<string[]>([]);

  const daysOfWeek = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ];

  useEffect(() => {
    // Get list of all timezones
    setTimezones(Intl.supportedValuesOf('timeZone'));

    // Fetch current settings
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
        holidays: (data.holidays || []).map((date: string) => new Date(date))
      };

      setSettings(processedData);
    } catch (error) {
      console.error('Error fetching business settings:', error);
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Validate settings before sending
      if (!settings.timezone) {
        throw new Error('Timezone is required');
      }

      // Check if at least one day is enabled
      const hasEnabledDay = Object.values(settings.workingHours).some(day => day.enabled);
      if (!hasEnabledDay) {
        throw new Error('At least one working day must be enabled');
      }

      if (!settings.slotDuration || settings.slotDuration <= 0) {
        throw new Error('Valid slot duration is required');
      }

      const response = await fetch('/api/settings/business', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...settings,
          // Ensure dates are in ISO format
          holidays: settings.holidays.map(date => date.toISOString())
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to save settings');
      }

      showSuccess('Business settings saved successfully');

      // Trigger settings update for all components
      triggerSettingsUpdate();
    } catch (error) {
      console.error('Error saving business settings:', error);
      showError(error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateDaySchedule = (day: string, field: keyof DaySchedule, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day],
          [field]: value
        }
      }
    }));
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Business Hours</CardTitle>
          <CardDescription>
            Set your working hours for each day of the week
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {daysOfWeek.map((day) => (
            <div key={day} className="flex items-center space-x-4">
              <Switch
                checked={settings.workingHours[day].enabled}
                onCheckedChange={(checked) => updateDaySchedule(day, 'enabled', checked)}
              />
              <div className="flex-1 grid grid-cols-3 gap-4 items-center">
                <span className="text-sm font-medium">{day}</span>
                <div className="space-y-2">
                  <Input
                    type="time"
                    value={settings.workingHours[day].start}
                    onChange={(e) => updateDaySchedule(day, 'start', e.target.value)}
                    disabled={!settings.workingHours[day].enabled}
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="time"
                    value={settings.workingHours[day].end}
                    onChange={(e) => updateDaySchedule(day, 'end', e.target.value)}
                    disabled={!settings.workingHours[day].enabled}
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="space-y-2 pt-4">
            <Label>Appointment Duration</Label>
            <Select
              value={settings.slotDuration.toString()}
              onValueChange={(value) => setSettings({ ...settings, slotDuration: parseInt(value) })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Time Zone</CardTitle>
          <CardDescription>
            Set your business timezone for accurate scheduling
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={settings.timezone}
            onValueChange={(value) => setSettings({ ...settings, timezone: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              {timezones.map((timezone) => (
                <SelectItem key={timezone} value={timezone}>
                  {timezone}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Holidays & Time Off</CardTitle>
          <CardDescription>
            Select dates when you&apos;re not available
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="multiple"
            selected={settings.holidays}
            onSelect={(dates) => setSettings({ ...settings, holidays: dates || [] })}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      <Button
        className="w-full"
        onClick={handleSave}
        disabled={isSaving}
      >
        {isSaving ? 'Saving...' : 'Save Settings'}
      </Button>
    </div>
  );
} 