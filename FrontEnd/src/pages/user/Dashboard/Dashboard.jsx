import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { GraduationCap, PencilLine, Activity, HelpCircle, Megaphone } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line,
  Global
} from 'recharts';
import { fetchMessages } from '../../../store/slices/messageSlice';
import { FaAward, FaChartLine, FaCheckCircle, FaClock, FaExclamationTriangle, FaHourglassHalf, FaLine, FaMedal, FaPlayCircle, FaStar } from 'react-icons/fa';
import api from '../../../services/api';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { currentMessages } = useSelector((state) => state.globalMessage);
  const [stats, setStats] = useState({})
  const [rewards, setRewards] = useState({})
  const [leaderboard, setLeaderboard] = useState({ organization: [], team: [], totalUsers: 0 })
  const [leaderboardPositions, setLeaderboardPositions] = useState({ organization: 0, team: 0 })
  const [loading, setLoading] = useState(false)
  const userName = user?.name || 'Admin';
  const currentHour = new Date().getHours();
  const navigate = useNavigate()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/user/getStats');
        const data = await response.data.data;
        console.log(data)
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    const fetchRewards = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/user/getUserRewards');
        const data = await response.data.data;

        setRewards(data);
      } catch (error) {
        console.error('Error fetching rewards:', error);
      } finally {
        setLoading(false);
      }
    };
    const fetchLeaderboard = async () => {
      try {
        const orgResponse = await api.get('/api/user/getLeaderboard');
        const teamResponse = await api.get('/api/user/getLeaderboardinTeam');

        setLeaderboard({
          organization: orgResponse.data.leaderboard || [],
          team: teamResponse.data.leaderboard || [],
          totalUsers: orgResponse.data.totalUsers || 0
        });
        setLeaderboardPositions({
          organization: orgResponse.data.position || 0,
          team: teamResponse.data.position || 0
        });
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      }
    };
    fetchStats();
    fetchRewards();
    fetchLeaderboard();

  }, [])

  useEffect(() => {
    dispatch(fetchMessages());

  }, [dispatch]);

  // Keep hover effect visible while scrolling by tracking the element under the pointer
  useEffect(() => {
    let pointerX = window.innerWidth / 2;
    let pointerY = 0;
    let currentEl = null;

    const selectable = ['.admin-message-item', '.admin-quick-link-row', '.admin-quick-links-card'];

    const clearHover = () => {
      if (currentEl) {
        currentEl.classList.remove('is-hover');
        currentEl = null;
      }
    };

    const updateHover = () => {
      const el = document.elementFromPoint(pointerX, pointerY);
      if (!el) { clearHover(); return; }
      const target = el.closest(selectable.join(','));
      if (target !== currentEl) {
        if (currentEl) currentEl.classList.remove('is-hover');
        if (target) {
          target.classList.add('is-hover');
          currentEl = target;
        } else {
          currentEl = null;
        }
      }
    };

    const onMouseMove = (e) => {
      pointerX = e.clientX;
      pointerY = e.clientY;
      updateHover();
    };
    const onScroll = () => updateHover();

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', onScroll, { passive: true });
    document.addEventListener('scroll', onScroll, true);
    // Update immediately in case pointer already over an element
    updateHover();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', onScroll);
      document.removeEventListener('scroll', onScroll, true);
      clearHover();
    };
  }, []);

  const messages = Array.isArray(currentMessages)
    ? [...currentMessages].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    : [];

  const getGreeting = () => {
    if (currentHour < 12) return 'Good Morning';
    if (currentHour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const quickLinks = [
    // { to: '/admin/content-assessments', title: 'Assessments', desc: 'Create quizzes and tests to evaluate learning.', Icon: ClipboardCheck },
    // { to: '/admin/manage-surveys', title: 'Surveys', desc: 'Collect feedback and insights from learners.', Icon: ListChecks },
    { to: '/user/assigned', title: 'Assigned Courses', desc: 'View and manage assigned courses.', Icon: GraduationCap },
    { to: '/user/learning-hub', title: 'Learning Hub', desc: 'View and participate in learning activities.', Icon: PencilLine },
    // { to: '/admin/manage-assignments', title: 'Manage Assignments', desc: 'Track submissions and manage grading.', Icon: ClipboardList },
    // { to: '/admin/message-board', title: 'Message Board', desc: 'Broadcast updates to your organization.', Icon: MessageSquare },
    { to: '/user/activity-history', title: 'Activity History', desc: 'Review recent actions and system events.', Icon: Activity },
    { to: '/user/help-center', title: 'Help Center', desc: 'Find documentation and get support.', Icon: HelpCircle },
  ];

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
                Welcome to OmniEdu,
              </p>
            </div>
          </div>

          <div className="admin-welcome-description">
            <p>
              Manage your learning content, track progress, and participate in engaging educational experiences. Happy Learning!
            </p>
          </div>
        </div>

        {/* Message Board (from Global Admin) */}
        <div className="admin-message-card">
          <div className="admin-message-card-header">
            <h2 className="admin-message-card-title">Message Board</h2>
          </div>
          <div className="admin-message-card-body">
            {loading ? (
              <div className="admin-message-loading">Loading messages...</div>
            ) : (
              <>
                {messages.length > 0 ? (
                  <ul className="admin-message-list" role="list">
                    {messages.slice(0, 3).map((msg) => (
                      <li key={msg._id || msg.uuid} className="admin-message-item">
                        <span className="admin-message-icon" aria-hidden="true">
                          <Megaphone size={18} />
                        </span>
                        <div className="admin-message-content">
                          <div className="admin-message-text">{msg.message_text}</div>
                          <div className="admin-message-time">{msg.createdAt ? new Date(msg.createdAt).toLocaleString() : ''}</div>
                        </div>
                        <span style={{ float: "right", display: "flex", alignItems: "center", gap: "5px", flexDirection: "column" }}>

                          <span> </span>
                          {msg.isGlobal ? "- OmniEdu Team" : "- Admin"}

                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="admin-empty-state">No messages</div>
                )}
              </>
            )}
          </div>
        </div>



        {/* Getting Started Section */}
        <div className="admin-getting-started">
          <h2 className="admin-section-title">Training & Leaderboard Overview</h2>
        </div>
        <div className='summary-grid'>
            <div className="learning-dashboard-card learning-training-summary">
              <h4 className="learning-card-title">Training Summary</h4>
              <div className="learning-training-stats">
                <div className="learning-stat-item" onClick={() => navigate('/user/completed')}>
                  <div className="learning-stat-icon completed">
                    <FaCheckCircle />
                  </div>
                  <div className="learning-stat-info">
                    <span className="learning-stat-label">Completed</span>
                    <span className="learning-stat-value">{stats.completed}</span>
                  </div>
                </div>

                <div className="learning-stat-item" onClick={() => navigate('/user/inProgress')}>
                  <div className="learning-stat-icon in-progress">
                    <FaHourglassHalf />
                  </div>
                  <div className="learning-stat-info">
                    <span className="learning-stat-label">In Progress</span>
                    <span className="learning-stat-value">{stats.in_progress}</span>
                  </div>
                </div>
                <div className="learning-stat-item">
                  <div className="learning-stat-icon completion-rate">
                    <FaChartLine />
                  </div>
                  <div className="learning-stat-info">
                    <span className="learning-stat-label">Completion Rate</span>
                    <span className="learning-stat-value">{stats.in_progress}</span>
                  </div>
                </div>

                <div className="learning-stat-item" onClick={() => navigate('/user/assigned')}>
                  <div className="learning-stat-icon not-started">
                    <FaPlayCircle />
                  </div>
                  <div className="learning-stat-info">
                    <span className="learning-stat-label">Not Started</span>
                    <span className="learning-stat-value">{stats.enrolled - stats.completed - stats.in_progress}</span>
                  </div>
                </div>

                <div className="learning-stat-item" onClick={() => navigate('/user/assigned')}>
                  <div className="learning-stat-icon overdue">
                    <FaExclamationTriangle />
                  </div>
                  <div className="learning-stat-info">
                    <span className="learning-stat-label">Overdue</span>
                    <span className="learning-stat-value">{stats.expired}</span>
                  </div>
                </div>

                <div className="learning-stat-item" onClick={() => navigate('/user/assigned')}>
                  <div className="learning-stat-icon time-spent-total">
                    <FaClock />
                  </div>
                  <div className="learning-stat-info">
                    <span className="learning-stat-label">Time Spent</span>
                    <span className="learning-stat-value">{stats.expired}</span>
                  </div>
                </div>
              </div>
            </div>
          <div className="learning-dashboard-card">
            <h4 className="learning-card-title">Achievements & Leaderboard</h4>
            <div className="learning-achievements-container">
              <div style={{ display: "flex", gap: "10px", flexDirection: "column" }}>
                <div className="learning-achievement-item">
                  <div className="learning-achievement-icon creditss">
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
              <div className="learning-leaderboard-container">
                <div className="learning-leaderboard-item">
                  <div className="learning-leaderboard-position">
                    <div className="learning-position-badge">
                      <FaMedal className="learning-medal-icon" />
                      <span className="learning-position-number">#{leaderboardPositions.team || 0}</span>
                    </div>
                    <div className="learning-position-info">
                      <span className="learning-position-label">Team Rank</span>
                      <span className="learning-position-total">of {leaderboard.team.length}</span>
                    </div>
                  </div>
                </div>

                <div className="learning-leaderboard-item">
                  <div className="learning-leaderboard-position">
                    <div className="learning-position-badge">
                      <FaAward className="learning-medal-icon" />
                      <span className="learning-position-number">#{leaderboardPositions.organization || 0}</span>
                    </div>
                    <div className="learning-position-info">
                      <span className="learning-position-label">Organization Rank</span>
                      <span className="learning-position-total">of {leaderboard.totalUsers}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
            <p className="learning-motivational-text">Keep climbing the leaderboard!</p>


          </div>
          {/* <div className="learning-dashboard-card learning-leaderboard-overview">
<h4 className="learning-card-title">Leaderboard</h4>
<div className="learning-leaderboard-container">
<div className="learning-leaderboard-item">
<div className="learning-leaderboard-position">
<div className="learning-position-badge">
<FaMedal className="learning-medal-icon" />
<span className="learning-position-number">#{leaderboardPositions.team || 0}</span>
</div>
<div className="learning-position-info">
<span className="learning-position-label">Team Rank</span>
<span className="learning-position-total">of {leaderboard.team.length}</span>
</div>
</div>
</div>

<div className="learning-leaderboard-item">
<div className="learning-leaderboard-position">
<div className="learning-position-badge">
<FaAward className="learning-medal-icon" />
<span className="learning-position-number">#{leaderboardPositions.organization || 0}</span>
</div>
<div className="learning-position-info">
<span className="learning-position-label">Organization Rank</span>
<span className="learning-position-total">of {leaderboard.totalUsers}</span>
</div>
</div>
</div>
</div>
<p className="learning-motivational-text">Keep climbing the leaderboard!</p>
</div> */}


        </div>

      </div>
    </div>
  );
};

export default Dashboard;