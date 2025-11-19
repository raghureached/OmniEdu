import React, { useState, useEffect, useRef } from 'react';
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
import { createTeam, createSubTeam } from '../../../store/slices/groupSlice';
import api from '../../../services/api';
import { useNavigate } from 'react-router-dom';
import './UsersManagement.css';
import '../../globalAdmin/OrganizationManagement/AddOrganizationModal.css';
import LoadingScreen from '../../../components/common/Loading/Loading';
import { GoX } from 'react-icons/go';
import UserPreview from './components/UserPreview';
import BulkAssignToTeam from './components/BulkAssignToTeam';
import * as XLSX from 'xlsx';

const UsersManagement = () => {
  const dispatch = useDispatch();
  const {
    users,
    loading,
    error,
    filters,
    totalCount,
    currentPage: currentPageState,
    pageSize: pageSizeState,
  } = useSelector((state) => ({
    users: state.users.users,
    loading: state.users.loading,
    error: state.users.error,
    filters: state.users.filters || {},
    totalCount: state.users.totalCount || 0,
    currentPage: state.users.currentPage || 1,
    pageSize: state.users.pageSize || 6,
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
  const [assignTargetIds, setAssignTargetIds] = useState([]);
  const [assignOrigin, setAssignOrigin] = useState(null);
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
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);
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
    const desiredLimit = 100;
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


  const resolveTeamIdentifier = (team) => team?._id || team?.uuid || team?.id || team?.value || '';
  const resolveSubTeamIdentifier = (subTeam) => subTeam?._id || subTeam?.uuid || subTeam?.id || subTeam?.value || '';
  const toTrimmedString = (value) => {
    if (value === null || value === undefined) {
      return '';
    }
    return String(value).trim();
  };

  const findRoleIdByName = (roleName) => {
    if (!roleName) return null;
    const target = roleName.trim().toLowerCase();
    const matched = roles.find((roleItem) => {
      const label = roleItem?.name || roleItem?.title || roleItem?.label || roleItem?.value;
      return label && label.toString().trim().toLowerCase() === target;
    });
    return matched ? (matched._id || matched.id || matched.uuid || matched.value) : null;
  };

  const handleImportButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleImportUsers = async (event) => {
    const file = event?.target?.files?.[0];
    if (!file) {
      return;
    }

    setIsImporting(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        alert('No sheets found in the selected file.');
        return;
      }

      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

      if (!Array.isArray(rawRows) || rawRows.length === 0) {
        alert('The selected file does not contain any data to import.');
        return;
      }

      const normalizeRow = (row) => {
        const normalized = {};
        Object.entries(row || {}).forEach(([key, value]) => {
          if (!key) return;
          normalized[key.toString().trim().toLowerCase()] = value;
        });
        return normalized;
      };

      const getValue = (normalizedRow, keys) => {
        for (const key of keys) {
          const lookupKey = key.trim().toLowerCase();
          if (Object.prototype.hasOwnProperty.call(normalizedRow, lookupKey)) {
            return normalizedRow[lookupKey];
          }
        }
        return '';
      };

      const teamLookup = new Map();
      const subTeamLookup = new Map();

      const registerTeam = (teamObj) => {
        const identifier = resolveTeamIdentifier(teamObj);
        const nameKey = toTrimmedString(teamObj?.name || teamObj?.teamName).toLowerCase();
        if (nameKey) {
          teamLookup.set(nameKey, teamObj);
        }
        if (identifier && Array.isArray(teamObj?.subTeams)) {
          teamObj.subTeams.forEach((subTeam) => {
            const subKey = `${identifier}::${toTrimmedString(subTeam?.name || subTeam?.subTeamName).toLowerCase()}`;
            if (subKey.endsWith('::')) return;
            subTeamLookup.set(subKey, subTeam);
          });
        }
      };

      teams.forEach((team) => registerTeam(team));

      const ensureTeamByName = async (teamName) => {
        const normalizedName = teamName.trim();
        const lookupKey = normalizedName.toLowerCase();
        if (teamLookup.has(lookupKey)) {
          return teamLookup.get(lookupKey);
        }

        const payload = { teamName: normalizedName, status: 'Active' };
        const created = await dispatch(createTeam(payload)).unwrap();
        const createdTeam = created?.team || created;
        if (!createdTeam) {
          throw new Error(`Failed to create team "${normalizedName}"`);
        }
        const normalizedTeam = {
          ...createdTeam,
          name: createdTeam.name || normalizedName,
          subTeams: Array.isArray(createdTeam.subTeams) ? createdTeam.subTeams : [],
        };
        registerTeam(normalizedTeam);
        setTeams((prev) => {
          const exists = prev.some((teamItem) => resolveTeamIdentifier(teamItem) === resolveTeamIdentifier(normalizedTeam));
          if (exists) return prev;
          return [...prev, normalizedTeam];
        });
        setDepartments((prev) => {
          const exists = prev.some((teamItem) => resolveTeamIdentifier(teamItem) === resolveTeamIdentifier(normalizedTeam));
          if (exists) return prev;
          return [...prev, normalizedTeam];
        });
        return normalizedTeam;
      };

      const ensureSubTeamByName = async (teamObj, subTeamName) => {
        const teamId = resolveTeamIdentifier(teamObj);
        if (!teamId) {
          throw new Error(`Missing identifier for team "${teamObj?.name || teamObj?.teamName || subTeamName}"`);
        }
        const normalizedName = subTeamName.trim();
        const key = `${teamId}::${normalizedName.toLowerCase()}`;
        if (subTeamLookup.has(key)) {
          return subTeamLookup.get(key);
        }

        const existing = Array.isArray(teamObj?.subTeams)
          ? teamObj.subTeams.find((sub) => toTrimmedString(sub?.name || sub?.subTeamName).toLowerCase() === normalizedName.toLowerCase())
          : null;
        if (existing) {
          subTeamLookup.set(key, existing);
          return existing;
        }

        const payload = { subTeamName: normalizedName, team_id: teamId };
        const created = await dispatch(createSubTeam(payload)).unwrap();
        const createdSubTeam = created?.subTeam || created?.team || created;
        if (!createdSubTeam) {
          throw new Error(`Failed to create sub team "${normalizedName}" for team "${teamObj?.name || teamObj?.teamName}"`);
        }
        const normalizedSubTeam = {
          ...createdSubTeam,
          name: createdSubTeam.name || normalizedName,
        };
        subTeamLookup.set(key, normalizedSubTeam);
        teamObj.subTeams = Array.isArray(teamObj.subTeams)
          ? [...teamObj.subTeams, normalizedSubTeam]
          : [normalizedSubTeam];
        setTeams((prev) => prev.map((teamItem) => {
          if (resolveTeamIdentifier(teamItem) !== teamId) {
            return teamItem;
          }
          const existingSubs = Array.isArray(teamItem.subTeams) ? teamItem.subTeams : [];
          const alreadyPresent = existingSubs.some((subItem) => resolveSubTeamIdentifier(subItem) === resolveSubTeamIdentifier(normalizedSubTeam));
          if (alreadyPresent) {
            return teamItem;
          }
          return {
            ...teamItem,
            subTeams: [...existingSubs, normalizedSubTeam],
          };
        }));
        return normalizedSubTeam;
      };

      let successCount = 0;
      const errors = [];

      for (let index = 0; index < rawRows.length; index += 1) {
        const rowNumber = index + 2; // account for header row
        const normalizedRow = normalizeRow(rawRows[index]);

        const name = toTrimmedString(getValue(normalizedRow, ['name']));
        const email = toTrimmedString(getValue(normalizedRow, ['email']));
        const designation = toTrimmedString(getValue(normalizedRow, ['designation']));
        const teamName = toTrimmedString(getValue(normalizedRow, ['team', 'team name']));
        const subTeamName = toTrimmedString(getValue(normalizedRow, ['sub team', 'subteam', 'sub team name']));
        let roleName = toTrimmedString(getValue(normalizedRow, ['role']));
        const custom1 = toTrimmedString(getValue(normalizedRow, ['custom 1', 'custom1']));

        if (!name || !email) {
          errors.push(`Row ${rowNumber}: Name and Email are required.`);
          continue;
        }

        if (!roleName) {
          roleName = 'General User';
        }

        const roleId = findRoleIdByName(roleName);
        if (!roleId) {
          errors.push(`Row ${rowNumber}: Role "${roleName}" not found.`);
          continue;
        }

        let teamId = '';
        let subTeamId = '';

        try {
          if (teamName) {
            const teamObj = await ensureTeamByName(teamName);
            teamId = resolveTeamIdentifier(teamObj);

            if (subTeamName) {
              const subTeamObj = await ensureSubTeamByName(teamObj, subTeamName);
              subTeamId = resolveSubTeamIdentifier(subTeamObj);
            }
          }
        } catch (teamError) {
          errors.push(`Row ${rowNumber}: ${teamError?.message || 'Failed to process team/subteam.'}`);
          continue;
        }

        const payload = {
          name,
          email,
          designation,
          team: teamId || undefined,
          subteam: subTeamId || undefined,
          role: roleId,
          custom1,
          invite: false,
        };

        try {
          await dispatch(createUser(payload)).unwrap();
          successCount += 1;
        } catch (creationError) {
          const message = creationError?.message || creationError?.error || 'Failed to create user.';
          errors.push(`Row ${rowNumber}: ${message}`);
        }
      }

      if (successCount > 0) {
        dispatch(fetchUsers(filters));
        getTeams();
      }

      if (errors.length) {
        console.error('Import completed with errors:', errors);
        alert(`Import finished. Success: ${successCount}. Failed: ${errors.length}. Check console for details.`);
      } else {
        alert(`Import finished successfully. Imported ${successCount} user(s).`);
      }
    } catch (error) {
      console.error('Failed to import users:', error);
      alert('Failed to import users. Please verify the file format and try again.');
    } finally {
      if (event?.target) {
        // allow re-uploading the same file
        event.target.value = '';
      }
      setIsImporting(false);
    }
  };


  const handleExportUsers = () => {
    // Get users to export - selected users if any, otherwise all users
    const usersToExport = selectedItems.length > 0 
      ? users.filter(user => selectedItems.includes(resolveUserId(user)))
      : users;

    console.log('Selected Items:', selectedItems);
    console.log('Users to export:', usersToExport);

    if (!Array.isArray(usersToExport) || usersToExport.length === 0) {
      alert(selectedItems.length > 0 
        ? 'No selected users found to export. Please make sure you have selected users using the checkboxes.' 
        : 'No users available to export.');
      return;
    }

    // Process each user's data for export
    const rows = usersToExport.map((user) => {
      const assignments = computeAssignments(user || {});
      const teamNames = assignments.map(a => a.teamName).filter(Boolean);
      const subTeamNames = assignments.map(a => a.subTeamName).filter(Boolean);

      return {
        name: user?.name || '',
        email: user?.email || '',
        designation: user?.designation || '',
        role: typeof user?.global_role_id === 'string'
          ? user.global_role_id
          : user?.global_role_id?.name || user?.global_role_id?.title || '',
        team: teamNames.join(', '),
        subteam: subTeamNames.join(', ')
      };
    });

    // Define CSV headers in the desired order
    const headers = ['name', 'email', 'designation', 'role', 'team', 'subteam'];
    const headerLabels = ['Name', 'Email', 'Designation', 'Role', 'Team', 'Subteam'];

    // Helper function to escape CSV values
    const escapeCsvValue = (value) => {
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      // Escape quotes and wrap in quotes if contains comma, newline, or quote
      const needsQuotes = /[,\n"]/.test(stringValue);
      const escaped = stringValue.replace(/"/g, '""');
      return needsQuotes ? `"${escaped}"` : escaped;
    };

    // Generate CSV content
    const csvContent = [
      headerLabels.join(','),
      ...rows.map(row => 
        headers.map(field => escapeCsvValue(row[field] || '')).join(',')
      )
    ].join('\n');

    try {
      // Create and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `users_export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Clear selected items after successful export
      if (selectedItems.length > 0) {
        setSelectedItems([]);
      }
    } catch (error) {
      console.error('Error during export:', error);
      alert('An error occurred while exporting. Please try again.');
    }
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
        ...initialFormData,
        name: user.name || '',
        employeeId: profile.employee_id || user.employeeId || '',
        role: roleValue,
        team: '',
        subteam: '',
        department: user.department || '',
        designation: profile.designation || user.designation || '',
        email: user.email || '',
        invite: Boolean(user.invite),
        custom1: profile.custom1 || user.custom1 || '',
      });
    } else {
      setEditMode(false);
      setCurrentUser(null);
      setTeamAssignments([]);
      setRemovedAssignments([]);
      setFormData({
        ...initialFormData,
        role: 'user',
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
    setFormData(initialFormData);
  };

  const initialFormData = {
    name: '',
    employeeId: '',
    role: '',
    team: '',
    subteam: '',
    department: '',
    designation: '',
    email: '',
    invite: false,
    custom1: '',
  };

  const [formData, setFormData] = useState(initialFormData);

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

  const openAssignToTeamModal = (targetIds = [], origin = null) => {
    if (!Array.isArray(targetIds) || targetIds.length === 0) {
      return;
    }
    setAssignTargetIds(targetIds);
    setAssignOrigin(origin);
    setAssignTeamId('');
    setAssignSubTeamId('');
    setAssignTeamOpen(true);
  };

  const handleAssignToTeam = (userId) => {
    if (!userId) {
      return;
    }
    openAssignToTeamModal([userId], 'single');
  };

  const handleOpenAssignForSelected = () => {
    if (selectedItems.length === 0) {
      return;
    }
    setShowBulkAction(false);
    openAssignToTeamModal(selectedItems, 'bulk');
  };

  const handleBulkAssignToGroup = async () => {
    if (!assignTeamId) {
      alert('Please select a team');
      return;
    }

    if (!assignTargetIds.length) {
      alert('No users selected for assignment');
      return;
    }

    const targetIds = assignTargetIds;
    const isBulkAssignment = assignOrigin === 'bulk';

    try {
      await dispatch(addUsersToGroup({ team_id: assignTeamId, sub_team_id: assignSubTeamId || null, userIds: targetIds })).unwrap();
      setAssignTeamOpen(false);
      setAssignTeamId('');
      setAssignSubTeamId('');
      setAssignTargetIds([]);
      setAssignOrigin(null);

      if (isBulkAssignment) {
        setShowBulkAction(false);
        setSelectedItems([]);
      }

      dispatch(fetchUsers(filters));
      alert(targetIds.length > 1 ? 'Users assigned to the selected team successfully' : 'User assigned to the selected team successfully');
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


  const currentPage = filters.page || currentPageState || 1;
  const itemsPerPage = filters.limit || pageSizeState || 6;
  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / itemsPerPage));
  const paginatedUsers = Array.isArray(users) ? users : [];
  const currentPageUserIds = paginatedUsers
    .map((user) => resolveUserId(user))
    .filter(Boolean);

  const handlePageChange = (newPage) => {
    if (!newPage || newPage === currentPage) return;
    if (newPage < 1 || newPage > totalPages) return;

    dispatch(setFilters({
      ...filters,
      page: newPage,
      limit: itemsPerPage,
    }));
  };

  useEffect(() => {
    if (currentPage > totalPages) {
      dispatch(setFilters({
        ...filters,
        page: totalPages,
        limit: itemsPerPage,
      }));
    }
  }, [currentPage, totalPages, dispatch, filters, itemsPerPage]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems((prev) => {
        const combined = new Set(prev);
        currentPageUserIds.forEach((id) => combined.add(id));
        const next = Array.from(combined);
        //setShowBulkAction(next.length > 0);
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
        // setShowBulkAction(true);
        setShowFilters(false);
        return next;
      });
    } else {
      setSelectedItems((prev) => {
        const next = prev.filter((id) => id !== userId);
        // setShowBulkAction(next.length > 0);
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
                  search: e.target.value,
                  page: 1,
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
              className="control-btn"
              style={{ padding: '12px 12px' }}
              onClick={toggleFilters}
              type="button"
            >
              <Filter size={16} />
              Filter
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx"
              style={{ display: 'none' }}
              onChange={handleImportUsers}
            />
            <button
              className="control-btn"
              style={{ padding: '12px 12px' }}
              onClick={handleImportButtonClick}
              disabled={isImporting}
              type="button"
            >
              {isImporting ? 'Importing…' : 'Import'} <Import size={16} color="#6b7280" />
            </button>
            <button
              className="control-btn"
              style={{ padding: '12px 12px' }}
              onClick={handleExportUsers}
              type="button"
            >
              Export <Share size={16} color="#6b7280" />
            </button>

            {showFilters && (
              <div className="filter-panel" style={{ right: '-8px', top: '49px' }}>
                <span
                  style={{
                    cursor: 'pointer',
                    position: 'absolute',
                    right: '10px',
                    top: '10px',
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
                    type="button"
                  >
                    Apply
                  </button>
                  <button
                    className="reset-btn"
                    onClick={resetFilters}
                    type="button"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
            <button
              className="control-btn"
              onClick={toggleBulkAction}
              type="button"
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
                    onClick={handleOpenAssignForSelected}
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
            type="button"
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
            <div className="users-header-cell" style={{ justifySelf: 'flex-start' }}>Designation</div>
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
              const rawDesignation = user?.profile?.designation;
              const normalizedDesignation = typeof rawDesignation === 'string' && rawDesignation.trim()
                ? rawDesignation.trim()
                : '-';
              const designationCellClass = normalizedDesignation === '-'
                ? 'users-designation-cell users-designation-cell--empty'
                : 'users-designation-cell';
              // const MAX_VISIBLE_TAGS = 1;
              // const visibleTags = tagLabels.slice(0, MAX_VISIBLE_TAGS);
              // const hiddenCount = Math.max(0, tagLabels.length - MAX_VISIBLE_TAGS);

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
                  <div className={designationCellClass}>{normalizedDesignation}</div>
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
                      className="global-action-btn"
                      onClick={() => handleAssignToTeam(userId)}
                      title="Assign to Team"
                      type="button"
                    >
                      <Plus size={16} />
                    </button>
                    <button
                      className="global-action-btn edit"
                      onClick={() => openForm(user)}
                      title="Edit"
                      type="button"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      className="global-action-btn delete"
                      onClick={() => handleDelete(userId)}
                      title="Delete"
                      type="button"
                    >
                      <Trash2 size={16} />
                    </button>

                  </div>

                  {tagLabels.length ? (
                    <div className="users-row-tags">
                      {tagLabels.join(', ')}
                      {/* {visibleTags.join(', ')}
                      {hiddenCount > 0 ? ` ...+${hiddenCount}` : ''} */}
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
            setAssignTeamId('');
            setAssignSubTeamId('');
            setAssignTargetIds([]);
            setAssignOrigin(null);
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
          disableApply={assignTargetIds.length === 0 || !assignTeamId}
          selectedCount={assignTargetIds.length}
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
                      <label className="addOrg-form-label">Designation</label>
                      <input
                        type="text"
                        name="designation"
                        className="addOrg-form-input"
                        value={formData.designation}
                        onChange={handleFormChange}
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
                      <label className="addOrg-form-label">Custom 1</label>
                      <input
                        type="text"
                        name="custom1"
                        className="addOrg-form-input"
                        value={formData.custom1}
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