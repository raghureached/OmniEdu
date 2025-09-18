import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
         PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Sector } from 'recharts';
import { Users, BookOpen, Award, CheckCircle, Activity, Clock, BarChart2, PieChart as PieChartIcon, 
         TrendingUp, Settings, Database, Globe } from 'lucide-react';
import './GlobalAdminDashboard.css';

const GlobalAdminDashboard = () => {
  // State for dashboard data
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    organizations: 0,
    users: 0,
    courses: 0,
    completions: 0,
    activeUsers: 0,
    averageCompletionRate: 0
  });
  const [activityData, setActivityData] = useState([]);
  const [completionRates, setCompletionRates] = useState([]);
  const [userDistribution, setUserDistribution] = useState([]);
  const [showCharts, setShowCharts] = useState({
    activity: false,
    completion: false,
    distribution: false
  });
  const [activeIndex, setActiveIndex] = useState(0);
  
  const { user } = useSelector((state) => state.auth);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  useEffect(() => {
    // Fetch dashboard data
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // In a real application, you would fetch this data from your API
        // For now, we'll use mock data
        
        // Simulate API call delay
        setTimeout(() => {
          // Mock dashboard statistics
          setDashboardStats({
            organizations: 15,
            users: 1250,
            courses: 78,
            completions: 3420,
            activeUsers: 890,
            averageCompletionRate: 72
          });
          
          // Mock activity data
          setActivityData([
            { name: 'Jan', logins: 65, completions: 28 },
            { name: 'Feb', logins: 59, completions: 32 },
            { name: 'Mar', logins: 80, completions: 47 },
            { name: 'Apr', logins: 81, completions: 51 },
            { name: 'May', logins: 56, completions: 39 },
            { name: 'Jun', logins: 55, completions: 37 },
            { name: 'Jul', logins: 40, completions: 25 }
          ]);
          
          // Mock completion rates
          setCompletionRates([
            { name: 'Onboarding', value: 85 },
            { name: 'Compliance', value: 92 },
            { name: 'Technical', value: 68 },
            { name: 'Soft Skills', value: 73 },
            { name: 'Leadership', value: 64 }
          ]);
          
          // Mock user distribution
          setUserDistribution([
            { name: 'Admin', value: 15 },
            { name: 'Manager', value: 120 },
            { name: 'Employee', value: 980 },
            { name: 'Contractor', value: 135 }
          ]);
          
          setIsLoading(false);
          
          // Animate charts appearance
          setTimeout(() => {
            setShowCharts({ activity: true, completion: false, distribution: false });
          }, 500);
          
          setTimeout(() => {
            setShowCharts({ activity: true, completion: true, distribution: false });
          }, 1000);
          
          setTimeout(() => {
            setShowCharts({ activity: true, completion: true, distribution: true });
          }, 1500);
        }, 1000);
        
        // In a real application, you would make API calls like this:
        // const response = await api.get('/dashboard/stats');
        // setDashboardStats(response.data);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Format large numbers
  const formatNumber = (num) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num;
  };
  
  // Handle pie chart hover
  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };
  
  // Render active shape for pie chart
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
  
  // Render loading skeleton
  const renderSkeleton = () => {
    return (
      <div className="dashboard-skeleton">
        <div className="dashboard-metrics-skeleton">
          <div className="metric-skeleton"></div>
          <div className="metric-skeleton"></div>
          <div className="metric-skeleton"></div>
          <div className="metric-skeleton"></div>
          <div className="metric-skeleton"></div>
          <div className="metric-skeleton"></div>
        </div>
        <div className="dashboard-charts-skeleton">
          <div className="chart-skeleton"></div>
          <div className="chart-skeleton"></div>
        </div>
        <div className="dashboard-charts-skeleton">
          <div className="chart-skeleton"></div>
          <div className="chart-skeleton"></div>
        </div>
      </div>
    );
  };

  return (
    <div className="global-admin-dashboard-container">
      <div className="global-admin-dashboard-header">
        <h2>Global Admin Dashboard</h2>
        <p className="global-admin-dashboard-subtitle">
          Monitor and manage your organization's learning ecosystem
        </p>
      </div>
      
      {isLoading ? (
        renderSkeleton()
      ) : (
        <>
          {/* Metrics Grid */}
          <div className="global-admin-dashboard-metrics">
            <div className="global-admin-metric-card">
              <div className="global-admin-metric-icon organizations-icon">
                <Globe size={24} />
              </div>
              <div className="global-admin-metric-content">
                <h3>Organizations</h3>
                <div className="global-admin-metric-value counter">{dashboardStats.organizations}</div>
                <div className="global-admin-metric-subtext">
                  Active learning portals
                </div>
              </div>
            </div>
            
            <div className="global-admin-metric-card">
              <div className="global-admin-metric-icon users-icon">
                <Users size={24} />
              </div>
              <div className="global-admin-metric-content">
                <h3>Total Users</h3>
                <div className="global-admin-metric-value counter">{formatNumber(dashboardStats.users)}</div>
                <div className="global-admin-metric-subtext">
                  Across all organizations
                </div>
              </div>
            </div>
            
            <div className="global-admin-metric-card">
              <div className="global-admin-metric-icon courses-icon">
                <BookOpen size={24} />
              </div>
              <div className="global-admin-metric-content">
                <h3>Courses</h3>
                <div className="global-admin-metric-value counter">{dashboardStats.courses}</div>
                <div className="global-admin-metric-subtext">
                  Available learning modules
                </div>
              </div>
            </div>
            
            <div className="global-admin-metric-card">
              <div className="global-admin-metric-icon completions-icon">
                <CheckCircle size={24} />
              </div>
              <div className="global-admin-metric-content">
                <h3>Completions</h3>
                <div className="global-admin-metric-value counter">{formatNumber(dashboardStats.completions)}</div>
                <div className="global-admin-metric-subtext">
                  Total course completions
                </div>
              </div>
            </div>
            
            <div className="global-admin-metric-card">
              <div className="global-admin-metric-icon active-icon">
                <Activity size={24} />
              </div>
              <div className="global-admin-metric-content">
                <h3>Active Users</h3>
                <div className="global-admin-metric-value counter">{formatNumber(dashboardStats.activeUsers)}</div>
                <div className="global-admin-metric-subtext">
                  <span className="global-admin-metric-highlight">
                    {Math.round((dashboardStats.activeUsers / dashboardStats.users) * 100)}%
                  </span> of total users
                </div>
              </div>
            </div>
            
            <div className="global-admin-metric-card">
              <div className="global-admin-metric-icon completion-rate-icon">
                <TrendingUp size={24} />
              </div>
              <div className="global-admin-metric-content">
                <h3>Completion Rate</h3>
                <div className="global-admin-metric-value counter">{dashboardStats.averageCompletionRate}%</div>
                <div className="global-admin-metric-subtext">
                  Average across all courses
                </div>
              </div>
            </div>
          </div>
          
          {/* Charts Grid - Two charts side by side */}
          <div className="global-admin-charts-side-by-side">
            {/* User Activity Chart - Line Chart */}
            <div className={`global-admin-chart-card ${showCharts.activity ? 'animate-in' : ''}`}>
              <h3>User Activity</h3>
              <div className="global-admin-chart-container">
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
                    <Line 
                      type="monotone" 
                      dataKey="logins" 
                      name="User Logins" 
                      stroke="#0088FE" 
                      strokeWidth={3}
                      dot={{ r: 6, strokeWidth: 2 }}
                      activeDot={{ r: 8, strokeWidth: 0, fill: '#0088FE' }}
                      animationDuration={1500}
                      animationEasing="ease-out"
                      isAnimationActive={true}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="completions" 
                      name="Course Completions" 
                      stroke="#00C49F" 
                      strokeWidth={3}
                      dot={{ r: 6, strokeWidth: 2 }}
                      activeDot={{ r: 8, strokeWidth: 0, fill: '#00C49F' }}
                      animationDuration={1500}
                      animationEasing="ease-out"
                      isAnimationActive={true}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Completion Rates Chart - Pie Chart */}
            <div className={`global-admin-chart-card ${showCharts.completion ? 'animate-in' : ''}`}>
              <h3>Completion Rates by Category</h3>
              <div className="global-admin-chart-container">
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
                    >
                      {completionRates.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* Second row of charts */}
          <div className="global-admin-charts-side-by-side">
            {/* User Distribution Chart - Bar Chart */}
            <div className={`global-admin-chart-card ${showCharts.distribution ? 'animate-in' : ''}`}>
              <h3>User Distribution by Role</h3>
              <div className="global-admin-chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={userDistribution}
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
                    <Bar 
                      dataKey="value" 
                      name="Users" 
                      animationDuration={1500}
                      animationEasing="ease-out"
                    >
                      {userDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Quick Actions Card */}
            <div className="global-admin-chart-card global-admin-actions-card">
              <h3>Quick Actions</h3>
              <div className="global-admin-actions-container">
                <div className="global-admin-action-item">
                  <div className="global-admin-action-icon">
                    <Users size={20} />
                  </div>
                  <div className="global-admin-action-content">
                    <h4>Manage Organizations</h4>
                    <p>Add, edit, or configure organization settings</p>
                  </div>
                </div>
                
                <div className="global-admin-action-item">
                  <div className="global-admin-action-icon">
                    <Database size={20} />
                  </div>
                  <div className="global-admin-action-content">
                    <h4>Content Library</h4>
                    <p>Manage global content and learning resources</p>
                  </div>
                </div>
                
                <div className="global-admin-action-item">
                  <div className="global-admin-action-icon">
                    <BarChart2 size={20} />
                  </div>
                  <div className="global-admin-action-content">
                    <h4>Advanced Analytics</h4>
                    <p>View detailed reports and analytics</p>
                  </div>
                </div>
                
                <div className="global-admin-action-item">
                  <div className="global-admin-action-icon">
                    <Settings size={20} />
                  </div>
                  <div className="global-admin-action-content">
                    <h4>System Configuration</h4>
                    <p>Configure global system settings</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GlobalAdminDashboard;