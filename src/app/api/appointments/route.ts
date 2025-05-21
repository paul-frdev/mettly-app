import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/appointments
export async function GET(req: NextRequest) {
  const session = await getServerSession({ req, ...authOptions });
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
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
        client: true,
        attendance: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}

// POST /api/appointments
export async function POST(req: NextRequest) {
  const session = await getServerSession({ req, ...authOptions });

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
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

    // First check if client already has an appointment at this time
    const existingClientAppointment = await prisma.appointment.findFirst({
      where: {
        clientId: clientId,
        date: appointmentDate,
        status: {
          not: 'cancelled',
        },
        attendance: {
          status: {
            not: 'declined',
          },
        },
      },
    });

    if (existingClientAppointment) {
      return NextResponse.json({ error: 'Client already has an appointment at this time' }, { status: 400 });
    }

    // Then check for overlapping appointments with other clients
    const overlappingAppointment = await prisma.appointment.findFirst({
      where: {
        userId: session.user.id,
        status: {
          not: 'cancelled',
        },
        attendance: {
          status: {
            not: 'declined',
          },
        },
        OR: [
          {
            date: {
              lt: appointmentEnd,
              gt: appointmentDate,
            },
          },
          {
            date: {
              lte: appointmentDate,
            },
            AND: {
              date: {
                gt: new Date(appointmentDate.getTime() - (duration || 30) * 60000),
              },
            },
          },
        ],
      },
    });

    if (overlappingAppointment) {
      return NextResponse.json({ error: 'This time slot overlaps with another appointment' }, { status: 400 });
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
export async function PUT(req: NextRequest) {
  const session = await getServerSession({ req, ...authOptions });

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
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
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/appointments
export async function DELETE(req: NextRequest) {
  const session = await getServerSession({ req, ...authOptions });

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Appointment ID is required' }, { status: 400 });
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
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
