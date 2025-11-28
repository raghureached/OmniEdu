import React, { useState } from "react";
import "./ChangePassword.css";
import api from "../../../services/api";

const ChangePassword = () => {
  const [step, setStep] = useState("email"); // email → otp → reset
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSendOTP = async(e) => {
    e.preventDefault();
    try {
        const response = await api.post("/api/sendOtp", { email });
        if(response.status === 200)
            setStep("otp");
    } catch (error) {
        console.error("Error sending OTP:", error);
    }
  };

  const handleVerifyOTP = async(e) => {
    e.preventDefault();
    try {
        const response = await api.post("/api/verifyOtp", { email, otp });
        if(response.status === 200)
            setStep("reset");
    } catch (error) {
        console.error("Error verifying OTP:", error);
    }
  };

  const handlePasswordChange = async(e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    try {
        const response = await api.post("/auth/changePassword", { email, newPassword });
        if(response.status === 200){
            alert("Password updated successfully!");
            window.location.href = "/login";
        }

    } catch (error) {
        console.error("Error changing password:", error);
    }
    alert("Password updated successfully!");
  };

  return (
    <div className="pass-change-container">
      <div className="pass-change-card">
        <h2 className="pass-change-title">Password Reset</h2>

        {/* Step 1 - Enter Email */}
        {step === "email" && (
          <form onSubmit={handleSendOTP} className="pass-change-form">
            <label className="pass-change-label">Enter your Email</label>
            <input
              type="email"
              className="pass-change-input"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button className="pass-change-btn" type="submit">
              Send OTP
            </button>
          </form>
        )}

        {/* Step 2 - Enter OTP */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOTP} className="pass-change-form">
            <label className="pass-change-label">Enter OTP</label>
            <input
              type="text"
              className="pass-change-input"
              placeholder="Enter the OTP sent to your email"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />

            <button className="pass-change-btn" type="submit">
              Verify OTP
            </button>
          </form>
        )}

        {/* Step 3 - Reset Password */}
        {step === "reset" && (
          <form onSubmit={handlePasswordChange} className="pass-change-form">
            <label className="pass-change-label">New Password</label>
            <input
              type="password"
              className="pass-change-input"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <label className="pass-change-label">Confirm Password</label>
            <input
              type="password"
              className="pass-change-input"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <button className="pass-change-btn" type="submit">
              Update Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChangePassword;
