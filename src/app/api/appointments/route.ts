import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET /api/appointments
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const url = new URL(request.url);
    const includeCompleted = url.searchParams.get('includeCompleted') === 'true';

    const appointments = await prisma.appointment.findMany({
      where: {
        userId: session.user.id,
        ...(includeCompleted
          ? {}
          : {
              date: {
                gte: new Date(), // Only future appointments if includeCompleted is false
              },
            }),
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            notes: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// POST /api/appointments
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { date, clientId, duration, notes } = body;

    // Validate required fields
    if (!clientId) {
      return NextResponse.json({ error: 'Client is required' }, { status: 400 });
    }

    if (!date) {
      return NextResponse.json({ error: 'Date and time are required' }, { status: 400 });
    }

    // Check if client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Check for overlapping appointments
    const appointmentDate = new Date(date);
    const appointmentEnd = new Date(appointmentDate.getTime() + (duration || 30) * 60000);

    const overlappingAppointment = await prisma.appointment.findFirst({
      where: {
        userId: session.user.id,
        date: {
          lt: appointmentEnd,
        },
        AND: {
          date: {
            gte: appointmentDate,
          },
        },
      },
    });

    if (overlappingAppointment) {
      return NextResponse.json({ error: 'This time slot is already booked' }, { status: 400 });
    }

    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        date: appointmentDate,
        duration: duration || 30,
        notes: notes,
        userId: session.user.id,
        clientId: clientId,
      },
      include: {
        client: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
  }
}

// PUT /api/appointments
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { id, date, clientId, duration, notes, status } = body;

    const appointment = await prisma.appointment.update({
      where: {
        id,
        userId: session.user.id, // Ensure user owns the appointment
      },
      data: {
        date: date ? new Date(date) : undefined,
        clientId,
        duration,
        notes,
        status,
      },
      include: {
        client: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// DELETE /api/appointments
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return new NextResponse('Appointment ID is required', { status: 400 });
    }

    await prisma.appointment.delete({
      where: {
        id,
        userId: session.user.id, // Ensure user owns the appointment
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
