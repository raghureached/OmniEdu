import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GoOrganization, GoX } from 'react-icons/go';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronDown, Download, Plus, Eye, Edit3, Trash2, User, X as XIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  fetchGroups,
  deleteGroup,
  importGroups,
  setGroupFilters,
  setGroupCurrentPage,
  setGroupPageSize,
  createTeam,
  updateTeam,
  createSubTeam,
  updateSubTeam,
  deleteSubTeam,
  deactivateGroupsBulk
} from '../../../store/slices/groupSlice';
import { fetchUsers } from '../../../store/slices/userSlice';
import AdminForm from '../../../components/common/AdminForm/AdminForm';
import GroupsTable from './components/GroupsTable';
import TeamPreview from './components/TeamPreview';
import TeamMembersModal from './components/TeamMembersModal';
import api from '../../../services/api';
import GroupsFilter from './components/GroupsFilter';
import DeactivateModal from './DeactivateModal';
import FailedImportModal from './FailedImportModal';
import ExportModal from './components/ExportModal';
import CustomSelect from '../../../components/dropdown/DropDown';
// Reuse OrganizationManagement styles for consistent look & feel
import '../../globalAdmin/OrganizationManagement/OrganizationManagement.css';
import LoadingScreen from '../../../components/common/Loading/Loading';
import { Users } from 'lucide-react';
import { notifyError, notifyInfo, notifySuccess, notifyWarning } from '../../../utils/notification';
import { useConfirm } from '../../../components/ConfirmDialogue/ConfirmDialog';
import SelectionBanner from '../../../components/Banner/SelectionBanner';
import ImportModal from '../../../components/ImportModal/ImportModal';
const GroupsManagement = () => {
  const dispatch = useDispatch();
  const { groups, loading, error, totalCount, currentPage, pageSize } = useSelector((state) => state.groups);
  const allUsers = useSelector((state) => state.users?.users || []);
  const [showForm, setShowForm] = useState(false);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [selectionScope, setSelectionScope] = useState('none'); // none | page | all | custom
  // Gmail-style selection model
  const [allSelected, setAllSelected] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]); // used when allSelected=false
  const [excludedIds, setExcludedIds] = useState([]); // used when allSelected=true
  const [selectedPageRef, setSelectedPageRef] = useState(null);
  const [selectAllLoading, setSelectAllLoading] = useState(false);
  const [allSelectionCount, setAllSelectionCount] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [filterParams, setFilterParams] = useState({});
  const [formData, setFormData] = useState({});
  const [expandedTeamId, setExpandedTeamId] = useState(null);
  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const [membersModalTeam, setMembersModalTeam] = useState(null);
  const [membersModalUsers, setMembersModalUsers] = useState([]);

  // Sorting (global, before pagination)
  const [sortKey, setSortKey] = useState(''); // '', 'teamName', 'subTeams', 'members', 'status'
  const [sortDir, setSortDir] = useState('asc'); // 'asc' | 'desc'
  const [subTeamModalOpen, setSubTeamModalOpen] = useState(false);
  const [subTeamModalTeam, setSubTeamModalTeam] = useState(null);
  const [subTeamModalTrigger, setSubTeamModalTrigger] = useState(null);
  const [subTeamEditData, setSubTeamEditData] = useState(null);
  const [subTeamEditTrigger, setSubTeamEditTrigger] = useState(null);
  const [failedGroupRows, setFailedGroupRows] = useState([]);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [teamsToDeactivate, setTeamsToDeactivate] = useState([]);
  //export model
  const [showExportModal, setShowExportModal] = useState(false);
  //import model
  const [showImportModal, setShowImportModal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  //FAILED MODEL
  const [showFailedImportModal, setShowFailedImportModal] = useState(false);
  const [importResults, setImportResults] = useState({
    successCount: 0,
    failedRows: []
  });
  //confirm
  const { confirm } = useConfirm();
  const editMode = !!currentGroup;

  useEffect(() => {
    fetchGroupData();
  }, [dispatch, currentPage, pageSize]);

  useEffect(() => {
    const desiredSize = 20;
    if (pageSize !== desiredSize) {
      dispatch(setGroupPageSize(desiredSize));
    }
  }, [dispatch, pageSize]);

  useEffect(() => {
    dispatch(fetchUsers()).catch((error) => {
      console.error('Failed to fetch users for member counts:', error);
    });
  }, [dispatch]);

  // Prefill form data when editing, or reset when creating
  useEffect(() => {
    if (showForm) {
      if (currentGroup) {
        setFormData({
          teamName: currentGroup.teamName || currentGroup.name || '',
          status: currentGroup.status || '',
        });
      } else {
        setFormData({
          teamName: '',
          status: 'active',
        });
      }
    }
  }, [showForm, currentGroup]);

  const fetchGroupData = () => {
    const effectiveLimit = pageSize || 20;
    dispatch(fetchGroups({
      ...filterParams,
      page: currentPage,
      limit: effectiveLimit
    })).catch(error => {
      console.error('Error fetching groups:', error);
    });
  };

  const handleTogglePreviewTeam = (group) => {
    if (!group) return;
    const teamId = group.id || group._id;
    setExpandedTeamId(prev => (prev === teamId ? null : teamId));
  };

  const handleAddSubTeamFromTable = (group) => {
    if (!group) return;
    const teamId = group.id || group._id;
    if (!teamId) return;
    const originalTeam = Array.isArray(groups)
      ? groups.find((item) => (item._id || item.id) === teamId)
      : null;
    setSubTeamModalTeam(originalTeam || group);
    setSubTeamModalOpen(true);
    setSubTeamModalTrigger(Date.now());
  };

  const handleCloseSubTeamModal = () => {
    setSubTeamModalOpen(false);
    setSubTeamModalTeam(null);
    setSubTeamModalTrigger(null);
    setSubTeamEditData(null);
    setSubTeamEditTrigger(null);
  };

  const handleSubTeamModalTriggerHandled = () => {
    setSubTeamModalTrigger(null);
  };

  const handleSubTeamEditHandled = () => {
    setSubTeamEditTrigger(null);
  };

  const resolveIdentifier = (value) => {
    if (!value && value !== 0) return null;
    if (typeof value === 'string' || typeof value === 'number') {
      const normalized = String(value).trim();
      return normalized.length ? normalized : null;
    }
    if (typeof value === 'object') {
      const identifier =
        value._id ||
        value.id ||
        value.uuid ||
        value.value ||
        value.team_id ||
        value.teamId ||
        value.sub_team_id ||
        value.subTeamId ||
        null;
      return identifier ? resolveIdentifier(identifier) : null;
    }
    return null;
  };

  const deriveUserAssignments = (user) => {
    if (!user) return [];

    const profile = user.profile || {};
    const assignments = Array.isArray(profile.teams) && profile.teams.length
      ? profile.teams
      : [{ team_id: profile.team_id, sub_team_id: profile.sub_team_id }];

    return assignments
      .map((assignment) => {
        const teamId = resolveIdentifier(assignment?.team_id ?? assignment?.teamId);
        const subTeamId = resolveIdentifier(assignment?.sub_team_id ?? assignment?.subTeamId);
        const subTeamNameCandidate =
          assignment?.sub_team_name ??
          assignment?.subTeamName ??
          assignment?.subteamName ??
          assignment?.subTeam?.name ??
          assignment?.sub_team?.name ??
          assignment?.subTeam?.subTeamName ??
          assignment?.sub_team?.sub_team_name ??
          assignment?.subTeamLabel ??
          assignment?.subTeam ??
          assignment?.name ??
          assignment?.label;

        const subTeamName = typeof subTeamNameCandidate === 'string' || typeof subTeamNameCandidate === 'number'
          ? String(subTeamNameCandidate).trim()
          : '';

        return {
          teamId,
          subTeamId,
          subTeamName,
        };
      })
      .filter(({ teamId }) => Boolean(teamId));
  };

  const buildTeamMemberData = (groupLike) => {
    if (!groupLike) return null;

    const teamId = groupLike.id || groupLike._id;
    const fullTeam = Array.isArray(groups)
      ? groups.find((item) => (item._id || item.id) === teamId)
      : groupLike;
    console.log("fullteam", fullTeam)

    if (!fullTeam) return null;

    const resolvedTeamId = resolveIdentifier(fullTeam?._id ?? fullTeam?.id ?? teamId);
    console.log("resolvedTeamId", resolvedTeamId)
    const teamDisplayName = fullTeam?.teamName || fullTeam?.name || groupLike.teamName || groupLike.name || '—';
    console.log("teamDisplayName", teamDisplayName)
    const subTeamsArray = Array.isArray(fullTeam?.subTeams) ? fullTeam.subTeams : [];
    console.log("subTeamsArray", subTeamsArray)

    const globalSubTeamLookup = new Map();
    if (Array.isArray(groups)) {
      groups.forEach((team) => {
        const teamSubTeams = Array.isArray(team?.subTeams) ? team.subTeams : [];
        teamSubTeams.forEach((subTeam) => {
          const identifier = resolveIdentifier(subTeam?.uuid ?? subTeam?._id ?? subTeam?.id ?? subTeam);
          if (identifier && !globalSubTeamLookup.has(identifier)) {
            globalSubTeamLookup.set(identifier, subTeam);
          }
        });
      });
    }

    const subTeamLookup = new Map(
      subTeamsArray
        .map((subTeam) => {
          const identifier = resolveIdentifier(subTeam?.uuid ?? subTeam?._id ?? subTeam?.id ?? subTeam);
          return identifier ? [identifier, subTeam] : null;
        })
        .filter(Boolean)
    );

    const subTeamMetaCache = new Map();
    const resolveSubTeamMeta = (candidateId, candidateName) => {
      const normalizedId = resolveIdentifier(candidateId);
      const normalizedName = typeof candidateName === 'string' || typeof candidateName === 'number'
        ? String(candidateName).trim()
        : '';

      const cacheKey = normalizedId || `__name__${normalizedName}`;
      if (cacheKey && subTeamMetaCache.has(cacheKey)) {
        return subTeamMetaCache.get(cacheKey);
      }

      let resolvedName = '';

      if (normalizedId && subTeamLookup.has(normalizedId)) {
        const record = subTeamLookup.get(normalizedId);
        resolvedName =
          record?.name ||
          record?.subTeamName ||
          record?.subteamName ||
          record?.sub_team_name ||
          '';
      }

      if (!resolvedName && normalizedId && globalSubTeamLookup.has(normalizedId)) {
        const record = globalSubTeamLookup.get(normalizedId);
        resolvedName =
          record?.name ||
          record?.subTeamName ||
          record?.subteamName ||
          record?.sub_team_name ||
          '';
      }

      if (!resolvedName && normalizedName) {
        resolvedName = normalizedName;
      }

      if (!resolvedName && normalizedId) {
        resolvedName = String(normalizedId);
      }

      const meta = {
        id: normalizedId || null,
        name: resolvedName,
      };

      if (cacheKey) {
        subTeamMetaCache.set(cacheKey, meta);
      }

      return meta;
    };

    const memberAccumulator = [];

    const pushMember = (member, overrideMeta) => {
      if (!member) return;

      const normalizedName = member.name?.trim?.() || member.fullName || member.email || '—';
      const emailValue = member.email || '—';

      const rawSubTeamId = overrideMeta?.id ??
        member?.subTeamId ??
        member?.sub_team_id ??
        member?.subTeam?.id ??
        member?.subTeam?.uuid ??
        member?.sub_team?.id ??
        member?.sub_team?.uuid ??
        null;

      const rawSubTeamName = overrideMeta?.name ??
        member?.subTeamName ??
        member?.subteamName ??
        member?.sub_team_name ??
        member?.subTeam?.name ??
        member?.subTeam?.subTeamName ??
        member?.sub_team?.name ??
        member?.sub_team?.sub_team_name ??
        member?.subTeamLabel ??
        member?.subTeam ??
        member?.sub_team ??
        '';

      const { id: finalSubTeamId, name: finalSubTeamName } = resolveSubTeamMeta(rawSubTeamId, rawSubTeamName);

      memberAccumulator.push({
        id: member._id || member.id || member.uuid || null,
        name: normalizedName,
        email: emailValue,
        teamName: member.teamName,
        subTeamId: finalSubTeamId,
        subTeamName: finalSubTeamName,
      });
    };

    const directMembers = Array.isArray(fullTeam?.members) ? fullTeam.members : [];
    directMembers.forEach((member) => {
      pushMember({
        ...member,
        teamName: teamDisplayName,
      });
    });

    subTeamsArray.forEach((subTeam) => {
      if (Array.isArray(subTeam?.members)) {
        const subTeamIdentifier = resolveIdentifier(subTeam?.uuid ?? subTeam?._id ?? subTeam?.id ?? subTeam);
        const subTeamName = subTeam?.name || subTeam?.subTeamName || subTeam?.subteamName || subTeam?.sub_team_name || '';

        subTeam.members.forEach((member) => {
          pushMember(
            {
              ...member,
              teamName: teamDisplayName,
            },
            {
              id: subTeamIdentifier,
              name: subTeamName,
            }
          );
        });
      }
    });

    if (resolvedTeamId) {
      allUsers.forEach((user) => {
        const assignments = deriveUserAssignments(user).filter(({ teamId }) => teamId === resolvedTeamId);
        if (!assignments.length) return;

        const nameParts = [user.firstName, user.lastName].filter(Boolean);
        const displayName = user.name || user.fullName || nameParts.join(' ').trim() || user.email || '—';
        const memberPayload = {
          id: user.uuid || user._id || user.id || null,
          name: displayName,
          email: user.email || '—',
          teamName: teamDisplayName,
        };

        assignments.forEach(({ subTeamId, subTeamName }) => {
          const meta = resolveSubTeamMeta(subTeamId, subTeamName);
          pushMember(memberPayload, meta);
        });
      });
    }

    const memberMap = new Map();

    memberAccumulator.forEach((member, index) => {
      const normalizedEmail = (member.email || '').trim().toLowerCase();
      const normalizedName = (member.name || '').trim().toLowerCase();
      const baseKey = member.id ?? (normalizedEmail || normalizedName ? `${normalizedEmail}|${normalizedName}` : null);
      const key = baseKey ?? `__member_${index}`;

      if (!memberMap.has(key)) {
        memberMap.set(key, {
          id: member.id || null,
          teamName: member.teamName,
          name: member.name,
          email: member.email,
          subTeams: [],
        });
      }

      const entry = memberMap.get(key);
      const normalizedSubTeamName = (member.subTeamName || '').trim();
      const normalizedSubTeamId = member.subTeamId ? resolveIdentifier(member.subTeamId) : null;

      if (!normalizedSubTeamName && !normalizedSubTeamId) {
        return;
      }

      const alreadyPresent = entry.subTeams.some((subTeam) => {
        const existingId = subTeam.id ? resolveIdentifier(subTeam.id) : null;
        if (existingId && normalizedSubTeamId) {
          return existingId === normalizedSubTeamId;
        }
        if (normalizedSubTeamName && subTeam.name) {
          return subTeam.name.toLowerCase() === normalizedSubTeamName.toLowerCase();
        }
        return false;
      });

      if (!alreadyPresent) {
        entry.subTeams.push({
          id: normalizedSubTeamId,
          name: normalizedSubTeamName,
        });
      }
    });

    const dedupedMembers = Array.from(memberMap.values()).map((entry) => {
      const subTeamNames = entry.subTeams.map((subTeam) => {
        const resolved = resolveSubTeamMeta(subTeam.id, subTeam.name);
        // console.log("dupped members",resolved.name)
        return resolved.name || '';
      });

      return {
        id: entry.id,
        teamName: entry.teamName,
        name: entry.name,
        email: entry.email,
        subTeamNames,
        subTeamName: subTeamNames[0] || '',
      };
    });

    return {
      team: {
        ...(fullTeam || groupLike),
        teamName: teamDisplayName,
      },
      members: dedupedMembers,
      subTeams: subTeamsArray.map((subTeam) => ({
        id: subTeam._id,
        name:
          subTeam?.name ||
          subTeam?.subTeamName ||
          subTeam?.subteamName ||
          subTeam?.sub_team_name ||
          '',
      }
      ))

    };
  };

  const handleShowMembers = (group) => {
    const result = buildTeamMemberData(group);
    console.log("groups as input", group)
    if (!result) return;

    setMembersModalTeam(result.team);
    setMembersModalUsers(result.members);
    // console.log('Members modal users:', result.members);
    setMembersModalOpen(true);
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    fetchGroupData();
  };

  const handleCreateGroup = () => {
    setCurrentGroup(null);
    setShowForm(true);
  };

  const handleEditGroup = (group) => {
    setCurrentGroup(group);
    setShowForm(true);
  };

  const handleDeleteGroup = async (groupId) => {
    const confirmed = await confirm({
      title: 'Are you sure you want to delete this group?',
      message: 'This action will permanently remove the group from the system.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
      showCheckbox: true,
      checkboxLabel: 'I understand that the data cannot be retrieved after deleting.',
      note: 'Associated items will be removed.',
    });

    if (confirmed) {
      try {
        const res = dispatch(deleteGroup(groupId));
        notifySuccess("Group Deleted Successfully")
      }
      catch (err) {
        notifyError(err?.error || "Failed to Delete Group")
      }

    }
  };
  const handleBulkDelete = async () => {
    // Derive actual selected group IDs using Gmail-style selection
    const selectedGroupIds = allSelected
      ? sortedGroups.map(g => g.id).filter(id => !excludedIds.includes(id))
      : selectedIds;

    if (!selectedGroupIds.length) {
      notifyWarning("Please select at least one group to delete");
      return;
    }
    const confirmed = await confirm({
      title: `Delete ${selectedGroupIds.length} selected group(s)?`,
      message: 'This action will permanently remove all selected groups from the system.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
      showCheckbox: true,
      checkboxLabel: 'I understand that this data cannot be retrieved after deleting.',
      note: 'All associated items will be removed.',
    });
    if (!confirmed) return;

    // for (const groupId of selectedGroupIds) {
    //   await dispatch(deleteGroup(groupId));
    // }
    let allSucceeded = true;

    for (const groupId of selectedGroupIds) {
      try {
        await dispatch(deleteGroup(groupId)).unwrap();
      } catch (err) {
        allSucceeded = false;
      }
    }

    if (allSucceeded) {
      notifySuccess("All selected groups were deleted successfully");
    } else {
      notifyError("Some groups could not be deleted");
    }



    // Clear selection after delete
    setAllSelected(false);
    setSelectedIds([]);
    setExcludedIds([]);
    setSelectionScope('none');
    setSelectedPageRef(null);
    setAllSelectionCount(null);

    fetchGroupData();
  };

  const handleBulkDeactivate = () => {
    const selectedList = sortedGroups.filter(g => isRowSelected(g.id));

    const activeTeams = selectedList.filter(
      g => g.status?.toLowerCase() === "active"
    );

    if (activeTeams.length === 0) {
      notifyWarning("No active teams selected.");
      return;
    }

    setTeamsToDeactivate(activeTeams);
    setShowDeactivateModal(true);
  };
  const confirmDeactivateTeams = async () => {
    const ids = teamsToDeactivate.map(t => t.uuid);

    try {
      await dispatch(deactivateGroupsBulk(ids)).unwrap();

      notifySuccess(`${ids.length} team(s) deactivated.`);
      fetchGroupData();
    } catch (err) {
      notifyError("Failed to deactivate teams.");
    }

    setShowDeactivateModal(false);
    setTeamsToDeactivate([]);
  };



  const allowedPattern = /^[A-Za-z0-9\/\- ]+$/;

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "teamName") {
      if (value === "" || allowedPattern.test(value)) {
        setFormData(prev => ({ ...prev, [name]: value }));
      } else {
        // notifyError("Only letters, numbers, / and - are allowed in Team Name");
        return;
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  const exportFailedGroupsCSV = (rows) => {
    if (!Array.isArray(rows) || rows.length === 0) return;

    const headers = ["Team Name", "Subteam Name", "Reason"];

    const escape = (val) => {
      const str = String(val ?? "").replace(/"/g, '""');
      return `"${str}"`;
    };

    const csvContent = [
      headers.map(escape).join(","),
      ...rows.map((r) =>
        [
          escape(r.teamName),
          escape(r.subTeamName),
          escape(r.reason)
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `failed_groups_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // const handleImportGroups = async (event) => {
  //   const file = event.target.files?.[0];
  //   if (!file) return;

  //   const failedRows = [];
  //   const created = [];
  //   const updated = [];

  //   try {
  //     const text = await file.text();
  //     const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");

  //     if (!lines.length) {
  //       notifyError("File is empty.");
  //       return;
  //     }

  //     // Parse CSV header
  //     const header = lines.shift().split(",");
  //     const colTeam = header.findIndex((h) => h.trim().toLowerCase() === "team name");
  //     const colSub = header.findIndex((h) => h.trim().toLowerCase() === "subteam name");

  //     if (colTeam === -1 || colSub === -1) {
  //       notifyError('CSV must contain "Team Name" and "Subteam Name".');
  //       return;
  //     }

  //     // Parse rows
  //     const parsedRows = lines.map((line) => {
  //       const cols = line.split(",");
  //       return {
  //         teamName: (cols[colTeam] || "").trim(),
  //         subTeamName: (cols[colSub] || "").trim(),
  //       };
  //     });

  //     // Build lookup map from existing groups
  //     const teamMap = new Map();
  //     normalizedGroups.forEach((t) => {
  //       teamMap.set(t.teamName.trim(), {
  //         ...t,
  //         subTeams: t.subTeams || [],
  //       });
  //     });

  //     // Process each CSV row
  //     for (const row of parsedRows) {
  //       const teamName = row.teamName.trim();
  //       const subTeamName = row.subTeamName.trim();
  //       // ❗ INSERT THIS BLOCK HERE
  //       if (!allowedPattern.test(teamName)) {
  //         failedRows.push({ teamName, subTeamName, reason: "Invalid team name characters" });
  //         continue;
  //       }
  //       if (!allowedPattern.test(subTeamName)) {
  //         failedRows.push({ teamName, subTeamName, reason: "Invalid subteam name characters" });
  //         continue;
  //       }
  //       if (!teamName) {
  //         failedRows.push({ teamName, subTeamName, reason: "Missing Team Name" });
  //         continue;
  //       }
  //       if (!subTeamName) {
  //         failedRows.push({ teamName, subTeamName, reason: "Missing Subteam Name" });
  //         continue;
  //       }

  //       const existingTeam = teamMap.get(teamName);

  //       // TEAM DOES NOT EXIST → CREATE
  //       if (!existingTeam) {
  //         try {
  //           const teamRes = await dispatch(
  //             createTeam({ teamName, status: "Active" })
  //           ).unwrap();

  //           const teamId = teamRes?.team?._id;
  //           if (!teamId) throw new Error("Team created but no ID returned.");

  //           await dispatch(
  //             createSubTeam({ subTeamName, team_id: teamId })
  //           ).unwrap();

  //           created.push(`${teamName} → ${subTeamName}`);

  //           teamMap.set(teamName, {
  //             teamName,
  //             id: teamId,
  //             subTeams: [{ name: subTeamName }],
  //           });
  //         } catch (err) {
  //           failedRows.push({
  //             teamName,
  //             subTeamName,
  //             reason: "Failed to create team or subteam",
  //           });
  //         }
  //         continue;
  //       }

  //       // TEAM EXISTS → Check subteam
  //       const subExists = existingTeam.subTeams.some(
  //         (st) => st.name.trim() === subTeamName
  //       );

  //       if (subExists) {
  //         failedRows.push({
  //           teamName,
  //           subTeamName,
  //           reason: "Subteam already exists under this team",
  //         });
  //         continue;
  //       }

  //       // SUBTEAM DOES NOT EXIST → CREATE SUBTEAM
  //       try {
  //         await dispatch(
  //           createSubTeam({
  //             subTeamName,
  //             team_id: existingTeam.id || existingTeam._id,
  //           })
  //         ).unwrap();

  //         updated.push(`${teamName} + ${subTeamName}`);
  //         existingTeam.subTeams.push({ name: subTeamName });

  //       } catch (err) {
  //         failedRows.push({
  //           teamName,
  //           subTeamName,
  //           reason: "Failed to create subteam",
  //         });
  //       }
  //     }

  //     // Refresh groups
  //     if (created.length || updated.length) {
  //       fetchGroupData();
  //     }

  //     // ---- FINAL RESULT HANDLING ----
  //     const createdCount = created.length + updated.length;

  //     if (failedRows.length > 0) {
  //       // Show modal instead of notification
  //       setImportResults({
  //         successCount: createdCount,
  //         failedRows: failedRows
  //       });
  //       setShowFailedImportModal(true);
  //     } else {
  //       notifySuccess(`Imported ${createdCount} group(s).`, {
  //         title: "Import Successful",
  //       });
  //     }

  //   } catch (err) {
  //     console.error(err);
  //     notifyError("Import failed. Please check your file.");
  //   } finally {
  //     event.target.value = "";
  //   }
  // };
  const handleImportGroups = async (file) => {
    if (!file) return;

    setIsImporting(true);
    const failedRows = [];
    const created = [];
    const updated = [];

    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");

      if (!lines.length) {
        notifyError("File is empty.");
        return;
      }

      // Parse CSV header
      const header = lines.shift().split(",");
      const colTeam = header.findIndex((h) => h.trim().toLowerCase() === "team name");
      const colSub = header.findIndex((h) => h.trim().toLowerCase() === "subteam name");

      if (colTeam === -1 || colSub === -1) {
        notifyError('CSV must contain "Team Name" and "Subteam Name".');
        return;
      }

      // Parse rows
      const parsedRows = lines.map((line) => {
        const cols = line.split(",");
        return {
          teamName: (cols[colTeam] || "").trim(),
          subTeamName: (cols[colSub] || "").trim(),
        };
      });

      // Build lookup map from existing groups
      const teamMap = new Map();
      normalizedGroups.forEach((t) => {
        teamMap.set(t.teamName.trim(), {
          ...t,
          subTeams: t.subTeams || [],
        });
      });

      // Process each CSV row
      for (const row of parsedRows) {
        const teamName = row.teamName.trim();
        const subTeamName = row.subTeamName.trim();

        if (!allowedPattern.test(teamName)) {
          failedRows.push({ teamName, subTeamName, reason: "Invalid team name characters" });
          continue;
        }
        if (!allowedPattern.test(subTeamName)) {
          failedRows.push({ teamName, subTeamName, reason: "Invalid subteam name characters" });
          continue;
        }
        if (!teamName) {
          failedRows.push({ teamName, subTeamName, reason: "Missing Team Name" });
          continue;
        }
        if (!subTeamName) {
          failedRows.push({ teamName, subTeamName, reason: "Missing Subteam Name" });
          continue;
        }

        const existingTeam = teamMap.get(teamName);

        // TEAM DOES NOT EXIST → CREATE
        if (!existingTeam) {
          try {
            const teamRes = await dispatch(
              createTeam({ teamName, status: "Active" })
            ).unwrap();

            const teamId = teamRes?.team?._id;
            if (!teamId) throw new Error("Team created but no ID returned.");

            await dispatch(
              createSubTeam({ subTeamName, team_id: teamId })
            ).unwrap();

            created.push(`${teamName} → ${subTeamName}`);

            teamMap.set(teamName, {
              teamName,
              id: teamId,
              subTeams: [{ name: subTeamName }],
            });
          } catch (err) {
            failedRows.push({
              teamName,
              subTeamName,
              reason: "Failed to create team or subteam",
            });
          }
          continue;
        }

        // TEAM EXISTS → Check subteam
        const subExists = existingTeam.subTeams.some(
          (st) => st.name.trim() === subTeamName
        );

        if (subExists) {
          failedRows.push({
            teamName,
            subTeamName,
            reason: "Subteam already exists under this team",
          });
          continue;
        }

        // SUBTEAM DOES NOT EXIST → CREATE SUBTEAM
        try {
          await dispatch(
            createSubTeam({
              subTeamName,
              team_id: existingTeam.id || existingTeam._id,
            })
          ).unwrap();

          updated.push(`${teamName} + ${subTeamName}`);
          existingTeam.subTeams.push({ name: subTeamName });

        } catch (err) {
          failedRows.push({
            teamName,
            subTeamName,
            reason: "Failed to create subteam",
          });
        }
      }

      // Refresh groups
      if (created.length || updated.length) {
        fetchGroupData();
      }

      // Close modal
      setShowImportModal(false);

      // Final result handling
      const createdCount = created.length + updated.length;

      if (failedRows.length > 0) {
        setImportResults({
          successCount: createdCount,
          failedRows: failedRows
        });
        setShowFailedImportModal(true);
      } else {
        notifySuccess(`Imported ${createdCount} group(s).`, {
          title: "Import Successful",
        });
      }

    } catch (err) {
      console.error(err);
      notifyError("Import failed. Please check your file.");
    } finally {
      setIsImporting(false);
    }
  };

  // Add handler to open import modal
  const handleOpenImportModal = () => {
    setShowImportModal(true);
  };

  const groupFailedColumns = [
    { key: "teamName", label: "Team Name" },
    { key: "subTeamName", label: "Subteam Name" },
    { key: "reason", label: "Reason" },
  ];

  const findMemberSubteamName = (member, group) => {
    try {
      // Find membership for this team
      const membership = member?.profile?.teams?.find(
        (t) => String(t.team_id) === String(group?.team_id || group?._id)
      );

      if (!membership || !membership.sub_team_id) return "";

      // Find subteam object
      const matchedSubteam = group?.subTeams?.find(
        (st) => String(st._id) === String(membership.sub_team_id)
      );

      return matchedSubteam?.name || "";
    } catch {
      return "";
    }
  };

  const handleExportGroups = (exportType = 'selected') => {
    const allIdsInFiltered = sortedGroups.map((g) => g.id).filter(Boolean);
    const selectedIdsForExport = allSelected
      ? allIdsInFiltered.filter((id) => !excludedIds.includes(id))
      : selectedIds;

    // const groupsToExport = selectedIdsForExport.length > 0
    //   ? sortedGroups.filter((group) => selectedIdsForExport.includes(group.id))
    //   : [];
    // Determine what to export based on exportType
    const groupsToExport = exportType === 'all'
      ? sortedGroups  // Export all filtered groups
      : sortedGroups.filter((group) => selectedIdsForExport.includes(group.id));


    if (!Array.isArray(groupsToExport) || groupsToExport.length === 0) {
      notifyWarning('No selected groups available to export.');
      return;
    }

    // If exporting entire data
    // const exportTeamsOnly = (selectedIdsForExport.length === (totalCount || 0));
    // If exporting all, only export teams and subteams (no members)
    const exportTeamsOnly = (exportType === 'all');
    let headers = [];
    const rows = [];

    const formatSubteams = (subTeams) => {
      if (!Array.isArray(subTeams)) return '';
      return subTeams.map((st) => st?.name || '').join(', ');
    };

    //
    // EXPORT 1 — ONLY TEAMS & SUBTEAMS (NO MEMBERS)
    //
    if (exportTeamsOnly) {
      headers = [
        "Team Name",
        "Subteams"
      ];

      groupsToExport.forEach(group => {
        const result = buildTeamMemberData(group);
        const teamName = result?.team?.teamName || group.teamName || '';
        const subTeams = formatSubteams(result?.subTeams || group.subTeams);

        rows.push([teamName, subTeams]);
      });

    } else {
      //
      // EXPORT 2 — INCLUDE MEMBERS
      //
      headers = [
        "Team Name",
        "Subteams",
        "Name",
        "Email",
      ];

      groupsToExport.forEach(group => {
        const result = buildTeamMemberData(group);
        const teamName = result?.team?.teamName || group.teamName || '';
        const members = Array.isArray(result?.members) ? result.members : [];

        if (members.length === 0) {
          // No members → emit a single row with empty member fields and no subteams
          const subTeamNames = (result?.subTeams || []).map(st => st.name).join(', ');
          rows.push([teamName, subTeamNames, '', '']);
        } else {
          // Build a map from subteam id -> subteam name for this team for reliable resolution
          const subTeamNameMap = new Map(
            (Array.isArray(result?.subTeams) ? result.subTeams : [])
              .map(st => [String(st.id), st.name || ''])
          );

          members.forEach(member => {
            const rawList = Array.isArray(member?.subTeamNames)
              ? member.subTeamNames
              : (member?.subTeamName ? [member.subTeamName] : []);

            const resolvedList = rawList
              .filter(Boolean)
              .map(v => {
                const key = String(v);
                return subTeamNameMap.get(key) || v; // replace id with name when possible
              });

            const memberSubteams = resolvedList.join(', ');

            rows.push([
              teamName,
              memberSubteams,
              member?.name || '',
              member?.email || '',
            ]);
          });
        }
      });
    }

    //
    // CSV generation
    //
    const escape = (value) => {
      const normalized = value ?? '';
      const escaped = String(normalized).replace(/"/g, '""');
      return `"${escaped}"`;
    };

    const csvLines = [
      headers.map(escape).join(','),
      ...rows.map(row => row.map(escape).join(',')),
    ];

    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `groups_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const mappedPayload = {
      teamName: formData.teamName?.trim() || '',
      status: formData.status?.trim() || '',
    };

    try {
      if (currentGroup) {
        const id = currentGroup.uuid;
        if (!id) {
          throw new Error('Unable to determine group identifier for update.');
        }
        const res = await dispatch(updateTeam({ id, teamData: mappedPayload })).unwrap();
        notifySuccess(res?.message || "Team updated successfully");
      } else {
        const res = await dispatch(createTeam(mappedPayload)).unwrap();
        notifySuccess(res?.message || "Team created successfully");
      }

      setShowForm(false);
      setCurrentGroup(null);
      setFormData({
        teamName: '',
        status: '',
      });
      setSelectedGroups([]);
      setSelectionScope('none');
      setSelectedPageRef(null);
      setAllSelectionCount(null);
      fetchGroupData();
    } catch (submitError) {
      // console.error('Failed to submit group form:', submitError);
      notifyError(submitError?.error || submitError?.message || "Failed to submit group form");


    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };



  const handleFilter = (filters) => {
    const effectiveLimit = pageSize || 20;
    setFilterParams(filters);
    dispatch(setGroupCurrentPage(1));

    dispatch(fetchGroups({
      ...filters,
      page: 1,
      limit: effectiveLimit
    }));
  };

  const handleClearFilter = () => {
    const effectiveLimit = pageSize || 20;
    setFilterParams({});
    dispatch(setGroupCurrentPage(1));

    dispatch(fetchGroups({
      page: 1,
      limit: effectiveLimit
    }));
  };


  // Local UI filter (instant)
  const handleLocalFilter = (filters) => {
    setFilterParams(filters);
  };

  // Backend filter (debounced)
  const handleBackendFilter = (filters) => {
    const effectiveLimit = pageSize || 20;

    dispatch(setGroupCurrentPage(1));

    dispatch(fetchGroups({
      ...filters,
      page: 1,
      limit: effectiveLimit,
      silent: filters.silent === true,  // 🔥 carry silent forward
    }));
  };

  const handlePageChange = (newPage) => {
    const effectiveLimit = pageSize || 20;
    const totalItems = filteredGroups.length;
    const maxPages = Math.max(1, Math.ceil(totalItems / effectiveLimit));
    if (newPage < 1 || newPage > maxPages || newPage === currentPage) {
      return;
    }
    dispatch(setGroupCurrentPage(newPage));
  }

  const normalizedGroups = useMemo(() => {
    if (!Array.isArray(groups)) {
      return [];
    }

    return groups.map((team) => {
      const subTeamsArray = Array.isArray(team.subTeams) ? team.subTeams : [];
      const primarySubTeam = subTeamsArray[0] || {};

      const subTeamsWithCounts = subTeamsArray.map((subTeam) => ({
        ...subTeam,
        membersCount: typeof subTeam?.membersCount === 'number'
          ? subTeam.membersCount
          : Array.isArray(subTeam?.members)
            ? subTeam.members.length
            : 0,
      }));

      const seenIds = new Set();
      const seenEmailName = new Set();
      let uniqueMemberCount = 0;

      const considerMember = (memberLike) => {
        if (!memberLike) return;
        const memberId = resolveIdentifier(memberLike);

        if (memberId) {
          if (seenIds.has(memberId)) return;
          seenIds.add(memberId);
          uniqueMemberCount += 1;
          return;
        }

        const email = (memberLike.email || '').trim().toLowerCase();
        const nameValue =
          memberLike.name ||
          memberLike.fullName ||
          [memberLike.firstName, memberLike.lastName].filter(Boolean).join(' ');
        const name = (nameValue || '').trim().toLowerCase();
        const dedupeKey = `${email}|${name}`;
        if (seenEmailName.has(dedupeKey)) return;
        seenEmailName.add(dedupeKey);
        uniqueMemberCount += 1;
      };

      const directMembers = Array.isArray(team?.members) ? team.members : [];
      directMembers.forEach(considerMember);

      subTeamsArray.forEach((subTeam) => {
        if (Array.isArray(subTeam?.members)) {
          subTeam.members.forEach(considerMember);
        }
      });

      const resolvedTeamId = resolveIdentifier(team?._id ?? team?.id ?? team);
      if (resolvedTeamId) {
        allUsers.forEach((user) => {
          const assignments = deriveUserAssignments(user);
          if (assignments.some(({ teamId }) => teamId === resolvedTeamId)) {
            considerMember({
              _id: user.uuid || user._id || user.id || null,
              email: user.email,
              name: user.name || user.fullName || [user.firstName, user.lastName].filter(Boolean).join(' '),
              fullName: user.fullName,
            });
          }
        });
      }

      return {
        id: team.id || team._id,
        uuid: team.uuid,
        teamName: team.teamName || team.name || '',
        subTeams: subTeamsWithCounts,
        membersCount: uniqueMemberCount,
        status: team.status || primarySubTeam.status || 'inactive',
      };
    });
  }, [groups, allUsers]);

  const filteredGroups = normalizedGroups.filter(group => {
    const nameMatch = filterParams.name
      ? group.teamName?.toLowerCase().includes(filterParams.name.toLowerCase())
      : true;
    const statusMatch = filterParams.status ? group.status === filterParams.status : true;

    return nameMatch && statusMatch;
  });
  // Apply sorting before pagination
  const sortedGroups = useMemo(() => {
    console.log("groups full list", filteredGroups);
    if (!Array.isArray(filteredGroups)) return [];
    if (!sortKey) return filteredGroups;
    const getVal = (g) => {
      switch (sortKey) {
        case 'teamName':
          return (g.teamName || '').toLowerCase();
        case 'subTeams':
          return Array.isArray(g.subTeams) ? g.subTeams.length : 0;
        case 'members':
          return Number(g.membersCount || 0);
        case 'status':
          return (g.status || '').toLowerCase();
        default:
          return '';
      }
    };
    const copy = [...filteredGroups];
    copy.sort((a, b) => {
      const va = getVal(a);
      const vb = getVal(b);
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
  }, [filteredGroups, sortKey, sortDir]);

  // Calculate pagination
  const effectivePageSize = pageSize || 6;
  const totalItems = sortedGroups.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / effectivePageSize));
  const indexOfLastItem = currentPage * effectivePageSize;
  const indexOfFirstItem = indexOfLastItem - effectivePageSize;
  const currentItems = sortedGroups.slice(indexOfFirstItem, indexOfLastItem);

  const currentPageIds = useMemo(() => currentItems.map((group) => group.id).filter(Boolean), [currentItems]);

  // Helpers mirrored from Users
  const isRowSelected = useCallback((id) => {
    if (!id) return false;
    return allSelected ? !excludedIds.includes(id) : selectedIds.includes(id);
  }, [allSelected, excludedIds, selectedIds]);

  const derivedSelectedOnPage = useMemo(() => currentPageIds.filter(isRowSelected), [currentPageIds, isRowSelected]);

  const derivedSelectedCount = useMemo(() => {
    if (allSelected) {
      const total = Number(totalItems) || 0;
      return Math.max(0, total - (excludedIds?.length || 0));
    }
    return selectedIds.length;
  }, [allSelected, excludedIds, selectedIds.length, totalItems]);

  const clearSelection = useCallback(() => {
    setSelectedGroups([]);
    setSelectionScope('none');
    setSelectedPageRef(null);
    setAllSelectionCount(null);
    setAllSelected(false);
    setSelectedIds([]);
    setExcludedIds([]);
  }, []);

  const applyPageSelection = useCallback(() => {
    if (!currentPageIds.length) {
      clearSelection();
      return;
    }
    // Gmail model: select exactly this page
    setAllSelected(false);
    setSelectedIds(currentPageIds);
    setExcludedIds([]);
    setSelectionScope('page');
    setSelectedPageRef(currentPage);
    setAllSelectionCount(null);
  }, [clearSelection, currentPage, currentPageIds]);

  const fetchAllFilteredGroupIds = useCallback(async () => {
    const ids = new Set();
    const limit = 200;
    let page = 1;
    while (page <= 100) {
      const params = {
        ...filterParams,
        page,
        limit,
      };
      try {
        const response = await api.get('/api/admin/getGroups', { params });
        const data = Array.isArray(response.data?.data) ? response.data.data : [];
        if (!data.length) {
          break;
        }
        data.forEach((team) => {
          const identifier = team?.id || team?._id;
          if (identifier) {
            ids.add(identifier);
          }
        });
        if (data.length < limit) {
          break;
        }
        page += 1;
      } catch (error) {
        console.error('Failed to fetch all group ids:', error);
        throw error;
      }
    }
    return Array.from(ids);
  }, [filterParams]);

  const handleSelectAllPages = useCallback(async () => {
    if (selectAllLoading) return;
    setSelectAllLoading(true);
    try {
      // Gmail model: logical select-all across filters
      setAllSelected(true);
      setSelectedIds([]);
      setExcludedIds([]);
      setSelectionScope('all');
      setSelectedPageRef(null);
      setAllSelectionCount(Number(totalItems) || 0);
    } finally {
      setSelectAllLoading(false);
    }
  }, [selectAllLoading, totalItems]);

  const handleSelectAllToggle = useCallback((checked) => {
    if (checked) {
      applyPageSelection();
    } else {
      // deselect this page
      if (allSelected) {
        setExcludedIds((prev) => Array.from(new Set([...prev, ...currentPageIds])));
      } else {
        setSelectedIds((prev) => prev.filter((id) => !currentPageIds.includes(id)));
      }
      const remaining = allSelected
        ? Math.max(0, (Number(totalItems) || 0) - (excludedIds.length + currentPageIds.length))
        : Math.max(0, selectedIds.length - currentPageIds.length);
      if (remaining <= 0) {
        clearSelection();
      } else {
        setSelectionScope('custom');
        setSelectedPageRef(null);
      }
    }
  }, [allSelected, applyPageSelection, clearSelection, currentPageIds, excludedIds.length, selectedIds.length, totalItems]);

  const handleSelectGroup = useCallback((checked, groupId) => {
    if (!groupId) return;
    if (allSelected) {
      if (checked) {
        setExcludedIds((prev) => prev.filter((id) => id !== groupId));
      } else {
        setExcludedIds((prev) => Array.from(new Set([...prev, groupId])));
      }
      setSelectionScope('all');
      setSelectedPageRef(null);
    } else {
      if (checked) {
        setSelectedIds((prev) => Array.from(new Set([...prev, groupId])));
      } else {
        setSelectedIds((prev) => prev.filter((id) => id !== groupId));
      }
      const after = checked
        ? Array.from(new Set([...selectedIds, groupId]))
        : selectedIds.filter((id) => id !== groupId);
      if (after.length === 0) {
        clearSelection();
      } else {
        // User is selecting rows individually → stay in custom mode
        setSelectionScope('custom');
        setSelectedPageRef(null);
      }
    }
  }, [allSelected, clearSelection, selectedIds]);

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

  const handleSortChange = useCallback((key) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }, [sortKey]);

  useEffect(() => {
    if (selectionScope === 'page' && selectedPageRef !== currentPage) {
      clearSelection();
    }
  }, [clearSelection, currentPage, selectedPageRef, selectionScope]);

  useEffect(() => {
    if (selectionScope === 'page' && selectedPageRef === currentPage) {
      // ✅ If the page size changed (e.g., search → clear search),
      //    don’t auto-select everything on the new page.
      if (selectedIds.length !== currentPageIds.length) {
        return;
      }

      const isPageFullySelected =
        currentPageIds.length > 0 &&
        currentPageIds.every((id) => isRowSelected(id));

      if (!isPageFullySelected) {
        // enforce page selection in Gmail model ONLY for the same page
        setAllSelected(false);
        setSelectedIds(currentPageIds);
        setExcludedIds([]);
      }
    }
  }, [currentPageIds, isRowSelected, selectedPageRef, selectionScope, selectedIds.length]);

  // useEffect(() => {
  //   if (selectionScope === 'page' && selectedPageRef === currentPage) {
  //     const isPageFullySelected = currentPageIds.length > 0 && currentPageIds.every((id) => isRowSelected(id));
  //     if (!isPageFullySelected) {
  //       // enforce page selection in Gmail model
  //       setAllSelected(false);
  //       setSelectedIds(currentPageIds);
  //       setExcludedIds([]);
  //     }
  //   }
  // }, [currentPageIds, isRowSelected, selectedPageRef, selectionScope]);

  const topCheckboxChecked = currentPageIds.length > 0 && currentPageIds.every((id) => isRowSelected(id));

  // Generate page numbers
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }
  if (loading) {
    return <LoadingScreen text={"Loading Groups..."} />
  }

  // const handlecreateSubTeam = async (data) => {
  //   await dispatch(createSubTeam(data.data)).unwrap();
  // }
  const handlecreateSubTeam = async (data) => {
    const name = data.data?.subTeamName?.trim() || "";

    if (!allowedPattern.test(name)) {
      // notifyError("Only letters, numbers, / and - are allowed in Subteam Name");
      return;
    }
    try {
      const res = await dispatch(createSubTeam(data.data)).unwrap();
      notifySuccess(res?.message || "SubTeam created successfully")
      fetchGroupData();
    }
    catch (err) {
      notifyError("Failed to create SubTeam")
    }
  };

  // const handleupdateSubTeam = async (id, data) => {
  //   await dispatch(updateSubTeam({id, subTeamData: data})).unwrap();
  // }
  const handleupdateSubTeam = async (id, data) => {
    const name = data?.subTeamName?.trim() || "";

    if (!allowedPattern.test(name)) {
      // notifyError("Only letters, numbers, / and - are allowed in Subteam Name");
      return;
    }

    try {
      const res = await dispatch(updateSubTeam({ id, subTeamData: data })).unwrap();
      notifySuccess(res?.message || "SubTeam updated successfully")
    } catch (error) {
      // console.error('Failed to delete subteam:', error);
      notifyError('Failed to update subteam');
    }
  };

  const handleDeleteSubTeam = async (id) => {
    try {
      const res = await dispatch(deleteSubTeam(id)).unwrap();
      notifySuccess(res?.message || "SubTeam deleted successfully")
    } catch (error) {
      // console.error('Failed to delete subteam:', error);
      notifyError('Failed to delete subteam');
    }
  }
  return (
    <div className="app-container">
      <div className="main-content">
        <div className="page-content">
          <GroupsFilter
            groups={filteredGroups}
            onLocalFilter={handleLocalFilter}       // NEW
            onBackendFilter={handleBackendFilter}   // NEW
            onFilter={handleFilter}
            handleCreateGroup={handleCreateGroup}
            handleImportGroups={handleOpenImportModal}  // Changed this line
            // handleExportGroups={handleExportGroups}
            handleExportGroups={() => setShowExportModal(true)}  // ✅ Changed this line
            handleBulkDelete={handleBulkDelete}
            // selectedGroups={Array.from({ length: derivedSelectedCount })}
            selectedGroups={
              allSelected
                ? sortedGroups.map(g => g.id).filter(id => !excludedIds.includes(id))
                : selectedIds
            }


            onClearFilter={handleClearFilter}
            handleBulkDeactivate={handleBulkDeactivate}
          />

          {showForm && (

            <div className='addOrg-modal-overlay'>

              <div className='addOrg-modal-content'>
                <div className="addOrg-modal-header">
                  <div className="addOrg-header-content">
                    <div className="addOrg-header-icon">
                      <Users size={24} color="#5570f1" />
                    </div>
                    <div>
                      <h2>{editMode ? "Edit Team" : "Add New Team"}</h2>
                      <p className="addOrg-header-subtitle">
                        {editMode ? "Update Team details" : "Create a new Team profile"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="addOrg-close-btn"
                    onClick={() => setShowForm(false)}
                    aria-label="Close modal"
                  >
                    <GoX size={20} />
                  </button>
                </div>
                <form className="addOrg-org-form">
                  {/* Basic Information Section */}
                  <div className="addOrg-form-section">
                    <h3 className="addOrg-section-title" style={{ marginTop: "10px" }}>Basic Information</h3>
                    <div className="addOrg-form-grid">
                      <div className="addOrg-form-group">
                        <label className="addOrg-form-label">
                          Team Name<span className="addOrg-required">*</span>
                        </label>
                        <input
                          type="text"
                          name="teamName"
                          placeholder="Enter team name"
                          value={formData.teamName}
                          onChange={handleInputChange}
                          className="addOrg-form-input"
                          required
                        />
                        <p style={{ color: '#dc2626', fontSize: '12px', marginLeft: "4px" }}>
                          Only letters, numbers, / and - are allowed in Team Name.
                        </p>

                      </div>
                      <div className="addOrg-form-group">
                        <label className="addOrg-form-label">
                          Status<span className="addOrg-required">*</span>
                        </label>
                        <CustomSelect
                          name="status"
                          value={formData?.status?.toLowerCase()}
                          options={[
                            { value: "", label: "Select Status" },
                            { value: "active", label: "Active" },
                            { value: "inactive", label: "Inactive" }
                          ]}
                          onChange={(value) => handleInputChange({ target: { name: 'status', value } })}
                          placeholder="Select Status"
                          className="addOrg-form-input"
                          required
                          searchable={false}
                          disabled={!editMode}
                        />
                      </div>

                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="addOrg-form-actions">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={handleFormCancel}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button onClick={(e) => handleFormSubmit(e)} className="btn-primary" disabled={loading}>
                      <GoOrganization size={16} />
                      <span>{editMode ? 'Update Team' : 'Create Team'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* {selectionScope !== 'none' && derivedSelectedCount > 0 && (
            <div className="selection-banner sticky" style={{ justifyContent: "center" }} >
              {selectionScope === 'page' ? (
                < >
                  <span>
                    All {currentPageIds.length} {currentPageIds.length === 1 ? 'group' : 'groups'} on this page are selected.

                  </span>
                  {totalItems > currentPageIds.length && (
                    <button
                      type="button"
                      className="selection-action action-primary"
                      onClick={handleSelectAllPages}
                      disabled={selectAllLoading}
                    >
                      {selectAllLoading ? 'Selecting all groups…' : `Select all ${totalItems} groups`}
                    </button>
                  )}
                  <button type="button" className="selection-action action-link" onClick={clearSelection} style={{ height: "30px" }} >
                    Clear selection
                  </button>
                </>
              ) : selectionScope === 'all' ? (
                <>
                  <span>
                    All {derivedSelectedCount} {derivedSelectedCount === 1 ? 'group' : 'groups'} are selected across all pages.
                  </span>
                  <button type="button" className="selection-action action-link selection-action-banner" onClick={clearSelection}>
                    Clear selection
                  </button>
                </>
              ) : (
                <>
                  <span>
                    {derivedSelectedCount} {derivedSelectedCount === 1 ? 'group' : 'groups'} selected.
                  </span>
                  {totalItems > derivedSelectedCount && (
                    <button
                      type="button"
                      className="selection-action action-primary"
                      onClick={handleSelectAllPages}
                      disabled={selectAllLoading}
                    >
                      {selectAllLoading ? 'Selecting all groups…' : `Select all ${totalItems} groups`}
                    </button>
                  )}
                  <button type="button" className="selection-action action-link" onClick={clearSelection}>
                    Clear selection
                  </button>
                </  >
              )}
            </div>
          )} */}
          <SelectionBanner
            selectionScope={selectionScope}
            selectedCount={derivedSelectedCount}
            currentPageCount={currentPageIds.length}
            totalCount={totalItems}
            onClearSelection={clearSelection}
            onSelectAllPages={handleSelectAllPages}
            selectAllLoading={selectAllLoading}
            itemType="group"
            variant="default"
            showWelcomeMessage={true}
          />

          {loading && !showForm ? (
            <div className="groups-management-loading">
              <div className="groups-management-loading-spinner"></div>
              <p>Loading groups...</p>
            </div>
          ) : (
            <GroupsTable
              groups={currentItems}
              selectedGroups={derivedSelectedOnPage}
              onSelectGroup={handleSelectGroup}
              topCheckboxChecked={topCheckboxChecked}
              topCheckboxIndeterminate={selectionScope !== 'all' && !topCheckboxChecked && derivedSelectedCount > 0}
              onTopCheckboxToggle={handleSelectAllToggle}
              onSelectionOption={handleSelectionOption}
              selectionScope={selectionScope}
              selectAllLoading={selectAllLoading}
              pageSelectionCount={currentPageIds.length}
              totalFilteredCount={totalItems}
              totalSelectedCount={derivedSelectedCount}
              onSelectAllPages={handleSelectAllPages}
              onClearSelection={clearSelection}
              handleEditGroup={handleEditGroup}
              handleDeleteGroup={handleDeleteGroup}
              onTogglePreview={handleTogglePreviewTeam}
              expandedTeamId={expandedTeamId}
              onAddSubTeam={handleAddSubTeamFromTable}
              onShowMembers={handleShowMembers}
              sortKey={sortKey}
              sortDir={sortDir}
              onSortChange={handleSortChange}
              handleCreateGroup={handleCreateGroup}
              renderExpandedContent={(group) => {
                const teamId = group.id || group._id;
                const originalTeam = Array.isArray(groups)
                  ? groups.find((item) => (item._id || item.id) === teamId)
                  : null;

                return (
                  <TeamPreview
                    isOpen
                    onClose={() => setExpandedTeamId(null)}
                    team={originalTeam || group}
                    createSubTeam={handlecreateSubTeam}
                    updateSubTeam={handleupdateSubTeam}
                    deleteSubTeam={handleDeleteSubTeam}
                    loading={loading}
                    inline
                    onEditSubTeam={({ subTeam, uuid, name }) => {
                      if (!uuid) {
                        console.warn('Unable to determine subteam identifier for edit.');
                        return;
                      }

                      const targetTeam = originalTeam || group;
                      setSubTeamModalTeam(targetTeam);
                      setSubTeamModalOpen(true);
                      setSubTeamModalTrigger(null);
                      setSubTeamEditData({ ...(subTeam || {}), uuid, name });
                      setSubTeamEditTrigger(Date.now());
                    }}
                  />
                );
              }}
              currentPage={currentPage}
              totalPages={totalPages}
              pageNumbers={pageNumbers}
              handlePageChange={handlePageChange}
            />
          )}
          <TeamMembersModal
            isOpen={membersModalOpen}
            onClose={() => setMembersModalOpen(false)}
            team={membersModalTeam}
            members={membersModalUsers}
            groups={currentGroup}

          />
          <TeamPreview
            isOpen={subTeamModalOpen}
            onClose={handleCloseSubTeamModal}
            team={subTeamModalTeam}
            createSubTeam={handlecreateSubTeam}
            updateSubTeam={handleupdateSubTeam}
            deleteSubTeam={handleDeleteSubTeam}
            loading={loading}
            addSubTeamTrigger={subTeamModalTrigger}
            onAddSubTeamHandled={handleSubTeamModalTriggerHandled}
            editSubTeamData={subTeamEditData}
            editSubTeamTrigger={subTeamEditTrigger}
            onEditSubTeamHandled={handleSubTeamEditHandled}
          />
          <DeactivateModal
            open={showDeactivateModal}
            count={teamsToDeactivate.length}
            onCancel={() => {
              setShowDeactivateModal(false)

            }
            }
            onConfirm={async () => {
              await confirmDeactivateTeams();
              clearSelection();     // 👈 clear after deactivation
            }}

          />
          <FailedImportModal
            open={showFailedImportModal}
            failedRows={importResults.failedRows}
            successCount={importResults.successCount}
            onClose={() => {
              setShowFailedImportModal(false);
              setImportResults({ successCount: 0, failedRows: [] });
              clearSelection();   // 👈 clear when closing modal
            }}
            onDownload={() => {
              exportFailedGroupsCSV(importResults.failedRows);
              setShowFailedImportModal(false);
              setImportResults({ successCount: 0, failedRows: [] });
              clearSelection();   // 👈 clear after downloading
            }}
            columns={groupFailedColumns}
          />
          <ExportModal
            isOpen={showExportModal}
            onClose={() => { setShowExportModal(false); }}
            onConfirm={async () => {
              await handleExportGroups();
              clearSelection();
            }}
            selectedCount={derivedSelectedCount}
            totalCount={totalItems}
            hasMembers={derivedSelectedCount > 0 && derivedSelectedCount < totalItems}
            exportType="groups"
          />
          <ImportModal
            isOpen={showImportModal}
            onClose={() => setShowImportModal(false)}
            onImport={handleImportGroups}
            templateHeaders={["Team Name", "Subteam Name"]}
            templateData={[
            
            ]}
            title="Import Teams & Subteams"
            acceptedFormats=".csv,.xlsx,.xls"
            maxSizeText="Maximum size: 25 MB"
            isImporting={isImporting}
          />


        </div>
      </div>
    </div>
  );
};

export default GroupsManagement;