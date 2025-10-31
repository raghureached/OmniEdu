import { Edit3, Trash2, Eye } from 'lucide-react';
import React from 'react';

const GroupsTable = ({
  groups,
  selectedGroups,
  handleSelectGroup,
  selectAll,
  handleSelectAll,
  handleEditGroup,
  handleDeleteGroup,
  onPreviewTeam,
  currentPage,
  totalPages,
  handlePageChange,
}) => {
  console.log(groups)
  return (
    <>
    {groups.length === 0 ? (
      <div style={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
        No groups found.
      </div>
    ) : (
      <div className="table-container">
        <div className="table-header">
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
          <div></div>

          {/* 5: Actions */}
          <div className="col-actions">Actions</div>
        </div>

        {groups.map((group) => (
          <div key={group.id} className="table-row">
            {/* 1: Checkbox */}
            <input
              className="col-select"
              type="checkbox"
              checked={selectedGroups.includes(group.id)}
              onChange={(e) => handleSelectGroup(e, group.id)}
            />

            {/* 2: Team name */}
            <div className="col-team">{group.teamName}</div>
            <div className="col-subteam">{group.subTeams.length}</div>

            {/* 3: Members */}
            {/* <div>{group.subTeamName }</div> */}

            {/* 4: Members */}
            <div className="col-members">{group.membersCount || 0}</div>

            {/* 5: Status */}
            <div className="col-status">
              <span
                className={`status-badge ${group.status.toLowerCase() === 'active' ? 'status-paid' : 'status-cancelled'}`}
              >
                {group.status.toLowerCase() === 'active' ? '✓ Active' : '✕ Inactive'}
              </span>
            </div>
          <div></div>


            {/* 6: Actions */}
            <div className="col-actions" style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button
                className="global-action-btn"
                onClick={() => onPreviewTeam && onPreviewTeam(group)}
                aria-label={`Preview team ${group.teamName}`}
              >
                <Eye size={16} />
              </button>
              <button
                className="global-action-btn delete"
                onClick={() => handleDeleteGroup(group.id)}
              >
                <Trash2 size={16} />
              </button>
              <button className="global-action-btn edit" onClick={() => {
                handleEditGroup(group)
              }}>
                <Edit3 size={16} />
              </button>
            </div>
          </div>
        ))}

        
      </div>
    )}
      {/* Pagination aligned with OrganizationManagement */}
      <div className="pagination" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
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
    </>
  );
};

export default GroupsTable;