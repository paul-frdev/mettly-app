import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: Number(process.env.MAILTRAP_PORT),
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

export const sendMail = async ({ to, subject, html }: { to: string; subject: string; html: string }) => {
  try {
    const mailOptions = {
      from: process.env.MAIL_FROM || 'noreply@mettly.com',
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Detailed mail sending error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to send email');
  }
};
