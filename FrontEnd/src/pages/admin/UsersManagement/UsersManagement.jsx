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
  User,
  Share,
  Import,
  Eye
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
import { addUsersToGroup } from '../../../store/slices/userSlice';
import api from '../../../services/api';
import { useNavigate } from 'react-router-dom';
import './UsersManagement.css';
import '../../globalAdmin/OrganizationManagement/AddOrganizationModal.css';
import LoadingScreen from '../../../components/common/Loading/Loading';
import { GoX } from 'react-icons/go';
import UserPreview from './components/UserPreview';
import BulkAssignToTeam from './components/BulkAssignToTeam';

const UsersManagement = () => {
  const dispatch = useDispatch();
  const { users, loading, error, filters } = useSelector((state) => ({
    users: state.users.users,
    loading: state.users.loading,
    error: state.users.error,
    filters: state.users.filters || {}
  }));

  const resolveUserId = (user) => user?.uuid || user?._id || user?.id || '';
  const getSelectableUserIds = () => users?.map(resolveUserId).filter(Boolean) || [];

  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showBulkAction, setShowBulkAction] = useState(false);
  const [assignTeamOpen, setAssignTeamOpen] = useState(false);
  const [assignTeamId, setAssignTeamId] = useState('');
  const [assignSubTeamId, setAssignSubTeamId] = useState('');
  const [teamAssignments, setTeamAssignments] = useState([]);
  const [removedAssignments, setRemovedAssignments] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUser, setPreviewUser] = useState(null);
  const [previewAssignments, setPreviewAssignments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [tempFilters, setTempFilters] = useState({
    status: '',
    role: '',
  });
  const [roles, setRoles] = useState([]);
  const [teams, setTeams] = useState([]);
  const [departments, setDepartments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getRoles();
    getTeams();
    getDepartments();
  }, []);
  const getRoles = async () => {
    try {
      const res = await api.get("api/admin/getOrgRoles")
      setRoles(res.data.data)
    } catch (error) {
      console.log(error)
    }
  }
  const getTeams = async () => {
    try {
      const res = await api.get("api/admin/getGroups");
      console.log(res.data.data);
      setTeams(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getDepartments = async () => {
    try {
      // const res = await api.get("api/admin/getDepartments");
      const res = await api.get("api/admin/getGroups");
      console.log(res.data.data);
      setDepartments(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      dispatch(fetchUsers(filters));
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [dispatch, filters]);

  useEffect(() => {
    const desiredLimit = 6;
    if ((filters?.limit ?? null) !== desiredLimit) {
      dispatch(setFilters({
        ...(filters || {}),
        limit: desiredLimit,
        page: filters?.page || 1,
      }));
    }
  }, [dispatch, filters?.limit]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setTempFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilter = () => {
    dispatch(setFilters({
      ...filters,
      ...tempFilters,
      search: searchTerm,
      page: 1,
    }));
    setShowFilters(false);
  };

  const resetFilters = () => {
    const initialFilters = {
      status: '',
      role: '',
    };
    setTempFilters(initialFilters);
    setSearchTerm('');
    dispatch(clearFilters());
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    dispatch(setFilters({
      ...filters,
      [name]: value,
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(setFilters({
      ...filters,
      search: searchTerm,
      page: 1,
    }));
  };

  const clearSearch = () => {
    setSearchTerm('');
    dispatch(setFilters({
      ...filters,
      search: '',
      page: 1,
    }));
  };

  const getStatusLabel = (status) => {
    const raw = typeof status === 'string'
      ? status
      : status?.name || status?.label || 'active';

    const lower = (raw || '').toLowerCase();
    if (lower === 'inactive') return 'Inactive';
    if (lower === 'active') return 'Active';
    return raw || 'Active';
  };

  const computeAssignments = (userData) => {
    if (!userData) {
      return [];
    }

    const profile = userData.profile || {};
    const teamsArray = Array.isArray(profile.teams) ? profile.teams : [];

    const mapped = teamsArray
      .filter((assignment) => assignment?.team_id)
      .map((assignment) => {
        const rawTeam = assignment.team_id;
        const teamId = typeof rawTeam === 'string' ? rawTeam : rawTeam?._id;
        const teamMeta = typeof rawTeam === 'object'
          ? rawTeam
          : teams.find((teamItem) => teamItem._id === teamId);
        const teamName = teamMeta?.name || 'Unknown Team';

        const rawSubTeam = assignment.sub_team_id;
        const subTeamId = typeof rawSubTeam === 'string' ? rawSubTeam : rawSubTeam?._id;
        const subTeamMeta = typeof rawSubTeam === 'object'
          ? rawSubTeam
          : teams
            .find((teamItem) => teamItem._id === teamId)
            ?.subTeams?.find((st) => st._id === subTeamId);
        const subTeamName = subTeamMeta?.name || (subTeamId ? 'Unknown Subteam' : null);

        return {
          teamId: teamId || '',
          subTeamId: subTeamId || null,
          teamName,
          subTeamName,
        };
      });

    if (mapped.length === 0 && (profile.team_id || profile.sub_team_id)) {
      const fallbackTeamRaw = profile.team_id;
      const fallbackTeamId = typeof fallbackTeamRaw === 'string' ? fallbackTeamRaw : fallbackTeamRaw?._id;
      const fallbackTeamMeta = typeof fallbackTeamRaw === 'object'
        ? fallbackTeamRaw
        : teams.find((teamItem) => teamItem._id === fallbackTeamId);
      const fallbackTeamName = fallbackTeamMeta?.name || 'Unknown Team';

      const fallbackSubTeamRaw = profile.sub_team_id;
      const fallbackSubTeamId = typeof fallbackSubTeamRaw === 'string' ? fallbackSubTeamRaw : fallbackSubTeamRaw?._id;
      const fallbackSubTeamMeta = typeof fallbackSubTeamRaw === 'object'
        ? fallbackSubTeamRaw
        : teams
          .find((teamItem) => teamItem._id === fallbackTeamId)
          ?.subTeams?.find((st) => st._id === fallbackSubTeamId);
      const fallbackSubTeamName = fallbackSubTeamMeta?.name || (fallbackSubTeamId ? 'Unknown Subteam' : null);

      mapped.push({
        teamId: fallbackTeamId || '',
        subTeamId: fallbackSubTeamId || null,
        teamName: fallbackTeamName,
        subTeamName: fallbackSubTeamName,
      });
    }

    return mapped;
  };

  const buildUserTagLabels = (userData) => {
    if (!userData) return [];

    const computed = computeAssignments(userData) || [];
    if (computed.length) {
      return computed.map(({ teamName, subTeamName }) => {
        const label = [teamName, subTeamName].filter(Boolean).join(' • ');
        return label || teamName || subTeamName || 'Team';
      });
    }

    const tags = [];

    if (Array.isArray(userData.teams) && userData.teams.length) {
      userData.teams.forEach((item) => {
        if (!item) return;

        if (typeof item === 'string') {
          tags.push(item);
          return;
        }

        const inferredTeam = item?.name
          || item?.teamName
          || item?.team?.name
          || item?.team_id?.name
          || item?.team_id?.title;

        const inferredSubTeam = item?.subTeamName
          || item?.sub_team_name
          || item?.subTeam?.name
          || item?.sub_team_id?.name
          || item?.sub_team_id?.title;

        const label = [inferredTeam, inferredSubTeam].filter(Boolean).join(' • ');
        if (label) {
          tags.push(label);
        } else if (inferredTeam || inferredSubTeam) {
          tags.push(inferredTeam || inferredSubTeam);
        }
      });
    }

    if (tags.length) {
      return tags;
    }

    const directTeam = userData.team || userData.department || userData.profile?.department;
    const directSubTeam = userData.subTeam || userData.subteam;
    const fallback = [directTeam, directSubTeam].filter(Boolean).join(' • ');

    if (fallback) {
      return [fallback];
    }

    return [];
  };


  const handleExportUsers = () => {
    if (!Array.isArray(users) || users.length === 0) {
      alert('No users available to export.');
      return;
    }

    const rows = users.map((user) => {
      const assignments = computeAssignments(user);
      const teamNames = assignments.map((assignment) => assignment.teamName).filter(Boolean);
      const subTeamNames = assignments.map((assignment) => assignment.subTeamName).filter(Boolean);

      return {
        Name: user?.name || '',
        Email: user?.email || '',
        Role: typeof user?.global_role_id === 'string'
          ? user.global_role_id
          : user?.global_role_id?.name || user?.global_role_id?.title || '',
        Team: teamNames.join(', '),
        Subteam: subTeamNames.join(', '),
      };
    });

    const headers = Object.keys(rows[0]);
    const escape = (value) => {
      const stringValue = value ?? '';
      const normalized = typeof stringValue === 'string' ? stringValue : String(stringValue);
      const escaped = normalized.replace(/"/g, '""');
      return `"${escaped}"`;
    };

    const csvLines = [
      headers.join(','),
      ...rows.map((row) => headers.map((header) => escape(row[header])).join(',')),
    ];

    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `users_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };


  const openForm = (user = null) => {
    console.log(user)
    if (user) {
      setEditMode(true);
      setCurrentUser(user);
      const roleValue = typeof user.global_role_id === 'string'
        ? user.global_role_id
        : user.global_role_id?._id || 'user';
      const profile = user.profile || {};
      const teamValue = typeof profile.team_id === 'string'
        ? profile.team_id
        : profile.team_id?._id || '';
      const subTeamValue = typeof profile.sub_team_id === 'string'
        ? profile.sub_team_id
        : profile.sub_team_id?._id || '';
      const normalizedAssignments = computeAssignments(user);
      setTeamAssignments(normalizedAssignments);
      setRemovedAssignments([]);

      setFormData({
        name: user.name || '',
        employeeId: user.employeeId || '',
        role: roleValue,
        status: user.status || 'active',
        team: '',
        subteam: '',
        department: user.department || '',
        designation: user.designation || '',
        email: user.email || '',
        invite: Boolean(user.invite),
      });
    } else {
      setEditMode(false);
      setCurrentUser(null);
      setTeamAssignments([]);
      setRemovedAssignments([]);
      setFormData({
        name: '',
        employeeId: '',
        role: 'user',
        status: 'active',
        team: '',
        subteam: '',
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
    setTeamAssignments([]);
    setRemovedAssignments([]);
  };

  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    role: '',
    team: '',
    subteam: '',
    department: '',
    designation: '',
    email: '',
    invite: false,
  });

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: finalValue,
      ...(name === 'team' ? { subteam: '' } : {}),
    }));
  };

  const handleRemoveAssignment = (index) => {
    setTeamAssignments(prevAssignments => {
      const removed = prevAssignments[index];
      if (!removed) return prevAssignments;

      setRemovedAssignments(prevRemoved => {
        const exists = prevRemoved.some(
          (assignment) => assignment.teamId === removed.teamId && (assignment.subTeamId || null) === (removed.subTeamId || null)
        );
        if (exists) {
          return prevRemoved;
        }
        return [...prevRemoved, removed];
      });

      return prevAssignments.filter((_, idx) => idx !== index);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editMode && currentUser) {
      try {
        console.log(formData)
        const targetId = currentUser.uuid || currentUser.id || currentUser._id;
        const submissionData = { ...formData };
        if (!submissionData.team) {
          delete submissionData.team;
          delete submissionData.subteam;
        }

        const removedForPayload = removedAssignments
          .filter((assignment) => assignment?.teamId)
          .map(({ teamId, subTeamId }) => ({
            teamId,
            subTeamId: subTeamId || null,
          }));

        if (removedForPayload.length) {
          submissionData.removedAssignments = removedForPayload;
        }

        await dispatch(updateUser({ id: targetId, userData: submissionData }));
        closeForm();
      } catch (error) {
        console.error('Error updating user:', error);
      }
    } else {
      try {
        console.log(formData)
        await dispatch(createUser(formData));
        closeForm();
      } catch (error) {
        console.error('Error creating user:', error);
      }
    }
  };

  const openPreview = (user) => {
    if (!user) return;
    setPreviewUser(user);
    setPreviewAssignments(computeAssignments(user));
    setPreviewOpen(true);
  };

  const closePreview = () => {
    setPreviewOpen(false);
    setPreviewUser(null);
    setPreviewAssignments([]);
  };

  const handleBulkAssignToGroup = async () => {
    if (!assignTeamId) {
      alert('Please select a team');
      return;
    }
    try {
      await dispatch(addUsersToGroup({ team_id: assignTeamId, sub_team_id: assignSubTeamId || null, userIds: selectedItems })).unwrap();
      // Refresh users and reset
      setAssignTeamOpen(false);
      setShowBulkAction(false);
      setSelectedItems([]);
      setAssignTeamId('');
      setAssignSubTeamId('');
      dispatch(fetchUsers(filters));
      alert('Users assigned to the selected team successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to assign users to team');
    }
  };

  const handleDelete = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      dispatch(deleteUser(userId));
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedItems.length === 0) {
      alert('Please select at least one user');
      return;
    }
    if (action === 'delete') {
      if (window.confirm(`Are you sure you want to delete ${selectedItems.length} users?`)) {
        try {
          await dispatch(bulkDeleteUsers(selectedItems)).unwrap();
          setSelectedItems([]);
          setShowBulkAction(false);
          setShowFilters(false);
        } catch (error) {
          console.error('Failed to delete users:', error);
          alert('Failed to delete selected users. Please try again.');
        }
      }
    } else if (action === 'deactivate') {
      try {
        const requests = selectedItems
          .map((userId) => {
            const targetUser = users?.find((user) => resolveUserId(user) === userId);
            const currentStatusRaw = typeof targetUser?.status === 'string'
              ? targetUser?.status
              : targetUser?.status?.name || targetUser?.status?.label;
            if (currentStatusRaw?.toLowerCase() === 'inactive') {
              return null;
            }
            return dispatch(updateUser({ id: userId, userData: { status: 'inactive' } })).unwrap();
          })
          .filter(Boolean);

        if (requests.length === 0) {
          alert('Selected users are already inactive.');
          return;
        }

        await Promise.all(requests);
        alert('Selected users deactivated successfully');
        setSelectedItems([]);
        setShowBulkAction(false);
        setShowFilters(false);
        dispatch(fetchUsers(filters));
      } catch (error) {
        console.error('Failed to deactivate users:', error);
        alert('Failed to deactivate selected users. Please try again.');
      }
    }
  };

  const toggleFilters = () => {
    setShowFilters((prev) => {
      const next = !prev;
      if (next) {
        setShowBulkAction(false);
      }
      return next;
    });
  };

  const toggleBulkAction = () => {
    setShowBulkAction((prev) => {
      const next = !prev;
      if (next) {
        setShowFilters(false);
      }
      return next;
    });
  };


  const handlePageChange = (newPage) => {
    if (!newPage || newPage === filters.page) return;
    if (newPage < 1) return;

    const limitValue = filters?.limit || 6;
    const maxPages = Math.max(1, Math.ceil((users?.length || 0) / limitValue));
    if (newPage > maxPages) return;

    dispatch(setFilters({
      ...filters,
      page: newPage,
    }));
  };

  // Pagination
  const currentPage = filters.page || 1;
  const itemsPerPage = filters.limit || 6;
  const totalPages = Math.max(1, Math.ceil((users?.length || 0) / itemsPerPage));
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedUsers = Array.isArray(users)
    ? users.slice(indexOfFirstItem, indexOfLastItem)
    : [];
  const currentPageUserIds = paginatedUsers
    .map((user) => resolveUserId(user))
    .filter(Boolean);

  useEffect(() => {
    if (currentPage > totalPages) {
      dispatch(setFilters({
        ...filters,
        page: totalPages,
      }));
    }
  }, [currentPage, totalPages, dispatch, filters]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems((prev) => {
        const combined = new Set(prev);
        currentPageUserIds.forEach((id) => combined.add(id));
        const next = Array.from(combined);
        setShowBulkAction(next.length > 0);
        if (next.length > 0) {
          setShowFilters(false);
        }
        return next;
      });
    } else {
      setSelectedItems((prev) => {
        const next = prev.filter((id) => !currentPageUserIds.includes(id));
        setShowBulkAction(next.length > 0);
        return next;
      });
    }
  };

  const handleSelectItem = (e, userId) => {
    if (!userId) return;

    if (e.target.checked) {
      setSelectedItems((prev) => {
        if (prev.includes(userId)) {
          return prev;
        }
        const next = [...prev, userId];
        setShowBulkAction(true);
        setShowFilters(false);
        return next;
      });
    } else {
      setSelectedItems((prev) => {
        const next = prev.filter((id) => id !== userId);
        setShowBulkAction(next.length > 0);
        return next;
      });
    }
  };

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
    return <LoadingScreen text={"Loading users..."} />;
  }

  const allSelected = currentPageUserIds.length > 0 && currentPageUserIds.every((id) => selectedItems.includes(id));
  //  if(creating)
  //  {
  //   return <LoadingScreen text={"Creating user..."} />;
  //  }
  //  if(updating)
  //  {
  //   return <LoadingScreen text={"Updating user..."} />;
  //  }
  //  if(deleting)
  //  {
  //   return <LoadingScreen text={"Deleting user..."} />;
  //  }

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
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                dispatch(setFilters({
                  ...filters,
                  search: e.target.value
                }));
              }}
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
              className="control-btn" style={{ padding: '12px 12px' }}
              onClick={toggleFilters}
            >
              <Filter size={16} />
              Filter
            </button>
            <button className="control-btn" style={{ padding: '12px 12px' }}>
              Import <Import size={16} color="#6b7280" />
            </button>
            <button
              className="control-btn"
              style={{ padding: '12px 12px' }}
              onClick={handleExportUsers}
            >
              Export <Share size={16} color="#6b7280" />
            </button>


            {showFilters && (
              <div className="filter-panel" style={{ right: "-8px", top: '49px' }}>
                <span
                  style={{
                    cursor: "pointer",
                    position: "absolute",
                    right: "10px",
                    top: "10px"
                  }}
                  onClick={() => setShowFilters(false)}
                >
                  {/* <X size={20} color="#6b7280" /> */}
                </span>

                <div className="filter-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={tempFilters.status || ''}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    {/* <option value="pending">Pending</option> */}
                  </select>
                </div>

                {/* <div className="filter-group">
                    <label>Role</label>
                    <select
                      name="role"
                      value={tempFilters.role || ''}
                      onChange={handleFilterChange}
                    >
                      <option value="">All Roles</option>
                      {roles.map(role => (
                        <option key={role._id} value={role._id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div> */}



                <div className="filter-actions">
                  <button
                    className="btn-primary"
                    onClick={handleFilter}
                    style={{ marginRight: '8px' }}
                  >
                    Apply
                  </button>
                  <button
                    className="reset-btn"
                    onClick={resetFilters}
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
            <button
              className="control-btn"
              onClick={toggleBulkAction}
            >
              {/* <Filter size={16} /> */}
              <span>Bulk Actions</span>
              <ChevronDown size={16} />
            </button>

            {showBulkAction && (
              <div className="bulk-action-panel" style={{ top: '50px', right: '-50px' }}>
                <div className="bulk-action-header">
                  <label className="bulk-action-title">Items Selected: {selectedItems.length}</label>
                </div>
                <div className="bulk-action-actions" style={{ display: 'flex', gap: 8, flexDirection: 'row', alignItems: 'center' }}>
                  {/* <button
                    className="bulk-action-btn"
                    disabled={selectedItems.length === 0}
                    onClick={() => handleBulkAction('deactivate')} style={{ backgroundColor: '#9e9e9e' }}
                  >
                    Deactivate
                  </button> */}
                  <button
                    className="bulk-action-delete-btn"
                    disabled={selectedItems.length === 0}
                    onClick={() => handleBulkAction('delete')}
                  >
                    <RiDeleteBinFill size={16} color="#fff" /> Delete
                  </button>

                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
                  <button
                    className="btn-primary"
                    disabled={selectedItems.length === 0}
                    onClick={() => {
                      if (selectedItems.length === 0) {
                        return;
                      }
                      setShowBulkAction(false);
                      setAssignTeamOpen(true);
                    }}
                  >
                    Assign to Team
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
        <div className="users-table-container">
          <div className="users-table-header">
            <div className="users-checkbox-cell">
              <input
                type="checkbox"
                onChange={handleSelectAll}
                checked={allSelected}
              />
            </div>
            <div className="users-header-cell" style={{ justifySelf: 'flex-start', paddingLeft: '45px' }}>Name</div>
            <div className="users-header-cell" style={{ justifySelf: 'flex-start' }}>Email</div>
            <div className="users-header-cell">Role</div>
            <div className="users-header-cell">Status</div>
            <div className="users-header-cell">Actions</div>
          </div>

          {paginatedUsers.length ? (
            paginatedUsers.map((user) => {
              const statusLabel = getStatusLabel(user?.status);
              const userId = resolveUserId(user) || user?._id;
              const nameInitial = (user?.name || user?.email || '?').charAt(0).toUpperCase();
              const tagLabels = buildUserTagLabels(user);

              return (
                <div className="users-table-row" key={userId}>
                  <div className="users-checkbox-cell">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(userId)}
                      onChange={(e) => handleSelectItem(e, userId)}
                    />
                  </div>
                  <div className="users-user-cell">
                    <div>
                      <div className="users-user-avatar">
                        {nameInitial}
                      </div>
                    </div>

                    <div className="users-user-info">
                      <div className="users-user-name">{user?.name || '-'}</div>
                    </div>
                  </div>

                  <div className="users-email-cell">{user?.email || '-'}</div>
                  <div className="users-role-cell">
                    <span className="users-role-badge">
                      {typeof user?.global_role_id === 'string'
                        ? user?.global_role_id
                        : (user?.global_role_id?.name || user?.global_role_id?.title || '-')}
                    </span>
                  </div>
                  <div className="users-status-cell">
                    <span className={`users-status-badge status-${statusLabel.toLowerCase()}`}>
                      {statusLabel === 'Active' ? '✓ Active' : '✗ Inactive'}
                    </span>
                  </div>
                  <div className="users-actions-cell">
                    <button
                      className="global-action-btn view"
                      onClick={() => openPreview(user)}
                      title="View"
                      type="button"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className="global-action-btn delete"
                      onClick={() => handleDelete(userId)}
                      title="Delete"
                      type="button"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      className="global-action-btn edit"
                      onClick={() => openForm(user)}
                      title="Edit"
                      type="button"
                    >
                      <Edit3 size={16} />
                    </button>
                  </div>

                  {tagLabels.length ? (
                    <div className="users-row-tags">
                      {tagLabels.join(', ')}
                    </div>
                  ) : null}
                </div>
              );
            })
          ) : (
            <div className="users-table-empty">No users found</div>
          )}

          {/* Pagination */}
          <div className="users-pagination">
            <button
              type="button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              Prev
            </button>
            <span>{`Page ${currentPage} of ${Math.max(1, totalPages)}`}</span>
            <button
              type="button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Next
            </button>
          </div>
        </div>


        <BulkAssignToTeam
          isOpen={assignTeamOpen}
          onClose={() => {
            setAssignTeamOpen(false);
          }}
          teams={teams}
          assignTeamId={assignTeamId}
          assignSubTeamId={assignSubTeamId}
          onTeamChange={(teamId) => {
            setAssignTeamId(teamId);
            setAssignSubTeamId('');
          }}
          onSubTeamChange={(subTeamId) => setAssignSubTeamId(subTeamId)}
          onApply={handleBulkAssignToGroup}
          disableApply={selectedItems.length === 0 || !assignTeamId}
          selectedCount={selectedItems.length}
        />

        {/* Add/Edit User Modal */}
        {showForm && (
          <div className="addOrg-modal-overlay">
            <div className="addOrg-modal-content">
              <div className="addOrg-modal-header">

                <div className="addOrg-header-content">
                  <div className="addOrg-header-icon">
                    <User size={24} color="#5570f1" />
                  </div>
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
                  <h3 className="addOrg-section-title" style={{ marginTop: '10px' }}>Basic Information</h3>
                  <div className="addOrg-form-grid">
                    <div className="addOrg-form-group">
                      <label className="addOrg-form-label">Name <span style={{ color: 'red' }}>*</span></label>
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
                      <label className="addOrg-form-label">Email <span style={{ color: 'red' }}>*</span></label>
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
                  </div>
                  <div className="addOrg-form-grid">
                    <div className="addOrg-form-group">
                      <label className="addOrg-form-label">Team </label>
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
                      <label className="addOrg-form-label">Sub Team </label>
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
                  {editMode && teamAssignments.length > 0 && (
                    <div className="addOrg-form-group">
                      {/* <label className="addOrg-form-label">Current Team Memberships</label> */}
                      <div className="users_management-assignment-tags">
                        {teamAssignments.map((assignment, index) => (
                          <span
                            key={`assignment-${assignment.teamId}-${assignment.subTeamId || 'none'}`}
                            className="users_management-assignment-chip"
                          >
                            <span>
                              {assignment.teamName}
                              {assignment.subTeamName ? ` • ${assignment.subTeamName}` : ''}
                            </span>
                            <button
                              type="button"
                              className="users_management-assignment-remove"
                              onClick={() => handleRemoveAssignment(index)}
                              aria-label="Remove team assignment"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="addOrg-form-grid">

                    <div className="addOrg-form-group">
                      <label className="addOrg-form-label">Role <span style={{ color: 'red' }}>*</span></label>
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
                    <div className="addOrg-form-group">
                      <label className="addOrg-form-label">Employee ID</label>
                      <input
                        type="text"
                        name="employeeId"
                        className="addOrg-form-input"
                        value={formData.employeeId}
                        onChange={handleFormChange}
                      />
                    </div>
                  </div>
                  <div className="addOrg-form-grid">

                    <div className="addOrg-form-group">
                      <label className="addOrg-form-label">Custom 1</label>
                      <input
                        type="text"
                        name="custom1"
                        className="addOrg-form-input"
                        value={formData.custom1}
                        onChange={handleFormChange}

                      />
                    </div>
                    <div className="addOrg-form-group">
                      <label className="addOrg-form-label">Custom 2</label>
                      <input
                        type="text"
                        name="custom2"
                        className="addOrg-form-input"
                        value={formData.custom2}
                        onChange={handleFormChange}
                      />
                    </div>
                  </div>

                  {/* <div className="addOrg-form-grid">
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
                </div> */}
                  <div className="addOrg-form-grid">
                    <div className="addOrg-form-group">
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><input
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
        <UserPreview
          isOpen={previewOpen}
          onClose={closePreview}
          user={previewUser}
          assignments={previewAssignments}
        />
      </div>
    </div>
  );
}

export default UsersManagement; 