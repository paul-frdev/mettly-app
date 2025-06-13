import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";

type Event = {
  title: string;
  start: Date;
  end: Date;
  duration?: number;
};

interface PopoverInfoDialogProps {
  event: Event;
  onEdit: () => void;
  onDelete: () => void;
  children: React.ReactNode;
  open?: boolean;
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
  onOpenChange, 
  onMouseEnter, 
  onMouseLeave 
}: PopoverInfoDialogProps) {
  const startTime = event.start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const endTime = event.end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const duration = event.duration || Math.round((+event.end - +event.start) / 60000);

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent
        className="w-72"
        side="right"
        align="center"
        sideOffset={8}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onPointerDownOutside={(e) => {
          // Prevent closing when clicking on the popover content
          const target = e.target as HTMLElement;
          if (target.closest('.custom-calendar-event')) {
            e.preventDefault();
          }
        }}
      >
        <PopoverPrimitive.Arrow className="fill-white drop-shadow-md" width={16} height={8} />
        <div className="flex justify-between items-center mb-2">
          <span className="font-bold">{event.title}</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={onEdit} title="Редактировать">
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete} title="Удалить">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-1 text-sm">
          <div>🕑 {startTime}</div>
          <div>🕒 {endTime}</div>
          <div>⏳ {duration} мин</div>
        </div>
      </PopoverContent>
    </Popover>
  );
}