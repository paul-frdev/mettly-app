import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET /api/appointments/[id]
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if the user is a client
    const client = session.user.email
      ? await prisma.client.findUnique({
          where: { email: session.user.email },
          select: { id: true, userId: true },
        })
      : null;

    // Build the query based on user type
    const whereClause: {
      id: string;
      clientId?: string;
      userId?: string;
    } = {
      id: params.id,
    };

    // If trainer, they can only see appointments they created
    // If client, they can only see their own appointments
    if (client) {
      whereClause.clientId = client.id;
    } else {
      whereClause.userId = session.user.id;
    }

    const appointment = await prisma.appointment.findFirst({
      where: whereClause,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        clients: {
          include: {
            client: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!appointment) {
      return new NextResponse('Appointment not found', { status: 404 });
    }

    // Трансформируем данные для включения информации о групповых клиентах
    const transformedAppointment = {
      ...appointment,
      clientIds: appointment.clients?.map(c => c.client.id) || [],
    };

    return NextResponse.json(transformedAppointment);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { cancellationReason } = body;

    // Find the appointment
    const appointmentToCancel = await prisma.appointment.findUnique({
      where: { id: params.id },
      select: { userId: true, clientId: true },
    });

    if (!appointmentToCancel) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Check if the user is authorized to cancel this appointment
    // User must be either the trainer who created the appointment or the client it's for
    const isTrainer = appointmentToCancel.userId === session.user.id;

    // Check if the user is a client
    const client = session.user.email
      ? await prisma.client.findUnique({
          where: { email: session.user.email },
          select: { id: true, userId: true },
        })
      : null;

    // Check if the client ID matches the appointment client ID
    let isAppointmentClient = client && appointmentToCancel.clientId === client.id;

    // Try to get the full appointment details to see if there's any issue with the client ID
    const fullAppointment = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: {
        client: true,
      },
    });

    // If the client ID doesn't match, check if the appointment has a special "self" clientId
    if (!isAppointmentClient && fullAppointment?.clientId === 'self') {
      isAppointmentClient = true;
    }

    // If the client ID doesn't match, check if the client email matches the appointment client email
    if (!isAppointmentClient && client && fullAppointment?.client?.email === session.user.email) {
      isAppointmentClient = true;
    }

    // If the client ID and email don't match, check if the client user ID matches the appointment client user ID
    if (!isAppointmentClient && client && fullAppointment?.client?.userId === session.user.id) {
      isAppointmentClient = true;
    }

    // Allow trainers to delete any appointment, but clients can only delete their own
    if (!isTrainer && !isAppointmentClient) {
      return NextResponse.json({ error: 'You can only cancel your own appointments' }, { status: 403 });
    }

    // Instead of deleting, mark as cancelled
    const appointment = await prisma.appointment.update({
      where: {
        id: params.id,
      },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancellationReason: cancellationReason || 'No reason provided',
        // If it's a client cancelling, we need to use the client's user ID, not the client ID
        cancelledById: isAppointmentClient && client ? client.userId : session.user.id,
      },
    });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    return NextResponse.json({ error: 'Failed to cancel appointment' }, { status: 500 });
  }
}

interface AppointmentUpdateData {
  date?: Date;
  status?: string;
  cancelledAt?: Date;
  cancellationReason?: string;
  cancelledById?: string;
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { date, cancellationReason } = body;

    // Find the appointment
    const appointmentToUpdate = await prisma.appointment.findUnique({
      where: { id: params.id },
      select: { userId: true, clientId: true },
    });

    if (!appointmentToUpdate) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // If cancelling, check authorization
    if (cancellationReason) {
      // Check if the user is authorized to cancel this appointment
      // User must be either the trainer who created the appointment or the client it's for
      const isTrainer = appointmentToUpdate.userId === session.user.id;

      // Check if the user is a client
      const client = session.user.email
        ? await prisma.client.findUnique({
            where: { email: session.user.email },
            select: { id: true, userId: true },
          })
        : null;

      // Check if the client ID matches the appointment client ID
      let isAppointmentClient = client && appointmentToUpdate.clientId === client.id;

      // Try to get the full appointment details to see if there's any issue with the client ID
      const fullAppointment = await prisma.appointment.findUnique({
        where: { id: params.id },
        include: {
          client: true,
        },
      });

      // If the client ID doesn't match, check if the appointment has a special "self" clientId
      if (!isAppointmentClient && fullAppointment?.clientId === 'self') {
        isAppointmentClient = true;
      }

      // If the client ID doesn't match, check if the client email matches the appointment client email
      if (!isAppointmentClient && client && fullAppointment?.client?.email === session.user.email) {
        isAppointmentClient = true;
      }

      // If the client ID and email don't match, check if the client user ID matches the appointment client user ID
      if (!isAppointmentClient && client && fullAppointment?.client?.userId === session.user.id) {
        isAppointmentClient = true;
      }

      // Allow trainers to cancel any appointment, but clients can only cancel their own
      if (!isTrainer && !isAppointmentClient) {
        return NextResponse.json({ error: 'You can only cancel your own appointments' }, { status: 403 });
      }
    }

