import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  try {
    const client = await prisma.client.findUnique({
      where: { email },
    });

    return NextResponse.json({ isClient: !!client });
  } catch (error) {
    console.error('Error checking client status:', error);
    return NextResponse.json({ error: 'Failed to check client status' }, { status: 500 });
  }
}
