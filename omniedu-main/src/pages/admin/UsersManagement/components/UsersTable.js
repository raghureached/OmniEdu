import React from 'react';

const UsersTable = ({ 
  users, 
  selectedUsers, 
  handleSelectUser, 
  selectAll, 
  handleSelectAll, 
  handleEditUser, 
  handleDeleteUser, 
  currentPage, 
  totalPages, 
  handlePageChange, 
  pageNumbers 
}) => {
  return (
    <div className="users_management-table-container">
      <div className="users_management-table-header">
        <div className="users_management-table-title">Users List</div>
        <div className="users_management-table-info">{users.length} users found</div>
      </div>
      <table className="users_management-table">
        <thead>
          <tr>
            <th className="users_management-checkbox-cell">
              <input 
                type="checkbox" 
                checked={selectAll} 
                onChange={handleSelectAll} 
              />
            </th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Designation</th>
            <th>Team</th>
            <th>Sub Team</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="users_management-checkbox-cell">
                <input 
                  type="checkbox" 
                  checked={selectedUsers.includes(user.id)} 
                  onChange={(e) => handleSelectUser(e, user.id)} 
                />
              </td>
              <td className="users_management-name-cell">{user.name}</td>
              <td className="users_management-email-cell">{user.email}</td>
              <td>{user.role}</td>
              <td>{user.designation}</td>
              <td>{user.team}</td>
              <td>{user.subTeam}</td>
              <td>
                <span className={`users_management-status-badge status-${user.status}`}>
                  {user.status === 'active' ? 'Active' : 
                   user.status === 'inactive' ? 'Inactive' : 
                   user.status === 'pending' ? 'Pending' : 'Suspended'}
                </span>
              </td>
              <td className="users_management-action-cell">
                <button 
                  className="users_management-btn-edit"
                  onClick={() => handleEditUser(user)}
                  title="Edit User"
                >
                  Edit
                </button>
                <button 
                  className="users_management-btn-delete"
                  onClick={() => handleDeleteUser(user.id)}
                  title="Delete User"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="users_management-pagination">
        <button 
          className="users_management-pagination-btn" 
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          &laquo; Previous
        </button>
        <div className="users_management-pagination-pages">
          {pageNumbers.map(number => (
            <button 
              key={number}
              className={`users_management-pagination-page ${currentPage === number ? 'users_management-active' : ''}`}
              onClick={() => handlePageChange(number)}
            >
              {number}
            </button>
          ))}
        </div>
        <button 
          className="users_management-pagination-btn"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next &raquo;
        </button>
      </div>
    </div>
  );
};

export default UsersTable;