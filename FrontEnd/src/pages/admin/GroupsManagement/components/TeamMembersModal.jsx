import React from 'react';
import { Users } from 'lucide-react';
import { GoX } from 'react-icons/go';

const TeamMembersModal = ({ isOpen, onClose, team, members = [] }) => {
  if (!isOpen || !team) {
    return null;
  }

  const handleOverlayClick = (event) => {
    if (event.target.classList.contains('addOrg-modal-overlay')) {
      onClose && onClose();
    }
  };

  return (
    <div className="addOrg-modal-overlay" onClick={handleOverlayClick}>
      <div
        className="addOrg-modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="team-members-title"
      >
        <div className="addOrg-modal-header">
          <div className="addOrg-header-content">
            <div className="addOrg-header-icon">
              <Users size={24} color="#5570f1" />
            </div>
            <div>
              <h2 id="team-members-title">Members of {team.teamName || team.name || 'Team'}</h2>
              <p className="addOrg-header-subtitle">Team overview</p>
            </div>
          </div>
          <button
            type="button"
            className="addOrg-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <GoX size={20} />
          </button>
        </div>

        <div className="addOrg-form-section" style={{ padding: 24 }}>
          {members.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#64748b' }}>No members found for this team.</div>
          ) : (
            <div className="table-container" style={{ marginTop: 12 }}>
              <div className="table-header" style={{ gridTemplateColumns: ' 1fr  1fr' }}>
                <div className="col-team">Name</div>
                <div className="col-team">Email</div>
                {/* <div className="col-team">Team</div> */}
              </div>

              {members.map((member) => (
                <div key={member.id || member._id} className="table-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <div className="col-team">{member.name || member.fullName || '—'}</div>
                  <div className="col-team">{member.email || '—'}</div>
                  {/* <div className="col-team">{team.teamName || team.name || '—'}</div> */}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamMembersModal;
