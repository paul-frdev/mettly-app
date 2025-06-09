export type AppointmentStatus = 'confirmed' | 'pending' | 'cancelled';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: AppointmentStatus;
  trainerId: string;
  clientId?: string;
  description?: string;
  duration?: number;
}

export interface CalendarView {
  type: 'month' | 'week' | 'day';
  date: Date;
}

export interface CalendarFilters {
  trainerId?: string;
  clientId?: string;
  status?: AppointmentStatus[];
  startDate?: Date;
  endDate?: Date;
}
