import React, { useState, useEffect } from 'react';
import './LearningHub.css';
// Import icons from react-icons
import { FaCheckCircle, FaHourglassHalf, FaPlayCircle, FaExclamationTriangle } from 'react-icons/fa';
import { FaMedal, FaStar, FaAward } from 'react-icons/fa';

const LearningHub = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate loading data from API
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Mock data for learning modules with real online images
  const inProgressModules = [
    { 
      id: 1, 
      title: 'Introduction to React', 
      progress: 60, 
      dueDate: '2023-12-15',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1200px-React-icon.svg.png',
      lastAccessed: '2 days ago'
    },
    { 
      id: 2, 
      title: 'Advanced JavaScript Concepts', 
      progress: 30, 
      dueDate: '2023-12-20',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/JavaScript-logo.png/800px-JavaScript-logo.png',
      lastAccessed: 'Yesterday'
    },
    { 
      id: 5, 
      title: 'Responsive Web Design', 
      progress: 75, 
      dueDate: '2023-12-10',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/CSS3_logo_and_wordmark.svg/1200px-CSS3_logo_and_wordmark.svg.png',
      lastAccessed: 'Today'
    }
  ];

  const recommendedModules = [
    { 
      id: 3, 
      title: 'Redux Fundamentals', 
      category: 'Web Development',
      duration: '4 hours',
      level: 'Intermediate',
      image: 'https://upload.wikimedia.org/wikipedia/commons/4/49/Redux.png'
    },
    { 
      id: 4, 
      title: 'UI/UX Design Principles', 
      category: 'Design',
      duration: '6 hours',
      level: 'Beginner',
      image: 'https://cdn.dribbble.com/users/2095589/screenshots/4166422/media/3cc9e7e4d28c4a04e8d5c6883c5b1cf7.png'
    },
    { 
      id: 6, 
      title: 'Node.js Backend Development', 
      category: 'Web Development',
      duration: '8 hours',
      level: 'Advanced',
      image: 'https://nodejs.org/static/images/logo-hexagon-card.png'
    },
    { 
      id: 7, 
      title: 'Data Visualization with D3.js', 
      category: 'Data Science',
      duration: '5 hours',
      level: 'Intermediate',
      image: 'https://raw.githubusercontent.com/d3/d3-logo/master/d3.png'
    }
  ];

  // Render loading skeleton
  const renderSkeleton = (count) => {
    return Array(count).fill(0).map((_, index) => (
      <div key={`skeleton-${index}`} className="module-card skeleton">
        <div className="skeleton-image"></div>
        <div className="skeleton-title"></div>
        <div className="skeleton-progress"></div>
        <div className="skeleton-info"></div>
        <div className="skeleton-button"></div>
      </div>
    ));
  };

  // Render dashboard overview skeleton
  const renderDashboardSkeleton = () => {
    return (
      <div className="learning-dashboard-overview-skeleton">
        <div className="learning-dashboard-card skeleton"></div>
        <div className="learning-dashboard-card skeleton"></div>
        <div className="learning-dashboard-card skeleton"></div>
      </div>
    );
  };

  return (
    <div className="learning-hub-container">
      <div className="learning-hub-header">
        <p>Track your progress and discover new learning opportunities</p>
      </div>
      
      {/* Training & Leaderboard Overview Section */}
      <section className="learning-overview-section">
        <div className="learning-section-header">
          <h3>Training & Leaderboard Overview</h3>
        </div>
        
        {isLoading ? (
          renderDashboardSkeleton()
        ) : (
          <div className="learning-dashboard-overview-container">
            {/* Training Summary Card */}
            <div className="learning-dashboard-card learning-training-summary">
              <h4 className="learning-card-title">Training Summary</h4>
              <div className="learning-training-stats">
                <div className="learning-stat-item">
                  <div className="learning-stat-icon completed">
                    <FaCheckCircle />
                  </div>
                  <div className="learning-stat-info">
                    <span className="learning-stat-label">Completed</span>
                    <span className="learning-stat-value">0</span>
                  </div>
                </div>
                
                <div className="learning-stat-item">
                  <div className="learning-stat-icon in-progress">
                    <FaHourglassHalf />
                  </div>
                  <div className="learning-stat-info">
                    <span className="learning-stat-label">In Progress</span>
                    <span className="learning-stat-value">0</span>
                  </div>
                </div>
                
                <div className="learning-stat-item">
                  <div className="learning-stat-icon not-started">
                    <FaPlayCircle />
                  </div>
                  <div className="learning-stat-info">
                    <span className="learning-stat-label">Not Started</span>
                    <span className="learning-stat-value">0</span>
                  </div>
                </div>
                
                <div className="learning-stat-item">
                  <div className="learning-stat-icon overdue">
                    <FaExclamationTriangle />
                  </div>
                  <div className="learning-stat-info">
                    <span className="learning-stat-label">Overdue</span>
                    <span className="learning-stat-value">0</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Achievements Panel */}
            <div className="learning-dashboard-card learning-achievements-panel">
              <h4 className="learning-card-title">Achievements</h4>
              <div className="learning-achievements-container">
                <div className="learning-achievement-item">
                  <div className="learning-achievement-icon credits">
                    <FaMedal />
                  </div>
                  <div className="learning-achievement-info">
                    <span className="learning-achievement-label">Credits</span>
                    <span className="learning-achievement-value">0</span>
                  </div>
                </div>
                
                <div className="learning-achievement-item">
                  <div className="learning-achievement-icon stars">
                    <FaStar />
                  </div>
                  <div className="learning-achievement-info">
                    <span className="learning-achievement-label">Stars</span>
                    <span className="learning-achievement-value">0</span>
                  </div>
                </div>
                
                <div className="learning-achievement-item">
                  <div className="learning-achievement-icon badges">
                    <FaAward />
                  </div>
                  <div className="learning-achievement-info">
                    <span className="learning-achievement-label">Badges</span>
                    <span className="learning-achievement-value">0</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Leaderboard Overview */}
            <div className="learning-dashboard-card learning-leaderboard-overview">
              <h4 className="learning-card-title">Leaderboard</h4>
              <div className="learning-leaderboard-container">
                <div className="learning-leaderboard-item">
                  <div className="learning-leaderboard-gauge">
                    <div className="learning-gauge-fill" style={{ height: '0%' }}></div>
                    <span className="learning-gauge-label">0%</span>
                  </div>
                  <span className="learning-leaderboard-label">Top in Team</span>
                </div>
                
                <div className="learning-leaderboard-item">
                  <div className="learning-leaderboard-gauge">
                    <div className="learning-gauge-fill" style={{ height: '0%' }}></div>
                    <span className="learning-gauge-label">0%</span>
                  </div>
                  <span className="learning-leaderboard-label">Top in Organization</span>
                </div>
              </div>
              <p className="learning-motivational-text">Climb higher by completing trainings!</p>
            </div>
          </div>
        )}
      </section>
      
      <section className="learning-learning-section">
        <div className="learning-section-header">
          <h3>In Progress</h3>
          <span className="learning-view-all">View All</span>
        </div>
        
        <div className="learning-modules-grid">
          {isLoading ? (
            renderSkeleton(2)
          ) : (
            inProgressModules.map(module => (
              <div key={module.id} className="learning-module-card">
                <div className="learning-module-image">
                  <img src={module.image} alt={module.title} />
                  <div className="learning-progress-indicator">
                    <div className="learning-progress-text">{module.progress}%</div>
                  </div>
                </div>
                <div className="learning-module-content">
                  <h4 className="learning-module-title">{module.title}</h4>
                  <div className="learning-progress-bar">
                    <div 
                      className="learning-progress" 
                      style={{ width: `${module.progress}%` }}
                    ></div>
                  </div>
                  <div className="learning-module-info">
                    <div className="learning-info-item">
                      <span className="learning-info-label">Due:</span>
                      <span className="learning-info-value">{module.dueDate}</span>
                    </div>
                    <div className="learning-info-item">
                      <span className="learning-info-label">Last accessed:</span>
                      <span className="learning-info-value">{module.lastAccessed}</span>
                    </div>
                  </div>
                  <button className="learning-btn-continue">Continue Learning</button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
      
      <section className="learning-learning-section">
        <div className="learning-section-header">
          <h3>Recommended For You</h3>
          <span className="learning-view-all">View All</span>
        </div>
        
        <div className="learning-modules-grid">
          {isLoading ? (
            renderSkeleton(4)
          ) : (
            recommendedModules.map(module => (
              <div key={module.id} className="learning-module-card recommended">
                <div className="learning-module-image">
                  <img src={module.image} alt={module.title} />
                </div>
                <div className="learning-module-content">
                  <h4 className="learning-module-title">{module.title}</h4>
                  <div className="learning-module-info">
                    <div className="learning-info-item">
                      <span className="learning-category-badge">{module.category}</span>
                    </div>
                    <div className="learning-info-row">
                      <div className="learning-info-item">
                        <span className="learning-info-label">Duration:</span>
                        <span className="learning-info-value">{module.duration}</span>
                      </div>
                      <div className="learning-info-item">
                        <span className="learning-info-label">Level:</span>
                        <span className="learning-info-value">{module.level}</span>
                      </div>
                    </div>
                  </div>
                  <button className="learning-btn-start">Start Learning</button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default LearningHub;