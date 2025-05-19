import nodemailer from 'nodemailer';

console.log('Mail configuration:', {
  host: process.env.MAILTRAP_HOST,
  port: process.env.MAILTRAP_PORT,
  user: process.env.MAILTRAP_USER ? '***' : 'not set',
  pass: process.env.MAILTRAP_PASS ? '***' : 'not set',
});

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: Number(process.env.MAILTRAP_PORT),
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

export const sendMail = async ({ to, subject, html }: { to: string; subject: string; html: string }) => {
  console.log('Attempting to send mail to:', to);
  try {
    const mailOptions = {
      from: process.env.MAIL_FROM || 'noreply@mettly.com',
      to,
      subject,
      html,
    };
    console.log('Mail options prepared:', { ...mailOptions, html: '***' });

    const info = await transporter.sendMail(mailOptions);
    console.log('Mail sent successfully:', info);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Detailed mail sending error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to send email');
  }
};
