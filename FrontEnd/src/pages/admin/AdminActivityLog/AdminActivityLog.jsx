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
import './AdminActivityLog.css';

const AdminActivityLog = () => {
  const dispatch = useDispatch();
  const { logs, loading, error, pagination } = useSelector((state) => state.activityLog);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Debug logging
  console.log('Current state:', { logs, loading, error, pagination });

  useEffect(() => {
    fetchLogsData();
  }, [currentPage, actionFilter, roleFilter, dateFilter, search]);

  const fetchLogsData = () => {
    const queryParams = {
      page: currentPage,
      limit: 8,
    };

    if (search.trim()) {
      queryParams.search = search.trim();
    }
    if (actionFilter && actionFilter !== 'all') {
      queryParams.action = actionFilter;
    }
    if (roleFilter && roleFilter !== 'all') {
      queryParams.userRole = roleFilter;
    }
    if (dateFilter && dateFilter !== 'all') {
      queryParams.date = dateFilter;
    }

    console.log('Fetching logs with params:', queryParams);
    dispatch(fetchActivityLogs(queryParams));
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleFilterChange = (filterName, value) => {
    switch(filterName) {
      case 'action':
        setActionFilter(value);
        break;
      case 'role':
        setRoleFilter(value);
        break;
      case 'date':
        setDateFilter(value);
        break;
      default:
        break;
    }
    setCurrentPage(1); // Reset to first page when filters change
    setShowFilters(false);
  };

  const resetFilters = () => {
    setActionFilter("");
    setRoleFilter("");
    setDateFilter("");
    setSearch("");
    setCurrentPage(1);
  };

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
      <div className="ad-act-log-app-container">
        {/* Main Content */}
        <div className="ad-act-log-main-content">
          {/* Page Content */}
          <div className="ad-act-log-page-content">
            {/* Controls */}
            <div className="ad-act-log-controls">
              <div className="ad-act-log-roles-search-bar">
                <Search size={16} color="#6b7280" className="ad-act-log-search-icon" />
                <input
                  type="text"
                  placeholder="Search"
                  className="ad-act-log-search-input"
                  value={search}
                  onChange={handleSearch}
                />
              </div>

              <div className="ad-act-log-controls-right">
                <button className="ad-act-log-control-btn" onClick={() => setShowFilters((prev) => !prev)}>
                  <Filter size={16} />
                  Filter
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="ad-act-log-filter-panel">
                <span 
                  style={{ cursor: "pointer", position: "absolute", right: "10px", top: "10px"}} 
                  onClick={() => setShowFilters(false)}
                >
                  <GoX size={20} color="#6b7280" />
                </span>
                
                <div className="ad-act-log-filter-group">
                  <label>Action</label>
                  <select
                    value={actionFilter}
                    onChange={(e) => handleFilterChange('action', e.target.value)}
                  >
                    <option value="">All</option>
                    <option value="Created">Created</option>
                    <option value="Updated">Updated</option>
                    <option value="Deleted">Deleted</option>
                  </select>
                </div>

                <div className="ad-act-log-filter-group">
                  <label>Role</label>
                  <select
                    value={roleFilter}
                    onChange={(e) => handleFilterChange('role', e.target.value)}
                  >
                    <option value="">All</option>
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="User">User</option>
                  </select>
                </div>

                <div className="ad-act-log-filter-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => handleFilterChange('date', e.target.value)}
                  />
                </div>

                <div className="ad-act-log-filter-actions">
                  <button className="ad-act-log-btn-primary" onClick={resetFilters}>
                    Clear
                  </button>
                </div>
              </div>
            )}

            <>
              <div className="ad-act-log-table-container">
                <div className="ad-act-log-table-header">
                  <div>Action</div>
                  <div>Details</div>
                  <div>User</div>
                  <div>Role</div>
                  <div>IP Address</div>
                  <div>Date</div>
                  <div>Time</div>
                </div>

                {logs.length === 0 && !loading ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '48px', 
                    color: '#6b7280',
                    fontSize: '16px'
                  }}>
                    No activity logs found
                  </div>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="ad-act-log-table-row">
                      <div className="ad-act-log-action-cell">
                        <span className={`ad-act-log-action-badge ${log.status}`}>
                          {log.action}
                        </span>
                      </div>
                      
                      <div className="ad-act-log-details-cell">
                        <div className="ad-act-log-details-text">
                          {log.details}
                        </div>
                      </div>
                      
                      <div className="ad-act-log-user-cell">
                        <div className="ad-act-log-user-avatar" style={{ backgroundColor: "#FFC107" }}>
                          {log.userName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="ad-act-log-user-info">
                          <div className="ad-act-log-user-name">{log.userName}</div>
                        </div>
                      </div>

                      <div className="ad-act-log-role-cell">
                        <span className={`users-role-badge ${log.userRole?.toLowerCase()}`}>
                          {log.userRole}
                        </span>
                      </div>

                      <div className="ad-act-log-ip-cell">
                        <span className="ad-act-log-ip-badge">
                          {log.ip}
                        </span>
                      </div>

                      <div className="ad-act-log-date-cell">
                        {log.date}
                      </div>

                      <div className="ad-act-log-time-cell">
                        {log.time}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="ad-act-log-pagination" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
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

export default AdminActivityLog;
