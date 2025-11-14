import React from 'react';
import { Users } from 'lucide-react';
import { GoX } from 'react-icons/go';

const TeamPreviewMembersModal = ({ isOpen, onClose, title, members = [] }) => {
  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = (event) => {
    if (event.target.classList.contains('addOrg-modal-overlay')) {
      onClose && onClose();
    }
  };

  const effectiveTitle = title?.trim() ? title.trim() : 'Members';

  return (
    <div className="addOrg-modal-overlay" onClick={handleOverlayClick}>
      <div
        className="addOrg-modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="team-preview-members-title"
      >
        <div className="addOrg-modal-header" style={{borderRadius:'none'}}>
          <div className="addOrg-header-content">
            <div className="addOrg-header-icon">
              <Users size={24} color="#5570f1" />
            </div>
            <div>
              <h2 id="team-preview-members-title">Members of { effectiveTitle}</h2>
              <p className="addOrg-header-subtitle">SubTeam Overview</p>
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
            <div style={{ textAlign: 'center', color: '#64748b' }}>No members found for this subteam.</div>
          ) : (
            <div className="table-container" style={{ marginTop: 12 }}>
              <div className="table-header" style={{ gridTemplateColumns: '1fr  1fr' }}>
                <div className="col-team">Name</div>
                <div className="col-team">Email</div>
                {/* <div className="col-team">Sub Team</div> */}
              </div>

              {members.map((member) => (
                <div
                  key={member.id || `${member.email}|${member.name}`}
                  className="table-row"
                  style={{ gridTemplateColumns: '1fr  1fr' }}
                >
                  <div className="col-team">{member.name || '—'}</div>
                  <div className="col-team">{member.email || '—'}</div>
                  {/* <div className="col-team">{member.subTeamName || '—'}</div> */}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamPreviewMembersModal;
