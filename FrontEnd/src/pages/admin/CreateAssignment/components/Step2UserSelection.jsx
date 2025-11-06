import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useState } from 'react';

const Step2UserSelection = ({ 
  userMode,
  setUserMode,
  selectedUsers,
  setSelectedUsers,
  bulkEmails,
  setBulkEmails,
  users,
  groups,
  selectedGroups,
  setSelectedGroups,
  onNext,
  onBack
}) => {
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [groupSearchTerm, setGroupSearchTerm] = useState('');
  const [userFilterTeam, setUserFilterTeam] = useState('');
  const [userFilterSubTeam, setUserFilterSubTeam] = useState('');

  const handleUserModeChange = (mode) => {
    setUserMode(mode);
    setSelectedUsers([]);
    setBulkEmails('');
    setSelectedGroups([]);
  };

  const toggleUser = (user) => {
    const exists = selectedUsers.find(u => u._id === user._id);
    if (exists) {
      setSelectedUsers(selectedUsers.filter(u => u._id !== user._id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const toggleGroup = (groupId) => {
    const exists = selectedGroups.includes(groupId);
    if (exists) {
      setSelectedGroups(selectedGroups.filter(id => id !== groupId));
    } else {
      setSelectedGroups([...selectedGroups, groupId]);
    }
  };

  const validateBulkEmails = (value) => {
    setBulkEmails(value);
  };

  const getEmailCount = () => {
    const emails = bulkEmails.split('\n').filter(e => e.trim());
    return emails.length;
  };

  const getEmailCounter = () => {
    const count = getEmailCount();
    const remaining = 50 - count;
    
    if (count > 50) {
      return {
        text: `${count} emails entered | Maximum 50 allowed (${count - 50} over limit)`,
        className: 'email-counter error'
      };
    } else if (count > 40) {
      return {
        text: `${count} emails entered | ${remaining} remaining`,
        className: 'email-counter warning'
      };
    }
    return {
      text: `${count} emails entered | ${remaining} remaining`,
      className: 'email-counter'
    };
  };

  const filteredUsers = users.filter(u => {
    if (userFilterTeam && u.team !== userFilterTeam) return false;
    if (userFilterSubTeam && u.subteam !== userFilterSubTeam) return false;
    if (userSearchTerm && !u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) && 
        !u.email.toLowerCase().includes(userSearchTerm.toLowerCase())) return false;
    return true;
  });

  const filteredGroups = groups.filter(g => {
    if (groupSearchTerm && !(g.name || '').toLowerCase().includes(groupSearchTerm.toLowerCase())) return false;
    return true;
  });

  const emailCounter = getEmailCounter();

  return (
    <div className="assignment-section step-content active">
      <h2 className="section-title">Step 2: Select Users</h2>

      <div className="form-group">
        <label>Assignment Method</label>
        <div className="user-selection-mode">
          <button 
            className={`mode-btn ${userMode === 'individual' ? 'active' : ''}`}
            onClick={() => handleUserModeChange('individual')}
            type="button"
          >
            👤 Individual Users
          </button>
          <button 
            className={`mode-btn ${userMode === 'group' ? 'active' : ''}`}
            onClick={() => handleUserModeChange('group')}
            type="button"
          >
            👥 Team Assignment
          </button>
          <button 
            className={`mode-btn ${userMode === 'bulk' ? 'active' : ''}`}
            onClick={() => handleUserModeChange('bulk')}
            type="button"
          >
            📧 Bulk Email Entry
          </button>
        </div>
      </div>

      {/* Individual User Selection */}
      {userMode === 'individual' && (
        <div id="individual-mode" className="user-mode-content">
          <div className="form-group">
            <label>Filter Users</label>
            <div className="filter-row">
              <select value={userFilterTeam} onChange={(e) => setUserFilterTeam(e.target.value)}>
                <option value="">All Teams</option>
                <option value="Sales">Sales</option>
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Marketing">Marketing</option>
              </select>
              <select value={userFilterSubTeam} onChange={(e) => setUserFilterSubTeam(e.target.value)}>
                <option value="">All Sub-Teams</option>
                <option value="Sales - East Region">Sales - East Region</option>
                <option value="Sales - West Region">Sales - West Region</option>
                <option value="Engineering - Frontend">Engineering - Frontend</option>
                <option value="Engineering - Backend">Engineering - Backend</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Search Users</label>
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={userSearchTerm}
              onChange={(e) => setUserSearchTerm(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="required">Select Users</label>
            <div className="users-list">
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <div 
                    key={user._id} 
                    className={`user-card ${selectedUsers.find(u => u._id === user._id) ? 'selected' : ''}`}
                    onClick={() => toggleUser(user)}
                  >
                    <input 
                      type="checkbox" 
                      checked={!!selectedUsers.find(u => u._id === user._id)}
                      onChange={() => {}}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="user-info">
                      <div className="user-name">{user.name}</div>
                      <div className="user-email">{user.email}</div>
                      {user.team && <div className="user-team">{user.team} {user.subteam ? `• ${user.subteam}` : ''}</div>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">🔍</div>
                  <p>No users found matching the selected criteria</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Group Selection */}
      {userMode === 'group' && (
        <div id="group-mode" className="user-mode-content">
          <div className="form-group">
            <label>Search Teams</label>
            <input 
              type="text" 
              placeholder="Search teams by name..." 
              value={groupSearchTerm}
              onChange={(e) => setGroupSearchTerm(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="required">Select Teams</label>
            <div className="users-list">
              {filteredGroups.length > 0 ? (
                filteredGroups.map(group => (
                  <div 
                    key={group._id} 
                    className={`user-card ${selectedGroups.includes(group._id) ? 'selected' : ''}`}
                    onClick={() => toggleGroup(group._id)}
                  >
                    <input 
                      type="checkbox" 
                      checked={selectedGroups.includes(group._id)}
                      onChange={() => {}}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="user-info">
                      <div className="user-name">{group.name}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">🔍</div>
                  <p>No teams found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bulk Email Entry */}
      {userMode === 'bulk' && (
        <div id="bulk-mode" className="user-mode-content">
          <div className="form-group">
            <label className="required">Enter User Emails</label>
            <textarea 
              value={bulkEmails}
              onChange={(e) => validateBulkEmails(e.target.value)}
              placeholder="Enter email addresses (one per line)&#10;john.doe@company.com&#10;jane.smith@company.com&#10;mike.wilson@company.com&#10;&#10;Maximum 50 emails allowed"
            />
            <div className={emailCounter.className}>{emailCounter.text}</div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end',gap: '10px' }}>
        <button className="btn-secondary" onClick={onBack} type="button">
          <ChevronLeft size={16}/> Previous
        </button>
        <button 
          className="btn-primary" 
          onClick={onNext}
          type="button"
          disabled={
            (userMode === 'individual' && selectedUsers.length === 0) ||
            (userMode === 'group' && selectedGroups.length === 0) ||
            (userMode === 'bulk' && (getEmailCount() === 0 || getEmailCount() > 50))
          }
        >
          Next: Schedule & Settings <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Step2UserSelection;
