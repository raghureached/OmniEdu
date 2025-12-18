import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FileText,
  ClipboardList,
  Route,
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
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [courseLibrary, setCourseLibrary] = useState([]);
  const [teams, setTeams] = useState([]);
  const [userData, setUserData] = useState({});
  const [usageTrend, setUsageTrend] = useState([]);
  const [courseAdoption, setCourseAdoption] = useState([]);
  const [engagementHeatmap, setEngagementHeatmap] = useState([]);
  const [atRiskLearners, setAtRiskLearners] = useState([]);
  const [courseMetrics, setCourseMetrics] = useState({
    modules: 0,
    assessments: 0,
    surveys: 0,
    learningPaths: 0,
  });
  const [activeView, setActiveView] = useState('users'); // 'users' or 'courses'
  const [showFilters, setShowFilters] = useState(false);
  const [showUserFilters, setShowUserFilters] = useState(false);
  const [courseFilters, setCourseFilters] = useState({
    category: 'all',
    team: 'all',
    timeRange: '7d'
  });
  const [userFilters, setUserFilters] = useState({
    timeRange: '7d',
    userStatus: 'all'
  });

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

    const fetchTeams = async () => {
      try {
        const response = await api.get('/api/admin/analytics/getTeams');
        setTeams(response.data.teams);
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    };
    fetchTeams();

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

    const fetchCourseAdoption = async (filters = {}) => {
      try {
        const params = new URLSearchParams();
        if (filters.category && filters.category !== 'all') params.append('category', filters.category);
        if (filters.team && filters.team !== 'all') params.append('team', filters.team);
        
        const url = params.toString() ? `/api/admin/analytics/getAdoption?${params}` : '/api/admin/analytics/getAdoption';
        const response = await api.get(url);
        // console.log(response.data)
        setCourseAdoption(response.data.data.courseAdoption);
      } catch (error) {
        console.error('Error fetching course adoption:', error);
      }
    };
    fetchCourseAdoption(courseFilters);
    
    // Set mock course metrics data
    setCourseMetrics({
      modules: 45,
      assessments: 28,
      surveys: 15,
      learningPaths: 12,
    });
  }, [])

  const fetchUsageTrendWithFilters = async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.timeRange && filters.timeRange !== '30d') params.append('timeRange', filters.timeRange);
      if (filters.userStatus && filters.userStatus !== 'all') params.append('userStatus', filters.userStatus);
      
      const url = params.toString() ? `/api/admin/analytics/getUsageTrend?${params}` : '/api/admin/analytics/getUsageTrend';
      const response = await api.get(url);
      setUsageTrend(response.data.data);
    } catch (error) {
      console.error('Error fetching usage trend:', error);
    }
  };

  const fetchCourseAdoptionWithFilters = async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.category && filters.category !== 'all') params.append('category', filters.category);
      if (filters.team && filters.team !== 'all') params.append('team', filters.team);
      if (filters.timeRange) params.append('timeRange', filters.timeRange);
      
      const url = params.toString() ? `/api/admin/analytics/getAdoption?${params}` : '/api/admin/analytics/getAdoption';
      const response = await api.get(url);
      setCourseAdoption(response.data.data.courseAdoption);
    } catch (error) {
      console.error('Error fetching course adoption:', error);
    }
  };

  const fetchEngagementHeatmap = async (timeRange = '30d') => {
    try {
      const url = timeRange !== '30d' ? `/api/admin/analytics/getEngagementHeatmap?timeRange=${timeRange}` : '/api/admin/analytics/getEngagementHeatmap';
      const response = await api.get(url);
      console.log('Heatmap response:', response.data);
      setEngagementHeatmap(response.data.data);
    } catch (error) {
      console.error('Error fetching engagement heatmap:', error);
    }
  };

  const fetchAtRiskLearners = async (days = 30) => {
    try {
      const url = days !== 30 ? `/api/admin/analytics/getAtRiskLearners?days=${days}` : '/api/admin/analytics/getAtRiskLearners';
      const response = await api.get(url);
      console.log('At-risk learners response:', response.data);
      setAtRiskLearners(response.data.data);
    } catch (error) {
      console.error('Error fetching at-risk learners:', error);
    }
  };

  const fetchCourseLibraryWithTimeRange = async (filters = {}) => {
    try {
        const params = new URLSearchParams();
        if (filters.timeRange) params.append('timeRange', filters.timeRange);
        if (filters.category && filters.category !== 'all') params.append('category', filters.category);
        if (filters.team && filters.team !== 'all') params.append('team', filters.team);
        
        const url = params.toString() ? `/api/admin/analytics/getCourseDistribution?${params}` : '/api/admin/analytics/getCourseDistribution';
        const response = await api.get(url);
        setCourseLibrary(response.data.courseLibrary);
    } catch (error) {
        console.error('Error fetching course library with filters:', error);
    }
  };

  // Note: getCoursePerformance endpoint doesn't exist on backend
  // Using existing endpoints for course data instead

  // Initial data fetch
  useEffect(() => {
    fetchUsageTrendWithFilters(userFilters);
    fetchEngagementHeatmap(userFilters.timeRange);
    const days = userFilters.timeRange === '7d' ? 7 : userFilters.timeRange === '30d' ? 30 : 90;
    fetchAtRiskLearners(days);
  }, [])

  // Sync courseFilters.timeRange with timeRange
  useEffect(() => {
    setCourseFilters(prev => ({ ...prev, timeRange: timeRange }));
  }, [timeRange]);

  // Fetch data when activeView changes or timeRange changes
  useEffect(() => {
    if (activeView === 'users') {
      fetchUsageTrendWithFilters(userFilters);
      fetchEngagementHeatmap(userFilters.timeRange);
      const days = userFilters.timeRange === '7d' ? 7 : userFilters.timeRange === '30d' ? 30 : 90;
      fetchAtRiskLearners(days);
    } else if (activeView === 'courses') {
      fetchCourseAdoptionWithFilters({ ...courseFilters, timeRange: timeRange });
      fetchCourseLibraryWithTimeRange({ ...courseFilters, timeRange: timeRange });
    }
  }, [activeView, timeRange])

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
  // Add this ViewToggle component before the MetricCard component definition
  const ViewToggle = ({ activeView, onViewChange }) => (
    <div className="view-toggle-container">
      {/* <span className="view-toggle-label"></span> */}
      <div className="view-toggle-wrapper">
        <button
          className={`view-toggle-button ${activeView === 'users' ? 'active' : ''}`}
          onClick={() => onViewChange('users')}
        >
          <Users size={16} />
          <span>Users</span>
        </button>
        <button
          className={`view-toggle-button ${activeView === 'courses' ? 'active' : ''}`}
          onClick={() => onViewChange('courses')}
        >
          <BookOpen size={16} />
          <span>Courses</span>
        </button>
      </div>
    </div>
  );
  const MetricCard = ({ icon: Icon, label, value, subtitle, trend, trendValue, color, delay = 0, onClick }) => (
    <div
      className={`metric-card-enhanced ${onClick ? 'clickable' : ''}`}
      style={{ animationDelay: `${delay}ms` }}
      onClick={onClick}
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
    const max = engagementHeatmap.length > 0 ? Math.max(...engagementHeatmap.map(d => d.count)) : 1;
    const intensity = max > 0 ? value / max : 0;
    if (intensity > 0.8) return '#011F5B';
    if (intensity > 0.6) return '#1C88C7';
    if (intensity > 0.4) return '#60a5fa';
    if (intensity > 0.2) return '#93c5fd';
    return '#dbeafe';
  };

  // Calculate peak engagement times from heatmap data
  const getPeakEngagementTimes = () => {
    if (engagementHeatmap.length === 0) return [];
    
    // Sort by count to get top engagement times
    const sortedData = [...engagementHeatmap].sort((a, b) => b.count - a.count);
    
    // Get top 3 peak times
    return sortedData.slice(0, 3).map(item => ({
      time: `${item.hour}:00`,
      day: item.day,
      users: item.count
    }));
  };
