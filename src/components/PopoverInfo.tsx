import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
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
}

export function PopoverInfo({ event, onEdit, onDelete, children }: PopoverInfoDialogProps) {
  const startTime = event.start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const endTime = event.end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const duration = event.duration || Math.round((+event.end - +event.start) / 60000);

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-72">
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