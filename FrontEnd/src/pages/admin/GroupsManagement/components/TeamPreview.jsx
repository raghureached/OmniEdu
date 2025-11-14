import React, { useState } from 'react';
import { Users, Trash2 } from 'lucide-react';
import { GoOrganization, GoX } from 'react-icons/go';
import { useSelector } from 'react-redux';
import { FiEdit3 } from 'react-icons/fi';
import TeamPreviewMembersModal from './TeamPreviewMembersModal';
const TeamPreview = ({ isOpen, onClose, team, loading, createSubTeam, updateSubTeam, deleteSubTeam, inline = false }) => {
  const [showForm, setShowForm] = useState(false);
  const [currentSubTeam, setCurrentSubTeam] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const [membersModalTitle, setMembersModalTitle] = useState('');
  const [membersModalMembers, setMembersModalMembers] = useState([]);
  
  // Get the latest team data from Redux store
  const groups = useSelector(state => state.groups.groups);
  const teamId = team?.id || team?._id;
  const latestTeam = groups.find(g => (g.id || g._id) === teamId) || team;
  
  const allUsers = useSelector(state => state.users?.users || []);

  if (!isOpen) return null;

  const resolveIdentifier = (value) => {
    if (!value && value !== 0) return null;
    if (typeof value === 'string' || typeof value === 'number') {
      const normalized = String(value).trim();
      return normalized.length ? normalized : null;
    }
    if (typeof value === 'object') {
      const identifier =
        value._id ||
        value.id ||
        value.uuid ||
        value.value ||
        value.team_id ||
        value.teamId ||
        value.sub_team_id ||
        value.subTeamId ||
        null;
      return identifier ? resolveIdentifier(identifier) : null;
    }
    return null;
  };

  const deriveUserAssignments = (user) => {
    if (!user) return [];

    const profile = user.profile || {};
    const assignments = Array.isArray(profile.teams) && profile.teams.length
      ? profile.teams
      : [{ team_id: profile.team_id, sub_team_id: profile.sub_team_id }];

    return assignments
      .map((assignment) => ({
        teamId: resolveIdentifier(assignment?.team_id ?? assignment?.teamId),
        subTeamId: resolveIdentifier(assignment?.sub_team_id ?? assignment?.subTeamId),
      }))
      .filter(({ teamId }) => Boolean(teamId));
  };

  if (!isOpen) return null;
  console.log('latestTeam in team preview', latestTeam);
  const subTeams = Array.isArray(latestTeam?.subTeams) ? latestTeam.subTeams : [];
   console.log('subTeams in team preview', subTeams);
  const handleShowMembers = (subTeam) => {
    if (!subTeam) return;

    const parentTeamName = latestTeam?.name || latestTeam?.teamName || 'Team';
    const subTeamCandidateIds = [
      resolveIdentifier(subTeam?._id),
      resolveIdentifier(subTeam?.id),
      resolveIdentifier(subTeam?.uuid),
    ].filter(Boolean);
    const subTeamId = subTeamCandidateIds[0] || resolveIdentifier(subTeam);
    const subTeamName = subTeam?.name || subTeam?.subTeamName || 'Sub Team';

    const membersAccumulator = [];

    const pushMember = (member) => {
      if (!member) return;
      const normalizedName = member.name?.trim?.() || member.fullName || member.email || '—';
      membersAccumulator.push({
        id: member._id || member.id || member.uuid || null,
        name: normalizedName,
        email: member.email || '—',
        subTeamName: subTeamName,
      });
    };

    if (Array.isArray(subTeam?.members)) {
      subTeam.members.forEach((member) => {
        pushMember({
          ...member,
          subTeamName: member?.subTeamName || subTeamName,
        });
      });
    }

    if (subTeamCandidateIds.length) {
      allUsers.forEach((user) => {
        const assignments = deriveUserAssignments(user);
        const matchingAssignment = assignments.find((assignment) =>
          assignment.subTeamId && subTeamCandidateIds.includes(assignment.subTeamId)
        );
        if (!matchingAssignment) return;

        const nameParts = [user.firstName, user.lastName].filter(Boolean);
        const displayName = user.name || user.fullName || nameParts.join(' ').trim() || user.email || '—';

        pushMember({
          id: user.uuid || user._id || user.id || null,
          name: displayName,
          email: user.email || '—',
          subTeamName,
        });
      });
    }

    const dedupedMembers = [];
    const seenById = new Set();
    const seenByEmailName = new Set();

    membersAccumulator.forEach((member) => {
      if (member.id) {
        if (seenById.has(member.id)) return;
        seenById.add(member.id);
      } else {
        const key = `${member.email}|${member.name}`;
        if (seenByEmailName.has(key)) return;
        seenByEmailName.add(key);
      }
      dedupedMembers.push(member);
    });

    setMembersModalTitle(`${parentTeamName} - ${subTeamName}`);
    setMembersModalMembers(dedupedMembers);
    setMembersModalOpen(true);
  };

  const handleCloseMembersModal = () => {
    setMembersModalOpen(false);
    setMembersModalMembers([]);
    setMembersModalTitle('');
  };

  const handleOverlayClick = (e) => {
    if (!inline && e.target.classList.contains('addOrg-modal-overlay')) {
      onClose && onClose();
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const mappedPayload = {
      team_id: latestTeam._id,
      subTeamName: formData.subTeamName?.trim() || '',
    };

    try {
      if (currentSubTeam) {
        const id = currentSubTeam.uuid;
        if (!id) {
          throw new Error('Unable to determine group identifier for update.');
        }
        await updateSubTeam(id, mappedPayload);
      } else {
        await createSubTeam({data: mappedPayload});  
      }
      handleCloseForm();
    } catch (submitError) {
      console.error('Failed to submit group form:', submitError);
    }
  };
  const handleEdit = (uuid, name) => {
    setCurrentSubTeam({ uuid, name });
    setFormData({
      subTeamName: name,
    });
    setEditMode(true);
    setShowForm(true);
  }

  const handleDelete = async (uuid, name) => {
    if (!uuid) return;
    const ok = window.confirm(`Are you sure you want to delete subteam "${name || ''}"?`);
    if (ok && deleteSubTeam) {
      try {
        await deleteSubTeam(uuid);
      } catch (error) {
        console.error('Failed to delete subteam:', error);
        alert('Failed to delete subteam. Please try again.');
      }
    }
  };

  const handleAddSubTeam = () => {
    setCurrentSubTeam(null);
    setFormData({ subTeamName: '' });
    setEditMode(false);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setCurrentSubTeam(null);
    setEditMode(false);
    setFormData({ subTeamName: '' });
  };

  const containerClass = inline ? 'team-preview-inline-container' : 'addOrg-modal-overlay';
  const contentClass = inline ? 'addOrg-modal-content team-preview-inline-card' : 'addOrg-modal-content';
  const contentStyle = inline
    ? { maxWidth: '1500px', width: '100%',borderRadius: '1px' ,boxShadow: 'none' }
    : { maxWidth: '1500px',borderRadius: '1px' ,boxShadow: 'none' };

  return (
    <div
      className={containerClass}
      onClick={handleOverlayClick}
      role={inline ? undefined : 'presentation'}
    >
      <div
        className={contentClass}
        style={contentStyle}
        role="dialog"
        aria-modal={!inline}
        aria-labelledby="team-preview-title"
      >
        {!showForm && (
          <>
            <div className="addOrg-modal-header" style={{borderRadius:'none'}}>
              <div className="addOrg-header-content">
                <div className="addOrg-header-icon">
                  <Users size={24} color="#5570f1" />
                </div>
                <div>
                  <h2 id="team-preview-title">Team {latestTeam?.name || '—'}</h2>
                  <p className="addOrg-header-subtitle">View and manage subteams for this team</p>
                </div>
              </div>
              {/* <button type="button" className="addOrg-close-btn" onClick={onClose} aria-label="Close modal">
                <GoX size={20} />
              </button> */}
            </div>
            <div style={{display:'flex',justifyContent:'flex-end',width:'100%',padding:12}}>
              <button className='btn-primary' onClick={handleAddSubTeam}>+ Add Sub Team</button>
            </div>
          </>
        )}

        {showForm ? (
          <div className={inline ? 'team-preview-inline-nested' : 'addOrg-modal-overlay'}>
            <div
              className={inline ? 'addOrg-modal-content team-preview-inline-card' : 'addOrg-modal-content'}
              style={contentStyle}
            >
              <div className="addOrg-modal-header">
                <div className="addOrg-header-content">
                  <div className="addOrg-header-icon">
                    <Users size={24} color="#5570f1" />
                  </div>
                  <div>
                    <h2>{editMode ? "Edit Sub Team" : "Add New Sub Team"}</h2>
                    <p className="addOrg-header-subtitle">
                      {editMode ? "Update sub team details" : "Create a new sub team"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="addOrg-close-btn"
                  onClick={handleCloseForm}
                  aria-label="Close modal"
                >
                  <GoX size={20} />
                </button>
              </div>
              <form onSubmit={handleFormSubmit} className="addOrg-org-form">
                {/* Basic Information Section */}
                <div className="addOrg-form-section">
                  {/* <h3 className="addOrg-section-title" >Basic Information</h3> */}
                  <div className="addOrg-form-grid" style={{ marginTop: "32px" }}>
                    <div className="addOrg-form-group">
                      <label className="addOrg-form-label">
                        Sub Team Name<span className="addOrg-required">*</span>
                      </label>
                      <input
                        type="text"
                        name="subTeamName"
                        placeholder="Enter or select subteam name"
                        list="subTeamSuggestions"
                        value={formData.subTeamName}
                        onChange={handleInputChange}
                        className="addOrg-form-input"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="addOrg-form-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleCloseForm}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={loading}>
                    <GoOrganization size={16} />
                    <span>{editMode ? 'Update Sub Team' : 'Create Sub Team'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="addOrg-form-section" style={{ padding: 12 }}>
            {/* <h3 className="addOrg-section-title" style={{ marginTop: 0 }}>{team?.name || '—'}</h3> */}

            <div className="table-container" style={{ marginTop: 12 }}>
              <div className="table-header" style={{gridTemplateColumns: "50px 250px 250px 250px"}}>
                <div style={{ width: 24 }}></div>
                <div className="col-team">Sub Team Name</div>
                <div className="col-members">Members</div>
                <div className="col-actions">Actions</div>
              </div>

              {subTeams.length === 0 ? (
                <div className="table-row" style={{gridTemplateColumns: "50px 250px 250px 250px"}}>
                  <div style={{ gridColumn: '1 / -1', color: '#6b7280' }}>No subteams found.</div>
                </div>
              ) : (
                subTeams.map((st) => (
                  <div key={st._id} className="table-row" style={{gridTemplateColumns: "50px 250px 250px 250px"}}>
                    <div style={{ width: 24 }}></div>
                    <div className="col-team">{st.name}</div>
                    <button
                      type="button"
                      className="col-members"
                      onClick={() => handleShowMembers(st)}
                      style={{ textDecoration: 'underline', background: 'none', border: 'none', padding: 0, textAlign: 'center', cursor: 'pointer', fontWeight: '600' }}
                    >
                      {st.membersCount || 0}
                    </button>
                    
                  
                    <div className="col-actions" style={{ display: 'flex', gap: 10,justifyContent:'center' }}>
                      <button
                        className="global-action-btn edit"
                        onClick={() => handleEdit(st.uuid, st.name)}
                        aria-label={`Edit subteam ${st.name}`}
                      >
                        <FiEdit3 size={16} />
                      </button>
                      <button
                        className="global-action-btn delete"
                        onClick={() => handleDelete(st.uuid, st.name)}
                        aria-label={`Delete subteam ${st.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      <TeamPreviewMembersModal
        isOpen={membersModalOpen}
        onClose={handleCloseMembersModal}
        title={membersModalTitle}
        members={membersModalMembers}
      />
    </div>
  );
};

export default TeamPreview;

