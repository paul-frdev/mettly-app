import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { CalendarEvent, CalendarFilters } from '@/types/calendar';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const filters: CalendarFilters = {
      trainerId: searchParams.get('trainerId') || undefined,
      clientId: searchParams.get('clientId') || undefined,
      status: (searchParams.get('status')?.split(',') as CalendarEvent['status'][]) || undefined,
      startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined,
      endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined,
    };

    const events = await prisma.appointment.findMany({
      where: {
        AND: [
          {
            OR: [{ userId: session.user.id }, { clientId: session.user.id }],
          },
          filters.trainerId ? { userId: filters.trainerId } : {},
          filters.clientId ? { clientId: filters.clientId } : {},
          filters.status ? { status: { in: filters.status } } : {},
          filters.startDate ? { date: { gte: filters.startDate } } : {},
          filters.endDate ? { date: { lte: filters.endDate } } : {},
        ],
      },
      orderBy: {
        date: 'asc',
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, start, end, status, trainerId, clientId, description } = body;

    // Validate required fields
    if (!title || !start || !end || !status || !trainerId) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Check if user is authorized to create event
    if (trainerId !== session.user.id) {
      return new NextResponse('Unauthorized to create event for this trainer', { status: 403 });
    }

    const event = await prisma.appointment.create({
      data: {
        date: new Date(start),
        duration: Math.round((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60)),
        notes: description,
        status,
        userId: trainerId,
        clientId: clientId || session.user.id, // If no client specified, use trainer as client
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
