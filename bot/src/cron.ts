import cron from 'node-cron';
import { sendReminders } from './send-reminders';

// Run every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  try {
    await sendReminders();
  } catch (error) {
    console.error('Error in reminders cron job:', error);
  }
});

console.log('Reminders cron job started');
