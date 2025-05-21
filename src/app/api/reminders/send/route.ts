import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendAppointmentReminder } from '@/lib/telegram';

export async function POST(request: Request) {
  try {
    // Check bot secret token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    if (token !== process.env.BOT_SECRET_TOKEN) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get all users with telegramRemindersEnabled = true
    const users = await prisma.user.findMany({
      where: { telegramRemindersEnabled: true },
      include: {
        clients: {
          include: {
            appointments: {
              where: {
                date: {
                  gt: new Date(),
                },
                status: {
                  not: 'cancelled',
                },
                attendance: {
                  status: {
                    not: 'declined',
                  },
                },
              },
            },
          },
        },
      },
    });

    // Deduplicate appointments for each client
    for (const user of users) {
      for (const client of user.clients) {
        // Group appointments by date and time
        const appointmentsByTime = new Map();

        for (const appointment of client.appointments) {
          const timeKey = appointment.date.toISOString();
          if (!appointmentsByTime.has(timeKey)) {
            appointmentsByTime.set(timeKey, appointment);
          } else {
            // If we have duplicate appointments, keep the most recent one
            const existingAppointment = appointmentsByTime.get(timeKey);
            if (appointment.createdAt > existingAppointment.createdAt) {
              appointmentsByTime.set(timeKey, appointment);
            }
          }
        }

        // Replace client's appointments with deduplicated ones
        client.appointments = Array.from(appointmentsByTime.values());
      }
    }

    console.log(
      'Debug - Found users:',
      JSON.stringify(
        users.map((u) => ({
          id: u.id,
          name: u.name,
          telegramRemindersEnabled: u.telegramRemindersEnabled,
          reminderTimeHours: u.reminderTimeHours,
          clientsCount: u.clients.length,
          clients: u.clients.map((c) => ({
            id: c.id,
            name: c.name,
            telegramId: c.telegramId,
            appointmentsCount: c.appointments.length,
            appointments: c.appointments.map((a) => ({
              id: a.id,
              date: a.date,
              status: a.status,
            })),
          })),
        })),
        null,
        2
      )
    );

    const sentReminders = [];

    for (const user of users) {
      console.log(`Processing user: ${user.name}`);
      const reminderTimeHours = user.reminderTimeHours || 2;
      // Add 5 minutes buffer to ensure we don't miss the exact 2-hour mark
      const reminderTimeMs = reminderTimeHours * 60 * 60 * 1000 + 5 * 60 * 1000;

      for (const client of user.clients) {
        console.log(`Processing client: ${client.name}`);
        for (const appointment of client.appointments) {
          const appointmentTime = appointment.date.getTime();
          const now = Date.now();
          const timeUntilReminder = appointmentTime - now;

          console.log('Time calculation details:', {
            appointmentId: appointment.id,
            clientName: client.name,
            appointmentTime: new Date(appointmentTime).toISOString(),
            currentTime: new Date(now).toISOString(),
            reminderTimeHours: reminderTimeHours,
            reminderTimeMs: reminderTimeMs,
            timeUntilReminder: timeUntilReminder,
            timeUntilReminderHours: timeUntilReminder / (60 * 60 * 1000),
            shouldSend: timeUntilReminder <= reminderTimeMs && timeUntilReminder > 0,
          });

          // Send reminder if we're within 2 hours and 5 minutes of the appointment
          if (timeUntilReminder <= reminderTimeMs && timeUntilReminder > 0) {
            if (client.telegramId) {
              try {
                console.log(`Sending reminder to client ${client.name} (${client.telegramId})`);
                await sendAppointmentReminder(client.telegramId, appointment.date.toTimeString().split(' ')[0], appointment.id);

                // Create a reminder record
                await prisma.reminder.create({
                  data: {
                    type: 'telegram',
                    status: 'sent',
                    appointmentId: appointment.id,
                  },
                });

                sentReminders.push({
                  clientId: client.id,
                  appointmentId: appointment.id,
                  time: appointment.date,
                });

                console.log(`Reminder sent for appointment ${appointment.id}`);
              } catch (error) {
                console.error(`Failed to send reminder for appointment ${appointment.id}:`, error);
              }
            } else {
              console.log(`No telegram ID for client ${client.name}`);
            }
          } else {
            console.log(`Skipping reminder for appointment ${appointment.id} - too early or too late`);
          }
        }
      }
    }

    return NextResponse.json({
      message: 'Reminders sent successfully',
      sentReminders,
    });
  } catch (error) {
    console.error('Error sending reminders:', error);
    return NextResponse.json({ error: 'Failed to send reminders' }, { status: 500 });
  }
}
