'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';
import { use } from 'react';

interface Client {
  id: string;
  name: string;
}

interface Appointment {
  id: string;
  date: Date;
  clientId: string | null;
  client?: {
    name: string;
  };
  duration: number | null;
  notes: string | null;
  status: string;
}

export default function AppointmentPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState<Partial<Appointment>>({});
  const { id } = use(params);

  useEffect(() => {
    fetchAppointment();
    fetchClients();
  }, [id]);

  const fetchAppointment = async () => {
    try {
      const response = await fetch(`/api/appointments/${id}`);
      if (!response.ok) {
        throw new Error('Appointment not found');
      }
      const data = await response.json();
      setAppointment(data);
      setFormData({
        date: new Date(data.date),
        clientId: data.clientId,
        duration: data.duration,
        notes: data.notes,
        status: data.status,
      });
    } catch (error) {
      console.error('Error fetching appointment:', error);
      router.push('/appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients');
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/appointments`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: id,
          ...formData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update appointment');
      }

      const updatedAppointment = await response.json();
      setAppointment(updatedAppointment);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Failed to update appointment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this appointment?')) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/appointments?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete appointment');
      }

      router.push('/appointments');
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert('Failed to delete appointment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return null;
  }

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-gray-50 via-sky-50 to-blue-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-700">
            {isEditing ? 'Edit Appointment' : 'Appointment Details'}
          </h1>
          <div className="space-x-4">
            {!isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleUpdate} className="max-w-lg space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div>
              <label className="block text-sm font-medium mb-2 text-blue-700">
                Date and Time
              </label>
              <DatePicker
                selected={formData.date}
                onChange={(date: Date | null) => date && setFormData({ ...formData, date })}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="MMMM d, yyyy h:mm aa"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-blue-700">
                Client
              </label>
              <select
                value={formData.clientId || ''}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800"
              >
                <option value="">Select a client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-blue-700">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={formData.duration || ''}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-blue-700">
                Notes
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800 resize-none"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-blue-700">
                Status
              </label>
              <select
                value={formData.status || ''}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800"
              >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-medium text-blue-700">Date and Time</h2>
                <p className="mt-1 text-gray-800">
                  {format(new Date(appointment.date), 'MMMM d, yyyy h:mm aa')}
                </p>
              </div>

              <div>
                <h2 className="text-sm font-medium text-blue-700">Client</h2>
                <p className="mt-1 text-gray-800">
                  {appointment.client?.name || 'No client assigned'}
                </p>
              </div>

              <div>
                <h2 className="text-sm font-medium text-blue-700">Duration</h2>
                <p className="mt-1 text-gray-800">
                  {appointment.duration} minutes
                </p>
              </div>

              <div>
                <h2 className="text-sm font-medium text-blue-700">Status</h2>
                <p className="mt-1 text-gray-800">
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </p>
              </div>

              {appointment.notes && (
                <div>
                  <h2 className="text-sm font-medium text-blue-700">Notes</h2>
                  <p className="mt-1 text-gray-800 whitespace-pre-wrap">
                    {appointment.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 