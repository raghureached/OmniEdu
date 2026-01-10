import Mailjet from "node-mailjet";
import User from "./../models/User/users_model.js"
const mailjet = new Mailjet({
  apiKey: process.env.MAILJET_API_KEY,
  apiSecret: process.env.MAILJET_SECRET_KEY,
});

// Not needed with Mailjet, but kept for compatibility
export const transporter = null;
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
    const recipients = Array.isArray(to)
      ? to.filter(Boolean).map((email) => ({ Email: email, Name: (email || '').split('@')[0] || 'User' }))
      : to
        ? [{ Email: to, Name: (to || '').split('@')[0] || 'User' }]
        : [];

    if (!recipients.length) {
      console.warn('sendMail called with no recipients');
      return { success: true, info: 'No recipients, skipped sending' };
    }
    const request = await mailjet
      .post("send", { version: "v3.1" })
      .request({
        Messages: [
          {
            From: {
              Email: process.env.MAIL_FROM || "noreply@yourdomain.com",
              Name: "OmniEdu Team"
            },
            To: recipients,
            Subject: subject,
            TextPart: messageText,
            HTMLPart: messageHtml
          }
        ]
      });

    console.log('Email sent successfully to:', Array.isArray(to) ? to : [to]);
    return { success: true, data: request.body };
  } catch (error) {
    console.warn('Warning: Failed to send email to', to, '-', 
      error.statusCode ? `Status: ${error.statusCode}` : '',
      error.message || 'Unknown error'
    );
    return { 
      success: false, 
      error: {
        status: error.statusCode,
        message: error.message || 'Failed to send email'
      }
    };
  }
};

export const sendMailtoIds = async (ids, subject, text) => {
  const users = await User.find({ _id: { $in: ids } }).select("email");
  const to = users.map(user => user.email);
  return sendMail(to, subject, text);
};