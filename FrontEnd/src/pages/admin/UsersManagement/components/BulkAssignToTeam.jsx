import React from 'react';
import { Users } from 'lucide-react';
import { GoX } from 'react-icons/go';
import CustomSelect from '../../../../components/dropdown/DropDown';

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

  const handleTeamChange = (value) => {
    onTeamChange && onTeamChange(value);
  };

  const handleSubTeamChange = (value) => {
    onSubTeamChange && onSubTeamChange(value);
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
              <CustomSelect
                className="addOrg-form-select"
                value={assignTeamId}
                options={[
                  { value: "", label: "Select Team" },
                  ...(resolvedTeams.map((team) => ({
                    value: team?._id || team?.id,
                    label: team?.name || team?.teamName || 'Untitled Team',
                    disabled: team.status?.toLowerCase() === "inactive"
                  })) || [])
                ]}
                onChange={handleTeamChange}
                placeholder="Select Team"
              />
            </div>
            <div className="addOrg-form-group">
              <label className="addOrg-form-label">Sub Team</label>
              <CustomSelect
                className="addOrg-form-select"
                value={assignSubTeamId}
                options={[
                  { value: "", label: "Select Sub Team (optional)" },
                  ...(subTeams.map((subTeam) => ({
                    value: subTeam?._id || subTeam?.id,
                    label: subTeam?.name || subTeam?.teamName || 'Untitled Subteam'
                  })) || [])
                ]}
                onChange={handleSubTeamChange}
                placeholder="Select Sub Team (optional)"
                disabled={!assignTeamId}
              />
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
