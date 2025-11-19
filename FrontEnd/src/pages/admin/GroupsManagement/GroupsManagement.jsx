import React, { useState, useEffect, useMemo } from 'react';
import { GoOrganization, GoX } from 'react-icons/go';
import { useDispatch, useSelector } from 'react-redux';
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
  deleteSubTeam
} from '../../../store/slices/groupSlice';
import { fetchUsers } from '../../../store/slices/userSlice';
import AdminForm from '../../../components/common/AdminForm/AdminForm';
import GroupsTable from './components/GroupsTable';
import TeamPreview from './components/TeamPreview';
import TeamMembersModal from './components/TeamMembersModal';
import GroupsFilter from './components/GroupsFilter';
// Reuse OrganizationManagement styles for consistent look & feel
import '../../globalAdmin/OrganizationManagement/OrganizationManagement.css';
import LoadingScreen from '../../../components/common/Loading/Loading';
import { Users } from 'lucide-react';
import { notifyError,notifyInfo,notifySuccess,notifyWarning } from '../../../utils/notification';

const GroupsManagement = () => {
  const dispatch = useDispatch();
  const { groups, loading, error, totalCount, currentPage, pageSize } = useSelector((state) => state.groups);
  const allUsers = useSelector((state) => state.users?.users || []);
  const [showForm, setShowForm] = useState(false);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [filterParams, setFilterParams] = useState({});
  const [formData, setFormData] = useState({});
  const [expandedTeamId, setExpandedTeamId] = useState(null);
  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const [membersModalTeam, setMembersModalTeam] = useState(null);
  const [membersModalUsers, setMembersModalUsers] = useState([]);
  const [subTeamModalOpen, setSubTeamModalOpen] = useState(false);
  const [subTeamModalTeam, setSubTeamModalTeam] = useState(null);
  const [subTeamModalTrigger, setSubTeamModalTrigger] = useState(null);
  const [subTeamEditData, setSubTeamEditData] = useState(null);
  const [subTeamEditTrigger, setSubTeamEditTrigger] = useState(null);
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
          status: '',
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

    if (!fullTeam) return null;

    const resolvedTeamId = resolveIdentifier(fullTeam?._id ?? fullTeam?.id ?? teamId);
    const teamDisplayName = fullTeam?.teamName || fullTeam?.name || groupLike.teamName || groupLike.name || '—';

    const subTeamsArray = Array.isArray(fullTeam?.subTeams) ? fullTeam.subTeams : [];

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
        id: resolveIdentifier(subTeam?.uuid ?? subTeam?._id ?? subTeam?.id ?? subTeam),
        name:
          subTeam?.name ||
          subTeam?.subTeamName ||
          subTeam?.subteamName ||
          subTeam?.sub_team_name ||
          '',
      })),
    };
  };

  const handleShowMembers = (group) => {
    const result = buildTeamMemberData(group);
    if (!result) return;

    setMembersModalTeam(result.team);
    setMembersModalUsers(result.members);
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

  const handleDeleteGroup = (groupId) => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      dispatch(deleteGroup(groupId));
    }
  };

  const handleBulkDelete = () => {
    if (selectedGroups.length === 0) {
      alert('Please select at least one group to delete');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedGroups.length} groups?`)) {
      selectedGroups.forEach(groupId => {
        dispatch(deleteGroup(groupId));
      });
      setSelectedGroups([]);
      setSelectAll(false);
    }
  };

  const handleImportGroups = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileName = file.name || 'groups_import';
      const extension = fileName.split('.').pop()?.toLowerCase();
      if (!['csv', 'json'].includes(extension || '')) {
        // alert('Upload a CSV or JSON file containing "Team Name" and "Subteam Name".');
        notifyError('Upload a CSV or JSON file containing "Team Name" and "Subteam Name".')
        return;
      }

      const rawContent = await file.text();
      if (!rawContent.trim()) {
        alert('The selected file is empty.');
        return;
      }

      let rows = [];
      let csvHeader = '';

      if (extension === 'json') {
        try {
          const parsed = JSON.parse(rawContent);
          if (!Array.isArray(parsed)) {
            alert('JSON file must contain an array of objects.');
            return;
          }
          rows = parsed.map((entry) => ({
            teamName: entry?.teamName || entry?.team_name || entry?.name || '',
            subTeamName: entry?.subTeamName || entry?.sub_team_name || entry?.subteam || '',
            original: entry,
          }));
        } catch (error) {
          console.error('Invalid JSON import:', error);
          alert('Unable to parse JSON file. Please verify its content.');
          return;
        }
      } else {
        const lines = rawContent.split(/\r?\n/);
        const cleanedLines = lines.filter((line) => line.trim().length > 0);
        if (!cleanedLines.length) {
          alert('No data rows found in the CSV file.');
          return;
        }

        csvHeader = cleanedLines.shift();
        const headers = csvHeader.split(',').map((value) => value.trim().toLowerCase());
        const teamIndex = headers.indexOf('team name');
        const subTeamIndex = headers.indexOf('subteam name');

        if (teamIndex === -1 || subTeamIndex === -1) {
          // alert('CSV header must include "Team Name" and "Subteam Name" columns.');
          notifyError('CSV header must include "Team Name" and "Subteam Name" columns.')
          return;
        }

        rows = cleanedLines.map((line) => {
          const values = line.split(',');
          return {
            teamName: values[teamIndex]?.trim() || '',
            subTeamName: values[subTeamIndex]?.trim() || '',
            originalLine: line,
          };
        });
      }

      if (!rows.length) {
        alert('No valid rows found in the import file.');
        return;
      }

      const existingTeams = new Set(
        normalizedGroups
          .map((group) => group.teamName?.trim().toLowerCase())
          .filter(Boolean)
      );

      const uniqueTeams = new Set();
      const validRows = [];
      const skippedReasons = {
        missingTeam: 0,
        missingSubTeam: 0,
        alreadyExists: 0,
        duplicateInFile: 0,
      };

      rows.forEach((row) => {
        const teamName = row.teamName?.trim();
        const subTeamName = row.subTeamName?.trim();

        if (!teamName) {
          skippedReasons.missingTeam += 1;
          return;
        }

        if (!subTeamName) {
          skippedReasons.missingSubTeam += 1;
          return;
        }

        const key = teamName.toLowerCase();

        if (existingTeams.has(key)) {
          skippedReasons.alreadyExists += 1;
          return;
        }

        if (uniqueTeams.has(key)) {
          skippedReasons.duplicateInFile += 1;
          return;
        }

        uniqueTeams.add(key);
        validRows.push({
          teamName,
          subTeamName,
          original: row.original,
          originalLine: row.originalLine,
          key,
        });
      });

      if (!validRows.length) {
        const totalSkipped = Object.values(skippedReasons).reduce((sum, value) => sum + value, 0);
        alert(
          totalSkipped > 0
            ? 'Import aborted: every row was invalid, duplicated, or already exists.'
            : 'Import aborted: No valid team entries detected.'
        );
        return;
      }

      let createdCount = 0;
      let failedCount = 0;
      const failedRows = [];

      for (const row of validRows) {
        try {
          const teamResponse = await dispatch(createTeam({
            teamName: row.teamName,
            status: 'Active',
          })).unwrap();

          const teamData = teamResponse?.team || teamResponse || {};
          const teamId = teamData._id || teamData.id;

          if (!teamId) {
            throw new Error('Missing team ID in response.');
          }

          await dispatch(createSubTeam({
            subTeamName: row.subTeamName,
            team_id: teamId,
          })).unwrap();

          createdCount += 1;
          existingTeams.add(row.key);
        } catch (creationError) {
          const message = creationError?.message || creationError?.data?.message || creationError?.error || '';
          const normalizedMessage = typeof message === 'string' ? message.toLowerCase() : '';
          const isDuplicate = normalizedMessage.includes('already exists') || normalizedMessage.includes('duplicate');

          if (isDuplicate) {
            skippedReasons.alreadyExists += 1;
            existingTeams.add(row.key);
          } else {
            console.error('Failed to create team/subteam from import row:', creationError);
            failedCount += 1;
            failedRows.push(row.teamName || '(unknown team)');
          }
        }
      }

      if (createdCount > 0) {
        fetchGroupData();
      }

      const skippedSummary = Object.entries(skippedReasons)
        .filter(([, count]) => count > 0)
        .map(([reason, count]) => `${count} ${reason.replace(/([A-Z])/g, ' $1').toLowerCase()} row${count > 1 ? 's' : ''}`);

      const messages = [];
      if (createdCount > 0) {
        messages.push(`${createdCount} team${createdCount > 1 ? 's' : ''} created.`);
      }
      if (failedCount > 0) {
        messages.push(`${failedCount} row${failedCount > 1 ? 's' : ''} failed during creation${failedRows.length ? ` (${failedRows.join(', ')})` : ''}.`);
      }
      if (skippedSummary.length) {
        messages.push(`Skipped rows: ${skippedSummary.join(', ')}.`);
      }
      if (!messages.length) {
        messages.push('Import completed with no changes.');
      }

      alert(messages.join('\n'));
    } catch (error) {
      console.error('Failed to import groups:', error);
      alert('Failed to import groups. Please try again.');
    } finally {
      event.target.value = '';
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleExportGroups = () => {
    const selectedIdSet = new Set((selectedGroups || []).filter(Boolean));
    const groupsToExport = selectedIdSet.size
      ? normalizedGroups.filter((group) => selectedIdSet.has(group.id))
      : normalizedGroups;

    if (!Array.isArray(groupsToExport) || groupsToExport.length === 0) {
      alert(selectedIdSet.size ? 'Selected groups are not available to export.' : 'No groups available to export.');
      return;
    }

    const headers = [ 
      'Name',
      'Email',
      'Team Name',
      'Subteam Name1',
      'Subteam Name2',
      'Subteam Name3',
      'Subteam Name4',
      'Subteam Name5',
    ];
    const rows = [];

    groupsToExport.forEach((group, index) => {
      const result = buildTeamMemberData(group);
      const teamName = result?.team?.teamName || group.teamName || '';
      const members = Array.isArray(result?.members) ? result.members : [];
      const subTeams = Array.isArray(result?.subTeams) ? result.subTeams : [];
      console.log("csv",subTeams)
      if (members.length === 0) {
        if (subTeams.length) {
          subTeams.forEach((subTeam) => {
            const subTeamName = typeof subTeam?.name === 'string' ? subTeam.name : '';
            rows.push([ '', '', teamName, subTeamName,'', '', '', '']);
          });
        } else {
          rows.push(['', '',teamName,  '', '', '', '', '']);
        }
      } else {
        function normalizeSubteams(subTeams, max = 5) {
          const names = subTeams.map(st => st.name);
          while (names.length < max) names.push("");
          return names.slice(0, max);
        }
        members.forEach((member) => {
          // const subTeamNames = Array.isArray(member.subTeamNames)
          //   ? member.subTeamNames.slice(0, 5)
          //   : (member.subTeamName ? [member.subTeamName] : []);

          // const normalizedSubTeams = subTeamNames.map((value) =>
          //   typeof value === 'string' ? value : ''
          // );

          // while (normalizedSubTeams.length < 5) {
          //   normalizedSubTeams.push('');
          // }

          const paddedSubteams = normalizeSubteams(subTeams);
          rows.push([member.name, member.email,teamName, ...paddedSubteams, ]);
        });
      }

      // if (index < groupsToExport.length - 1) {
      //   rows.push(['', '', '', '', '', '', '', '']);
      // }
    });

    const escape = (value) => {
      const stringValue = value ?? '';
      const normalized = typeof stringValue === 'string' ? stringValue : String(stringValue);
      const escaped = normalized.replace(/"/g, '""');
      return `"${escaped}"`;
    };

    const csvLines = [
      headers.map(escape).join(','),
      ...rows.map((row) => row.map(escape).join(',')),
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
        await dispatch(updateTeam({ id, teamData: mappedPayload })).unwrap();
      } else {
        await dispatch(createTeam(mappedPayload)).unwrap();
      }

      setShowForm(false);
      setCurrentGroup(null);
      setFormData({
        teamName: '',
        status: '',
      });
      setSelectedGroups([]);
      setSelectAll(false);
      fetchGroupData();
    } catch (submitError) {
      console.error('Failed to submit group form:', submitError);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  const handleSelectAll = (e) => {
    setSelectAll(e.target.checked);
    if (e.target.checked) {
      const allGroupIds = filteredGroups.map(group => group.id);
      setSelectedGroups(allGroupIds);
    } else {
      setSelectedGroups([]);
    }
  };

  const handleSelectGroup = (e, groupId) => {
    if (e.target.checked) {
      setSelectedGroups([...selectedGroups, groupId]);
    } else {
      setSelectedGroups(selectedGroups.filter(id => id !== groupId));
      setSelectAll(false);
    }
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
  // Calculate pagination
  const effectivePageSize = pageSize || 6;
  const totalItems = filteredGroups.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / effectivePageSize));
  const indexOfLastItem = currentPage * effectivePageSize;
  const indexOfFirstItem = indexOfLastItem - effectivePageSize;
  const currentItems = filteredGroups.slice(indexOfFirstItem, indexOfLastItem);

  // Generate page numbers
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }
  if (loading) {
    return <LoadingScreen text={"Loading Groups..."} />
  }

  const handlecreateSubTeam = async (data) => {
    await dispatch(createSubTeam(data.data)).unwrap();
  }
  
  const handleupdateSubTeam = async (id, data) => {
    await dispatch(updateSubTeam({id, subTeamData: data})).unwrap();
  }
  
  const handleDeleteSubTeam = async (id) => {
    try {
      await dispatch(deleteSubTeam(id)).unwrap();
    } catch (error) {
      console.error('Failed to delete subteam:', error);
      alert('Failed to delete subteam. Please try again.');
    }
  }
  return (
    <div className="app-container">
      <div className="main-content">
        <div className="page-content">
          <GroupsFilter
            groups={filteredGroups}
            onFilter={handleFilter}
            handleCreateGroup={handleCreateGroup}
            handleImportGroups={handleImportGroups}
            handleExportGroups={handleExportGroups}
            handleBulkDelete={handleBulkDelete}
            selectedGroups={selectedGroups}
            onClearFilter={handleClearFilter}
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
                          placeholder="Enter or select team name"
                          list="teamSuggestions"
                          value={formData.teamName}
                          onChange={handleInputChange}
                          className="addOrg-form-input"
                          required
                        />

                        <datalist id="teamSuggestions" style={{ width: "100%" }}>
                          {filteredGroups.map((team, index) => (
                            <option key={index} value={team.teamName} />
                          ))}
                        </datalist>
                      </div>
                      <div className="addOrg-form-group">
                        <label className="addOrg-form-label">
                          Status<span className="addOrg-required">*</span>
                        </label>
                        <select
                          name="status"
                          value={formData?.status?.toLowerCase()}
                          onChange={handleInputChange}
                          className="addOrg-form-input"
                          required
                        >
                          <option value="">Select Status</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
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
                    <button onClick={(e )=>handleFormSubmit(e)} className="btn-primary" disabled={loading}>
                      <GoOrganization size={16} />
                      <span>{editMode ? 'Update Team' : 'Create Team'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {loading && !showForm ? (
            <div className="groups-management-loading">
              <div className="groups-management-loading-spinner"></div>
              <p>Loading groups...</p>
            </div>
          ) : (
            <GroupsTable
              groups={currentItems}
              selectedGroups={selectedGroups}
              handleSelectGroup={handleSelectGroup}
              selectAll={selectAll}
              handleSelectAll={handleSelectAll}
              handleEditGroup={handleEditGroup}
              handleDeleteGroup={handleDeleteGroup}
              onTogglePreview={handleTogglePreviewTeam}
              expandedTeamId={expandedTeamId}
              onAddSubTeam={handleAddSubTeamFromTable}
              onShowMembers={handleShowMembers}
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
        </div>
      </div>
    </div>
  );
};

export default GroupsManagement;