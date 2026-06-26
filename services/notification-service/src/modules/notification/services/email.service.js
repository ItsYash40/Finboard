import nodemailer from "nodemailer";
import { getServiceEnv } from "@finboard/config";
import { getUserById } from "@finboard/contracts";

function isSmtpConfigured() {
  const { smtp } = getServiceEnv();
  return Boolean(smtp.host && smtp.user && smtp.pass);
}

export async function sendNotificationEmail(userId, title, message, email) {
  const recipient = email || (await getUserById(userId))?.email;
  if (!recipient) {
    return { provider: "skipped", reason: "no_email" };
  }

  const env = getServiceEnv();

  if (isSmtpConfigured()) {
    const transport = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.secure,
      auth: { user: env.smtp.user, pass: env.smtp.pass }
    });

    await transport.sendMail({
      from: env.smtp.from,
      to: recipient,
      subject: `Finboard: ${title}`,
      text: message,
      html: `<p><strong>${title}</strong></p><p>${message}</p>`
    });

    return { provider: "smtp", to: recipient };
  }

  console.log(`[DEV] Notification email for ${recipient}: ${title} — ${message}`);
  return { provider: "development", to: recipient };
}
