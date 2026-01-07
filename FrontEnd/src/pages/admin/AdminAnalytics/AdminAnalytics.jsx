import React, { useState, useEffect, useRef } from 'react';
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
  Route, X
} from 'lucide-react';
import './AdminAnalytics.css';
import api from '../../../services/api';
import { getContentCounts } from '../../../utils/contentCountsService'
import GiftPopup from '../../../components/GiftPopup/GiftPopup';
import AnalyticsPop from '../../../components/AnalyticsPopup/AnalyticsPop';
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
  const [isDateRangeLoading, setIsDateRangeLoading] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState({
    organizationDate: false,
    courseLibrary: false,
    teams: false,
    subteams: false,
    usageTrend: false,
    courseAdoption: false,
    courseMetrics: false,
    userData: false
  });

  // Check if all initial data is loaded
  const checkAllDataLoaded = (loadedState) => {
    return Object.values(loadedState).every(loaded => loaded === true);
  };

  // Handle time range changes with loading state
  const handleTimeRangeChange = (newTimeRange) => {
    setIsDateRangeLoading(true);
    // Reset initial data loading state to prevent blinking during time range changes
    setInitialDataLoaded({
      organizationDate: true, // Keep this as true since it doesn't change with time range
      courseLibrary: false,
      teams: true, // Keep this as true since it doesn't change with time range
      subteams: true, // Keep this as true since it doesn't change with time range
      usageTrend: false,
      courseAdoption: false,
      courseMetrics: false,
      userData: false
    });
    setIsLoading(true); // Set loading to true during time range changes
    setTimeRange(newTimeRange);
    setUserFilters(prev => ({ ...prev, timeRange: newTimeRange }));
    
    // Fetch data conditionally by active view
    const userPromises = [
      fetchUsageTrendWithFilters({ ...userFilters, timeRange: newTimeRange }),
      fetchEngagementHeatmap(newTimeRange),
      fetchUserData(newTimeRange),
      newTimeRange === 'mtd' || newTimeRange === 'custom'
        ? fetchAtRiskLearners(newTimeRange)
        : fetchAtRiskLearners(newTimeRange === '7d' ? 7 : newTimeRange === '30d' ? 30 : 90)
    ];
    const coursePromises = [
      fetchCourseMetrics(newTimeRange),
      fetchCourseAdoptionWithFilters({ ...courseAdoptionFilters, timeRange: newTimeRange }),
      fetchCourseLibraryWithTimeRange({ ...courseFilters, timeRange: newTimeRange }),
      fetchCoursePerformanceInsights({ ...coursePerformanceFilters, timeRange: newTimeRange })
    ];

    Promise.all([
      ...(activeView === 'users' ? userPromises : []),
      ...(activeView === 'courses' ? coursePromises : [])
    ]).finally(() => {
      setIsDateRangeLoading(false);
    });
  };

  // Handle user status filter changes with loading state
  const handleUserStatusChange = (newUserStatus) => {
    setIsDateRangeLoading(true);
    // Reset only the data that depends on user status
    setInitialDataLoaded(prev => ({
      ...prev,
      usageTrend: false,
      userData: false
    }));
    setIsLoading(true); // Set loading to true during filter changes
    setUserFilters(prev => ({ ...prev, userStatus: newUserStatus }));
    
    // Fetch only the data that depends on user status
    Promise.all([
      fetchUsageTrendWithFilters({ ...userFilters, userStatus: newUserStatus }),
      fetchUserData(userFilters.timeRange),
      // Handle at-risk learners based on user status
      fetchAtRiskLearners(userFilters.timeRange === '7d' ? 7 : userFilters.timeRange === '30d' ? 30 : 90)
    ]).finally(() => {
      setIsDateRangeLoading(false);
    });
  };

  // Handle custom date range changes with loading state
  const handleCustomDateRangeApply = () => {
    if (!customDateRange.startDate || !customDateRange.endDate) return;
    
    setIsDateRangeLoading(true);
    // Reset initial data loading state to prevent blinking during time range changes
    setInitialDataLoaded({
      organizationDate: true, // Keep this as true since it doesn't change with time range
      courseLibrary: false,
      teams: true, // Keep this as true since it doesn't change with time range
      subteams: true, // Keep this as true since it doesn't change with time range
      usageTrend: false,
      courseAdoption: false,
      courseMetrics: false,
      userData: false
    });
    setIsLoading(true); // Set loading to true during time range changes
    setTimeRange('custom');
    setUserFilters(prev => ({ 
      ...prev, 
      timeRange: 'custom',
      startDate: customDateRange.startDate,
      endDate: customDateRange.endDate
    }));
    
    // Fetch data conditionally by active view
    const userPromises = [
      fetchUsageTrendWithFilters({ 
        ...userFilters, 
        timeRange: 'custom',
        startDate: customDateRange.startDate,
        endDate: customDateRange.endDate
      }),
      fetchEngagementHeatmap('custom', {
        startDate: customDateRange.startDate,
        endDate: customDateRange.endDate
      }),
      fetchUserData('custom'),
      fetchAtRiskLearners('custom', {
        startDate: customDateRange.startDate,
        endDate: customDateRange.endDate
      })
    ];
    const coursePromises = [
      fetchCourseMetrics('custom'),
      fetchCourseAdoptionWithFilters({ 
        ...courseAdoptionFilters, 
        timeRange: 'custom',
        startDate: customDateRange.startDate,
        endDate: customDateRange.endDate
      }),
      fetchCourseLibraryWithTimeRange({ 
        ...courseFilters, 
        timeRange: 'custom',
        startDate: customDateRange.startDate,
        endDate: customDateRange.endDate
      }),
      fetchCoursePerformanceInsights({ 
        ...coursePerformanceFilters, 
        timeRange: 'custom',
        startDate: customDateRange.startDate,
        endDate: customDateRange.endDate
      })
    ];

    Promise.all([
      ...(activeView === 'users' ? userPromises : []),
      ...(activeView === 'courses' ? coursePromises : [])
    ]).finally(() => {
      setIsDateRangeLoading(false);
      setShowCustomDatePicker(false);
    });
  };
  const [timeRange, setTimeRange] = useState('7d');
  const [customDateRange, setCustomDateRange] = useState({
    startDate: null,
    endDate: null
  });
  const [organizationCreatedDate, setOrganizationCreatedDate] = useState(null);
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [courseLibrary, setCourseLibrary] = useState([]);
const [overallCourseLibrary, setOverallCourseLibrary] = useState([]);
  const [teams, setTeams] = useState([]);
  const [subteams, setSubteams] = useState([]);
  const [userData, setUserData] = useState({});
  const [usageTrend, setUsageTrend] = useState([]);
  const [courseAdoption, setCourseAdoption] = useState([]);
  const [coursePerformanceData, setCoursePerformanceData] = useState([]);
  const [engagementHeatmap, setEngagementHeatmap] = useState([]);
  const [atRiskLearners, setAtRiskLearners] = useState([]);
  const [courseMetrics, setCourseMetrics] = useState({
    modules: 0,
    assessments: 0,
    surveys: 0,
    learningPaths: 0,
  });
  const courseMetricsRequestInFlight = useRef(false);
  const [activeView, setActiveView] = useState('users'); // 'users' or 'courses'
  const [showFilters, setShowFilters] = useState(false);
  const [showUserFilters, setShowUserFilters] = useState(false);
  const [isUsageTrendLoading, setIsUsageTrendLoading] = useState(false);
  const [isCourseAdoptionLoading, setIsCourseAdoptionLoading] = useState(false);
  const [isCourseLibraryLoading, setIsCourseLibraryLoading] = useState(false);
  const [isCoursePerformanceLoading, setIsCoursePerformanceLoading] = useState(false);
  const [isAtRiskLearnersLoading, setIsAtRiskLearnersLoading] = useState(false);
  const [courseFilters, setCourseFilters] = useState({
    category: 'all',
    team: 'all',
    subteam: 'all',
    timeRange: '7d'
  });
  
  // Independent filters for each course section
  const [courseLibraryFilters, setCourseLibraryFilters] = useState({
    team: 'all',
    subteam: 'all',
    timeRange: '7d'
  });
  
  const [coursePerformanceFilters, setCoursePerformanceFilters] = useState({
    content:"module",
    timeRange: '7d'
  });
  
  const [courseAdoptionFilters, setCourseAdoptionFilters] = useState({
    category: 'all',
    team: 'all',
    subteam: 'all',
    timeRange: '7d'
  });
  
  // Filter visibility states for each section
  const [showCourseLibraryFilters, setShowCourseLibraryFilters] = useState(false);
  const [showCoursePerformanceFilters, setShowCoursePerformanceFilters] = useState(false);
  const [showCourseAdoptionFilters, setShowCourseAdoptionFilters] = useState(false);
  const [showAtRiskFilters, setShowAtRiskFilters] = useState(false);
  const [userFilters, setUserFilters] = useState({
    timeRange: '7d',
    userStatus: 'all'
  });
  
  // Separate state for At-Risk Learners filters
  const [atRiskFilters, setAtRiskFilters] = useState({
     timeRange: '7d',
    riskLevel: 'high'
  });
  
  const [showGiftPopup, setShowGiftPopup] = useState(false);
  const [showAnalyticsPopup, setShowAnalyticsPopup] = useState(false);
  const [selectedUserAnalytics, setSelectedUserAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  useEffect(() => {
    const fetchOrganizationCreationDate = async () => {
      try {
        const response = await api.get('/api/admin/analytics/getOrganizationCreationDate');
        if (response.data.success) {
          setOrganizationCreatedDate(new Date(response.data.data.createdAt));
        }
      } catch (error) {
        console.error('Error fetching organization creation date:', error);
      } finally {
        setInitialDataLoaded(prev => ({ ...prev, organizationDate: true }));
      }
    };
    // fetchOrganizationCreationDate();

    const fetchCourseLibrary = async () => {
      try {
        const response = await api.get('/api/admin/analytics/getCourseDistribution');
        setCourseLibrary(response.data.courseLibrary);
      } catch (error) {
        console.error('Error fetching course library:', error);
      } finally {
        setInitialDataLoaded(prev => ({ ...prev, courseLibrary: true }));
      }
    };
    // fetchCourseLibrary();

    const fetchTeams = async () => {
      try {
        const response = await api.get('/api/admin/analytics/getTeams');
        setTeams(response.data.teams);
      } catch (error) {
        console.error('Error fetching teams:', error);
      } finally {
        setInitialDataLoaded(prev => ({ ...prev, teams: true }));
      }
    };
    fetchTeams();

    const fetchSubteams = async () => {
      try {
        const response = await api.get('/api/admin/analytics/getSubteams');
        setSubteams(response.data.subteams);
      } catch (error) {
        console.error('Error fetching subteams:', error);
      } finally {
        setInitialDataLoaded(prev => ({ ...prev, subteams: true }));
      }
    };
    fetchSubteams();

    const fetchUsageTrend = async () => {
      try {
        const response = await api.get('/api/admin/analytics/getUsageTrend');
        setUsageTrend(response.data.data);
        // console.log(response.data.data)
      } catch (error) {
        console.error('Error fetching usage trend:', error);
      } finally {
        setInitialDataLoaded(prev => ({ ...prev, usageTrend: true }));
      }
    };
    // fetchUsageTrend();

    const fetchCourseAdoption = async (filters = {}) => {
      try {
        const params = new URLSearchParams();
        if (filters.category && filters.category !== 'all') params.append('category', filters.category);
        if (filters.team && filters.team !== 'all') params.append('team', filters.team);
        if (filters.subteam && filters.subteam !== 'all') params.append('subteam', filters.subteam);
        const url = params.toString() ? `/api/admin/analytics/getAdoption?${params}` : '/api/admin/analytics/getAdoption';
        const response = await api.get(url);
        // console.log(response.data)
        setCourseAdoption(response.data.data.courseAdoption);
      } catch (error) {
        console.error('Error fetching course adoption:', error);
      } finally {
        setInitialDataLoaded(prev => ({ ...prev, courseAdoption: true }));
      }
    };
    // fetchCourseAdoption(courseFilters);

    // Fetch overall course library data for stats
    // fetchOverallCourseLibrary();
  }, [])

  // Fetch dynamic course metrics
  const fetchCourseMetrics = async (selectedTimeRange = timeRange) => {
    if (courseMetricsRequestInFlight.current) return;
    courseMetricsRequestInFlight.current = true;
    try {
      const response = await getContentCounts(selectedTimeRange);
      if (response.success) {
        setCourseMetrics({
          modules: response.data.modules.total,
          assessments: response.data.assessments.total,
          surveys: response.data.surveys.total,
          learningPaths: response.data.learningPaths.total,
        });
      }
    } catch (error) {
      console.error('Failed to fetch course metrics:', error);
      // Fallback to mock data if API fails
      setCourseMetrics({
        modules: 45,
        assessments: 12,
        surveys: 8,
        learningPaths: 6,
      });
    } finally {
      setInitialDataLoaded(prev => ({ ...prev, courseMetrics: true }));
      courseMetricsRequestInFlight.current = false;
    }
  };

  // Fetch course metrics only when in courses view and timeRange changes
  useEffect(() => {
    if (activeView === 'courses') {
      fetchCourseMetrics(timeRange);
    }
  }, [activeView, timeRange])

  // Fetch dynamic user data
  const fetchUserData = async (selectedTimeRange = timeRange) => {
    try {
      const params = selectedTimeRange ? `?timeRange=${selectedTimeRange}` : '';
      const response = await api.get(`/api/admin/analytics/getUserData${params}`);
      setUserData(response.data.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setInitialDataLoaded(prev => ({ ...prev, userData: true }));
    }
  };

  // Initial fetch of user data
  // useEffect(() => {
  //   fetchUserData('7d'); // Default to 7 days
  // }, [])

  // Monitor initial data loading and set isLoading accordingly
  useEffect(() => {
    if (checkAllDataLoaded(initialDataLoaded)) {
      setIsLoading(false);
    }
  }, [initialDataLoaded]);

  // Fallback: Ensure loading is complete after 10 seconds even if some requests fail
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (isLoading) {
        console.warn('Loading fallback triggered - some requests may have failed');
        setIsLoading(false);
      }
    }, 10000);

    return () => clearTimeout(fallbackTimer);
  }, [isLoading]);

  const fetchUsageTrendWithFilters = async (filters = {}) => {
    setIsUsageTrendLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.timeRange && filters.timeRange !== '30d') params.append('timeRange', filters.timeRange);
      if (filters.userStatus && filters.userStatus !== 'all') params.append('userStatus', filters.userStatus);
      if (filters.startDate) params.append('startDate', filters.startDate.toISOString());
      if (filters.endDate) params.append('endDate', filters.endDate.toISOString());

      const url = params.toString() ? `/api/admin/analytics/getUsageTrend?${params}` : '/api/admin/analytics/getUsageTrend';
      const response = await api.get(url);
      setUsageTrend(response.data.data);
    } catch (error) {
      console.error('Error fetching usage trend with filters:', error);
    } finally {
      setIsUsageTrendLoading(false);
    }
  };

  const fetchCourseAdoptionWithFilters = async (filters = {}) => {
    try {
      console.log('fetchCourseAdoptionWithFilters called with filters:', filters);
      const params = new URLSearchParams();
      if (filters.category && filters.category !== 'all') params.append('category', filters.category);
      if (filters.team && filters.team !== 'all') params.append('team', filters.team);
      if (filters.subteam && filters.subteam !== 'all') params.append('subteam', filters.subteam);
      if (filters.timeRange) params.append('timeRange', filters.timeRange);
      if (filters.startDate) params.append('startDate', filters.startDate.toISOString());
      if (filters.endDate) params.append('endDate', filters.endDate.toISOString());

      const url = params.toString() ? `/api/admin/analytics/getAdoption?${params}` : '/api/admin/analytics/getAdoption';
      console.log('Final API URL:', url);
      const response = await api.get(url);
      setCourseAdoption(response.data.data.courseAdoption);
    } catch (error) {
      console.error('Error fetching course adoption:', error);
    } finally {
      setIsCourseAdoptionLoading(false);
    }
  };

  const fetchEngagementHeatmap = async (timeRange = '30d', customDates = null) => {
    try {
      let url = '/api/admin/analytics/getEngagementHeatmap';
      const params = new URLSearchParams();
      
      if (timeRange !== '30d') {
        params.append('timeRange', timeRange);
      }
      
      if (customDates) {
        if (customDates.startDate) {
          params.append('startDate', customDates.startDate.toISOString());
        }
        if (customDates.endDate) {
          params.append('endDate', customDates.endDate.toISOString());
        }
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await api.get(url);
      console.log('Heatmap response:', response.data);
      setEngagementHeatmap(response.data.data);
    } catch (error) {
      console.error('Error fetching engagement heatmap:', error);
    }
  };

  const fetchAtRiskLearners = async (days = 30, customDates = null) => {
    try {
      let url = '/api/admin/analytics/getAtRiskLearners';
      const params = new URLSearchParams();
      
      // Handle timeRange parameter
      if (typeof days === 'string' && days !== '30') {
        params.append('timeRange', days);
      } else if (days !== 30) {
        params.append('days', days);
      }
      
      // Handle custom dates
      if (customDates) {
        if (customDates.startDate) {
          params.append('startDate', customDates.startDate.toISOString());
        }
        if (customDates.endDate) {
          params.append('endDate', customDates.endDate.toISOString());
        }
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await api.get(url);
      console.log('At-risk learners response:', response.data);
      setAtRiskLearners(response.data.data);
    } catch (error) {
      console.error('Error fetching at-risk learners:', error);
    }
  };

  // New fetch function for At-Risk Learners with risk level filter
  const fetchAtRiskLearnersWithFilters = async (filters = {}) => {
    setIsAtRiskLearnersLoading(true);
    try {
      let url = '/api/admin/analytics/getAtRiskLearners';
      const params = new URLSearchParams();
      
      // Handle timeRange parameter
      if (filters.timeRange && filters.timeRange !== '30d') {
        if (filters.timeRange === 'custom' && filters.startDate && filters.endDate) {
          params.append('startDate', filters.startDate.toISOString());
          params.append('endDate', filters.endDate.toISOString());
        } else if (filters.timeRange === 'mtd') {
          params.append('timeRange', 'mtd');
        } else {
          const days = filters.timeRange === '7d' ? 7 : filters.timeRange === '90d' ? 90 : 30;
          params.append('days', days);
        }
      } else {
        params.append('days', 30); // default to 30 days
      }
      
      // Handle risk level filter
      if (filters.riskLevel && filters.riskLevel !== 'all') {
        params.append('riskLevel', filters.riskLevel);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await api.get(url);
      console.log('At-risk learners with filters response:', response.data);
      setAtRiskLearners(response.data.data);
    } catch (error) {
      console.error('Error fetching at-risk learners with filters:', error);
    } finally {
      setIsAtRiskLearnersLoading(false);
    }
  };

  const fetchCourseLibraryWithTimeRange = async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.timeRange) params.append('timeRange', filters.timeRange);
      if (filters.category && filters.category !== 'all') params.append('category', filters.category);
      if (filters.team && filters.team !== 'all') params.append('team', filters.team);
      if (filters.subteam && filters.subteam !== 'all') params.append('subteam', filters.subteam);
      if (filters.startDate) params.append('startDate', filters.startDate.toISOString());
      if (filters.endDate) params.append('endDate', filters.endDate.toISOString());

      const url = params.toString() ? `/api/admin/analytics/getCourseDistribution?${params}` : '/api/admin/analytics/getCourseDistribution';
      const response = await api.get(url);
      setCourseLibrary(response.data.courseLibrary);
    } catch (error) {
      console.error('Error fetching course library with filters:', error);
    } finally {
      setIsCourseLibraryLoading(false);
    }
  };

  const fetchOverallCourseLibrary = async () => {
    try {
      const response = await api.get('/api/admin/analytics/getCourseDistribution');
      setOverallCourseLibrary(response.data.courseLibrary);
    } catch (error) {
      console.error('Error fetching overall course library:', error);
    }
  };

  const fetchCoursePerformanceInsights = async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.content) params.append('content', filters.content);
      if (filters.timeRange) params.append('timeRange', filters.timeRange);
      if (filters.startDate) params.append('startDate', filters.startDate.toISOString());
      if (filters.endDate) params.append('endDate', filters.endDate.toISOString());

      const url = params.toString() ? `/api/admin/analytics/getCoursePerformanceInsights?${params}` : '/api/admin/analytics/getCoursePerformanceInsights';
      const response = await api.get(url);
      setCoursePerformanceData(response.data.data.allCourses || []); // Use allCourses to show all content
    } catch (error) {
      console.error('Error fetching course performance insights:', error);
    } finally {
      setIsCoursePerformanceLoading(false);
    }
  };

  const fetchUserAnalytics = async (userId) => {
    try {
      setAnalyticsLoading(true);
      const response = await api.get(`/api/admin/analytics/user/${userId}`);
      console.log('User analytics response:', response.data);
      setSelectedUserAnalytics(response.data.data);
      setShowAnalyticsPopup(true);
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      // Show error message or handle gracefully
      setSelectedUserAnalytics(null);
      setShowAnalyticsPopup(true); // Show popup with error state
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Export function for Usage Trend data
  const exportUsageTrendData = () => {
    try {
      const csvContent = [
        ['Date', 'Daily Active Users', 'Monthly Active Users'],
        ...usageTrend.map(item => [
          item.date || item._id,
          item.dau || item.dailyActiveUsers || 0,
          item.mau || item.monthlyActiveUsers || 0
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `usage-trend-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting usage trend data:', error);
    }
  };

  // Export function for At-Risk Learners data
  const exportAtRiskLearnersData = () => {
    try {
      const csvContent = [
        ['Name', 'Email',  'Completion Rate', 'Last Login (days ago)', 'Risk Level', 'Courses Enrolled', 'Courses Completed'],
        ...atRiskLearners.map(learner => [
          learner.name || '',
          learner.email || '',
        
          learner.completionRate || 0,
        
          learner.lastLogin || getDaysAgo(learner.lastLoginDate) || 0,
          learner.riskLevel || 'unknown',
          learner.coursesEnrolled || 0,
          learner.coursesCompleted || 0
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `at-risk-learners-${atRiskFilters.riskLevel}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting at-risk learners data:', error);
    }
  };

  // Export function for Course Library data
  const exportCourseLibraryData = () => {
    try {
      const csvContent = [
        ['Category', 'Number of Courses', 'Number of Teams', 'Name of the courses', 'Name of the Teams'],
        ...courseLibrary.map(item => [
          item.category || 'Unknown',
          item.courses || 0,
          item.teams || 0,
          item.courseNames || '',
          item.teamNames || ''
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `course-library-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting course library data:', error);
    }
  };

  // Export function for Course Adoption data
  const exportCourseAdoptionData = () => {
    try {
      const csvContent = [
        ['Course Name', 'Enrolled Users', 'Completed Users', 'Completion Rate (%)', 'Average Score (%)'],
        ...courseAdoption.map(item => [
          item.name || 'Unknown Course',
          item.enrolled || 0,
          item.completed || 0,
          item.rate || 0,
          item.avgScore || 0
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `course-adoption-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting course adoption data:', error);
    }
  };

  // Export function for Course Performance data
  const exportCoursePerformanceData = () => {
    try {
      const csvContent = [
        ['Course Name', 'Content Type', 'Performance Category', 'Time Range'],
        ...coursePerformanceData.map(item => [
          item.name || 'Unknown Course',
          coursePerformanceFilters.content || 'modules',
          'Performance Data',
          coursePerformanceFilters.timeRange || '30d'
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `course-performance-${coursePerformanceFilters.content}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting course performance data:', error);
    }
  };

  // Calculate metrics from filtered usage trend data
  const calculateMetricsFromUsageTrend = () => {
    if (!usageTrend || usageTrend.length === 0) {
      return {
        currentDAU: 0,
        currentMAU: 0,
        totalActiveUsers: 0
      };
    }

    // Get the most recent data point for current values
    const mostRecentData = usageTrend[usageTrend.length - 1];
    
    // Calculate current DAU and MAU from the most recent data
    const currentDAU = mostRecentData?.dau || mostRecentData?.dailyActiveUsers || 0;
    const currentMAU = mostRecentData?.mau || mostRecentData?.monthlyActiveUsers || 0;
    
    // Calculate total unique users across all data points
    const uniqueUsers = new Set();
    usageTrend.forEach(item => {
      // If we have user IDs in the data, we'd use them here
      // For now, we'll estimate based on the maximum MAU seen
      const mau = item?.mau || item?.monthlyActiveUsers || 0;
      if (mau > 0) {
        uniqueUsers.add(mau); // This is a simplified approach
      }
    });
    
    // Use the maximum MAU as total active users (simplified calculation)
    const totalActiveUsers = Math.max(...usageTrend.map(item => 
      item?.mau || item?.monthlyActiveUsers || 0
    ), currentMAU);

    return {
      currentDAU,
      currentMAU,
      totalActiveUsers
    };
  };

  const { currentDAU, currentMAU, totalActiveUsers } = calculateMetricsFromUsageTrend();

  // Note: getCoursePerformance endpoint doesn't exist on backend
  // Using existing endpoints for course data instead

  // Initial data fetch
  // useEffect(() => {
  //   fetchUsageTrendWithFilters(userFilters);
  //   fetchEngagementHeatmap(userFilters.timeRange);
  //   // Handle new time ranges for fetchAtRiskLearners
  //   if (userFilters.timeRange === 'mtd' || userFilters.timeRange === 'custom') {
  //     fetchAtRiskLearners(userFilters.timeRange);
  //   } else {
  //     const days = userFilters.timeRange === '7d' ? 7 : userFilters.timeRange === '30d' ? 30 : 90;
  //     fetchAtRiskLearners(days);
  //   }
  // }, [])

  // Sync courseFilters.timeRange with timeRange
  // useEffect(() => {
  //   setCourseFilters(prev => ({ ...prev, timeRange: timeRange }));
  // }, [timeRange]);

  // Calculate dynamic completion rate
  const calculateCompletionRate = () => {
    if (courseAdoption.length === 0) return { rate: '0%', completed: 0, enrolled: 0 };
    
    const totalEnrolled = courseAdoption.reduce((acc, c) => acc + (c.enrolled || 0), 0);
    const totalCompleted = courseAdoption.reduce((acc, c) => acc + (c.completed || 0), 0);
    const rate = totalEnrolled > 0 ? Math.round((totalCompleted / totalEnrolled) * 100) : 0;
    
    return {
      rate: `${rate}%`,
      completed: totalCompleted,
      enrolled: totalEnrolled
    };
  };

  // Helper function to get time range subtitle
  const getTimeRangeSubtitle = (metricType, selectedTimeRange = timeRange) => {
    switch (selectedTimeRange) {
      case '7d':
        return metricType === 'dau' ? 'Last 7 days (avg)' : 'Last 7 days';
      case 'mtd':
        return 'Month to date';
      case '30d':
        return 'Last 30 days';
      case '90d':
        return 'Last 90 days';
      case 'custom':
        return 'Custom range';
      default:
        return metricType === 'dau' ? 'Last 7 days (avg)' : 'Last 7 days';
    }
  };

  // Fetch data when activeView changes or timeRange changes
  useEffect(() => {
    // Always fetch course metrics when time range changes
    fetchCourseMetrics(timeRange);
    // Always fetch user data when time range changes
    fetchUserData(timeRange);
    
    if (activeView === 'users') {
      fetchUsageTrendWithFilters(userFilters);
      fetchEngagementHeatmap(userFilters.timeRange);
      // Handle new time ranges for fetchAtRiskLearners
      if (userFilters.timeRange === 'mtd' || userFilters.timeRange === 'custom') {
        fetchAtRiskLearners(userFilters.timeRange);
      } else {
        const days = userFilters.timeRange === '7d' ? 7 : userFilters.timeRange === '30d' ? 30 : 90;
        fetchAtRiskLearners(days);
      }
    } else if (activeView === 'courses') {
      fetchCourseAdoptionWithFilters({ ...courseAdoptionFilters, timeRange: timeRange });
      fetchCourseLibraryWithTimeRange({ ...courseFilters, timeRange: timeRange });
      fetchCoursePerformanceInsights({ ...coursePerformanceFilters, timeRange: timeRange });
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

  
  const formatNumber = (n) => (n != null ? n.toLocaleString('en-IN') : '--');
  // Add this ViewToggle component before the MetricCard component definition
  const ViewToggle = ({ activeView, onViewChange }) => (
    <div className="analytics-view-toggle-container">
      {/* <span className="view-toggle-label"></span> */}
      <div className="analytics-view-toggle-wrapper">
        <button
          className={`analytics-view-toggle-button ${activeView === 'users' ? 'active' : ''}`}
          onClick={() => onViewChange('users')}
        >
          <Users size={16} />
          <span>Users</span>
        </button>
        <button
          className={`analytics-view-toggle-button ${activeView === 'courses' ? 'active' : ''}`}
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
      className={`analytics-metric-card-enhanced ${onClick ? 'clickable' : ''}`}
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
        <div 
          className={`metric-value-enhanced ${(label === "Daily Active Users" || label === "Monthly Active Users" || label === "Total Users" || label === "Modules" || label === "Assessments" || label === "Surveys" || label === "Learning Paths")  && value !== "--" ? 'metric-value-underline' : ''}`}
        >{value}</div>
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
    console.log("last login date", lastLogin)
    if (!lastLogin) return 'Never';

    const lastLoginDate = new Date(lastLogin);
    const now = new Date();
    const diffTime = Math.abs(now - lastLoginDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays >= 30) return '30+ days ago';
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };
  if (isLoading || isDateRangeLoading) {
    return (
      <div className="analytics-container">
        {/* Header with loading skeleton */}
        <div className="analytics-page-header">
          <div className="header-content">
            <div className="header-badge" style={{ background: '#f3f4f6', width: '120px', height: '24px' }}></div>
            <div className="page-title" style={{ background: '#f3f4f6', width: '200px', height: '32px', borderRadius: '8px' }}></div>
            <div className="page-subtitle" style={{ background: '#f3f4f6', width: '400px', height: '16px', borderRadius: '4px' }}></div>
          </div>
          <div className="header-filters" style={{ display: "flex", flexDirection: "column" }}>
            <div className="filter-group-enhanced">
              <div style={{ width: '100px', height: '16px', background: '#e5e7eb', borderRadius: '4px', marginBottom: '8px' }}></div>
              <div style={{ width: '200px', height: '40px', background: '#f3f4f6', borderRadius: '8px' }}></div>
            </div>
            <div className="filter-group-enhanced">
              <div style={{ width: '100px', height: '16px', background: '#e5e7eb', borderRadius: '4px', marginBottom: '8px' }}></div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['7D', '1M', '3M', '6M'].map((range) => (
                  <div key={range} style={{ width: '40px', height: '32px', background: '#f3f4f6', borderRadius: '6px' }}></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Loading metrics skeleton */}
        <div className="metrics-grid-enhanced">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="analytics-metric-card-enhanced" style={{ background: '#f9fafb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', background: '#e5e7eb', borderRadius: '8px' }}></div>
                <div style={{ flex: 1 }}>
                  <div style={{ width: '120px', height: '16px', background: '#e5e7eb', borderRadius: '4px', marginBottom: '8px' }}></div>
                  <div style={{ width: '80px', height: '12px', background: '#f3f4f6', borderRadius: '4px' }}></div>
                </div>
              </div>
              <div style={{ width: '60px', height: '24px', background: '#e5e7eb', borderRadius: '4px' }}></div>
            </div>
          ))}
        </div>

        {/* Loading charts skeleton */}
        <div className="charts-grid">
          <div className="chart-panel" style={{ background: '#f9fafb' }}>
            <div style={{ width: '200px', height: '20px', background: '#e5e7eb', borderRadius: '4px', marginBottom: '16px' }}></div>
            <div style={{ width: '100%', height: '300px', background: '#f3f4f6', borderRadius: '8px' }}></div>
          </div>
          <div className="chart-panel" style={{ background: '#f9fafb' }}>
            <div style={{ width: '200px', height: '20px', background: '#e5e7eb', borderRadius: '4px', marginBottom: '16px' }}></div>
            <div style={{ width: '100%', height: '300px', background: '#f3f4f6', borderRadius: '8px' }}></div>
          </div>
        </div>

        {/* Support stats skeleton */}
        <div className="support-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginTop: '24px' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="support-stat" style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px' }}>
              <div style={{ width: '60px', height: '16px', background: '#e5e7eb', borderRadius: '4px', marginBottom: '8px' }}></div>
              <div style={{ width: '40px', height: '24px', background: '#e5e7eb', borderRadius: '4px', marginBottom: '8px' }}></div>
              <div style={{ width: '80px', height: '12px', background: '#f3f4f6', borderRadius: '4px' }}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-container">
    
   {/* Header */}
      <div className="analytics-page-header">
        {/* First row: Badge and View Toggle */}
        <div className="header-row-1">
          <div className="header-badge" style={{marginBottom:'0px'}}>
            <Zap size={14} />
            <span>Admin Dashboard</span>
          </div>

          <ViewToggle
            activeView={activeView}
            onViewChange={setActiveView}
          />
        </div>

        {/* Second row: Title and Time Range */}
        <div className="header-row-2">
          <h1 className="page-title">Platform Analytics</h1>

          <div className="view-toggle-container">
            <div className="view-toggle-wrapper">
              <button
                className={`view-toggle-button ${timeRange === '7d' ? 'active' : ''}`}
                onClick={() => handleTimeRangeChange('7d')}
              >
                <Calendar size={16} />
                <span>7 Days</span>
              </button>
              <button
                className={`view-toggle-button ${timeRange === 'mtd' ? 'active' : ''}`}
                onClick={() => handleTimeRangeChange('mtd')}
              >
                <Calendar size={16} />
                <span>Month to Date</span>
              </button>
              <button
                className={`view-toggle-button ${timeRange === '30d' ? 'active' : ''}`}
                onClick={() => handleTimeRangeChange('30d')}
              >
                <Calendar size={16} />
                <span>1 Month</span>
              </button>
              <button
                className={`view-toggle-button ${timeRange === '90d' ? 'active' : ''}`}
                onClick={() => handleTimeRangeChange('90d')}
              >
                <Calendar size={16} />
                <span>3 Months</span>
              </button>
              <button
                className={`view-toggle-button ${timeRange === 'custom' ? 'active' : ''}`}
                onClick={() => {
                  setShowCustomDatePicker(true);
                }}
              >
                <Calendar size={16} />
                <span>Custom Date</span>
              </button>
            </div>
          </div>
        </div>

        {/* Third row: Subtitle */}
        <div className="header-row-3">
          <p className="page-subtitle">
            Comprehensive insights into course performance and learner engagement
          </p>
        </div>
      </div>
      {/* Custom Date Picker Modal */}
      {showCustomDatePicker && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Select Custom Date Range</h3>
              <button 
                className="close-button"
                onClick={() => setShowCustomDatePicker(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="date-range-container">
                <div className="date-input-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={customDateRange.startDate ? customDateRange.startDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : null;
                      setCustomDateRange(prev => ({ ...prev, startDate: date }));
                    }}
                    min={organizationCreatedDate ? organizationCreatedDate.toISOString().split('T')[0] : ''}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="date-input-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={customDateRange.endDate ? customDateRange.endDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : null;
                      setCustomDateRange(prev => ({ ...prev, endDate: date }));
                    }}
                    min={customDateRange.startDate ? customDateRange.startDate.toISOString().split('T')[0] : organizationCreatedDate ? organizationCreatedDate.toISOString().split('T')[0] : ''}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              <div className="quick-select-buttons">
                {/* <button 
                  className="quick-select-btn"
                  onClick={() => {
                    const today = new Date();
                    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                    setCustomDateRange({
                      startDate: startOfMonth,
                      endDate: today
                    });
                  }}
                >
                  This Month
                </button>
                <button 
                  className="quick-select-btn"
                  onClick={() => {
                    const today = new Date();
                    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
                    setCustomDateRange({
                      startDate: lastMonthStart,
                      endDate: lastMonthEnd
                    });
                  }}
                >
                  Last Month
                </button>
                <button 
                  className="quick-select-btn"
                  onClick={() => {
                    const today = new Date();
                    setCustomDateRange({
                      startDate: organizationCreatedDate,
                      endDate: today
                    });
                  }}
                  disabled={!organizationCreatedDate}
                >
                  All Time
                </button> */}
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowCustomDatePicker(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={handleCustomDateRangeApply}
                disabled={!customDateRange.startDate || !customDateRange.endDate}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {activeView === 'users' && (
        <>
          {/* Key Metrics Grid - Total Usage */}
          <div className="metrics-grid-enhanced">
            <MetricCard
              icon={Activity}
              label="Daily Active Users"
              value={formatNumber(userData.dau)}
              subtitle={getTimeRangeSubtitle('dau')}
              trend="up"
              trendValue={userData.dauChange}
              color="color-primary"
              delay={0}
              onClick={() => document.getElementById('usage-trend-chart').scrollIntoView({ behavior: 'smooth' })}
            />
            <MetricCard
              icon={Users}
              label="Monthly Active Users"
              value={formatNumber(userData.mau)}
              subtitle={getTimeRangeSubtitle('mau')}
              trend="up"
              trendValue={userData.mauChange}
              color="color-assessment"
              delay={100}
              onClick={() => document.getElementById('usage-trend-chart').scrollIntoView({ behavior: 'smooth' })}
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
              value={userData.avgTimeOnPlatform || "--"}
              subtitle={`Per user daily average - ${getTimeRangeSubtitle()}`}
              trend="up"
              trendValue={5.3}
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
              // onClick={() => setShowGiftPopup(true)}
            />

          </div>

          {/* Charts Row 1: Course Adoption & Usage Trend */}
          <div style={{ display: 'grid', gridTemplateColumns: showUserFilters ? '80% 20%' : '100%', gap: '20px', marginBottom: '24px', transition: 'all 0.3s ease' }}>
            {/* Usage Trend Chart - 70% */}
            <div id="usage-trend-chart" className="chart-panel">
              <div className="panel-header-enhanced">
                <div>
                  <h3 className="panel-title">User Login</h3>
                  <p className="panel-description">Track your user login</p>
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  {/* <Activity size={20} className="panel-icon" /> */}

                  {/* Filter Dropdown Button */}
                  <button
                    onClick={() => {
                      setShowUserFilters(!showUserFilters);
                      // Close other filter panels when opening this one
                      if (!showUserFilters) {
                       
                        setShowAtRiskFilters(false);
                      }
                    }}
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
                  <BarChart data={usageTrend}>
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
                    <Bar dataKey="mau" fill={COLORS.accent} name="MAU" />
                    <Bar dataKey="dau" fill={COLORS.primary} name="DAU" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1, textAlign: 'center', padding: '12px', background: '#f9fafb', borderRadius: '12px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: COLORS.primary }}>
                    {formatNumber(currentDAU)}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500 }}>
                    Current DAU
                  </div>
                </div>
                <div style={{ flex: 1, textAlign: 'center', padding: '12px', background: '#f9fafb', borderRadius: '12px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: COLORS.accent }}>
                    {formatNumber(currentMAU)}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500 }}>
                    Current MAU
                  </div>
                </div>
                <div style={{ flex: 1, textAlign: 'center', padding: '12px', background: '#f9fafb', borderRadius: '12px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: COLORS.success }}>
                    {formatNumber(totalActiveUsers)}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500 }}>
                    Total Active Users
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
                  {/* <div className="filter-group-enhanced">
                    <label>Time Range</label>
                    <select
                      value={userFilters.timeRange}
                      onChange={(e) => handleTimeRangeChange(e.target.value)}
                      className="filter-select-enhanced"
                      style={{ minWidth: 'auto', width: '100%' }}
                    >
                      <option value="7d">Last 7 Days</option>
                      <option value="30d">Last 30 Days</option>
                      <option value="90d">Last 90 Days</option>
                    </select>
                  </div> */}

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
                      setIsUsageTrendLoading(true);
                      fetchUsageTrendWithFilters(userFilters);
                      // fetchEngagementHeatmap(userFilters.timeRange);
                      // Handle new time ranges for fetchAtRiskLearners
                      // if (userFilters.timeRange === 'mtd' || userFilters.timeRange === 'custom') {
                      //   fetchAtRiskLearners(userFilters.timeRange);
                      // } else {
                      //   const days = userFilters.timeRange === '7d' ? 7 : userFilters.timeRange === '30d' ? 30 : 90;
                      //   fetchAtRiskLearners(days);
                      // }
                      // setShowUserFilters(false); // Close filter panel
                      
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
                    {isUsageTrendLoading ? 'Loading...' : 'Apply Filters'}
                  </button>

                  {/* Reset Filters Button */}
                  <button
                    onClick={() => {
                      handleTimeRangeChange('30d'); // Use the proper handler
                      handleUserStatusChange('all'); // Use the proper handler
                      // setShowUserFilters(false); // Close filter panel
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

                  {/* Export Button */}
                  <button
                    onClick={exportUsageTrendData}
                    style={{
                      padding: '12px 20px',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.2)';
                    }}
                  >
                    <FileText size={16} />
                    Export
                  </button>
                </div>
              </div>
            )}
          </div>




          {/* At-Risk Learners */}
           <div style={{ display: 'grid', gridTemplateColumns: showAtRiskFilters ? '80% 20%' : '100%', gap: '20px', marginBottom: '24px', transition: 'all 0.3s ease' }}>
          <div className="chart-panel">
            <div className="panel-header-enhanced">
              <div>
                <h3 className="panel-title"> Learners With No Login Activity </h3>
                {/* <p className="panel-description">Learners requiring intervention or support</p> */}
              </div>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  {/* <Activity size={20} className="panel-icon" /> */}

                  {/* Filter Dropdown Button */}
                  <button
                    onClick={() => {
                      setShowAtRiskFilters(!showAtRiskFilters);
                      // Close other filter panels when opening this one
                      if (!showAtRiskFilters) {
                        setShowUserFilters(false);
                        
                      }
                    }}
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
                      if (!showAtRiskFilters) {
                        e.currentTarget.style.background = '#f3f4f6';
                        e.currentTarget.style.borderColor = '#1C88C7';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!showAtRiskFilters) {
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
                      {/* <th>Avg Score</th> */}
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
                        {/* <td>
                          <span style={{
                            fontSize: '14px',
                            fontWeight: 600, paddingLeft: "25px",
                            color: learner.averageScore < 60 ? COLORS.danger : learner.averageScore < 75 ? COLORS.warning : COLORS.success,

                          }}>
                            {learner.averageScore}%
                          </span>
                        </td> */}
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
                              // Debug: log the learner data structure
                              console.log('Learner data:', learner);
                              console.log('Learner uuid:', learner.uuid);
                              console.log('Learner userId:', learner.userId);
                              console.log('Learner _id:', learner._id);
                              // Fetch user analytics and open popup
                              fetchUserAnalytics(learner.uuid);
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
                            <TrendingUp size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
           {/* Filters Panel - 20% - Conditional */}
            {showAtRiskFilters&& (
              <div className="chart-panel">
                <div className="panel-header-enhanced">
                  <div>
                    <h3 className="panel-title">Filters</h3>
                    <p className="panel-description">Refine your view</p>
                  </div>
                  <Grid size={20} className="panel-icon" />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '12px' }}>
                 

                  {/* Risk Level Filter */}
                  <div className="filter-group-enhanced">
                    <label>Risk Level</label>
                    <select
                      value={atRiskFilters.riskLevel}
                      onChange={(e) => setAtRiskFilters(prev => ({ ...prev, riskLevel: e.target.value }))}
                      className="filter-select-enhanced"
                      style={{ minWidth: 'auto', width: '100%' }}
                    >
                      <option value="high">High Risk</option>
                      <option value="medium">Medium Risk</option>
                    </select>
                  </div>

                  {/* Quick Stats in Filters */}
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
                        <span style={{ fontSize: '13px', color: '#374151' }}>Total At-Risk</span>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: COLORS.primary }}>
                          {formatNumber(atRiskLearners.length)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: '#374151' }}>Never Logged In</span>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: COLORS.danger }}>
                          {formatNumber(atRiskLearners.filter(l => !l.lastLogin).length)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: '#374151' }}>30+ Days Ago</span>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: COLORS.warning }}>
                          {formatNumber(atRiskLearners.filter(l => l.lastLogin && getDaysAgo(l.lastLogin).includes('30+')).length)}
                        </span>
                      </div>
                      {/* <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: '#374151' }}>7-30 Days Ago</span>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: COLORS.accent }}>
                          {formatNumber(atRiskLearners.filter(l => l.lastLogin && getDaysAgo(l.lastLogin).includes('days') && !getDaysAgo(l.lastLogin).includes('30+') && !getDaysAgo(l.lastLogin).includes('7-')).length)}
                        </span>
                      </div> */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: '#374151' }}>Avg Completion</span>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: COLORS.success }}>
                          {atRiskLearners.length > 0 
                            ? Math.round(atRiskLearners.reduce((sum, l) => sum + (l.completionRate || 0), 0) / atRiskLearners.length) 
                            : 0}%
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: '#374151' }}>Zero Progress</span>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: COLORS.warning }}>
                          {formatNumber(atRiskLearners.filter(l => (l.completionRate || 0) === 0).length)}
                        </span>
                      </div>
                      {/* <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: '#374151' }}>High Risk (>60%)</span>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: COLORS.danger }}>
                          {formatNumber(atRiskLearners.filter(l => (l.completionRate || 0) < 40).length)}
                        </span>
                      </div> */}
                    </div>
                  </div>

                  {/* Apply Filters Button */}
                  <button
                    onClick={() => {
                      setIsAtRiskLearnersLoading(true);
                      fetchAtRiskLearnersWithFilters({ ...atRiskFilters, timeRange: timeRange });
                      // setShowAtRiskFilters(false); // Close filter panel
                      console.log('At-Risk filters applied:', atRiskFilters);
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
                    {isAtRiskLearnersLoading ? 'Loading...' : 'Apply Filters'}
                  </button>

                  {/* Reset Filters Button */}
                  <button
                    onClick={() => {
                      setAtRiskFilters({ riskLevel: 'high' });
                      setShowAtRiskFilters(false); // Close filter panel
                      // Load default data
                      fetchAtRiskLearnersWithFilters({ riskLevel: 'high', timeRange: timeRange });
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

                  {/* Export Button */}
                  <button
                    onClick={exportAtRiskLearnersData}
                    style={{
                      padding: '12px 20px',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.2)';
                    }}
                  >
                    <FileText size={16} />
                    Export
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

        </>)}
      {activeView === 'courses' && (
        <>
          {/* Key Metrics Grid - Course Content */}
          <div className="metrics-grid-enhanced">
            <MetricCard
              icon={FileText}
              label="Modules"
              value={formatNumber(courseMetrics.modules)}
              subtitle={`Available modules - ${getTimeRangeSubtitle()}`}
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
              subtitle={`Available assessments - ${getTimeRangeSubtitle()}`}
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
              subtitle={`Available surveys - ${getTimeRangeSubtitle()}`}
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
              subtitle={`Available learning paths - ${getTimeRangeSubtitle()}`}
              trend="up"
              trendValue={15.8}
              color="color-neutral"
              delay={300}
              onClick={() => navigate('/admin/learning-paths')}
            />
            <MetricCard
              icon={Target}
              label="Completion Rate"
              value={calculateCompletionRate().rate}
              subtitle={`${calculateCompletionRate().completed} of ${calculateCompletionRate().enrolled} learners - ${getTimeRangeSubtitle()}`}
              trend="up"
              trendValue={5.3}
              color="color-assessment"
              delay={200}
              onClick={() => document.getElementById('course-adoption-chart').scrollIntoView({ behavior: 'smooth' })}
            />
          </div>

          {/* Charts Row 1: Course Adoption & Usage Trend */}
          <div style={{ display: 'grid', gridTemplateColumns: showCourseAdoptionFilters ? '80% 20%' : '100%', gap: '20px', marginBottom: '24px', transition: 'all 0.3s ease' }}>
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
                    onClick={() => {
                      setShowCourseAdoptionFilters(!showCourseAdoptionFilters);
                      // Close other filter panels when opening this one
                      if (!showCourseAdoptionFilters) {
                       
                       
                        setShowCoursePerformanceFilters(false);
                        setShowAtRiskFilters(false);
                      }
                    }}
                    style={{
                      padding: '8px 16px',
                      background: showCourseAdoptionFilters ? 'linear-gradient(135deg, #011F5B, #1C88C7)' : '#f9fafb',
                      color: showCourseAdoptionFilters ? 'white' : '#374151',
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
                      if (!showCourseAdoptionFilters) {
                        e.currentTarget.style.background = '#f3f4f6';
                        e.currentTarget.style.borderColor = '#1C88C7';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!showCourseAdoptionFilters) {
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

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px',marginTop:'30px' }}>
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
            {showCourseAdoptionFilters && (
              <div className="chart-panel">
                <div className="panel-header-enhanced">
                  <div>
                    <h3 className="panel-title">Filters</h3>
                    <p className="panel-description">Refine your view</p>
                  </div>
                  <Grid size={20} className="panel-icon" />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Category Filter */}
                  <div className="filter-group-enhanced">
                    <label>Category</label>
                    <select
                      value={courseAdoptionFilters.category}
                      onChange={(e) => setCourseAdoptionFilters(prev => ({ ...prev, category: e.target.value }))}
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
                      value={courseAdoptionFilters.team}
                      onChange={(e) => {
                        setCourseAdoptionFilters(prev => ({ ...prev, team: e.target.value, subteam: 'all' }));
                      }}
                      className="filter-select-enhanced"
                      style={{ minWidth: 'auto', width: '100%' }}
                    >
                      <option value="all">All Teams</option>
                      {teams.map((team, idx) => (
                        <option key={team._id} value={team._id}>{team.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Subteam Filter */}
                  <div className="filter-group-enhanced">
                    <label>Subteam</label>
                    <select
                      value={courseAdoptionFilters.subteam}
                      onChange={(e) => setCourseAdoptionFilters(prev => ({ ...prev, subteam: e.target.value }))}
                      className="filter-select-enhanced"
                      style={{ minWidth: 'auto', width: '100%' }}
                      disabled={courseAdoptionFilters.team === 'all'}
                    >
                      <option value="all">All Subteams</option>
                      {subteams
                        .filter(subteam => courseAdoptionFilters.team === 'all' || subteam.team_id?._id?.toString() === courseAdoptionFilters.team)
                        .map((subteam, idx) => (
                          <option key={subteam._id} value={subteam._id}>{subteam.name}</option>
                        ))}
                    </select>
                  </div>

                  {/* Quick Stats in Filters */}
                  {/* <div style={{
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
                        <span style={{ fontSize: '13px', color: '#374151' }}>Filtered Categories</span>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: COLORS.primary }}>
                          {courseLibrary.length}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: '#374151' }}>Total Courses</span>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: COLORS.warning }}>
                          {formatNumber(courseAdoption.reduce((acc, c) => acc + c.enrolled, 0))}
                        </span>
                      </div>
                    </div>
                  </div> */}

                  {/* Apply Filters Button */}
                  <button
                    onClick={() => {
                      console.log('Apply Filters clicked - current courseAdoptionFilters:', courseAdoptionFilters);
                      setIsCourseAdoptionLoading(true);
                      fetchCourseAdoptionWithFilters({ ...courseAdoptionFilters, timeRange: timeRange });
                      // setShowCourseAdoptionFilters(false) //Close filter panel
                     
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
                    {isCourseAdoptionLoading ? 'Loading...' : 'Apply Filters'}
                  </button>

                  {/* Reset Filters Button */}
                  <button
                    onClick={() => {
                      setCourseAdoptionFilters({ category: 'all', team: 'all',subteam:'all', timeRange: timeRange });
                      fetchCourseAdoptionWithFilters({ category: 'all', team: 'all',subteam:'all', timeRange: timeRange });
                      setShowCourseAdoptionFilters(false)
                      // Load default data with all categories and teams
                
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

                  {/* Export Button */}
                  <button
                    onClick={exportCourseAdoptionData}
                    style={{
                      padding: '12px 20px',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.2)';
                    }}
                  >
                    <FileText size={16} />
                    Export
                  </button>
                </div>
              </div>
            )}
          </div>
          {/* Course Library */}
        <div style={{ display: 'grid', gridTemplateColumns: showCourseLibraryFilters ? '80% 20%' : '100%', gap: '20px', marginBottom: '24px', transition: 'all 0.3s ease' }}>
          <div className="chart-panel">
            <div className="panel-header-enhanced">
              <div>
                <h3 className="panel-title">Course Library Distribution</h3>
                <p className="panel-description">Courses organized by category</p>
              </div>
              {/* <BookOpen size={20} className="panel-icon" /> */}
               <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  {/* <Target size={20} className="panel-icon" /> */}

                  {/* Filter Dropdown Button */}
                  <button
                    onClick={() => {
                      setShowCourseLibraryFilters(!showCourseLibraryFilters);
                      // Close other filter panels when opening this one
                      if (!showCourseLibraryFilters) {
                      
                        setShowCourseAdoptionFilters(false);
                        setShowCoursePerformanceFilters(false);
                       
                      }
                    }}
                    style={{
                      padding: '8px 16px',
                      background: showCourseLibraryFilters ? 'linear-gradient(135deg, #011F5B, #1C88C7)' : '#f9fafb',
                      color: showCourseLibraryFilters ? 'white' : '#374151',
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
                      if (!showCourseLibraryFilters) {
                        e.currentTarget.style.background = '#f3f4f6';
                        e.currentTarget.style.borderColor = '#1C88C7';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!showCourseLibraryFilters) {
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
            {/* Filters Panel - 20% - Conditional */}
            {showCourseLibraryFilters && (
              <div className="chart-panel">
                <div className="panel-header-enhanced">
                  <div>
                    <h3 className="panel-title">Filters</h3>
                    <p className="panel-description">Refine your view</p>
                  </div>
                  <Grid size={20} className="panel-icon" />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Category Filter */}
                  {/* <div className="filter-group-enhanced">
                    <label>Category</label>
                    <select
                      value={courseLibraryFilters.category}
                      onChange={(e) => setCourseLibraryFilters(prev => ({ ...prev, category: e.target.value }))}
                      className="filter-select-enhanced"
                      style={{ minWidth: 'auto', width: '100%' }}
                    >
                      <option value="all">All Categories</option>
                      {courseLibrary.map((cat, idx) => (
                        <option key={idx} value={cat.category}>{cat.category}</option>
                      ))}
                    </select>
                  </div> */}

                  {/* Team Filter */}
                  <div className="filter-group-enhanced">
                    <label>Team</label>
                    <select
                      value={courseLibraryFilters.team}
                      onChange={(e) => {
                        setCourseLibraryFilters(prev => ({ ...prev, team: e.target.value, subteam: 'all' }));
                      }}
                      className="filter-select-enhanced"
                      style={{ minWidth: 'auto', width: '100%' }}
                    >
                      <option value="all">All Teams</option>
                      {teams.map((team, idx) => (
                        <option key={team._id} value={team._id}>{team.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Subteam Filter */}
                  <div className="filter-group-enhanced">
                    <label>Subteam</label>
                    <select
                      value={courseLibraryFilters.subteam}
                      onChange={(e) => setCourseLibraryFilters(prev => ({ ...prev, subteam: e.target.value }))}
                      className="filter-select-enhanced"
                      style={{ minWidth: 'auto', width: '100%' }}
                      disabled={courseLibraryFilters.team === 'all'}
                    >
                      <option value="all">All Subteams</option>
                      {subteams
                        .filter(subteam => courseLibraryFilters.team === 'all' || subteam.team_id?._id?.toString() === courseLibraryFilters.team)
                        .map((subteam, idx) => (
                          <option key={subteam._id} value={subteam._id}>{subteam.name}</option>
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
                        <span style={{ fontSize: '13px', color: '#374151' }}>Total Courses</span>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: COLORS.primary }}>
                          {formatNumber(overallCourseLibrary.reduce((sum, cat) => sum + (cat.courses || 0), 0))}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: '#374151' }}>Categories</span>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: COLORS.accent }}>
                          {formatNumber(overallCourseLibrary.length)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: '#374151' }}>Total Teams</span>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: COLORS.success }}>
                          {formatNumber(overallCourseLibrary.reduce((sum, cat) => sum + (cat.teams || 0), 0))}
                        </span>
                      </div>
                     
                    </div>
                  </div>

                  {/* Apply Filters Button */}
                  <button
                    onClick={() => {
                      // fetchCourseAdoptionWithFilters(courseFilters);
                      setIsCourseLibraryLoading(true);
                      fetchCourseLibraryWithTimeRange({...courseLibraryFilters,timeRange:timeRange});
                      //setShowCourseLibraryFilters(false); // Close filter panel
                      // console.log('Filters applied:', courseFilters);
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
                    {isCourseLibraryLoading ? 'Loading...' : 'Apply Filters'}
                  </button>

                  {/* Reset Filters Button */}
                  <button
                    onClick={() => {
                      setCourseLibraryFilters({ category: 'all', team: 'all', subteam: 'all', timeRange: timeRange });
                      setShowCourseLibraryFilters(false); // Close filter panel
                      // Load default data with all categories and teams
                      // fetchCourseAdoptionWithFilters({ category: 'all', team: 'all', timeRange: timeRange });
                      fetchCourseLibraryWithTimeRange({ category: 'all', team: 'all',subteam: 'all', timeRange: timeRange });
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

                  {/* Export Button */}
                  <button
                    onClick={exportCourseLibraryData}
                    style={{
                      padding: '12px 20px',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.2)';
                    }}
                  >
                    <FileText size={16} />
                    Export
                  </button>
                </div>
              </div>
            )}
        </div>


          {/* Course Performance & Adoption Insights */}
         <div style={{ display: 'grid', gridTemplateColumns: showCoursePerformanceFilters ? '80% 20%' : '100%', gap: '20px', marginBottom: '24px', transition: 'all 0.3s ease' }}>
          <div className="chart-panel">
            <div className="panel-header-enhanced">
              <div>
                <h3 className="panel-title">
                {coursePerformanceFilters.content === 'modules' ? 'Module Performance Insights' :
                 coursePerformanceFilters.content === 'assessments' ? 'Assessment Performance Insights' :
                 coursePerformanceFilters.content === 'surveys' ? 'Survey Performance Insights' :
                 coursePerformanceFilters.content === 'learningpaths' ? 'Learning Path Performance Insights' :
                 'Course Performance Insights'}
              </h3>
              <p className="panel-description">
                {coursePerformanceFilters.content === 'modules' ? 'Top performing modules and adoption metrics' :
                 coursePerformanceFilters.content === 'assessments' ? 'Top performing assessments and completion metrics' :
                 coursePerformanceFilters.content === 'surveys' ? 'Survey response and completion metrics' :
                 coursePerformanceFilters.content === 'learningpaths' ? 'Learning path progress and completion metrics' :
                 'Top performing courses and adoption metrics'}
              </p>
              </div>
               <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  {/* <Target size={20} className="panel-icon" /> */}

                  {/* Filter Dropdown Button */}
                  <button
                    onClick={() => {
                      setShowCoursePerformanceFilters(!showCoursePerformanceFilters);
                      // Close other filter panels when opening this one
                      if (!showCoursePerformanceFilters) {
                       
                        setShowCourseAdoptionFilters(false);
                        setShowCourseLibraryFilters(false);
                       
                      }
                    }}
                    style={{
                      padding: '8px 16px',
                      background: showCoursePerformanceFilters ? 'linear-gradient(135deg, #011F5B, #1C88C7)' : '#f9fafb',
                      color: showCoursePerformanceFilters ? 'white' : '#374151',
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
                      if (!showCoursePerformanceFilters) {
                        e.currentTarget.style.background = '#f3f4f6';
                        e.currentTarget.style.borderColor = '#1C88C7';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!showCoursePerformanceFilters) {
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginTop: '20px' }}>
              {/* Top Performing Courses */}
              <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '16px',minHeight: "369px"}}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <TrendingUp size={18} style={{ color: COLORS.success }} />
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>
                    {coursePerformanceFilters.content === 'modules' ? 'Top Performing Modules' :
                     coursePerformanceFilters.content === 'assessments' ? 'Top Performing Assessments' :
                     coursePerformanceFilters.content === 'surveys' ? 'Top Responded Surveys' :
                     coursePerformanceFilters.content === 'learningpaths' ? 'Top Performing Learning Paths' :
                     'Top Performing Courses'}
                  </h4>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(() => {
                    const topPerformingCourses = coursePerformanceData && coursePerformanceData.length > 0 
                      ? coursePerformanceData.filter(course => course.performanceLevel === 'Top Performing').slice(0, 5)
                      : [];
                    
                    return topPerformingCourses.length > 0 ? (
                      topPerformingCourses.map((course, idx) => (
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
                            {course.completionRate}%
                          </div>
                        </div>
                        <div className="progress-bar" style={{ height: '6px' }}>
                          <div
                            className="progress-fill"
                            style={{
                              width: `${course.completionRate}%`,
                              background: COLORS.success
                            }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '125px 20px', 
                      color: '#6b7280',
                      fontSize: '14px'

                    }}>
                      <div style={{ marginBottom: '8px' }}>
                        {coursePerformanceFilters.content === 'modules' ? 'No top performing modules available' :
                         coursePerformanceFilters.content === 'assessments' ? 'No top performing assessments available' :
                         coursePerformanceFilters.content === 'surveys' ? 'No top performing surveys available' :
                         coursePerformanceFilters.content === 'learningpaths' ? 'No top performing learning paths available' :
                         'No top performing courses available'}
                      </div>
                      <div style={{ fontSize: '12px', opacity: 0.7 }}>
                        {coursePerformanceFilters.content === 'modules' || coursePerformanceFilters.content === 'assessments' ? 
                          'Top performers need 80%+ completion and 70%+ average score' :
                          'User activity is needed for top performance metrics'}
                      </div>
                    </div>
                  );
                  })()}
                </div>
              </div>

              {/* Courses Needing Attention */}
              <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <AlertTriangle size={18} style={{ color: COLORS.warning }} />
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>
                    {coursePerformanceFilters.content === 'modules' ? 'Modules Needing Attention' :
                     coursePerformanceFilters.content === 'assessments' ? 'Assessments Needing Attention' :
                     coursePerformanceFilters.content === 'surveys' ? 'Surveys Needing Attention' :
                     coursePerformanceFilters.content === 'learningpaths' ? 'Learning Paths Needing Attention' :
                     'Courses Needing Attention'}
                  </h4>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(() => {
                    const needingAttentionCourses = coursePerformanceData && coursePerformanceData.length > 0 
                      ? coursePerformanceData.filter(course => course.performanceLevel === 'Needs Attention').slice(0, 5)
                      : [];
                    
                    return needingAttentionCourses.length > 0 ? (
                      needingAttentionCourses.map((course, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: 'white',
                          padding: '16px',
                          borderRadius: '12px',
                          borderLeft: `4px solid ${course.completionRate < 40 ? COLORS.danger : COLORS.warning}`,
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
                            background: course.completionRate < 40 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                            fontSize: '13px',
                            fontWeight: 700,
                            color: course.completionRate < 40 ? COLORS.danger : COLORS.warning
                          }}>
                            {course.completionRate}%
                          </div>
                        </div>
                        <div className="progress-bar" style={{ height: '6px' }}>
                          <div
                            className="progress-fill"
                            style={{
                              width: `${course.completionRate}%`,
                              background: course.completionRate < 40 ? COLORS.danger : COLORS.warning
                            }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '125px 20px', 
                      color: '#6b7280',
                      fontSize: '14px'
                    }}>
                      <div style={{ marginBottom: '8px' }}>
                        {coursePerformanceFilters.content === 'modules' ? 'No modules needing attention' :
                         coursePerformanceFilters.content === 'assessments' ? 'No assessments needing attention' :
                         coursePerformanceFilters.content === 'surveys' ? 'No surveys needing attention' :
                         coursePerformanceFilters.content === 'learningpaths' ? 'No learning paths needing attention' :
                         'No courses needing attention'}
                      </div>
                      <div style={{ fontSize: '12px', opacity: 0.7 }}>
                        {coursePerformanceFilters.content === 'modules' ? 'All modules are performing well' :
                         coursePerformanceFilters.content === 'assessments' ? 'All assessments are performing well' :
                         coursePerformanceFilters.content === 'surveys' ? 'All surveys are performing well' :
                         coursePerformanceFilters.content === 'learningpaths' ? 'All learning paths are performing well' :
                         'All courses are performing well'}
                      </div>
                    </div>
                  );
                  })()}
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
                  {coursePerformanceData.filter(c => c.performanceLevel === 'Top Performing').length}
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                  Top Performing
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 700, color: 'white', marginBottom: '4px' }}>
                  {coursePerformanceData.filter(c => c.performanceLevel === 'Good Performance').length}
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                  Good Performance
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 700, color: 'white', marginBottom: '4px' }}>
                  {coursePerformanceData.filter(c => c.performanceLevel === 'Needs Attention').length}
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                  Needs Attention
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 700, color: 'white', marginBottom: '4px' }}>
                  {coursePerformanceData.length > 0
                    ? `${Math.round(coursePerformanceData.reduce((acc, c) => acc + Number(c.completionRate), 0) / coursePerformanceData.length)}%`
                    : '0%'
                  }
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                  Average Completion Rate
                </div>
              </div>
            </div>
          </div>
           {/* Filters Panel - 20% - Conditional */}
            {showCoursePerformanceFilters && (
              <div className="chart-panel">
                <div className="panel-header-enhanced">
                  <div>
                    <h3 className="panel-title">Filters</h3>
                    <p className="panel-description">Refine your view</p>
                  </div>
                  <Grid size={20} className="panel-icon" />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Content Filter */}
                  <div className="filter-group-enhanced">
                    <label>Content</label>
                    <select
                      value={coursePerformanceFilters.content}
                      onChange={(e) => setCoursePerformanceFilters(prev => ({ ...prev, content: e.target.value }))}  
                      className="filter-select-enhanced"
                      style={{ minWidth: 'auto', width: '100%' }}
                    >
                      <option value="modules">Modules</option>
                      <option value="assessments">Assessments</option>
                      <option value="surveys">Surveys</option>
                      <option value="learningpaths">Learning Paths</option>
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
                        <span style={{ fontSize: '13px', color: '#374151' }}>Total Courses</span>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: COLORS.primary }}>
                          {formatNumber(coursePerformanceData.length)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: '#374151' }}>Total Enrollments</span>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: COLORS.accent }}>
                          {formatNumber(coursePerformanceData.reduce((sum, c) => sum + (c.enrolled || 0), 0))}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: '#374151' }}>Total Completed</span>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: COLORS.success }}>
                          {formatNumber(coursePerformanceData.reduce((sum, c) => sum + (c.completed || 0), 0))}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: '#374151' }}>In Progress</span>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: COLORS.warning }}>
                          {formatNumber(coursePerformanceData.reduce((sum, c) => sum + (c.inProgress || 0), 0))}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: '#374151' }}>Average Score</span>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: COLORS.primary }}>
                          {coursePerformanceData.length > 0 && coursePerformanceData.some(c => c.avgScore > 0)
                            ? `${Math.round(coursePerformanceData.reduce((acc, c) => acc + Number(c.avgScore || 0), 0) / coursePerformanceData.length)}%`
                            : 'N/A'
                          }
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: '#374151' }}>Avg Completion</span>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: COLORS.success }}>
                          {coursePerformanceData.length > 0
                            ? `${Math.round(coursePerformanceData.reduce((acc, c) => acc + Number(c.completionRate), 0) / coursePerformanceData.length)}%`
                            : '0%'
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Apply Filters Button */}
                  <button
                    onClick={() => {
                      setIsCoursePerformanceLoading(true);
                      fetchCoursePerformanceInsights({...coursePerformanceFilters,timeRange:timeRange});
                      // setShowCoursePerformanceFilters(false); // Close filter panel
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
                    {isCoursePerformanceLoading ? 'Loading...' : 'Apply Filters'}
                  </button>

                  {/* Reset Filters Button */}
                  <button
                    onClick={() => {
                      setCoursePerformanceFilters({ content: 'modules', timeRange: timeRange });
                      setShowCoursePerformanceFilters(false); // Close filter panel
                      fetchCoursePerformanceInsights({ content: 'modules', timeRange: timeRange });
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

                  {/* Export Button */}
                  <button
                    onClick={exportCoursePerformanceData}
                    style={{
                      padding: '12px 20px',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.2)';
                    }}
                  >
                    <FileText size={16} />
                    Export
                  </button>
                </div>
              </div>
            )}
          </div>


        </>)}

      <GiftPopup
        isVisible={showGiftPopup}
        onClose={() => setShowGiftPopup(false)}
        stickinessScore={userData.stickinessScore}
      />

      <AnalyticsPop
        isOpen={showAnalyticsPopup}
        onClose={() => {
          setShowAnalyticsPopup(false);
          setSelectedUserAnalytics(null);
        }}
        data={selectedUserAnalytics}
        loading={analyticsLoading}
        analyticsType="user"
      />

    </div>
  );
};

export default AdminAnalyticsDashboard;