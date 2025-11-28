import { sendMail } from "../utils/Emailer.js";

let otpStore = {};

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000);
};

export const sendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email)
            return res.status(400).json({ message: "Email is required" });

        const otp = generateOTP();
        otpStore[email] = {
            otp,
            expiresAt: Date.now() + 5 * 60 * 1000
        };
        await sendMail(
            email,
            "OmniEdu – Your Secure OTP Code",
            `Hello,
            Your One-Time Password (OTP) for completing the verification process is:
            ${otp}
            This OTP will expire in 5 minutes. Please ensure you enter it promptly and do not share it with anyone.
            If you did not initiate this request, please disregard this message.
            Stay secure,
            OmniEdu Support Team`
        );
        return res.json({ message: "OTP sent successfully" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error sending OTP" });
    }
};

export const verifyOTP = (req, res) => {
    const { email, otp } = req.body;

    if (!otpStore[email])
        return res.status(400).json({ message: "OTP not found. Request again." });

    const { otp: savedOtp, expiresAt } = otpStore[email];

    if (Date.now() > expiresAt)
        return res.status(400).json({ message: "OTP expired" });

    if (Number(otp) !== savedOtp)
        return res.status(400).json({ message: "Invalid OTP" });

    delete otpStore[email];

    return res.json({ message: "OTP verified successfully" });
};



