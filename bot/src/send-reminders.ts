import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the main project
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

export async function sendReminders() {
  try {
    console.log('Starting reminders check at:', new Date().toISOString());

    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/reminders/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.BOT_SECRET_TOKEN}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Failed to send reminders:', error);
      process.exit(1);
    }

    const result = await response.json();
    console.log('Reminders sent successfully:', result);
  } catch (error) {
    console.error('Error sending reminders:', error);
    process.exit(1);
  }
}

// Run immediately if this file is executed directly
if (require.main === module) {
  sendReminders();
}
