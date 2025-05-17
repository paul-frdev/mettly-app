import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET /api/settings/business
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', session);

    if (!session?.user?.id) {
      console.log('No session or user ID');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Fetching settings for user:', session.user.id);

    const settings = await prisma.businessSettings.findUnique({
      where: { userId: session.user.id },
    });

    console.log('Retrieved settings:', settings);

    // Return default settings if none exist
    if (!settings) {
      const defaultSettings = {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        workingHours: {
          start: '09:00',
          end: '18:00',
        },
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        slotDuration: 30,
        holidays: [],
      };
      console.log('Returning default settings:', defaultSettings);
      return NextResponse.json(defaultSettings);
    }

    // Parse workingHours JSON if it's a string
    const parsedSettings = {
      ...settings,
      workingHours: typeof settings.workingHours === 'string' ? JSON.parse(settings.workingHours) : settings.workingHours,
    };

    return NextResponse.json(parsedSettings);
  } catch (error) {
    console.error('Detailed error in business settings GET:', error);
    return NextResponse.json({ error: 'Failed to fetch business settings', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

// PUT /api/settings/business
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session in PUT:', session);

    if (!session?.user?.id) {
      console.log('No session or user ID in PUT');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Received body:', body);

    const { timezone, workingHours, workingDays, slotDuration, holidays } = body;

    // Validate required fields
    if (!timezone) {
      return NextResponse.json({ error: 'Timezone is required' }, { status: 400 });
    }

    if (!workingHours || !workingHours.start || !workingHours.end) {
      return NextResponse.json({ error: 'Working hours (start and end) are required' }, { status: 400 });
    }

    if (!Array.isArray(workingDays) || workingDays.length === 0) {
      return NextResponse.json({ error: 'Working days array is required' }, { status: 400 });
    }

    if (typeof slotDuration !== 'number' || slotDuration <= 0) {
      return NextResponse.json({ error: 'Valid slot duration is required' }, { status: 400 });
    }

    // Ensure holidays is an array of dates
    const processedHolidays = (holidays || []).map((date: string | Date) => new Date(date));

    try {
      // Ensure workingHours is properly stringified for Prisma
      const workingHoursJson = typeof workingHours === 'string' ? workingHours : JSON.stringify(workingHours);

      // Update or create business settings
      const settings = await prisma.businessSettings.upsert({
        where: { userId: session.user.id },
        update: {
          timezone,
          workingHours: workingHoursJson,
          workingDays,
          slotDuration,
          holidays: processedHolidays,
        },
        create: {
          userId: session.user.id,
          timezone,
          workingHours: workingHoursJson,
          workingDays,
          slotDuration,
          holidays: processedHolidays,
        },
      });

      console.log('Updated/Created settings:', settings);

      // Transform the data back for the response
      const responseData = {
        ...settings,
        workingHours: typeof settings.workingHours === 'string' ? JSON.parse(settings.workingHours) : settings.workingHours,
      };

      return NextResponse.json(responseData);
    } catch (prismaError) {
      console.error('Prisma error:', prismaError);
      return NextResponse.json({ error: 'Database error', details: prismaError instanceof Error ? prismaError.message : 'Unknown database error' }, { status: 500 });
    }
  } catch (error) {
    console.error('Detailed error in business settings PUT:', error);
    return NextResponse.json({ error: 'Failed to update business settings', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
