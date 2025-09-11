import React, {useEffect} from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// In the ProtectedRoute component, ensure it handles roles correctly
const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (role) {
      // Handle different role formats
      const userRoles = user?.roles || [];
      const hasAccess = role === 'global_admin' ? 
        userRoles.includes('global-admin') : 
        userRoles.includes(role);
      
      if (!hasAccess) {
        // Redirect to appropriate dashboard based on role
        if (userRoles.includes('global-admin')) {
          navigate('/global-admin/organizations');
        } else if (userRoles.includes('admin')) {
          navigate('/admin/users');
        } else {
          navigate('/user/dashboard');
        }
      }
    }
  }, [isAuthenticated, user, role, navigate]);
  
  // Return children only if authenticated, otherwise return null
  // This prevents flash of content before redirect
  return isAuthenticated ? children : null;
};

export default ProtectedRoute;