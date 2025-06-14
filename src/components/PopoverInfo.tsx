import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Event = {
  title: string;
  start: Date;
  end: Date;
  duration?: number;
  description?: string;
  clientId?: string;
  color?: string;
};

interface PopoverInfoDialogProps {
  event: Event;
  onEdit: () => void;
  onDelete: () => void;
  children: React.ReactNode;
  open?: boolean;
  disabled?: boolean;
  onOpenChange?: (open: boolean) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function PopoverInfo({
  event,
  onEdit,
  onDelete,
  children,
  open,
  disabled = false,
  onOpenChange,
  onMouseEnter,
  onMouseLeave,
}: PopoverInfoDialogProps) {
  const startTime = event.start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const endTime = event.end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const duration = event.duration || Math.round((+event.end - +event.start) / 60000);

  // Use the event's color or generate one from clientId
  const eventColor = event.color || (event.clientId ? `hsl(${Math.abs(event.clientId.split('').reduce((hash, char) => {
    return char.charCodeAt(0) + ((hash << 5) - hash);
  }, 0)) % 360}, 70%, 50%)` : '#3b82f6');

  // Calculate text color based on background brightness
  const textColor = (() => {
    if (!eventColor) return 'text-gray-900';
    const hex = eventColor.startsWith('#') ? eventColor.substring(1) : eventColor;
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 155 ? 'text-gray-900' : 'text-white';
  })();

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-0 overflow-hidden rounded-lg shadow-xl border-0"
        side="right"
        align="center"
        sideOffset={8}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onPointerDownOutside={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest('.custom-calendar-event')) {
            e.preventDefault();
          }
        }}
      >
        <div
          className="px-4 py-3 flex justify-between items-center"
          style={{ backgroundColor: eventColor }}
        >
          <h3 className={cn("font-semibold text-sm truncate", textColor)}>
            {event.description || 'Новое событие'}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onOpenChange?.(false);
            }}
            className={cn("h-6 w-6 p-0 opacity-70 hover:bg-black/10 hover:opacity-100", {
              'hover:bg-white/20': textColor === 'text-white'
            })}
          >
            <X className={cn("w-3.5 h-3.5", textColor === 'text-white' ? 'text-white' : 'text-gray-600')} />
          </Button>
        </div>

        <div className="p-4">
          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <div className="w-24 text-gray-500">Time</div>
              <div>{startTime} - {endTime}</div>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-24 text-gray-500">Duration</div>
              <div>{duration} minutes</div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                disabled={disabled}
                className={cn("h-8 px-3 text-xs", {
                  'opacity-50 cursor-not-allowed': disabled
                })}
              >
                <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onDelete}
                disabled={disabled}
                className={cn("h-8 px-3 text-xs text-red-600 hover:text-red-700 hover:bg-red-50", {
                  'opacity-50 cursor-not-allowed': disabled
                })}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}