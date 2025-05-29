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
    const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000);

    // Обновляем статус прошедших встреч
    const updatedAppointments = await prisma.appointment.updateMany({
      where: {
        AND: [
          {
            OR: [
              // Встречи, которые уже закончились (время начала + длительность < текущее время)
              {
                date: {
                  lt: new Date(localNow.getTime() - 30 * 60000), // Вычитаем 30 минут (минимальная длительность)
                },
              },
              // Встречи, которые уже начались и их длительность прошла
              {
                AND: [
                  {
                    date: {
                      lt: localNow,
                    },
                  },
                  {
                    duration: {
                      lte: Math.floor((localNow.getTime() - new Date().getTime()) / 60000),
                    },
                  },
                ],
              },
            ],
          },
          {
            status: {
              not: 'cancelled',
            },
          },
          {
            status: {
              not: 'completed',
            },
          },
        ],
      },
      data: {
        status: 'completed',
      },
    });

    return NextResponse.json({
      success: true,
      updated: updatedAppointments.count,
      timestamp: localNow.toISOString(),
    });
  } catch (error) {
    console.error('Error updating appointment statuses:', error);
    return NextResponse.json({ error: 'Failed to update appointment statuses' }, { status: 500 });
  }
}
