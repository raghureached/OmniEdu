import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Loader, 
  X, 
  Edit3, 
  Trash2,
  Plus
} from 'lucide-react';
import { RiDeleteBinFill } from 'react-icons/ri';
import { FiEdit3 } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  bulkDeleteUsers,
  setFilters,
  clearFilters,
  selectUser,
  deselectUser,
  selectAllUsers,
  deselectAllUsers
} from '../../../store/slices/userSlice';
import api from '../../../services/api';
import { useNavigate } from 'react-router-dom';
import './UsersManagement.css';
import LoadingScreen from '../../../components/common/Loading/Loading';
import { GoX } from 'react-icons/go';

const UsersManagement = () => {
  const dispatch = useDispatch();
  const { users, loading, error, filters } = useSelector((state) => ({
    users: state.users.users,
    loading: state.users.loading,
    error: state.users.error,
    filters: state.users.filters || {}
  }));
  
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showBulkAction, setShowBulkAction] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Fetch users whenever filters change (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      dispatch(fetchUsers(filters));
    }, 200);
    return () => clearTimeout(timeoutId);
  }, [dispatch, filters]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    dispatch(setFilters({ [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(setFilters({ search: searchTerm, page: 1 }));
  };

  const clearSearch = () => {
    setSearchTerm('');
    dispatch(setFilters({ search: '', page: 1 }));
  };

  const openForm = (user = null) => {
    if (user) {
      setEditMode(true);
      setCurrentUser(user);
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        role: user.role || 'user',
        status: user.status || 'active',
        team: user.team || '',
        designation: user.designation || ''
      });
    } else {
      setEditMode(false);
      setCurrentUser(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        role: 'user',
        status: 'active',
        team: '',
        designation: ''
      });
    }
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditMode(false);
    setCurrentUser(null);
  };

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'user',
    status: 'active',
    team: '',
    designation: ''
  });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (editMode && currentUser) {
      try {
        await dispatch(updateUser({ id: currentUser.id || currentUser._id, userData: formData }));
        closeForm();
      } catch (error) {
        console.error('Error updating user:', error);
      }
    } else {
      try {
        await dispatch(createUser(formData));
        closeForm();
      } catch (error) {
        console.error('Error creating user:', error);
      }
    }
  };

  const handleDelete = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      dispatch(deleteUser(userId));
    }
  };

  const handleBulkAction = (action) => {
    if (selectedItems.length === 0) {
      alert('Please select at least one user');
      return;
    }

    if (action === 'delete') {
      if (window.confirm(`Are you sure you want to delete ${selectedItems.length} users?`)) {
        dispatch(bulkDeleteUsers(selectedItems));
        setSelectedItems([]);
        setShowBulkAction(false);
      }
    } else if (action === 'deactivate') {
      // Handle bulk deactivate
      console.log('Bulk deactivate:', selectedItems);
      setSelectedItems([]);
      setShowBulkAction(false);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(users.map(user => user.id || user._id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (e, userId) => {
    if (e.target.checked) {
      setSelectedItems([...selectedItems, userId]);
    } else {
      setSelectedItems(selectedItems.filter(id => id !== userId));
    }
  };

  const handlePageChange = (newPage) => {
    dispatch(setFilters({ page: newPage }));
  };

  // Pagination
  const currentPage = filters.page || 1;
  const itemsPerPage = filters.limit || 10;
  const totalPages = Math.ceil((users?.length || 0) / itemsPerPage);

  // Available roles
  const roles = [
    { value: 'user', label: 'User' },
    { value: 'admin', label: 'Admin' },
    { value: 'manager', label: 'Manager' },
    { value: 'instructor', label: 'Instructor' }
  ];

  // Available teams
  const teams = [
    { value: 'tech', label: 'Tech' },
    { value: 'hr', label: 'HR' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'sales', label: 'Sales' },
    { value: 'support', label: 'Support' }
  ];

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="main-content">
      <div className="page-content">
        <div className="page-header">
          <h1 className="page-title">Users Management</h1>
          <button 
            className="add-btn"
            onClick={() => openForm()}
          >
            <Plus size={18} />
            Add User
          </button>
        </div>

        {/* Search and Filter Controls */}
        <div className="controls">
          <form onSubmit={handleSearch} className="search-container">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              className="search-input"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                type="button" 
                onClick={clearSearch}
                className="clear-search"
              >
                <X size={16} />
              </button>
            )}
          </form>

          <div className="filter-container" style={{ position: 'relative' }}>
            <button 
              className="filter-btn"
              onClick={() => setShowBulkAction(!showBulkAction)}
            >
              <Filter size={16} />
              <span>Actions</span>
              <ChevronDown size={16} />
            </button>

            {showBulkAction && (
              <div className="bulk-action-panel">
                <h4>Bulk Actions</h4>
                <div className="bulk-actions">
                  <button 
                    className="bulk-action-btn"
                    onClick={() => handleBulkAction('deactivate')}
                  >
                    Deactivate Selected
                  </button>
                  <button 
                    className="bulk-action-btn delete"
                    onClick={() => handleBulkAction('delete')}
                  >
                    Delete Selected
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Users Table */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={selectedItems.length === users?.length && users?.length > 0}
                  />
                </th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Team</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((user) => (
                <tr key={user.id || user._id}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={selectedItems.includes(user.id || user._id)}
                      onChange={(e) => handleSelectItem(e, (user.id || user._id))}
                    />
                  </td>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">
                        {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                      </div>
                      <div>
                        <div className="user-name">{user.firstName} {user.lastName}</div>
                        <div className="user-designation">{user.designation}</div>
                      </div>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className="role-badge">
                      {typeof user.role === 'string' ? user.role : (user.role?.name || user.role?.title || '-')}
                    </span>
                  </td>
                  <td>{typeof user.team === 'string' ? user.team : (user.team?.name || user.team?.title || '-')}</td>
                  <td>
                    <span className={`status-badge status-${(typeof user.status === 'string' ? user.status : (user.status?.name || user.status?.label || 'active'))?.toLowerCase()}`}>
                      {(typeof user.status === 'string' ? user.status : (user.status?.name || user.status?.label)) || 'Active'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="action-btn"
                        onClick={() => openForm(user)}
                        title="Edit"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        className="action-btn"
                        onClick={() => handleDelete(user.id || user._id)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination">
            <div className="pagination-info">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, users?.length || 0)} of {users?.length || 0} entries
            </div>
            <div className="pagination-buttons">
              <button 
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button 
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                {editMode ? 'Edit User' : 'Add New User'}
              </h3>
              <button className="close-btn" onClick={closeForm}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    className="form-control"
                    value={formData.firstName}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    className="form-control"
                    value={formData.lastName}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleFormChange}
                    required
                    disabled={editMode}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select
                    name="role"
                    className="form-control"
                    value={formData.role}
                    onChange={handleFormChange}
                    required
                  >
                    {roles.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Team</label>
                  <select
                    name="team"
                    className="form-control"
                    value={formData.team}
                    onChange={handleFormChange}
                  >
                    <option value="">Select Team</option>
                    {teams.map((team) => (
                      <option key={team.value} value={team.value}>
                        {team.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Designation</label>
                  <input
                    type="text"
                    name="designation"
                    className="form-control"
                    value={formData.designation}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={closeForm}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                  >
                    {editMode ? 'Update User' : 'Add User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
);
}

export default UsersManagement;