export async function sendAppointmentReminder(telegramId: string, time: string, appointmentId: string) {
  try {
    console.log('Sending reminder to:', { telegramId, time, appointmentId });

    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/telegram/send-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.BOT_SECRET_TOKEN}`,
      },
      body: JSON.stringify({
        telegramId,
        message: `🥊 You have a session today at ${time}. Will you attend?`,
        keyboard: {
          inline_keyboard: [
            [
              { text: '✅ Yes', callback_data: `confirm:${appointmentId}:yes` },
              { text: '❌ No', callback_data: `confirm:${appointmentId}:no` },
            ],
          ],
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Failed to send telegram message:', error);
      throw new Error('Failed to send telegram message');
    }

    const result = await response.json();
    console.log('Telegram message sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending telegram message:', error);
    throw error;
  }
}
