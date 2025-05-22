import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hash } from 'bcryptjs';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { name, email, password, userCode, profession, role, phone = '' } = await req.json();

    // Validate required fields based on role
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (role === 'user' && !profession) {
      return NextResponse.json({ error: 'Profession is required for users' }, { status: 400 });
    }

    if (role === 'client' && !userCode) {
      return NextResponse.json({ error: 'User code is required for clients' }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    // For clients, check if user exists
    if (role === 'client') {
      const user = await prisma.user.findUnique({
        where: { refCode: userCode },
      });

      if (!user) {
        return NextResponse.json({ error: 'Invalid user code' }, { status: 400 });
      }

      // Create client profile linked to user
      const hashedPassword = await hash(password, 12);

      const client = await prisma.client.create({
        data: {
          name,
          email,
          phone,
          password: hashedPassword,
          userId: user.id,
        },
      });

      return NextResponse.json({
        message: 'Registration successful',
        client: {
          id: client.id,
          name: client.name,
          email: client.email,
          userId: user.id,
        },
      });
    }

    if (role === 'user') {
      // Generate unique refCode based on profession
      const refCode = `${profession.toLowerCase()}-${crypto.randomBytes(4).toString('hex')}`;
      // Create new user
      const hashedPassword = await hash(password, 12);
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          profession,
          refCode,
          role: 'user',
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
