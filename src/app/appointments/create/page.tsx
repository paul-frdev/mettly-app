'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { addMinutes, isSameDay, set } from 'date-fns';

interface Client {
  id: string;
  name: string;
}

interface ApiAppointment {
  id: string;
  date: string;
  duration: number;
}

interface Appointment {
  id: string;
  date: Date;
  duration: number;
}

export default function CreateAppointment() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [existingAppointments, setExistingAppointments] = useState<Appointment[]>([]);

  const [formData, setFormData] = useState({
    date: new Date(),
    clientId: '',
    duration: 60,
    notes: '',
  });

  useEffect(() => {
    fetchClients();
    fetchExistingAppointments();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients');
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchExistingAppointments = async () => {
    try {
      const response = await fetch('/api/appointments');
      const data = await response.json();
      setExistingAppointments(data.map((apt: ApiAppointment) => ({
        ...apt,
        date: new Date(apt.date)
      })));
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const isTimeSlotAvailable = (date: Date, duration: number) => {
    const endTime = addMinutes(date, duration);

    return !existingAppointments.some(appointment => {
      if (!isSameDay(date, appointment.date)) {
        return false;
      }

      const appointmentEnd = addMinutes(appointment.date, appointment.duration || 60);

      // Проверяем пересечение временных интервалов
      return (
        (date >= appointment.date && date < appointmentEnd) ||
        (endTime > appointment.date && endTime <= appointmentEnd) ||
        (date <= appointment.date && endTime >= appointmentEnd)
      );
    });
  };

  // Получаем массив недоступных временных слотов для выбранного дня
  const getExcludedTimes = (selectedDate: Date) => {
    const dayAppointments = existingAppointments.filter(apt =>
      isSameDay(selectedDate, apt.date)
    );

    // Создаем массив временных слотов с интервалом в 15 минут
    const times: Date[] = [];
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);

    for (let i = 0; i < 96; i++) { // 24 часа * 4 (15-минутные интервалы)
      const time = addMinutes(startOfDay, i * 15);

      // Проверяем, не попадает ли этот временной слот в какую-либо существующую встречу
      const isBlocked = dayAppointments.some(apt => {
        const aptEnd = addMinutes(apt.date, apt.duration || 60);
        return time >= apt.date && time < aptEnd;
      });

      if (isBlocked) {
        times.push(time);
      }
    }

    return times;
  };

  const handleDateChange = (date: Date | null) => {
    if (!date) return;

    // Если выбранный слот доступен, обновляем дату
    if (isTimeSlotAvailable(date, formData.duration)) {
      setFormData({ ...formData, date });
    } else {
      alert('This time slot is already booked. Please select another time.');
    }
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const duration = value ? parseInt(value) : 60; // Если пустая строка, используем значение по умолчанию

    // Проверяем, что значение в допустимом диапазоне
    if (duration >= 15 && duration <= 240) { // Максимум 4 часа
      if (isTimeSlotAvailable(formData.date, duration)) {
        setFormData({ ...formData, duration });
      } else {
        alert('This duration would conflict with another appointment. Please select a different duration or time.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Финальная проверка перед отправкой
    if (!isTimeSlotAvailable(formData.date, formData.duration)) {
      alert('This time slot is no longer available. Please select another time.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create appointment');
      }

      router.push('/appointments');
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Failed to create appointment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Create New Appointment</h1>

        <form onSubmit={handleSubmit} className="max-w-lg space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Date and Time
            </label>
            <DatePicker
              selected={formData.date}
              onChange={handleDateChange}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="MMMM d, yyyy h:mm aa"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              minDate={new Date()}
              excludeTimes={getExcludedTimes(formData.date)}
              minTime={set(new Date(), { hours: 7, minutes: 0 })}
              maxTime={set(new Date(), { hours: 21, minutes: 0 })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Client
            </label>
            <select
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            <label className="block text-sm font-medium mb-2">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={formData.duration || ''}
              onChange={handleDurationChange}
              min="15"
              max="240"
              step="15"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">Minimum 15 minutes, maximum 4 hours</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add any additional notes..."
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 