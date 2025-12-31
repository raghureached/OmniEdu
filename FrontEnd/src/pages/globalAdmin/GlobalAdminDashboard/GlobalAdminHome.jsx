import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { BookOpen, Users, Award, TrendingUp, ClipboardCheck, ListChecks, GraduationCap, PencilLine, ClipboardList, MessageSquare, Activity, HelpCircle, Megaphone, Building } from 'lucide-react';
import './GlobalAdminHome.css';
import { fetchAllMessages } from '../../../store/slices/globalMessageSlice';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line
} from 'recharts';
import { AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { Clock } from 'lucide-react';
import api from '../../../services/api';

// Add this constant for colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const GlobalAdminHome = () => {
  const [organizationData, setOrganizationData] = useState([]);
  const [orgGrowthData, setOrgGrowthData] = useState([]);
  useEffect(() => {
    const fetchUserDistribution = async () => {
      try {
        const res = await api.get('/api/globalAdmin/getUserDistribution');
        if (res.data.success) {
          setOrganizationData(res.data.groupedUsers);
        }
      } catch (error) {

      }
    }
    const fetchOrgGrowth = async () => {
      try {
        const res = await api.get('/api/globalAdmin/getOrganizationGrowth');
        if (res.data.success) {
          setOrgGrowthData(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching organization growth data:', error);
      }
    };
    fetchOrgGrowth();
    fetchUserDistribution();
  }, []);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { currentMessages, loading } = useSelector((state) => state.globalMessage);
  const userName = user?.name || 'GlobalAdmin';
  const currentHour = new Date().getHours();
  // Global admin: no orgId needed here

  // Mock data for Organization Performance


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
    // Fetch all messages directly from the global message board (no org filter)
    dispatch(fetchAllMessages());
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
    // { to: '/global-admin/organizations', title: 'Organizations', desc: 'Manage and configure tenant organizations.', Icon: Building },
    // { to: '/global-admin/module', title: 'Modules', desc: 'Create and manage global modules.', Icon: BookOpen },
    // { to: '/global-admin/assessments', title: 'Assessments', desc: 'Build and manage global assessments.', Icon: ClipboardCheck },
    // { to: '/global-admin/surveys', title: 'Surveys', desc: 'Design and distribute surveys.', Icon: ListChecks },
    { to: '/global-admin/assignments', title: 'Assignments', desc: 'Assign content across organizations.', Icon: ClipboardList },
    // { to: '/global-admin/message-board', title: 'Message Board', desc: 'Broadcast updates platform-wide.', Icon: MessageSquare },
    { to: '/global-admin/users', title: 'Users', desc: 'View and administer users.', Icon: Users },
    // { to: '/global-admin/analytics-view', title: 'Analytics', desc: 'High-level analytics and trends.', Icon: TrendingUp },
    { to: '/global-admin/activity-log', title: 'Activity Log', desc: 'Review recent platform activities.', Icon: Activity },
    { to: '/global-admin/help-center', title: 'Help Center', desc: 'Find documentation and get support.', Icon: HelpCircle },
  ];
  const generateTrendData = (baseValue) => {
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date();
      day.setDate(day.getDate() - (6 - i));
      return {
        label: day.toLocaleDateString('en-US', { weekday: 'short' }),
        value: Math.max(0, baseValue * (0.8 + Math.random() * 0.4)) // Randomize around base value
      };
    });
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
                Welcome to OmniEdu Global Admin Dashboard
              </p>
            </div>
          </div>

          <div className="admin-welcome-description">
            <p>
              Manage your learning content, track organization progress, and create engaging educational experiences.
            </p>
          </div>
        </div>

        {/* Message Board (from Global Admin) */}
        {/* <div className="admin-message-card">
          <div className="admin-message-card-header">
            <h2 className="admin-message-card-title">Message Board</h2>
          </div> */}
        {/* <div className="admin-message-card-body">
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
          </div> */}
        {/* </div>   */}



        {/* Getting Started Section */}
        <div className="admin-getting-started">
          <h2 className="admin-section-title">Getting Started</h2>
        </div>

        {/* <div className="admin-summary-grid">
         
          <div className="admin-quick-links-card">
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

          <div className="admin-quick-links-card">
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


          
        </div> */}
        {/* Additional Charts Section */}
        <div className="admin-summary-grid" style={{ marginTop: '2rem' }}>
          {/* DAU Trend Chart */}
          <div className="admin-quick-links-card">
            <div className="panel-header-enhanced">
              <div>
                <h3 className="panel-title">Organization Growth</h3>
                <p className="panel-description">3-month growth trend</p>
              </div>
              <TrendingUp size={20} className="panel-icon" />
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={orgGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis
                    dataKey="month"
                    stroke="#6B7280"
                    style={{ fontSize: 12 }}
                  />
                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    stroke="#3B82F6"
                    style={{ fontSize: 12 }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#10B981"
                    style={{ fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                    formatter={(value, name) => {
                      if (name === 'New Organizations') {
                        return [value, name];
                      }
                      return [value, 'Total Organizations'];
                    }}
                  />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="newOrgs"
                    name="New Organizations"
                    fill="#3B82F6"
                    radius={[4, 4, 0, 0]}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="total"
                    name="Total Organizations"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* User Distribution Chart */}
          <div className="admin-quick-links-card">
            <div className="panel-header-enhanced">
              <div>
                <h3 className="panel-title">User Distribution Across Organizations</h3>
                <p className="panel-description">Total user allocation by organization</p>
              </div>
              <Users size={20} className="panel-icon" />
            </div>

            <div className="distribution-layout-vertical">
              <div className="distribution-chart">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={organizationData}
                      dataKey="userCount"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      label={false}

                    >
                      {organizationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, org) => [`${value}`, org.organizationName]}
                      cursorStyle={{ cursor: 'pointer' }}
                      cursor={{ fill: 'transparent' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="distribution-bars-grid">
                {organizationData.map((org, idx) => (
                  <div key={idx} className="distribution-bar-item">
                    <div className="bar-header">
                      <div className="bar-label">
                        <div className="bar-color" style={{ background: COLORS[idx] }} />
                        <span>{org.organizationName}</span>
                      </div>
                      <span className="bar-value">{org.userCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
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

export default GlobalAdminHome;