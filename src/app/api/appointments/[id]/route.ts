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

    const appointment = await prisma.appointment.findUnique({
      where: {
        id: params.id,
        userId: session.user.id, // Ensure user owns the appointment
      },
      include: {
        client: {
          select: {
            name: true,
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

    // Instead of deleting, mark as cancelled
    const appointment = await prisma.appointment.update({
      where: {
        id: params.id,
      },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
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
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { date, cancellationReason } = body;

    const updateData: AppointmentUpdateData = {};

    if (date) {
      updateData.date = new Date(date);
    }

    if (cancellationReason) {
      updateData.status = 'cancelled';
      updateData.cancelledAt = new Date();
      updateData.cancellationReason = cancellationReason;
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
