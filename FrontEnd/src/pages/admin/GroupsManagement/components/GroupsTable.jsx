import { Edit3, Trash2, Eye, Plus } from 'lucide-react';
import React from 'react';

const GroupsTable = ({
  groups,
  selectedGroups,
  handleSelectGroup,
  selectAll,
  handleSelectAll,
  handleEditGroup,
  handleDeleteGroup,
  onTogglePreview,
  expandedTeamId,
  renderExpandedContent,
  onShowMembers,
  onAddSubTeam,
  currentPage,
  totalPages,
  handlePageChange,
  }) => {
  // console.log(groups)
  return (
    <>
    {groups.length === 0 ? (
      <div style={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
        No groups found.
      </div>
    ) : (
      <div className="table-container">
     
        <div className="table-header" style={{fontSize:'0.9rem',fontWeight:'600',color:'#020202', gridTemplateColumns: "50px 250px 180px 180px 180px 40px 120px"}}>
          {/* 1: Select All */}
          <input
            className="col-select"
            type="checkbox"
            checked={selectAll}
            onChange={handleSelectAll}
          />
          {/* 2: Team Name */}
          <div className="col-team">Team Name</div>
          <div className="col-subteam">Sub Teams</div>
          {/* 3: Members */}
          <div className="col-members">Members</div>
          {/* 4: Status */}
          <div className="col-status">Status</div>
          <div className="col-spacer" aria-hidden="true"></div>

          {/* 5: Actions */}
          <div className="col-actions">Actions</div>
        </div>

        {groups.map((group) => {
          const isExpanded = expandedTeamId === group.id;
          return (
            <React.Fragment key={group.id}>
              <div className="table-row" style={{gridTemplateColumns: "50px 250px 180px 180px 180px 40px 120px"}}>
                {/* 1: Checkbox */}
                <input
                  className="col-select"
                  type="checkbox"
                  checked={selectedGroups.includes(group.id)}
                  onChange={(e) => handleSelectGroup(e, group.id)}
                />

                {/* 2: Team name */}
                <div className="col-team" data-label="Team Name">{group.teamName}</div>
                <div className="col-subteam" data-label="Sub Teams">{group.subTeams.length}</div>

                {/* 3: Members */}
                {/* <div>{group.subTeamName }</div> */}

                {/* 4: Members */}
                <button
                  type="button"
                  className="col-members members-link"
                  data-label="Members"
                  onClick={() => onShowMembers && onShowMembers(group)}
                  style={{ textDecoration: 'underline', background: 'none', border: 'none', padding: 0, textAlign: 'center', cursor: 'pointer', fontWeight: '600',fontSize:'14px',color:'#434343' }}
                >
                  {group.membersCount || 0}
                </button>
               
                {/* 5: Status */}
                <div className="col-status" data-label="Status">
                  <span
                    className={`users-status-badge status-${group.status.toLowerCase()}`}
                  >
                  {group.status === 'Active' ? '✓ Active' : '✗ Inactive'}
                  </span>
                </div>
               
              <div className="col-spacer" aria-hidden="true"></div>


                {/* 6: Actions */}
                <div className="col-actions" data-label="Actions" style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                <button
                    className={`global-action-btn ${isExpanded ? 'active' : ''}`}
                    onClick={() => onTogglePreview && onTogglePreview(group)}
                    aria-label={`Preview team ${group.teamName}`}
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    className="global-action-btn"
                    onClick={() => onAddSubTeam && onAddSubTeam(group)}
                    aria-label={`Add subteam to ${group.teamName}`}
                  >
                    <Plus size={16} />
                  </button>
                  <button className="global-action-btn edit" onClick={() => {
                    handleEditGroup(group)
                  }}>
                    <Edit3 size={16} />
                  </button>
                  <button
                    className="global-action-btn delete"
                    onClick={() => handleDeleteGroup(group.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                 
                </div>
              </div>
              {isExpanded && renderExpandedContent && (
                <div className="expanded-content-wrapper">
                  {renderExpandedContent(group)}
                </div>
              )}
            </React.Fragment>
          );
        })}
        {/* Pagination aligned with OrganizationManagement */}
      <div className="pagination" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%',marginTop:'0px',borderTop:'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            type="button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            style={{ padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: 6, background: '#fff', color: '#0f172a', cursor: currentPage <= 1 ? 'not-allowed' : 'pointer' }}
          >
            Prev
          </button>
          <span style={{ color: '#0f172a' }}>
            {`Page ${currentPage} of ${Math.max(1, totalPages)}`}
          </span>
          <button
            type="button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            style={{ padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: 6, background: '#fff', color: '#0f172a', cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer' }}
          >
            Next
          </button>
        </div>
      </div>
        
      </div>
    )}
     
    </>
  );
};

export default GroupsTable;