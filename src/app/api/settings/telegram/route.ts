import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { telegramEnabled } = data;

    // Update user's Telegram settings
    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        telegramRemindersEnabled: telegramEnabled,
      },
    });

    return NextResponse.json({
      message: 'Telegram settings updated successfully',
      settings: {
        telegramEnabled: updatedUser.telegramRemindersEnabled,
      },
    });
  } catch (error) {
    console.error('Error updating Telegram settings:', error);
    return NextResponse.json({ error: 'Failed to update Telegram settings' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        telegramRemindersEnabled: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      telegramEnabled: user.telegramRemindersEnabled,
    });
  } catch (error) {
    console.error('Error fetching Telegram settings:', error);
    return NextResponse.json({ error: 'Failed to fetch Telegram settings' }, { status: 500 });
  }
}
