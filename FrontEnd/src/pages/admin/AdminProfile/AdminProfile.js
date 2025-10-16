import React from 'react';
import { useSelector } from 'react-redux';
import './AdminProfile.css';

const AdminProfile = () => {
  const { user, lastLoginDateTime } = useSelector((state) => state.auth);
  
  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };
  // Admin data from user input
  const adminData = {
    personal: {
      name: user.name,
      email: user.email,
      designation: 'System Administrator',
      organization: 'Acme Corp',
      team: 'Administration',
      subTeam: 'IT',
      role: 'Admin',
      lastLogin: '26/05/25, 10:46 am'
    },
    organization: {
      name: 'Acme Corporation Ltd.',
      logo: 'logo.png',
      email: 'contact@acmecorp.com',
      status: 'Active',
      planId: 'ACME-PRO-2025',
      planName: 'Professional Tier',
      startDate: '2025-01-01',
      endDate: '2025-12-31'
    }
  };
  
  const getUserInitials = () => {
    const name = adminData.personal.name;
    const nameParts = name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };
  
  return (
    <div className="adminprofile-container">
      <div className="adminprofile-header">
        <div className="adminprofile-avatar-header">
          <div className="admin_profile_word">{getUserInitials()}</div>
          <div className="adminprofile-header-info">
            <h2>{adminData.personal.name}</h2>
            <p className="adminprofile-title">{adminData.personal.designation}</p>
            <p className="adminprofile-department">{adminData.personal.organization}</p>
          </div>
        </div>
      </div>
      
      <div className="adminprofile-sections">
        {/* Admin Profile Section */}
        <div className="adminprofile-card">
          <h3 className="adminprofile-section-title">Admin Profile</h3>
          <div className="adminprofile-info">
            <div className="adminprofile-info-group">
              <span className="adminprofile-info-label">Name</span>
              <span className="adminprofile-info-value">{user.name}</span>
            </div>
            <div className="adminprofile-info-group">
              <span className="adminprofile-info-label">Email</span>
              <span className="adminprofile-info-value">{user.email}</span>
            </div>
            <div className="adminprofile-info-group">
              <span className="adminprofile-info-label">Designation</span>
              <span className="adminprofile-info-value">{adminData.personal.designation}</span>
            </div>
            <div className="adminprofile-info-group">
              <span className="adminprofile-info-label">Organization</span>
              <span className="adminprofile-info-value">{adminData.personal.organization}</span>
            </div>
            <div className="adminprofile-info-group">
              <span className="adminprofile-info-label">Team</span>
              <span className="adminprofile-info-value">{adminData.personal.team}</span>
            </div>
            <div className="adminprofile-info-group">
              <span className="adminprofile-info-label">Sub Team</span>
              <span className="adminprofile-info-value">{adminData.personal.subTeam}</span>
            </div>
            <div className="adminprofile-info-group">
              <span className="adminprofile-info-label">Role</span>
              <span className="adminprofile-info-value">{adminData.personal.role}</span>
            </div>
            <div className="adminprofile-info-group">
              <span className="adminprofile-info-label">Last Login</span>
              <span className="adminprofile-info-value">{adminData.personal.lastLogin}</span>
            </div>
          </div>
        </div>

        {/* Organization Profile Section */}
        <div className="adminprofile-card">
          <h3 className="adminprofile-section-title">Organization Profile</h3>
          <div className="adminprofile-info">
            <div className="adminprofile-info-group">
              <span className="adminprofile-info-label">Name</span>
              <span className="adminprofile-info-value">{adminData.organization.name}</span>
            </div>
            <div className="adminprofile-info-group">
              <span className="adminprofile-info-label">Logo</span>
              <span className="adminprofile-info-value">{adminData.organization.logo}</span>
            </div>
            <div className="adminprofile-info-group">
              <span className="adminprofile-info-label">Email</span>
              <span className="adminprofile-info-value">{adminData.organization.email}</span>
            </div>
            <div className="adminprofile-info-group">
              <span className="adminprofile-info-label">Status</span>
              <span className="adminprofile-info-value">{adminData.organization.status}</span>
            </div>
            <div className="adminprofile-info-group">
              <span className="adminprofile-info-label">Plan ID</span>
              <span className="adminprofile-info-value">{adminData.organization.planId}</span>
            </div>
            <div className="adminprofile-info-group">
              <span className="adminprofile-info-label">Plan Name</span>
              <span className="adminprofile-info-value">{adminData.organization.planName}</span>
            </div>
            <div className="adminprofile-info-group">
              <span className="adminprofile-info-label">Start Date</span>
              <span className="adminprofile-info-value">{adminData.organization.startDate}</span>
            </div>
            <div className="adminprofile-info-group">
              <span className="adminprofile-info-label">End Date</span>
              <span className="adminprofile-info-value">{adminData.organization.endDate}</span>
            </div>
          </div>
        </div>

        {/* Password Section */}
        <div className="adminprofile-card password-card">
          <h3 className="adminprofile-section-title">Password</h3>
          <div className="adminprofile-info password-info">
            <div className="adminprofile-info-group password-group">
              <span className="adminprofile-info-label">Password</span>
              <span className="adminprofile-info-value">••••••••</span>
              <button className="adminprofile-change-password-btn">Change Password</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;