import Mailjet from "node-mailjet";

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
    const request = await mailjet
      .post("send", { version: "v3.1" })
      .request({
        Messages: [
          {
            From: {
              Email: process.env.MAIL_FROM || "noreply@yourdomain.com",
              Name: "OmniEdu Team"
            },
            To: [
              {
                Email: to,
                Name: to.split('@')[0]
              }
            ],
            Subject: subject,
            TextPart: messageText,
            HTMLPart: messageHtml
          }
        ]
      });

    console.log('Email sent successfully to:', to);
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