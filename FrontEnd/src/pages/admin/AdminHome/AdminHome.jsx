import React from 'react';
import { useSelector } from 'react-redux';
import { BookOpen, Users, Award, TrendingUp } from 'lucide-react';
import './AdminHome.css';

const AdminHome = () => {
  const { user } = useSelector((state) => state.auth);
  const userName = user?.name || 'Admin';
  const currentHour = new Date().getHours();
  
  const getGreeting = () => {
    if (currentHour < 12) return 'Good Morning';
    if (currentHour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="admin-home-container">
      <div className="admin-home-content">
        {/* Welcome Card */}
        <div className="admin-welcome-card">
          <div className="admin-welcome-header">
            <div className="admin-welcome-text">
              <h1 className="admin-welcome-title">
                {getGreeting()}, {userName}! 👋
              </h1>
              <p className="admin-welcome-subtitle">
                Welcome to OmniEdu Admin Dashboard
              </p>
            </div>
          </div>
          
          <div className="admin-welcome-description">
            <p>
              Manage your organization's learning content, track user progress, and create engaging educational experiences.
            </p>
          </div>
        </div>

        {/* Quick Stats Grid */}
        {/* <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="admin-stat-icon" style={{ background: '#eff6ff' }}>
              <BookOpen size={24} color="#5570f1" />
            </div>
            <div className="admin-stat-content">
              <div className="admin-stat-label">Learning Modules</div>
              <div className="admin-stat-value">Create & Manage</div>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon" style={{ background: '#f0fdf4' }}>
              <Users size={24} color="#22c55e" />
            </div>
            <div className="admin-stat-content">
              <div className="admin-stat-label">User Management</div>
              <div className="admin-stat-value">Track Progress</div>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon" style={{ background: '#fef3c7' }}>
              <Award size={24} color="#f59e0b" />
            </div>
            <div className="admin-stat-content">
              <div className="admin-stat-label">Assessments</div>
              <div className="admin-stat-value">Evaluate Learning</div>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon" style={{ background: '#fce7f3' }}>
              <TrendingUp size={24} color="#ec4899" />
            </div>
            <div className="admin-stat-content">
              <div className="admin-stat-label">Analytics</div>
              <div className="admin-stat-value">View Insights</div>
            </div>
          </div>
        </div> */}

        {/* Getting Started Section */}
        <div className="admin-getting-started">
          <h2 className="admin-section-title">Getting Started</h2>
          <div className="admin-guide-grid">
            <div className="admin-guide-card">
              <div className="admin-guide-number">1</div>
              <h3 className="admin-guide-title">Create Content</h3>
              <p className="admin-guide-description">
                Navigate to the Content section to create modules, assessments, and surveys.
              </p>
            </div>

            <div className="admin-guide-card">
              <div className="admin-guide-number">2</div>
              <h3 className="admin-guide-title">Organize Learning Paths</h3>
              <p className="admin-guide-description">
                Build structured learning paths by combining modules and assessments.
              </p>
            </div>

            <div className="admin-guide-card">
              <div className="admin-guide-number">3</div>
              <h3 className="admin-guide-title">Manage Users</h3>
              <p className="admin-guide-description">
                Add users, assign roles, and track their learning progress.
              </p>
            </div>

            <div className="admin-guide-card">
              <div className="admin-guide-number">4</div>
              <h3 className="admin-guide-title">Monitor Performance</h3>
              <p className="admin-guide-description">
                Use analytics to gain insights into user engagement and completion rates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;