    const updateData: AppointmentUpdateData = {};

    if (date) {
      updateData.date = new Date(date);
    }

    if (cancellationReason) {
      updateData.status = 'cancelled';
      updateData.cancelledAt = new Date();
      updateData.cancellationReason = cancellationReason;

      // Check if the user is a client
      const client = session.user.email
        ? await prisma.client.findUnique({
            where: { email: session.user.email },
            select: { id: true, userId: true },
          })
        : null;

      // Check if the client ID matches the appointment client ID
      let isAppointmentClient = client && appointmentToUpdate.clientId === client.id;

      // Try to get the full appointment details to see if there's any issue with the client ID
      const fullAppointment = await prisma.appointment.findUnique({
        where: { id: params.id },
        include: {
          client: true,
        },
      });

      // If the client ID doesn't match, check if the appointment has a special "self" clientId
      if (!isAppointmentClient && fullAppointment?.clientId === 'self') {
        isAppointmentClient = true;
      }

      // If the client ID doesn't match, check if the client email matches the appointment client email
      if (!isAppointmentClient && client && fullAppointment?.client?.email === session.user.email) {
        isAppointmentClient = true;
      }

      // If the client ID and email don't match, check if the client user ID matches the appointment client user ID
      if (!isAppointmentClient && client && fullAppointment?.client?.userId === session.user.id) {
        isAppointmentClient = true;
      }

      // If it's a client cancelling, we need to use the client's user ID, not the client ID
      updateData.cancelledById = isAppointmentClient && client ? client.userId : session.user.id;
    }

    const appointment = await prisma.appointment.update({
      where: {
        id: params.id,
      },
      data: updateData,
    });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
  }
}

// PUT /api/appointments/[id] - Update appointment
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { date, duration, notes, type, isPaid, price, maxClients, clientId, clientIds } = body;

    // Validate required fields
    if (!date || !duration) {
      return NextResponse.json({ error: 'Date and duration are required' }, { status: 400 });
    }

    // Check if the user is a client
    const client = session.user.email
      ? await prisma.client.findUnique({
          where: { email: session.user.email },
          select: { id: true, userId: true },
        })
      : null;

    // Verify the appointment exists and user has permission to update it
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: {
        client: {
          select: { id: true, userId: true, email: true },
        },
      },
    });

    if (!existingAppointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Permission check: trainers can update their appointments, clients can only update their own
    const isTrainer = !client;
    const isOwnAppointment = client && (
      existingAppointment.clientId === client.id ||
      existingAppointment.clientId === 'self' ||
      existingAppointment.client?.email === session.user.email ||
      existingAppointment.client?.userId === session.user.id
    );

    if (!isTrainer && !isOwnAppointment) {
      return NextResponse.json({ error: 'Forbidden: You can only update your own appointments' }, { status: 403 });
    }

    // If trainer owns the appointment, they can update it
    if (isTrainer && existingAppointment.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden: You can only update appointments you created' }, { status: 403 });
    }

    // Prepare update data
    const updateData: {
      date: Date;
      duration: number;
      notes?: string | null;
      type?: string;
      isPaid?: boolean;
      price?: number | null;
      maxClients?: number | null;
      clientId?: string | null;
    } = {
      date: new Date(date),
      duration: parseInt(duration),
      notes: notes || null,
      type: type || 'individual',
      isPaid: isPaid || false,
      price: isPaid ? (price || 0) : null,
      maxClients: type === 'group' ? (maxClients || 2) : null,
    };

    // Handle client assignment for different appointment types
    if (type === 'group') {
      updateData.clientId = null;
      
      // Validate group appointment data
      if (!clientIds || !Array.isArray(clientIds) || clientIds.length === 0) {
        return NextResponse.json({ error: 'Group appointments require at least one client' }, { status: 400 });
      }
    } else {
      // Individual appointment
      if (client) {
        // Client updating their own appointment
        updateData.clientId = client.id;
      } else {
        // Trainer updating appointment
        updateData.clientId = clientId === 'self' ? 'self' : clientId;
      }
    }

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Update the main appointment
      await tx.appointment.update({
        where: { id: params.id },
        data: updateData,
      });

      // Handle group clients if it's a group appointment
      if (type === 'group' && clientIds && Array.isArray(clientIds)) {
        // Remove existing client associations
        await tx.clientOnAppointment.deleteMany({
          where: { appointmentId: params.id },
        });

        // Add new client associations
        if (clientIds.length > 0) {
          const clientAppointments = clientIds.map((clientId: string) => ({
            appointmentId: params.id,
            clientId: clientId,
            status: 'confirmed',
          }));

          await tx.clientOnAppointment.createMany({
            data: clientAppointments,
          });
        }
      }

      // Fetch the updated appointment with all related data
      const finalAppointment = await tx.appointment.findUnique({
        where: { id: params.id },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          clients: {
            include: {
              client: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      return finalAppointment;
    });

    if (!result) {
      return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
    }

    // Transform the result to include clientIds
    const transformedResult = {
      ...result,
      clientIds: result.clients?.map(c => c.client.id) || [],
    };

    return NextResponse.json(transformedResult);
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
  }
}
