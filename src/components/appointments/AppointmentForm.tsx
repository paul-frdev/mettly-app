'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { showSuccess, showError } from '@/lib/utils/notifications';
import { useSession } from 'next-auth/react';

interface Client {
  id: string;
  name: string;
}

const appointmentSchema = (isClient: boolean) => z.object({
  clientId: isClient ? z.string().optional() : z.string({ required_error: "Please select a client" }),
  duration: z.number().min(30, 'Duration must be at least 30 minutes'),
  notes: z.string().optional(),
});

type AppointmentFormData = z.infer<ReturnType<typeof appointmentSchema>>;

interface AppointmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTime: Date;
  onSuccess?: () => void;
  isClient?: boolean;
}

export function AppointmentForm({ isOpen, onClose, selectedTime, onSuccess, isClient }: AppointmentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const router = useRouter();
  const { data: session } = useSession();
  const [clientId, setClientId] = useState<string | null>(null);

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema(!!isClient)),
    defaultValues: {
      duration: 30,
      notes: '',
    },
  });

  useEffect(() => {
    async function fetchClients() {
      if (isClient) {
        // Для клиента не нужно загружать список клиентов
        return;
      }

      try {
        const response = await fetch('/api/clients');
        if (!response.ok) {
          throw new Error('Failed to fetch clients');
        }
        const data = await response.json();
        setClients(data);
      } catch (error) {
        console.error(error)
        showError('Failed to load clients');
      }
    }

    if (isOpen) {
      fetchClients();
    }
  }, [isOpen, isClient]);

  useEffect(() => {
    async function fetchClientId() {
      if (isClient && session?.user?.email) {
        try {
          const response = await fetch(`/api/clients/by-email?email=${session.user.email}`);
          if (!response.ok) {
            throw new Error('Failed to fetch client ID');
          }
          const data = await response.json();
          setClientId(data.id);
        } catch (error) {
          console.error(error);
          showError('Failed to load client information');
        }
      }
    }

    if (isOpen && isClient) {
      fetchClientId();
    }
  }, [isOpen, isClient, session?.user?.email]);

  async function onSubmit(data: AppointmentFormData) {
    setIsLoading(true);
    try {
      const requestBody = {
        ...data,
        date: selectedTime.toISOString(),
        clientId: isClient ? clientId : data.clientId,
      };

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Failed to create appointment');
      }

      const responseData = await response.json();
      console.log('Success response:', responseData);

      showSuccess('Appointment created successfully');
      form.reset();
      onClose();
      if (onSuccess) {
        onSuccess();
      }
      router.refresh();
    } catch (error) {
      console.error('Error creating appointment:', error);
      showError(error instanceof Error ? error.message : 'Failed to create appointment');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Appointment</DialogTitle>
          <DialogDescription>
            {format(selectedTime, 'MMMM d, yyyy')} at {format(selectedTime, 'h:mm a')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!isClient && (
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a client" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="duration"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Duration (minutes)</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => onChange(Math.max(30, value - 30))}
                      >
                        -
                      </Button>
                      <Input
                        type="number"
                        min={30}
                        step={30}
                        className="w-20 text-center"
                        {...field}
                        value={value}
                        onChange={(e) => onChange(parseInt(e.target.value, 10))}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => onChange(value + 30)}
                      >
                        +
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add any notes about the appointment" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Appointment'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 