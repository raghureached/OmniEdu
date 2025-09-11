import React, { useEffect, useState } from 'react';

const GroupsFilter = ({ 
  groups, 
  onFilter, 
  handleCreateGroup, 
  handleImportGroups, 
  handleExportGroups, 
  handleBulkDelete, 
  selectedGroups,
  onClearFilter
}) => {
  const [searchName, setSearchName] = useState('');
  const [searchDescription, setSearchDescription] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  
  // Extract unique values for dynamic filters
  const [statuses, setStatuses] = useState([]);
  
  // Generate dynamic filter options based on available data
  useEffect(() => {
    if (groups && groups.length > 0) {
      // Extract unique statuses
      const uniqueStatuses = [...new Set(groups.map(group => group.status))].filter(Boolean);
      setStatuses(uniqueStatuses);
    }
  }, [groups]);
  
  const handleFilter = () => {
    onFilter({
      name: searchName,
      description: searchDescription,
      status: selectedStatus !== 'All' ? selectedStatus : undefined
    });
  };
  
  // Clear filter function
  const handleClearFilter = () => {
    // Reset all filter states
    setSearchName('');
    setSearchDescription('');
    setSelectedStatus('All');
    
    // Call the parent's clear filter function
    onClearFilter();
  };
  
  return (
    <div className="groups-management-filter-section">
      <div className="groups-management-filter-row">
        <div className="groups-management-search-box">
          <label>Name:</label>
          <input
            type="text"
            placeholder="Search by name..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
        </div>
        
        <div className="groups-management-search-box">
          <label>Description:</label>
          <input
            type="text"
            placeholder="Search by description..."
            value={searchDescription}
            onChange={(e) => setSearchDescription(e.target.value)}
          />
        </div>
        
        <div className="groups-management-search-box">
          <label>Status:</label>
          <select 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="All">All</option>
            {statuses.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        <div className="groups-management-filter-actions">
          <button className="groups-management-btn-filter" onClick={handleFilter}>Filter</button>
          <button className="groups-management-btn-clear-filter" onClick={handleClearFilter}>Clear Filter</button>
        </div>
      </div>
      <div className="groups-management-action-buttons">
        <button className="groups-management-btn-add" onClick={handleCreateGroup}>
          <span className="groups-management-btn-icon">+</span> Add Group
        </button>
        <input 
          type="file" 
          id="import-groups" 
          style={{ display: 'none' }} 
          onChange={handleImportGroups} 
          accept=".csv,.xlsx,.json"
        />
        <button className="groups-management-btn-import" onClick={() => document.getElementById('import-groups').click()}>
          <span className="groups-management-btn-icon">↑</span> Import Groups
        </button>
        <button className="groups-management-btn-export" onClick={handleExportGroups}>
          <span className="groups-management-btn-icon">↓</span> Export Groups
        </button>
        <button 
          className="groups-management-btn-delete-selected" 
          onClick={handleBulkDelete} 
          disabled={selectedGroups.length === 0}
        >
          <span className="groups-management-btn-icon">×</span> Bulk Delete
        </button>
      </div>
    </div>
  );
};

export default GroupsFilter;