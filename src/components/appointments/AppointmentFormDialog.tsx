'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { showSuccess, showError } from '@/lib/utils/notifications';

interface AppointmentFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  onAppointmentCreated: () => void;
}

export function AppointmentFormDialog({
  isOpen,
  onClose,
  selectedDate,
  onAppointmentCreated
}: AppointmentFormDialogProps) {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: selectedDate,
          notes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create appointment');
      }

      showSuccess('Appointment created successfully');
      onAppointmentCreated();
      onClose();
    } catch (error) {
      console.error('Error creating appointment:', error);
      showError('Failed to create appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Appointment</DialogTitle>
          <DialogDescription>
            Schedule an appointment for {format(selectedDate, 'EEEE, MMMM d, yyyy')} at{' '}
            {format(selectedDate, 'HH:mm')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes or special requirements..."
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Scheduling...' : 'Schedule'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 