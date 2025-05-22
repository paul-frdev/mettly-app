import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

const defaultWorkingHours = {
  Monday: { enabled: true, start: '09:00', end: '17:00' },
  Tuesday: { enabled: true, start: '09:00', end: '17:00' },
  Wednesday: { enabled: true, start: '09:00', end: '17:00' },
  Thursday: { enabled: true, start: '09:00', end: '17:00' },
  Friday: { enabled: true, start: '09:00', end: '17:00' },
  Saturday: { enabled: false, start: '10:00', end: '15:00' },
  Sunday: { enabled: false, start: '10:00', end: '15:00' },
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Сначала проверяем, является ли пользователь клиентом
    const client = await prisma.client.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        userId: true,
        telegramRemindersEnabled: true,
        reminderTimeHours: true,
      },
    });

    if (client) {
      // Если это клиент, получаем настройки его тренера
      const trainer = await prisma.user.findUnique({
        where: { id: client.userId },
        select: {
          refCode: true,
          businessSettings: {
            select: {
              timezone: true,
              workingHours: true,
              slotDuration: true,
              holidays: true,
            },
          },
        },
      });

      if (!trainer) {
        return new NextResponse('Trainer not found', { status: 404 });
      }

      // Parse workingHours if it's a string
      let workingHours = trainer.businessSettings?.workingHours;
      if (typeof workingHours === 'string') {
        try {
          workingHours = JSON.parse(workingHours);
        } catch (e) {
          console.error('Error parsing workingHours:', e);
          workingHours = defaultWorkingHours;
        }
      }

      // If workingHours is empty or undefined, use default
      if (!workingHours || Object.keys(workingHours).length === 0) {
        workingHours = defaultWorkingHours;
      }

      const response = {
        ...client,
        refCode: trainer.refCode,
        timezone: trainer.businessSettings?.timezone || 'UTC',
        workingHours,
        slotDuration: trainer.businessSettings?.slotDuration || 30,
        holidays: trainer.businessSettings?.holidays || [],
      };

      return NextResponse.json(response);
    }

    // Если это тренер, получаем его настройки
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        refCode: true,
        telegramRemindersEnabled: true,
        reminderTimeHours: true,
        businessSettings: {
          select: {
            timezone: true,
            workingHours: true,
            slotDuration: true,
            holidays: true,
          },
        },
      },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }
    // Parse workingHours if it's a string
    let workingHours = user.businessSettings?.workingHours;
    if (typeof workingHours === 'string') {
      try {
        workingHours = JSON.parse(workingHours);
      } catch (e) {
        console.error('Error parsing workingHours:', e);
        workingHours = defaultWorkingHours;
      }
    }

    // If workingHours is empty or undefined, use default
    if (!workingHours || Object.keys(workingHours).length === 0) {
      workingHours = defaultWorkingHours;
    }

    const response = {
      ...user,
      timezone: user.businessSettings?.timezone || 'UTC',
      workingHours,
      slotDuration: user.businessSettings?.slotDuration || 30,
      holidays: user.businessSettings?.holidays || [],
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching user settings:', error);
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

    // Ensure workingHours has default values if empty
    const finalWorkingHours = workingHours && Object.keys(workingHours).length > 0 ? workingHours : defaultWorkingHours;

    // Update user settings
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        ...(telegramRemindersEnabled !== undefined && {
          telegramRemindersEnabled,
        }),
        ...(reminderTimeHours !== undefined && { reminderTimeHours }),
        businessSettings: {
          upsert: {
            create: {
              timezone: timezone || 'UTC',
              workingHours: finalWorkingHours,
              slotDuration: slotDuration || 30,
              holidays: holidays || [],
            },
            update: {
              ...(timezone !== undefined && { timezone }),
              ...(workingHours !== undefined && { workingHours: finalWorkingHours }),
              ...(slotDuration !== undefined && { slotDuration }),
              ...(holidays !== undefined && { holidays }),
            },
          },
        },
      },
      include: {
        businessSettings: true,
      },
    });

    // Parse workingHours for response
    let responseWorkingHours = user.businessSettings?.workingHours;
    if (typeof responseWorkingHours === 'string') {
      try {
        responseWorkingHours = JSON.parse(responseWorkingHours);
      } catch (error) {
        console.error(error);
        responseWorkingHours = defaultWorkingHours;
      }
    }

    return NextResponse.json({
      ...user,
      timezone: user.businessSettings?.timezone,
      workingHours: responseWorkingHours || defaultWorkingHours,
      slotDuration: user.businessSettings?.slotDuration,
      holidays: user.businessSettings?.holidays,
    });
  } catch (error) {
    console.error('Error updating user settings:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
