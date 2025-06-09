import { useCallback } from 'react';

export function useCalendarSync() {
  const triggerCalendarUpdate = useCallback(() => {
    window.dispatchEvent(new Event('calendarUpdate'));
  }, []);

  const subscribeCalendarUpdate = (callback: () => void) => {
    window.addEventListener('calendarUpdate', callback);
    return () => window.removeEventListener('calendarUpdate', callback);
  };

  return { triggerCalendarUpdate, subscribeCalendarUpdate };
}
