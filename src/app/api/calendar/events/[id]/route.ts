import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const { start, end, status, description } = body;

    // Check if appointment exists and user has access
    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
    });

    if (!appointment) {
      return new NextResponse('Appointment not found', { status: 404 });
    }

    if (appointment.userId !== session.user.id) {
      return new NextResponse('Unauthorized to update this appointment', { status: 403 });
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: params.id },
      data: {
        date: start ? new Date(start) : undefined,
        duration: start && end ? Math.round((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60)) : undefined,
        notes: description,
        status,
      },
    });

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // Check if appointment exists and user has access
    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
    });

    if (!appointment) {
      return new NextResponse('Appointment not found', { status: 404 });
    }

    if (appointment.userId !== session.user.id) {
      return new NextResponse('Unauthorized to delete this appointment', { status: 403 });
    }

    await prisma.appointment.delete({
      where: { id: params.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
