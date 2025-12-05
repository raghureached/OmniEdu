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