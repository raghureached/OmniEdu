import React, { useState } from 'react';
import './Assigned.css';

const Assigned = () => {
  const [activeTab, setActiveTab] = useState('training');

  // Dummy assigned training data
  const assignedTrainings = [
    {
      id: 1,
      title: "Cybersecurity Fundamentals",
      description: "Learn the basics of protecting digital assets and information systems",
      assignedDate: "May 1, 2025",
      dueDate: "June 15, 2025",
      progress: 0,
      status: "Not Started",
      type: "training"
    },
    {
      id: 2,
      title: "Leadership Development",
      description: "Enhance your management skills and team leadership capabilities",
      assignedDate: "April 15, 2025",
      dueDate: "May 30, 2025",
      progress: 25,
      status: "In Progress",
      type: "training"
    },
    {
      id: 3,
      title: "Workplace Safety Training",
      description: "Annual mandatory training on safety protocols and emergency procedures",
      assignedDate: "April 5, 2025",
      dueDate: "May 1, 2025",
      progress: 75,
      status: "In Progress",
      type: "training"
    }
  ];

  // Dummy assignments data
  const assignments = [
    {
      id: 4,
      title: "Quarterly Project Report",
      description: "Submit the comprehensive report on Q2 project progress and metrics",
      assignedDate: "May 10, 2025",
      dueDate: "May 25, 2025",
      progress: 40,
      status: "In Progress",
      type: "assignment"
    },
    {
      id: 5,
      title: "Team Evaluation Forms",
      description: "Complete peer evaluation forms for all team members",
      assignedDate: "May 5, 2025",
      dueDate: "May 15, 2025",
      progress: 0,
      status: "Not Started",
      type: "assignment"
    },
    {
      id: 6,
      title: "Client Presentation Deck",
      description: "Prepare presentation slides for upcoming client meeting",
      assignedDate: "April 28, 2025",
      dueDate: "May 5, 2025",
      progress: 100,
      status: "Completed",
      type: "assignment"
    },
    {
      id: 7,
      title: "Code Review Submission",
      description: "Submit your code for the new feature implementation for review",
      assignedDate: "May 12, 2025",
      dueDate: "May 19, 2025",
      progress: 80,
      status: "In Progress",
      type: "assignment"
    }
  ];

  const currentItems = activeTab === 'training' ? assignedTrainings : assignments;
  const trainingCount = assignedTrainings.length;
  const assignmentCount = assignments.length;

  return (
    <div className="assigned-container">
      <div className="assigned-header">
        <p className="assigned-subtitle">
          View and manage all your assigned trainings and tasks.
        </p>
        
        <div className="tabs">
          <button
            className={`tab-button ${activeTab === 'training' ? 'active' : ''}`}
            onClick={() => setActiveTab('training')}
          >
            Trainings ({trainingCount})
          </button>
          <button
            className={`tab-button ${activeTab === 'assignments' ? 'active' : ''}`}
            onClick={() => setActiveTab('assignments')}
          >
            Assignments ({assignmentCount})
          </button>
        </div>
      </div>

      <div className="assigned-content">
        {currentItems.length > 0 ? (
          <div className="assigned-grid">
            {currentItems.map(item => (
              <div className="assigned-card" key={item.id}>
                <div className="card-header">
                  <h3>{item.title}</h3>
                  <span className={`status-badge status-${item.status.toLowerCase().replace(' ', '-')}`}>
                    {item.status}
                  </span>
                </div>
                <p className="card-description">{item.description}</p>
                
                <div className="card-details">
                  <div className="detail-item">
                    <span className="detail-label">Assigned:</span>
                    <span className="detail-value">{item.assignedDate}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Due Date:</span>
                    <span className={`detail-value ${new Date(item.dueDate) < new Date() && item.progress < 100 ? 'overdue' : ''}`}>
                      {item.dueDate}
                    </span>
                  </div>
                  
                  <div className="progress-container">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">{item.progress}% Complete</span>
                  </div>
                </div>
                
                <button className="launch-button">
                  {item.type === 'training' ? 'Start Training' : 'View Assignment'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="assigned-empty-state">
            <p>You currently have no {activeTab === 'training' ? 'assigned trainings' : 'assignments'}.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Assigned;