import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, loginWithSSO, clearError, mockLogin } from '../../../store/slices/authSlice';
import './Login.css';

const Login = () => {
  const [ email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error, user,role } = useSelector((state) => state.auth);
  useEffect(() => {
    // Clear any existing errors
    dispatch(clearError());
    // console.log(isAuthenticated,role)
    // Redirect if already authenticated
    if (isAuthenticated && role) {
      if (role === 'GlobalAdmin') {
        navigate('/global-admin/organizations'); 
      } else if (role === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/user/learning-hub'); 
      }
    }
  }, [isAuthenticated,role,dispatch]);
  // }, []);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // console.log(email,password)
    dispatch(login({ email, password }));
    // console.log(role)
    // Always use mockLogin for now until backend is ready
    // dispatch(mockLogin({ username, password }));
    // Uncomment this when you have a real backend
    // const isDevelopment = process.env.NODE_ENV === 'development';
    // if (isDevelopment) {
    //   dispatch(mockLogin({ username, password }));
    // } else {
    //   dispatch(login({ username, password }));
    // }
  };
  
  const handleSSOLogin = (provider) => {
    dispatch(loginWithSSO(provider));
  };
  
  return (
    <div className="login-container">
      <div className="login-form-wrapper">
        <div className="login-logo">
          <h1>OmniEdu Portal</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <h2>Sign In</h2>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
            <Link to="/forgot-password" className="forgot-password-link">
              Forgot Password?
            </Link>
          </div>
        </form>
        
        <div className="sso-options">
          <p>Or sign in with:</p>
          <div className="sso-buttons">
            <button
              type="button"
              onClick={() => handleSSOLogin('google')}
              className="sso-btn google"
            >
              Google
            </button>
            <button
              type="button"
              onClick={() => handleSSOLogin('microsoft')}
              className="sso-btn microsoft"
            >
              Microsoft
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;