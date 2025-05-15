'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import ClientForm from './ClientForm';
import { ClientFormData } from '@/lib/validations/client';

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
      <button
        onClick={() => {
          setError(null);
          setIsModalOpen(true);
        }}
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
                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                disabled={isSubmitting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
                <p className="text-sm">{error}</p>
              </div>
            )}

            <ClientForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      )}
    </>
  );
} 