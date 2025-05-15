import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '../auth/[...nextauth]/route';
import { Prisma } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';

    const where: Prisma.ClientWhereInput = {
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
    };

    const clients = await prisma.client.findMany({
      where,
      include: {
        appointments: {
          orderBy: {
            date: 'desc',
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

    const formattedClients = clients.map((client) => ({
      id: client.id,
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      notes: client.notes || '',
      status: client.status || 'active',
      appointmentsCount: client._count?.appointments || 0,
      lastAppointment: client.appointments[0]?.date || null,
    }));

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
    const { name, email, phone, notes } = data;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const client = await prisma.client.create({
      data: {
        name,
        email,
        phone,
        notes,
        userId: session.user.id,
        status: 'active',
      },
      include: {
        appointments: {
          orderBy: {
            date: 'desc',
          },
          take: 1,
        },
        _count: {
          select: { appointments: true },
        },
      },
    });

    const formattedClient = {
      id: client.id,
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      notes: client.notes || '',
      status: client.status || 'active',
      appointmentsCount: client._count?.appointments || 0,
      lastAppointment: client.appointments[0]?.date || null,
    };

    return NextResponse.json(formattedClient, { status: 201 });
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
  }
}
