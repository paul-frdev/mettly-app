import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    // Check bot secret token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    if (token !== process.env.BOT_SECRET_TOKEN) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { telegramId, appointmentId, response } = await request.json();

    if (!telegramId || !appointmentId || !response) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find client by telegram ID
    const client = await prisma.client.findFirst({
      where: { telegramId },
      include: {
        appointments: {
          where: { id: appointmentId },
          include: {
            attendance: true,
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    if (client.appointments.length === 0) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Create or update attendance record
    const attendance = await prisma.attendance.upsert({
      where: {
        appointmentId,
      },
      update: {
        status: response === 'yes' ? 'confirmed' : 'declined',
      },
      create: {
        appointmentId,
        status: response === 'yes' ? 'confirmed' : 'declined',
      },
    });

    // If client declined, mark appointment as cancelled
    if (response === 'no') {
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          status: 'cancelled',
          cancelledAt: new Date(),
          cancellationReason: 'Client declined via Telegram',
        },
      });
    }

    return NextResponse.json({
      message: 'Attendance updated successfully',
      attendance,
    });
  } catch (error) {
    console.error('Error updating attendance:', error);
    return NextResponse.json({ error: 'Failed to update attendance' }, { status: 500 });
  }
}
