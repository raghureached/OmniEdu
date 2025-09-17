import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchActivityLogs } from "../../../store/slices/activityLogSlice";
import "./GlobalActivityLog.css";

const GlobalAdminActivity = () => {
  const dispatch = useDispatch();
  const { logs, pagination, loading } = useSelector((state) => state.activityLog);
  const [search, setSearch] = useState("");
  const [actionOn, setActionOn] = useState("");
  const [dateRange, setDateRange] = useState(["", ""]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchActivityLogs({ actionOn, dateRange, search, page }));
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    dispatch(fetchActivityLogs({ actionOn, dateRange, search, page }));
  };

  return (
    <div className="global-activity-admin-activity">
      {/* Filters */}
      <form onSubmit={handleSearch} className="global-activity-filters-form">
        {/* Search */}
        <input
          type="text"
          placeholder="Search by details..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Action Filter */}
        <select value={actionOn} onChange={(e) => setActionOn(e.target.value)}>
          <option value="">All Actions</option>
          <option value="Organization">Organization</option>
          <option value="User">User</option>
          <option value="Role">Role</option>
        </select>

        {/* Date Range */}
        <div className="global-activity-date-range">
          <input
            type="date"
            value={dateRange[0]}
            onChange={(e) => setDateRange([e.target.value, dateRange[1]])}
          />
          <input
            type="date"
            value={dateRange[1]}
            onChange={(e) => setDateRange([dateRange[0], e.target.value])}
          />
        </div>

        {/* Apply Button */}
        <button type="submit">Apply Filters</button>
      </form>

      {/* Table */}
      <div>
        <table className="global-activity-activity-table">
          <thead>
            <tr>
              <th>Action On</th>
              <th>Details</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="3" className="global-activity-empty-row">
                  Loading...
                </td>
              </tr>
            ) : logs.length > 0 ? (
              logs.map((activity) => (
                <tr key={activity._id}>
                  <td>{activity.actionOn}</td>
                  <td>{activity.details}</td>
                  <td>{new Date(activity.createdAt).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="global-activity-empty-row">
                  No activities found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="global-activity-pagination">
        <button
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
        >
          Previous
        </button>
        <span>
          Page {pagination.currentPage} of {pagination.totalPages}
        </span>
        <button
          disabled={!pagination.hasNextPage}
          onClick={() => setPage((prev) => prev + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default GlobalAdminActivity;
