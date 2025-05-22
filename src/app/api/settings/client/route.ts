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

    const client = await prisma.client.findUnique({
      where: { email: session.user.email },
      select: {
        telegramRemindersEnabled: true,
        reminderTimeHours: true,
      },
    });

    if (!client) {
      return new NextResponse('Client not found', { status: 404 });
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error('Error fetching client settings:', error);
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
    const { telegramRemindersEnabled, reminderTimeHours } = body;

    const client = await prisma.client.update({
      where: { email: session.user.email },
      data: {
        ...(telegramRemindersEnabled !== undefined && {
          telegramRemindersEnabled,
        }),
        ...(reminderTimeHours !== undefined && { reminderTimeHours }),
      },
    });

    return NextResponse.json(client);
  } catch (error) {
    console.error('Error updating client settings:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
