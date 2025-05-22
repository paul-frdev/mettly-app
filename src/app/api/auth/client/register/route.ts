import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { name, email, password, trainerCode, phone = '' } = await req.json();

    // Validate required fields
    if (!name || !email || !password || !trainerCode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if trainer exists with this refCode
    const trainer = await prisma.user.findFirst({
      where: {
        refCode: trainerCode,
        isClient: false, // Ensure it's a trainer, not a client
      },
    });

    if (!trainer) {
      return NextResponse.json({ error: 'Invalid trainer code' }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    // Create new user
    const hashedPassword = await hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        plan: 'free',
        isClient: true,
      },
    });

    // Create client profile linked to trainer
    const client = await prisma.client.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        userId: trainer.id,
      },
    });

    return NextResponse.json({
      message: 'Registration successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      client: {
        id: client.id,
        trainerId: trainer.id,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
