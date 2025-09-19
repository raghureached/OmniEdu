import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { forgotPassword, clearError } from '../../../store/slices/authSlice';
import './ForgotPassword.css'; // Import the CSS file

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const dispatch = useDispatch();
  const { loading, error, forgotPasswordSuccess } = useSelector((state) => state.auth);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(forgotPassword(email));
  };

  return (
    <div className="forgotPassword-container">
      <div className="forgotPassword-form-wrapper">
        <div className="forgotPassword-logo">
          <h1>OmniEdu Portal</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="forgotPassword-form">
          <h2>Forgot Password</h2>
          
          {error && <div className="forgotPassword-error-message">{error}</div>}
          {forgotPasswordSuccess && (
            <div className="forgotPassword-success-message">
              Password reset instructions have been sent to your email.
            </div>
          )}
          
          {!forgotPasswordSuccess && (
            <>
              <p>Enter your email address to receive password reset instructions.</p>
              
              <div className="forgotPassword-form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="forgotPassword-form-actions">
                <button type="submit" className="forgotPassword-btn-primary" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
                <Link to="/login" className="forgotPassword-back-to-login">
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;