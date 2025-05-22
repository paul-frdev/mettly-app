import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/settings
export async function GET(req: NextRequest) {
  const session = await getServerSession({ req, ...authOptions });
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        telegramRemindersEnabled: true,
        reminderTimeHours: true,
        refCode: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// PUT /api/settings
export async function PUT(req: NextRequest) {
  const session = await getServerSession({ req, ...authOptions });
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { telegramRemindersEnabled, reminderTimeHours } = body;

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        telegramRemindersEnabled,
        reminderTimeHours,
      },
      select: {
        telegramRemindersEnabled: true,
        reminderTimeHours: true,
        refCode: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
