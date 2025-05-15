'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import ClientForm from './ClientForm';

interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  notes: string;
}

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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create client');
      }

      setIsModalOpen(false);
      if (onClientAdded) {
        onClientAdded();
      }
    } catch (error) {
      console.error('Error creating client:', error);
      setError(error instanceof Error ? error.message : 'Failed to create client');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Plus className="w-5 h-5" />
        <span>Add Client</span>
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add New Client</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                disabled={isSubmitting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <ClientForm
              onSubmit={handleSubmit}
              onCancel={() => !isSubmitting && setIsModalOpen(false)}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      )}
    </>
  );
} 