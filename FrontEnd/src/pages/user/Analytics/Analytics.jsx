import React, { useState, useEffect } from 'react';
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import {
    BookOpen,
    Clock,
    Target,
    Trophy,
    Calendar,
    TrendingUp,
    Award,
    Zap,
    Activity,
    GitGraph,
    LineChart,
    LineChartIcon,
    LucideTarget,
    Accessibility,
    LucideAccessibility,
    Pointer,
    Plus,
    CalendarDays,
} from 'lucide-react';
import './Analytics.css';
import api from '../../../services/api';
import { useNavigate } from 'react-router-dom';
import AnalyticsPop from './AnalyticsPop';
import { LuCalendarOff } from "react-icons/lu";
import { FaAward, FaChartLine, FaCheckCircle, FaClock, FaExclamationTriangle, FaHourglassHalf, FaMedal, FaPlayCircle, FaStar } from 'react-icons/fa';
const COLORS = {
    primary: '#011F5B',
    accent: '#1C88C7',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    purple: '#8b5cf6',
};


const CHART_COLORS = ['#011F5B', '#1C88C7', '#10b981', '#f59e0b'];

const LearnerAnalytics = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('7D');
    const [showModal, setShowModal] = useState(false);
    const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
    const [customDateRange, setCustomDateRange] = useState({
        startDate: '',
        endDate: ''
    });
    const [stats, setStats] = useState({
        avgScore: 0,
        timeSpent: 0,
        completionRate: 0,
        leaderboardPosition: 'N/A',
        teamPosition: 'N/A',
        teamTotalParticipants: 0,
        totalParticipants: 0,
        newCourses: 'N/A'
    });
    const [moduleAnalytics, setModuleAnalytics] = useState({
        courseCompletion: [],
        completedCourses: 0,
        totalCourses: 0,
        inProgressCourses: 0,
        assignedCourses: 0,
        overdueCourses: 0,
    });
    const [Deadlines, setDeadlines] = useState({
        upcomingDeadlines: [],
        overdueAssignments: [],
    });
    const [rewards, setRewards] = useState({
        stars: 0,
        badges: 0,
        credits: 0
    });
    const [assessmentScores, setAssessmentScores] = useState({
        assessmentScores: [],
        avgScore: 0,
        classAverage: 0
    });
    const [weeklyActivity, setWeeklyActivity] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAllAnalytics = async () => {
            setIsLoading(true);
            try {
                // Prepare date range parameters
                const dateParams = timeRange === 'custom' 
                    ? { 
                        startDate: customDateRange.startDate,
                        endDate: customDateRange.endDate
                    }
                    : { dateRange: timeRange };

                // Only fetch if we have valid date range (for custom range)
                if (timeRange === 'custom' && (!customDateRange.startDate || !customDateRange.endDate)) {
                    setIsLoading(false);
                    return;
                }

                // Fetch all data in parallel
                const [
                    statsResponse,
                    moduleResponse,
                    deadlinesResponse,
                    rewardsResponse,
                    assessmentResponse,
                    weeklyResponse
                ] = await Promise.all([
                    api.get('/api/user/analytics/getStats', {
                        params: dateParams
                    }),
                    api.get('/api/user/analytics/getCourseAnalytics', {
                        params: dateParams
                    }),
                    api.get('/api/user/analytics/getDeadlinesAndOverDue'),
                    api.get('/api/user/analytics/getUserRewards'),
                    api.get('/api/user/analytics/getAssessmentPerformance', {
                        params: dateParams
                    }),
                    api.get('/api/user/analytics/getWeeklyActivity', {
                        params: dateParams
                    })
                ]);

                // Set all data at once
                setStats(statsResponse.data.data);
                setModuleAnalytics(moduleResponse.data.data);
                setDeadlines(deadlinesResponse.data.data);
                setRewards(rewardsResponse.data.data);
                setAssessmentScores(assessmentResponse.data.data);
                setWeeklyActivity(weeklyResponse.data.data);

            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllAnalytics();
    }, [timeRange, customDateRange.startDate, customDateRange.endDate]);
    const scores = (Array.isArray(assessmentScores?.assessmentScores) ? assessmentScores?.assessmentScores : []).map(item => ({
        ...item,
        shortName:
            item.name.length > 25 ? item.name.substring(0, 25) + "..." : item.name,
    }));

    const MetricCard = ({ icon: Icon, label, value, subtitle, trend, color, delay = 0 }) => (
        <div
            className="metric-card-enhanced"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="metric-card-header">
                <div className={`metric-icon-enhanced ${color}`}>
                    <Icon size={22} strokeWidth={2} />
                </div>
                {trend && (
                    <div className={`metric-trend ${trend > 0 ? 'trend-up' : 'trend-down'}`}>
                        <TrendingUp size={14} />
                        <span>{Math.abs(trend)}%</span>
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

    if (isLoading) {
        return (
            <div className="analytics-container">
                {/* Header with loading skeleton */}
                <div className="page-header">
                    <div className="header-content">
                        <div className="header-badge" style={{ background: '#f3f4f6', width: '120px', height: '24px' }}></div>
                        <div className="page-title" style={{ background: '#f3f4f6', width: '200px', height: '32px', borderRadius: '8px' }}></div>
                        <div className="page-subtitle" style={{ background: '#f3f4f6', width: '300px', height: '16px', borderRadius: '4px' }}></div>
                    </div>
                    <div className="date-range-selector">
                        <div className="date-range-btn" style={{ background: '#f3f4f6', width: '40px', height: '32px' }}></div>
                        <div className="date-range-btn" style={{ background: '#f3f4f6', width: '40px', height: '32px' }}></div>
                        <div className="date-range-btn" style={{ background: '#f3f4f6', width: '40px', height: '32px' }}></div>
                    </div>
                </div>

                {/* Loading metrics skeleton */}
                <div className="metrics-grid-enhanced">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="metric-card-enhanced" style={{ background: '#f9fafb' }}>
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
                        <div style={{ width: '100%', height: '280px', background: '#f3f4f6', borderRadius: '8px' }}></div>
                    </div>
                    <div className="chart-panel" style={{ background: '#f9fafb' }}>
                        <div style={{ width: '200px', height: '20px', background: '#e5e7eb', borderRadius: '4px', marginBottom: '16px' }}></div>
                        <div style={{ width: '100%', height: '280px', background: '#f3f4f6', borderRadius: '8px' }}></div>
                    </div>
                </div>
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
                        <span>Your Learning Journey</span>
                    </div>
                    <h1 className="page-title">My Analytics</h1>
                    <p className="page-subtitle">
                        Track your progress, achievements, and learning patterns
                    </p>
                </div>

                <div className="view-toggle-wrapper">
                    <button
                        className={`view-toggle-button ${timeRange === '7D' ? 'active' : ''}`}
                        onClick={() => {
                            setTimeRange('7D');
                            setShowCustomDatePicker(false);
                        }}
                    >
                        <Calendar size={16} />
                        <span>7 Days</span>
                    </button>
                    <button
                        className={`view-toggle-button ${timeRange === '1M' ? 'active' : ''}`}
                        onClick={() => { 
                            setTimeRange('1M');
                            setShowCustomDatePicker(false);
                        }}
                    >
                        <Calendar size={16} />
                        <span>1 Month</span>
                    </button>
                    <button
                        className={`view-toggle-button ${timeRange === '3M' ? 'active' : ''}`}
                        onClick={() => { 
                            setTimeRange('3M');
                            setShowCustomDatePicker(false);
                        }}
                    >
                        <Calendar size={16} />
                        <span>3 Months</span>
                    </button>
                    <button
                        className={`view-toggle-button ${timeRange === 'custom' ? 'active' : ''}`}
                        onClick={() => {
                            if (timeRange !== 'custom') {
                                setTimeRange('custom');
                            }
                            setShowCustomDatePicker(!showCustomDatePicker);
                        }}
                    >
                        <CalendarDays size={16} />
                        <span>Custom</span>
                    </button>
                </div>
                {showCustomDatePicker && (
                    <div className="custom-date-picker">
                        <div className="date-inputs">
                            <div className="date-input-group">
                                <label>From:</label>
                                <input
                                    type="date"
                                    value={customDateRange.startDate}
                                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                                    max={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            <div className="date-input-group">
                                <label>To:</label>
                                <input
                                    type="date"
                                    value={customDateRange.endDate}
                                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                                    max={new Date().toISOString().split('T')[0]}
                                    min={customDateRange.startDate}
                                />
                            </div>
                            <button
                                className="apply-date-range-btn"
                                onClick={() => {
                                    if (customDateRange.startDate && customDateRange.endDate) {
                                        setShowCustomDatePicker(false);
                                    }
                                }}
                                disabled={!customDateRange.startDate || !customDateRange.endDate}
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <div className='summary-grid'>
            <div className="learning-dashboard-card learning-training-summary">
                <h4 className="learning-card-title">Training Summary</h4>
                <div className="learning-training-stats">
                    <div className="learning-stat-item" onClick={() => navigate('/user/completed')}>
                        <div className="learning-stat-icon completed">
                            <FaCheckCircle />
                        </div>
                        <div className="learning-stat-info">
                            <span className="learning-stat-label">Completed</span>
                            <span className="learning-stat-value">{moduleAnalytics.completedCourses}</span>
                        </div>
                    </div>

                    <div className="learning-stat-item" onClick={() => navigate('/user/inProgress')}>
                        <div className="learning-stat-icon in-progress">
                            <FaHourglassHalf />
                        </div>
                        <div className="learning-stat-info">
                            <span className="learning-stat-label">In Progress</span>
                            <span className="learning-stat-value">{moduleAnalytics.inProgressCourses}</span>
                        </div>
                    </div>
                    <div className="learning-stat-item" onClick={() => navigate('/user/completionRate')}>
                        <div className="learning-stat-icon completion-rate">
                            <FaChartLine />
                        </div>
                        <div className="learning-stat-info">
                            <span className="learning-stat-label">Completion Rate</span>
                            <span className="learning-stat-value">{stats.completionRate}</span>
                        </div>
                    </div>

                    <div className="learning-stat-item" onClick={() => navigate('/user/assigned')}>
                        <div className="learning-stat-icon not-started">
                            <FaPlayCircle />
                        </div>
                        <div className="learning-stat-info">
                            <span className="learning-stat-label">Not Started</span>
                            <span className="learning-stat-value">{moduleAnalytics.assignedCourses || 0}</span>
                        </div>
                    </div>

                    <div className="learning-stat-item" onClick={() => navigate('/user/assigned')}>
                        <div className="learning-stat-icon overdue">
                            <FaExclamationTriangle />
                        </div>
                        <div className="learning-stat-info">
                            <span className="learning-stat-label">Overdue</span>
                            <span className="learning-stat-value">{moduleAnalytics.overdueCourses}</span>
                        </div>
                    </div>

                    <div className="learning-stat-item">
                        <div className="learning-stat-icon time-spent-total">
                            <FaClock />
                        </div>
                        <div className="learning-stat-info">
                            <span className="learning-stat-label">Time Spent</span>
                            <span className="learning-stat-value">{stats.timeSpent}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="learning-dashboard-card">
                <h4 className="learning-card-title">Achievements & Leaderboard <span> <LuCalendarOff size={16} /> </span></h4>
                
                <div className="learning-achievements-container">
                    <div style={{ display: "flex", gap: "10px", flexDirection: "column" }}>
                        <div className="learning-achievement-item">
                            <div className="learning-achievement-icon creditss">
                                <FaMedal />
                            </div>
                            <div className="learning-achievement-info">
                                <span className="learning-achievement-label">Credits</span>
                                <span className="learning-achievement-value">{rewards.credits}</span>
                            </div>
                        </div>

                        <div className="learning-achievement-item">
                            <div className="learning-achievement-icon stars">
                                <FaStar />
                            </div>
                            <div className="learning-achievement-info">
                                <span className="learning-achievement-label">Stars</span>
                                <span className="learning-achievement-value">{rewards.stars}</span>
                            </div>
                        </div>

                        <div className="learning-achievement-item">
                            <div className="learning-achievement-icon badgesss">
                                <FaAward />
                            </div>
                            <div className="learning-achievement-info">
                                <span className="learning-achievement-label">Badges</span>
                                <span className="learning-achievement-value">{rewards.badges}</span>
                            </div>
                        </div>
                    </div>
                    <div className="learning-leaderboard-container">
                        <div className="learning-leaderboard-item">
                            <div className="learning-leaderboard-position">
                                <div className="learning-position-badge">
                                    <FaMedal className="learning-medal-icon" />
                                    <span className="learning-position-number">#{stats.teamPosition || 0}</span>
                                </div>
                                <div className="learning-position-info">
                                    <span className="learning-position-label">Team Rank</span>
                                    <span className="learning-position-total">of {stats.teamTotalParticipants || 0}</span>
                                </div>
                            </div>
                        </div>

                        <div className="learning-leaderboard-item">
                            <div className="learning-leaderboard-position">
                                <div className="learning-position-badge">
                                    <FaAward className="learning-medal-icon" />
                                    <span className="learning-position-number">#{stats.leaderboardPosition || 0}</span>
                                </div>
                                <div className="learning-position-info">
                                    <span className="learning-position-label">Organization Rank</span>
                                    <span className="learning-position-total">of {stats.totalParticipants}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
                <p className="learning-motivational-text">Keep climbing the leaderboard!</p>


            </div>
            </div>

            {/* <div className="metrics-grid-enhanced">
                <MetricCard
                    icon={Target}
                    label="Completion Rate"
                    value={`${Number(stats.completionRate) || 0}%`}
                    subtitle={`${Number(moduleAnalytics.completedCourses) || 0} of ${Number(moduleAnalytics.totalCourses) || 0} courses (${timeRange === '7D' ? 'last 7 days' : timeRange === '1M' ? 'last month' : 'last 3 months'})`}
                    trend={12}
                    color="color-primary"
                    delay={0}
                />
                <MetricCard
                    icon={Clock}
                    label="Time Spent Learning"
                    value={`${Number(stats.timeSpent) || 0}h`}
                    subtitle={`(${timeRange === '7D' ? 'last 7 days' : timeRange === '1M' ? 'last month' : 'last 3 months'})`}
                    trend={8}
                    color="color-secondary"
                    delay={100}
                />
                <MetricCard
                    icon={Award}
                    label="Average Score"
                    value={`${Number(stats.avgScore) || 0}%`}
                    subtitle={`Class avg: ${Number(assessmentScores.classAverage) || 0}% (${timeRange === '7D' ? 'last 7 days' : timeRange === '1M' ? 'last month' : 'last 3 months'})`}
                    trend={5}
                    color="color-tertiary"
                    delay={200}
                />
                <MetricCard
                    icon={Trophy}
                    label="Leaderboard Rank"
                    value={`${stats.leaderboardPosition === 0 ? "N/A" : stats.leaderboardPosition}`}
                    subtitle={`out of ${Number(stats.totalParticipants) || 0} learners (all-time)`}
                    color="color-neutral"
                    delay={300}
                />
                <MetricCard
                    icon={Plus}
                    label="New Courses"
                    value={`${stats.newCourses}`}
                    subtitle={`${stats.newCourses} new assignments (${timeRange === '7D' ? 'last 7 days' : timeRange === '1M' ? 'last month' : 'last 3 months'})`}
                    color="color-neutral"
                    delay={300}
                />
            </div> */}

            <AnalyticsPop
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                data={moduleAnalytics}
                loading={isLoading}
            />
            <div className="charts-grid">
                <div className="chart-panel">
                    <div className="panel-header-enhanced">
                        
                        <div>
                            
                            <h3 className="panel-title">Course Completion Status</h3>
                            <p className="panel-description">Your learning progress overview</p>
                        </div>
                        {/* <LineChart size={20} className="panel-icon modal-trigger-icon" onClick={() => setShowModal(true)} /> */}
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            {/* <BookOpen size={20} className="panel-icon" /> */}
                            <LineChart size={20} className="panel-icon modal-trigger-icon" style={{ color: "black" }} onClick={() => setShowModal(true)} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', marginTop: '20px' }}>
                        <ResponsiveContainer width="50%" height={280}>
                            <PieChart>
                                <Pie
                                    data={moduleAnalytics.courseCompletion}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={90}
                                    outerRadius={130}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {moduleAnalytics.courseCompletion.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="health-metric" style={{ background: 'transparent', padding: '16px 16px', cursor: 'pointer' }} onClick={() => navigate('/user/completed')}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                    <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: CHART_COLORS[0] }} />
                                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>Completed</span>
                                </div>
                                <div style={{ fontSize: '28px', fontWeight: 700, color: '#111827' }}>
                                    {Number(moduleAnalytics.completedCourses) || 0} courses
                                </div>
                            </div>

                            <div className="health-metric" style={{ background: 'transparent', padding: '16px 16px', cursor: 'pointer' }} onClick={() => navigate('/user/inProgress')}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                    <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: CHART_COLORS[1] }} />
                                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>In Progress</span>
                                </div>
                                <div style={{ fontSize: '28px', fontWeight: 700, color: '#111827' }}>
                                    {moduleAnalytics.inProgressCourses} courses
                                </div>
                            </div>

                            <div className="health-metric" style={{ background: 'transparent', padding: '16px 16px', cursor: 'pointer' }} onClick={() => navigate('/user/assigned')}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                    <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: CHART_COLORS[2] }} />
                                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>Assigned</span>
                                </div>
                                <div style={{ fontSize: '28px', fontWeight: 700, color: '#111827' }}>
                                    {moduleAnalytics.assignedCourses} courses
                                </div>
                            </div>

                            <div className="health-metric" style={{ background: 'transparent', padding: '16px 16px', cursor: 'pointer' }} onClick={() => navigate('/user/overdue')}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                    <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: CHART_COLORS[3] }} />
                                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>Overdue</span>
                                </div>
                                <div style={{ fontSize: '28px', fontWeight: 700, color: '#111827' }}>
                                    {moduleAnalytics.overdueCourses} courses
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row 2: Weekly Progress & Assessment Performance */}
            <div className="charts-grid">
                {/* Time Spent Learning */}
                <div className="chart-panel">
                    <div className="panel-header-enhanced">
                        <div>
                            <h3 className="panel-title">Learning Activity</h3>
                            <p className="panel-description">
                                {timeRange === '7D' ? 'Daily hours for last 7 days' :
                                    timeRange === '1M' ? 'Weekly hours for last 4 weeks' :
                                        'Weekly hours for last 12 weeks'}
                            </p>
                        </div>
                        {/* <Activity size={20} className="panel-icon" /> */}
                    </div>

                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={weeklyActivity}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                <XAxis
                                    dataKey="day"
                                    stroke="black"
                                    style={{ fontSize: 12 }}
                                    interval={timeRange === '3M' ? 2 : 0}
                                />
                                <YAxis stroke="black" style={{ fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{
                                        background: '#fff',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                    }}
                                />
                                <Bar dataKey="hours" fill={COLORS.accent} radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div style={{ marginTop: '16px', textAlign: 'center', padding: '12px', background: '#f9fafb', borderRadius: '12px' }}>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>
                            {weeklyActivity.reduce((acc, day) => acc + day.hours, 0).toFixed(1)}h
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>
                            {timeRange === '7D' ? 'Total this week' :
                                timeRange === '1M' ? 'Total last 4 weeks' :
                                    'Total last 12 weeks'}
                        </div>
                    </div>
                </div>


            </div>
        </div>
    );
}



export default LearnerAnalytics;