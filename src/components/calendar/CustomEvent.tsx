import { stringToColor } from '@/lib/colorUtils';
import { CalendarEvent } from '@/types/calendar';
import { useState, useEffect, useRef, useMemo } from 'react';
import { PopoverInfo } from "@/components/PopoverInfo";
import { cn } from '@/lib/utils';

// Кастомный компонент для отображения события
interface CustomEventProps {
  event: CalendarEvent;
  onRequestEdit: (event: CalendarEvent) => void;
  onRequestDelete: (event: CalendarEvent) => void;
  isSelected: boolean;
}

export const CustomEvent: React.FC<CustomEventProps> = ({
  event,
  onRequestEdit,
  onRequestDelete,
  isSelected
}) => {
  const [open, setOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const color = event.clientId ? stringToColor(event.clientId) : (event.color || "#3b82f6");
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(true);

  // Check if the event is in the past or ongoing
  const isEventInPastOrOngoing = useMemo(() => {
    if (!event || !event.end) return false;
    const now = new Date();
    return new Date(event.end) <= now;
  }, [event?.end]);

  const clearHoverTimeout = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const handleMouseEnter = () => {
    clearHoverTimeout();
    hoverTimeoutRef.current = setTimeout(() => {
      setOpen(true);
      setIsHovering(true);
    }, 150);
  };

  const handleMouseLeave = () => {
    clearHoverTimeout();
    hoverTimeoutRef.current = setTimeout(() => {
      setOpen(false);
      setIsHovering(false);
    }, 200);
  };

  const handlePopoverEnter = () => {
    clearHoverTimeout();
  };

  const handlePopoverLeave = () => {
    handleMouseLeave();
  };

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      clearHoverTimeout();
    };
  }, []);

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <PopoverInfo
        event={{
          ...event,
          color: event.color || (event.clientId ? stringToColor(event.clientId) : undefined)
        }}
        onEdit={() => !isEventInPastOrOngoing && onRequestEdit(event)}
        onDelete={() => !isEventInPastOrOngoing && onRequestDelete(event)}
        open={open}
        disabled={isEventInPastOrOngoing}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) {
            setIsHovering(false);
          }
        }}
        onMouseEnter={handlePopoverEnter}
        onMouseLeave={handlePopoverLeave}
      >
        <div
          className={cn(
            "custom-calendar-event group",
            isSelected && "selected",
            isHovering && "ring-2",
            "transition-all duration-150 ease-in-out"
          )}
          style={{
            '--event-bg': color,
            '--ring-color': 'rgba(255, 255, 255, 0.5)',
          } as React.CSSProperties}
        >
          <span className="event-dot" />
          <span className="truncate">{event.description || 'New Event'}</span>
        </div>
      </PopoverInfo>
    </div>
  );
};