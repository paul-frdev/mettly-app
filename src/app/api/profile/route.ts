import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        bio: true,
        profession: true,
        isClient: true,
      },
    });

    if (!user) {
      // Если пользователь не найден, проверяем клиента
      const client = await prisma.client.findUnique({
        where: {
          email: session.user.email,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      });

      if (!client) {
        return new NextResponse('User not found', { status: 404 });
      }

      return NextResponse.json({ ...client, isClient: true });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const data = await request.json();
    const { name, phone, bio, profession } = data;

    // Сначала проверяем, является ли пользователь клиентом
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isClient: true },
    });

    if (user?.isClient) {
      // Обновляем данные клиента
      const updatedClient = await prisma.client.update({
        where: {
          email: session.user.email,
        },
        data: {
          name: name || undefined,
          phone: phone || undefined,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      });

      return NextResponse.json({ ...updatedClient, isClient: true });
    } else {
      // Обновляем данные пользователя
      const updatedUser = await prisma.user.update({
        where: {
          email: session.user.email,
        },
        data: {
          name: name || undefined,
          phone: phone || undefined,
          bio: bio || undefined,
          profession: profession || undefined,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          bio: true,
          profession: true,
          isClient: true,
        },
      });

      return NextResponse.json(updatedUser);
    }
  } catch (error) {
    console.error('Profile update error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
