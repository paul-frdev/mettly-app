import { z } from 'zod';

export const clientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  notes: z.string().optional(),
});

export type ClientFormData = z.infer<typeof clientSchema>;

export const clientValidationErrors = {
  DUPLICATE_EMAIL: 'A client with this email already exists',
  DUPLICATE_PHONE: 'A client with this phone number already exists',
} as const;