const getRiskLevel = (riskFactors) => {
  if (riskFactors.length >= 3) return 'high';
  if (riskFactors.length >= 2) return 'medium';
  return 'low';
};

// Helper function to calculate days ago from lastLogin
const getDaysAgo = (lastLogin) => {
  console.log("last login date",lastLogin)
  if (!lastLogin) return 'Never';
  
  const lastLoginDate = new Date(lastLogin);
  const now = new Date();
  const diffTime = Math.abs(now - lastLoginDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays >= 30) return '30+ days ago';
  if (diffDays === 1) return '1 day ago';
  return `${diffDays} days ago`;
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

        <div className="header-filters">
          <div className="view-toggle-container">
            <div className="view-toggle-wrapper">
              <button
                className={`view-toggle-button ${timeRange === '7d' ? 'active' : ''}`}
                onClick={() => {
                  setTimeRange('7d');
                  setUserFilters(prev => ({ ...prev, timeRange: '7d' }));
                  fetchUsageTrendWithFilters({ ...userFilters, timeRange: '7d' });
                  fetchEngagementHeatmap('7d');
                  fetchAtRiskLearners(7);
                  // Also fetch course data with new time range
                  if (activeView === 'courses') {
                    fetchCourseAdoptionWithFilters({ ...courseFilters, timeRange: '7d' });
                    fetchCourseLibraryWithTimeRange({ ...courseFilters, timeRange: '7d' });
                  }
                }}
              >
                <Calendar size={16} />
                <span>7 Days</span>
              </button>
              <button
                className={`view-toggle-button ${timeRange === '30d' ? 'active' : ''}`}
                onClick={() => {
                  setTimeRange('30d');
                  setUserFilters(prev => ({ ...prev, timeRange: '30d' }));
                  fetchUsageTrendWithFilters({ ...userFilters, timeRange: '30d' });
                  fetchEngagementHeatmap('30d');
                  fetchAtRiskLearners(30);
                  // Also fetch course data with new time range
                  if (activeView === 'courses') {
                    fetchCourseAdoptionWithFilters({ ...courseFilters, timeRange: '30d' });
                    fetchCourseLibraryWithTimeRange({ ...courseFilters, timeRange: '30d' });
                  }
                }}
              >
                <Calendar size={16} />
                <span>1 Month</span>
              </button>
              <button
                className={`view-toggle-button ${timeRange === '90d' ? 'active' : ''}`}
                onClick={() => {
                  setTimeRange('90d');
                  setUserFilters(prev => ({ ...prev, timeRange: '90d' }));
                  fetchUsageTrendWithFilters({ ...userFilters, timeRange: '90d' });
                  fetchEngagementHeatmap('90d');
                  fetchAtRiskLearners(90);
                  // Also fetch course data with new time range
                  if (activeView === 'courses') {
                    fetchCourseAdoptionWithFilters({ ...courseFilters, timeRange: '90d' });
                    fetchCourseLibraryWithTimeRange({ ...courseFilters, timeRange: '90d' });
                  }
                }}
              >
                <Calendar size={16} />
                <span>3 Months</span>
              </button>
            </div>
          </div>
          <ViewToggle
            activeView={activeView}
            onViewChange={setActiveView}
          />

       
        </div> 
      </div>
      {activeView === 'users' && (
        <>
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
              onClick={() => navigate('/admin/users')}
            />
            <MetricCard
              icon={Users}
              label="Monthly Active Users"
              value={formatNumber(userData.mau)}
              subtitle="Last 30 days"
              trend="up"
              trendValue={userData.mauChange}
              color="color-assessment"
              delay={100}
              onClick={() => navigate('/admin/users')}
            />
            <MetricCard
              icon={Database}
              label="Total Users"
              value={formatNumber(userData.totalUsers)}
              subtitle="All registered users"
              trend="up"
              trendValue={15.2}
              color="color-tertiary"
              delay={300}
              onClick={() => navigate('/admin/users')}
            />
             <MetricCard
              icon={Clock}
              label="Avg Time on Platform"
              value="2h 45m"
              subtitle="Per user daily average"
              trend="up"
              trendValue={8.7}
              color="color-neutral"
              delay={400}
            />
             <MetricCard
              icon={TrendingUp}
              label="Platform Stickiness"
              value={`${userData.stickinessScore}%`}
              subtitle="DAU/MAU ratio"
              trend="up"
              trendValue={5.3}
              color="color-quaternary"
              delay={200}
            />
            
          </div>

          {/* Charts Row 1: Course Adoption & Usage Trend */}
           <div style={{ display: 'grid', gridTemplateColumns: showUserFilters ? '80% 20%' : '100%', gap: '20px', marginBottom: '24px', transition: 'all 0.3s ease' }}>
      {/* Usage Trend Chart - 70% */}
      <div className="chart-panel">
        <div className="panel-header-enhanced">
          <div>
            <h3 className="panel-title">Usage Trend</h3>
            <p className="panel-description">Daily and monthly active users over time</p>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {/* <Activity size={20} className="panel-icon" /> */}
            
            {/* Filter Dropdown Button */}
            <button
              onClick={() => setShowUserFilters(!showUserFilters)}
              style={{
                padding: '8px 16px',
                background: showUserFilters ? 'linear-gradient(135deg, #011F5B, #1C88C7)' : '#f9fafb',
                color: showUserFilters ? 'white' : '#374151',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                if (!showUserFilters) {
                  e.currentTarget.style.background = '#f3f4f6';
                  e.currentTarget.style.borderColor = '#1C88C7';
                }
              }}
              onMouseLeave={(e) => {
                if (!showUserFilters) {
                  e.currentTarget.style.background = '#f9fafb';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }
              }}
            >
              <Grid size={16} />
              Filters
            </button>
          </div>
        </div>

        <div className="chart-container">
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={usageTrend}>
              <defs>
                <linearGradient id="colorMau" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.accent} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="date" stroke="#000000" style={{ fontSize: 12 }} />
              <YAxis stroke="#000000" style={{ fontSize: 12 }} />
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

      {/* Filters Panel - 20% - Conditional */}
      {showUserFilters && (
        <div className="chart-panel">
          <div className="panel-header-enhanced">
            <div>
              <h3 className="panel-title">Filters</h3>
              <p className="panel-description">Refine your view</p>
            </div>
            <Grid size={20} className="panel-icon" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '12px' }}>
            {/* Time Range Filter */}
            <div className="filter-group-enhanced">
              <label>Time Range</label>
              <select 
                value={userFilters.timeRange}
                onChange={(e) => setUserFilters(prev => ({ ...prev, timeRange: e.target.value }))}
                className="filter-select-enhanced"
                style={{ minWidth: 'auto', width: '100%' }}
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
            </div>

            {/* User Status Filter */}
            <div className="filter-group-enhanced">
              <label>User Status</label>
              <select 
                value={userFilters.userStatus}
                onChange={(e) => setUserFilters(prev => ({ ...prev, userStatus: e.target.value }))}
                className="filter-select-enhanced"
                style={{ minWidth: 'auto', width: '100%' }}
              >
                <option value="all">All Users</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="new">New Users</option>
                <option value="at-risk">At Risk</option>
              </select>
            </div>

            {/* Quick Stats in Filters */}
            <div style={{ 
              marginTop: '12px', 
              padding: '16px', 
              background: '#f9fafb', 
              borderRadius: '12px',
              border: '2px solid #e5e7eb'
            }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '12px' }}>
                QUICK STATS
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#374151' }}>Total Users</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: COLORS.primary }}>
                    {formatNumber(userData.totalUsers || 0)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#374151' }}>New This Month</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: COLORS.warning }}>
                    {formatNumber(userData.newUsersThisMonth || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Apply Filters Button */}
            <button 
              onClick={() => {
                fetchUsageTrendWithFilters(userFilters);
                fetchEngagementHeatmap(userFilters.timeRange);
                const days = userFilters.timeRange === '7d' ? 7 : userFilters.timeRange === '30d' ? 30 : 90;
                fetchAtRiskLearners(days);
                setShowUserFilters(false); // Close filter panel
                console.log('User filters applied:', userFilters);
              }}
              style={{
                padding: '12px 20px',
                background: 'linear-gradient(135deg, #011F5B, #1C88C7)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: '0 4px 12px rgba(1, 31, 91, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(1, 31, 91, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(1, 31, 91, 0.2)';
              }}
            >
              Apply Filters
            </button>
            
            {/* Reset Filters Button */}
            <button 
              onClick={() => {
                setUserFilters({ timeRange: '30d', userStatus: 'all' });
                setTimeRange('30d');
                setShowUserFilters(false); // Close filter panel
                // Load default data
                fetchUsageTrendWithFilters({ timeRange: '30d', userStatus: 'all' });
                fetchEngagementHeatmap('30d');
                fetchAtRiskLearners(30);
              }}
              style={{
                padding: '12px 20px',
                background: '#f9fafb',
                color: '#374151',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f3f4f6';
                e.currentTarget.style.borderColor = '#1C88C7';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f9fafb';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
            >
              Reset
            </button>
          </div>
        </div>
      )}
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
                      const dataPoint = engagementHeatmap.find(d => d.day === day && d.hour === hour);
                      const value = dataPoint ? dataPoint.count : 0;
                      return (
                        <div
                          key={`${day}-${hour}`}
                          style={{
                            background: getHeatmapColor(value),
                            padding: '12px',
                            borderRadius: '6px',
                            textAlign: 'center',
                            fontWeight: 600,
                            color: value > (engagementHeatmap.length > 0 ? Math.max(...engagementHeatmap.map(d => d.count)) * 0.6 : 150) ? 'white' : '#374151',
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
                  {getPeakEngagementTimes().map((peak, idx) => (
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
                  {getPeakEngagementTimes().length === 0 && (
                    <div style={{ 
                      padding: '20px', 
                      textAlign: 'center', 
                      color: '#6b7280',
                      fontSize: '14px',
                      width: '100%'
                    }}>
                      No engagement data available
                    </div>
                  )}
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
                  ⚠️ {atRiskLearners.filter(l => getRiskLevel(l.riskFactors) === 'high').length} High Risk
                </div>
                <div style={{ padding: '12px 20px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: COLORS.warning }}>
                  ⚡ {atRiskLearners.filter(l => getRiskLevel(l.riskFactors) === 'medium').length} Medium Risk
                </div>
              </div>

              <div className="orgs-table-wrapper">
                <table className="orgs-table">
                  <thead>
                    <tr>
                      <th>Risk</th>
                      <th>Learner</th>
                      {/* <th>Team</th> */}
                      <th>Completion</th>
                      <th>Avg Score</th>
                      <th>Last Login</th>
                      {/* <th>Courses</th> */}
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {atRiskLearners.slice(0, 5).map((learner, idx) => (
                      <tr key={idx}>
                        <td>
                          <div style={{
                            display: 'inline-block',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background: getRiskLevel(learner.riskFactors) === 'high' ? COLORS.danger : COLORS.warning,
                            color: 'white'
                          }}>
                            {getRiskLevel(learner.riskFactors).toUpperCase()}
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
                        {/* <td style={{ color: '#374151', fontWeight: 500 }}>{learner.team}</td> */}
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
                            fontWeight: 600,paddingLeft:"25px",
                            color: learner.averageScore < 60 ? COLORS.danger : learner.averageScore < 75 ? COLORS.warning : COLORS.success,
                            
                          }}>
                            {learner.averageScore}%
                          </span>
                        </td>
                        <td>
                          <span style={{
                            color: !learner.lastLogin || getDaysAgo(learner.lastLogin).includes('30+') ? COLORS.danger : COLORS.warning,
                            fontWeight: 600,
                            fontSize: '13px'
                          }}>
                            {getDaysAgo(learner.lastLogin)}
                          </span>
                        </td>
                        {/* <td style={{ color: '#374151' }}>
                          {console.log('Learner courses data:', learner.coursesCompleted, learner.coursesEnrolled, learner)}
                          {learner.coursesCompleted || 0}/{learner.coursesEnrolled || 0}
                        </td> */}
                        <td>
                          <button 
                            onClick={() => {
                              // Navigate to users management with user data to highlight and show analytics
                              navigate('/admin/users', { 
                                state: { 
                                  highlightedUser: {
                                    email: learner.email,
                                    name: learner.name,
                                    showAnalytics: true
                                  }
                                } 
                              });
                            }}
                            style={{
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
                          View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>)}
      {activeView === 'courses' && (
        <>
          {/* Key Metrics Grid - Course Content */}
          <div className="metrics-grid-enhanced">
            <MetricCard
              icon={FileText}
              label="Modules"
              value={formatNumber(courseMetrics.modules)}
              subtitle="Available modules"
              trend="up"
              trendValue={8.3}
              color="color-primary"
              delay={0}
              onClick={() => navigate('/admin/content-modules')}
            />
            <MetricCard
              icon={ClipboardList}
              label="Assessments"
              value={formatNumber(courseMetrics.assessments)}
              subtitle="Available assessments"
              trend="up"
              trendValue={12.7}
              color="color-assessment"
              delay={100}
              onClick={() => navigate('/admin/content-assessments')}
            />
            <MetricCard
              icon={CheckCircle}
              label="Surveys"
              value={formatNumber(courseMetrics.surveys)}
              subtitle="Available surveys"
              trend="up"
              trendValue={6.2}
              color="color-tertiary"
              delay={200}
              onClick={() => navigate('/admin/manage-surveys')}
            />
            <MetricCard
              icon={Route}
              label="Learning Paths"
              value={formatNumber(courseMetrics.learningPaths)}
              subtitle="Available learning paths"
              trend="up"
              trendValue={15.8}
              color="color-neutral"
              delay={300}
              onClick={() => navigate('/admin/learning-paths')}
            />
            <MetricCard
              icon={Target}
              label="Completion Rate"
              value="68%"
              subtitle={`${courseAdoption.reduce((acc, c) => acc + c.completed, 0)} of ${courseAdoption.reduce((acc, c) => acc + c.enrolled, 0)} learners`}
              trend="up"
              trendValue={12.5}
              color="color-quaternary"
              delay={400}
            />
          </div>

          {/* Charts Row 1: Course Adoption & Usage Trend */}
         
          <div style={{ display: 'grid', gridTemplateColumns: showFilters ? '80% 20%' : '100%', gap: '20px', marginBottom: '24px', transition: 'all 0.3s ease' }}>
      {/* Course Adoption Chart - 70% */}
      <div className="chart-panel">
        <div className="panel-header-enhanced">
          <div>
            <h3 className="panel-title">Course Adoption Analysis</h3>
            <p className="panel-description">Enrollment vs completion rates by course</p>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {/* <Target size={20} className="panel-icon" /> */}
            
            {/* Filter Dropdown Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                padding: '8px 16px',
                background: showFilters ? 'linear-gradient(135deg, #011F5B, #1C88C7)' : '#f9fafb',
                color: showFilters ? 'white' : '#374151',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                if (!showFilters) {
                  e.currentTarget.style.background = '#f3f4f6';
                  e.currentTarget.style.borderColor = '#1C88C7';
                }
              }}
              onMouseLeave={(e) => {
                if (!showFilters) {
                  e.currentTarget.style.background = '#f9fafb';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }
              }}
            >
              <Grid size={16} />
              Filters
            </button>
          </div>
        </div>

        <div className="chart-container">
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={courseAdoption}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#000000"
                style={{ fontSize: 11 }}
                height={60}
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => {
                  if (value.length > 30) {
                    return value.substring(0, 30) + '...';
                  }
                  return value;
                }}
              />
              <YAxis 
                stroke="#000000" 
                style={{ fontSize: 12 }} 
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
              />
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

        <div style={{  display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
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
              {courseAdoption.length > 0 
                ? `${Math.round(courseAdoption.reduce((acc, c) => acc + Number(c.rate), 0) / courseAdoption.length)}%`
                : '0%'
              }
            </div>
            <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500 }}>
              Avg Completion
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel - 20% - Conditional */}
      {showFilters && (
        <div className="chart-panel">
          <div className="panel-header-enhanced">
            <div>
              <h3 className="panel-title">Filters</h3>
              <p className="panel-description">Refine your view</p>
            </div>
            <Grid size={20} className="panel-icon" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px'}}>
            {/* Category Filter */}
            <div className="filter-group-enhanced">
              <label>Category</label>
              <select 
                value={courseFilters.category}
                onChange={(e) => setCourseFilters(prev => ({ ...prev, category: e.target.value }))}
                className="filter-select-enhanced"
                style={{ minWidth: 'auto', width: '100%' }}
              >
                <option value="all">All Categories</option>
                {courseLibrary.map((cat, idx) => (
                  <option key={idx} value={cat.category}>{cat.category}</option>
                ))}
              </select>
            </div>

            {/* Team Filter */}
            <div className="filter-group-enhanced">
              <label>Team</label>
              <select 
                value={courseFilters.team}
                onChange={(e) => setCourseFilters(prev => ({ ...prev, team: e.target.value }))}
                className="filter-select-enhanced"
                style={{ minWidth: 'auto', width: '100%' }}
              >
                <option value="all">All Teams</option>
                {teams.map((team, idx) => (
                  <option key={team._id} value={team._id}>{team.name}</option>
                ))}
              </select>
            </div>

            {/* Quick Stats in Filters */}
            <div style={{ 
              marginTop: '12px', 
              padding: '16px', 
              background: '#f9fafb', 
              borderRadius: '12px',
              border: '2px solid #e5e7eb'
            }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '12px' }}>
                QUICK STATS
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#374151' }}>Filtered Courses</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: COLORS.primary }}>
                    {courseAdoption.length}
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#374151' }}>Total Learners</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: COLORS.warning }}>
                    {formatNumber(courseAdoption.reduce((acc, c) => acc + c.enrolled, 0))}
                  </span>
                </div>
              </div>
            </div>

            {/* Apply Filters Button */}
            <button 
              onClick={() => {
                fetchCourseAdoptionWithFilters(courseFilters);
                fetchCourseLibraryWithTimeRange(courseFilters);
                setShowFilters(false); // Close filter panel
                console.log('Filters applied:', courseFilters);
              }}
              style={{
                padding: '12px 20px',
                background: 'linear-gradient(135deg, #011F5B, #1C88C7)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: '0 4px 12px rgba(1, 31, 91, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(1, 31, 91, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(1, 31, 91, 0.2)';
              }}
            >
              Apply Filters
            </button>
            
            {/* Reset Filters Button */}
            <button 
              onClick={() => {
                setCourseFilters({ category: 'all', team: 'all', timeRange: timeRange });
                setShowFilters(false); // Close filter panel
                // Load default data with all categories and teams
                fetchCourseAdoptionWithFilters({ category: 'all', team: 'all', timeRange: timeRange });
                fetchCourseLibraryWithTimeRange({ category: 'all', team: 'all', timeRange: timeRange });
              }}
              style={{
                padding: '12px 20px',
                background: '#f9fafb',
                color: '#374151',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f3f4f6';
                e.currentTarget.style.borderColor = '#1C88C7';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f9fafb';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
            >
              Reset
            </button>
          </div>
        </div>
      )}
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
                <div 
                  key={idx} 
                  className="health-metric clickable"
                  onClick={() => navigate('/admin/content-modules', { 
                    state: { 
                      status: 'Published', 
                      category: cat.category,
                      timeRange: courseFilters.timeRange,
                      team: courseFilters.team !== 'all' ? courseFilters.team : null
                    } 
                  })}
                >
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
        
         

          {/* Course Performance & Adoption Insights */}
          <div className="chart-panel full-width">
            <div className="panel-header-enhanced">
              <div>
                <h3 className="panel-title">Course Performance Insights</h3>
                <p className="panel-description">Top performing courses and adoption metrics</p>
              </div>
              <Award size={20} className="panel-icon" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginTop: '20px' }}>
              {/* Top Performing Courses */}
              <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <TrendingUp size={18} style={{ color: COLORS.success }} />
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>
                    Top Performing Courses
                  </h4>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {courseAdoption
                    .sort((a, b) => b.rate - a.rate)
                    .slice(0, 5)
                    .map((course, idx) => (
                      <div 
                        key={idx}
                        style={{
                          background: 'white',
                          padding: '16px',
                          borderRadius: '12px',
                          borderLeft: `4px solid ${COLORS.success}`,
                          transition: 'all 0.2s',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateX(4px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateX(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '4px' }}>
                              {course.name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                              {course.enrolled} enrolled • {course.completed} completed
                            </div>
                          </div>
                          <div style={{
                            padding: '4px 10px',
                            borderRadius: '8px',
                            background: 'rgba(16, 185, 129, 0.1)',
                            fontSize: '13px',
                            fontWeight: 700,
                            color: COLORS.success
                          }}>
                            {course.rate}%
                          </div>
                        </div>
                        <div className="progress-bar" style={{ height: '6px' }}>
                          <div
                            className="progress-fill"
                            style={{
                              width: `${course.rate}%`,
                              background: COLORS.success
                            }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Courses Needing Attention */}
              <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <AlertTriangle size={18} style={{ color: COLORS.warning }} />
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>
                    Courses Needing Attention
                  </h4>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {courseAdoption
                    .sort((a, b) => a.rate - b.rate)
                    .slice(0, 5)
                    .map((course, idx) => (
                      <div 
                        key={idx}
                        style={{
                          background: 'white',
                          padding: '16px',
                          borderRadius: '12px',
                          borderLeft: `4px solid ${course.rate < 40 ? COLORS.danger : COLORS.warning}`,
                          transition: 'all 0.2s',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateX(4px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateX(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '4px' }}>
                              {course.name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                              {course.enrolled} enrolled • {course.completed} completed
                            </div>
                          </div>
                          <div style={{
                            padding: '4px 10px',
                            borderRadius: '8px',
                            background: course.rate < 40 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                            fontSize: '13px',
                            fontWeight: 700,
                            color: course.rate < 40 ? COLORS.danger : COLORS.warning
                          }}>
                            {course.rate}%
                          </div>
                        </div>
                        <div className="progress-bar" style={{ height: '6px' }}>
                          <div
                            className="progress-fill"
                            style={{
                              width: `${course.rate}%`,
                              background: course.rate < 40 ? COLORS.danger : COLORS.warning
                            }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div style={{ 
              marginTop: '20px', 
              padding: '20px', 
              background: 'linear-gradient(135deg, #011F5B, #1C88C7)', 
              borderRadius: '16px',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '20px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 700, color: 'white', marginBottom: '4px' }}>
                  {courseAdoption.filter(c => c.rate >= 70).length}
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                  High Performance (≥70%)
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 700, color: 'white', marginBottom: '4px' }}>
                  {courseAdoption.filter(c => c.rate >= 40 && c.rate < 70).length}
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                  Moderate (40-69%)
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 700, color: 'white', marginBottom: '4px' }}>
                  {courseAdoption.filter(c => c.rate < 40).length}
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                  Needs Attention (40%)
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 700, color: 'white', marginBottom: '4px' }}>
                  {courseAdoption.length > 0 
                    ? `${Math.round(courseAdoption.reduce((acc, c) => acc + Number(c.rate), 0) / courseAdoption.length)}%`
                    : '0%'
                  }
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                  Average Completion Rate
                </div>
              </div>
            </div>
          </div>
          


        </>)}

    </div>
  );
};

export default AdminAnalyticsDashboard;