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
      },
    });

    if (!appointment) {
      return new NextResponse('Appointment not found', { status: 404 });
    }

    return NextResponse.json(appointment);
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

    // Check if the user is a client
    const client = session.user.email
      ? await prisma.client.findUnique({
          where: { email: session.user.email },
          select: { id: true, userId: true },
        })
      : null;

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
    const isAppointmentClient = client && appointmentToCancel.clientId === client.id;

    if (!isTrainer && !isAppointmentClient) {
      return NextResponse.json({ error: 'Not authorized to cancel this appointment' }, { status: 403 });
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
        cancelledById: isAppointmentClient ? client.userId : session.user.id,
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

    // Check if the user is a client
    const client = session.user.email
      ? await prisma.client.findUnique({
          where: { email: session.user.email },
          select: { id: true, userId: true },
        })
      : null;

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
      const isAppointmentClient = client && appointmentToUpdate.clientId === client.id;

      if (!isTrainer && !isAppointmentClient) {
        return NextResponse.json({ error: 'Not authorized to cancel this appointment' }, { status: 403 });
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

      // If it's a client cancelling, we need to use the client's user ID, not the client ID
      const isAppointmentClient = client && client.id === appointmentToUpdate.clientId;
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
