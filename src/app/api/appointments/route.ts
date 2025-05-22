import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/appointments
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Update statuses of past appointments first
    const now = new Date();
    console.log('Current time:', now.toISOString());

    // Сначала проверяем, является ли пользователь клиентом
    const client = await prisma.client.findUnique({
      where: { email: session.user.email },
      select: { id: true, userId: true },
    });

    if (client) {
      // Если это клиент, обновляем статусы его встреч
      const updatedAppointments = await prisma.appointment.updateMany({
        where: {
          clientId: client.id,
          AND: [
            {
              date: {
                lt: now,
              },
            },
            {
              status: 'scheduled',
            },
            {
              OR: [{ attendance: null }, { attendance: { status: { not: 'declined' } } }],
            },
          ],
        },
        data: {
          status: 'completed',
        },
      });

      console.log('Updated client appointments:', updatedAppointments);

      // Получаем все встречи клиента и расписание тренера
      const appointments = await prisma.appointment.findMany({
        where: {
          OR: [
            { clientId: client.id }, // Встречи клиента
            { userId: client.userId }, // Расписание тренера
          ],
        },
        include: {
          attendance: {
            select: {
              status: true,
            },
          },
          client: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          date: 'asc',
        },
      });

      return NextResponse.json(appointments);
    }

    // Если это тренер, получаем все его встречи
    const appointments = await prisma.appointment.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        attendance: {
          select: {
            status: true,
          },
        },
        client: {
          select: {
            name: true,
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
    if (!date) {
      return NextResponse.json({ error: 'Date and time are required' }, { status: 400 });
    }

    // Check if client exists and get trainer ID
    const client = await prisma.client.findFirst({
      where: {
        OR: [{ id: clientId }, { userId: session.user.id }],
      },
      include: {
        user: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Get trainer ID - either from client's user or from session (if user is trainer)
    const trainer = await prisma.user.findFirst({
      where: {
        OR: [{ id: client.user?.id }, { id: session.user.id }],
      },
    });

    if (!trainer) {
      return NextResponse.json({ error: 'Trainer not found' }, { status: 404 });
    }

    // Check for overlapping appointments
    const appointmentDate = new Date(date);
    const appointmentEnd = new Date(appointmentDate.getTime() + (duration || 30) * 60000);

    // First check if client already has an appointment at this time
    const existingClientAppointment = await prisma.appointment.findFirst({
      where: {
        clientId: client.id,
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
        userId: trainer.id,
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
        userId: trainer.id,
        clientId: client.id,
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
