import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        telegramRemindersEnabled: true,
        reminderTimeHours: true,
        refCode: true,
        timezone: true,
        workingHours: true,
        slotDuration: true,
        holidays: true,
      },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching trainer settings:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { telegramRemindersEnabled, reminderTimeHours, timezone, workingHours, slotDuration, holidays } = body;

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        ...(telegramRemindersEnabled !== undefined && {
          telegramRemindersEnabled,
        }),
        ...(reminderTimeHours !== undefined && { reminderTimeHours }),
        ...(timezone !== undefined && { timezone }),
        ...(workingHours !== undefined && { workingHours }),
        ...(slotDuration !== undefined && { slotDuration }),
        ...(holidays !== undefined && { holidays }),
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating trainer settings:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
