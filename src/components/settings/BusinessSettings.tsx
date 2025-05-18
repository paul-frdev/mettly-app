'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showError, showSuccess } from '@/lib/utils/notifications';
import { Calendar } from '@/components/ui/calendar';

interface BusinessSettings {
  timezone: string;
  workingHours: {
    start: string;
    end: string;
  };
  workingDays: string[];
  slotDuration: number;
  holidays: Date[];
}

export function BusinessSettings() {
  const [settings, setSettings] = useState<BusinessSettings>({
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    workingHours: {
      start: '09:00',
      end: '18:00'
    },
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
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
      if (!settings.workingHours?.start || !settings.workingHours?.end) {
        throw new Error('Working hours are required');
      }
      if (!settings.workingDays?.length) {
        throw new Error('At least one working day must be selected');
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

      // Refresh settings after save
      await fetchSettings();
    } catch (error) {
      console.error('Error saving business settings:', error);
      showError(error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleWorkingDay = (day: string) => {
    setSettings(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day]
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
            Set your regular business hours and working days
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={settings.workingHours.start}
                onChange={(e) => setSettings({
                  ...settings,
                  workingHours: { ...settings.workingHours, start: e.target.value }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={settings.workingHours.end}
                onChange={(e) => setSettings({
                  ...settings,
                  workingHours: { ...settings.workingHours, end: e.target.value }
                })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Working Days</Label>
            <div className="grid grid-cols-7 gap-2">
              {daysOfWeek.map((day) => (
                <Button
                  key={day}
                  type="button"
                  variant={settings.workingDays.includes(day) ? "default" : "outline"}
                  className="w-full"
                  onClick={() => toggleWorkingDay(day)}
                >
                  {day.slice(0, 3)}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
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