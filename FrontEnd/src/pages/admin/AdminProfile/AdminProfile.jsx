import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import './AdminProfile.css';
import api from '../../../services/api';
import { useNavigate } from 'react-router-dom';

const AdminProfile = () => {
  const { user, lastLoginDateTime } = useSelector((state) => state.auth);
  const [adminData, setAdminData] = useState({
    user: {
      name: "",
      email: "",
      global_role_id: {},
      last_login: "",
    },
    organization: {
      name: "",
      logo_url: "",
      planId: "",
      planName: "",
      start_date: "",
      end_date: "",
      status: "",
      email: "",
    },
  });
  const navigate = useNavigate();
  useEffect(() => {
    const getAdminProfile = async () => {
      const response = await api.get('/api/admin/getProfile');
      setAdminData(response.data.data);
    }
    getAdminProfile();
  }, []);
  
  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };
  
  const getUserInitials = () => {
    const name = adminData.user.name || 'Admin';
    const nameParts = name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getOrgInitials = () => {
    const name = adminData.organization.name || 'ORG';
    const nameParts = name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };
  
  return (
    <div className="adminprofile-container">
      <div className="adminprofile-content">
        {/* Admin Profile Sidebar */}
        <div className="adminprofile-sidebar">
          <div className="adminprofile-avatar">
            <div className="admin_profile_word">{getUserInitials()}</div>
            <h3>{adminData.user.name}</h3>
            <p className="adminprofile-title">{adminData.user.global_role_id?.name || 'Admin'}</p>
            <p className="adminprofile-department">{adminData.organization.name}</p>
          </div>
        </div>
        
        <div className="adminprofile-details">
          {/* Admin Information Card */}
          <div className="adminprofile-card">
            <h3 className="adminprofile-section-title">Admin Information</h3>
            <div className="adminprofile-info">
              <div className="adminprofile-info-group">
                <span className="adminprofile-info-label">Full Name</span>
                <span className="adminprofile-info-value">{adminData.user.name}</span>
              </div>
              <div className="adminprofile-info-group">
                <span className="adminprofile-info-label">Email Address</span>
                <span className="adminprofile-info-value">{adminData.user.email}</span>
              </div>
              <div className="adminprofile-info-group">
                <span className="adminprofile-info-label">Role</span>
                <span className="adminprofile-info-value">{adminData.user.global_role_id?.name || 'N/A'}</span>
              </div>
              <div className="adminprofile-info-group">
                <span className="adminprofile-info-label">Organization</span>
                <span className="adminprofile-info-value">{adminData.organization.name}</span>
              </div>
              <div className="adminprofile-info-group">
                <span className="adminprofile-info-label">Last Login</span>
                <span className="adminprofile-info-value">{formatDate(adminData.user.last_login)}</span>
              </div>
            </div>
          </div>

          {/* Organization Profile Card with Logo */}
          <div className="adminprofile-card organization-card">
            <div className="organization-header">
              <div className="organization-logo-container">
                {adminData.organization.logo_url ? (
                  <img 
                    src={adminData.organization.logo_url} 
                    alt={`${adminData.organization.name} logo`}
                    className="organization-logo"
                  />
                ) : (
                  <div className="organization-logo-placeholder">
                    {getOrgInitials()}
                  </div>
                )}
              </div>
              <div className="organization-header-text">
                <h3 className="adminprofile-section-title">Organization Profile</h3>
                <span className={`organization-status-badge ${adminData.organization.status?.toLowerCase()}`}>
                  {adminData.organization.status || 'Active'}
                </span>
              </div>
            </div>
            
            <div className="adminprofile-info">
              <div className="adminprofile-info-group">
                <span className="adminprofile-info-label">Organization Name</span>
                <span className="adminprofile-info-value">{adminData.organization.name}</span>
              </div>
              <div className="adminprofile-info-group">
                <span className="adminprofile-info-label">Email</span>
                <span className="adminprofile-info-value">{adminData.organization.email}</span>
              </div>
              <div className="adminprofile-info-group">
                <span className="adminprofile-info-label">Plan ID</span>
                <span className="adminprofile-info-value">{adminData.organization.planId || 'N/A'}</span>
              </div>
              <div className="adminprofile-info-group">
                <span className="adminprofile-info-label">Plan Name</span>
                <span className="adminprofile-info-value">{adminData.organization.planName || 'N/A'}</span>
              </div>
              <div className="adminprofile-info-group">
                <span className="adminprofile-info-label">Start Date</span>
                <span className="adminprofile-info-value">{formatDate(adminData.organization.start_date)}</span>
              </div>
              <div className="adminprofile-info-group">
                <span className="adminprofile-info-label">End Date</span>
                <span className="adminprofile-info-value">{formatDate(adminData.organization.end_date)}</span>
              </div>
            </div>
          </div>

          {/* Security Card */}
          <div className="adminprofile-card security-card">
            <h3 className="adminprofile-section-title">Security Settings</h3>
            <div className="adminprofile-info">
              <div className="adminprofile-info-group password-group">
                <div className="password-info-wrapper">
                  <span className="adminprofile-info-label">Password</span>
                  <span className="adminprofile-info-value">••••••••••••</span>
                </div>
                <button className="adminprofile-change-password-btn" onClick={()=>navigate('/change-password',{state:{
                  propEmail:adminData.user.email
                }})}>
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;