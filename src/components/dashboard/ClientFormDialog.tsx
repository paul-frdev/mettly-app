'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ClientForm from '../forms/ClientForm';

interface ClientFormData {
  // Define the expected fields for the client form data
  name: string;
  email: string;
  // Add other fields as needed
}

interface ClientFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClientFormData) => Promise<void>;
}

export function ClientFormDialog({ isOpen, onClose, onSubmit }: ClientFormDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1a2e] border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Add New Client</DialogTitle>
          <DialogDescription className="text-gray-300">
            Add a new client to your system. Fill in the required information below.
          </DialogDescription>
        </DialogHeader>
        <ClientForm
          onSubmit={async (data) => {
            await onSubmit(data);
            onClose();
          }}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
} 