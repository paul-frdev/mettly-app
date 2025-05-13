export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Appointment {
  id: string;
  clientId: string;
  date: Date | string;
  duration: number; // in minutes
  notes?: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  isPaid: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Payment {
  id: string;
  appointmentId: string;
  amount: number;
  date: Date | string;
  method: 'cash' | 'card' | 'transfer';
  notes?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  settings: UserSettings;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface UserSettings {
  notificationsEnabled: boolean;
  notificationMethod: 'email' | 'telegram' | 'both';
  telegramId?: string;
  reminderTime: number; // minutes before appointment
  currency: string;
  timeZone: string;
  subscriptionTier: 'free' | 'premium';
}
