"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface Client {
  id: string;
  name: string;
}

interface AppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients?: Client[];
  isClient?: boolean;
  selectedClientId?: string;
  onClientChange?: (id: string) => void;
  notes: string;
  onNotesChange: (val: string) => void;
  duration: number;
  onDurationChange: (val: number) => void;
  availableDurations: number[];
  onSubmit: () => void;
  onCancel: () => void;
  onDelete: () => void;
  timeLabel?: string;
  dateLabel?: string;
}

export function AppointmentDialog({
  open,
  onOpenChange,
  clients = [],
  isClient = false,
  selectedClientId,
  onClientChange,
  notes,
  onNotesChange,
  duration,
  onDurationChange,
  availableDurations,
  onSubmit,
  onCancel,
  onDelete,
  timeLabel,
  dateLabel,
}: AppointmentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a1a2e] border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Create New Appointment</DialogTitle>
          <DialogDescription className="text-gray-300">
            {timeLabel && dateLabel
              ? `Create a new appointment for ${timeLabel} on ${dateLabel}`
              : 'Create a new appointment'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {!isClient && (
            <div className="space-y-2">
              <Label htmlFor="client" className="text-white">Select Client</Label>
              <Select value={selectedClientId} onValueChange={onClientChange}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a2e] border-white/20">
                  {clients.map((client) => (
                    <SelectItem
                      key={client.id}
                      value={client.id}
                      className="text-white hover:bg-white/10"
                    >
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-white">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              className="bg-white/10 border-white/20 text-white resize-none"
              placeholder="Add any notes about the appointment"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration" className="text-white">Duration</Label>
            <Select
              value={duration.toString()}
              onValueChange={(value) => onDurationChange(Number(value))}
              disabled={availableDurations.length === 0}
            >
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a2e] border-white/20">
                {availableDurations.map(d => (
                  <SelectItem key={d} value={d.toString()} className="text-white hover:bg-white/10">
                    {d} мин
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {availableDurations.length === 0 && (
              <div className="text-red-500 text-xs mt-1">Нет доступных длительностей для этого времени</div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button variant="destructive" onClick={onDelete}>Delete</Button>
          <Button onClick={onSubmit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 