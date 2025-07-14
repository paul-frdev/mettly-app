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

    // Сначала проверяем, является ли пользователь клиентом
    const client = await prisma.client.findUnique({
      where: { email: session.user.email },
      select: { id: true, userId: true },
    });
    // Get trainer ID - either from client's user or from session (if user is trainer)
    const trainer = await prisma.user.findFirst({
      where: {
        OR: [{ id: client?.userId }, { id: session.user.id }],
      },
    });

    if (!trainer) {
      return NextResponse.json({ error: 'Trainer not found' }, { status: 404 });
    }

    if (client) {
      // Если это клиент, обновляем статусы его встреч
      const now = new Date();
      // Получаем текущее время в локальной временной зоне
      const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000);

      // Обновляем статус прошедших встреч
      await prisma.appointment.updateMany({
        where: {
          clientId: client.id,
          AND: [
            {
              date: {
                lt: localNow,
              },
            },
            {
              status: {
                not: 'cancelled',
              },
            },
            {
              status: {
                not: 'completed',
              },
            },
          ],
        },
        data: {
          status: 'completed',
        },
      });

      // Получаем все встречи тренера
      const appointments = await prisma.appointment.findMany({
        where: {
          AND: [
            {
              OR: [
                // Свои встречи
                {
                  clientId: client.id,
                },
                // Занятые слоты тренера
                {
                  userId: client.userId,
                  clientId: {
                    not: client.id,
                  },
                },
              ],
            },
            {
              OR: [{ attendance: null }, { attendance: { status: { not: 'declined' } } }],
            },
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
              id: true,
              name: true,
              userId: true,
            },
          },
        },
        orderBy: {
          date: 'asc',
        },
      });

      // Фильтруем встречи для списка (только свои) и календаря (все)
      const ownAppointments = appointments.filter((appointment) => appointment.clientId === client.id);
      const busySlots = appointments.filter((appointment) => appointment.clientId !== client.id);

      // Для календаря: объединяем свои встречи и занятые слоты
      const calendarSlots = [...ownAppointments, ...busySlots].map((appointment) => ({
        ...appointment,
        clientId: appointment.clientId === client.id ? 'self' : appointment.clientId,
        client:
          appointment.clientId === client.id
            ? appointment.client
            : {
                id: 'busy',
                name: 'Busy',
                userId: client.userId,
              },
      }));

      // Возвращаем разные данные для разных целей
      return NextResponse.json({
        list: ownAppointments,
        calendar: calendarSlots,
      });
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
    const { date, clientId, duration, notes, type, isPaid, price, maxClients, clientIds } = body;

    // Validate required fields
    if (!date) {
      return NextResponse.json({ error: 'Date and time are required' }, { status: 400 });
    }

    if (type !== 'group' && !clientId) {
      return NextResponse.json({ error: 'Client ID is required for individual appointments' }, { status: 400 });
    }

    if (type === 'group' && (!clientIds || !Array.isArray(clientIds) || clientIds.length === 0)) {
      return NextResponse.json({ error: 'At least one client ID is required for group appointments' }, { status: 400 });
    }

    // Check if the current user is a client trying to create a group appointment
    const isClientUser = await prisma.client.findUnique({
      where: { email: session.user.email || '' },
    });

    if (type === 'group' && isClientUser) {
      return NextResponse.json({ error: 'Only trainers can create group appointments' }, { status: 403 });
    }

    let client;
    let trainer;

    // If clientId is 'self', find the client record for the current user
    if (clientId === 'self') {
      if (!session.user.email) {
        return NextResponse.json({ error: 'User email not found' }, { status: 400 });
      }

      client = await prisma.client.findFirst({
        where: {
          email: session.user.email,
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
        return NextResponse.json({ error: 'Client profile not found' }, { status: 404 });
      }

      // For self-booking, the trainer is the client's trainer
      trainer = await prisma.user.findUnique({
        where: {
          id: client.userId,
        },
      });
    } else {
      // For trainer booking, find the client and trainer as before
      if (clientId) {
        client = await prisma.client.findUnique({
          where: {
            id: clientId,
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
      }

      trainer = await prisma.user.findUnique({
        where: {
          id: session.user.id,
        },
      });
    }

    if (!trainer) {
      return NextResponse.json({ error: 'Trainer not found' }, { status: 404 });
    }

    // Check for overlapping appointments
    const appointmentDate = new Date(date);
    const appointmentEnd = new Date(appointmentDate.getTime() + (duration || 30) * 60000);

    // First check if client already has an appointment at this time
    if (client && type === 'individual') {
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
    if (type === 'group') {
      const appointment = await prisma.appointment.create({
        data: {
          date: appointmentDate,
          duration: duration || 30,
          notes: notes,
          userId: trainer.id,
          type: 'group',
          isPaid: isPaid || false,
          price: isPaid ? price : null,
          maxClients: maxClients || null,
        },
      });

      // Add all selected clients to the group appointment
      if (clientIds && Array.isArray(clientIds) && clientIds.length > 0) {
        const clientAppointments = clientIds.map((clientId) => ({
          appointmentId: appointment.id,
          clientId: clientId,
          status: 'confirmed',
        }));

        await prisma.clientOnAppointment.createMany({
          data: clientAppointments,
        });
      }

      return NextResponse.json(appointment);
    } else if (client) {
      const appointment = await prisma.appointment.create({
        data: {
          date: appointmentDate,
          duration: duration || 30,
          notes: notes,
          userId: trainer.id,
          clientId: client.id,
          type: 'individual',
          isPaid: isPaid || false,
          price: isPaid ? price : null,
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
    }
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
