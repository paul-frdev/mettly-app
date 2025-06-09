import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface CancelDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: (reason: string) => void;
}

export function CancelDialog({ isOpen, onOpenChange, onCancel }: CancelDialogProps) {
  const [reason, setReason] = useState('');

  const handleCancel = () => {
    if (reason.trim()) {
      onCancel(reason);
      setReason('');
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setReason('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#2d2e48] border border-[#35365a] shadow-2xl rounded-xl text-white px-8 py-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-red-400 flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-red-400" />
            Cancel Appointment
          </DialogTitle>
          <DialogDescription className="text-base text-[#b0b3c6]">
            Please provide a reason for cancelling this appointment.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter cancellation reason..."
            className="bg-[#35365a] border border-[#46477a] text-white focus:ring-2 focus:ring-[#e42627] resize-none"
            rows={3}
          />
        </div>
        <DialogFooter className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={handleClose} className="border border-[#35365a] text-[#b0b3c6] hover:bg-[#23243a]/80">Close</Button>
          <Button
            onClick={handleCancel}
            className="bg-[#e42627] text-white hover:bg-[#c81d1d]"
            disabled={!reason.trim()}
          >
            Cancel Appointment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 