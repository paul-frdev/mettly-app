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
  maxAvailableDuration: number;
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
  maxAvailableDuration,
  onSubmit,
  onCancel,
  timeLabel,
  dateLabel,
}: AppointmentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#2d2e48] border border-[#35365a] shadow-2xl rounded-xl text-white px-8 py-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">Create New Appointment</DialogTitle>
          <DialogDescription className="text-base text-[#b0b3c6]">
            {dateLabel} at {timeLabel}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 py-4">
          {!isClient && (
            <div>
              <Label htmlFor="client" className="text-[#b0b3c6] mb-1 block">Select Client</Label>
              <Select value={selectedClientId} onValueChange={onClientChange}>
                <SelectTrigger className="bg-[#23243a] border border-[#35365a] text-white focus:ring-2 focus:ring-[#10b981]">
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent className="bg-[#23243a] border-[#35365a] text-white">
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id} className="hover:bg-[#10b981]/10">
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <Label htmlFor="description" className="text-[#b0b3c6] mb-1 block">Notes</Label>
            <Textarea
              id="description"
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              className="bg-[#23243a] border border-[#35365a] text-white focus:ring-2 focus:ring-[#10b981] resize-none"
              rows={3}
              placeholder="Add any notes about the appointment"
            />
          </div>
          <div>
            <Label htmlFor="duration" className="text-[#b0b3c6] mb-1 block">Duration</Label>
            <Select
              value={duration.toString()}
              onValueChange={(value) => onDurationChange(Number(value))}
            >
              <SelectTrigger className="bg-[#23243a] border border-[#35365a] text-white focus:ring-2 focus:ring-[#10b981]">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent className="bg-[#23243a] border-[#35365a] text-white">
                {availableDurations.map((d) => (
                  <SelectItem key={d} value={d.toString()} disabled={d > maxAvailableDuration}>
                    {d} мин
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onCancel} className="border border-[#35365a] text-[#b0b3c6] hover:bg-[#23243a]/80 hover:text-white">Cancel</Button>
          <Button onClick={onSubmit} className="bg-[#10b981] text-white hover:bg-[#0e9e6e]">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 