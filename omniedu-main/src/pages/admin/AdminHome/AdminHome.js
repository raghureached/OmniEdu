import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUsers } from '../../../store/slices/userSlice';
import { fetchContent } from '../../../store/slices/contentSlice';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
         PieChart, Pie, Cell, Sector, LineChart, Line, AreaChart, Area } from 'recharts';
import { Users, BookOpen, Award, CheckCircle, Activity, Clock } from 'lucide-react';
import './AdminHome.css';

const AdminHome = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items: users, loading: usersLoading } = useSelector((state) => state.users);
  const { items: content, loading: contentLoading } = useSelector((state) => state.content);
  
  // State for dashboard data
  const [userStats, setUserStats] = useState(null);
  const [contentStats, setContentStats] = useState(null);
  const [activityData, setActivityData] = useState([]);
  const [completionRates, setCompletionRates] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [burndownData, setBurndownData] = useState([]);
  
  // Animation states
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeLineIndex, setActiveLineIndex] = useState(null);
  const [showLines, setShowLines] = useState({ created: false, completed: false });
  const [showAreas, setShowAreas] = useState({ planned: false, actual: false });
  
  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchContent());
    
    // Generate mock data for demonstration
    generateMockData();
    
    // Trigger animations after a short delay
    setTimeout(() => {
      setIsLoaded(true);
    }, 300);

    // Animate line appearance with staggered timing
    setTimeout(() => {
      setShowLines({ created: true, completed: false });
    }, 800);

    setTimeout(() => {
      setShowLines({ created: true, completed: true });
    }, 1400);
    
    // Animate area chart appearance with staggered timing
    setTimeout(() => {
      setShowAreas({ planned: true, actual: false });
    }, 1000);

    setTimeout(() => {
      setShowAreas({ planned: true, actual: true });
    }, 1600);
  }, [dispatch]);
  
  // Generate mock data for the dashboard
  const generateMockData = () => {
    // User statistics
    setUserStats({
      total: 1250,
      active: 876,
      newThisMonth: 124,
      growth: 8.5
    });
    
    // Content statistics
    setContentStats({
      totalCourses: 78,
      totalAssessments: 156,
      completionRate: 68,
      averageRating: 4.2
    });
    
    // Monthly user activity data - for line chart
    setActivityData([]);
    
    // Animate data loading with a delay for each month
    const fullData = [
      { name: 'Jan', created: 42, completed: 30 },
      { name: 'Feb', created: 55, completed: 40 },
      { name: 'Mar', created: 60, completed: 45 },
      { name: 'Apr', created: 45, completed: 35 },
      { name: 'May', created: 65, completed: 50 },
      { name: 'Jun', created: 75, completed: 60 },
    ];
    
    // Gradually add data points with delay
    fullData.forEach((item, index) => {
      setTimeout(() => {
        setActivityData(prev => [...prev, item]);
      }, 300 * (index + 1));
    });
    
    // Project burndown data - for area chart
    setBurndownData([]);
    
    // Animate data loading with a delay for each week
    const burndownFullData = [
      { name: 'Week 1', planned: 100, actual: 95 },
      { name: 'Week 2', planned: 85, actual: 82 },
      { name: 'Week 3', planned: 70, actual: 75 },
      { name: 'Week 4', planned: 55, actual: 65 },
      { name: 'Week 5', planned: 40, actual: 52 },
      { name: 'Week 6', planned: 25, actual: 38 },
      { name: 'Week 7', planned: 10, actual: 20 },
      { name: 'Week 8', planned: 0, actual: 5 },
    ];
    
    // Gradually add data points with delay
    burndownFullData.forEach((item, index) => {
      setTimeout(() => {
        setBurndownData(prev => [...prev, item]);
      }, 250 * (index + 1));
    });
    
    // Course completion rates by category
    setCompletionRates([]);
    
    // Animate pie chart data loading
    const pieData = [
      { name: 'Technical', value: 72 },
      { name: 'Soft Skills', value: 63 },
      { name: 'Compliance', value: 89 },
      { name: 'Leadership', value: 58 },
      { name: 'Product', value: 76 }
    ];
    
    // Gradually add pie chart segments with delay
    pieData.forEach((item, index) => {
      setTimeout(() => {
        setCompletionRates(prev => [...prev, item]);
      }, 400 * (index + 1));
    });
    
    // Recent activities
    setRecentActivities([]);
    
    // Animate activity items appearing
    const activities = [
      { id: 1, user: 'John Smith', action: 'Completed course', item: 'Advanced JavaScript', time: '2 hours ago' },
      { id: 2, user: 'Sarah Johnson', action: 'Enrolled in', item: 'Leadership Fundamentals', time: '3 hours ago' },
      { id: 3, user: 'Michael Brown', action: 'Submitted assessment', item: 'React Certification', time: '5 hours ago' },
      { id: 4, user: 'Emily Davis', action: 'Started course', item: 'Data Analysis Basics', time: '6 hours ago' },
      { id: 5, user: 'David Wilson', action: 'Completed assessment', item: 'Security Compliance', time: '8 hours ago' },
    ];
    
    // Gradually add activity items with delay
    activities.forEach((item, index) => {
      setTimeout(() => {
        setRecentActivities(prev => [...prev, item]);
      }, 200 * (index + 1));
    });
  };
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  // Format large numbers
  const formatNumber = (num) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num;
  };
  
  // Pie chart active sector renderer
  const renderActiveShape = (props) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const sin = Math.sin(-midAngle * Math.PI / 180);
    const cos = Math.cos(-midAngle * Math.PI / 180);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
          {payload.name}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`${value}%`}</text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
          {`(${(percent * 100).toFixed(2)}%)`}
        </text>
      </g>
    );
  };
  
  // Handle pie hover
  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };
  
  // Handle line hover
  const handleLineHover = (data, index) => {
    setActiveLineIndex(index);
  };
  
  // Custom tooltip for burndown chart
  const BurndownTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="burndown-tooltip">
          <p className="burndown-tooltip-label">{label}</p>
          <p className="burndown-tooltip-planned">
            <span className="burndown-tooltip-dot" style={{ backgroundColor: '#8884d8' }}></span>
            Planned: {payload[0].value}%
          </p>
          <p className="burndown-tooltip-actual">
            <span className="burndown-tooltip-dot" style={{ backgroundColor: '#82ca9d' }}></span>
            Actual: {payload[1].value}%
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="admin-dashboard-container">
      <div className="admin-dashboard-header">
        <p className="admin-welcome-message">Welcome back, {user?.name || 'Admin'}! Here's what's happening in your learning management system.</p>
      </div>
      
      {/* Key Metrics Section */}
      <div className={`admin-metrics-grid ${isLoaded ? 'animate-in' : ''}`}>
        <div className="admin-metric-card">
          <div className="admin-metric-icon users-icon">
            <Users size={24} />
          </div>
          <div className="admin-metric-content">
            <h3>Total Users</h3>
            <div className="admin-metric-value counter">{userStats?.total || 0}</div>
            <div className="admin-metric-subtext">
              <span className="admin-metric-highlight">+{userStats?.newThisMonth || 0}</span> new this month
            </div>
          </div>
        </div>
        
        <div className="admin-metric-card">
          <div className="admin-metric-icon courses-icon">
            <BookOpen size={24} />
          </div>
          <div className="admin-metric-content">
            <h3>Total Courses</h3>
            <div className="admin-metric-value counter">{contentStats?.totalCourses || 0}</div>
            <div className="admin-metric-subtext">
              <span className="admin-metric-highlight">{contentStats?.averageRating || 0}/5</span> avg. rating
            </div>
          </div>
        </div>
        
        <div className="admin-metric-card">
          <div className="admin-metric-icon assessments-icon">
            <CheckCircle size={24} />
          </div>
          <div className="admin-metric-content">
            <h3>Assessments</h3>
            <div className="admin-metric-value counter">{contentStats?.totalAssessments || 0}</div>
            <div className="admin-metric-subtext">
              <span className="admin-metric-highlight">{contentStats?.completionRate || 0}%</span> completion rate
            </div>
          </div>
        </div>
        
        <div className="admin-metric-card">
          <div className="admin-metric-icon active-icon">
            <Activity size={24} />
          </div>
          <div className="admin-metric-content">
            <h3>Active Users</h3>
            <div className="admin-metric-value counter">{userStats?.active || 0}</div>
            <div className="admin-metric-subtext">
              <span className="admin-metric-highlight">{Math.round((userStats?.active / userStats?.total) * 100) || 0}%</span> of total users
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts Grid - Two charts side by side */}
      <div className="admin-charts-side-by-side">
        {/* Task Activity Chart - Line Chart */}
        <div className={`admin-chart-card ${isLoaded ? 'animate-in' : ''}`}>
          <h3>Task Activity</h3>
          <div className="admin-chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart 
                data={activityData} 
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  wrapperStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px', padding: '10px' }}
                  contentStyle={{ border: 'none' }}
                  labelStyle={{ fontWeight: 'bold', color: '#333' }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                {showLines.created && (
                  <Line 
                    type="monotone" 
                    dataKey="created" 
                    name="Tasks Created" 
                    stroke="#0088FE" 
                    strokeWidth={3}
                    dot={{ r: 6, strokeWidth: 2 }}
                    activeDot={{ r: 8, strokeWidth: 0, fill: '#0088FE' }}
                    animationDuration={1500}
                    animationEasing="ease-out"
                    isAnimationActive={true}
                  />
                )}
                {showLines.completed && (
                  <Line 
                    type="monotone" 
                    dataKey="completed" 
                    name="Tasks Completed" 
                    stroke="#00C49F" 
                    strokeWidth={3}
                    dot={{ r: 6, strokeWidth: 2 }}
                    activeDot={{ r: 8, strokeWidth: 0, fill: '#00C49F' }}
                    animationDuration={1500}
                    animationEasing="ease-out"
                    isAnimationActive={true}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Project Burndown Chart - Area Chart */}
        <div className={`admin-chart-card ${isLoaded ? 'animate-in' : ''}`}>
          <h3>Project Burndown</h3>
          <div className="admin-chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={burndownData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" domain={[0, 100]} />
                <Tooltip content={<BurndownTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                {showAreas.planned && (
                  <Area 
                    type="monotone" 
                    dataKey="planned" 
                    name="Planned" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.3}
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                    animationDuration={1500}
                    animationEasing="ease-out"
                    isAnimationActive={true}
                  />
                )}
                {showAreas.actual && (
                  <Area 
                    type="monotone" 
                    dataKey="actual" 
                    name="Actual" 
                    stroke="#82ca9d" 
                    fill="#82ca9d" 
                    fillOpacity={0.3}
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                    animationDuration={1500}
                    animationEasing="ease-out"
                    isAnimationActive={true}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Side-by-side section for Completion Rates and Recent Activities */}
      <div className="admin-side-by-side-grid">
        {/* Completion Rates Chart */}
        <div className="admin-chart-card">
          <h3>Completion Rates by Category</h3>
          <div className="admin-chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={completionRates}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  onMouseEnter={onPieEnter}
                  animationBegin={0}
                  animationDuration={1500}
                  animationEasing="ease-out"
                >
                  {completionRates.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Recent Activity Section */}
        <div className="admin-activity-card">
          <h3>Recent Activities</h3>
          <div className="admin-activity-list">
            {recentActivities.map((activity, index) => (
              <div key={activity.id} className="admin-activity-item" style={{animationDelay: `${index * 100}ms`}}>
                <div className="admin-activity-icon">
                  <Clock size={18} />
                </div>
                <div className="admin-activity-content">
                  <div className="admin-activity-text">
                    <span className="admin-activity-user">{activity.user}</span> {activity.action} <span className="admin-activity-item-name">{activity.item}</span>
                  </div>
                  <div className="admin-activity-time">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;