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
  const editMode = !!currentGroup;

  useEffect(() => {
    fetchGroupData();
  }, [dispatch, currentPage, pageSize]);

  useEffect(() => {
    const desiredSize = 6;
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
    const effectiveLimit = pageSize || 6;
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
      .map((assignment) => ({
        teamId: resolveIdentifier(assignment?.team_id ?? assignment?.teamId),
        subTeamId: resolveIdentifier(assignment?.sub_team_id ?? assignment?.subTeamId),
      }))
      .filter(({ teamId }) => Boolean(teamId));
  };

  const handleShowMembers = (group) => {
    if (!group) return;
    const teamId = group.id || group._id;
    const fullTeam = Array.isArray(groups)
      ? groups.find((item) => (item._id || item.id) === teamId)
      : group;

    const resolvedTeamId = resolveIdentifier(fullTeam?._id ?? fullTeam?.id ?? teamId);
    const teamDisplayName = fullTeam?.teamName || fullTeam?.name || group.teamName || group.name || '—';

    const directMembers = Array.isArray(fullTeam?.members) ? fullTeam.members : [];
    const subTeamMembers = Array.isArray(fullTeam?.subTeams)
      ? fullTeam.subTeams.flatMap((subTeam) => (Array.isArray(subTeam?.members) ? subTeam.members : []))
      : [];

    const subTeamLookup = new Map(
      (Array.isArray(fullTeam?.subTeams) ? fullTeam.subTeams : [])
        .map((subTeam) => {
          const identifier = resolveIdentifier(subTeam?.uuid ?? subTeam?._id ?? subTeam?.id ?? subTeam);
          return identifier ? [identifier, subTeam] : null;
        })
        .filter(Boolean)
    );

    const memberAccumulator = [];

    const pushMember = (member) => {
      if (!member) return;
      const normalizedName = member.name?.trim?.() || member.fullName || member.email || '—';
      memberAccumulator.push({
        id: member._id || member.id || member.uuid || null,
        name: normalizedName,
        email: member.email || '—',
        teamName: member.teamName || teamDisplayName,
        subTeamName: member.subTeamName || null,
      });
    };

    [...directMembers, ...subTeamMembers].forEach((member) => {
      pushMember({
        ...member,
        teamName: member?.teamName || teamDisplayName,
        subTeamName:
          member?.subTeamName ||
          member?.subTeam?.name ||
          member?.subTeam?.subTeamName ||
          null,
      });
    });

    if (resolvedTeamId) {
      allUsers.forEach((user) => {
        const assignments = deriveUserAssignments(user);
        const matchingAssignment = assignments.find((assignment) => assignment.teamId === resolvedTeamId);
        if (!matchingAssignment) return;

        const nameParts = [user.firstName, user.lastName].filter(Boolean);
        const displayName = user.name || user.fullName || nameParts.join(' ').trim() || user.email || '—';
        const subTeamDisplayName = matchingAssignment.subTeamId
          ? subTeamLookup.get(matchingAssignment.subTeamId)?.name ||
            subTeamLookup.get(matchingAssignment.subTeamId)?.subTeamName ||
            null
          : null;

        pushMember({
          id: user.uuid || user._id || user.id || null,
          name: displayName,
          email: user.email || '—',
          teamName: teamDisplayName,
          subTeamName: subTeamDisplayName,
        });
      });
    }

    const dedupedMembers = [];
    const seenById = new Set();
    const seenByEmailName = new Set();

    memberAccumulator.forEach((member) => {
      if (member.id) {
        if (seenById.has(member.id)) return;
        seenById.add(member.id);
      } else {
        const key = `${member.email}|${member.name}`;
        if (seenByEmailName.has(key)) return;
        seenByEmailName.add(key);
      }
      dedupedMembers.push(member);
    });

    setMembersModalTeam({
      ...(fullTeam || group),
      teamName: teamDisplayName,
    });
    setMembersModalUsers(dedupedMembers);
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

  const handleImportGroups = (event) => {
    const file = event.target.files[0];
    if (file) {
      dispatch(importGroups(file));
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleExportGroups = () => {
    if (!Array.isArray(filteredGroups) || filteredGroups.length === 0) {
      alert('No groups available to export.');
      return;
    }

    const rows = filteredGroups.map((group) => {
      const subTeamNames = group.subTeams
        .map((subTeam) => subTeam.name || subTeam.subTeamName || '')
        .filter(Boolean);

      return {
        Team: group.teamName || '',
        Subteams: subTeamNames.join(', '),
        Members: group.membersCount ?? 0,
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
    const effectiveLimit = pageSize || 6;
    setFilterParams(filters);
    dispatch(setGroupCurrentPage(1));

    dispatch(fetchGroups({
      ...filters,
      page: 1,
      limit: effectiveLimit
    }));
  };

  const handleClearFilter = () => {
    const effectiveLimit = pageSize || 6;
    setFilterParams({});
    dispatch(setGroupCurrentPage(1));

    dispatch(fetchGroups({
      page: 1,
      limit: effectiveLimit
    }));
  };

  const handlePageChange = (newPage) => {
    const effectiveLimit = pageSize || 6;
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
                  />
                );
              }}
              currentPage={currentPage}
              totalPages={totalPages}
              handlePageChange={handlePageChange}
              pageNumbers={pageNumbers}
            />
          )}
          <TeamMembersModal
            isOpen={membersModalOpen}
            onClose={() => setMembersModalOpen(false)}
            team={membersModalTeam}
            members={membersModalUsers}
          />
        </div>
      </div>
    </div>
  );
};

export default GroupsManagement;