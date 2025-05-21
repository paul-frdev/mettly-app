import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // Check for bot secret token
    const authHeader = request.headers.get('authorization');
    if (authHeader === `Bearer ${process.env.BOT_SECRET_TOKEN}`) {
      // Bot request - proceed with telegramId attachment
      const data = await request.json();
      const { telegramId, username } = data;

      if (!telegramId || !username) {
        return NextResponse.json({ error: 'Telegram ID and username are required' }, { status: 400 });
      }

      // Find client by telegramUsername
      const client = await prisma.client.findFirst({
        where: {
          telegramUsername: username,
        },
      });

      if (!client) {
        return NextResponse.json({ error: 'Client not found with this Telegram username' }, { status: 404 });
      }

      // Check if telegramId is already used
      const existingClient = await prisma.client.findFirst({
        where: {
          telegramId: telegramId,
        },
      });

      if (existingClient) {
        return NextResponse.json({ error: 'This Telegram account is already linked to another client' }, { status: 400 });
      }

      // Update client with telegramId
      const updatedClient = await prisma.client.update({
        where: {
          id: client.id,
        },
        data: {
          telegramId: telegramId,
        },
      });

      return NextResponse.json({
        message: 'Telegram account linked successfully',
        client: {
          id: updatedClient.id,
          name: updatedClient.name,
          telegramId: updatedClient.telegramId,
        },
      });
    }

    // Regular user request - check session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { telegramId, telegramUsername } = data;

    if (!telegramId || !telegramUsername) {
      return NextResponse.json({ error: 'Telegram ID and username are required' }, { status: 400 });
    }

    // Find client by telegramUsername
    const client = await prisma.client.findFirst({
      where: {
        userId: session.user.id,
        telegramUsername: telegramUsername,
      },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found with this Telegram username' }, { status: 404 });
    }

    // Check if telegramId is already used
    const existingClient = await prisma.client.findFirst({
      where: {
        telegramId: telegramId,
      },
    });

    if (existingClient) {
      return NextResponse.json({ error: 'This Telegram account is already linked to another client' }, { status: 400 });
    }

    // Update client with telegramId
    const updatedClient = await prisma.client.update({
      where: {
        id: client.id,
      },
      data: {
        telegramId: telegramId,
      },
    });

    return NextResponse.json({
      message: 'Telegram account linked successfully',
      client: {
        id: updatedClient.id,
        name: updatedClient.name,
        telegramId: updatedClient.telegramId,
      },
    });
  } catch (error) {
    console.error('Error attaching Telegram:', error);
    return NextResponse.json({ error: 'Failed to attach Telegram account' }, { status: 500 });
  }
}
