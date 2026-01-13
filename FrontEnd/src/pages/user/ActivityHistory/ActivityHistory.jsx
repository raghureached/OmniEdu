import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './ActivityHistory.css';
import api from '../../../services/api';
import { Filter, Search, X } from 'lucide-react';
import CustomSelect from '../../../components/dropdown/DropDown';

const ActivityHistory = () => {
  const location = useLocation();
  const [timeFilter, setTimeFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showCustomDateFilter, setShowCustomDateFilter] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(null);
  const [activities, setActivities] = useState([]);
  const [feedbackData, setFeedbackData] = useState({
    rating: 5,
    comment: ''
  });
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Parse URL parameters on component mount
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);

    // Get status parameter (for filtering by completion status)
    const status = queryParams.get('status');
    if (status) {
      setStatusFilter(status);
    }

    // Get type parameter (for filtering by activity type)
    const type = queryParams.get('type');
    if (type) {
      setTypeFilter(type);
    }

    // Get time parameter (for filtering by time period)
    const time = queryParams.get('time');
    if (time) {
      setTimeFilter(time);
      setShowCustomDateFilter(time === 'custom');
    }

    // Get date range parameters if present
    const start = queryParams.get('startDate');
    const end = queryParams.get('endDate');
    if (start) setStartDate(start);
    if (end) setEndDate(end);

  }, [location.search]);

  // Simulate loading data from API
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    const fetchActivityLogs = async () => {
      const res = await api.get('/api/user/getActivity')
      // console.log(res)
      if (res.status === 200) {
        setActivities(res.data.data)
      }
    }
    fetchActivityLogs()
  }, []);
  
  const activityTypes = [
    { value: 'all', label: 'All Activities' },
    { value: 'course', label: 'Courses' },
    { value: 'assessment', label: 'Assessments' },
    { value: 'certificate', label: 'Certificates' }
  ];

  // Time periods for filter
  const timePeriods = [
    { value: 'all', label: 'All Time' },
    { value: 'week', label: 'Last Week' },
    { value: 'month', label: 'Last Month' },
    { value: 'year', label: 'Last Year' },
    { value: 'custom', label: 'Custom Date Range' }
  ];

  // Handle time filter change
  const handleTimeFilterChange = (e) => {
    const value = e.target.value;
    setTimeFilter(value);
    setShowCustomDateFilter(value === 'custom');
  };

  // Filter activities based on search, time, type, status, and custom date range
  const filteredActivities = activities.filter(activity => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Type filter
    const matchesType = typeFilter === 'all' || activity.type.toLowerCase() === typeFilter.toLowerCase();
    
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter.toLowerCase() === activity.status.toLowerCase())
      

    // Time filter
    if (timeFilter === 'custom') {
      // Custom date range filter
      if (startDate && endDate) {
        const activityDate = new Date(activity.completedOn || activity.startedOn || activity.assignedOn);
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Include the entire end day

        return activityDate >= start && activityDate <= end && matchesType && matchesStatus && matchesSearch;
      }
      return matchesType && matchesStatus && matchesSearch;
    }

    if (timeFilter === 'all') return matchesType && matchesStatus && matchesSearch;

    const activityDate = new Date(activity.completedOn || activity.startedOn || activity.assignedOn);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - activityDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (timeFilter === 'week') return diffDays <= 7 && matchesType && matchesStatus && matchesSearch;
    if (timeFilter === 'month') return diffDays <= 30 && matchesType && matchesStatus && matchesSearch;
    if (timeFilter === 'year') return diffDays <= 365 && matchesType && matchesStatus && matchesSearch;

    return matchesType && matchesStatus && matchesSearch;
  });

  // Format date to be more readable
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Render loading skeleton for table
  const renderTableSkeleton = () => {
    return Array(5).fill(0).map((_, index) => (
      <tr key={`skeleton-${index}`} className="skeleton-row">
        <td><div className="activity-skeleton-cell"></div></td>
        <td><div className="activity-skeleton-cell"></div></td>
        <td><div className="activity-skeleton-cell"></div></td>
        <td><div className="activity-skeleton-cell"></div></td>
        <td><div className="activity-skeleton-cell"></div></td>
        <td><div className="activity-skeleton-cell"></div></td>
        <td><div className="activity-skeleton-cell"></div></td>
        <td><div className="activity-skeleton-cell"></div></td>
        <td><div className="activity-skeleton-cell"></div></td>
        <td><div className="activity-skeleton-cell"></div></td>
        <td><div className="activity-skeleton-cell"></div></td>
        <td><div className="activity-skeleton-cell"></div></td>
      </tr>
    ));
  };

  // Render badges with count
  const renderBadges = (badges) => {
    if (!badges || badges.length === 0) return '-';
    return (
      <div className="badges-count">
        <span className="badge-count">{badges.length}</span>
      </div>
    );
  };

  // Open feedback form for a specific activity
  const openFeedbackForm = (activity) => {
    setCurrentActivity(activity);
    setShowFeedbackForm(true);
  };

  // Close feedback form
  const closeFeedbackForm = () => {
    setShowFeedbackForm(false);
    setCurrentActivity(null);
    setFeedbackData({ rating: 5, comment: '' });
  };

  // Handle feedback form input changes
  const handleFeedbackChange = (e) => {
    const { name, value } = e.target;
    setFeedbackData(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value
    }));
  };

  // Submit feedback
  const submitFeedback = (e) => {
    e.preventDefault();
    // Here you would typically send the feedback to your API
    console.log('Submitting feedback:', {
      activityId: currentActivity.id,
      activityName: currentActivity.name,
      ...feedbackData
    });

    // Show success message or notification
    alert('Thank you for your feedback!');

    // Close the form
    closeFeedbackForm();
  };

  // Render actions
  const renderActions = (activity) => {
    return (
      <div className="activity-actions-container">
        <button
          className="activity-action-btn feedback-btn"
          title="Provide Feedback"
          onClick={() => openFeedbackForm(activity)}
        >
          <span>feedback</span>
        </button>
      </div>
    );
  };

  // Get tooltip text based on activity status
  const getTooltipText = (activity) => {
    return activity.completedOn ? 'View Training' : 'Resume Training';
  };

  return (
    <div className="activity-history-container">
      <div className="activity-history-header">
        <p>Track your learning journey and achievements</p>
       
      </div>

      <div className="act-log-controls">
        <div className="act-log-roles-search-bar">
          <Search size={16} color="#6b7280" className="act-log-search-icon" />
          <input
            type="text"
            placeholder="Search activities..."
            className="act-log-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="act-log-controls-right">
          <button className="btn-secondary" onClick={() => setFilterPanelOpen(true)}>
            <Filter size={16} />
            Filter
          </button>
        </div>
      </div>

      {/* Filter Dropdown */}
      {filterPanelOpen && (
        <div className="act-log-filter-panel">
          <div className="act-log-filter-header">
            <h3>Filters</h3>
            <button className="addOrg-close-btn" onClick={() => setFilterPanelOpen(false)}>
              <X size={16} />
            </button>
          </div>
          
          <div className="act-log-filter-content">
            <div className="act-log-filter-group">
              <label>Activity Type</label>
              <CustomSelect
                value={typeFilter}
                onChange={(value) => setTypeFilter(value)}
                placeholder="All Types"
                searchable={false}
                options={[
                  { value: "all", label: "All Types" },
                  { value: "module", label: "Module" },
                  { value: "assessment", label: "Assessment" },
                  { value: "survey", label: "Survey" },
                  { value: "learning-path", label: "Learning Path" }
                ]}
              />
            </div>

            <div className="act-log-filter-group">
              <label>Status</label>
              <CustomSelect
                value={statusFilter}
                onChange={(value) => setStatusFilter(value)}
                placeholder="All Status"
                searchable={false}
                options={[
                  { value: "all", label: "All Status" },
                  { value: "completed", label: "Completed" },
                  { value: "in-progress", label: "In Progress" },
                  { value: "not-started", label: "Not Started" }
                ]}
              />
            </div>

            <div className="act-log-filter-group">
              <label>Time Period</label>
              <CustomSelect
                value={timeFilter}
                onChange={handleTimeFilterChange}
                placeholder="All Time"
                searchable={false}
                options={[
                  { value: "all", label: "All Time" },
                  { value: "week", label: "Last Week" },
                  { value: "month", label: "Last Month" },
                  { value: "year", label: "Last Year" },
                  { value: "custom", label: "Custom Range" }
                ]}
              />
            </div>

            {showCustomDateFilter && (
              <>
                <div className="act-log-filter-group">
                  <label>Start Date</label>
                  <input 
                    type="date" 
                    className="act-log-filter-group input"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="act-log-filter-group">
                  <label>End Date</label>
                  <input 
                    type="date" 
                    className="act-log-filter-group input"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="act-log-filter-actions">
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', width: '100%' }}>
                <button 
                  className="btn-secondary" 
                  onClick={() => {
                    // Reset local filters
                    setTypeFilter('all');
                    setStatusFilter('all');
                    setTimeFilter('all');
                    setStartDate('');
                    setEndDate('');
                    setShowCustomDateFilter(false);
                    // Clear URL params
                    const url = new URL(window.location.href);
                    url.searchParams.delete('type');
                    url.searchParams.delete('status');
                    url.searchParams.delete('time');
                    url.searchParams.delete('startDate');
                    url.searchParams.delete('endDate');
                    window.history.replaceState({}, '', url.pathname);
                    // Close panel
                    setFilterPanelOpen(false);
                  }}
                >
                  Clear
                </button>
                <button 
                  className="btn-primary" 
                  onClick={() => {
                    const url = new URL(window.location.href);
                    // Set params only when non-default
                    if (typeFilter && typeFilter !== 'all') url.searchParams.set('type', typeFilter);
                    else url.searchParams.delete('type');
                    if (statusFilter && statusFilter !== 'all') url.searchParams.set('status', statusFilter);
                    else url.searchParams.delete('status');
                    if (timeFilter && timeFilter !== 'all') url.searchParams.set('time', timeFilter);
                    else url.searchParams.delete('time');
                    if (timeFilter === 'custom' && startDate) url.searchParams.set('startDate', startDate);
                    else url.searchParams.delete('startDate');
                    if (timeFilter === 'custom' && endDate) url.searchParams.set('endDate', endDate);
                    else url.searchParams.delete('endDate');
                    window.history.replaceState({}, '', `${url.pathname}${url.search}`);
                    setFilterPanelOpen(false);
                  }}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="activity-table-container">
        <table className="activity-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Activity Name</th>
              <th>Assigned On</th>
              <th>Started On</th>
              <th>Completed On</th>
              <th>Status</th>
              <th>Progress (%)</th>
              <th>Score</th>
              <th>Credits</th>
              <th>Stars</th>
              <th>Badges</th>

            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              renderTableSkeleton()
            ) : (
              filteredActivities.length > 0 ? (
                filteredActivities.map(activity => (
                  <tr key={activity.id}>
                    <td>{activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}</td>
                    <td className="activity-name-cell">
                      <div className="activity-name-with-icon">
                        <span>{activity.name}</span>
                        <div className="activity-info-icon-wrapper" title={getTooltipText(activity)}>
                          {/* <span className="activity-info-icon">ℹ️</span> */}
                        </div>
                      </div>
                    </td>
                    <td>{formatDate(activity.assignedOn)}</td>
                    <td>{formatDate(activity.startedOn)}</td>
                    <td>{formatDate(activity.completedOn)}</td>
                    <td>
                      <span className={`activity-status-badge ${activity.status.toLowerCase().replace(' ', '-')}`}>
                        {activity.status}
                      </span>
                    </td>
                    <td>{activity.progress}%</td>
                    <td>{activity.score !== null ? activity.score : '-'}</td>
                    <td>{activity.credits}</td>
                    <td>
                      {activity.stars}
                    </td>
                    <td>{activity.badges}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="12" className="activity-no-activities">
                    <p>No activities found for the selected filters.</p>
                    <button onClick={() => {
                      setTimeFilter('all');
                      setTypeFilter('all');
                      setStartDate('');
                      setEndDate('');
                      setShowCustomDateFilter(false);
                    }}>Clear Filters</button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Feedback Modal */}
      {showFeedbackForm && currentActivity && (
        <div className="activity-feedback-modal-overlay">
          <div className="activity-feedback-modal">
            <div className="activity-feedback-modal-header">
              <h3>Provide Feedback</h3>
              <button className="activity-close-btn" onClick={closeFeedbackForm}>×</button>
            </div>
            <div className="activity-feedback-modal-content">
              <p>Activity: <strong>{currentActivity.name}</strong></p>
              <form onSubmit={submitFeedback}>
                <div className="activity-form-group">
                  <label>Rating:</label>
                  <div className="activity-rating-input">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <label key={star} className="activity-star-label">
                        <input
                          type="radio"
                          name="rating"
                          value={star}
                          checked={feedbackData.rating === star}
                          onChange={handleFeedbackChange}
                        />
                        <span className={star <= feedbackData.rating ? 'activity-star filled' : 'activity-star'}>★</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="activity-form-group">
                  <label>Comments:</label>
                  <textarea
                    name="comment"
                    value={feedbackData.comment}
                    onChange={handleFeedbackChange}
                    placeholder="Share your experience with this activity..."
                    rows="4"
                  ></textarea>
                </div>
                <div className="activity-form-actions">
                  <button type="button" className="activity-cancel-btn" onClick={closeFeedbackForm}>Cancel</button>
                  <button type="submit" className="activity-submit-btn">Submit Feedback</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityHistory;