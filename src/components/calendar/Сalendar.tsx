'use client';

import '../../styles/calendar.css';
import { useState, useCallback, useEffect } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, setHours, setMinutes } from 'date-fns';
import { enUS, ru } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useSession } from 'next-auth/react';

import { CalendarEvent, CalendarView } from '@/types/calendar';
import { useCalendar } from '@/hooks/use-calendar';
import { toast } from 'sonner';
import { AppointmentDialog } from '@/components/dialogs/AppointmentDialog';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import { CancelDialog } from '@/components/dialogs/CancelDialog';
import { stringToColor, getContrastTextColor } from '@/lib/utils/colors';
import { Loader } from '../Loader';
import { CustomEvent } from './CustomEvent';

// Standard duration options
const standardDurations = [30, 45, 60, 90, 120];

const locales = {
  'en-US': enUS,
  'ru': ru,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Moved to PopoverInfo.tsx

interface Client {
  id: string;
  name: string;
}

export function Calendar() {
  const { data: session } = useSession();
  const { events, loading, error, fetchEvents, deleteEvent } = useCalendar();
  const { settings, isHoliday, isWorkingDay } = useBusinessSettings();
  const { subscribeCalendarUpdate } = useCalendarSync();

  const [view, setView] = useState<CalendarView['type']>('month');
  const [date, setDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [eventDescription, setEventDescription] = useState('');
  const [eventDuration, setEventDuration] = useState(60);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [maxAvailableDuration, setMaxAvailableDuration] = useState(120);
  const [appointmentToCancel, setAppointmentToCancel] = useState<CalendarEvent | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [manualTime, setManualTime] = useState<string | null>(null);
  const [appointmentType, setAppointmentType] = useState<'individual' | 'group'>('individual');
  const [groupCapacity, setGroupCapacity] = useState(2);
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState(0);

  const isClient = !!session?.user?.isClient;

  useEffect(() => {
    if (session?.user) {
      fetchEvents();
    }
  }, [session, fetchEvents]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Загрузка клиентов
  useEffect(() => {
    async function fetchClients() {
      try {
        const response = await fetch('/api/clients');
        if (!response.ok) throw new Error('Failed to fetch clients');
        const data = await response.json();
        setClients(data);
      } catch {
        // Можно добавить обработку ошибок
      }
    }
    fetchClients();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeCalendarUpdate(() => {
      fetchEvents();
    });
    return unsubscribe;
  }, [fetchEvents, subscribeCalendarUpdate]);

  const isBusinessSlot = useCallback((date: Date) => {
    if (!settings) return false;
    const dayName = format(date, 'EEEE');
    const daySchedule = settings.workingHours[dayName];
    if (!daySchedule?.enabled) return false;
    if (isHoliday && isHoliday(date)) return false;
    const [startHour, startMinute] = daySchedule.start.split(':').map(Number);
    const [endHour, endMinute] = daySchedule.end.split(':').map(Number);
    const slotMinutes = date.getHours() * 60 + date.getMinutes();
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    return slotMinutes >= startMinutes && slotMinutes < endMinutes;
  }, [settings, isHoliday]);

  // Function to check if a slot is available has been removed as it was unused

  /**
   * Обработка клика по слоту календаря
   * 
   * СЦЕНАРИИ КОТОРЫЕ ДОЛЖНЫ РАБОТАТЬ:
   * ✅ Месячный вид - клик на сегодняшний день (если рабочее время не прошло)
   * ✅ Месячный вид - клик на завтрашний/будущий рабочий день
   * ✅ Недельный/дневной вид - клик на будущее время в рабочих часах
   * 
   * СЦЕНАРИИ КОТОРЫЕ ДОЛЖНЫ БЛОКИРОВАТЬСЯ:
   * ❌ Клик на прошедший день
   * ❌ Клик на нерабочий день (выходной)
   * ❌ Клик на праздничный день
   * ❌ Клик на прошедшее время сегодня
   * ❌ Клик на время вне рабочих часов
   * ❌ Клик на сегодняшний день, если рабочее время уже прошло
   * ❌ Клик на слот с недостаточным временем (< 15 минут)
   * 
   * ТЕСТОВЫЕ СЦЕНАРИИ ДЛЯ ПРОВЕРКИ:
   * 1. Сегодня понедельник 15 июля 2025, 14:00, рабочие часы 9:00-18:00
   *    - Клик на понедельник в month view → ✅ (устанавливается 9:00)
   *    - Клик на вторник в month view → ✅ (устанавливается 9:00)
   *    - Клик на воскресенье в month view → ❌ (нерабочий день)
   *    - Клик на 12:00 сегодня в week view → ❌ (время прошло)
   *    - Клик на 16:00 сегодня в week view → ✅ (будущее время)
   * 2. Сегодня понедельник 15 июля 2025, 19:00 (после работы)
   *    - Клик на понедельник в month view → ❌ (рабочее время прошло)
   * 3. Есть событие сегодня 16:00-17:00
   *    - Клик на 17:30 → ✅ (если есть время до конца дня)
   *    - Клик на 17:50 → ❌ (недостаточно времени)
   */
  const handleSelectSlot = useCallback((slotInfo: { start: Date; end: Date; slots?: Date[]; action?: string }) => {
    if (!session?.user) return;
    
    const now = new Date();
    const slotDayName = format(slotInfo.start, 'EEEE');
    const slotDaySchedule = settings?.workingHours[slotDayName];
    
    // Шаг 1: Проверяем, что это рабочий день
    if (!slotDaySchedule?.enabled) {
      toast.error('Этот день не является рабочим');
      return;
    }
    
    // Шаг 2: Проверяем праздники
    if (isHoliday && isHoliday(slotInfo.start)) {
      toast.error('Нельзя создавать события в праздничные дни');
      return;
    }
    
    let startTime = new Date(slotInfo.start);
    const isMonthViewDayClick = view === 'month' && startTime.getHours() === 0 && startTime.getMinutes() === 0;
    
    if (isMonthViewDayClick) {
      // Сценарий: Клик на день в месячном виде
      
      // Шаг 3a: Проверяем только дату (не время)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDay = new Date(slotInfo.start);
      selectedDay.setHours(0, 0, 0, 0);
      
      if (selectedDay < today) {
        toast.error('Нельзя создавать события в прошлом');
        return;
      }
      
      // Шаг 4a: Устанавливаем время начала рабочего дня
      const [h, m] = slotDaySchedule.start.split(':').map(Number);
      startTime = setHours(setMinutes(new Date(slotInfo.start), m), h);
      setManualTime(slotDaySchedule.start);
      
      // Дополнительная проверка: если сегодняшний день, но рабочее время уже прошло
      if (selectedDay.getTime() === today.getTime() && startTime < now) {
        toast.error('Рабочее время на сегодня уже прошло');
        return;
      }
      
    } else {
      // Сценарий: Клик на конкретное время в недельном/дневном виде
      setManualTime(null);
      
      // Шаг 3b: Проверяем точное время (с визуальной подсказкой)
      if (startTime < now) {
        toast.error('Это время уже прошло (выберите будущее время)');
        return;
      }
      
      // Шаг 4b: Проверяем, что время в рабочих часах (с визуальной подсказкой)
      if (!isBusinessSlot(startTime)) {
        toast.error('Выберите время в рабочих часах');
        return;
      }
    }
    
    // Шаг 5: Находим ближайшее событие после выбранного времени
    const nextEvent = events
      .filter(event => event.status !== 'cancelled' && event.start > startTime)
      .sort((a, b) => a.start.getTime() - b.start.getTime())[0];
      
    // Шаг 6: Вычисляем максимальную доступную длительность
    let maxDuration = 120;

    // Проверяем ограничение по следующему событию
    if (nextEvent) {
      const availableMinutes = (nextEvent.start.getTime() - startTime.getTime()) / (1000 * 60);
      maxDuration = Math.min(maxDuration, Math.floor(availableMinutes));
    }

    // Проверяем ограничение по концу рабочего дня
    const [endHour, endMinute] = slotDaySchedule.end.split(':').map(Number);
    const endOfDay = new Date(startTime);
    endOfDay.setHours(endHour, endMinute, 0, 0);
    const minutesUntilEndOfDay = (endOfDay.getTime() - startTime.getTime()) / (1000 * 60);
    maxDuration = Math.min(maxDuration, Math.floor(minutesUntilEndOfDay));

    // Устанавливаем длительность встречи (по умолчанию 60 минут, но не больше доступного времени)
    setEventDuration(Math.min(60, maxDuration));
    setMaxAvailableDuration(maxDuration);
    
    // Шаг 7: Проверяем, что есть достаточно времени для создания события (минимум 15 минут)
    if (maxDuration < 15) {
      toast.error('Недостаточно времени для создания события (минимум 15 минут)');
      return;
    }

    setSelectedEvent({
      id: '',
      title: '',
      start: startTime,
      end: slotInfo.end,
      status: 'pending',
      trainerId: session.user.id,
    });
    setIsDialogOpen(true);
  }, [session, settings, events, view, isBusinessSlot, isHoliday]);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    if (event.end < new Date()) return; // Не открывать диалог для прошедших
    setEventDescription(event.description || '');
    setSelectedEvent(event);
    setIsDialogOpen(true);
  }, []);

  const isSlotBooked = useCallback((start: Date, end: Date, excludeId?: string) => {
    return events.some(event => {
      if (event.status === 'cancelled') return false;
      if (excludeId && event.id === excludeId) return false;
      return start < event.end && end > event.start;
    });
  }, [events]);

  const handleSaveEvent = useCallback(async () => {
    if (!selectedEvent) return;
    const durationMinutes = eventDuration;
    const start = selectedEvent.start;
    const isClient = !!session?.user?.isClient;
    const appointmentDate = start;
    if (isSlotBooked(start, new Date(start.getTime() + durationMinutes * 60000), selectedEvent.id)) {
      toast.error('Этот слот уже занят');
      return;
    }
    const appointmentData = {
      date: appointmentDate.toISOString(),
      duration: durationMinutes,
      notes: eventDescription,
      type: appointmentType,
      isPaid,
      price: isPaid ? price : undefined,
      maxClients: appointmentType === 'group' ? groupCapacity : undefined,
      clientId: appointmentType === 'individual' ? (isClient ? 'self' : selectedClientId) : undefined,
      clientIds: appointmentType === 'group' ? selectedClients : undefined,
    };
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create appointment');
      }
      toast.success('Appointment created successfully');
      await fetchEvents();
      setIsDialogOpen(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save appointment';
      toast.error(errorMessage);
    }
  }, [selectedEvent, eventDescription, eventDuration, selectedClientId, fetchEvents, isSlotBooked, session, appointmentType, groupCapacity, isPaid, price, selectedClients]);

  const handleDeleteEvent = useCallback(async () => {
    if (!selectedEvent?.id) return;
    try {
      await deleteEvent(selectedEvent.id);
      await fetchEvents();
      setIsDialogOpen(false);
      toast.success('Appointment deleted successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete appointment';
      toast.error(errorMessage);
    }
  }, [selectedEvent, deleteEvent, fetchEvents]);

  const visibleEvents = events.filter(event => event.status !== 'cancelled');

  // Получить минимальное и максимальное время из business settings
  const hours = Object.values(settings?.workingHours || {})
    .filter(day => day.enabled)
    .map(day => ({
      start: day.start,
      end: day.end,
    }));

  const minTime = hours.reduce((min, h) => h.start < min ? h.start : min, '23:59');
  const maxTime = hours.reduce((max, h) => h.end > max ? h.end : max, '00:00');

  const [minHour, minMinute] = minTime.split(':').map(Number);
  const [maxHour, maxMinute] = maxTime.split(':').map(Number);

  // Обновление времени старта встречи при ручном выборе времени
  useEffect(() => {
    if (manualTime && selectedEvent) {
      const [h, m] = manualTime.split(':').map(Number);
      const newStart = new Date(selectedEvent.start);
      newStart.setHours(h, m, 0, 0);
      setSelectedEvent({ ...selectedEvent, start: newStart });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manualTime]);

  // Принудительно устанавливаем курсор для доступных слотов после рендера
  useEffect(() => {
    const timer = setTimeout(() => {
      const availableSlots = document.querySelectorAll('.available-slot, .available-slot *');
      availableSlots.forEach((element) => {
        (element as HTMLElement).style.cursor = 'pointer';
      });
    }, 100);
    
    return () => clearTimeout(timer);
  }, [view, date, events]);

  if (loading) {
    return <Loader />
  }

  return (
    <>
      <div className="w-full overflow-x-auto" style={{ height: 700 }}>
        <BigCalendar
          localizer={localizer}
          events={visibleEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          view={view}
          views={['month', 'week', 'day']}
          onView={(newView) => setView(newView as CalendarView['type'])}
          date={date}
          onNavigate={(newDate) => setDate(newDate)}
          selectable={true}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={(event) => {
            // Use client ID to generate a consistent color for each client
            const bgColor = event.clientId ? stringToColor(event.clientId) : '#d1fae5';
            const isConfirmed = event.status === 'pending' || event.status === 'confirmed';
            const opacity = isConfirmed ? '33' : '66'; // More transparent for cancelled events

            return {
              style: {
                backgroundColor: `${bgColor}${opacity}`,
                borderLeft: `4px solid ${bgColor}`,
                color: getContrastTextColor(bgColor),
                borderRadius: '4px',
                padding: '2px 4px',
                fontSize: '0.875rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              },
            };
          }}
          slotPropGetter={(date) => {
            const now = new Date();
            const isPastTime = date < now;
            const isBusinessTime = isBusinessSlot(date);
            
            // Определяем CSS классы для слота
            let slotClassName = "";
            
            if (isPastTime) {
              slotClassName = "past-time-slot";
            } else if (!isBusinessTime) {
              slotClassName = "non-business-slot";
            } else {
              slotClassName = "available-slot";
            }
            
            // Добавляем JavaScript hover только для week/day view (не для month view)
            const shouldAddHover = (view === 'week' || view === 'day') && slotClassName === "available-slot";
            
            return {
              className: slotClassName,
              ...(shouldAddHover && {
                onMouseEnter: (e) => {
                  const target = e.currentTarget as HTMLElement;
                  target.style.backgroundColor = '#dcfce7';
                  target.style.borderColor = '#22c55e';
                  target.style.transform = 'scale(1.01)';
                  target.style.cursor = 'pointer';
                  // Принудительно устанавливаем курсор для всех дочерних элементов
                  const allChildren = target.querySelectorAll('*');
                  allChildren.forEach((child) => {
                    (child as HTMLElement).style.cursor = 'pointer';
                  });
                },
                onMouseLeave: (e) => {
                  const target = e.currentTarget as HTMLElement;
                  target.style.backgroundColor = '';
                  target.style.borderColor = '';
                  target.style.transform = '';
                  // Сохраняем курсор pointer даже после hover
                  target.style.cursor = 'pointer';
                  const allChildren = target.querySelectorAll('*');
                  allChildren.forEach((child) => {
                    (child as HTMLElement).style.cursor = 'pointer';
                  });
                }
              })
            };
          }}
          dayPropGetter={(date) => {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const selectedDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            
            if (isWorkingDay(date)) {
              if (selectedDay < today) {
                // рабочий, но в прошлом
                return { 
                  className: 'past-time-slot',
                  style: { backgroundColor: '#f3f4f6', opacity: 0.7 } 
                };
              }
              // рабочий, не в прошлом - доступный (без hover в месячном виде)
              return { 
                className: 'available-slot'
              };
            }
            // нерабочий день
            return { 
              className: 'non-business-slot',
              style: { backgroundColor: '#f8fafc', opacity: 0.7 } 
            };
          }}
          components={{
            event: (props) => (
              <CustomEvent
                {...props}
                isSelected={false} // Default to false since isSelected is not available in EventProps
                onRequestEdit={(event) => {
                  setSelectedEvent(event);
                  setIsDialogOpen(true);
                }}
                onRequestDelete={async (event) => {
                  setSelectedEvent(event);
                  await handleDeleteEvent();
                }}
              />
            ),
          }}
          min={new Date(1970, 1, 1, minHour, minMinute)}
          max={new Date(1970, 1, 1, maxHour, maxMinute)}
        />
      </div>

      <AppointmentDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        clients={clients}
        isClient={isClient}
        selectedClientId={selectedClientId}
        onClientChange={setSelectedClientId}
        notes={eventDescription}
        onNotesChange={setEventDescription}
        duration={eventDuration}
        onDurationChange={setEventDuration}
        availableDurations={standardDurations}
        maxAvailableDuration={maxAvailableDuration}
        onSubmit={handleSaveEvent}
        onDelete={handleDeleteEvent}
        onCancel={() => setIsDialogOpen(false)}
        manualTime={manualTime}
        onManualTimeChange={setManualTime}
        showTimeSelect={!!manualTime}
        workingHours={selectedEvent ? settings?.workingHours[format(selectedEvent.start, 'EEEE')] : undefined}
        isEditing={!!selectedEvent?.id} // If the event has an ID, it's an existing event being edited
        appointmentType={appointmentType}
        onAppointmentTypeChange={setAppointmentType}
        selectedClients={selectedClients}
        onSelectedClientsChange={setSelectedClients}
        groupCapacity={groupCapacity}
        onGroupCapacityChange={setGroupCapacity}
        isPaid={isPaid}
        onIsPaidChange={setIsPaid}
        price={price}
        onPriceChange={setPrice}
      />

      <CancelDialog
        isOpen={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
        onCancel={async (reason) => {
          if (!appointmentToCancel) return;
          await fetch(`/api/appointments/${appointmentToCancel.id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cancellationReason: reason }),
          });
          setIsCancelDialogOpen(false);
          setAppointmentToCancel(null);
          fetchEvents();
        }}
      />
    </>
  );
}
