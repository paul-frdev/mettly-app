import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

interface DaySchedule {
  enabled: boolean;
  start: string;
  end: string;
}

interface WorkingHours {
  [key: string]: DaySchedule;
}

const defaultWorkingHours: WorkingHours = {
  Monday: { enabled: true, start: '09:00', end: '18:00' },
  Tuesday: { enabled: true, start: '09:00', end: '18:00' },
  Wednesday: { enabled: true, start: '09:00', end: '18:00' },
  Thursday: { enabled: true, start: '09:00', end: '18:00' },
  Friday: { enabled: true, start: '09:00', end: '18:00' },
  Saturday: { enabled: false, start: '09:00', end: '18:00' },
  Sunday: { enabled: false, start: '09:00', end: '18:00' },
};

// GET /api/settings/business
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const settings = await prisma.businessSettings.findUnique({
      where: { userId: session.user.id },
    });

    // Return default settings if none exist
    if (!settings) {
      const defaultSettings = {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        workingHours: defaultWorkingHours,
        slotDuration: 30,
        holidays: [],
      };
      return NextResponse.json(defaultSettings);
    }

    // Parse workingHours JSON if it's a string
    let parsedWorkingHours: WorkingHours;
    try {
      const rawWorkingHours = typeof settings.workingHours === 'string' ? JSON.parse(settings.workingHours) : settings.workingHours;

      // Convert old format to new format if necessary
      if (!rawWorkingHours.Monday) {
        const oldFormat = rawWorkingHours;
        parsedWorkingHours = {
          Monday: { enabled: true, start: oldFormat.start, end: oldFormat.end },
          Tuesday: { enabled: true, start: oldFormat.start, end: oldFormat.end },
          Wednesday: { enabled: true, start: oldFormat.start, end: oldFormat.end },
          Thursday: { enabled: true, start: oldFormat.start, end: oldFormat.end },
          Friday: { enabled: true, start: oldFormat.start, end: oldFormat.end },
          Saturday: { enabled: false, start: oldFormat.start, end: oldFormat.end },
          Sunday: { enabled: false, start: oldFormat.start, end: oldFormat.end },
        };
      } else {
        parsedWorkingHours = rawWorkingHours;
      }
    } catch (error) {
      console.error('Error parsing working hours:', error);
      console.error('Original working hours:', settings.workingHours);
      parsedWorkingHours = defaultWorkingHours;
    }

    const responseData = {
      ...settings,
      workingHours: parsedWorkingHours,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Detailed error in business settings GET:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch business settings',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// PUT /api/settings/business
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Received settings update request:', body);

    const { timezone, workingHours, slotDuration, holidays } = body;

    // Validate required fields
    if (!timezone) {
      return NextResponse.json({ error: 'Timezone is required' }, { status: 400 });
    }

    if (!workingHours) {
      return NextResponse.json({ error: 'Working hours are required' }, { status: 400 });
    }

    // Check if at least one day is enabled
    const hasEnabledDay = Object.values(workingHours as WorkingHours).some((day) => day.enabled);
    if (!hasEnabledDay) {
      return NextResponse.json({ error: 'At least one working day must be enabled' }, { status: 400 });
    }

    if (typeof slotDuration !== 'number' || slotDuration <= 0) {
      return NextResponse.json({ error: 'Valid slot duration is required' }, { status: 400 });
    }

    // Ensure holidays is an array of dates
    const processedHolidays = (holidays || []).map((date: string | Date) => new Date(date));

    try {
      // Ensure workingHours is properly stringified for Prisma
      const workingHoursJson = typeof workingHours === 'string' ? workingHours : JSON.stringify(workingHours);

      console.log('Updating settings in database:', {
        userId: session.user.id,
        timezone,
        slotDuration,
        holidays: processedHolidays,
      });

      // Update or create business settings
      const settings = await prisma.businessSettings.upsert({
        where: { userId: session.user.id },
        update: {
          timezone,
          workingHours: workingHoursJson,
          slotDuration,
          holidays: processedHolidays,
        },
        create: {
          userId: session.user.id,
          timezone,
          workingHours: workingHoursJson,
          slotDuration,
          holidays: processedHolidays,
        },
      });

      console.log('Settings updated successfully:', settings);

      // Transform the data back for the response
      const responseData = {
        ...settings,
        workingHours: typeof settings.workingHours === 'string' ? JSON.parse(settings.workingHours) : settings.workingHours,
      };

      return NextResponse.json(responseData);
    } catch (prismaError) {
      console.error('Prisma error:', prismaError);
      return NextResponse.json(
        {
          error: 'Database error',
          details: prismaError instanceof Error ? prismaError.message : 'Unknown database error',
          stack: prismaError instanceof Error ? prismaError.stack : undefined,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Detailed error in business settings PUT:', error);
    return NextResponse.json(
      {
        error: 'Failed to update business settings',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
