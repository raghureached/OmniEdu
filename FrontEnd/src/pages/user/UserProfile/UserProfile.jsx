import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import './UserProfile.css';

const UserProfile = () => {
  const { user, lastLoginDateTime, sessionStartTime,role } = useSelector((state) => state.auth);
  console.log(role)
  const [activeTab, setActiveTab] = useState('personal');
  // console.log(user)
  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };
  
  // Calculate session duration
  const getSessionDuration = () => {
    if (!sessionStartTime) return 'N/A';
    
    const start = new Date(sessionStartTime);
    const now = new Date();
    const diffInMs = now - start;
    
    // Convert to hours, minutes, seconds
    const hours = Math.floor(diffInMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };
  
  // Mock additional user data that would typically come from the API
  const userData = {
    personal: {
      name: user?.name || 'John Doe',
      email: user?.email || 'john.doe@example.com',
      role: user?.roles?.join(', ') || 'Learner',
      department: 'IT',
      position: 'Software Developer',
      joinDate: '2023-01-15',
      employeeId: 'EMP-2023-0042',
      lastLogin: formatDate(lastLoginDateTime),
      currentSession: getSessionDuration()
    },
  };
  
  const getUserInitials = () => {
    if (!user || !user.name) return 'U';
    
    const nameParts = user.name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
    }
    
    return user.name.substring(0, 2).toUpperCase();
  };
  
  return (
    <div className="userprofile-container">
      <div className="userprofile-content">
        <div className="userprofile-sidebar">
          <div className="userprofile-avatar">
          <div className="user_profile_word">{getUserInitials()}</div>
            <h3>{userData.personal.name}</h3>
            <p className="userprofile-title">{userData.personal.position}</p>
            <p className="userprofile-department">{userData.personal.department}</p>
          </div>
        </div>
        
        <div className="userprofile-details">
          {activeTab === 'personal' && (
            <div className="userprofile-card">
              <h3 className="userprofile-section-title">Personal Information</h3>
              <div className="userprofile-info">
                <div className="userprofile-info-group">
                  <span className="userprofile-info-label">Full Name</span>
                  <span className="userprofile-info-value">{user.name}</span>
                </div>
                <div className="userprofile-info-group">
                  <span className="userprofile-info-label">Email Address</span>
                  <span className="userprofile-info-value">{user.email}</span>
                </div>
                <div className="userprofile-info-group">
                  <span className="userprofile-info-label">Role</span>
                  <span className="userprofile-info-value">{role}</span>
                </div>
                <div className="userprofile-info-group">
                  <span className="userprofile-info-label">Department</span>
                  <span className="userprofile-info-value">
                    {user.deparment || 'N/A'}
                  </span>
                </div>
                <div className="userprofile-info-group">
                  <span className="userprofile-info-label">Position</span>
                  <span className="userprofile-info-value">{user.position || 'N/A'}</span>
                </div>
                <div className="userprofile-info-group">
                  <span className="userprofile-info-label">Join Date</span>
                  <span className="userprofile-info-value">{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="userprofile-info-group">
                  <span className="userprofile-info-label">Employee ID</span>
                  <span className="userprofile-info-value">{user.employeeId || 'N/A'}</span>
                </div>
                <div className="userprofile-info-group">
                  <span className="userprofile-info-label">Last Login</span>
                  <span className="userprofile-info-value">{formatDate(lastLoginDateTime) || 'N/A'}</span>
                </div>
              </div>
            </div>
          )}
          
         </div>
      </div>
    </div>
  );
};

export default UserProfile;