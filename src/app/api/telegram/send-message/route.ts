import { NextResponse } from 'next/server';
import TelegramBot from 'node-telegram-bot-api';

if (!process.env.BOT_TOKEN) {
  throw new Error('BOT_TOKEN is required');
}

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: false });

export async function POST(request: Request) {
  try {
    const { telegramId, message, keyboard } = await request.json();

    if (!telegramId || !message) {
      return NextResponse.json({ error: 'telegramId and message are required' }, { status: 400 });
    }

    await bot.sendMessage(telegramId, message, { reply_markup: keyboard });

    return NextResponse.json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending telegram message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
