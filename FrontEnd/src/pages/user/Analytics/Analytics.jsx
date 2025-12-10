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
    LineChart,
    Line,
    ResponsiveContainer
} from 'recharts';
import {
    BookOpen,
    Clock,
    Target,
    Trophy,
    Calendar,
    TrendingUp,
    AlertCircle,
    Award,
    Star,
    CheckCircle,
    Activity,
    Zap,
} from 'lucide-react';
import './Analytics.css';
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

const LearnerAnalytics = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('week');
    const [data, setData] = useState({
    });

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await api.get('/api/user/analytics');
                setData(response.data.data);
                console.log(response.data.data)
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching analytics:', error);
                setIsLoading(false);
            }
        };
        fetchAnalytics();
    }, [timeRange]);
    const scores = (Array.isArray(data?.assessmentScores?.assessmentScores) ? data.assessmentScores?.assessmentScores : []).map(item => ({
        ...item,
        shortName:
            item.name.length > 25 ? item.name.substring(0, 25) + "..." : item.name,
    }));
    // console.log(scores)


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
            <div className="loading-container">
                <div className="loading-spinner-enhanced" />
                <div className="loading-text">Loading Your Analytics...</div>
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

                {/* <div className="header-filters">
          <div className="filter-group-enhanced">
            <label>Time Period</label>
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)} 
              className="filter-select-enhanced"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div> */}
            </div>

            {/* Key Metrics Grid */}
            <div className="metrics-grid-enhanced">
                <MetricCard
                    icon={Target}
                    label="Completion Rate"
                    value={`${Number(data.completionRate) || 0}%`}
                    subtitle={`${Number(data.completedCourses) || 0} of ${Number(data.totalCourses) || 0} courses`}
                    trend={12}
                    color="color-primary"
                    delay={0}
                />
                <MetricCard
                    icon={Clock}
                    label="Time Spent Learning"
                    value={`${Number(data.timeSpent) || 0}h`}
                    subtitle="This month"
                    trend={8}
                    color="color-secondary"
                    delay={100}
                />
                <MetricCard
                    icon={Award}
                    label="Average Score"
                    value={`${Number(data.avgScore) || 0}%`}
                    subtitle={`Class avg: ${Number(data.classAverage) || 0}%`}
                    trend={5}
                    color="color-tertiary"
                    delay={200}
                />
                <MetricCard
                    icon={Trophy}
                    label="Leaderboard Rank"
                    value={`${data.leaderboardPosition === 0 ? "N/A" : data.leaderboardPosition}`}
                    subtitle={`out of ${Number(data.totalParticipants) || 0} learners`}
                    color="color-neutral"
                    delay={300}
                />
            </div>

            {/* Charts Row 1: Completion Donut & Deadlines */}
            <div className="charts-grid">
                {/* Completion Rate Donut */}
                <div className="chart-panel">
                    <div className="panel-header-enhanced">
                        <div>
                            <h3 className="panel-title">Course Completion Status</h3>
                            <p className="panel-description">Your learning progress overview</p>
                        </div>
                        <BookOpen size={20} className="panel-icon" />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', marginTop: '20px' }}>
                        <ResponsiveContainer width="50%" height={280}>
                            <PieChart>
                                <Pie
                                    data={data.courseCompletion}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.courseCompletion.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="health-metric" style={{ background: 'transparent', padding: '16px 16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                    <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: CHART_COLORS[0] }} />
                                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>Completed</span>
                                </div>
                                <div style={{ fontSize: '28px', fontWeight: 700, color: '#111827' }}>
                                    {Number(data.completedCourses) || 0} courses
                                </div>
                            </div>

                            <div className="health-metric" style={{ background: 'transparent', padding: '16px 16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                    <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: CHART_COLORS[1] }} />
                                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>In Progress</span>
                                </div>
                                <div style={{ fontSize: '28px', fontWeight: 700, color: '#111827' }}>
                                    {data.inProgressCourses} courses
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
                        {data.overdueAssignments.length > 0 && (
                            <>
                                {data.overdueAssignments.length > 0 ? data.overdueAssignments.map((item, idx) => (
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
                        )}

                        {data.upcomingDeadlines.length > 0 ? data.upcomingDeadlines.map((item, idx) => (
                            <div key={`upcoming-${idx}`} style={{
                                padding: '16px',
                                background: '#f9fafb',
                                borderRadius: '12px',
                                borderLeft: `4px solid ${item.daysLeft <= 5 ? COLORS.warning : COLORS.accent}`
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
                            <h3 className="panel-title">Weekly Learning Activity</h3>
                            <p className="panel-description">Hours spent and modules completed</p>
                        </div>
                        <Activity size={20} className="panel-icon" />
                    </div>

                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={data.weeklyProgress}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                <XAxis dataKey="day" stroke="#9ca3af" style={{ fontSize: 12 }} />
                                <YAxis stroke="#9ca3af" style={{ fontSize: 12 }} />
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
                            {data.weeklyProgress.reduce((acc, day) => acc + day.hours, 0).toFixed(1)}h
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>
                            Total this week
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
                                    angle={-30}
                                    textAnchor="end"
                                    height={100}
                                    interval={0}
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
                                {data.avgScore}%
                            </div>
                            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>
                                Your Average
                            </div>
                        </div>
                        <div style={{ flex: 1, textAlign: 'center', padding: '12px', background: '#f9fafb', borderRadius: '12px' }}>
                            <div style={{ fontSize: '24px', fontWeight: 700, color: '#6b7280' }}>
                                {data?.assessmentScores?.classAverage}%
                            </div>
                            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>
                                Class Average
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Gamification Stats */}
            <div className="chart-panel full-width">
                <div className="panel-header-enhanced">
                    <div>
                        <h3 className="panel-title">Achievements & Gamification</h3>
                        <p className="panel-description">Your badges, credits, and leaderboard standing</p>
                    </div>
                    <Trophy size={20} className="panel-icon" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
                    {/* Leaderboard Position */}
                    <div className="health-metric">
                        <div className="health-metric-header">
                            <Trophy size={16} className="health-icon" />
                            <span className="health-label">Leaderboard Rank</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
                            <div className="health-value">#{data.leaderboardPosition}</div>
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

                    {/* Credits Earned */}
                    <div className="health-metric">
                        <div className="health-metric-header">
                            <Star size={16} className="health-icon" />
                            <span className="health-label">Total Credits</span>
                        </div>
                        <div className="health-value">{data.credits.toLocaleString()}</div>

                    </div>
                    <div className="health-metric">
                        <div className="health-metric-header">
                            <Star size={16} className="health-icon" />
                            <span className="health-label">Total Stars</span>
                        </div>
                        <div className="health-value">{data.stars.toLocaleString()}</div>

                    </div>

                    {/* Badges Collected */}
                    <div className="health-metric">
                        <div className="health-metric-header">
                            <Award size={16} className="health-icon" />
                            <span className="health-label">Badges Earned</span>
                        </div>
                        <div className="health-value">{data.badges}</div>

                    </div>
                </div>
            </div>
        </div>
    );
}



export default LearnerAnalytics;