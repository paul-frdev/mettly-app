import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import type { Client, Prisma } from '@prisma/client';
import { clientSchema, clientValidationErrors } from '@/lib/validations/client';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';

    const where = {
      userId: session.user.id,
      ...(search
        ? {
            OR: [
              {
                name: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                email: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                phone: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {}),
      ...(status !== 'all'
        ? {
            status: status,
          }
        : {}),
    } satisfies Prisma.ClientWhereInput;

    const clients = await prisma.client.findMany({
      where,
      include: {
        appointments: {
          include: {
            appointment: true,
          },
          orderBy: {
            appointment: {
              date: 'desc',
            },
          },
          take: 1,
        },
        _count: {
          select: { appointments: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedClients = clients.map(
      (
        client: Client & {
          _count: { appointments: number };
          appointments: { appointment: { date: Date } }[];
        }
      ) => ({
        id: client.id,
        name: client.name,
        email: client.email || '',
        phone: client.phone || '',
        notes: client.notes || '',
        status: client.status || 'active',
        appointmentsCount: client._count?.appointments || 0,
        lastAppointment: client.appointments[0]?.appointment?.date || null,
      })
    );

    return NextResponse.json(formattedClients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    // Validate the input data using Zod
    const validationResult = clientSchema.safeParse(data);
    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.errors[0].message }, { status: 400 });
    }

    const { name, email, phone, notes, telegramUsername } = validationResult.data;

    // Check for duplicate email
    const existingClientWithEmail = await prisma.client.findFirst({
      where: {
        userId: session.user.id,
        email: email,
      },
    });

    if (existingClientWithEmail) {
      return NextResponse.json({ error: clientValidationErrors.DUPLICATE_EMAIL }, { status: 400 });
    }

    // Check for duplicate phone
    const existingClientWithPhone = await prisma.client.findFirst({
      where: {
        userId: session.user.id,
        phone: phone,
      },
    });

    if (existingClientWithPhone) {
      return NextResponse.json({ error: clientValidationErrors.DUPLICATE_PHONE }, { status: 400 });
    }

    // Check for duplicate telegram username
    if (telegramUsername) {
      const existingClientWithTelegram = await prisma.client.findFirst({
        where: {
          userId: session.user.id,
          telegramUsername: telegramUsername,
        },
      });

      if (existingClientWithTelegram) {
        return NextResponse.json({ error: clientValidationErrors.DUPLICATE_TELEGRAM }, { status: 400 });
      }
    }

    const client = await prisma.client.create({
      data: {
        name,
        email,
        phone,
        notes: notes || null,
        telegramUsername: telegramUsername || null,
        userId: session.user.id,
        status: 'active',
        password: Math.random().toString(36).slice(-8), // Generate random password
      },
    });

    const clientWithIncludes = await prisma.client.findUnique({
      where: { id: client.id },
      include: {
        appointments: {
          include: {
            appointment: true,
          },
          orderBy: {
            appointment: {
              date: 'desc',
            },
          },
          take: 1,
        },
        _count: {
          select: { appointments: true },
        },
      },
    });

    const formattedClient = {
      id: clientWithIncludes!.id,
      name: clientWithIncludes!.name,
      email: clientWithIncludes!.email,
      phone: clientWithIncludes!.phone,
      notes: clientWithIncludes!.notes || '',
      status: clientWithIncludes!.status || 'active',
      appointmentsCount: clientWithIncludes!._count?.appointments || 0,
      lastAppointment: clientWithIncludes!.appointments[0]?.appointment?.date || null,
    };

    return NextResponse.json(formattedClient, { status: 201 });
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
  }
}
