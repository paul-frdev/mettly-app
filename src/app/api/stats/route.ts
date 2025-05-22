import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if user is a client
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isClient: true },
    });

    if (user?.isClient) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Get upcoming appointments count
    const upcomingAppointments = await prisma.appointment.count({
      where: {
        userId: session.user.id,
        date: {
          gte: new Date(),
        },
        status: 'scheduled',
      },
    });

    // Get total clients count
    const totalClients = await prisma.client.count({
      where: {
        userId: session.user.id,
        status: 'active',
      },
    });

    return NextResponse.json({
      upcomingAppointments,
      totalClients,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
