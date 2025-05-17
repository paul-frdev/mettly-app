'use client';

import { ClientForm } from '@/components/forms/ClientForm';

export default function AddClientPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Add New Client</h1>
      <div className="max-w-2xl mx-auto">
        <ClientForm />
      </div>
    </div>
  );
} 