'use client';

import { useState } from 'react';
import { TimeSlots } from '@/components/appointments/TimeSlots';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, addDays, subDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ScheduleProps {
  appointments: Array<{
    date: Date;
    duration: number;
    client: {
      id: string;
      name: string;
    };
  }>;
  onAppointmentCreated?: () => void;
}

export function Schedule({ appointments, onAppointmentCreated }: ScheduleProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <Card className="mt-8">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Schedule</CardTitle>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setSelectedDate(subDays(selectedDate, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium">
            {format(selectedDate, 'MMMM d, yyyy')}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <TimeSlots
          selectedDate={selectedDate}
          appointments={appointments.filter(
            (apt) => format(new Date(apt.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
          )}
          onAppointmentCreated={onAppointmentCreated}
        />
      </CardContent>
    </Card>
  );
} 