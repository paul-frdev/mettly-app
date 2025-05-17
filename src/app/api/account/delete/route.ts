import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { compare } from 'bcryptjs';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });

    if (!user?.password) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify password
    const isValid = await compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 400 });
    }

    // Delete all user data
    await prisma.$transaction([
      // Delete all appointments
      prisma.appointment.deleteMany({
        where: { userId: session.user.id },
      }),
      // Delete all clients
      prisma.client.deleteMany({
        where: { userId: session.user.id },
      }),
      // Delete notification settings
      prisma.notificationSettings.deleteMany({
        where: { userId: session.user.id },
      }),
      // Delete the user
      prisma.user.delete({
        where: { id: session.user.id },
      }),
    ]);

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}
