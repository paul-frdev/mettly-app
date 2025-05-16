import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { emailEnabled, browserEnabled, reminderTime } = body;

    // Validate the input
    if (typeof emailEnabled !== 'boolean' || typeof browserEnabled !== 'boolean' || !reminderTime) {
      return new NextResponse('Invalid input', { status: 400 });
    }

    // Update or create notification settings
    const settings = await prisma.notificationSettings.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        emailEnabled,
        browserEnabled,
        reminderTime,
      },
      create: {
        userId: session.user.id,
        emailEnabled,
        browserEnabled,
        reminderTime,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating notification settings:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
