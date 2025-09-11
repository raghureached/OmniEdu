const nodemailer = require("nodemailer");
require("dotenv").config(); // To load environment variables

// Create transporter using environment variables
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,  // Gmail username from environment variables
        pass: process.env.EMAIL_PASS,  // Gmail app password from environment variables
    },
});

// sendMail function to send an email
const sendMail = async (to, subject, text) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,  // Sender's email address
        to,
        subject,
        text,
    };

    try {
        // Attempt to send email
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully");
    } catch (error) {
        // Handle email sending error
        console.error("Error sending email:", error);
        throw new Error("Failed to send email.");
    }
};

module.exports = { sendMail };
