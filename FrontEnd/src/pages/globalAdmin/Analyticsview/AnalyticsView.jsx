import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Sector 
} from 'recharts';
import { 
  Users, BookOpen, Award, CheckCircle, Activity, Clock, BarChart2, 
  TrendingUp, Database, Globe, BookCopy, Building2, UserCheck 
} from 'lucide-react';
import './AnalyticsView.css';

const AnalyticsView = () => {
  // State for dashboard data
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({});
  const [organizationData, setOrganizationData] = useState([]);
  const [courseCompletionData, setCourseCompletionData] = useState([]);
  const [userActivityData, setUserActivityData] = useState([]);
  const [assessmentPerformanceData, setAssessmentPerformanceData] = useState([]);
  const [showCharts, setShowCharts] = useState({
    organizations: false,
    courses: false,
    users: false,
    assessments: false
  });
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  // State for active pie chart segment
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Handle pie chart hover
  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };
  
  // Format numbers with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  // Custom active shape for pie chart
  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    
    return (
      <g>
        <text x={cx} y={cy} dy={-20} textAnchor="middle" fill="#333" fontSize={16}>
          {payload.name}
        </text>
        <text x={cx} y={cy} dy={10} textAnchor="middle" fill="#333" fontSize={20} fontWeight="bold">
          {`${value}%`}
        </text>
        <text x={cx} y={cy} dy={30} textAnchor="middle" fill="#999" fontSize={14}>
          {`(${(percent * 100).toFixed(2)}%)`}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 5}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    );
  };
  
  // Fetch dashboard data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setIsLoading(true);
        
        // In a real application, you would fetch this data from your API
        // For now, we'll use mock data
        
        // Simulate API call delay
        setTimeout(() => {
          // Mock dashboard statistics
          setDashboardStats({
            totalOrganizations: 24,
            totalUsers: 3850,
            totalCourses: 156,
            totalAssessments: 312,
            activeUsers: 2760,
            averageCompletionRate: 78,
            totalCreditsAwarded: 15420,
            averageAssessmentScore: 82
          });
          
          // Mock organization performance data
          setOrganizationData([
            { name: 'Org A', users: 450, completionRate: 82, assessmentPassRate: 88 },
            { name: 'Org B', users: 380, completionRate: 75, assessmentPassRate: 79 },
            { name: 'Org C', users: 520, completionRate: 68, assessmentPassRate: 72 },
            { name: 'Org D', users: 290, completionRate: 79, assessmentPassRate: 81 },
            { name: 'Org E', users: 410, completionRate: 85, assessmentPassRate: 90 }
          ]);
          
          // Mock course completion data
          setCourseCompletionData([
            { name: 'Onboarding', value: 92 },
            { name: 'Compliance', value: 88 },
            { name: 'Technical', value: 76 },
            { name: 'Leadership', value: 68 },
            { name: 'Soft Skills', value: 82 }
          ]);
          
          // Mock user activity data
          setUserActivityData([
            { month: 'Jan', logins: 2450, completions: 980 },
            { month: 'Feb', logins: 2280, completions: 1050 },
            { month: 'Mar', logins: 2780, completions: 1280 },
            { month: 'Apr', logins: 3120, completions: 1420 },
            { month: 'May', logins: 2890, completions: 1380 },
            { month: 'Jun', logins: 3240, completions: 1520 }
          ]);
          
          // Mock assessment performance data
          setAssessmentPerformanceData([
            { category: 'Technical', avgScore: 78, passRate: 82 },
            { category: 'Compliance', avgScore: 85, passRate: 92 },
            { category: 'Soft Skills', avgScore: 82, passRate: 88 },
            { category: 'Leadership', avgScore: 76, passRate: 80 },
            { category: 'Onboarding', avgScore: 90, passRate: 95 }
          ]);
          
          setIsLoading(false);
          
          // Animate charts appearance
          setTimeout(() => {
            setShowCharts({ organizations: true, courses: false, users: false, assessments: false });
          }, 300);
          
          setTimeout(() => {
            setShowCharts({ organizations: true, courses: true, users: false, assessments: false });
          }, 600);
          
          setTimeout(() => {
            setShowCharts({ organizations: true, courses: true, users: true, assessments: false });
          }, 900);
          
          setTimeout(() => {
            setShowCharts({ organizations: true, courses: true, users: true, assessments: true });
          }, 1200);
        }, 1000);
        
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setIsLoading(false);
      }
    };
    
    fetchAnalyticsData();
  }, []);
  
  return (
    <div className="analytics-view-container">
      <div className="analytics-header">
        <h1>OmniEdu Analytics Dashboard</h1>
        <p>Comprehensive analytics and insights across all organizations, users, courses, and assessments.</p>
      </div>
      
      {isLoading ? (
        <div className="analytics-loading">
          <div className="analytics-skeleton-metrics"></div>
          <div className="analytics-skeleton-charts">
            <div className="analytics-skeleton-chart"></div>
            <div className="analytics-skeleton-chart"></div>
          </div>
          <div className="analytics-skeleton-charts">
            <div className="analytics-skeleton-chart"></div>
            <div className="analytics-skeleton-chart"></div>
          </div>
        </div>
      ) : (
        <>
          {/* Key Metrics Section */}
          <div className="analytics-metrics-grid">
            <div className="analytics-metric-card">
              <div className="analytics-metric-icon organizations-icon">
                <Building2 size={24} />
              </div>
              <div className="analytics-metric-content">
                <h3>Organizations</h3>
                <div className="analytics-metric-value counter">{formatNumber(dashboardStats.totalOrganizations)}</div>
                <div className="analytics-metric-subtext">
                  Active educational institutions
                </div>
              </div>
            </div>
            
            <div className="analytics-metric-card">
              <div className="analytics-metric-icon users-icon">
                <Users size={24} />
              </div>
              <div className="analytics-metric-content">
                <h3>Total Users</h3>
                <div className="analytics-metric-value counter">{formatNumber(dashboardStats.totalUsers)}</div>
                <div className="analytics-metric-subtext">
                  <span className="analytics-metric-highlight">
                    {Math.round((dashboardStats.activeUsers / dashboardStats.totalUsers) * 100)}%
                  </span> active users
                </div>
              </div>
            </div>
            
            <div className="analytics-metric-card">
              <div className="analytics-metric-icon courses-icon">
                <BookOpen size={24} />
              </div>
              <div className="analytics-metric-content">
                <h3>Courses</h3>
                <div className="analytics-metric-value counter">{formatNumber(dashboardStats.totalCourses)}</div>
                <div className="analytics-metric-subtext">
                  <span className="analytics-metric-highlight">{dashboardStats.averageCompletionRate}%</span> avg. completion rate
                </div>
              </div>
            </div>
            
            <div className="analytics-metric-card">
              <div className="analytics-metric-icon assessments-icon">
                <CheckCircle size={24} />
              </div>
              <div className="analytics-metric-content">
                <h3>Assessments</h3>
                <div className="analytics-metric-value counter">{formatNumber(dashboardStats.totalAssessments)}</div>
                <div className="analytics-metric-subtext">
                  <span className="analytics-metric-highlight">{dashboardStats.averageAssessmentScore}%</span> avg. score
                </div>
              </div>
            </div>
          </div>
          
          {/* Organization Performance Section */}
          <div className="analytics-section">
            <h2>Organization Performance</h2>
            <div className="analytics-charts-side-by-side">
              <div className={`analytics-chart-card ${showCharts.organizations ? 'animate-in' : ''}`}>
                <h3>Completion Rates by Organization</h3>
                <div className="analytics-chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={organizationData}
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
                        dataKey="completionRate" 
                        name="Completion Rate (%)" 
                        fill="#0088FE" 
                        radius={[4, 4, 0, 0]}
                        animationDuration={1500}
                        animationEasing="ease-out"
                      />
                      <Bar 
                        dataKey="assessmentPassRate" 
                        name="Assessment Pass Rate (%)" 
                        fill="#00C49F" 
                        radius={[4, 4, 0, 0]}
                        animationDuration={1500}
                        animationEasing="ease-out"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className={`analytics-chart-card ${showCharts.courses ? 'animate-in' : ''}`}>
                <h3>Course Completion by Category</h3>
                <div className="analytics-chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        activeIndex={activeIndex}
                        activeShape={renderActiveShape}
                        data={courseCompletionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        onMouseEnter={onPieEnter}
                      >
                        {courseCompletionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
          
          {/* User Activity Section */}
          <div className="analytics-section">
            <h2>User Engagement Analytics</h2>
            <div className="analytics-charts-side-by-side">
              <div className={`analytics-chart-card ${showCharts.users ? 'animate-in' : ''}`}>
                <h3>Monthly User Activity</h3>
                <div className="analytics-chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart 
                      data={userActivityData} 
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" stroke="#666" />
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
              
              <div className={`analytics-chart-card ${showCharts.assessments ? 'animate-in' : ''}`}>
                <h3>Assessment Performance by Category</h3>
                <div className="analytics-chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={assessmentPerformanceData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" domain={[0, 100]} stroke="#666" />
                      <YAxis dataKey="category" type="category" stroke="#666" />
                      <Tooltip 
                        wrapperStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px', padding: '10px' }}
                        contentStyle={{ border: 'none' }}
                        labelStyle={{ fontWeight: 'bold', color: '#333' }}
                      />
                      <Legend wrapperStyle={{ paddingTop: '10px' }} />
                      <Bar 
                        dataKey="avgScore" 
                        name="Average Score (%)" 
                        fill="#FFBB28" 
                        radius={[0, 4, 4, 0]}
                        animationDuration={1500}
                        animationEasing="ease-out"
                      />
                      <Bar 
                        dataKey="passRate" 
                        name="Pass Rate (%)" 
                        fill="#FF8042" 
                        radius={[0, 4, 4, 0]}
                        animationDuration={1500}
                        animationEasing="ease-out"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
          
          {/* Credits and Achievements Section */}
          <div className="analytics-section">
            <h2>Credits and Achievements</h2>
            <div className="analytics-summary-cards">
              <div className="analytics-summary-card">
                <div className="analytics-summary-icon">
                  <Award size={32} />
                </div>
                <div className="analytics-summary-content">
                  <h3>Total Credits Awarded</h3>
                  <div className="analytics-summary-value">{formatNumber(dashboardStats.totalCreditsAwarded)}</div>
                  <p>Credits distributed across all organizations</p>
                </div>
              </div>
              
              <div className="analytics-summary-card">
                <div className="analytics-summary-icon">
                  <UserCheck size={32} />
                </div>
                <div className="analytics-summary-content">
                  <h3>Active Learning Rate</h3>
                  <div className="analytics-summary-value">{Math.round((dashboardStats.activeUsers / dashboardStats.totalUsers) * 100)}%</div>
                  <p>Users actively engaged in learning</p>
                </div>
              </div>
              
              <div className="analytics-summary-card">
                <div className="analytics-summary-icon">
                  <BookCopy size={32} />
                </div>
                <div className="analytics-summary-content">
                  <h3>Content Utilization</h3>
                  <div className="analytics-summary-value">{dashboardStats.averageCompletionRate}%</div>
                  <p>Average content utilization across platform</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsView;