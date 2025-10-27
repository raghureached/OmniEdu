import { Edit3, Trash2 } from 'lucide-react';
import React from 'react';

const GroupsTable = ({
  groups,
  selectedGroups,
  handleSelectGroup,
  selectAll,
  handleSelectAll,
  handleEditGroup,
  handleDeleteGroup,
  currentPage,
  totalPages,
  handlePageChange,
}) => {
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
            type="checkbox"
            checked={selectAll}
            onChange={handleSelectAll}
          />
          {/* 2: Placeholder for Plan ID column to match 8-col grid */}
          <div>Team Name</div>
          {/* 3: Group (Name) */}
          <div>Sub Team Name</div>
          {/* 4: Members */}
          <div>Members</div>
          {/* 5: Status */}
          <div>Status</div>
          {/* 6: Actions */}
          <div>Actions</div>
        </div>

        {groups.map((group) => (
          <div key={group.id} className="table-row">
            {/* 1: Checkbox */}
            <input
              type="checkbox"
              checked={selectedGroups.includes(group.id)}
              onChange={(e) => handleSelectGroup(e, group.id)}
            />

            {/* 2: Group name */}
            <div>{group.teamName}</div>

            {/* 3: Members */}
            <div>{group.subTeamName || 0}</div>

            {/* 4: Members */}
            <div>{group.membersCount || 0}</div>

            {/* 5: Status */}
            <div>
              <span
                className={`status-badge ${group.status === 'active' ? 'status-paid' : 'status-cancelled'}`}
              >
                {group.status === 'active' ? '✓ Active' : '✕ Inactive'}
              </span>
            </div>

            {/* 6: Actions */}
            <div style={{ display: "flex", gap: "10px" }}>
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