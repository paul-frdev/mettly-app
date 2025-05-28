import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle } from 'lucide-react';

interface CancelDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: (reason: string) => Promise<void>;
  title?: string;
  description?: string;
  cancelButtonText?: string;
  closeButtonText?: string;
}

export function CancelDialog({
  isOpen,
  onOpenChange,
  onCancel,
  title = "Cancel Appointment",
  description = "Please provide a reason for cancelling this appointment.",
  cancelButtonText = "Cancel Appointment",
  closeButtonText = "Close"
}: CancelDialogProps) {
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCancel = async () => {
    if (!reason.trim()) return;

    setIsLoading(true);
    try {
      await onCancel(reason);
      setReason('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error cancelling:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a1a2e] border-white/20 text-white">
        <DialogHeader>
          <div className="flex items-center gap-2 text-[#e42627]">
            <AlertCircle className="h-5 w-5" />
            <DialogTitle className="text-white">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-gray-300">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter cancellation reason..."
            className="min-h-[100px] bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-[#e42627] focus:ring-[#e42627]"
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            {closeButtonText}
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={!reason.trim() || isLoading}
            className="bg-[#e42627] hover:bg-[#d41f20] text-white"
          >
            {cancelButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 