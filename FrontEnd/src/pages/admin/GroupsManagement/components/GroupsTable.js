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
  pageNumbers 
}) => {
  return (
    <div className="groups-management-table-container">
      <div className="groups-management-table-header">
        <div className="groups-management-table-title">Groups List</div>
        <div className="groups-management-table-info">{groups.length} groups found</div>
      </div>
      <table className="groups-management-table">
        <thead>
          <tr>
            <th className="groups-management-checkbox-cell">
              <input 
                type="checkbox" 
                checked={selectAll} 
                onChange={handleSelectAll} 
              />
            </th>
            <th>Name</th>
            <th>Description</th>
            <th>Status</th>
            <th>Members</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <tr key={group.id}>
              <td className="groups-management-checkbox-cell">
                <input 
                  type="checkbox" 
                  checked={selectedGroups.includes(group.id)} 
                  onChange={(e) => handleSelectGroup(e, group.id)} 
                />
              </td>
              <td className="groups-management-name-cell">{group.name}</td>
              <td className="groups-management-description-cell">{group.description}</td>
              <td>
                <span className={`groups-management-status-badge status-${group.status}`}>
                  {group.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td>{group.membersCount || 0}</td>
              <td className="groups-management-action-cell">
                <button 
                  className="groups-management-btn-edit"
                  onClick={() => handleEditGroup(group)}
                  title="Edit Group"
                >
                  Edit
                </button>
                <button 
                  className="groups-management-btn-delete"
                  onClick={() => handleDeleteGroup(group.id)}
                  title="Delete Group"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          
          {groups.length === 0 && (
            <tr>
              <td colSpan="6" className="groups-management-no-results">
                No groups found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      
      <div className="groups-management-pagination">
        <button 
          className="groups-management-pagination-btn" 
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          &laquo; Previous
        </button>
        <div className="groups-management-pagination-pages">
          {pageNumbers.map(number => (
            <button 
              key={number}
              className={`groups-management-pagination-page ${currentPage === number ? 'groups-management-active' : ''}`}
              onClick={() => handlePageChange(number)}
            >
              {number}
            </button>
          ))}
        </div>
        <button 
          className="groups-management-pagination-btn"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next &raquo;
        </button>
      </div>
    </div>
  );
};

export default GroupsTable;