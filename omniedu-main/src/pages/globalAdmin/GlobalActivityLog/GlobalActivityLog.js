import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchActivityLogs,
  setFilters,
  setPage,
} from "../../../store/slices/activityLogSlice";
import {
  Calendar,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import "./GlobalActivityLog.css";

const GlobalActivityLog = () => {
  const dispatch = useDispatch();
  const { logs, loading, error, filters, pagination } = useSelector(
    (state) => state.activityLog
  );
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(
      fetchActivityLogs({
        ...filters,
        page: pagination.currentPage,
        search: searchTerm,
      })
    );
  }, [dispatch, filters, pagination.currentPage, searchTerm]);

  const handleDateRangeChange = (range) => {
    dispatch(setFilters({ dateRange: range }));
  };

  const handleCriteriaChange = (criteria) => {
    dispatch(setFilters({ criteria }));
  };

  const handlePageChange = (page) => {
    dispatch(setPage(page));
  };

  return (
    <div className="globaladmin-activity-log">
      <div className="activity-log-header">
        <p className="activity-log-description">
          A detailed record of all admin activity for clear oversight and
          compliance.{" "}
        </p>{" "}
      </div>
      <div className="activity-log-filters">
        <div className="filter-group">
          <label> Date Range: </label>{" "}
          <div className="filter-options">
            <button
              className={filters.dateRange === "today" ? "active" : ""}
              onClick={() => handleDateRangeChange("today")}
            >
              Today{" "}
            </button>{" "}
            <button
              className={filters.dateRange === "thisWeek" ? "active" : ""}
              onClick={() => handleDateRangeChange("thisWeek")}
            >
              This Week{" "}
            </button>{" "}
            <button
              className={filters.dateRange === "thisMonth" ? "active" : ""}
              onClick={() => handleDateRangeChange("thisMonth")}
            >
              This Month{" "}
            </button>{" "}
          </div>{" "}
        </div>
        <div className="filter-group">
          <label> Criteria: </label>{" "}
          <div className="filter-options">
            <button
              className={filters.criteria === "all" ? "active" : ""}
              onClick={() => handleCriteriaChange("all")}
            >
              All{" "}
            </button>{" "}
            <button
              className={filters.criteria === "user" ? "active" : ""}
              onClick={() => handleCriteriaChange("user")}
            >
              User Management{" "}
            </button>{" "}
            <button
              className={filters.criteria === "content" ? "active" : ""}
              onClick={() => handleCriteriaChange("content")}
            >
              Content Management{" "}
            </button>{" "}
          </div>{" "}
        </div>
        <div className="search-group">
          <Search size={20} />{" "}
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />{" "}
        </div>{" "}
      </div>
      <div className="activity-log-table-container">
        {" "}
        {loading ? (
          <div className="loading-spinner"> Loading... </div>
        ) : error ? (
          <div className="error-message"> {error} </div>
        ) : (
          <>
            <table className="activity-log-table">
              <thead>
                <tr>
                  <th> Timestamp </th> <th> Admin </th> <th> Action </th>{" "}
                  <th> Details </th> <th> IP Address </th>{" "}
                </tr>{" "}
              </thead>{" "}
              <tbody>
                {" "}
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td> {new Date(log.timestamp).toLocaleString()} </td>{" "}
                    <td> {log.adminName} </td>{" "}
                    <td>
                      <span
                        className={`action-badge ${log.actionType.toLowerCase()}`}
                      >
                        {" "}
                        {log.actionType}{" "}
                      </span>{" "}
                    </td>{" "}
                    <td> {log.details} </td> <td> {log.ipAddress} </td>{" "}
                  </tr>
                ))}{" "}
              </tbody>{" "}
            </table>
            <div className="pagination">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              >
                <ChevronLeft size={20} />{" "}
              </button>{" "}
              <span className="page-info">
                Page {pagination.currentPage}
                of {pagination.totalPages}{" "}
              </span>{" "}
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
              >
                <ChevronRight size={20} />{" "}
              </button>{" "}
            </div>{" "}
          </>
        )}{" "}
      </div>{" "}
    </div>
  );
};

export default GlobalActivityLog;
