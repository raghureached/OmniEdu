import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import './EmailConfirmation.css'; // Import the CSS file

const EmailConfirmation = () => {
  const [status, setStatus] = useState('verifying');
  const location = useLocation();
  
  useEffect(() => {
    // Get token from URL query params
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    
    if (!token) {
      setStatus('error');
      return;
    }
    
    // In a real app, you would verify the token with your API
    // For this example, we'll simulate a successful verification after a delay
    const timer = setTimeout(() => {
      setStatus('success');
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [location]);
  
  return (
    <div className="emailConfirmation-container">
      <div className="emailConfirmation-box">
        <div className="emailConfirmation-logo">
          <h1>OmniEdu Portal</h1>
        </div>
        
        <div className="emailConfirmation-content">
          <h2>Email Confirmation</h2>
          
          {status === 'verifying' && (
            <div className="emailConfirmation-verifying-message">
              <p>Verifying your email address...</p>
              <div className="emailConfirmation-loading-spinner"></div>
            </div>
          )}
          
          {status === 'success' && (
            <div className="emailConfirmation-success-message">
              <p>Your email has been successfully verified!</p>
              <Link to="/login" className="emailConfirmation-btn-primary">
                Proceed to Login
              </Link>
            </div>
          )}
          
          {status === 'error' && (
            <div className="emailConfirmation-error-message">
              <p>We couldn't verify your email. The verification link may be invalid or expired.</p>
              <Link to="/login" className="emailConfirmation-btn-secondary">
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmation;