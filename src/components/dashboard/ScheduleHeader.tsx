'use client';

import { format, startOfDay, isBefore } from 'date-fns';
import { Button } from '@/components/ui/button';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface ScheduleHeaderProps {
  selectedDate: Date;
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  onDateSelect: (date: Date | undefined) => void;
  onPreviousDay: () => void;
  onNextDay: () => void;
}

export function ScheduleHeader({
  selectedDate,
  currentMonth,
  onMonthChange,
  onDateSelect,
  onPreviousDay,
  onNextDay,
}: ScheduleHeaderProps) {
  const isToday = isBefore(startOfDay(selectedDate), startOfDay(new Date()))
  return (
    <div className="flex items-center justify-between">
      <Button
        variant="outline"
        size="icon"
        onClick={onPreviousDay}
        disabled={isToday}
        className={cn(`bg-black/70 border-white/20 text-white hover:bg-black/20`)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-[260px] justify-start text-left font-normal',
              !selectedDate && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {format(selectedDate, 'PPP')} • {format(selectedDate, 'EEEE')}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            month={currentMonth}
            onMonthChange={onMonthChange}
            onSelect={onDateSelect}
            disabled={(date) => isBefore(startOfDay(date), startOfDay(new Date()))}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <Button
        variant="outline"
        size="icon"
        onClick={onNextDay}
        className="bg-black/70 border-white/20 text-white hover:bg-black/50"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
