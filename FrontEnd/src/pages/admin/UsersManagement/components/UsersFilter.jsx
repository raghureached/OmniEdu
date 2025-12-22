import React, { useEffect, useState } from 'react';
import CustomSelect from '../../../../components/dropdown/DropDown';

const UsersFilter = ({ 
  users, 
  onFilter, 
  handleCreateUser, 
  handleImportUsers, 
  handleExportUsers, 
  handleBulkDelete, 
  handleBulkEditGroup, 
  selectedUsers,
  onClearFilter // Add this new prop
}) => {
  const [searchName, setSearchName] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('All');
  const [selectedSubTeam, setSelectedSubTeam] = useState('All');
  const [customSearch, setCustomSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  
  // Extract unique values for dynamic filters
  const [teams, setTeams] = useState([]);
  const [subTeams, setSubTeams] = useState([]);
  const [statuses, setStatuses] = useState([]);
  
  // Generate dynamic filter options based on available data
  useEffect(() => {
    if (users && users.length > 0) {
      // Extract unique teams
      const uniqueTeams = [...new Set(users.map(user => user.team))].filter(Boolean);
      setTeams(uniqueTeams);
      
      // Extract unique subTeams
      const uniqueSubTeams = [...new Set(users.map(user => user.subTeam))].filter(Boolean);
      setSubTeams(uniqueSubTeams);
      
      // Extract unique statuses
      const uniqueStatuses = [...new Set(users.map(user => user.status))].filter(Boolean);
      setStatuses(uniqueStatuses);
    }
  }, [users]);
  
  const handleFilter = () => {
    onFilter({
      name: searchName,
      email: searchEmail,
      team: selectedTeam !== 'All' ? selectedTeam : undefined,
      subTeam: selectedSubTeam !== 'All' ? selectedSubTeam : undefined,
      custom: customSearch,
      status: selectedStatus !== 'All' ? selectedStatus : undefined
    });
  };
  
  // Add clear filter function
  const handleClearFilter = () => {
    // Reset all filter states
    setSearchName('');
    setSearchEmail('');
    setSelectedTeam('All');
    setSelectedSubTeam('All');
    setCustomSearch('');
    setSelectedStatus('All');
    
    // Call the parent's clear filter function
    onClearFilter();
  };
  
  return (
    <div className="users_management-filter-section">
      <div className="users_management-filter-row">
        <div className="users_management-search-box">
          <label>Name:</label>
          <input
            type="text"
            placeholder="Search by name..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
        </div>
        
        <div className="users_management-search-box">
          <label>Email:</label>
          <input
            type="text"
            placeholder="Search by email..."
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
          />
        </div>
        
        <div className="users_management-search-box">
          <label>Team:</label>
          <CustomSelect
            value={selectedTeam}
            options={[
              { value: "All", label: "All" },
              ...(teams.map(team => ({ value: team, label: team })) || [])
            ]}
            onChange={(value) => setSelectedTeam(value)}
            placeholder="Select Team"
          />
        </div>
        
        <div className="users_management-search-box">
          <label>Sub Team:</label>
          <CustomSelect
            value={selectedSubTeam}
            options={[
              { value: "All", label: "All" },
              ...(subTeams.map(subTeam => ({ value: subTeam, label: subTeam })) || [])
            ]}
            onChange={(value) => setSelectedSubTeam(value)}
            placeholder="Select Sub Team"
          />
        </div>
        
        <div className="users_management-search-box">
          <label>Custom 1:</label>
          <input
            type="text"
            placeholder="Type to search..."
            value={customSearch}
            onChange={(e) => setCustomSearch(e.target.value)}
          />
        </div>
        
        <div className="users_management-search-box">
          <label>Status:</label>
          <CustomSelect
            value={selectedStatus}
            options={[
              { value: "All", label: "All" },
              ...(statuses.map(status => ({ value: status, label: status })) || [])
            ]}
            onChange={(value) => setSelectedStatus(value)}
            placeholder="Select Status"
            searchable={false}
          />
        </div>
        
        <div className="users_management-filter-actions">
          <button className="users_management-btn-filter" onClick={handleFilter}>Filter</button>
          <button className="users_management-btn-clear-filter" onClick={handleClearFilter}>Clear Filter</button>
        </div>
      </div>
      <div className="users_management-action-buttons">
        <button className="users_management-btn-add" onClick={handleCreateUser}>
          <span className="users_management-btn-icon">+</span> Add User
        </button>
        <input 
          type="file" 
          id="import-users" 
          style={{ display: 'none' }} 
          onChange={handleImportUsers} 
          accept=".csv,.xlsx"
        />
        <button className="users_management-btn-import" onClick={() => document.getElementById('import-users').click()}>
          <span className="users_management-btn-icon">↑</span> Import Users
        </button>
        <button className="users_management-btn-export" onClick={handleExportUsers} disabled={selectedUsers.length === 0}>
          <span className="users_management-btn-icon">↓</span> Export Users & Groups
        </button>
        <button 
          className="users_management-btn-delete-selected" 
          onClick={handleBulkDelete} 
          disabled={selectedUsers.length === 0}
        >
          <span className="users_management-btn-icon">×</span> Bulk Delete
        </button>
        <button 
          className="users_management-btn-edit-group" 
          onClick={handleBulkEditGroup} 
          disabled={selectedUsers.length === 0}
        >
          <span className="users_management-btn-icon">✎</span> Bulk Edit Group
        </button>
      </div>
    </div>
  );
};

export default UsersFilter;