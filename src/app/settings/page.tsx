'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Settings</h1>
      </div>

      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>
        <TabsContent value="notifications" className="space-y-4">
          <NotificationSettings />
        </TabsContent>
        <TabsContent value="account">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6">
              <p className="text-gray-500 dark:text-gray-400">Account settings coming soon...</p>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="appearance">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6">
              <p className="text-gray-500 dark:text-gray-400">Appearance settings coming soon...</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
} 