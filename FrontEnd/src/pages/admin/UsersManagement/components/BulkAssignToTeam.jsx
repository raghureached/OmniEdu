import React from 'react';
import { Users } from 'lucide-react';
import { GoX } from 'react-icons/go';

const BulkAssignToTeam = ({
  isOpen,
  onClose,
  teams = [],
  assignTeamId = '',
  assignSubTeamId = '',
  onTeamChange,
  onSubTeamChange,
  onApply,
  disableApply,
  selectedCount = 0,
}) => {
  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = (event) => {
    if (event.target.classList.contains('addOrg-modal-overlay')) {
      onClose && onClose();
    }
  };

  const handleTeamChange = (event) => {
    onTeamChange && onTeamChange(event.target.value);
  };

  const handleSubTeamChange = (event) => {
    onSubTeamChange && onSubTeamChange(event.target.value);
  };

  const handleApply = async () => {
    if (onApply) {
      await onApply();
    }
  };

  const resolvedTeams = Array.isArray(teams) ? teams : [];
  const selectedTeam = resolvedTeams.find((team) => (team?._id || team?.id) === assignTeamId);
  const subTeams = Array.isArray(selectedTeam?.subTeams) ? selectedTeam.subTeams : [];

  return (
    <div className="addOrg-modal-overlay" onClick={handleOverlayClick}>
      <div
        className="addOrg-modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bulk-assign-title"
      >
        <div className="addOrg-modal-header">
          <div className="addOrg-header-content">
            <div className="addOrg-header-icon">
              <Users size={24} color="#5570f1" />
            </div>
            <div>
              <h2 id="bulk-assign-title">Assign to Team</h2>
              <p className="addOrg-header-subtitle">
                {selectedCount > 0
                  ? `${selectedCount} user${selectedCount > 1 ? 's' : ''} selected`
                  : 'Select users to assign'}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="addOrg-close-btn"
            onClick={onClose}
            aria-label="Close assign to team"
          >
            <GoX size={20} />
          </button>
        </div>

        <div className="addOrg-form-section" style={{ padding: 24 }}>
          <div className="addOrg-form-grid">
            <div className="addOrg-form-group">
              <label className="addOrg-form-label">Team<span style={{ color: 'red' }}> *</span></label>
              <select
                className="addOrg-form-select"
                value={assignTeamId}
                onChange={handleTeamChange}
              >
                <option value="">Select Team</option>
                {resolvedTeams.map((team) => (
                  <option key={team?._id || team?.id} value={team?._id || team?.id}>
                    {team?.name || team?.teamName || 'Untitled Team'}
                  </option>
                ))}
              </select>
            </div>
            <div className="addOrg-form-group">
              <label className="addOrg-form-label">Sub Team</label>
              <select
                className="addOrg-form-select"
                value={assignSubTeamId}
                onChange={handleSubTeamChange}
                disabled={!assignTeamId}
              >
                <option value="">Select Sub Team (optional)</option>
                {subTeams.map((subTeam) => (
                  <option key={subTeam?._id || subTeam?.id} value={subTeam?._id || subTeam?.id}>
                    {subTeam?.name || subTeam?.teamName || 'Untitled Subteam'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
            <button
              type="button"
              className="reset-btn"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleApply}
              disabled={disableApply}
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkAssignToTeam;
