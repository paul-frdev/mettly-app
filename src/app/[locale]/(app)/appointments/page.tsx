'use client';

import { useState, useEffect } from 'react';
import { Plus, Calendar as CalendarIcon, Clock, User, Filter, X } from 'lucide-react';
import Link from 'next/link';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Appointment {
  id: string;
  date: Date;
  clientId: string | null;
  client?: {
    id: string;
    name: string;
  };
  duration: number | null;
  notes: string | null;
  status: string;
}

type FilterStatus = 'all' | 'scheduled' | 'completed' | 'cancelled';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: ''
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/appointments');
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    const matchesClient = clientFilter === 'all' || appointment.clientId === clientFilter;
    const matchesDateRange = !dateRange.start || !dateRange.end || isWithinInterval(
      new Date(appointment.date),
      {
        start: startOfDay(new Date(dateRange.start)),
        end: endOfDay(new Date(dateRange.end))
      }
    );
    return matchesStatus && matchesClient && matchesDateRange;
  });

  const clearFilters = () => {
    setStatusFilter('all');
    setClientFilter('all');
    setDateRange({ start: '', end: '' });
  };

  // Get unique clients from appointments
  const clients = appointments
    .filter(app => app.clientId) // First check if there's a clientId
    .map(app => ({
      id: app.clientId!,
      name: app.client?.name || 'Unknown Client'
    }))
    .reduce((unique, client) => {
      if (!unique.some(c => c.id === client.id)) {
        unique.push(client);
      }
      return unique;
    }, [] as Array<{ id: string; name: string }>)
    .sort((a, b) => a.name.localeCompare(b.name));

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-gray-50 via-sky-50 to-blue-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-700">Appointments</h1>
          <div className="flex items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="w-4 h-4" />
                  Filters
                  {(statusFilter !== 'all' || clientFilter !== 'all' || dateRange.start || dateRange.end) && (
                    <Badge variant="secondary" className="ml-2">
                      {[
                        statusFilter !== 'all' && 'Status',
                        clientFilter !== 'all' && 'Client',
                        dateRange.start && 'Date',
                      ].filter(Boolean).length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium leading-none">Filters</h4>
                    {(statusFilter !== 'all' || clientFilter !== 'all' || dateRange.start || dateRange.end) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="h-8 gap-1"
                      >
                        <X className="w-4 h-4" />
                        Clear
                      </Button>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status</label>
                      <Select
                        value={statusFilter}
                        onValueChange={(value) => setStatusFilter(value as FilterStatus)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Client</label>
                      <Select
                        value={clientFilter}
                        onValueChange={setClientFilter}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Clients</SelectItem>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Date Range</label>
                      <div className="grid gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !dateRange.start && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dateRange.start ? (
                                format(new Date(dateRange.start), "PPP")
                              ) : (
                                <span>Pick a start date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={dateRange.start ? new Date(dateRange.start) : undefined}
                              onSelect={(date) =>
                                setDateRange({ ...dateRange, start: date?.toISOString() || "" })
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !dateRange.end && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dateRange.end ? (
                                format(new Date(dateRange.end), "PPP")
                              ) : (
                                <span>Pick an end date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={dateRange.end ? new Date(dateRange.end) : undefined}
                              onSelect={(date) =>
                                setDateRange({ ...dateRange, end: date?.toISOString() || "" })
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <Link href="/appointments/create">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Appointment
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-4">
          {filteredAppointments.map((appointment) => (
            <Link
              key={appointment.id}
              href={`/appointments/${appointment.id}`}
              className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-blue-700">
                    <span>{format(new Date(appointment.date), 'PPP')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-700">
                    <Clock className="w-4 h-4" />
                    <span>{format(new Date(appointment.date), 'p')}</span>
                  </div>
                  {appointment.client && (
                    <div className="flex items-center gap-2 text-blue-700">
                      <User className="w-4 h-4" />
                      <span>{appointment.client.name}</span>
                    </div>
                  )}
                  {appointment.notes && (
                    <p className="text-sm text-gray-500 mt-2">
                      {appointment.notes}
                    </p>
                  )}
                </div>
                <Badge
                  variant={
                    appointment.status === 'scheduled'
                      ? 'secondary'
                      : appointment.status === 'completed'
                        ? 'default'
                        : 'destructive'
                  }
                >
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </Badge>
              </div>
            </Link>
          ))}

          {filteredAppointments.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <p className="text-gray-500 mb-2">No appointments found</p>
                <Link href="/appointments/create">
                  <Button variant="link" className="text-blue-600">
                    Create your first appointment
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 