import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getServerSession({ req, ...authOptions });

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();

    // Update all appointments that are in the past and still scheduled
    await prisma.appointment.updateMany({
      where: {
        date: {
          lt: now,
        },
        status: 'scheduled',
        attendance: {
          status: {
            not: 'declined',
          },
        },
      },
      data: {
        status: 'completed',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating appointment statuses:', error);
    return NextResponse.json({ error: 'Failed to update appointment statuses' }, { status: 500 });
  }
}
