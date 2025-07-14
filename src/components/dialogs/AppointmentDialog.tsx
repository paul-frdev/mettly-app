"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,

} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { showError } from "@/lib/utils/notifications";

interface Client {
  id: string;
  name: string;
}

interface AppointmentDialogProps {
  open: boolean;
  clients?: Client[];
  isClient?: boolean;
  selectedClientId?: string;
  selectedClients?: string[];
  notes: string;
  duration: number;
  availableDurations: number[];
  maxAvailableDuration: number;
  manualTime?: string | null;
  showTimeSelect?: boolean;
  workingHours?: { start: string; end: string };
  timeLabel?: string;
  dateLabel?: string;
  isEditing?: boolean; // Whether we're editing an existing appointment or creating a new one
  appointmentType: "individual" | "group";
  groupCapacity: number;
  isPaid: boolean;
  price: number;
  onOpenChange: (open: boolean) => void;
  onClientChange?: (id: string) => void;
  onSelectedClientsChange?: (ids: string[]) => void;
  onNotesChange: (val: string) => void;
  onDurationChange: (val: number) => void;
  onAppointmentTypeChange: (type: "individual" | "group") => void;
  onGroupCapacityChange: (capacity: number) => void;
  onIsPaidChange: (isPaid: boolean) => void;
  onPriceChange: (price: number) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onManualTimeChange?: (val: string) => void;
}

export function AppointmentDialog({
  open,
  onOpenChange,
  clients = [],
  isClient = false,
  selectedClientId,
  selectedClients = [],
  onClientChange,
  onSelectedClientsChange,
  notes,
  onNotesChange,
  duration,
  onDurationChange,
  availableDurations,
  maxAvailableDuration,
  onSubmit,
  onCancel,
  manualTime,
  onManualTimeChange,
  showTimeSelect = false,
  workingHours,
  isEditing = false,
  appointmentType,
  groupCapacity,
  isPaid,
  price,
  onAppointmentTypeChange,
  onGroupCapacityChange,
  onIsPaidChange,
  onPriceChange,
}: AppointmentDialogProps) {

  // Check if form is valid
  const isFormValid = () => {
    if (appointmentType === 'group') {
      return selectedClients && selectedClients.length > 0;
    }
    return true; // For individual appointments, validation is handled elsewhere
  };
  const timeOptions: string[] = (() => {
    if (showTimeSelect && workingHours) {
      const [startHour, startMinute] = workingHours.start.split(":").map(Number);
      const [endHour, endMinute] = workingHours.end.split(":").map(Number);
      let d = new Date();
      d.setHours(startHour, startMinute, 0, 0);
      const end = new Date();
      end.setHours(endHour, endMinute, 0, 0);
      const arr: string[] = [];
      while (d <= end) {
        arr.push(d.toTimeString().slice(0, 5));
        d = new Date(d.getTime() + 15 * 60000);
      }
      return arr;
    }
    return [];
  })();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-md w-full p-0 rounded-xl border-none shadow-2xl bg-white animate-in fade-in-0 zoom-in-95",
          "data-[state=open]:animate-in data-[state=closed]:animate-out"
        )}
      >
        <DialogHeader className="bg-yellow-50 rounded-t-xl flex items-center px-6 h-12 border-b border-gray-100 py-3">
          <DialogTitle className="font-semibold text-gray-700 text-lg">
            {isEditing ? "Edit" : "Create"}
          </DialogTitle>
        </DialogHeader>
        <form
          className="px-6 pt-4 pb-6 space-y-4"
          onSubmit={e => {
            e.preventDefault();

            // Validate group appointment has at least one client selected
            if (appointmentType === 'group' && (!selectedClients || selectedClients.length === 0)) {
              showError('Please select at least one client for group session');
              return;
            }

            onSubmit();
          }}
        >
          <div>
            <label className="block text-xs text-gray-500 mb-1">Name</label>
            <input
              className="w-full border border-gray-200 rounded px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white"
              value={notes}
              onChange={e => onNotesChange(e.target.value)}
              placeholder="Event name or notes"
            />
          </div>
          {showTimeSelect && workingHours && (
            <div>
              <label className="block text-xs text-gray-500 mb-1">Time</label>
              <Select value={manualTime || ""} onValueChange={onManualTimeChange}>
                <SelectTrigger className="w-full border border-gray-200 rounded px-3 py-2 text-gray-800 bg-white">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map(t => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Duration</label>
            <Select
              value={duration.toString()}
              onValueChange={val => onDurationChange(Number(val))}
            >
              <SelectTrigger className="w-full border border-gray-200 rounded px-3 py-2 text-gray-800 bg-white">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {availableDurations.map(d => (
                  <SelectItem key={d} value={d.toString()} disabled={d > maxAvailableDuration}>
                    {d > 60
                      ? `${Math.floor(d / 60)}h ${d % 60 > 0 ? `${d % 60}min` : ''}`
                      : `${d}min`
                    }
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {!isClient && (
            <>
              <div className="flex items-center space-x-2">
                <Switch
                  id="appointment-type"
                  checked={appointmentType === 'group'}
                  onCheckedChange={(checked) => onAppointmentTypeChange(checked ? 'group' : 'individual')}
                />
                <Label htmlFor="appointment-type">Group Session</Label>
              </div>

              {appointmentType === 'group' && (
                <div>
                  <Label htmlFor="capacity" className="block text-xs text-gray-500 mb-1">Group Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="2"
                    max="50"
                    value={groupCapacity || ''}
                    onChange={(e) => onGroupCapacityChange(Number(e.target.value) || 0)}
                    className="w-full border border-gray-200 rounded px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white"
                  />
                </div>
              )}

              {appointmentType === 'individual' ? (
                <div>
                  <Label className="block text-xs text-gray-500 mb-1">Client</Label>
                  <Select
                    value={selectedClientId}
                    onValueChange={onClientChange}
                  >
                    <SelectTrigger className="w-full border border-gray-200 rounded px-3 py-2 text-gray-800 bg-white">
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div>
                  <Label className="block text-xs text-gray-500 mb-1">Clients</Label>
                  <MultiSelect
                    options={clients.map(c => ({ label: c.name, value: c.id }))}
                    onValueChange={onSelectedClientsChange!}
                    defaultValue={selectedClients}
                    placeholder="Select clients"
                    maxCount={groupCapacity}
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch id="payment-toggle" checked={isPaid} onCheckedChange={onIsPaidChange} />
                <Label htmlFor="payment-toggle">Paid Session</Label>
              </div>

              {isPaid && (
                <div>
                  <Label htmlFor="price" className="block text-xs text-gray-500 mb-1">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    value={price || ''}
                    onChange={(e) => onPriceChange(Number(e.target.value) || 0)}
                    className="w-full border border-gray-200 rounded px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white"
                    placeholder="Enter price"
                  />
                </div>
              )}
            </>
          )}
          <DialogFooter className="flex gap-2 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              className="bg-gray-100 text-gray-500 hover:bg-gray-200"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={!isFormValid()}
            >
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
