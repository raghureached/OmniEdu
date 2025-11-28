import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: 465,  
  secure: true,  // Gmail SSL
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,  // MUST be Gmail App Password
  },
});

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
    await transporter.sendMail({
      from: `"OmniEdu" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text: messageText,
      html: messageHtml,
      headers: {
        "X-Priority": "3",
        "X-Mailer": "OmniEdu Mailer",
        "Disposition-Notification-To": process.env.SMTP_USER,
      }
    });

    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
