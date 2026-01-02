import React, { useState } from "react";
import "./ChangePassword.css";
import api from "../../../services/api";
import { useLocation } from "react-router-dom";

const ChangePassword = () => {
  const location = useLocation();
  const { propEmail } = location.state || {};
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState(propEmail || "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSendOTP = async(e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const response = await api.post("/api/sendOtp", { email });
      if(response.status === 200) {
        setSuccess("OTP sent successfully! Check your email.");
        setTimeout(() => {
          setStep("otp");
          setSuccess("");
        }, 1500);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async(e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const response = await api.post("/api/verifyOtp", { email, otp });
      if(response.status === 200) {
        setSuccess("OTP verified successfully!");
        setTimeout(() => {
          setStep("reset");
          setSuccess("");
        }, 1500);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async(e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await api.post("/auth/changePassword", { email, newPassword });
      if(response.status === 200) {
        setSuccess("Password updated successfully! Redirecting to login...");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackStep = () => {
    setError("");
    setSuccess("");
    if (step === "otp") setStep("email");
    if (step === "reset") setStep("otp");
  };

  return (
    <div className="pass-change-container">
      <div className="pass-change-card">
        {/* Header */}
        <div className="pass-change-header">
          <div className="pass-change-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 1C8.676 1 6 3.676 6 7V10H5C3.897 10 3 10.897 3 12V20C3 21.103 3.897 22 5 22H19C20.103 22 21 21.103 21 20V12C21 10.897 20.103 10 19 10H18V7C18 3.676 15.324 1 12 1ZM8 7C8 4.794 9.794 3 12 3C14.206 3 16 4.794 16 7V10H8V7Z" fill="currentColor"/>
            </svg>
          </div>
          <h2 className="pass-change-title">Reset Password</h2>
          <p className="pass-change-subtitle">
            {step === "email" && "Enter your email to receive a verification code"}
            {step === "otp" && "Enter the OTP sent to your email"}
            {step === "reset" && "Create a new secure password"}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="pass-change-progress">
          <div className={`progress-step ${step === "email" ? "active" : step === "otp" || step === "reset" ? "completed" : ""}`}>
            <div className="progress-circle">1</div>
            <span className="progress-label">Email</span>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${step === "otp" ? "active" : step === "reset" ? "completed" : ""}`}>
            <div className="progress-circle">2</div>
            <span className="progress-label">Verify</span>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${step === "reset" ? "active" : ""}`}>
            <div className="progress-circle">3</div>
            <span className="progress-label">Reset</span>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="pass-change-alert error">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
            </svg>
            {error}
          </div>
        )}
        
        {success && (
          <div className="pass-change-alert success">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
            </svg>
            {success}
          </div>
        )}

        {/* Step 1 - Enter Email */}
        {step === "email" && (
          <form onSubmit={handleSendOTP} className="pass-change-form">
            <div className="pass-change-input-group">
              <label className="pass-change-label">Email Address</label>
              <input
                type="email"
                className="pass-change-input"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button className="pass-change-btn" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Sending...
                </>
              ) : (
                "Send OTP"
              )}
            </button>
          </form>
        )}

        {/* Step 2 - Enter OTP */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOTP} className="pass-change-form">
            <div className="pass-change-input-group">
              <label className="pass-change-label">Verification Code</label>
              <input
                type="text"
                className="pass-change-input otp-input"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength="6"
                required
                disabled={loading}
              />
              <span className="pass-change-hint">Code sent to {email}</span>
            </div>

            <button className="pass-change-btn" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Verifying...
                </>
              ) : (
                "Verify OTP"
              )}
            </button>
            
            <button 
              type="button" 
              className="pass-change-btn-secondary" 
              onClick={handleBackStep}
              disabled={loading}
            >
              Back to Email
            </button>
          </form>
        )}

        {/* Step 3 - Reset Password */}
        {step === "reset" && (
          <form onSubmit={handlePasswordChange} className="pass-change-form">
            <div className="pass-change-input-group">
              <label className="pass-change-label">New Password</label>
              <input
                type="password"
                className="pass-change-input"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={loading}
              />
              <span className="pass-change-hint">At least 8 characters</span>
            </div>

            <div className="pass-change-input-group">
              <label className="pass-change-label">Confirm Password</label>
              <input
                type="password"
                className="pass-change-input"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button className="pass-change-btn" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </button>
            
            <button 
              type="button" 
              className="pass-change-btn-secondary" 
              onClick={handleBackStep}
              disabled={loading}
            >
              Back to OTP
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChangePassword;