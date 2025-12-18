import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  ChevronDown,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchActivityLogs } from "../../../store/slices/activityLogSlice";
import LoadingScreen from "../../../components/common/Loading/Loading";
import { GoX } from "react-icons/go";
import './GlobalActivityLog.css';
import CustomSelect from "../../../components/dropdown/DropDown";

const GlobalActivityLog = () => {
  const dispatch = useDispatch();
  const { logs, loading, error, pagination } = useSelector((state) => state.activityLog);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [tempFilters, setTempFilters] = useState({
    action: "",
    role: "",
    date: ""
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Debug logging
  // console.log('Current state:', { logs, loading, error, pagination });

  useEffect(() => {
    fetchLogsData();
  }, [currentPage]); // Only fetch on page change, not on filter changes

  const fetchLogsData = () => {
    const queryParams = {
      page: currentPage,
      limit: 8,
    };

    // console.log('Fetching logs with params:', queryParams);
    dispatch(fetchActivityLogs(queryParams));
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleFilterChange = (filterName, value) => {
    setTempFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleApplyFilters = () => {
    console.log('Applying filters:', tempFilters);
    setActionFilter(tempFilters.action);
    setRoleFilter(tempFilters.role);
    setDateFilter(tempFilters.date);
    setCurrentPage(1);
    setShowFilters(false);
  };

  const resetFilters = () => {
    setTempFilters({
      action: "",
      role: "",
      date: ""
    });
    setActionFilter("");
    setRoleFilter("");
    setDateFilter("");
    setSearch("");
    setCurrentPage(1);
    setShowFilters(false);
  };

  const handleOpenFilters = () => {
    setTempFilters({
      action: actionFilter,
      role: roleFilter,
      date: dateFilter
    });
    setShowFilters(true);
  };

  // Client-side filtering logic
  const filteredLogs = logs?.filter(log => {
    // Search filter
    const matchesSearch = !search.trim() || 
      log.action?.toLowerCase().includes(search.toLowerCase()) ||
      log.details?.toLowerCase().includes(search.toLowerCase()) ||
      log.userName?.toLowerCase().includes(search.toLowerCase())
      // log.user?.email?.toLowerCase().includes(search.toLowerCase());

    // Action filter
    const matchesAction = !actionFilter || actionFilter === 'all' || log.action === actionFilter;

    // Role filter
    const matchesRole = !roleFilter || roleFilter === 'all' || log.user?.role === roleFilter;

    // Date filter
    let matchesDate = true;
    if (dateFilter) {
      // Skip if createdAt is missing or invalid
      if (!log.createdAt) {
        matchesDate = false;
      } else {
        try {
          const logDate = new Date(log.createdAt);
          // Check if date is valid
          if (isNaN(logDate.getTime())) {
            matchesDate = false; // Invalid date, exclude from results
          } else {
            const formattedLogDate = logDate.toISOString().split('T')[0];
            matchesDate = formattedLogDate === dateFilter;
          }
        } catch (error) {
          matchesDate = false; // Error parsing date, exclude from results
        }
      }
    }

    return matchesSearch && matchesAction && matchesRole && matchesDate;
  }) || [];

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <>
      {loading && <LoadingScreen text="Loading Activity Logs..." />}
      {error && (
        <div style={{ 
          padding: '16px', 
          backgroundColor: '#fef2f2', 
          color: '#dc2626', 
          margin: '16px 32px', 
          borderRadius: '8px',
          border: '1px solid #fecaca'
        }}>
          Error: {error}
        </div>
      )}
      <div className="act-log-app-container">
        {/* Main Content */}
        <div className="act-log-main-content">
          {/* Page Content */}
          <div className="act-log-page-content">
            {/* Controls */}
            <div className="act-log-controls">
              <div className="act-log-roles-search-bar">
                <Search size={16} color="#6b7280" className="act-log-search-icon" />
                <input
                  type="text"
                  placeholder="Search"
                  className="act-log-search-input"
                  value={search}
                  onChange={handleSearch}
                />
              </div>

              <div className="act-log-controls-right">
                <button className="btn-secondary" onClick={handleOpenFilters}>
                  <Filter size={16} />
                  Filter
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="act-log-filter-panel">
                <span 
                  style={{ cursor: "pointer", position: "absolute", right: "10px", top: "10px"}} 
                  onClick={() => setShowFilters(false)}
                >
                  <GoX size={20} color="#6b7280" />
                </span>
                
                <div className="act-log-filter-group">
                  <label>Action</label>
                  <CustomSelect
                    className="act-log-filter-select"
                    value={tempFilters.action || actionFilter}
                    onChange={(value) => handleFilterChange('action', value)}
                    options={[
                      { value: "", label: "All" },
                      { value: "Create", label: "Create" },
                      { value: "Update", label: "Update" },
                      { value: "Delete", label: "Delete" }
                    ]}
                    placeholder="Select action"
                  />
                </div>

                <div className="act-log-filter-group">
                  <label>Role</label>
                  <CustomSelect
                    value={tempFilters.role || roleFilter}
                    onChange={(value) => handleFilterChange('role', value)}
                    options={[
                      { value: "", label: "All" },
                      { value: "Administrator", label: "Admin" },
                      { value: "General User", label: "User" }
                    ]}
                    placeholder="Select role"
                  />
                </div>

                <div className="act-log-filter-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={tempFilters.date || dateFilter}
                    onChange={(e) => handleFilterChange('date', e.target.value)}
                  />
                </div>

                <div className="act-log-filter-actions"> 
                  <button className="btn-secondary" onClick={resetFilters} style={{ padding: '6px 12px', fontSize: '14px' }}>
                    Clear
                  </button>
                  <button className="btn-primary" onClick={handleApplyFilters} style={{ padding: '6px 12px', fontSize: '14px' }}>
                    Apply
                  </button>
                </div>
              </div>
            )}

            <>
              <div className="act-log-table-container">
                <div className="act-log-table-header">
                  <div>Action</div>
                  <div>Details</div>
                  <div>User</div>
                  <div>Role</div>
                  <div>IP Address</div>
                  <div>Date</div>
                  <div>Time</div>
                </div>

                {filteredLogs.length === 0 && !loading ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '48px', 
                    color: '#6b7280',
                    fontSize: '16px'
                  }}>
                    No activity logs found
                  </div>
                ) : (
                  filteredLogs.map((log) => (
                    <div key={log.id} className="act-log-table-row">
                      <div className="act-log-action-cell">
                        <span className={`act-log-action-badge ${log.status}`}>
                          {log.action}
                        </span>
                      </div>
                      
                      <div className="act-log-details-cell">
                        <div className="act-log-details-text">
                          {log.details}
                        </div>
                      </div>
                      
                      <div className="act-log-user-cell">
                        <div className="act-log-user-avatar" style={{ backgroundColor: "#FFC107" }}>
                          {log.userName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="act-log-user-info">
                          <div className="act-log-user-name">{log.userName}</div>
                        </div>
                      </div>

                      <div className="act-log-role-cell">
                        <span className={`users-role-badge ${log.userRole?.toLowerCase()}`}>
                          {log.userRole}
                        </span>
                      </div>

                      <div className="act-log-ip-cell">
                        <span className="act-log-ip-badge">
                          {log.ip}
                        </span>
                      </div>

                      <div className="act-log-date-cell">
                        {log.date}
                      </div>

                      <div className="act-log-time-cell">
                        {log.time}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="act-log-pagination" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button
                      type="button"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                      style={{ padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: 6, background: '#fff', color: '#0f172a', cursor: currentPage <= 1 ? 'not-allowed' : 'pointer' }}
                    >
                      Prev
                    </button>
                    <span style={{ color: '#0f172a' }}>
                      {`Page ${currentPage} of ${Math.max(1, pagination.totalPages)}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= pagination.totalPages}
                      style={{ padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: 6, background: '#fff', color: '#0f172a', cursor: currentPage >= pagination.totalPages ? 'not-allowed' : 'pointer' }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          </div>
        </div>
      </div>
    </>
  );
};

export default GlobalActivityLog;
