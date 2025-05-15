import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '../auth/[...nextauth]/route';

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { name, phone, bio, profession } = data;

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
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
