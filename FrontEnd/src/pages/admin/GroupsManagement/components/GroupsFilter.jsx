import { ChevronDown, Import, Search, Share, Filter } from 'lucide-react';
import { GoX } from 'react-icons/go';
import { RiDeleteBinFill } from 'react-icons/ri';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import api from '../../../../services/api';
import CustomSelect from '../../../../components/dropdown/DropDown';

const GroupsFilter = ({
  groups,
  onLocalFilter,     // NEW
  onBackendFilter,   // NEW
  onFilter,
  handleCreateGroup,
  handleImportGroups,
  handleExportGroups,
  handleBulkDelete,
  handleBulkDeactivate,
  selectedGroups = [],
  onClearFilter,
}) => {
  const [searchName, setSearchName] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkAction, setShowBulkAction] = useState(false);
  const filterButtonRef = useRef(null);
  const bulkButtonRef = useRef(null);
  const filterPanelRef = useRef(null);
  const bulkPanelRef = useRef(null);
  const bulkOpenedAutomaticallyRef = useRef(false);
  const [filterPanelStyle, setFilterPanelStyle] = useState({ top: 0, left: 0 });
  const [bulkPanelStyle, setBulkPanelStyle] = useState({ top: 0, left: 0 });

  const updateFilterPanelPosition = useCallback(() => {
    const button = filterButtonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const offset = 8;
    setFilterPanelStyle({
      top: rect.bottom + offset,
      left: rect.left,
    });
  }, []);

  const updateBulkPanelPosition = useCallback(() => {
    const button = bulkButtonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const offset = 8;
    setBulkPanelStyle({
      top: rect.bottom + offset,
      left: rect.left,
    });
  }, []);

  // Extract unique values for dynamic filters
  const [statuses, setStatuses] = useState([]);

  useEffect(() => {
    if (groups && groups.length > 0) {
      const uniqueStatuses = [...new Set(groups.map((group) => group.status))].filter(Boolean);
      setStatuses(uniqueStatuses);
    }
  }, [groups]);

  useEffect(() => {
    const hasSelection = Array.isArray(selectedGroups) && selectedGroups.length > 0;

    if (hasSelection) {
      bulkOpenedAutomaticallyRef.current = true;
      // setShowBulkAction(true);
      setShowFilters(false);
      updateBulkPanelPosition();
    } else if (bulkOpenedAutomaticallyRef.current) {
      bulkOpenedAutomaticallyRef.current = false;
      setShowBulkAction(false);
    }
  }, [selectedGroups, updateBulkPanelPosition]);

  useEffect(() => {
    if (showFilters) {
      updateFilterPanelPosition();
    }
  }, [showFilters, updateFilterPanelPosition]);

  useEffect(() => {
    if (showBulkAction) {
      updateBulkPanelPosition();
    }
  }, [showBulkAction, updateBulkPanelPosition]);

  useEffect(() => {
    if (!showFilters && !showBulkAction) {
      return undefined;
    }

    const handleWindowChange = () => {
      if (showFilters) {
        updateFilterPanelPosition();
      }
      if (showBulkAction) {
        updateBulkPanelPosition();
      }
    };

    window.addEventListener('scroll', handleWindowChange, true);
    window.addEventListener('resize', handleWindowChange);

    return () => {
      window.removeEventListener('scroll', handleWindowChange, true);
      window.removeEventListener('resize', handleWindowChange);
    };
  }, [showFilters, showBulkAction, updateFilterPanelPosition, updateBulkPanelPosition]);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      const filterBtn = filterButtonRef.current;
      const bulkBtn = bulkButtonRef.current;
      const filterPanel = filterPanelRef.current;
      const bulkPanel = bulkPanelRef.current;

      if (
        (showFilters || showBulkAction) &&
        !(
          (filterPanel && filterPanel.contains(target)) ||
          (bulkPanel && bulkPanel.contains(target)) ||
          (filterBtn && filterBtn.contains(target)) ||
          (bulkBtn && bulkBtn.contains(target))
        )
      ) {
        setShowFilters(false);
        setShowBulkAction(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilters, showBulkAction]);

  // Combined Search Handler
  const debounceRef = useRef(null);

  const handleSearch = (value) => {
    setSearchName(value);

    // --- 1) Frontend instant filter ---
    onLocalFilter({
      name: value,
      status: selectedStatus !== 'All' ? selectedStatus : undefined,
    });

    // --- 2) Backend debounced filter ---
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      onBackendFilter({
        name: value.trim(),
        status: selectedStatus !== 'All' ? selectedStatus : undefined,
        silent: true,   // 🔥 only search uses silent mode
      });
    }, 500); // 500ms debounce recommended
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
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <div className="controls-right">
          <button
            ref={filterButtonRef}
            className="control-btn"
            onClick={() => {
              setShowFilters(prev => {
                const next = !prev;
                if (next) {
                  setShowBulkAction(false);
                  updateFilterPanelPosition();
                }
                return next;
              });
            }}
          >
            <Filter size={16} />
            Filter
          </button>
          <button
            className="control-btn"
            onClick={() => document.getElementById('import-groups')?.click()}
          >
            Import <Import size={16} color="#6b7280" />
          </button>
          <button
            className="control-btn"
            onClick={() => {
              if (!Array.isArray(selectedGroups) || selectedGroups.length === 0) {
                return;
              }
              handleExportGroups();
            }}
            disabled={!Array.isArray(selectedGroups) || selectedGroups.length === 0}
            title={Array.isArray(selectedGroups) && selectedGroups.length === 0 ? 'Select at least one team to export' : undefined}
          >
            Export <Share size={16} color="#6b7280" />
          </button>

          <button
            ref={bulkButtonRef}
            className="control-btn"
            onClick={() => {
              setShowBulkAction(prev => {
                const next = !prev;
                if (next) {
                  setShowFilters(false);
                  bulkOpenedAutomaticallyRef.current = false;
                  updateBulkPanelPosition();
                }
                return next;
              });
            }}
          >
            Bulk Action <ChevronDown size={16} color="#6b7280" />
          </button>

          <button className="btn-primary" onClick={handleCreateGroup}>
            + Add Team
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
        <div
          ref={filterPanelRef}
          className="groups-filter-panel"
          style={{ position: 'absolute', top: filterPanelStyle.top, left: filterPanelStyle.left }}
        >
          <div className="filter-group">
            <div style={{ fontSize: "15px", fontWeight: "600", color: "#26334d" }}>  <label>Status</label></div>

            <CustomSelect
              value={selectedStatus}
              options={[
                { value: "All", label: "All" },
                { value: "Active", label: "Active" },
                { value: "Inactive", label: "Inactive" }
              ]}
              onChange={(value) => setSelectedStatus(value)}
              placeholder="Select Status"
              searchable={false}
            />
          </div>
          <div className="filter-actions">
            <button className="btn-secondary" onClick={handleClearFilter} style={{ padding: '6px 12px', fontSize: '14px' }}>
              Clear
            </button>
            <button className="btn-primary" onClick={handleFilter} style={{ padding: '6px 12px', fontSize: '14px' }}>
              Apply
            </button>

          </div>
        </div>
      )}

      {showBulkAction && (
        <div
          ref={bulkPanelRef}
          className="bulk-action-panel"
          style={{ position: 'absolute', top: bulkPanelStyle.top, left: bulkPanelStyle.left, padding: "15px" }}
        >
          <div className="bulk-action-header">
            <label className="bulk-action-title">Items Selected: {selectedGroups.length}</label>
          </div>

          <div className="bulk-action-actions" style={{ display: 'flex', gap: 8, flexDirection: 'row', alignItems: 'center' }}>
            {/* <button
              className="btn-primary"
              disabled={selectedGroups.length === 0}
              onClick={handleBulkDeactivate} style={{ backgroundColor: '#9e9e9e' }}
            >
              Deactivate
            </button> */}
            <button
               className="btn-primary"
              //  disabled={group.status === "Inactive"}
              disabled={selectedGroups.length === 0 || groups.status === "Inactive"}
              onClick={handleBulkDeactivate} style={{ backgroundColor: '#9e9e9e' }}
            >
              Deactivate
            </button>

            <button
              className="btn-primary"
              style={{ background: "red" }}
              disabled={selectedGroups.length === 0}
              onClick={handleBulkDelete}
            >
              <RiDeleteBinFill size={16} color="white" />
              <span>Delete</span>
            </button>

          </div>
        </div>
      )}
    </>
  );
};

export default GroupsFilter;