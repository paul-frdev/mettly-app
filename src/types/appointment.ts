/**
 * Client interface representing a client/user in the system
 */
export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
}

/**
 * Represents the attendance status of an appointment
 */
export type AppointmentStatus = 'confirmed' | 'declined' | null;

/**
 * Main Appointment interface used throughout the application
 */
export interface Appointment {
  id: string;
  date: Date;
  duration: number; // in minutes
  client?: Client; // Optional client reference
  clientId?: string; // Alternative to client object, just the ID
  clientIds?: string[]; // For group appointments
  status: string;
  notes?: string;
  description?: string;
  type?: 'individual' | 'group'; // Type of appointment
  isPaid?: boolean; // Whether the appointment is paid
  price?: number; // Price for the appointment
  maxClients?: number; // Maximum clients for group appointments
  cancelledAt?: Date;
  cancellationReason?: string;
  cancelledById?: string; // ID of the user who cancelled the appointment
  attendance?: {
    status: AppointmentStatus;
  };
}

/**
 * API representation of an appointment (used for API responses)
 */
export interface ApiAppointment extends Omit<Appointment, 'date' | 'cancelledAt'> {
  date: string; // ISO date string
  cancelledAt?: string; // ISO date string
  // Note: cancelledById is inherited from Appointment
}

/**
 * DTO for creating/updating appointments
 */
export interface AppointmentDto {
  clientId: string;
  date: Date | string;
  duration: number;
  notes?: string;
  description?: string;
}
