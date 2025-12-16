import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
  clearFilters
} from '../../../store/slices/userSlice';
import { addUsersToGroup } from '../../../store/slices/userSlice';
import { createTeam, createSubTeam } from '../../../store/slices/groupSlice';
import api from '../../../services/api';
import { useNavigate } from 'react-router-dom';
import './UsersManagement.css';
import '../../globalAdmin/OrganizationManagement/AddOrganizationModal.css';
import LoadingScreen from '../../../components/common/Loading/Loading';
import FailedImportModal from '../GroupsManagement/FailedImportModal';
import ExportModal from '../GroupsManagement/components/ExportModal';
import { GoX } from 'react-icons/go';
import UserPreview from './components/UserPreview';
import BulkAssignToTeam from './components/BulkAssignToTeam';
import UsersTable from './components/UsersTable';
import * as XLSX from 'xlsx';
import { notify, notifyError, notifySuccess, notifyWarning } from '../../../utils/notification';
import { useConfirm } from '../../../components/ConfirmDialogue/ConfirmDialog';
import SelectionBanner from '../../../components/Banner/SelectionBanner';
import { Users } from 'lucide-react';

const UsersManagement = () => {
  const dispatch = useDispatch();
  const {
    allUsers,
    users,
    loading,
    error,
    filters,
    totalCount,
    currentPage: currentPageState,
    pageSize: pageSizeState,
  } = useSelector((state) => ({
    allUsers: state.users.allUsers,
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
  const [selectionScope, setSelectionScope] = useState('none'); // none | page | all | custom
  const [selectedPageRef, setSelectedPageRef] = useState(null);
  // Gmail-like selection (work-in-progress): declare states to avoid no-undef during incremental refactor
  const [allSelected, setAllSelected] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [excludedIds, setExcludedIds] = useState([]);
  const [selectAllLoading, setSelectAllLoading] = useState(false);
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
  // Sorting (global UI; applied on current page data set returned by server)
  const [sortKey, setSortKey] = useState(''); // 'name' | 'email' | 'designation' | 'role' | 'status'
  const [sortDir, setSortDir] = useState('asc');
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
  //search
  const [localSearch, setLocalSearch] = useState('');
  //failed model
  const [showFailedImportModal, setShowFailedImportModal] = useState(false);
  const [importResults, setImportResults] = useState({
    successCount: 0,
    failedRows: []
  });
  //confirm 
  const { confirm } = useConfirm();
  // --- central refetch control ---
  const [refetchIndex, setRefetchIndex] = useState(0);
  //export modal
  const [showExportModal, setShowExportModal] = useState(false);
  // Centralized fetch: runs when filters change OR when we explicitly bump refetchIndex
  useEffect(() => {
    // call fetchUsers exactly once per change
    dispatch(fetchUsers(filters));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, filters, refetchIndex]);

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

  const sortedUsers = useMemo(() => {

    let list = Array.isArray(allUsers) ? allUsers : [];
    if (localSearch.trim()) {
      const s = localSearch.toLowerCase();
      list = list.filter(u =>
        (u?.name || '').toLowerCase().includes(s) ||
        (u?.email || '').toLowerCase().includes(s) ||
        (u?.profile?.designation || '').toLowerCase().includes(s)
      );
    }

    // console.log("list in users",list);
    if (!sortKey) return list;
    const roleLabel = (u) => typeof u?.global_role_id === 'string'
      ? u.global_role_id
      : (u?.global_role_id?.name || u?.global_role_id?.title || '');
    const statusLabel = (u) => (getStatusLabel(u?.status) || '').toLowerCase();
    const getVal = (u) => {
      switch (sortKey) {
        case 'name':
          return (u?.name || '').toLowerCase();
        case 'email':
          return (u?.email || '').toLowerCase();
        case 'designation':
          return (u?.profile?.designation || u?.designation || '').toLowerCase();
        case 'role':
          return (roleLabel(u) || '').toLowerCase();
        case 'status':
          return statusLabel(u);
        default:
          return '';
      }
    };
    const copy = [...list];
    copy.sort((a, b) => {
      const va = getVal(a);
      const vb = getVal(b);
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
  }, [allUsers, sortKey, sortDir, localSearch]);

  const handleSortChange = useCallback((key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }, [sortKey]);

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
    const desiredLimit = 20;
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
  ///email verification
  const isValidEmail = (email) => {
    if (!email) return false;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email.trim());
  };

  // Field length validation (industry standards)
  const isValidLength = (value, max = 100) => {
    if (!value) return true;
    return value.trim().length <= max;
  };


  const exportFailedUsersCSV = (failed) => {
    if (!Array.isArray(failed) || failed.length === 0) return;

    const headers = ["Name", "Email", "Designation", "Team", "Subteam", "Role", "Custom1", "Reason"];

    const escape = (val) => {
      const str = String(val ?? "").replace(/"/g, '""');
      return `"${str}"`;
    };

    const csvContent = [
      headers.map(escape).join(","),
      ...failed.map((f) =>
        [
          escape(f.name),
          escape(f.email),
          escape(f.designation),
          escape(f.teamName),
          escape(f.subTeamName),
          escape(f.roleName),
          escape(f.custom1),
          escape(f.reason)
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `failed_users_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ---------------------------------------------
  // Helper: Normalize row keys
  // ---------------------------------------------
  const normalizeRow = (row) => {
    const normalized = {};
    Object.entries(row || {}).forEach(([key, value]) => {
      if (!key) return;
      normalized[key.toString().trim().toLowerCase()] = value;
    });
    return normalized;
  };

  // ---------------------------------------------
  // Helper: Extract column value by multiple header names
  // ---------------------------------------------
  const getValue = (normalizedRow, keys) => {
    for (const key of keys) {
      const lookupKey = key.trim().toLowerCase();
      if (Object.prototype.hasOwnProperty.call(normalizedRow, lookupKey)) {
        return normalizedRow[lookupKey];
      }
    }
    return '';
  };

  // ---------------------------------------------
  // Helper: Ensure Team Exists
  // ---------------------------------------------
  const ensureTeamByName = async (teamName, teamLookup, dispatch, createTeam, setTeams, setDepartments) => {
    const normalizedName = teamName.trim();
    const lookupKey = normalizedName.toLowerCase();

    // If already exists
    if (teamLookup.has(lookupKey)) {
      return teamLookup.get(lookupKey);
    }

    // Create new team
    const payload = { teamName: normalizedName, status: "Active" };
    const created = await dispatch(createTeam(payload)).unwrap();
    const createdTeam = created?.team || created;

    const teamObj = {
      ...createdTeam,
      name: createdTeam.name || normalizedName,
      subTeams: Array.isArray(createdTeam.subTeams) ? createdTeam.subTeams : [],
    };

    // Save in lookup & state (avoid duplicates)
    teamLookup.set(lookupKey, teamObj);

    setTeams(prev => {
      const exists = prev.some((t) => resolveTeamIdentifier(t) === resolveTeamIdentifier(teamObj));
      return exists ? prev : [...prev, teamObj];
    });
    setDepartments(prev => {
      const exists = prev.some((t) => resolveTeamIdentifier(t) === resolveTeamIdentifier(teamObj));
      return exists ? prev : [...prev, teamObj];
    });

    return teamObj;
  };

  // ---------------------------------------------
  // Helper: Ensure SubTeam Exists
  // ---------------------------------------------
  const ensureSubTeamByName = async (teamObj, subTeamName, subTeamLookup, dispatch, createSubTeam, setTeams) => {
    const teamId = resolveTeamIdentifier(teamObj);
    const normalizedName = subTeamName.trim().toLowerCase();
    const lookupKey = `${teamId}::${normalizedName}`;

    if (subTeamLookup.has(lookupKey)) {
      return subTeamLookup.get(lookupKey);
    }

    // Create new subteam
    const payload = { subTeamName, team_id: teamId };
    const created = await dispatch(createSubTeam(payload)).unwrap();
    const createdSubTeam = created?.subTeam || created;

    const subObj = {
      ...createdSubTeam,
      name: createdSubTeam.name || subTeamName,
    };

    // Save in lookup
    subTeamLookup.set(lookupKey, subObj);

    // Update state (avoid duplicates)
    setTeams(prev =>
      prev.map(t => {
        if (resolveTeamIdentifier(t) !== teamId) return t;
        const existingSubs = Array.isArray(t.subTeams) ? t.subTeams : [];
        const already = existingSubs.some((s) => resolveSubTeamIdentifier(s) === resolveSubTeamIdentifier(subObj));
        return already ? t : { ...t, subTeams: [...existingSubs, subObj] };
      })
    );

    return subObj;
  };

  // Team/Subteam validation
  const isValidTeamName = (name) => {
    if (!name) return true; // empty is allowed
    const regex = /^[A-Za-z0-9/\-\s]+$/;
    return regex.test(name.trim());
  };

  const handleImportUsers = async (event) => {
    const file = event?.target?.files?.[0];
    if (!file) return;

    setIsImporting(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });

      if (!workbook.SheetNames.length) {
        notifyError("No sheets found.");
        return;
      }

      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      if (!rawRows.length) {
        notifyError("No data found in file.");
        return;
      }

      // Build lookups from current state for dedupe
      const teamLookup = new Map();
      const subTeamLookup = new Map();

      const registerTeam = (teamObj) => {
        if (!teamObj) return;
        const id = resolveTeamIdentifier(teamObj);
        const nameKey = toTrimmedString(teamObj?.name || teamObj?.teamName).toLowerCase();
        if (nameKey) teamLookup.set(nameKey, teamObj);
        const subs = Array.isArray(teamObj?.subTeams) ? teamObj.subTeams : [];
        subs.forEach((st) => {
          const subName = toTrimmedString(st?.name || st?.subTeamName).toLowerCase();
          const subId = resolveSubTeamIdentifier(st);
          if (!id || !subName) return;
          subTeamLookup.set(`${id}::${subName}`, st);
          // also map by ID for robustness when name missing
          if (subId) subTeamLookup.set(`${id}::${subId}`, st);
        });
      };

      (Array.isArray(teams) ? teams : []).forEach(registerTeam);

      let successCount = 0;
      const failedUsers = [];

      for (let index = 0; index < rawRows.length; index++) {
        const rowNum = index + 2;
        const row = normalizeRow(rawRows[index]);

        const name = toTrimmedString(getValue(row, ["name"]));
        const email = toTrimmedString(getValue(row, ["email"]));
        const designation = toTrimmedString(getValue(row, ["designation"]));
        const teamName = toTrimmedString(getValue(row, ["team", "team name"]));
        const subTeamName = toTrimmedString(getValue(row, ["subteam", "sub team", "sub team name"]));
        let roleName = toTrimmedString(getValue(row, ["role"])) || "General User";
        const custom1 = toTrimmedString(getValue(row, ["custom1", "custom 1"]));

        // --- TEAM & SUBTEAM NAME VALIDATION ---
        if (teamName && !isValidTeamName(teamName)) {
          failedUsers.push({
            name, email, designation, teamName, subTeamName, roleName, custom1,
            reason: "Invalid characters in Team name. Only letters, numbers, spaces, / and - are allowed"
          });
          continue;
        }

        if (subTeamName && !isValidTeamName(subTeamName)) {
          failedUsers.push({
            name, email, designation, teamName, subTeamName, roleName, custom1,
            reason: "Invalid characters in Subteam name. Only letters, numbers, spaces, / and - are allowed"
          });
          continue;
        }

        // --- VALIDATION RULES ---
        if (!name || !email) {
          failedUsers.push({ name, email, designation, teamName, subTeamName, roleName, custom1, reason: "Name or Email missing" });
          continue;
        }

        if (!isValidEmail(email)) {
          failedUsers.push({ name, email, designation, teamName, subTeamName, roleName, custom1, reason: "Invalid email format" });
          continue;
        }

        if (!isValidLength(name, 80)) {
          failedUsers.push({ name, email, designation, teamName, subTeamName, roleName, custom1, reason: "Name exceeds 80 characters" });
          continue;
        }

        if (!isValidLength(designation, 100)) {
          failedUsers.push({ name, email, designation, teamName, subTeamName, roleName, custom1, reason: "Designation too long" });
          continue;
        }

        if (!isValidLength(custom1, 200)) {
          failedUsers.push({ name, email, designation, teamName, subTeamName, roleName, custom1, reason: "Custom1 exceeds limit" });
          continue;
        }

        // Validate role
        const roleId = findRoleIdByName(roleName);
        if (!roleId) {
          failedUsers.push({ name, email, designation, teamName, subTeamName, roleName, custom1, reason: `Role "${roleName}" not found` });
          continue;
        }

        // --- TEAM + SUBTEAM LOGIC ---
        let teamObj = null;
        let subTeamObj = null;

        try {
          // --- BLOCK INACTIVE TEAM BEFORE TEAM CREATION / USER IMPORT ---
          if (teamName) {
            // Find team in existing state
            const existingTeam = teams?.find(
              (t) => t?.name?.trim().toLowerCase() === teamName.trim().toLowerCase()
            );

            if (existingTeam) {
              const teamStatus = existingTeam?.status?.toLowerCase();

              if (teamStatus === "inactive") {
                failedUsers.push({
                  name,
                  email,
                  designation,
                  teamName,
                  subTeamName,
                  roleName,
                  custom1,
                  reason: "Cannot import user into an inactive team",
                });
                continue;
              }
            }
          }

          if (teamName) teamObj = await ensureTeamByName(teamName, teamLookup, dispatch, createTeam, setTeams, setDepartments);
          if (teamObj && subTeamName) subTeamObj = await ensureSubTeamByName(teamObj, subTeamName, subTeamLookup, dispatch, createSubTeam, setTeams);
        } catch (err) {
          failedUsers.push({ name, email, designation, teamName, subTeamName, roleName, custom1, reason: err?.message || "Team/Subteam error" });
          continue;
        }

        // --- CREATE USER PAYLOAD ---
        const payload = {
          name,
          email,
          designation,
          team: teamObj ? resolveTeamIdentifier(teamObj) : undefined,
          subteam: subTeamObj ? resolveSubTeamIdentifier(subTeamObj) : undefined,
          role: roleId,
          custom1,
          invite: false,
        };

        try {
          await dispatch(createUser(payload)).unwrap();
          successCount++;
        } catch (err) {
          failedUsers.push({ name, email, designation, teamName, subTeamName, roleName, custom1, reason: err?.message || "Failed to create user/User already exists" });
        }
      }

      // ---- Refresh data ----
      if (successCount > 0) {
        setRefetchIndex(i => i + 1);
        getTeams();
      }


      if (failedUsers.length > 0) {
        // Show modal instead of notification
        setImportResults({
          successCount: successCount,
          failedRows: failedUsers
        });
        setShowFailedImportModal(true);
      } else {
        notifySuccess(`Imported ${successCount} user(s).`, { title: "Import successful." });
        clearAllSelections();
      }
    } catch (err) {
      // console.error("Import error:", err);
      notifyError("Import failed. Please check the file.");
    } finally {
      if (event?.target) event.target.value = "";
      setIsImporting(false);
    }
  };
  const userFailedColumns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "designation", label: "Designation" },
    { key: "teamName", label: "Team" },
    { key: "subTeamName", label: "Subteam" },
    { key: "roleName", label: "Role" },
    { key: "custom1", label: "Custom Field" },
    { key: "reason", label: "Reason" },
  ];

  const handleExportUsers = async (exportScope = 'selected') => {
    const toIdStr = (v) => (v === null || v === undefined) ? '' : String(v);
    let targetIds = [];
    const byId = new Map();

    // ========================================
    // STEP 1: Determine export scope
    // ========================================

    if (exportScope === 'all') {
      // EXPORT ALL USERS - Fetch everything regardless of selection
      try {
        const wideParams = {
          ...filters,
          page: 1,
          limit: Math.max(itemsPerPage, Number(totalCount) || 1000)
        };

        let allUsers = [];
        const resAll = await dispatch(fetchUsers(wideParams)).unwrap();

        if (Array.isArray(resAll)) {
          allUsers = resAll;
        } else if (Array.isArray(resAll?.users)) {
          allUsers = resAll.users;
        } else if (Array.isArray(resAll?.data)) {
          allUsers = resAll.data;
        }

        // Build byId map with all users
        allUsers.forEach((u) => {
          const id = toIdStr(resolveUserId(u));
          if (id) byId.set(id, u);
        });

        if (byId.size === 0) {
          notifyWarning('No users found to export.');
          return;
        }

      } catch (e) {
        console.error('Error during export all:', e);
        notifyError('Failed to export all users.');
        return;
      }

    } else {
      // EXPORT SELECTED USERS ONLY

      // Determine selected IDs based on Gmail-style selection
      if (allSelected) {
        const allIdsInFiltered = sortedUsers.map((u) => toIdStr(resolveUserId(u))).filter(Boolean);
        targetIds = allIdsInFiltered.filter((id) => !excludedIds.map(toIdStr).includes(id));
      } else {
        targetIds = Array.isArray(selectedIds) ? selectedIds.map(toIdStr) : [];
      }

      // Validate selection
      if (targetIds.length === 0) {
        notifyWarning('No selected users found to export.', {
          title: 'Export',
          dismissible: true,
          duration: 6000
        });
        return;
      }

      // ========================================
      // STEP 2: Build dataset from current page first
      // ========================================

      const selectedIdSet = new Set(targetIds);
      (Array.isArray(users) ? users : []).forEach((u) => {
        const id = toIdStr(resolveUserId(u));
        if (id && selectedIdSet.has(id) && !excludedIds.map(toIdStr).includes(id)) {
          byId.set(id, u);
        }
      });

      // ========================================
      // STEP 3: Fetch across pages if needed
      // ========================================

      const needCrossPage = allSelected || targetIds.some((id) => !byId.has(id));
      if (needCrossPage) {
        try {
          // Iterate all pages and aggregate only selected users
          for (let page = 1; page <= totalPages; page += 1) {
            // Skip the current page we already processed
            if (page === currentPage) continue;

            const params = { ...filters, page, limit: itemsPerPage };
            let pageUsers = [];

            try {
              const res = await dispatch(fetchUsers(params)).unwrap();

              if (Array.isArray(res)) {
                pageUsers = res;
              } else if (Array.isArray(res?.users)) {
                pageUsers = res.users;
              } else if (Array.isArray(res?.data)) {
                pageUsers = res.data;
              }
            } catch (e) {
              // Skip this page if fetch fails
              continue;
            }

            pageUsers.forEach((u) => {
              const id = toIdStr(resolveUserId(u));
              if (!id) return;

              if (allSelected) {
                if (!excludedIds.map(toIdStr).includes(id) && !byId.has(id)) {
                  byId.set(id, u);
                }
              } else if (selectedIdSet.has(id) && !byId.has(id)) {
                byId.set(id, u);
              }
            });

            // Break early if all found
            if (!allSelected && byId.size >= selectedIdSet.size) break;
          }
        } catch (e) {
          // Non-fatal: continue with whatever we have
        }
      }

      // ========================================
      // STEP 4: Final fallback - wide fetch if still missing
      // ========================================

      const missingAfterLoop = !allSelected && targetIds.some((id) => !byId.has(id));
      if (allSelected || missingAfterLoop) {
        try {
          const wideParams = {
            ...filters,
            page: 1,
            limit: Math.max(itemsPerPage, Number(totalCount) || 0)
          };

          let wideUsers = [];
          try {
            const resAll = await dispatch(fetchUsers(wideParams)).unwrap();

            if (Array.isArray(resAll)) {
              wideUsers = resAll;
            } else if (Array.isArray(resAll?.users)) {
              wideUsers = resAll.users;
            } else if (Array.isArray(resAll?.data)) {
              wideUsers = resAll.data;
            } else if (Array.isArray(resAll?.results)) {
              wideUsers = resAll.results;
            } else if (Array.isArray(resAll?.payload)) {
              wideUsers = resAll.payload;
            }
          } catch (_) {
            // Ignore
          }

          wideUsers.forEach((u) => {
            const id = toIdStr(resolveUserId(u));
            if (!id) return;

            if (allSelected) {
              if (!excludedIds.map(toIdStr).includes(id) && !byId.has(id)) {
                byId.set(id, u);
              }
            } else if (selectedIdSet.has(id) && !byId.has(id)) {
              byId.set(id, u);
            }
          });
        } catch (_) {
          // Ignore
        }
      }
    }

    // ========================================
    // STEP 5: Process users for export
    // ========================================

    const usersToExport = exportScope === 'all'
      ? Array.from(byId.values())
      : targetIds.map((id) => byId.get(toIdStr(id))).filter(Boolean);

    if (usersToExport.length === 0) {
      notifyWarning('Could not resolve users for export.', {
        title: 'Export Warning',
        dismissible: true,
        duration: 6000
      });
      return;
    }

    console.log("Users to export:", usersToExport);

    // ========================================
    // STEP 6: Sort users (maintain UI order)
    // ========================================

    let orderedUsers = usersToExport;
    if (sortKey) {
      const roleLabel = (u) => typeof u?.global_role_id === 'string'
        ? u.global_role_id
        : (u?.global_role_id?.name || u?.global_role_id?.title || '');

      const statusLabel = (u) => (getStatusLabel(u?.status) || '').toLowerCase();

      const getVal = (u) => {
        switch (sortKey) {
          case 'name':
            return (u?.name || '').toLowerCase();
          case 'email':
            return (u?.email || '').toLowerCase();
          case 'designation':
            return (u?.profile?.designation || u?.designation || '').toLowerCase();
          case 'role':
            return (roleLabel(u) || '').toLowerCase();
          case 'status':
            return statusLabel(u);
          default:
            return '';
        }
      };

      orderedUsers = [...usersToExport].sort((a, b) => {
        const va = getVal(a);
        const vb = getVal(b);
        if (va < vb) return sortDir === 'asc' ? -1 : 1;
        if (va > vb) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // ========================================
    // STEP 7: Generate CSV data
    // ========================================

    const rows = orderedUsers.map((user) => {
      const assignments = computeAssignments(user || {});
      const teamNames = assignments.map(a => a.teamName).filter(Boolean);
      const subTeamNames = assignments.map(a => a.subTeamName).filter(Boolean);

      return {
        name: user?.name || '',
        email: user?.email || '',
        designation: user.profile?.designation || '',
        role: typeof user?.global_role_id === 'string'
          ? user.global_role_id
          : user?.global_role_id?.name || user?.global_role_id?.title || '',
        team: teamNames.join(', '),
        subteam: subTeamNames.join(', ')
      };
    });

    // Define CSV headers
    const headers = ['name', 'email', 'designation', 'role', 'team', 'subteam'];
    const headerLabels = ['Name', 'Email', 'Designation', 'Role', 'Team', 'Subteam'];

    // Helper to escape CSV values
    const escapeCsvValue = (value) => {
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
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

    // ========================================
    // STEP 8: Download CSV file
    // ========================================

    try {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `users_export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      notifySuccess(`Successfully exported ${orderedUsers.length} user(s).`, {
        title: 'Export Complete'
      });

    } catch (error) {
      console.error('Error during export:', error);
      notifyError('An error occurred while exporting. Please try again.', {
        title: 'Export Failed'
      });
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

        const res = await dispatch(updateUser({ id: targetId, userData: submissionData })).unwrap();
        notifySuccess(res?.message || "User updated successfully");
        setRefetchIndex(i => i + 1);
        closeForm();

      } catch (err) {
        const val = err?.error;
        if (val.includes("E11000") && val.includes("email")) {
          notifyError("Email already exists", { title: "Failed to update user" });
        }
        else {
          notifyError(err?.message || "Failed to update user");
        }
      }
    } else {
      try {
        console.log(formData)
        const res = await dispatch(createUser(formData)).unwrap();
        notifySuccess(res?.message || "User created successfully");
        setRefetchIndex(i => i + 1);
        closeForm();

      } catch (err) {
        const val = err?.error;
        if (val.includes("E11000") && val.includes("email")) {
          notifyError("Email already exists", { title: "Failed to create user" });
        }
        else {
          notifyError(err?.message || "Failed to create user");
        }
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
  }

  const handleAssignToTeam = (userId) => {
    if (!userId) {
      return;
    }
    openAssignToTeamModal([userId], 'single');
  };

  // const handleOpenAssignForSelected = () => {
  //   if (selectedItems.length === 0) {
  //     return;
  //   }
  //   setShowBulkAction(false);
  //   openAssignToTeamModal(selectedItems, 'bulk');
  // };

  // --- FIXED BULK ASSIGN HANDLER (GMAIL MODEL) ---
  const handleOpenAssignForSelected = () => {
    let finalSelectedIds = [];

    if (allSelected) {
      // ALL PAGES SELECTED → Include all filtered users except excluded ones
      const allIdsInFiltered = sortedUsers.map((u) => u.id).filter(Boolean);
      finalSelectedIds = allIdsInFiltered.filter((id) => !excludedIds.includes(id));
    } else {
      // CUSTOM OR PAGE SELECTION
      finalSelectedIds = [...selectedIds];
    }

    if (finalSelectedIds.length === 0) {
      notifyWarning("No users selected.");
      return;
    }

    // Open modal with selected IDs
    openAssignToTeamModal(finalSelectedIds, "bulk");

    // Close dropdown panel
    setShowBulkAction(false);
    // ✅ Clear selection AFTER opening modal
    clearSelection();

  };


  const handleBulkAssignToGroup = async () => {
    if (!assignTeamId) {
      notifyWarning('Please select a team');
      return;
    }

    if (!assignTargetIds.length) {
      notifyWarning('No users selected for assignment');
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

      setRefetchIndex(i => i + 1);
      notifySuccess(targetIds.length > 1 ? 'Users assigned to the selected team successfully' : 'User assigned to the selected team successfully');
    } catch (err) {
      notifyError(err?.message || 'Failed to assign users to team');
    }
  };

  const handleDelete = async (userId) => {
    const confirmed = await confirm({
      title: 'Are you sure you want to delete this user?',
      message: 'This action will permanently remove the user from the system.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
      showCheckbox: true,
      checkboxLabel: 'I understand that the data cannot be retrieved after deleting.',
      note: 'Associated items will be removed.',
    });
    if (confirmed) {
      try {
        const res = await dispatch(deleteUser(userId)).unwrap();
        notifySuccess(res?.message || "User deleted successfully");
        setRefetchIndex(i => i + 1);
      } catch (err) {
        notifyError(err?.message || "Failed to delete user");
      }
    }
    clearAllSelections();
  };
  const uuidToMongoId = useMemo(() => {
    const map = new Map();
    users.forEach((u) => {
      if (u?.uuid && (u?._id || u?.id)) {
        map.set(u.uuid, u._id || u.id);
      }
    });
    return map;
  }, [users]);

  const handleBulkAction = async (action) => {
    if (selectedIds.length === 0) {

      notifyError('Please select at least one user')
      return;
    }
    if (action === 'delete') {
      const confirmed = await confirm({
        title: `Are you sure you want to delete ${selectedIds.length} users?`,
        message: 'This action will permanently remove all selected users from the system.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger',
        showCheckbox: true,
        checkboxLabel: 'I understand that this data cannot be retrieved after deleting.',
        note: 'All associated items will be removed.',
      });

      if (confirmed) {
        try {
          // Convert UUID → MongoDB _id
          console.log(selectedIds)
          const mongoIds = selectedIds
            .map((uuid) => uuidToMongoId.get(uuid))
            .filter(Boolean);

          const res = await dispatch(bulkDeleteUsers(mongoIds)).unwrap();
          notifySuccess(res?.message || "Users deleted successfully");
          clearAllSelections();
          setRefetchIndex(i => i + 1);
        } catch (error) {
          notifyError('Failed to delete selected users. Please try again.')
        }
      }
    }
    else if (action === 'deactivate') {
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
        setRefetchIndex(i => i + 1);
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
  const itemsPerPage = filters.limit || pageSizeState || 20;
  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / itemsPerPage));
  // const paginatedUsers = Array.isArray(sortedUsers) ? sortedUsers : [];
  // Apply pagination to the sorted users
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return Array.isArray(sortedUsers) ? sortedUsers.slice(startIndex, endIndex) : [];
  }, [sortedUsers, currentPage, itemsPerPage]);

  const currentPageUserIds = paginatedUsers
    .map((user) => resolveUserId(user))
    .filter(Boolean);

  // Gmail model: read-side helpers
  const isRowSelected = useCallback((id) => {
    if (!id) return false;
    return allSelected ? !excludedIds.includes(id) : selectedIds.includes(id);
  }, [allSelected, excludedIds, selectedIds]);

  const derivedSelectedOnPage = useMemo(() => {
    return currentPageUserIds.filter(isRowSelected);
  }, [currentPageUserIds, isRowSelected]);

  const derivedSelectedCount = useMemo(() => {
    if (allSelected) {
      const total = Number(totalCount) || 0;
      return Math.max(0, total - (excludedIds?.length || 0));
    }
    return selectedIds.length;
  }, [allSelected, excludedIds, selectedIds.length, totalCount]);

  const topCheckboxChecked = useMemo(() => {
    if (!currentPageUserIds.length) return false;
    return currentPageUserIds.every((id) => isRowSelected(id));
  }, [currentPageUserIds, isRowSelected]);

  const topCheckboxIndeterminate = useMemo(() => {
    if (!currentPageUserIds.length) return false;
    const anySelected = currentPageUserIds.some((id) => isRowSelected(id));
    const allSelectedOnPage = currentPageUserIds.every((id) => isRowSelected(id));
    return anySelected && !allSelectedOnPage;
  }, [currentPageUserIds, isRowSelected]);

  const clearSelection = useCallback(() => {
    setAllSelected(false);
    setSelectedIds([]);
    setExcludedIds([]);
    setSelectionScope('none');
    setSelectedPageRef(null);
  }, []);

  const applyPageSelection = useCallback(() => {
    if (!currentPageUserIds.length) {
      clearSelection();
      return;
    }
    // Gmail model: select exactly this page
    setAllSelected(false);
    setSelectedIds(currentPageUserIds);
    setExcludedIds([]);
    setSelectionScope('page');
    setSelectedPageRef(currentPage);
  }, [clearSelection, currentPage, currentPageUserIds]);

  const handleSelectAllToggle = useCallback((checked) => {
    if (checked) {
      // select this page
      applyPageSelection();
    } else {
      // deselect this page
      if (allSelected) {
        setExcludedIds((prev) => Array.from(new Set([...prev, ...currentPageUserIds])));
      } else {
        setSelectedIds((prev) => prev.filter((id) => !currentPageUserIds.includes(id)));
      }
      // if nothing remains selected, clear
      const remaining = allSelected
        ? Math.max(0, (Number(totalCount) || 0) - (excludedIds.length + currentPageUserIds.length))
        : Math.max(0, selectedIds.length - currentPageUserIds.length);
      if (remaining <= 0) {
        clearSelection();
      } else {
        setSelectionScope('custom');
        setSelectedPageRef(null);
      }
    }
  }, [allSelected, applyPageSelection, clearSelection, currentPageUserIds, excludedIds.length, selectedIds.length, totalCount]);

  const handleSelectItem = useCallback((e, userId) => {
    const checked = e?.target?.checked;
    if (!userId) return;
    if (allSelected) {
      // manage exclusions when globally selected
      if (checked) {
        setExcludedIds((prev) => prev.filter((id) => id !== userId));
      } else {
        setExcludedIds((prev) => Array.from(new Set([...prev, userId])));
      }
      setSelectionScope('all');
      setSelectedPageRef(null);
    } else {
      if (checked) {
        setSelectedIds((prev) => Array.from(new Set([...prev, userId])));
      } else {
        setSelectedIds((prev) => prev.filter((id) => id !== userId));
      }
      const after = checked
        ? Array.from(new Set([...selectedIds, userId]))
        : selectedIds.filter((id) => id !== userId);
      if (after.length === 0) {
        clearSelection();
      } else {
        // 🔥 IMPORTANT: row selection should NEVER switch to "page" mode
        setSelectionScope('custom');
        setSelectedPageRef(null);
      }
    }
  }, [allSelected, clearSelection, selectedIds]);

  const handleSelectAllPages = useCallback(async () => {
    if (selectAllLoading) return;
    setSelectAllLoading(true);
    try {
      // Logical select-all across filters (Gmail model)
      setAllSelected(true);
      setSelectedIds([]);
      setExcludedIds([]);
      setSelectionScope('all');
      setSelectedPageRef(null);
    } finally {
      setSelectAllLoading(false);
    }
  }, [selectAllLoading]);

  const handleSelectionOption = useCallback((option) => {
    switch (option) {
      case 'page':
        applyPageSelection();
        break;
      case 'all':
        handleSelectAllPages();
        break;
      case 'none':
      default:
        clearSelection();
        break;
    }
  }, [applyPageSelection, clearSelection, handleSelectAllPages]);

  // 🔥 UNIVERSAL SELECTION RESET — for Users & Groups
  const clearAllSelections = useCallback(() => {
    // Gmail-style selection reset
    setAllSelected(false);
    setSelectedIds([]);
    setExcludedIds([]);
    setSelectionScope("none");
    setSelectedPageRef(null);

    // Legacy selection reset (if your file still uses it)
    setSelectedItems && setSelectedItems([]);

  }, []);



  useEffect(() => {
    if (selectionScope === 'page' && selectedPageRef !== currentPage) {
      clearSelection();
    }
  }, [selectionScope, selectedPageRef, currentPage, clearSelection]);

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
  useEffect(() => {
    const delay = setTimeout(() => {
      dispatch(setFilters({
        ...filters,
        search: localSearch.trim(),
        page: 1,
      }));
    }, 500); // backend only when typing stops

    return () => clearTimeout(delay);
  }, [localSearch]);
  // --- Local frontend filter (instant) ---
  const handleLocalFilter = useCallback((query) => {
    setLocalSearch(query?.name || '');
  }, []);

  // --- Backend debounced filter ---
  const backendDebounceRef = useRef(null);
  const handleBackendFilter = useCallback((query) => {
    if (backendDebounceRef.current)
      clearTimeout(backendDebounceRef.current);

    backendDebounceRef.current = setTimeout(() => {
      dispatch(setFilters({
        ...filters,
        search: query.name || '',
        page: 1
      }));
      // dispatch(fetchUsers({
      //   ...filters,
      //   search: query.name || '',
      //   page: 1,
      //   silent: true,     // 🔥 don't show loader
      // }));
    }, 500);
  }, [dispatch, filters]);




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



        {/* Search and Filter Controls */}
        <div className="controls">
          <form onSubmit={handleSearch} className="roles-search-bar">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Search Users"
              value={localSearch}
              onChange={(e) => {
                const value = e.target.value;

                // 1) Instant local filter
                handleLocalFilter({ name: value });

                // 2) Debounced backend fetch
                // handleBackendFilter({ name: value });
                if (value.trim() !== "") {
                  handleBackendFilter({ name: value });
                }

              }}

            />

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
              // onClick={handleExportUsers}
              onClick={() => setShowExportModal(true)} // ✅ Open modal instead
              disabled={!allSelected && selectedIds.length === 0}
              type="button"
            >
              Export <Share size={16} color="#6b7280" />
            </button>

            {showFilters && (
              <div className="filter-panel" style={{ right: '185px', top: '50px' }}>
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
                  <div style={{ fontSize: "15px", fontWeight: "600", color: "#26334d" }}>  <label>Status</label></div>

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

                {/* selection flyout now handled inside UsersTable */}

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

                <div className="user-filter-actions">
                  <button
                    className="btn-secondary"
                    onClick={resetFilters}
                    type="button"
                    style={{ padding: '6px 12px', fontSize: '14px' }}
                  >
                    Clear
                  </button>
                  <button
                    className="btn-primary"
                    onClick={handleFilter}
                    // style={{ marginRight: '8px' }}
                    type="button"
                    style={{ padding: '6px 12px', fontSize: '14px' }}
                  >
                    Apply
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
              <div className="bulk-action-panel" style={{ top: '50px', right: '-159px', padding: "15px" }}>
                <div className="bulk-action-header">
                  <label className="bulk-action-title">Items Selected: {derivedSelectedCount}</label>
                </div>
                <div className="bulk-action-actions" style={{ display: 'flex', gap: 8, flexDirection: 'row', alignItems: 'center' }}>
                  <button
                    className="btn-primary"
                    disabled={!allSelected && selectedIds.length === 0}
                    onClick={handleOpenAssignForSelected}
                  >
                    Assign to Team
                  </button>
                  <button
                    className="btn-primary"
                    disabled={!allSelected && selectedIds.length === 0}
                    onClick={() => handleBulkAction('delete')} style={{ background: "red" }}
                  >
                    <RiDeleteBinFill size={16} color="white" /> Delete
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
        {/* {selectionScope !== 'none' && derivedSelectedCount > 0 && (
          <div className="users-selection-banner" style={{ margin: '12px 0px', justifyContent: 'center' }}>
            {selectionScope === 'page' ? (
              <>
                <span>
                  All {currentPageUserIds.length} {currentPageUserIds.length === 1 ? 'user' : 'users'} on this page are selected.
                </span>
                {totalCount > currentPageUserIds.length && (
                  <button
                    type="button"
                    className="selection-action action-primary"
                    onClick={handleSelectAllPages}
                    disabled={selectAllLoading}
                  >
                    {selectAllLoading ? 'Selecting all users…' : `Select all ${totalCount} users`}
                  </button>
                )}
                <button type="button" className="selection-action action-link" onClick={clearSelection}>
                  Clear selection
                </button>
              </>
            ) : selectionScope === 'all' ? (
              <>
                <span>
                  All {derivedSelectedCount} {derivedSelectedCount === 1 ? 'user' : 'users'} are selected across all pages.
                </span>
                <button type="button" className="selection-action action-link" onClick={clearSelection}>
                  Clear selection
                </button>
              </>
            ) : (
              <>
                <span>
                  {derivedSelectedCount} {derivedSelectedCount === 1 ? 'user' : 'users'} selected.
                </span>
                {totalCount > derivedSelectedCount && (
                  <button
                    type="button"
                    className="selection-action action-primary"
                    onClick={handleSelectAllPages}
                    disabled={selectAllLoading}
                  >
                    {selectAllLoading ? 'Selecting all users…' : `Select all ${totalCount} users`}
                  </button>
                )}
                <button type="button" className="selection-action action-link" onClick={clearSelection}>
                  Clear selection
                </button>
              </>
            )}
          </div>
        )} */}

     <SelectionBanner
  selectionScope={selectionScope}
  selectedCount={derivedSelectedCount}
  currentPageCount={currentPageUserIds.length}
  totalCount={totalCount}
  onClearSelection={clearSelection}
  onSelectAllPages={handleSelectAllPages}
  selectAllLoading={selectAllLoading}
  itemType="user"
  variant="default"
  leftActions={[
    // {
    //   label: 'Export',
    //   onClick: () => setShowExportModal(true),
    //   icon: <Share size={14} />
    // },
    // {
    //   label: 'Assign to Team',
    //   onClick: handleOpenAssignForSelected,
    //   icon: <Users size={14} />
    // },
    // {
    //   label: 'Delete',
    //   onClick: () => handleBulkAction('delete'),
    //   variant: 'danger',
    //   icon: <Trash2 size={14} />
    // }
  ]}
/>
      
        
        {/* selection flyout now handled inside UsersTable */}
        {/* Users Table */}
        <UsersTable
          users={paginatedUsers}
          selectedItems={derivedSelectedOnPage}
          topCheckboxChecked={topCheckboxChecked}
          topCheckboxIndeterminate={topCheckboxIndeterminate}
          onTopCheckboxToggle={handleSelectAllToggle}
          onSelectItem={handleSelectItem}
          resolveUserId={resolveUserId}
          getStatusLabel={getStatusLabel}
          buildUserTagLabels={buildUserTagLabels}
          openPreview={openPreview}
          handleAssignToTeam={handleAssignToTeam}
          openForm={openForm}
          handleDelete={handleDelete}
          currentPage={currentPage}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
          sortKey={sortKey}
          sortDir={sortDir}
          onSortChange={handleSortChange}
          onSelectionOption={handleSelectionOption}
          selectionScope={selectionScope}
          selectAllLoading={selectAllLoading}
          handleCreateUser={openForm}
          pageSelectionCount={currentPageUserIds.length}
          totalFilteredCount={totalCount}
        />
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
                          // <option key={team._id} value={team._id}>
                          //   {team.name}
                          // </option>
                          <option
                            key={team._id}
                            value={team._id}
                            disabled={team.status?.toLowerCase() === "inactive"}
                          >
                            {team.name} {team.status === "inactive" ? "(Inactive)" : ""}
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
                            <option key={subTeam._id} value={subTeam._id} disabled={team.status?.toLowerCase() === "inactive"}>
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
        <FailedImportModal
          open={showFailedImportModal}
          failedRows={importResults.failedRows}
          successCount={importResults.successCount}
          onClose={() => {
            setShowFailedImportModal(false);
            setImportResults({ successCount: 0, failedRows: [] });
            clearSelection();
          }}
          onDownload={() => {
            exportFailedUsersCSV(importResults.failedRows);
            setShowFailedImportModal(false);
            setImportResults({ successCount: 0, failedRows: [] });
            clearSelection();
          }}
          columns={userFailedColumns}
        />
        <ExportModal
          isOpen={showExportModal}
          onClose={() => {
            setShowExportModal(false)
            // clearSelection();
          }}
          onConfirm={async () => {
            await handleExportUsers();
            clearSelection();
          }}
          selectedCount={derivedSelectedCount}
          totalCount={totalCount}
          hasMembers={true}
          exportType="users" // ✅ Specify this is for users
        />
      </div>
    </div>
  );
}

export default UsersManagement; 