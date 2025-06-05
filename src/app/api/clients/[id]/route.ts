import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { compare } from 'bcryptjs';

export async function GET(request: Request, context: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await prisma.client.findUnique({
      where: {
        id: context.params.id,
        userId: session.user.id,
      },
      include: {
        appointments: {
          orderBy: {
            date: 'desc',
          },
        },
        payments: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error('Error fetching client:', error);
    return NextResponse.json({ error: 'Failed to fetch client' }, { status: 500 });
  }
}

export async function PUT(request: Request, context: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, phone, notes, status } = await request.json();

    const client = await prisma.client.update({
      where: {
        id: context.params.id,
        userId: session.user.id,
      },
      data: {
        name,
        email,
        phone,
        notes,
        status,
      },
    });

    return NextResponse.json(client);
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: { id: string } } | { params: Promise<{ id: string }> }) {
  const params = 'then' in context.params ? await context.params : context.params;
  const { id } = params;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    const client = await prisma.client.findUnique({
      where: { id },
      select: { password: true, userId: true },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    if (session.user.id !== id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const isValid = await compare(password, client.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 400 });
    }

    const now = new Date();
    const activeAppointments = await prisma.appointment.findMany({
      where: {
        clientId: id,
        date: { gte: now },
        status: { not: 'cancelled' },
      },
    });

    if (activeAppointments.length > 0) {
      return NextResponse.json({ error: 'Нельзя удалить клиента с активными бронями. Сначала отмените или завершите все будущие записи.' }, { status: 400 });
    }

    await prisma.client.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 });
  }
}
