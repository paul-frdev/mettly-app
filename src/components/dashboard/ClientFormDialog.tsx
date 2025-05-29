'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ClientForm } from '@/components/forms/ClientForm';

interface ClientFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ClientFormDialog({ isOpen, onClose }: ClientFormDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1a2e] border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Add New Client</DialogTitle>
          <DialogDescription className="text-gray-300">
            Add a new client to your system. Fill in the required information below.
          </DialogDescription>
        </DialogHeader>
        <ClientForm />
      </DialogContent>
    </Dialog>
  );
} 