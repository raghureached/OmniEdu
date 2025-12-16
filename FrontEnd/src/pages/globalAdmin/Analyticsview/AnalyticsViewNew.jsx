import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";

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
  Area,
  AreaChart,
} from 'recharts';
import {
  Users,
  Activity,
  Database,
  LifeBuoy,
  Building2,
  TrendingUp,
  Clock,
  ArrowUp,
  ArrowDown,
  Zap,
  Server,
  HardDrive,
} from 'lucide-react';
import './AnalyticsViewNew.css';
import api from '../../../services/api';
import LoadingScreen from '../../../components/common/Loading/Loading';



const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#06b6d4'];

const AnalyticsViewNew = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [range, setRange] = useState('30d');
  const [orgId, setOrgId] = useState('all');
  const [data, setData] = useState(null);
  const { organizations } = useSelector((state) => state.organizations);
  

  // Generate trend data based on current values
  const generateTrendData = (currentValue, days = 7) => {
    const trend = [];
    const baseValue = currentValue * 0.8; // Start from 80% of current value

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const variation = (Math.random() - 0.5) * 0.3; // ±15% variation
      const value = Math.round(baseValue + (currentValue - baseValue) * (1 - i / (days - 1)) + (baseValue * variation));

      trend.push({
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: Math.max(0, value)
      });
    }

    return trend;
  };

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setIsLoading(true);
        const endpoint = orgId === 'all' 
          ? '/api/globalAdmin/getAnalytics'
          : `/api/globalAdmin/getAnalytics/${orgId}`;
        const response = await api.get(endpoint);
        setData(response.data);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [range, orgId]);


  const formatNumber = (n) => (n != null ? n.toLocaleString('en-IN') : '--');

  // Metric Card Component
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
            {trend === 'up' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
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

  if (isLoading) {
    return <LoadingScreen text="Loading Analytics" />;
  }

  return (
    <div className="analytics-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-badge">
            <Zap size={14} />
            <span>Live Dashboard</span>
          </div>
          <h1 className="page-title">Platform Analytics</h1>
          <p className="page-subtitle">
            Real-time insights into system health, user engagement, and organizational performance
          </p>
        </div>

        <div className="header-filters">
          <div className="filter-group-enhanced">
            <label>Organization</label>
            <select value={orgId} onChange={(e) => setOrgId(e.target.value)} className="filter-select-enhanced">
              <option value="all">All Organizations</option>
              {organizations?.map((org, index) => (
                <option key={index} value={org._id}>{org.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="metrics-grid-enhanced">
        <MetricCard
          icon={Activity}
          label="Daily Active Users"
          value={formatNumber(data?.stats?.dau?.value)}
          subtitle={data?.stats?.dau?.sublabel}
          trend={data?.stats?.dau?.change >= 0 ? 'up' : 'down'}
          trendValue={`${Math.abs(data?.stats?.dau?.change)}`}
          color="color-primary"
          delay={0}
        />
        <MetricCard
          icon={Users}
          label="Monthly Active Users"
          value={formatNumber(data?.stats?.mau?.value)}
          subtitle={data?.stats?.mau?.sublabel}
          trend={data?.stats?.mau?.change >= 0 ? 'up' : 'down'}
          trendValue={`${Math.abs(data?.stats?.mau?.change)}`}
          color="color-secondary"
          delay={100}
        />
        <MetricCard
          icon={TrendingUp}
          label="Platform Stickiness"
          value={`${data?.stats?.stickiness?.value}%`}
          subtitle={data?.stats?.stickiness?.sublabel}
          color="color-tertiary"
          delay={200}
        />
        <MetricCard
          icon={Building2}
          label="Total System Users"
          value={formatNumber(data?.stats?.totalUsers?.value)}
          subtitle={data?.stats?.totalUsers?.sublabel}
          trend={data?.stats?.totalUsers?.change >= 0 ? 'up' : 'down'}
          trendValue={`${Math.abs(data?.stats?.totalUsers?.change)}`}
          color="color-neutral"
          delay={300}
        />
      </div>

      {/* Charts Row 1: DAU Trend & Support Tickets */}
      <div className="charts-grid">
        {/* DAU Trend */}
        <div className="chart-panel">
          <div className="panel-header-enhanced">
            <div>
              <h3 className="panel-title">Daily Active Users Trend</h3>
              <p className="panel-description">7-day engagement pattern</p>
            </div>
            <Clock size={20} className="panel-icon" />
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={generateTrendData(data?.stats?.dau?.value || 0)}>
                <defs>
                  <linearGradient id="colorDau" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="label" stroke="black" style={{ fontSize: 12 }} />
                <YAxis stroke="black" style={{ fontSize: 12 }} />
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
                  dataKey="value"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fill="url(#colorDau)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Support Tickets */}
        <div className="chart-panel">
          <div className="panel-header-enhanced">
            <div>
              <h3 className="panel-title">Support Ticket Volume</h3>
              <p className="panel-description">Issue tracking and resolution</p>
            </div>
            <LifeBuoy size={20} className="panel-icon" />
          </div>

          <div className="support-stats">
            <div className="support-stat">
              <div className="support-stat-label">ADMIN</div>
              <div className="support-stat-value">{data?.ticketsData?.adminOpen}</div>
              <div className="support-stat-label">Open Tickets</div>
            </div>
            <div className="support-stat">
              <div className="support-stat-label">ADMIN</div>
              <div className="support-stat-value">{data?.ticketsData?.adminResolved}</div>
              <div className="support-stat-label">Resolved Tickets</div>
            </div>
            <div className="support-stat">
              <div className="support-stat-label">USER</div>
              <div className="support-stat-value">{data?.ticketsData?.userOpen}</div>
              <div className="support-stat-label">Open Tickets</div>
            </div>
            <div className="support-stat">
              <div className="support-stat-label">USER</div>
              <div className="support-stat-value">{data?.ticketsData?.userResolved}</div>
              <div className="support-stat-label">Resolved Tickets</div>
            </div>
          </div>

          {/* <div className="chart-container">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={generateTrendData(15, 7)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="label" stroke="black" style={{ fontSize: 12 }} />
                <YAxis stroke="black" style={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ fill: '#ef4444', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ fill: '#ef4444', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
              
            </ResponsiveContainer>
          </div> */}
        </div>
      </div>

      {/* Charts Row 2: System Health & Top Organizations */}
      <div className="charts-grid">
        {/* System Health */}
        <div className="chart-panel">
          <div className="panel-header-enhanced">
            <div>
              <h3 className="panel-title">System Health Monitoring</h3>
              <p className="panel-description">Infrastructure metrics and capacity</p>
            </div>
            <Database size={20} className="panel-icon" />
          </div>

          <div className="health-metrics">
            <div className="health-metric">
              <div className="health-metric-header">
                <HardDrive size={16} className="health-icon" />
                <span className="health-label">Storage</span>
              </div>
              <div className="health-value">
                {formatNumber(data?.systemHealth?.bandwidthUsedGB)} / {formatNumber(data?.systemHealth?.totalBandwidthGB)} GB
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill progress-primary"
                  style={{ width: `${data?.systemHealth?.totalBandwidthGB > 0 ? (data?.systemHealth?.bandwidthUsedGB / data?.systemHealth?.totalBandwidthGB) * 100 : 0}%` }}
                />
              </div>
              <div className="health-percentage">
                {data?.systemHealth?.totalBandwidthGB > 0 ? Math.round((data?.systemHealth?.bandwidthUsedGB / data?.systemHealth?.totalBandwidthGB) * 100) : 0}% used
              </div>
            </div>

            <div className="health-metric">
              <div className="health-metric-header">
                <Activity size={16} className="health-icon" />
                <span className="health-label">Bandwidth</span>
              </div>
              <div className="health-value">{formatNumber(data?.systemHealth?.bandwidthUsedGB)} GB</div>
              <div className="progress-bar">
                <div
                  className="progress-fill progress-success"
                  style={{ width: `${Math.min(data?.systemHealth?.bandwidthUsedGB || 0, 100)}%` }}
                />
              </div>
              <div className="health-percentage">This month</div>
            </div>

            <div className="health-metric">
              <div className="health-metric-header">
                <Server size={16} className="health-icon" />
                <span className="health-label">CPU Load</span>
              </div>
              <div className="health-value">{data?.systemHealth?.cpuLoad}%</div>
              <div className="progress-bar">
                <div
                  className={`progress-fill ${data?.systemHealth?.cpuLoad > 70 ? 'progress-warning' : 'progress-success'}`}
                  style={{ width: `${data?.systemHealth?.cpuLoad || 0}%` }}
                />
              </div>
              <div className="health-percentage">Optimal range</div>
            </div>

            <div className="health-metric">
              <div className="health-metric-header">
                <Zap size={16} className="health-icon" />
                <span className="health-label">Uptime</span>
              </div>
              <div className="health-value">{data?.systemHealth?.uptime}%</div>
              <div className="progress-bar">
                <div className="progress-fill progress-success" style={{ width: `${data?.systemHealth?.uptime || 0}%` }} />
              </div>
              <div className="health-percentage">Last 30 days</div>
            </div>
          </div>
        </div>

        {/* Top Organizations */}
        <div className="chart-panel">
          <div className="panel-header-enhanced">
            <div>
              <h3 className="panel-title">Top Performing Organizations</h3>
              <p className="panel-description">Engagement and completion leaders</p>
            </div>
            <Building2 size={20} className="panel-icon" />
          </div>

          <div className="top-orgs-content">
            <div className="orgs-table-wrapper">
              <table className="orgs-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Organization</th>
                    <th>Users</th>
                    <th>Total Hours</th>

                  </tr>
                </thead>
                <tbody>
                  {data.organizations.map((org, idx) => (
                    <tr key={org.id}>
                      <td>
                        <div className="rank-badge" style={{ background: COLORS[idx] }}>
                          #{idx + 1}
                        </div>
                      </td>
                      <td className="org-name">{org.name}</td>
                      <td>{formatNumber(org.users)}</td>
                      <td>{formatNumber(org.totalHours)}</td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Distribution */}
      <div className="chart-panel full-width">
        <div className="panel-header-enhanced">
          <div>
            <h3 className="panel-title">User Distribution Across Organizations</h3>
            <p className="panel-description">Active user allocation by organization</p>
          </div>
          <Users size={20} className="panel-icon" />
        </div>

        <div className="distribution-layout">
          <div className="distribution-chart">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data?.organizations || []}
                  dataKey="totalHours"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  label={({ name, totalHours, percent }) => `${name}: ${totalHours}h (${(percent * 100).toFixed(0)}%)`}
                  labelLine={true}
                >
                  {data?.organizations?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} hours`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="distribution-bars">
            {data?.organizations?.map((org, idx) => (
              <div key={idx} className="distribution-bar-item">
                <div className="bar-header">
                  <div className="bar-label">
                    <div className="bar-color" style={{ background: COLORS[idx] }} />
                    <span>{org.name}</span>
                  </div>
                  <span className="bar-value">{formatNumber(org.totalHours)}h</span>
                </div>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${data?.organizations?.[0]?.totalHours > 0 ? (org.totalHours / data?.organizations[0].totalHours) * 100 : 0}%`,
                      background: COLORS[idx]
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsViewNew;