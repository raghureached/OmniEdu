import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { BookOpen, Users, Award, TrendingUp, ClipboardCheck, ListChecks, GraduationCap, PencilLine, ClipboardList, MessageSquare, Activity, HelpCircle, Megaphone, SearchX, Globe } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line,
  Global
} from 'recharts';
import { fetchMessages } from '../../../store/slices/messageSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { currentMessages, loading } = useSelector((state) => state.globalMessage);
  const userName = user?.name || 'Admin';
  const currentHour = new Date().getHours();
  // const orgId = user?.organization?.uuid
  //   || user?.organizationUuid
  //   || user?.organization_uuid
  //   || user?.orgId
  //   || user?.org_id
  //   || user?.organization_id
  //   || user?.orgUuid
  //   || user?.organizationUUID
  //   || user?.organizationId
  //   || user?.organization?.id;

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
                        <span style={{float:"right",display:"flex",alignItems:"center",gap:"5px",flexDirection:"column"}}>
                            
                            <span> </span>
                            {msg.isGlobal  ? "- OmniEdu Team" : "- Admin"}
                            
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
            {/* <h3 className="admin-quick-links-title">User Engagement Analytics</h3> */}
            <h2 className="admin-message-card-title" style={{ marginBottom: '1rem' }}>Monthly User Activity</h2>
            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer>
                <LineChart data={userActivityData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="month" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip
                    wrapperStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px', padding: '10px' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="logins" name="User Logins" stroke="#0088FE" strokeWidth={3} dot={{ r: 5 }} />
                  <Line type="monotone" dataKey="completions" name="Completions" stroke="#00C49F" strokeWidth={3} dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
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

export default Dashboard;