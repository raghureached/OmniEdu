import { ChevronDown, Search, Share } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import api from '../../../../services/api';

const GroupsFilter = ({
  groups,
  onFilter,
  handleCreateGroup,
  handleImportGroups,
  handleExportGroups,
  handleBulkDelete,
  selectedGroups,
  onClearFilter,
}) => {
  const [searchName, setSearchName] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkAction, setShowBulkAction] = useState(false);

  // Extract unique values for dynamic filters
  const [statuses, setStatuses] = useState([]);

  useEffect(() => {
    if (groups && groups.length > 0) {
      const uniqueStatuses = [...new Set(groups.map((group) => group.status))].filter(Boolean);
      setStatuses(uniqueStatuses);
    }
  }, [groups]);

  const handleFilter = () => {
    onFilter({
      name: searchName,
      status: selectedStatus !== "All" ? selectedStatus : undefined,
    });
    setShowFilters(false);
  };

  const handleClearFilter = () => {
    setSearchName("");
    setSelectedStatus("All");
    onClearFilter();
    setShowFilters(false);
  };

  return (
    <>
      {/* Controls bar aligned with OrganizationManagement */}
      <div className="controls">
        <div className="roles-search-bar">
        <Search size={16} color="#6b7280" className="search-icon" />
          <input
            type="text"
            placeholder="Search Groups"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
        </div>

        <div className="controls-right">
          <button className="control-btn" onClick={() => setShowFilters((prev) => !prev)}>
            Filter
          </button>
          {/* <button className="control-btn" onClick={handleExportGroups}>
                Export <Share size={16} color="#6b7280" />
              </button> */}

          <button className="control-btn" onClick={() => setShowBulkAction((prev) => !prev)}>
            Bulk Action <ChevronDown size={16} color="#6b7280" />
          </button>

          <button className="btn-primary" onClick={handleCreateGroup}>
            + Add Group
          </button>

          {/* Hidden inputs for Import/Export still available from actions */}
          <input
            type="file"
            id="import-groups"
            style={{ display: "none" }}
            onChange={handleImportGroups}
            accept=".csv,.xlsx,.json"
          />
        </div>
      </div>

      {showFilters && (
        <div className="filter-panel">
          <div className="filter-group">
            <label>Status</label>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="filter-actions">
            <button className="btn-primary" onClick={handleFilter}>
              Apply
            </button>
            <button className="reset-btn" onClick={handleClearFilter}>
              Clear
            </button>
          </div>
        </div>
      )}

      {showBulkAction && (
        <div className="bulk-action-panel">
          <div className="bulk-action-header">
            <label className="bulk-action-title">Items Selected: {selectedGroups.length}</label>
          </div>
          <div className="bulk-action-actions" style={{ display: 'flex', gap: 8 ,flexDirection: 'row'}}>
            {/* <button
              className="bulk-action-btn"
              disabled={selectedGroups.length === 0}
              onClick={handleDeactivateGroups}
            >
              Deactivate
            </button> */}
            <button
              className="bulk-action-delete-btn"
              disabled={selectedGroups.length === 0}
              onClick={handleBulkDelete}
            >
              Delete
            </button>
            <div style={{ display: 'flex', gap: 8 }}>
              {/* <button className="control-btn" onClick={() => document.getElementById('import-groups').click()}>
                Import
              </button> */}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GroupsFilter;