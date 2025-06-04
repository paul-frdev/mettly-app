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

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { showSuccess, showError } from '@/lib/utils/notifications';
import { useSession } from 'next-auth/react';

interface Client {
  id: string;
  name: string;
}

interface Appointment {
  id: string;
  date: Date;
  duration: number;
  client: Client;
  status: string;
  notes?: string;
  cancelledAt?: Date;
  cancellationReason?: string;
  attendance?: {
    status: 'confirmed' | 'declined' | null;
  };
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
  appointments?: Appointment[];
}

export function AppointmentForm(props: AppointmentFormProps) {
  console.log('AppointmentForm props', props);
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const router = useRouter();
  const { data: session } = useSession();
  const [clientId, setClientId] = useState<string | null>(null);

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema(!!props.isClient)),
    defaultValues: {
      duration: 30,
      notes: '',
    },
  });

  useEffect(() => {
    async function fetchClients() {
      if (props.isClient) {
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

    if (props.isOpen) {
      fetchClients();
    }
  }, [props.isOpen, props.isClient]);

  useEffect(() => {
    async function fetchClientId() {
      if (props.isClient && session?.user?.email) {
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

    if (props.isOpen && props.isClient) {
      fetchClientId();
    }
  }, [props.isOpen, props.isClient, session?.user?.email]);

  function getAvailableDurations() {
    const MIN = 30;
    const MAX = 180;
    const step = 15;
    let maxDuration = MAX;
    const start = props.selectedTime;
    const sorted = (props.appointments ?? [])
      .filter(a => a.status !== 'cancelled')
      .map(a => ({
        start: new Date(a.date),
        end: new Date(new Date(a.date).getTime() + a.duration * 60000)
      }))
      .filter(a => a.start > start)
      .sort((a, b) => a.start.getTime() - b.start.getTime());
    if (sorted.length > 0) {
      const next = sorted[0].start;
      maxDuration = Math.floor((next.getTime() - start.getTime()) / 60000);
      if (maxDuration > MAX) maxDuration = MAX;
    }
    if (maxDuration < MIN) maxDuration = 0;
    const durations = [];
    for (let d = MIN; d <= maxDuration; d += step) {
      durations.push(d);
    }
    console.log('selectedTime', props.selectedTime);
    console.log('appointments', props.appointments);
    console.log('availableDurations', durations);
    return durations;
  }
  const availableDurations = getAvailableDurations();

  console.log('availableDurations', availableDurations);

  if (props.selectedTime) {
    console.log('selectedTime for form', props.selectedTime);
  }

  async function onSubmit(data: AppointmentFormData) {
    setIsLoading(true);
    try {
      const requestBody = {
        ...data,
        date: props.selectedTime.toISOString(),
        clientId: props.isClient ? clientId : data.clientId,
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
      props.onClose();
      if (props.onSuccess) {
        props.onSuccess();
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
    <Dialog open={props.isOpen} onOpenChange={props.onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Appointment</DialogTitle>
          <DialogDescription>
            {format(props.selectedTime, 'MMMM d, yyyy')} at {format(props.selectedTime, 'h:mm a')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!props.isClient && (
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
              render={({ field: { value, onChange } }) => (
                <FormItem>
                  <FormLabel>Duration (minutes)</FormLabel>
                  <FormControl>
                    <Select
                      value={value.toString()}
                      onValueChange={v => onChange(Number(v))}
                      disabled={availableDurations.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableDurations.map(d => (
                          <SelectItem key={d} value={d.toString()}>{d} min</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  {availableDurations.length === 0 && (
                    <div className="text-red-500 text-xs mt-1">No available durations for this slot</div>
                  )}
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