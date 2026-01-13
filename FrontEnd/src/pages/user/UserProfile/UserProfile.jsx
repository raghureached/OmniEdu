import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../../../services/api';
import './UserProfile.css';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
  const { user, lastLoginDateTime, sessionStartTime,role } = useSelector((state) => state.auth);
  
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: user?.name || '',
    designation: '',
    employeeId: user?.employeeId || '',
    department_id: ''
  });
  // No departments fetch when using free text input
  const [profile, setProfile] = useState(null);
  
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
  // No departments fetch needed for free-text department

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/api/user/userProfile');
        if (res.status === 200 && res.data?.data) {
          const p = res.data.data;
          setProfile(p);
          setForm(prev => ({
            ...prev,
            // prefer server values when present
            name: prev.name || p.fullName || '',
            employeeId: p.employeeId || prev.employeeId,
            designation: p.designation || prev.designation,
          }));
        }
      } catch (e) {
      }
    };
    fetchProfile();
  }, []);

  const updateProfile = async()=>{
    try {
      const payload = {
        name: form.name,
        designation: form.designation,
        employeeId: form.employeeId,
      };
      const response = await api.post('/api/user/updateProfile', payload);
      if(response.status === 200){

        setIsEditing(false)
        // refresh profile to reflect new values
        try {
          const res = await api.get('/api/user/userProfile');
          if (res.status === 200 && res.data?.data) setProfile(res.data.data);
        } catch (e) {}
      }
    } catch (error) {
      
    }
    
  }
  
  // Mock additional user data that would typically come from the API
  
  
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
            <h3>{user.name}</h3>
            <p className="userprofile-title">{profile?.designation || form.designation || 'N/A'}</p>
            <p className="userprofile-department">
              {Array.isArray(profile?.teams) && profile.teams.length > 0
                ? profile.teams
                    .map(t => {
                      const team = t.team || (typeof t.team_id === 'string' ? t.team_id : null);
                      const subTeam = t.subTeam || (typeof t.sub_team_id === 'string' ? t.sub_team_id : null);
                      return team ? `${team}${subTeam ? ' • ' + subTeam : ''}` : null;
                    })
                    .filter(Boolean)
                    .join(', ')
                : 'N/A'}
            </p>
          </div>
        </div>
        
        <div className="userprofile-details">
          {activeTab === 'personal' && (
            <div className="userprofile-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 className="userprofile-section-title">Personal Information</h3>
                {!isEditing ? (
                  <button className="btn-secondary" onClick={() => setIsEditing(true)}>Edit</button>
                ) : (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        // reset to current user values and exit edit mode
                        setForm({
                          name: user?.name || '',
                          email: user?.email || '',
                          deparment: user?.deparment || '',
                          employeeId: user?.employeeId || ''
                        });
                        setIsEditing(false);
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn-primary"
                      onClick={updateProfile}
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>
              <div className="userprofile-info">
                <div className="userprofile-info-group">
                  <span className="userprofile-info-label">Full Name</span>
                  {isEditing ? (
                    <input
                      type="text"
                      
                      value={form.name}
                      onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                      className="addOrg-form-input"
                    />
                  ) : (
                    <span className="userprofile-info-value">{user.name}</span>
                  )}
                </div>
                <div className="userprofile-info-group">
                  <span className="userprofile-info-label">Email Address</span>
                  <span className="userprofile-info-value">{user.email}</span>
                </div>
                <div className="userprofile-info-group">
                  <span className="userprofile-info-label">Designation</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={form.designation}
                      onChange={(e) => setForm(prev => ({ ...prev, designation: e.target.value }))}
                      className="addOrg-form-input"
                    />
                  ) : (
                    <span className="userprofile-info-value">{profile?.designation || 'N/A'}</span>
                  )}
                </div>
                <div className="userprofile-info-group">
                  <span className="userprofile-info-label">Employee ID</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={form.employeeId}
                      onChange={(e) => setForm(prev => ({ ...prev, employeeId: e.target.value }))}
                      className="addOrg-form-input"
                    />
                  ) : (
                    <span className="userprofile-info-value">{profile?.employeeId || user.employeeId || 'N/A'}</span>
                  )}
                </div>
                
                <div className="userprofile-info-group">
                  <span className="userprofile-info-label">Join Date</span>
                  <span className="userprofile-info-value">{new Date(user.createdAt).toLocaleDateString()}</span>
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
      <div className="adminprofile-card security-card">
            <h3 className="adminprofile-section-title">Security Settings</h3>
            <div className="adminprofile-info">
              <div className="adminprofile-info-group password-group">
                <div className="password-info-wrapper">
                  <span className="adminprofile-info-label">Password</span>
                  <span className="adminprofile-info-value">••••••••••••</span>
                </div>
                <button className="adminprofile-change-password-btn" onClick={()=>navigate('/change-password',{state:{
                  propEmail:user.email
                }})}>
                  Change Password
                </button>
              </div>
            </div>
          </div>
    </div>
  );
};

export default UserProfile;