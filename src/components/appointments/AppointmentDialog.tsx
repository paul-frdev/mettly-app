import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Client } from '@/types/client';

interface AppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: Client[];
  isClient: boolean;
  selectedClientId: string;
  onClientChange: (clientId: string) => void;
  eventDescription: string;
  onDescriptionChange: (description: string) => void;
  eventDuration: number;
  onDurationChange: (duration: number) => void;
  availableDurations: number[];
  onSubmit: () => void;
  onCancel: () => void;
  onDelete: () => void;
  timeLabel: string;
  dateLabel: string;
}

export function AppointmentDialog({
  open,
  onOpenChange,
  clients,
  isClient,
  selectedClientId,
  onClientChange,
  eventDescription,
  onDescriptionChange,
  eventDuration,
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Appointment</DialogTitle>
          <DialogDescription>
            {dateLabel} at {timeLabel}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {!isClient && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="client" className="text-right">
                Client
              </Label>
              <Select
                value={selectedClientId}
                onValueChange={onClientChange}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={eventDescription}
              onChange={(e) => onDescriptionChange(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="duration" className="text-right">
              Duration
            </Label>
            <Select
              value={eventDuration.toString()}
              onValueChange={(value) => onDurationChange(Number(value))}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {availableDurations.map((duration) => (
                  <SelectItem key={duration} value={duration.toString()}>
                    {duration} minutes
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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