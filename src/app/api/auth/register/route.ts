import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hash } from 'bcryptjs';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { name, email, password, trainerCode, profession, role, phone = '' } = await req.json();

    // Validate required fields based on role
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (role === 'trainer' && !profession) {
      return NextResponse.json({ error: 'Profession is required for trainers' }, { status: 400 });
    }

    if (role === 'client' && !trainerCode) {
      return NextResponse.json({ error: 'Trainer code is required for clients' }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    // For clients, check if trainer exists
    if (role === 'client') {
      const trainer = await prisma.user.findUnique({
        where: { refCode: trainerCode },
      });

      if (!trainer) {
        return NextResponse.json({ error: 'Invalid trainer code' }, { status: 400 });
      }

      // Create client profile linked to trainer
      const hashedPassword = await hash(password, 12);
      console.log('Creating client with hashed password:', hashedPassword);
      const client = await prisma.client.create({
        data: {
          name,
          email,
          phone,
          password: hashedPassword,
          userId: trainer.id,
        },
      });
      console.log('Created client:', client);

      return NextResponse.json({
        message: 'Registration successful',
        client: {
          id: client.id,
          name: client.name,
          email: client.email,
          trainerId: trainer.id,
        },
      });
    }

    // For trainers
    if (role === 'trainer') {
      // Generate unique refCode based on profession
      const refCode = `${profession.toLowerCase()}-${crypto.randomBytes(4).toString('hex')}`;

      // Create new trainer
      const hashedPassword = await hash(password, 12);
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          profession,
          refCode,
          role: 'trainer',
          plan: 'free',
        },
      });

      return NextResponse.json({
        message: 'Registration successful',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          refCode: user.refCode,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
