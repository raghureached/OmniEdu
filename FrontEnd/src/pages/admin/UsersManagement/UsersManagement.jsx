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
  Plus,
  User2Icon,
  User
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
import '../../globalAdmin/OrganizationManagement/AddOrganizationModal.css';
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
  const [roles,setRoles] = useState([]);
  const [teams,setTeams] = useState([]);
  const [departments,setDepartments] = useState([]);
  const navigate = useNavigate();

  useEffect(()=>{
    getRoles()
    getTeams()
    getDepartments()
  },[])
  const getRoles = async()=>{
    try {
      const res = await api.get("api/admin/getOrgRoles")
      setRoles(res.data.data)
    } catch (error) {
      console.log(error)
    }
  }
  const getTeams = async()=>{
    try {
      const res = await api.get("api/admin/getGroups")
      console.log(res.data.data)
      setTeams(res.data.data)
    } catch (error) {
      console.log(error)
    }
  }
  const getDepartments = async()=>{
    try {
      const res = await api.get("api/admin/getDepartments")
      console.log(res.data.data)
      setDepartments(res.data.data)
    } catch (error) {
      console.log(error)
    }
  }
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
    console.log(user)
    if (user) {
      setEditMode(true);
      setCurrentUser(user);
      setFormData({
        name: user.name || '',
        employeeId: user.employeeId || '',
        role: user.role || 'user',
        status: user.status || 'active',
        team: user.team || '',
        subteam:user.subteam || '',
        department: user.department || '',
        designation: user.designation || '',
        email: user.email || '',
        invite: user.invite || false,
      });
    } else {
      setEditMode(false);
      setCurrentUser(null);
      setFormData({
        name: '',
        employeeId: '',
        role: 'user',
        status: 'active',
        team: '',
        subteam:'',
        department: '',
        designation: '',
        email: '',
        invite: false,
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
    name: '',
    employeeId: '',
    role: '',
    team: '',
    subteam:'',
    department: '',
    designation: '',
    email: '',
    invite: false,
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
        console.log(formData)
        await dispatch(updateUser({ id: currentUser.id || currentUser._id, userData: formData }));
        // closeForm();
      } catch (error) {
        console.error('Error updating user:', error);
      }
    } else {
      try {
        console.log(formData)
        await dispatch(createUser(formData));
        // closeForm();
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
  // console.log(users)
  // Available roles
  // const roles = [
  //   { value: 'user', label: 'User' },
  //   { value: 'admin', label: 'Admin' },
  //   { value: 'manager', label: 'Manager' },
  //   { value: 'instructor', label: 'Instructor' }
  // ];

  // // Available teams
  // const teams = [
  //   { value: 'tech', label: 'Tech' },
  //   { value: 'hr', label: 'HR' },
  //   { value: 'marketing', label: 'Marketing' },
  //   { value: 'sales', label: 'Sales' },
  //   { value: 'support', label: 'Support' }
  // ];

  if (loading) {
    return <LoadingScreen  text={"Loading users..."}/>;
  }

  return (
    <div className="main-content">
      <div className="page-content">
        <div className="page-header">
          {/* <h1 className="page-title">Users Management</h1> */}

        </div>

        {/* Search and Filter Controls */}
        <div className="controls">
          <form onSubmit={handleSearch} className="roles-search-bar">
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

          <div className="controls-right" style={{ position: 'relative' }}>
            <button
              className="control-btn"
              onClick={() => setShowBulkAction(!showBulkAction)}
            >
              {/* <Filter size={16} /> */}
              <span>Bulk Actions</span>
              <ChevronDown size={16} />
            </button>

            {showBulkAction && (
              <div className="bulk-action-panel" style={{position:"absolute",right:"10px",top:"10px",zIndex:1000}}>
                <span style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><h4 style={{margin:0}}>Bulk Actions</h4><GoX size={20} style={{cursor:"pointer"}} color="#6b7280" onClick={() => setShowBulkAction(false)} /></span>
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
          <button
            className="btn-primary"
            onClick={() => openForm()}
          >
            <Plus size={18} />
            Add User
          </button>
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
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((user) => (
                <tr key={user?._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(user?.uuid)}
                      onChange={(e) => handleSelectItem(e, (user?.uuid))}
                    />
                  </td>
                  <td>
                    <div className="user-info">
                      <div>
                        <div >{user?.name}</div>
                      </div>
                    </div>
                  </td>
                  <td>{user?.email}</td>
                  <td>
                    <span className="role-badge">
                      {typeof user?.global_role_id === 'string' ? user?.global_role_id : (user?.global_role_id?.name || user?.global_role_id?.title || '-')}
                    </span>
                  </td>
                  {/* <td>{typeof user.profile?.team_id === 'string' ? user.profile?.team_id : (user.profile?.team_id?.name || user.profile?.team_id?.title || '-')}</td> */}
                  <td>
                    <span className={`status-badge status-${(typeof user?.status === 'string' ? user?.status : (user?.status?.name || user?.status?.label || 'active'))?.toLowerCase()}`}>
                      {(typeof user?.status === 'string' ? user?.status : (user?.status?.name || user?.status?.label)) || 'Active'}
                    </span>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button
                        className="global-action-btn delete"
                        onClick={() => handleDelete(user.uuid)}
                      >
                        <Trash2 size={16} />
                      </button>
                      <button
                        className="global-action-btn edit"
                        onClick={() => openForm(user)}
                      >
                        <Edit3 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
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
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {showForm && (
        <div className="addOrg-modal-overlay">
          <div className="addOrg-modal-content">
            <div className="addOrg-modal-header">
              
              <div className="addOrg-header-content">
              <User size={50} />
                <div>
                
                  <h2>{editMode ? 'Edit User' : 'Add New User'}</h2>
                  <p className="addOrg-header-subtitle">
                    {editMode ? 'Update user details' : 'Create a new user profile'}
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                className="addOrg-close-btn"
                onClick={closeForm}
                aria-label="Close modal"
              >
                <GoX size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="addOrg-org-form">
              <div className="addOrg-form-section">
                <h3 className="addOrg-section-title" style={{marginTop:'10px'}}>Basic Information</h3>
                <div className="addOrg-form-grid">
                  <div className="addOrg-form-group">
                    <label className="addOrg-form-label">Name</label>
                    <input
                      type="text"
                      name="name"
                      className="addOrg-form-input"
                      value={formData.name}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  <div className="addOrg-form-group">
                    <label className="addOrg-form-label">Employee ID</label>
                    <input
                      type="text"
                      name="employeeId"
                      className="addOrg-form-input"
                      value={formData.employeeId}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                </div>
                <div className="addOrg-form-grid">
                  <div className="addOrg-form-group">
                    <label className="addOrg-form-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      className="addOrg-form-input"
                      value={formData.email}
                      onChange={handleFormChange}
                      required
                      disabled={editMode}
                    />
                  </div>
                  <div className="addOrg-form-group">
                    <label className="addOrg-form-label">Role</label>
                    <select
                      name="role"
                      className="addOrg-form-select"
                      value={formData.role}
                      onChange={handleFormChange}
                      required
                    >
                      <option value="">Select Role</option>
                      {roles.map((role) => (
                        <option key={role._id} value={role._id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="addOrg-form-grid">
                  <div className="addOrg-form-group">
                    <label className="addOrg-form-label">Team</label>
                    <select
                      name="team"
                      className="addOrg-form-select"
                      value={formData.team}
                      onChange={handleFormChange}
                    >
                      <option value="">Select Team</option>
                      {teams.map((team) => (
                        <option key={team._id} value={team._id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="addOrg-form-group">
                    <label className="addOrg-form-label">Sub Team</label>
                    <select
                      name="subteam"
                      className="addOrg-form-select"
                      value={formData.subteam}
                      onChange={handleFormChange}
                    >
                      <option value="">Select Sub Team</option>
                      {teams.filter((team) => team._id === formData.team).map((team) => (
                        team.subTeams.map((subTeam) => (
                          <option key={subTeam._id} value={subTeam._id}>
                            {subTeam.name}
                          </option>
                        ))
                      ))}
                    </select>
                  </div>
                  
                </div>
                <div className="addOrg-form-grid">
                  <div className="addOrg-form-group">
                    <label className="addOrg-form-label">Department</label>
                    <select
                      name="department"
                      className="addOrg-form-select"
                      value={formData.department}
                      onChange={handleFormChange}
                    >
                      <option value="">Select Department</option>
                      {teams.map((team) => (
                        <option key={team._id} value={team._id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="addOrg-form-group">
                    <label className="addOrg-form-label">Designation</label>
                    <input
                      type="text"
                      name="designation"
                      className="addOrg-form-input"
                      value={formData.designation}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>
                <div className="addOrg-form-grid">
                  <div className="addOrg-form-group">
                  <span style={{display:'flex',alignItems:'center',gap:'5px'}}><input
                      type="checkbox"
                      name="invite"
                      className="addOrg-form-select"
                      value={formData.invite}
                      onChange={handleFormChange}
                    />
                    <label className="addOrg-form-label">Invite via Email</label></span>
                    
                  </div>
                </div>
              </div>

              <div className="addOrg-form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={closeForm}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <span>{editMode ? 'Update User' : 'Add User'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsersManagement;