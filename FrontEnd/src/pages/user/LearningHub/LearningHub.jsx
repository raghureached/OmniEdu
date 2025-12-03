import React, { useState, useEffect } from 'react';
import './LearningHub.css';
// Import icons from react-icons
import { FaCheckCircle, FaHourglassHalf, FaPlayCircle, FaExclamationTriangle } from 'react-icons/fa';
import { FaMedal, FaStar, FaAward } from 'react-icons/fa';
import api from '../../../services/api';
import { CourseCard } from '../Cards/ContentCards';

const LearningHub = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ enrolled: 0, completed: 0, in_progress: 0, expired: 0 });
  const [inProgressModules, setInProgressModules] = useState([]);
  const [recommendedModules,setRecommendedModules] = useState([])
  
  const [rewards, setRewards] = useState({ stars: 0, badges: 0, credits: 0 });

  useEffect(() => {
    // Fetch stats from API
    const fetchStats = async () => {
      try {
        const response = await api.get('/api/user/getStats');
        const data = await response.data.data;
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    const fetchRewards = async () => {
      try {
        const response = await api.get('/api/user/getUserRewards');
        const data = await response.data.data;

        setRewards(data);
      } catch (error) {
        console.error('Error fetching rewards:', error);
      }
    };
    fetchStats();
    fetchRewards();
    const fetchInProgress = async () => {
      try {
        const response = await api.get('/api/user/getInProgress');
        const data = await response.data;
        console.log(data);
        setInProgressModules(data);
      } catch (error) {
        console.error('Error fetching in progress modules:', error);
      }
    };
    const fetchRecommended = async()=>{
      try {
        const response = await api.get('/api/user/getRecomended');
        const data = await response.data;
        console.log(data);
        setRecommendedModules(data);
      } catch (error) {
        console.error('Error fetching recommended modules:', error);
      }
    }
    fetchInProgress();
    fetchRecommended();
  }, [])
  
  // Simulate loading data from API
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Mock data for learning modules with real online images


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
                    <span className="learning-stat-value">{stats.completed}</span>
                  </div>
                </div>
                
                <div className="learning-stat-item">
                  <div className="learning-stat-icon in-progress">
                    <FaHourglassHalf />
                  </div>
                  <div className="learning-stat-info">
                    <span className="learning-stat-label">In Progress</span>
                    <span className="learning-stat-value">{stats.in_progress}</span>
                  </div>
                </div>
                
                <div className="learning-stat-item">
                  <div className="learning-stat-icon not-started">
                    <FaPlayCircle />
                  </div>
                  <div className="learning-stat-info">
                    <span className="learning-stat-label">Not Started</span>
                    <span className="learning-stat-value">{stats.enrolled - stats.completed - stats.in_progress}</span>
                  </div>
                </div>
                
                <div className="learning-stat-item">
                  <div className="learning-stat-icon overdue">
                    <FaExclamationTriangle />
                  </div>
                  <div className="learning-stat-info">
                    <span className="learning-stat-label">Overdue</span>
                    <span className="learning-stat-value">{stats.expired}</span>
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
                    <span className="learning-achievement-value">{rewards.credits}</span>
                  </div>
                </div>
                
                <div className="learning-achievement-item">
                  <div className="learning-achievement-icon stars">
                    <FaStar />
                  </div>
                  <div className="learning-achievement-info">
                    <span className="learning-achievement-label">Stars</span>
                    <span className="learning-achievement-value">{rewards.stars}</span>
                  </div>
                </div>
                
                <div className="learning-achievement-item">
                  <div className="learning-achievement-icon badgesss">
                    <FaAward />
                  </div>
                  <div className="learning-achievement-info">
                    <span className="learning-achievement-label">Badges</span>
                    <span className="learning-achievement-value">{rewards.badges}</span>
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
          {inProgressModules.length >0 && <span className="learning-view-all">View All</span>}
        </div>
        
        <div className="learning-modules-grid">
          {isLoading ? (
            renderSkeleton(2)
          ) : (
            inProgressModules.length > 0 ?
            inProgressModules?.map(m => (
              <CourseCard key={m.id} data={m.assignment_id.contentId} status="in_progress" contentType={m.contentType} progressPct={m.progress_pct} />
            ))
            : "You have no in-progress trainings."
          )}
        </div>
      </section>
      
      <section className="learning-learning-section">
        <div className="learning-section-header">
          <h3>Recommended For You</h3>
          {recommendedModules.length >0 && <span className="learning-view-all">View All</span>}
        </div>
        
        <div className="learning-modules-grid">
          {isLoading ? (
            renderSkeleton(4)
          ) : (
            recommendedModules.map(module => (
              <CourseCard key={module.id} data={module} contentType={module.type} status="not_enrolled" />
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default LearningHub;