import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { BookOpen, Users, Award, TrendingUp, ClipboardCheck, ListChecks, GraduationCap, PencilLine, ClipboardList, MessageSquare, Activity, HelpCircle, Megaphone, Clock, UserCheck, Calendar } from 'lucide-react';
import './AdminHome.css';
import { fetchMessagesForAdmin } from '../../../store/slices/globalMessageSlice';
import { getContentCountsAll } from '../../../utils/contentCountsService'
import api from '../../../services/api';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line
} from 'recharts';

const AdminHome = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { currentMessages, loading } = useSelector((state) => state.globalMessage);
  const userName = user?.name || 'Admin';
  const currentHour = new Date().getHours();
  const [contentCounts, setContentCounts] = useState({
    modules: { total: 0, published: 0 },
    assessments: { total: 0, published: 0 },
    surveys: { total: 0, published: 0 },
    learningPaths: { total: 0 }
  });
  const [countsLoading, setCountsLoading] = useState(true);
  const [userAnalytics, setUserAnalytics] = useState({
    dailyActiveUsers: 0,
    monthlyActiveUsers: 0,
    totalUsers: 0,
    avgTimeOnPlatform: 0
  });
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const {permissions} = useSelector((state)=>state.rolePermissions)
  // Try to infer organization id/uuid from user payload (supports multiple backend shapes)
  const orgId = user?.organization?.uuid
    || user?.organizationUuid
    || user?.organization_uuid
    || user?.orgId
    || user?.org_id
    || user?.organization_id
    || user?.orgUuid
    || user?.organizationUUID
    || user?.organizationId
    || user?.organization?.id;

  // Mock data for Organization Performance
  const organizationData = [
    { name: 'Org A', completionRate: 82, assessmentPassRate: 88 },
    { name: 'Org B', completionRate: 75, assessmentPassRate: 79 },
    { name: 'Org C', completionRate: 68, assessmentPassRate: 72 },
    { name: 'Org D', completionRate: 79, assessmentPassRate: 81 },
    { name: 'Org E', completionRate: 85, assessmentPassRate: 90 }
  ];

  // Mock data for User Activity
  const userActivityData = [
    { month: 'Jan', logins: 2450, completions: 980 },
    { month: 'Feb', logins: 2280, completions: 1050 },
    { month: 'Mar', logins: 2780, completions: 1280 },
    { month: 'Apr', logins: 3120, completions: 1420 },
    { month: 'May', logins: 2890, completions: 1380 },
    { month: 'Jun', logins: 3240, completions: 1520 }
  ];

  useEffect(() => {
    if (orgId) {
      dispatch(fetchMessagesForAdmin(orgId));
    }
  }, [dispatch, orgId]);

  // Fetch content counts
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setCountsLoading(true);
        const response = await getContentCountsAll();
        console.log('Content counts response:', response);
        console.log('Response type:', typeof response);
        console.log('Response keys:', response ? Object.keys(response) : 'null');
        
        if (response && response.data) {
          setContentCounts(response.data);
        } else if (response) {
          setContentCounts(response);
        } else {
          console.error('No response received from getContentCountsAll');
        }
      } catch (error) {
        console.error('Failed to fetch content counts:', error);
      } finally {
        setCountsLoading(false);
      }
    };

    fetchCounts();
  }, []);

  // Fetch user analytics data
  useEffect(() => {
    const fetchUserAnalytics = async () => {
      try {
        setAnalyticsLoading(true);
        
        // Fetch real user analytics data from backend
        const response = await api.get('/api/admin/analytics/getUserData', {
          params: { timeRange: 'all' } // No time range filter for Admin Home
        });
        
        if (response.data && response.data.data) {
          const data = response.data.data;
          setUserAnalytics({
            dailyActiveUsers: data.dau || 0,
            monthlyActiveUsers: data.mau || 0,
            totalUsers: data.totalUsers || 0,
            avgTimeOnPlatform: parseInt(data.avgTimeOnPlatform?.match(/\d+/)?.[0] || 0) || 0
          });
        }
      } catch (error) {
        console.error('Failed to fetch user analytics:', error);
        // Fallback to mock data if API fails
        setUserAnalytics({
          dailyActiveUsers: 1247,
          monthlyActiveUsers: 3892,
          totalUsers: 5234,
          avgTimeOnPlatform: 42
        });
      } finally {
        setAnalyticsLoading(false);
      }
    };

    fetchUserAnalytics();
  }, []);

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
    { to: '/admin/learning-paths', title: 'Learning Paths', desc: 'Build structured, guided progressions.', Icon: GraduationCap },
    { to: '/admin/create-assignment', title: 'Create Assignment', desc: 'Assign tasks and set deadlines for learners.', Icon: PencilLine },
    // { to: '/admin/manage-assignments', title: 'Manage Assignments', desc: 'Track submissions and manage grading.', Icon: ClipboardList },
    // { to: '/admin/message-board', title: 'Message Board', desc: 'Broadcast updates to your organization.', Icon: MessageSquare },
    { to: '/admin/activity-log', title: 'Activity Log', desc: 'Review recent actions and system events.', Icon: Activity },
    { to: '/admin/help-center', title: 'Help Center', desc: 'Find documentation and get support.', Icon: HelpCircle },
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

        {/* Message Board Card */}
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
          <h2 className="admin-section-title">Getting Started</h2>
        </div>

        {/* 3-column row: two stats + quick links */}
        <div className="admin-summary-grid">
          {/* Stat Card 1: User Analytics */}
          <div className="admin-quick-links-card">
            <h2 className="admin-message-card-title" style={{ marginBottom: '18px', marginTop: '10px' }}>User Analytics</h2>
            <div className="adminhome-stats-grid">
              <div className="adminhome-stat-card">
                <div className="adminhome-stat-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                  <UserCheck size={24} />
                </div>
                <div className="adminhome-stat-info">
                  <div className="adminhome-stat-number">
                    {analyticsLoading ? '...' : userAnalytics.dailyActiveUsers.toLocaleString()}
                  </div>
                  <div className="adminhome-stat-label">Daily Active Users</div>
                </div>
              </div>

              <div className="adminhome-stat-card">
                <div className="adminhome-stat-icon" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}>
                  <Calendar size={24} />
                </div>
                <div className="adminhome-stat-info">
                  <div className="adminhome-stat-number">
                    {analyticsLoading ? '...' : userAnalytics.monthlyActiveUsers.toLocaleString()}
                  </div>
                  <div className="adminhome-stat-label">Monthly Active Users</div>
                </div>
              </div>

              <div className="adminhome-stat-card">
                <div className="adminhome-stat-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
                  <Users size={24} />
                </div>
                <div className="adminhome-stat-info">
                  <div className="adminhome-stat-number">
                    {analyticsLoading ? '...' : userAnalytics.totalUsers.toLocaleString()}
                  </div>
                  <div className="adminhome-stat-label">Total Users</div>
                </div>
              </div>

              <div className="adminhome-stat-card">
                <div className="adminhome-stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                  <Clock size={24} />
                </div>
                <div className="adminhome-stat-info">
                  <div className="adminhome-stat-number">
                    {analyticsLoading ? '...' : `${userAnalytics.avgTimeOnPlatform}m`}
                  </div>
                  <div className="adminhome-stat-label">Avg Time on Platform</div>
                </div>
              </div>
            </div>
          </div>

          {/* Stat Card 2: User Engagement Analytics */}
          <div className="admin-quick-links-card">
            <h2 className="admin-message-card-title"  style={{ marginBottom: '18px', marginTop: '10px' }}>Course Analytics</h2>
            <div className="adminhome-stats-grid">
              <div className="adminhome-stat-card">
                <div className="adminhome-stat-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                  <BookOpen size={24} />
                </div>
                <div className="adminhome-stat-info">
                  <div className="adminhome-stat-number">
                    {countsLoading ? '...' : (contentCounts?.modules?.total || 0)}
                  </div>
                  <div className="adminhome-stat-label">Total Modules</div>
                  {/* <div className="admin-stat-sublabel">
                    {countsLoading ? '...' : contentCounts.modules.published} Published
                  </div> */}
                </div>
              </div>

              <div className="adminhome-stat-card">
                <div className="adminhome-stat-icon" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}>
                  <ClipboardCheck size={24} />
                </div>
                <div className="adminhome-stat-info">
                  <div className="adminhome-stat-number">
                    {countsLoading ? '...' : (contentCounts?.assessments?.total || 0)}
                  </div>
                  <div className="adminhome-stat-label">Total Assessments</div>
                  {/* <div className="admin-stat-sublabel">
                    {countsLoading ? '...' : contentCounts.assessments.published} Published
                  </div> */}
                </div>
              </div>

              <div className="adminhome-stat-card">
                <div className="adminhome-stat-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
                  <ListChecks size={24} />
                </div>
                <div className="adminhome-stat-info">
                  <div className="adminhome-stat-number">
                    {countsLoading ? '...' : (contentCounts?.surveys?.total || 0)}
                  </div>
                  <div className="adminhome-stat-label">Total Surveys</div>
                  {/* <div className="admin-stat-sublabel">
                    {countsLoading ? '...' : contentCounts.surveys.published} Published
                  </div> */}
                </div>
              </div>

              <div className="adminhome-stat-card">
                <div className="adminhome-stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                  <GraduationCap size={24} />
                </div>
                <div className="adminhome-stat-info">
                  <div className="adminhome-stat-number">
                    {countsLoading ? '...' : (contentCounts?.learningPaths?.total || 0)}
                  </div>
                  <div className="adminhome-stat-label">Total Learning Paths</div>
                  {/* <div className="admin-stat-sublabel">
                    Active Programs
                  </div> */}
                </div>
              </div>
            </div>
          </div>


          {/* Quick Links */}
          <div className="admin-quick-links-card">
            <h2 className="admin-message-card-title admin-quick-link-item" style={{ padding: "10px 12px" }} >Quick Links</h2>
            <ul className="admin-quick-links-list" role="list">
              {quickLinks.map(({ to, title, desc, Icon }) => (
                <li key={to} className="admin-quick-link-item">
                  <Link to={to} className="admin-quick-link-row">
                    <span className="admin-quick-link-icon" aria-hidden="true">
                      <Icon size={22} />
                    </span>
                    <span className="admin-quick-link-text">
                      <span className="admin-quick-link-title">{title}</span>
                      <span className="admin-quick-link-desc">{desc}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;