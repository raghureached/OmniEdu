import React, { useState, useEffect, useMemo } from 'react';
import { GoOrganization, GoX } from 'react-icons/go';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  importGroups,
  setGroupFilters,
  setGroupCurrentPage,
  setGroupPageSize
} from '../../../store/slices/groupSlice';
import AdminForm from '../../../components/common/AdminForm/AdminForm';
import GroupsTable from './components/GroupsTable';
import GroupsFilter from './components/GroupsFilter';
// Reuse OrganizationManagement styles for consistent look & feel
import '../../globalAdmin/OrganizationManagement/OrganizationManagement.css';
import LoadingScreen from '../../../components/common/Loading/Loading';

const GroupsManagement = () => {
  const dispatch = useDispatch();
  const { groups, loading, error, totalCount, currentPage, pageSize } = useSelector((state) => state.groups);
  const [showForm, setShowForm] = useState(false);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [filterParams, setFilterParams] = useState({});
  const [formData, setFormData] = useState({});
  const editMode = !!currentGroup;

  useEffect(() => {
    fetchGroupData();
  }, [dispatch, currentPage, pageSize]);

  // Prefill form data when editing, or reset when creating
  useEffect(() => {
    if (showForm) {
      if (currentGroup) {
        setFormData({
          teamName: currentGroup.teamName || currentGroup.name || '',
          teamDescription: currentGroup.teamDescription || currentGroup.description || '',
          subTeamName: currentGroup.subTeamName || '',
          subTeamDescription: currentGroup.subTeamDescription || ''
        });
      } else {
        setFormData({
          teamName: '',
          teamDescription: '',
          subTeamName: '',
          subTeamDescription: ''
        });
      }
    }
  }, [showForm, currentGroup]);

  const fetchGroupData = () => {
    dispatch(fetchGroups({
      ...filterParams,
      page: currentPage,
      limit: pageSize
    })).catch(error => {
      console.error('Error fetching groups:', error);
    });
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
    const jsonData = JSON.stringify(groups);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'groups.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const mappedPayload = {
      teamName: formData.teamName?.trim() || '',
      subTeamName: formData.subTeamName?.trim() || '',
      teamDescription: formData.teamDescription?.trim() || '',
      subTeamDescription: formData.subTeamDescription?.trim() || '',
      description: formData.teamDescription?.trim() || '',
    };

    try {
      if (currentGroup) {
        const id = currentGroup.id || currentGroup._id;
        if (!id) {
          throw new Error('Unable to determine group identifier for update.');
        }
        await dispatch(updateGroup({ id, groupData: mappedPayload })).unwrap();
      } else {
        await dispatch(createGroup(mappedPayload)).unwrap();
      }

      setShowForm(false);
      setCurrentGroup(null);
      setFormData({
        teamName: '',
        teamDescription: '',
        subTeamName: '',
        subTeamDescription: '',
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
    setFilterParams(filters);
    dispatch(setGroupCurrentPage(1));

    dispatch(fetchGroups({
      ...filters,
      page: 1,
      limit: pageSize
    }));
  };

  const handleClearFilter = () => {
    setFilterParams({});
    dispatch(setGroupCurrentPage(1));

    dispatch(fetchGroups({
      page: 1,
      limit: pageSize
    }));
  };

  const handlePageChange = (newPage) => {
    dispatch(setGroupCurrentPage(newPage));
  }

  const normalizedGroups = useMemo(() => {
    if (!Array.isArray(groups)) {
      return [];
    }

    return groups.map((team) => {
      const subTeamsArray = Array.isArray(team.subTeams) ? team.subTeams : [];
      const primarySubTeam = subTeamsArray[0] || {};

      return {
        id: team.id || team._id,
        teamName: team.teamName || team.name || '',
        teamDescription: team.teamDescription || team.description || '',
        subTeamName: team.subTeamName || primarySubTeam.name || '—',
        subTeamDescription: team.subTeamDescription || primarySubTeam.description || '',
        membersCount: typeof team.membersCount === 'number'
          ? team.membersCount
          : subTeamsArray.length,
        status: team.status || primarySubTeam.status || 'inactive',
      };
    });
  }, [groups]);

  const filteredGroups = normalizedGroups.filter(group => {
    const nameMatch = filterParams.name
      ? group.teamName?.toLowerCase().includes(filterParams.name.toLowerCase())
      : true;
    const statusMatch = filterParams.status ? group.status === filterParams.status : true;

    return nameMatch && statusMatch;
  });

  // Calculate pagination
  const totalItems = filteredGroups.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const indexOfLastItem = currentPage * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentItems = filteredGroups.slice(indexOfFirstItem, indexOfLastItem);

  // Generate page numbers
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }
  if(loading){
    return <LoadingScreen text={"Loading Groups..."}/>
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
                    <GoOrganization size={24} color="#5570f1" />
                  </div>
                  <div>
                    <h2>{editMode ? "Edit Group" : "Add New Group"}</h2>
                    <p className="addOrg-header-subtitle">
                      {editMode ? "Update group details" : "Create a new group profile"}
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
                <form onSubmit={handleFormSubmit} className="addOrg-org-form">
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
                      </div>
                       <div className="addOrg-form-group">
                        <label className="addOrg-form-label">
                          SubTeam Name<span className="addOrg-required">*</span>
                        </label>
                        <input
                          type="text"
                          name="subTeamName"
                          placeholder="Enter subteam name"
                          value={formData.subTeamName}
                          onChange={handleInputChange}
                          className="addOrg-form-input"
                          required
                        />
                      </div>
                      <div className="addOrg-form-group">
                        <label className="addOrg-form-label">
                          Team Description<span className="addOrg-required">*</span>
                        </label>
                        <textarea
                          name="teamDescription"
                          placeholder="Enter team description"
                          value={formData.teamDescription}
                          onChange={handleInputChange}
                          className="addOrg-form-input"
                          required
                        />
                      </div>

                     
                      <div className="addOrg-form-group">
                        <label className="addOrg-form-label">
                          SubTeam Description<span className="addOrg-required">*</span>
                        </label>
                        <textarea
                          name="subTeamDescription"
                          placeholder="Enter subteam description"
                          value={formData.subTeamDescription}
                          onChange={handleInputChange}
                          className="addOrg-form-input"
                          required
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
                    <button type="submit" className="btn-primary" disabled={loading}>
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
              currentPage={currentPage}
              totalPages={totalPages}
              handlePageChange={handlePageChange}
              pageNumbers={pageNumbers}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupsManagement;