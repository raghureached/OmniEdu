import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './ActivityHistory.css';

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
  const [feedbackData, setFeedbackData] = useState({
    rating: 5,
    comment: ''
  });
  
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
  
  // Mock data for activity history with all required fields
  const activities = [
    { 
      id: 1, 
      type: 'course', 
      name: 'Introduction to React', 
      assignedOn: '2023-11-01', 
      startedOn: '2023-11-05', 
      completedOn: '2023-11-15', 
      status: 'Completed', 
      progress: 100, 
      score: 95, 
      credits: 10, 
      stars: 4, 
      badges: ['React Master', 'Quick Learner'],
    },
    { 
      id: 2, 
      type: 'assessment', 
      name: 'JavaScript Fundamentals Quiz', 
      assignedOn: '2023-11-05', 
      startedOn: '2023-11-10', 
      completedOn: '2023-11-10', 
      status: 'Completed', 
      progress: 100, 
      score: 85, 
      credits: 5, 
      stars: 3, 
      badges: ['JS Enthusiast'],
    },
    { 
      id: 3, 
      type: 'course', 
      name: 'Advanced JavaScript Concepts', 
      assignedOn: '2023-11-01', 
      startedOn: '2023-11-05', 
      completedOn: null, 
      status: 'In Progress', 
      progress: 30, 
      score: null, 
      credits: 0, 
      stars: 0, 
      badges: [],
    },
    { 
      id: 4, 
      type: 'certificate', 
      name: 'Web Development Fundamentals', 
      assignedOn: '2023-10-01', 
      startedOn: '2023-10-05', 
      completedOn: '2023-10-20', 
      status: 'Completed', 
      progress: 100, 
      score: 92, 
      credits: 20, 
      stars: 5, 
      badges: ['Web Dev Pro', 'Top Performer'],
    },
    { 
      id: 5, 
      type: 'course', 
      name: 'CSS Grid Mastery', 
      assignedOn: '2023-10-01', 
      startedOn: '2023-10-10', 
      completedOn: '2023-10-15', 
      status: 'Completed', 
      progress: 100, 
      score: 92, 
      credits: 8, 
      stars: 4, 
      badges: ['CSS Expert'],
    },
  ];
  
  // Activity types for filter
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
  
  // Filter activities based on time, type, status, and custom date range
  const filteredActivities = activities.filter(activity => {
    // Type filter
    const matchesType = typeFilter === 'all' || activity.type === typeFilter;
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'completed' && activity.status === 'Completed') ||
                          (statusFilter === 'in-progress' && activity.status === 'In Progress') ||
                          (statusFilter === 'not-started' && !activity.completedOn && activity.startedOn === null);
    
    // Time filter
    if (timeFilter === 'custom') {
      // Custom date range filter
      if (startDate && endDate) {
        const activityDate = new Date(activity.completedOn || activity.startedOn || activity.assignedOn);
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Include the entire end day
        
        return activityDate >= start && activityDate <= end && matchesType && matchesStatus;
      }
      return matchesType && matchesStatus;
    }
    
    if (timeFilter === 'all') return matchesType && matchesStatus;
    
    const activityDate = new Date(activity.completedOn || activity.startedOn || activity.assignedOn);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - activityDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (timeFilter === 'week') return diffDays <= 7 && matchesType && matchesStatus;
    if (timeFilter === 'month') return diffDays <= 30 && matchesType && matchesStatus;
    if (timeFilter === 'year') return diffDays <= 365 && matchesType && matchesStatus;
    
    return matchesType && matchesStatus;
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
        {(statusFilter !== 'all' || typeFilter !== 'all' || timeFilter !== 'all') && (
          <div className="active-filters-container">
            {statusFilter !== 'all' && (
              <div className="active-filter-badge">
                Status: <strong>{statusFilter}</strong>
                <button 
                  className="clear-filter-btn" 
                  onClick={() => setStatusFilter('all')}
                  title="Clear status filter"
                >
                  ×
                </button>
              </div>
            )}
            {typeFilter !== 'all' && (
              <div className="active-filter-badge">
                Type: <strong>{typeFilter}</strong>
                <button 
                  className="clear-filter-btn" 
                  onClick={() => setTypeFilter('all')}
                  title="Clear type filter"
                >
                  ×
                </button>
              </div>
            )}
            {timeFilter !== 'all' && (
              <div className="active-filter-badge">
                Time: <strong>{timeFilter}</strong>
                <button 
                  className="clear-filter-btn" 
                  onClick={() => {
                    setTimeFilter('all');
                    setShowCustomDateFilter(false);
                    setStartDate('');
                    setEndDate('');
                  }}
                  title="Clear time filter"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="activity-filter-section">
        <div className="activity-filter-row">
          <div className="activity-filter-dropdown">
            <label>Activity Type:</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              {activityTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="activity-filter-dropdown">
            <label>Time Period:</label>
            <select
              value={timeFilter}
              onChange={handleTimeFilterChange}
            >
              {timePeriods.map(period => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>
          
          {showCustomDateFilter && (
            <div className="activity-custom-date-filter">
              <div className="date-input-group">
                <label>From:</label>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="activity-date-input-group">
                <label>To:</label>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      
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
              <th>Actions</th>
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
                          <span className="activity-info-icon">ℹ️</span>
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
                      <div className="activity-stars-container">
                        {Array(5).fill(0).map((_, i) => (
                          <span key={i} className={i < activity.stars ? 'activity-star filled' : 'activity-star'}>
                            ★
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>{renderBadges(activity.badges)}</td>
                    <td>{renderActions(activity)}</td>
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