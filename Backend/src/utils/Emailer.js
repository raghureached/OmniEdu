import { MailerSend, Sender, EmailParams } from "mailersend";

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY,
});

const sentFrom = new Sender(
  process.env.MAIL_FROM,
  "OmniEdu Team"
);

export const transporter = null; // Not needed with MailerSend

export const sendMail = async (to, subject, text) => {
  const footer = `
Regards,
OmniEdu Team
https://www.omniedu.com
You are receiving this email because you registered on our platform.
  `;

  const messageText = `${text}\n\n${footer}`;

  const messageHtml = `
    <p>${text.replace(/\n/g, "<br>")}</p>
    <br>
    <p>Regards,<br>OmniEdu Team</p>
    <p><a href="https://omniedu-fe587.web.app/">www.omniedu.com</a></p>
    <small>You are receiving this email because you registered on our platform.</small>
  `;

  try {
    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo([new Sender(to, to.split('@')[0])])
      .setSubject(subject)
      .setHtml(messageHtml)
      .setText(messageText);

    const response = await mailerSend.email.send(emailParams);
    console.log('Email sent successfully:', response);
    return response;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};