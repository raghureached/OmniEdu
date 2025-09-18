

import React from 'react';
import './Mandtory.css';

const Mandatory = () => {
  // Dummy mandatory course data
  const mandatoryCourses = [
    {
      id: 1,
      title: "Annual Cybersecurity Training",
      category: "Security",
      dueDate: "June 1, 2025",
      duration: "1.5 hours",
      progress: 0,
      priority: "Critical",
      status: "Not Started"
    },
    {
      id: 2,
      title: "Code of Conduct Certification",
      category: "Corporate Policy",
      dueDate: "May 30, 2025",
      duration: "1 hour",
      progress: 35,
      priority: "Critical",
      status: "In Progress"
    },
    {
      id: 3,
      title: "Workplace Harassment Prevention",
      category: "HR & Compliance",
      dueDate: "June 15, 2025",
      duration: "2 hours",
      progress: 60,
      priority: "High",
      status: "In Progress"
    },
    {
      id: 4,
      title: "Data Privacy Essentials",
      category: "Security",
      dueDate: "July 10, 2025",
      duration: "1.5 hours",
      progress: 100,
      priority: "Medium",
      status: "Completed"
    },
    {
      id: 5,
      title: "Anti-Bribery Training",
      category: "Compliance",
      dueDate: "June 30, 2025",
      duration: "1 hour",
      progress: 15,
      priority: "Critical",
      status: "In Progress"
    },
    {
      id: 6,
      title: "Emergency Response Procedures",
      category: "Safety",
      dueDate: "May 25, 2025",
      duration: "45 mins",
      progress: 0,
      priority: "High",
      status: "Not Started"
    }
  ];

  // Function to determine progress bar color based on priority
  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'critical':
        return 'priority-critical';
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      default:
        return 'priority-low';
    }
  };

  // Function to determine status color
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'not started':
        return 'status-not-started';
      case 'in progress':
        return 'status-in-progress';
      case 'completed':
        return 'status-completed';
      default:
        return '';
    }
  };

  return (
    <div className="mandatory-container">
      <div className="mandatory-header">
        <p className="mandatory-subtitle">
          These courses must be completed by all employees as part of company policy.
          Failure to complete may result in restricted system access.
        </p>
      </div>

      <div className="mandatory-content">
        {mandatoryCourses.length > 0 ? (
          <div className="mandatory-grid">
            {mandatoryCourses.map(course => (
              <div className="mandatory-card" key={course.id}>
                <div className="card-header">
                  <h3>{course.title}</h3>
                  <div className="badges-container">
                    <span className={`priority-badge ${getPriorityColor(course.priority)}`}>
                      {course.priority}
                    </span>
                    <span className={`status-badge ${getStatusColor(course.status)}`}>
                      {course.status}
                    </span>
                  </div>
                </div>
                
                <div className="card-category">
                  <span>{course.category}</span>
                </div>
                
                <p className="card-description">
                  Mandatory training required for all employees. Estimated duration: {course.duration}.
                </p>
                
                <div className="card-details">
                  <div className="detail-item">
                    <span className="detail-label">Due Date:</span>
                    <span className={`detail-value ${new Date(course.dueDate) < new Date() && course.progress < 100 ? 'overdue' : ''}`}>
                      {course.dueDate}
                    </span>
                  </div>
                  
                  <div className="progress-container">
                    <div className="progress-bar">
                      <div 
                        className={`progress-fill ${getPriorityColor(course.priority)}`} 
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">{course.progress}% Complete</span>
                  </div>
                </div>
                
                <button className="action-button">
                  {course.status === 'Completed' ? 'View Certificate' : 'Start Training'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>You have no pending mandatory trainings at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Mandatory;