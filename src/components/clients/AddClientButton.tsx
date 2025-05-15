'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import ClientForm from './ClientForm';
import { ClientFormData } from '@/lib/validations/client';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AddClientButtonProps {
  onClientAdded?: () => void;
}

export default function AddClientButton({ onClientAdded }: AddClientButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: ClientFormData) => {
    try {
      setError(null);
      setIsSubmitting(true);

      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        setError(responseData.error);
        return;
      }

      setIsModalOpen(false);
      if (onClientAdded) {
        onClientAdded();
      }
    } catch (error) {
      setError('Failed to create client. Please try again.');
      console.error('Error creating client:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (!isSubmitting) {
      setError(null);
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => {
          setError(null);
          setIsModalOpen(true);
        }}
        className="flex items-center space-x-2"
      >
        <Plus className="w-5 h-5" />
        <span>Add Client</span>
      </Button>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
          </DialogHeader>

          {error && (
            <div className="rounded-md bg-destructive/15 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <ClientForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </>
  );
} 