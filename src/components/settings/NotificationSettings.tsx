'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface NotificationSettings {
  emailEnabled: boolean;
  browserEnabled: boolean;
  reminderTime: string;
}

export function NotificationSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<NotificationSettings>({
    emailEnabled: true,
    browserEnabled: true,
    reminderTime: '30',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSettingChange = async (
    key: keyof NotificationSettings,
    value: boolean | string
  ) => {
    const previousSettings = { ...settings };
    const newSettings = { ...settings, [key]: value };

    // Optimistically update the UI
    setSettings(newSettings);
    setIsLoading(true);

    try {
      const response = await fetch('/api/settings/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSettings),
      });

      if (!response.ok) {
        throw new Error('Failed to save notification settings');
      }

      toast({
        title: "Settings updated",
        description: "Your notification preferences have been saved.",
      });
    } catch {
      // Revert changes if save fails
      setSettings(previousSettings);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save notification settings. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBrowserNotifications = async (enabled: boolean) => {
    if (enabled) {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          handleSettingChange('browserEnabled', true);
        } else {
          toast({
            variant: "destructive",
            title: "Permission denied",
            description: "Please enable notifications in your browser settings to receive alerts.",
          });
        }
      } catch {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Your browser doesn't support notifications.",
        });
      }
    } else {
      handleSettingChange('browserEnabled', false);
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings/notifications');
        if (!response.ok) {
          throw new Error('Failed to fetch notification settings');
        }
        const data = await response.json();
        if (data) {
          setSettings(data);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load notification settings",
        });
      }
    };

    fetchSettings();
  }, [toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Settings
        </CardTitle>
        <CardDescription>
          Configure how and when you want to receive notifications about your appointments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive appointment reminders via email
              </p>
            </div>
            <Switch
              checked={settings.emailEnabled}
              onCheckedChange={(checked: boolean) => handleSettingChange('emailEnabled', checked)}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Browser Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive push notifications in your browser
              </p>
            </div>
            <Switch
              checked={settings.browserEnabled}
              onCheckedChange={handleBrowserNotifications}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Reminder Time</Label>
          <Select
            value={settings.reminderTime}
            onValueChange={(value) => handleSettingChange('reminderTime', value)}
            disabled={isLoading}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select reminder time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 minutes before</SelectItem>
              <SelectItem value="30">30 minutes before</SelectItem>
              <SelectItem value="60">1 hour before</SelectItem>
              <SelectItem value="120">2 hours before</SelectItem>
              <SelectItem value="1440">1 day before</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            How long before the appointment should we send you a reminder
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 