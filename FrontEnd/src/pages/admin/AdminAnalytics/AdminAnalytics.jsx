import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Area,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';
import {
  Users,
  Activity,
  BookOpen,
  TrendingUp,
  AlertTriangle,
  Clock,
  Target,
  Zap,
  Calendar,
  Database,
  Award,
  Grid,
  UserX,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import './AdminAnalytics.css';
import api from '../../../services/api';
const COLORS = {
  primary: '#011F5B',
  accent: '#1C88C7',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
};

const CHART_COLORS = ['#011F5B', '#1C88C7', '#10b981', '#f59e0b', '#8b5cf6'];

const AdminAnalyticsDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [courseLibrary,setCourseLibrary] = useState([]);
  const [userData,setUserData] = useState({});
  const [usageTrend,setUsageTrend] = useState([]);
  const [courseAdoption,setCourseAdoption] = useState([]);
  useEffect(() => {
    const fetchCourseLibrary = async () => {
      try {
        const response = await api.get('/api/admin/analytics/getCourseDistribution');
        setCourseLibrary(response.data.courseLibrary);
      } catch (error) {
        console.error('Error fetching course library:', error);
      }
    };
    fetchCourseLibrary();

    const fetchUserData = async () => {
      try {
        const response = await api.get('/api/admin/analytics/getUserData');
        setUserData(response.data.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();

    const fetchUsageTrend = async () => {
      try {
        const response = await api.get('/api/admin/analytics/getUsageTrend');
        setUsageTrend(response.data.data);
        // console.log(response.data.data)
      } catch (error) {
        console.error('Error fetching usage trend:', error);
      }
    };
    fetchUsageTrend();

    const fetchCourseAdoption = async () => {
      try {
        const response = await api.get('/api/admin/analytics/getAdoption');
        // console.log(response.data)
        setCourseAdoption(response.data.data.courseAdoption);
      } catch (error) {
        console.error('Error fetching course adoption:', error);
      }
    };
    fetchCourseAdoption();
  },[])

  // Mock data - replace with actual API calls
  const [data, setData] = useState({
    // Total Usage Stats
    dau: 1247,
    dauChange: 8.5,
    mau: 3892,
    mauChange: 12.3,
    stickiness: 32,
    totalUsers: 4521,
    
    // Course Adoption
    courseAdoption: [
      { name: 'React Advanced', enrolled: 450, completed: 306, rate: 68, avgScore: 85 },
      { name: 'Python Basics', enrolled: 380, completed: 342, rate: 90, avgScore: 92 },
      { name: 'Cloud Architecture', enrolled: 290, completed: 174, rate: 60, avgScore: 78 },
      { name: 'Data Science', enrolled: 520, completed: 260, rate: 50, avgScore: 82 },
      { name: 'DevOps Fundamentals', enrolled: 410, completed: 328, rate: 80, avgScore: 88 },
    ],
    
    // Course Library by Category
    // courseLibrary: [
    //   { category: 'Engineering', courses: 45, teams: 8 },
    //   { category: 'Product', courses: 28, teams: 5 },
    //   { category: 'Design', courses: 22, teams: 4 },
    //   { category: 'Data Science', courses: 35, teams: 6 },
    //   { category: 'Sales', courses: 18, teams: 3 },
    //   { category: 'Marketing', courses: 25, teams: 4 },
    // ],
    
    // Engagement Heatmap (hour of day, day of week)
    engagementHeatmap: [
      // Monday
      { day: 'Mon', hour: 9, value: 145 },
      { day: 'Mon', hour: 10, value: 220 },
      { day: 'Mon', hour: 11, value: 180 },
      { day: 'Mon', hour: 14, value: 160 },
      { day: 'Mon', hour: 15, value: 190 },
      { day: 'Mon', hour: 16, value: 140 },
      { day: 'Mon', hour: 20, value: 95 },
      { day: 'Mon', hour: 21, value: 80 },
      // Tuesday
      { day: 'Tue', hour: 9, value: 155 },
      { day: 'Tue', hour: 10, value: 240 },
      { day: 'Tue', hour: 11, value: 195 },
      { day: 'Tue', hour: 14, value: 175 },
      { day: 'Tue', hour: 15, value: 210 },
      { day: 'Tue', hour: 16, value: 155 },
      { day: 'Tue', hour: 20, value: 105 },
      { day: 'Tue', hour: 21, value: 90 },
      // Wednesday
      { day: 'Wed', hour: 9, value: 165 },
      { day: 'Wed', hour: 10, value: 260 },
      { day: 'Wed', hour: 11, value: 205 },
      { day: 'Wed', hour: 14, value: 185 },
      { day: 'Wed', hour: 15, value: 220 },
      { day: 'Wed', hour: 16, value: 170 },
      { day: 'Wed', hour: 20, value: 115 },
      { day: 'Wed', hour: 21, value: 100 },
      // Thursday
      { day: 'Thu', hour: 9, value: 150 },
      { day: 'Thu', hour: 10, value: 230 },
      { day: 'Thu', hour: 11, value: 185 },
      { day: 'Thu', hour: 14, value: 165 },
      { day: 'Thu', hour: 15, value: 200 },
      { day: 'Thu', hour: 16, value: 145 },
      { day: 'Thu', hour: 20, value: 100 },
      { day: 'Thu', hour: 21, value: 85 },
      // Friday
      { day: 'Fri', hour: 9, value: 135 },
      { day: 'Fri', hour: 10, value: 200 },
      { day: 'Fri', hour: 11, value: 160 },
      { day: 'Fri', hour: 14, value: 130 },
      { day: 'Fri', hour: 15, value: 150 },
      { day: 'Fri', hour: 16, value: 110 },
      { day: 'Fri', hour: 20, value: 70 },
      { day: 'Fri', hour: 21, value: 55 },
      // Saturday
      { day: 'Sat', hour: 10, value: 85 },
      { day: 'Sat', hour: 11, value: 110 },
      { day: 'Sat', hour: 14, value: 95 },
      { day: 'Sat', hour: 15, value: 120 },
      { day: 'Sat', hour: 16, value: 100 },
      { day: 'Sat', hour: 20, value: 130 },
      { day: 'Sat', hour: 21, value: 115 },
      // Sunday
      { day: 'Sun', hour: 10, value: 75 },
      { day: 'Sun', hour: 11, value: 100 },
      { day: 'Sun', hour: 14, value: 85 },
      { day: 'Sun', hour: 15, value: 110 },
      { day: 'Sun', hour: 16, value: 90 },
      { day: 'Sun', hour: 20, value: 140 },
      { day: 'Sun', hour: 21, value: 125 },
    ],
    
    // Peak engagement times
    peakHours: [
      { time: '10:00 AM', users: 260, day: 'Wednesday' },
      { time: '3:00 PM', users: 220, day: 'Wednesday' },
      { time: '10:00 AM', users: 240, day: 'Tuesday' },
    ],
    
    // At-Risk Learners
    atRiskLearners: [
      { 
        name: 'Rajesh Kumar', 
        email: 'rajesh.k@company.com',
        team: 'Engineering',
        completionRate: 15, 
        avgScore: 45, 
        lastLogin: 25,
        riskLevel: 'high',
        coursesEnrolled: 4,
        coursesCompleted: 0
      },
      { 
        name: 'Priya Sharma', 
        email: 'priya.s@company.com',
        team: 'Product',
        completionRate: 30, 
        avgScore: 58, 
        lastLogin: 18,
        riskLevel: 'high',
        coursesEnrolled: 3,
        coursesCompleted: 1
      },
      { 
        name: 'Amit Patel', 
        email: 'amit.p@company.com',
        team: 'Engineering',
        completionRate: 42, 
        avgScore: 62, 
        lastLogin: 12,
        riskLevel: 'medium',
        coursesEnrolled: 5,
        coursesCompleted: 2
      },
      { 
        name: 'Sneha Reddy', 
        email: 'sneha.r@company.com',
        team: 'Design',
        completionRate: 25, 
        avgScore: 51, 
        lastLogin: 22,
        riskLevel: 'high',
        coursesEnrolled: 6,
        coursesCompleted: 1
      },
      { 
        name: 'Vikram Singh', 
        email: 'vikram.s@company.com',
        team: 'Sales',
        completionRate: 48, 
        avgScore: 65, 
        lastLogin: 10,
        riskLevel: 'medium',
        coursesEnrolled: 4,
        coursesCompleted: 2
      },
    ],
    
  });

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, [timeRange, selectedTeam]);

  const formatNumber = (n) => (n != null ? n.toLocaleString('en-IN') : '--');

  const MetricCard = ({ icon: Icon, label, value, subtitle, trend, trendValue, color, delay = 0 }) => (
    <div 
      className="metric-card-enhanced"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="metric-card-header">
        <div className={`metric-icon-enhanced ${color}`}>
          <Icon size={22} strokeWidth={2} />
        </div>
        {trend && (
          <div className={`metric-trend ${trend === 'up' ? 'trend-up' : 'trend-down'}`}>
            {trend === 'up' ? '↑' : '↓'}
            <span>{trendValue}%</span>
          </div>
        )}
      </div>
      <div className="metric-content">
        <div className="metric-label-enhanced">{label}</div>
        <div className="metric-value-enhanced">{value}</div>
        {subtitle && <div className="metric-subtitle">{subtitle}</div>}
      </div>
    </div>
  );

  // Get color intensity for heatmap
  const getHeatmapColor = (value) => {
    const max = Math.max(...data.engagementHeatmap.map(d => d.value));
    const intensity = value / max;
    if (intensity > 0.8) return '#011F5B';
    if (intensity > 0.6) return '#1C88C7';
    if (intensity > 0.4) return '#60a5fa';
    if (intensity > 0.2) return '#93c5fd';
    return '#dbeafe';
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner-enhanced" />
        <div className="loading-text">Loading Admin Analytics...</div>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-badge">
            <Zap size={14} />
            <span>Admin Dashboard</span>
          </div>
          <h1 className="page-title">Platform Analytics</h1>
          <p className="page-subtitle">
            Comprehensive insights into course performance, learner engagement, and platform health
          </p>
        </div>
        
        {/* <div className="header-filters">
          <div className="filter-group-enhanced">
            <label>Date Range</label>
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)} 
              className="filter-select-enhanced"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option> 
              <option value="90d">Last 90 days</option>
            </select>
          </div>
          <div className="filter-group-enhanced">
            <label>Team Filter</label>
            <select 
              value={selectedTeam} 
              onChange={(e) => setSelectedTeam(e.target.value)} 
              className="filter-select-enhanced"
            >
              <option value="all">All Teams</option>
              <option value="engineering">Engineering</option>
              <option value="product">Product</option>
              <option value="design">Design</option>
            </select>
          </div>
        </div> */}
      </div>

      {/* Key Metrics Grid - Total Usage */}
      <div className="metrics-grid-enhanced">
        <MetricCard
          icon={Activity}
          label="Daily Active Users"
          value={formatNumber(userData.dau)}
          subtitle="Last 24 hours"
          trend="up"
          trendValue={userData.dauChange}
          color="color-primary"
          delay={0}
        />
        <MetricCard
          icon={Users}
          label="Monthly Active Users"
          value={formatNumber(userData.mau)}
          subtitle="Last 30 days"
          trend="up"
          trendValue={userData.mauChange}
          color="color-secondary"
          delay={100}
        />
        <MetricCard
          icon={TrendingUp}
          label="Platform Stickiness"
          value={`${userData.stickinessScore}%`}
          subtitle="DAU/MAU ratio"
          color="color-tertiary"
          delay={200}
        />
        <MetricCard
          icon={Database}
          label="Total Users"
          value={formatNumber(userData.totalUsers)}
          subtitle="All registered users"
          color="color-neutral"
          delay={300}
        />
      </div>

      {/* Charts Row 1: Course Adoption & Usage Trend */}
      <div className="charts-grid">
        {/* Course Adoption Rate */}
        <div className="chart-panel">
          <div className="panel-header-enhanced">
            <div>
              <h3 className="panel-title">Course Adoption Analysis</h3>
              <p className="panel-description">Enrollment vs completion rates by course</p>
            </div>
            <Target size={20} className="panel-icon" />
          </div>
          
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={courseAdoption}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#9ca3af" 
                  style={{ fontSize: 11 }} 
                  angle={-15}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#9ca3af" style={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    background: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }} 
                />
                <Bar dataKey="enrolled" fill={COLORS.accent} name="Enrolled" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" fill={COLORS.success} name="Completed" radius={[4, 4, 0, 0]} />
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  stroke={COLORS.primary} 
                  strokeWidth={3}
                  name="Completion Rate (%)"
                  dot={{ fill: COLORS.primary, r: 5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          
          <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            <div style={{ textAlign: 'center', padding: '12px', background: '#f9fafb', borderRadius: '12px' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: COLORS.accent }}>
                {formatNumber(courseAdoption.reduce((acc, c) => acc + c.enrolled, 0))}
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500 }}>
                Total Enrolled
              </div>
            </div>
            <div style={{ textAlign: 'center', padding: '12px', background: '#f9fafb', borderRadius: '12px' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: COLORS.success }}>
                {formatNumber(courseAdoption.reduce((acc, c) => acc + c.completed, 0))}
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500 }}>
                Completed
              </div>
            </div>
            <div style={{ textAlign: 'center', padding: '12px', background: '#f9fafb', borderRadius: '12px' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: COLORS.primary }}>
                {Math.round(courseAdoption.reduce((acc, c) => acc + Number(c.rate), 0) / courseAdoption.length)}%
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500 }}>
                Avg Completion
              </div>
            </div>
          </div>
        </div>

        {/* DAU/MAU Trend */}
        <div className="chart-panel">
          <div className="panel-header-enhanced">
            <div>
              <h3 className="panel-title">Usage Trend</h3>
              <p className="panel-description">Daily and monthly active users over time</p>
            </div>
            <Activity size={20} className="panel-icon" />
          </div>
          
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={usageTrend}>
                <defs>
                  <linearGradient id="colorMau" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.accent} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={COLORS.accent} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: 12 }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    background: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }} 
                />
                <Area
                  type="monotone"
                  dataKey="mau"
                  stroke={COLORS.accent}
                  strokeWidth={2}
                  fill="url(#colorMau)"
                  name="MAU"
                />
                <Line
                  type="monotone"
                  dataKey="dau"
                  stroke={COLORS.primary}
                  strokeWidth={3}
                  name="DAU"
                  dot={{ fill: COLORS.primary, r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          
          <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1, textAlign: 'center', padding: '12px', background: '#f9fafb', borderRadius: '12px' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: COLORS.primary }}>
                {formatNumber(userData.dau)}
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500 }}>
                Current DAU
              </div>
            </div>
            <div style={{ flex: 1, textAlign: 'center', padding: '12px', background: '#f9fafb', borderRadius: '12px' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: COLORS.accent }}>
                {formatNumber(userData.mau)}
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500 }}>
                Current MAU
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Library */}
      <div className="chart-panel full-width">
        <div className="panel-header-enhanced">
          <div>
            <h3 className="panel-title">Course Library Distribution</h3>
            <p className="panel-description">Courses organized by category</p>
          </div>
          <BookOpen size={20} className="panel-icon" />
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '20px' }}>
          {courseLibrary.map((cat, idx) => (
            <div key={idx} className="health-metric">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
                    {cat.category}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {cat.teams} teams
                  </div>
                </div>
                <div style={{ 
                  width: '56px', 
                  height: '56px', 
                  borderRadius: '12px',
                  background: CHART_COLORS[idx % CHART_COLORS.length],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '24px',
                  fontWeight: 700
                }}>
                  {cat.courses}
                </div>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${(cat.courses / 50) * 100}%`,
                    background: CHART_COLORS[idx % CHART_COLORS.length]
                  }}
                />
              </div>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '6px' }}>
                {cat.courses} courses available
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Engagement Heatmap */}
      <div className="chart-panel full-width">
        <div className="panel-header-enhanced">
          <div>
            <h3 className="panel-title">Learner Engagement Heatmap</h3>
            <p className="panel-description">Activity patterns by day and time</p>
          </div>
          <Calendar size={20} className="panel-icon" />
        </div>
        
        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto repeat(7, 1fr)', gap: '4px', fontSize: '11px' }}>
            {/* Header row */}
            <div></div>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} style={{ textAlign: 'center', fontWeight: 600, color: '#6b7280', padding: '8px' }}>
                {day}
              </div>
            ))}
            
            {/* Time rows */}
            {[9, 10, 11, 14, 15, 16, 20, 21].map(hour => (
              <React.Fragment key={hour}>
                <div style={{ textAlign: 'right', padding: '8px', fontWeight: 600, color: '#6b7280' }}>
                  {hour}:00
                </div>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                  const dataPoint = data.engagementHeatmap.find(d => d.day === day && d.hour === hour);
                  const value = dataPoint ? dataPoint.value : 0;
                  return (
                    <div
                      key={`${day}-${hour}`}
                      style={{
                        background: getHeatmapColor(value),
                        padding: '12px',
                        borderRadius: '6px',
                        textAlign: 'center',
                        fontWeight: 600,
                        color: value > 150 ? 'white' : '#374151',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      title={`${day} ${hour}:00 - ${value} active users`}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {value}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
          
          <div style={{ marginTop: '24px', display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>Activity Level:</span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {[
                { label: 'Low', color: '#dbeafe' },
                { label: '', color: '#93c5fd' },
                { label: '', color: '#60a5fa' },
                { label: '', color: '#1C88C7' },
                { label: 'High', color: '#011F5B' },
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '20px', height: '20px', background: item.color, borderRadius: '4px' }} />
                  {item.label && <span style={{ fontSize: '11px', color: '#6b7280' }}>{item.label}</span>}
                </div>
              ))}
            </div>
          </div>
          
          <div style={{ marginTop: '20px', padding: '16px', background: '#f9fafb', borderRadius: '12px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>
              🔥 Peak Engagement Times
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {data.peakHours.map((peak, idx) => (
                <div key={idx} style={{ 
                  flex: '1 1 auto',
                  minWidth: '180px',
                  padding: '12px', 
                  background: 'white', 
                  borderRadius: '8px',
                  borderLeft: `4px solid ${COLORS.primary}`
                }}>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: COLORS.primary }}>
                    {peak.time}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                    {peak.day} • {peak.users} users
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* At-Risk Learners */}
      <div className="chart-panel full-width">
        <div className="panel-header-enhanced">
          <div>
            <h3 className="panel-title">At-Risk Learners</h3>
            <p className="panel-description">Learners requiring intervention or support</p>
          </div>
          <AlertTriangle size={20} className="panel-icon" style={{ color: COLORS.danger }} />
        </div>
        
                  <div style={{ marginTop: '20px' }}>
          <div style={{ marginBottom: '16px', display: 'flex', gap: '12px' }}>
            <div style={{ padding: '12px 20px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: COLORS.danger }}>
              ⚠️ {data.atRiskLearners.filter(l => l.riskLevel === 'high').length} High Risk
            </div>
            <div style={{ padding: '12px 20px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: COLORS.warning }}>
              ⚡ {data.atRiskLearners.filter(l => l.riskLevel === 'medium').length} Medium Risk
            </div>
          </div>
          
          <div className="orgs-table-wrapper">
            <table className="orgs-table">
              <thead>
                <tr>
                  <th>Risk</th>
                  <th>Learner</th>
                  <th>Team</th>
                  <th>Completion</th>
                  <th>Avg Score</th>
                  <th>Last Login</th>
                  <th>Courses</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.atRiskLearners.map((learner, idx) => (
                  <tr key={idx}>
                    <td>
                      <div style={{ 
                        display: 'inline-block',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: learner.riskLevel === 'high' ? COLORS.danger : COLORS.warning,
                        color: 'white'
                      }}>
                        {learner.riskLevel.toUpperCase()}
                      </div>
                    </td>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600, color: '#111827', fontSize: '14px' }}>
                          {learner.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>
                          {learner.email}
                        </div>
                      </div>
                    </td>
                    <td style={{ color: '#374151', fontWeight: 500 }}>{learner.team}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, maxWidth: '80px' }}>
                          <div className="progress-bar" style={{ height: '6px' }}>
                            <div 
                              className="progress-fill"
                              style={{ 
                                width: `${learner.completionRate}%`,
                                background: learner.completionRate < 30 ? COLORS.danger : learner.completionRate < 50 ? COLORS.warning : COLORS.success
                              }}
                            />
                          </div>
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                          {learner.completionRate}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <span style={{ 
                        fontSize: '14px', 
                        fontWeight: 600,
                        color: learner.avgScore < 60 ? COLORS.danger : learner.avgScore < 75 ? COLORS.warning : COLORS.success
                      }}>
                        {learner.avgScore}%
                      </span>
                    </td>
                    <td>
                      <span style={{ 
                        color: learner.lastLogin > 14 ? COLORS.danger : COLORS.warning,
                        fontWeight: 600,
                        fontSize: '13px'
                      }}>
                        {learner.lastLogin}d ago
                      </span>
                    </td>
                    <td style={{ color: '#374151' }}>
                      {learner.coursesCompleted}/{learner.coursesEnrolled}
                    </td>
                    <td>
                      <button style={{ 
                        padding: '8px 16px',
                        background: COLORS.primary,
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = COLORS.accent}
                      onMouseLeave={(e) => e.currentTarget.style.background = COLORS.primary}
                      >
                        Contact
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsDashboard;