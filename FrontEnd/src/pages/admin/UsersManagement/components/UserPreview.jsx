import React from 'react';
import { User, Users } from 'lucide-react';
import { GoX } from 'react-icons/go';

const UserPreview = ({ isOpen, onClose, user, assignments = [] }) => {
  if (!isOpen || !user) {
    return null;
  }

  const overlayClick = (event) => {
    if (event.target.classList.contains('addOrg-modal-overlay')) {
      onClose && onClose();
    }
  };

  return (
    <div className="addOrg-modal-overlay" onClick={overlayClick}>
      <div className="addOrg-modal-content" role="dialog" aria-modal="true" aria-labelledby="user-preview-title">
        <div className="addOrg-modal-header">
          <div className="addOrg-header-content">
            <div className="addOrg-header-icon">
              <User size={24} color="#5570f1" />
            </div>
            <div>
              <h2 id="user-preview-title">{user.name || 'Unnamed User'}</h2>
              <p className="addOrg-header-subtitle">User overview</p>
            </div>
          </div>
          <button
            type="button"
            className="addOrg-close-btn"
            onClick={onClose}
            aria-label="Close preview"
          >
            <GoX size={20} />
          </button>
        </div>

        <div className="addOrg-form-section" style={{ padding: 24 }}>
          <div className="addOrg-form-grid">
            <div className="addOrg-form-group">
              <label className="addOrg-form-label">Name</label>
              <div className="addOrg-form-input" style={{ background: '#f8fafc' }}>
                {user.name || '—'}
              </div>
            </div>
            <div className="addOrg-form-group">
              <label className="addOrg-form-label">Email</label>
              <div className="addOrg-form-input" style={{ background: '#f8fafc' }}>
                {user.email || '—'}
              </div>
            </div>
          </div>

          <div className="addOrg-form-group" style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Users size={18} color="#5570f1" />
              <label className="addOrg-form-label" style={{ marginBottom: 0 }}>Teams &amp; Subteams</label>
            </div>
            <div className="table-container" style={{ marginTop: 12 }}>
              {assignments.length === 0 ? (
                <div className="table-row" style={{ justifyItems: 'center' }}>
                  <div style={{ gridColumn: '1 / -1', color: '#6b7280' }}>No team assignments</div>
                </div>
              ) : (
                <>
                  <div
                    className="table-header"
                    style={{
                      gridTemplateColumns: '1fr 1fr',
                      textAlign: 'left',
                      justifyItems: 'flex-start'
                    }}
                  >
                    <div>Team Name</div>
                    <div>Subteam Name</div>
                  </div>
                  {assignments.map((assignment) => (
                    <div
                      key={`preview-${assignment.teamId}-${assignment.subTeamId || 'none'}`}
                      className="table-row"
                      style={{
                        gridTemplateColumns: '1fr 1fr',
                        textAlign: 'left',
                        justifyItems: 'flex-start'
                      }}
                    >
                      <div>{assignment.teamName || '—'}</div>
                      <div>{assignment.subTeamName || '—'}</div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPreview;
