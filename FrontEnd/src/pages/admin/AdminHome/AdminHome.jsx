import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { BookOpen, Users, Award, TrendingUp, ClipboardCheck, ListChecks, GraduationCap, PencilLine, ClipboardList, MessageSquare, Activity, HelpCircle, Megaphone } from 'lucide-react';
import './AdminHome.css';
import { fetchMessagesForAdmin } from '../../../store/slices/globalMessageSlice';
import { getContentCountsAll } from '../../../utils/contentCountsService'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line
} from 'recharts';
import { fetchPermissions } from '../../../store/slices/roleSlice';

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
    useEffect(() => {
          // Initial fetch
          dispatch(fetchPermissions());
      
          // Set up interval for periodic updates (every 5 minutes)
          const permissionsInterval = setInterval(() => {
            dispatch(fetchPermissions());
          }, 5 * 60 * 1000); // 5 minutes in milliseconds
      
          // Cleanup interval on unmount
          return () => {
            clearInterval(permissionsInterval);
          };
        }, [dispatch]);

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
          {/* Stat Card 1: Organization Performance */}
          <div className="admin-quick-links-card">
            {/* <h3 className="admin-quick-links-title">Organization Performance</h3> */}
            <h2 className="admin-message-card-title"style={{ marginBottom: '1rem' }} >Completion Rates by Organization</h2>
            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer>
                <BarChart data={organizationData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="name" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip
                    wrapperStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px', padding: '10px' }}
                  />
                  <Legend/>
                  <Bar dataKey="completionRate" name="Completion Rate%" fill="#0088FE" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="assessmentPassRate" name="Pass Rate%" fill="#00C49F" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Stat Card 2: User Engagement Analytics */}
          <div className="admin-quick-links-card">
            <h2 className="admin-message-card-title" style={{ marginBottom: '2rem' }}>Courses Statistics</h2>
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <div className="admin-stat-icon">
                  <BookOpen size={24} />
                </div>
                <div className="admin-stat-info">
                  <div className="admin-stat-number">
                    {countsLoading ? '...' : (contentCounts?.modules?.total || 0)}
                  </div>
                  <div className="admin-stat-label">Total Modules</div>
                  {/* <div className="admin-stat-sublabel">
                    {countsLoading ? '...' : contentCounts.modules.published} Published
                  </div> */}
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-icon">
                  <ClipboardCheck size={24} />
                </div>
                <div className="admin-stat-info">
                  <div className="admin-stat-number">
                    {countsLoading ? '...' : (contentCounts?.assessments?.total || 0)}
                  </div>
                  <div className="admin-stat-label">Total Assessments</div>
                  {/* <div className="admin-stat-sublabel">
                    {countsLoading ? '...' : contentCounts.assessments.published} Published
                  </div> */}
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-icon">
                  <ListChecks size={24} />
                </div>
                <div className="admin-stat-info">
                  <div className="admin-stat-number">
                    {countsLoading ? '...' : (contentCounts?.surveys?.total || 0)}
                  </div>
                  <div className="admin-stat-label">Total Surveys</div>
                  {/* <div className="admin-stat-sublabel">
                    {countsLoading ? '...' : contentCounts.surveys.published} Published
                  </div> */}
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-icon">
                  <GraduationCap size={24} />
                </div>
                <div className="admin-stat-info">
                  <div className="admin-stat-number">
                    {countsLoading ? '...' : (contentCounts?.learningPaths?.total || 0)}
                  </div>
                  <div className="admin-stat-label">Total Learning Paths</div>
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