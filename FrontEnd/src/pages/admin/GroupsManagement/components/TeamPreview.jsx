import React, { useState } from 'react';
import { Users, Trash2, Eye } from 'lucide-react';
import { GoOrganization, GoX } from 'react-icons/go';
import { useSelector } from 'react-redux';
import { FiEdit3 } from 'react-icons/fi';
const TeamPreview = ({ isOpen, onClose, team, loading, createSubTeam, updateSubTeam, deleteSubTeam }) => {
  const [showForm, setShowForm] = useState(false);
  const [currentSubTeam, setCurrentSubTeam] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  
  // Get the latest team data from Redux store
  const groups = useSelector(state => state.groups.groups);
  const teamId = team?.id || team?._id;
  const latestTeam = groups.find(g => (g.id || g._id) === teamId) || team;
  
  if (!isOpen) return null

  const subTeams = Array.isArray(latestTeam?.subTeams) ? latestTeam.subTeams : [];

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('addOrg-modal-overlay')) {
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

  return (
    <div className="addOrg-modal-overlay" onClick={handleOverlayClick}>
      <div className="addOrg-modal-content" role="dialog" aria-modal="true" aria-labelledby="team-preview-title">
        <div className="addOrg-modal-header">
          <div className="addOrg-header-content">
            <div className="addOrg-header-icon">
              <Users size={24} color="#5570f1" />
            </div>
            <div>
              <h2 id="team-preview-title">Team {latestTeam?.name || '—'}</h2>
              <p className="addOrg-header-subtitle">View and manage subteams for this team</p>
            </div>
          </div>
          <button type="button" className="addOrg-close-btn" onClick={onClose} aria-label="Close modal">
            <GoX size={20} />
          </button>
        </div>
        <div style={{display:'flex',justifyContent:'flex-end',width:'100%',padding:12}}>
          <button className='btn-primary' onClick={handleAddSubTeam}>+ Add Sub Team</button>
        </div>

        <div className="addOrg-form-section" style={{ padding: 12 }}>
          {/* <h3 className="addOrg-section-title" style={{ marginTop: 0 }}>{team?.name || '—'}</h3> */}

          <div className="table-container" style={{ marginTop: 12 }}>
            <div className="table-header">
              <div style={{ width: 24 }}></div>
              <div className="col-team">Sub Team Name</div>
              <div className="col-members">Members</div>
              <div></div>
              <div></div>
              <div className="col-actions">Actions</div>
            </div>

            {subTeams.length === 0 ? (
              <div className="table-row">
                <div style={{ gridColumn: '1 / -1', color: '#6b7280' }}>No subteams found.</div>
              </div>
            ) : (
              subTeams.map((st) => (
                <div key={st._id} className="table-row">
                  <div style={{ width: 24 }}></div>
                  <div className="col-team">{st.name}</div>
                  <div className="col-members">{st.membersCount || 0}</div>
                  <div></div>
                  <div></div>
                  <div className="col-actions" style={{ display: 'flex', gap: 10,justifyContent:'center' }}>
                    {/* <button
                      className="global-action-btn view"
                      
                      aria-label={`View subteam ${st.name}`}
                    >
                      <Eye size={16} />
                    </button> */}
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
          {showForm && (
          
                      <div className='addOrg-modal-overlay'>
          
                        <div className='addOrg-modal-content'>
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
                              <h3 className="addOrg-section-title" style={{ marginTop: "10px" }}>Basic Information</h3>
                              <div className="addOrg-form-grid">
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
          
                                  {/* <datalist id="subTeamSuggestions">
                                    {filteredGroups.map((team, index) => (
                                      <option key={index} value={team.teamName} />
                                    ))}
                                  </datalist> */}
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
                    )}
        </div>
      </div>
    </div>
  );
};

export default TeamPreview;

