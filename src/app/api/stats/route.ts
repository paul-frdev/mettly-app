import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { startOfMonth, endOfMonth } from 'date-fns';

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

    // Get monthly revenue
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());

    const monthlyPayments = await prisma.payment.findMany({
      where: {
        appointment: {
          userId: session.user.id,
        },
        createdAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      select: {
        amount: true,
      },
    });

    const monthlyRevenue = monthlyPayments.reduce((total, payment) => total + Number(payment.amount), 0);

    return NextResponse.json({
      upcomingAppointments,
      totalClients,
      monthlyRevenue,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
