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
} from 'lucide-react';
import './Analytics.css';
import api from '../../../services/api';
import { useNavigate } from 'react-router-dom';
import AnalyticsPop from './AnalyticsPop';
const COLORS = {
    primary: '#011F5B',
    accent: '#1C88C7',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    purple: '#8b5cf6',
};

const CHART_COLORS = ['#011F5B', '#1C88C7', '#10b981', '#f59e0b', '#8b5cf6'];

const LearnerAnalytics = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('7D');
    const [showModal, setShowModal] = useState(false);
    const [stats, setStats] = useState({
        avgScore: 0,
        timeSpent: 0,
        completionRate: 0,
        leaderboardPosition: 'N/A',
        totalParticipants: 0,
        newCourses: 'N/A'
    });
    const [moduleAnalytics, setModuleAnalytics] = useState({
        courseCompletion: [],
        completedCourses: 0,
        totalCourses: 0,
        inProgressCourses: 0,
    });
    const [Deadlines, setDeadlines] = useState({
        upcomingDeadlines: [],
        overdueAssignments: [],
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
                // Fetch all data in parallel
                const [
                    statsResponse,
                    moduleResponse,
                    deadlinesResponse,
                    assessmentResponse,
                    weeklyResponse
                ] = await Promise.all([
                    api.get('/api/user/analytics/getStats', {
                        params: { dateRange: timeRange }
                    }),
                    api.get('/api/user/analytics/getCourseAnalytics', {
                        params: { dateRange: timeRange }
                    }),
                    api.get('/api/user/analytics/getDeadlinesAndOverDue'),
                    api.get('/api/user/analytics/getAssessmentPerformance', {
                        params: { dateRange: timeRange }
                    }),
                    api.get('/api/user/analytics/getWeeklyActivity', {
                        params: { dateRange: timeRange }
                    })
                ]);

                // Set all data at once
                setStats(statsResponse.data.data);
                setModuleAnalytics(moduleResponse.data.data);
                setDeadlines(deadlinesResponse.data.data);
                setAssessmentScores(assessmentResponse.data.data);
                setWeeklyActivity(weeklyResponse.data.data);
                
            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllAnalytics();
    }, [timeRange]);
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
                
                              }}
                            >
                              <Calendar size={16} />
                              <span>7 Days</span>
                            </button>
                            <button
                              className={`view-toggle-button ${timeRange === '1M' ? 'active' : ''}`}
                              onClick={() => { setTimeRange('1M') }}
                            >
                              <Calendar size={16} />
                              <span>1 Month</span>
                            </button>
                            <button
                              className={`view-toggle-button ${timeRange === '3M' ? 'active' : ''}`}
                              onClick={() => { setTimeRange('3M') }}
                            >
                              <Calendar size={16} />
                              <span>3 Months</span>
                            </button>
                          </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="metrics-grid-enhanced">
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
            </div>

            <AnalyticsPop
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                data={moduleAnalytics}
                loading={isLoading}
            />

            {/* Charts Row 1: Completion Donut & Deadlines */}
            <div className="charts-grid">
                {/* Completion Rate Donut */}
                <div className="chart-panel">
                    <div className="panel-header-enhanced">
                        <div>
                            <h3 className="panel-title">Course Completion Status</h3>
                            <p className="panel-description">Your learning progress overview</p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>

                            <LineChart size={20} className="panel-icon modal-trigger-icon" onClick={() => setShowModal(true)} />
                            <BookOpen size={20} className="panel-icon" />
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', marginTop: '20px' }}>
                        <ResponsiveContainer width="50%" height={280}>
                            <PieChart>
                                <Pie
                                    data={moduleAnalytics.courseCompletion}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
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

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', cursor: 'pointer' }} onClick={() => navigate('/user/completed')}>
                            <div className="health-metric" style={{ background: 'transparent', padding: '16px 16px' }}>
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
                        </div>
                    </div>
                </div>

                {/* Deadlines & Overdue */}
                <div className="chart-panel">
                    <div className="panel-header-enhanced">
                        <div>
                            <h3 className="panel-title">Upcoming Deadlines</h3>
                            <p className="panel-description">Stay on track with your assignments</p>
                        </div>
                        <Calendar size={20} className="panel-icon" />
                    </div>

                    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
                        {/* {Deadlines?.overdueAssignments.length > 0 && (
                            <>
                                {Deadlines?.overdueAssignments.length > 0 ? Deadlines?.overdueAssignments.map((item, idx) => (
                                    <div key={`overdue-${idx}`} style={{
                                        padding: '16px',
                                        background: 'rgba(239, 68, 68, 0.05)',
                                        borderRadius: '12px',
                                        borderLeft: `4px solid ${COLORS.danger}`
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '4px' }}>
                                                    {item.course}
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                                    Due: {new Date(item.dueDate).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div style={{
                                                padding: '4px 12px',
                                                background: COLORS.danger,
                                                color: 'white',
                                                borderRadius: '8px',
                                                fontSize: '12px',
                                                fontWeight: 600
                                            }}>
                                                {item.daysOverdue}d overdue
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '12px' }}>
                                        No overdue assignments
                                    </div>
                                )}
                            </>
                        )} */}

                        {Deadlines?.upcomingDeadlines.length > 0 ? Deadlines?.upcomingDeadlines.map((item, idx) => (
                            <div key={`upcoming-${idx}`} style={{
                                padding: '16px',
                                background: '#f9fafb',
                                borderRadius: '12px',
                                borderLeft: `4px solid ${item.daysLeft <= 5 ? COLORS.warning : COLORS.accent}`,
                                cursor: "pointer"
                            }}
                                onClick={() => navigate(`/${item.type}/${item.uuid}/${item.assign_id}`)}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '4px' }}>
                                            {item.course}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                            Due: {new Date(item.dueDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div style={{
                                        padding: '4px 12px',
                                        background: item.daysLeft <= 5 ? COLORS.warning : COLORS.accent,
                                        color: 'white',
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                        fontWeight: 600
                                    }}>
                                        {item.daysLeft}d left
                                    </div>
                                </div>
                                <div className="progress-bar" style={{ marginTop: '12px' }}>
                                    <div
                                        className="progress-fill"
                                        style={{
                                            width: `${item.progress}%`,
                                            background: item.daysLeft <= 5 ? COLORS.warning : COLORS.accent
                                        }}
                                    />
                                </div>
                                <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                                    {item.progress}% complete
                                </div>
                            </div>
                        )) : (
                            <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '12px' }}>
                                No upcoming deadlines
                            </div>
                        )}
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
                        <Activity size={20} className="panel-icon" />
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

                {/* Assessment Performance */}
                <div className="chart-panel">
                    <div className="panel-header-enhanced">
                        <div>
                            <h3 className="panel-title">Assessment Performance</h3>
                            <p className="panel-description">Your scores vs class average</p>
                        </div>
                        <Target size={20} className="panel-icon" />
                    </div>

                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={scores}>
                                <CartesianGrid strokeDasharray="3 3" stroke="black" />

                                <XAxis
                                    dataKey="shortName"
                                    stroke="green"
                                    style={{ fontSize: 12 }}

                                />

                                <YAxis type="number" domain={[0, 100]} stroke="black" style={{ fontSize: 12 }} />

                                <Tooltip
                                    formatter={(value) => [`${value}%`, 'Score']}
                                    contentStyle={{
                                        background: '#fff',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                    }}
                                />

                                <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                                    {scores.map((entry, index) => (

                                        <Cell
                                            key={index}
                                            fill={entry.score >= entry.classAverage ? COLORS.success : COLORS.warning}
                                        />

                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                        <div style={{ flex: 1, textAlign: 'center', padding: '12px', background: '#f9fafb', borderRadius: '12px' }}>
                            <div style={{ fontSize: '24px', fontWeight: 700, color: COLORS.success }}>
                                {assessmentScores.avgScore}%
                            </div>
                            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>
                                Your Average
                            </div>
                        </div>
                        <div style={{ flex: 1, textAlign: 'center', padding: '12px', background: '#f9fafb', borderRadius: '12px' }}>
                            <div style={{ fontSize: '24px', fontWeight: 700, color: '#6b7280' }}>
                                {assessmentScores?.classAverage}%
                            </div>
                            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>
                                Class Average
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Gamification Stats */}
            {/* <div className="chart-panel full-width">
                <div className="panel-header-enhanced">
                    <div>
                        <h3 className="panel-title">Achievements & Gamification</h3>
                        <p className="panel-description">Your badges, credits, and leaderboard standing</p>
                    </div>
                    <Trophy size={20} className="panel-icon" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
                   
                    <div className="health-metric">
                        <div className="health-metric-header">
                            <Trophy size={16} className="health-icon" />
                            <span className="health-label">Leaderboard Rank</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
                            <div className="health-value">#{data.leaderboardPosition === 0 ? 'N/A' : data.leaderboardPosition}</div>
                            <div style={{ fontSize: '16px', color: '#6b7280' }}>of {data.totalParticipants}</div>
                        </div>
                        <div className="progress-bar">
                            <div
                                className="progress-fill progress-primary"
                                style={{ width: `${100 - (data.leaderboardPosition / data.totalParticipants * 100)}%` }}
                            />
                        </div>
                        <div className="health-percentage">
                            Top {Math.round((data.leaderboardPosition / data.totalParticipants) * 100)}%
                        </div>
                    </div>

                    
                    <div className="health-metric">
                        <div className="achievement-icon-container credits-icon">
                            <Award size={32} className="achievement-icon" />
                        </div>
                        <div className="achievement-label">Credits</div>
                        <div className="achievement-value">{data.credits.toLocaleString()}</div>
                    </div>

                 
                    <div className="health-metric">
                        <div className="achievement-icon-container stars-icon">
                            <Star size={32} className="achievement-icon" />
                        </div>
                        <div className="achievement-label">Stars</div>
                        <div className="achievement-value">{data.stars.toLocaleString()}</div>
                    </div>

                   
                    <div className="health-metric">
                        <div className="achievement-icon-container badges-icon">
                            <Award size={32} className="achievement-icon" />
                        </div>
                        <div className="achievement-label">Badges</div>
                        <div className="achievement-value">{data.badges}</div>
                    </div>
                </div>
            </div> */}
        </div>
    );
}



export default LearnerAnalytics;