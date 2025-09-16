import React, { useState, useEffect } from 'react';
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
import './GroupsManagement.css';

const GroupsManagement = () => {
  const dispatch = useDispatch();
  const { groups, loading, error, totalCount, currentPage, pageSize } = useSelector((state) => state.groups);
  const [showForm, setShowForm] = useState(false);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [filterParams, setFilterParams] = useState({});
  
  // Add local groups state to handle dummy data and immediate updates
  const [localGroups, setLocalGroups] = useState([
    {
      id: 'dummy1',
      name: 'Administrators',
      description: 'Full system access and control',
      status: 'active',
      membersCount: 5,
      permissions: 'admin'
    },
    {
      id: 'dummy2',
      name: 'Content Editors',
      description: 'Can create and edit content',
      status: 'active',
      membersCount: 12,
      permissions: 'write'
    },
    {
      id: 'dummy3',
      name: 'Viewers',
      description: 'Read-only access to content',
      status: 'active',
      membersCount: 28,
      permissions: 'read'
    },
    {
      id: 'dummy4',
      name: 'Guest Users',
      description: 'Limited access to public content',
      status: 'inactive',
      membersCount: 7,
      permissions: 'read'
    },
    {
      id: 'dummy5',
      name: 'Moderators',
      description: 'Can moderate user content',
      status: 'active',
      membersCount: 3,
      permissions: 'write'
    }
  ]);
  
  useEffect(() => {
    fetchGroupData();
  }, [dispatch, currentPage, pageSize]);
  
  // Update localGroups when groups from Redux store changes
  useEffect(() => {
    if (groups && groups.length > 0) {
      setLocalGroups(groups);
    }
  }, [groups]);
  
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
      // Also remove from local state for immediate UI update
      setLocalGroups(localGroups.filter(group => group.id !== groupId));
    }
  };
  
  const handleBulkDelete = () => {
    if (selectedGroups.length === 0) {
      alert('Please select at least one group to delete');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete ${selectedGroups.length} groups?`)) {
      // Implement bulk delete functionality
      selectedGroups.forEach(groupId => {
        dispatch(deleteGroup(groupId));
      });
      // Also remove from local state for immediate UI update
      setLocalGroups(localGroups.filter(group => !selectedGroups.includes(group.id)));
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
  
  const handleExportGroups = () => {
    // Implement export functionality
    const jsonData = JSON.stringify(localGroups);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'groups.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  const handleFormSubmit = (formData) => {
    if (currentGroup) {
      dispatch(updateGroup({ id: currentGroup.id, groupData: formData }));
      // Update in local state for immediate UI update
      setLocalGroups(localGroups.map(group => 
        group.id === currentGroup.id ? { ...group, ...formData } : group
      ));
    } else {
      // Generate a temporary ID for immediate display
      const tempId = 'temp_' + Date.now();
      const newGroup = {
        id: tempId,
        ...formData,
        membersCount: 0 // New groups start with 0 members
      };
      
      // Add to local state for immediate UI update
      setLocalGroups([...localGroups, newGroup]);
      
      // Dispatch to Redux/API
      dispatch(createGroup(formData));
    }
    setShowForm(false);
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
    dispatch(setGroupCurrentPage(1)); // Reset to first page when filtering
    
    // Apply filters
    dispatch(fetchGroups({
      ...filters,
      page: 1,
      limit: pageSize
    }));
  };
  
  const handleClearFilter = () => {
    // Reset filter parameters
    setFilterParams({});
    dispatch(setGroupCurrentPage(1));
    
    // Fetch all groups without filters
    dispatch(fetchGroups({
      page: 1,
      limit: pageSize
    }));
  };
  
  const handlePageChange = (newPage) => {
    dispatch(setGroupCurrentPage(newPage));
  };
  
  // Define form fields
  const groupFormFields = [
    { name: 'name', label: 'Group Name', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'textarea', required: false },
    { name: 'status', label: 'Status', type: 'select', required: true, options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ]},
    { name: 'permissions', label: 'Permissions', type: 'select', required: true, options: [
      { value: 'read', label: 'Read Only' },
      { value: 'write', label: 'Read & Write' },
      { value: 'admin', label: 'Admin' }
    ]}
  ];
  
  // Filter groups based on search criteria
  const filteredGroups = localGroups.filter(group => {
    const nameMatch = filterParams.name ? group.name?.toLowerCase().includes(filterParams.name.toLowerCase()) : true;
    const descriptionMatch = filterParams.description ? group.description?.toLowerCase().includes(filterParams.description.toLowerCase()) : true;
    const statusMatch = filterParams.status ? group.status === filterParams.status : true;
    
    return nameMatch && descriptionMatch && statusMatch;
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
  
  return (
    <div className="groups-management">
      
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
        <div className="groups-management-form-overlay">
          <AdminForm
            title={currentGroup ? 'Edit Group' : 'Add New Group'}
            fields={groupFormFields}
            initialValues={currentGroup || {}}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            isLoading={loading}
          />
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
  );
};

export default GroupsManagement;