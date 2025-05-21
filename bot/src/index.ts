import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the main project
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

console.log('Bot configuration:', {
  botToken: process.env.BOT_TOKEN ? 'Set' : 'Not set',
  appUrl: process.env.NEXT_PUBLIC_APP_URL,
  botSecretToken: process.env.BOT_SECRET_TOKEN ? 'Set' : 'Not set',
});

if (!process.env.BOT_TOKEN) {
  throw new Error('BOT_TOKEN is required');
}

if (!process.env.NEXT_PUBLIC_APP_URL) {
  throw new Error('NEXT_PUBLIC_APP_URL is required');
}

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// Test bot connection
bot
  .getMe()
  .then((botInfo) => {
    console.log('Bot connected successfully:', botInfo);
  })
  .catch((error) => {
    console.error('Failed to connect bot:', error);
    process.exit(1);
  });

interface ApiResponse {
  error?: string;
  message?: string;
}

// Handle /start command
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from?.username;

  if (!username) {
    await bot.sendMessage(chatId, 'Please set a username in your Telegram settings before using this bot.');
    return;
  }

  try {
    // Call the API to attach telegram ID
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/client/attach-telegram`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.BOT_SECRET_TOKEN}`,
      },
      body: JSON.stringify({
        telegramId: chatId.toString(),
        username: username,
      }),
    });

    const data = (await response.json()) as ApiResponse;

    if (response.ok) {
      await bot.sendMessage(chatId, '✅ Successfully connected! You will now receive appointment reminders.');
    } else {
      await bot.sendMessage(chatId, `❌ Error: ${data.error || 'Failed to connect. Please make sure your Telegram username is correctly set in your client profile.'}`);
    }
  } catch (error) {
    console.error('Error attaching telegram:', error);
    await bot.sendMessage(chatId, '❌ An error occurred while connecting. Please try again later.');
  }
});

// Handle appointment confirmation buttons
bot.on('callback_query', async (callbackQuery) => {
  if (!callbackQuery.message) return;

  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;

  if (!data) return;

  try {
    const [action, appointmentId, response] = data.split(':');

    if (action === 'confirm') {
      console.log('Processing confirmation:', { appointmentId, response });

      const apiResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.BOT_SECRET_TOKEN}`,
        },
        body: JSON.stringify({
          telegramId: chatId.toString(),
          appointmentId,
          response: response === 'yes' ? 'yes' : 'no',
        }),
      });

      const result = (await apiResponse.json()) as { error?: string; message?: string };
      console.log('API response:', result);

      if (apiResponse.ok) {
        await bot.sendMessage(chatId, response === 'yes' ? '✅ Thank you for confirming your appointment!' : '❌ Appointment declined. Please contact your trainer to reschedule.');
      } else {
        console.error('Failed to process response:', result);
        await bot.sendMessage(chatId, `❌ Error: ${result.error || 'Failed to process your response. Please try again later.'}`);
      }
    }
  } catch (error) {
    console.error('Error processing callback query:', error);
    await bot.sendMessage(chatId, '❌ An error occurred. Please try again later.');
  }
});

// Function to send appointment reminder
export async function sendAppointmentReminder(telegramId: string, time: string, appointmentId: string) {
  try {
    console.log('Sending reminder to:', { telegramId, time, appointmentId });

    const keyboard = {
      inline_keyboard: [
        [
          { text: '✅ Yes', callback_data: `confirm:${appointmentId}:yes` },
          { text: '❌ No', callback_data: `confirm:${appointmentId}:no` },
        ],
      ],
    };

    const message = `🥊 You have a session today at ${time}. Will you attend?`;
    console.log('Sending message:', message);

    const result = await bot.sendMessage(telegramId, message, { reply_markup: keyboard });
    console.log('Message sent successfully:', result);

    return result;
  } catch (error) {
    console.error('Error sending reminder:', error);
    throw error;
  }
}

// Error handling
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

// Start the bot
console.log('Bot started...');
