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
  Calendar,
  CalendarDays,
} from 'lucide-react';
import './AnalyticsViewNew.css';
import api from '../../../services/api';
import LoadingScreen from '../../../components/common/Loading/Loading';
import { useNavigate } from 'react-router-dom';
import CustomSelect from '../../../components/dropdown/DropDown';
import UserPop from './UserPop';



const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#06b6d4'];

const AnalyticsViewNew = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [range, setRange] = useState('7d');
  const [orgId, setOrgId] = useState('all');
  const [data, setData] = useState(null);
  const [userOrgId, setUserOrgId] = useState('');
  const { organizations } = useSelector((state) => state.organizations);
  const navigate = useNavigate()
  const [userPopUp, setUserPopUp] = useState(false);
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  });


  // Generate trend data based on current values
  const generateTrendData = (currentValue, days = 7) => {
    const trend = [];
    const baseValue = currentValue * 0.8;

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
        const dateParams = range === 'custom'
          ? {
            startDate: customDateRange.startDate,
            endDate: customDateRange.endDate
          }
          : { dateRange: range };

        const endpoint = orgId === 'all'
          ? '/api/globalAdmin/getAnalytics'
          : `/api/globalAdmin/getAnalytics/${orgId}`;
        if (range === 'custom' && (!customDateRange.startDate || !customDateRange.endDate)) {
          setIsLoading(false);
          return;
        }

        const response = await api.get(endpoint, {
          params: dateParams
        });
        setData(response.data);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [range, orgId, customDateRange.startDate, customDateRange.endDate]);
  const handleOrgClick = (Id) => {
    setUserOrgId(Id);
    setUserPopUp(true);
  }

  const ranges = ['7D', '1M', '3M']
  const formatNumber = (n) => (n != null ? n.toLocaleString('en-IN') : '--');

  // Metric Card Component
  const MetricCard = ({ icon: Icon, label, value, subtitle, trend, trendValue, color, delay = 0, onClick }) => (
    <div
      className="metric-card-enhanced"
      style={{ animationDelay: `${delay}ms`, cursor: 'pointer' }}
      onClick={onClick}
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
    return (
      <div className="analytics-container">
        {/* Header with loading skeleton */}
        <div className="page-header">
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
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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

        <div className="header-filters" style={{ display: "flex", flexDirection: "column" }}>
          <div className="filter-group-enhanced">
            <label>Organization</label>
            {/* <select value={orgId} onChange={(e) => setOrgId(e.target.value)} className="filter-select-enhanced">
              <option value="all">All Organizations</option>
              {organizations?.map((org, index) => (
                <option key={index} value={org._id}>{org.name}</option>
              ))}
            </select> */}
            <CustomSelect
              value={orgId}
              options={[
                { value: 'all', label: 'All Organizations' },
                ...(organizations?.map((org, index) => ({
                  value: org._id,
                  label: org.name,
                })) || [])
              ]}
              onChange={(value) => setOrgId(value)}
              placeholder='All organizations'
            />
          </div>
          <div className="view-toggle-wrapper">
            <button
              className={`view-toggle-button ${range === '7d' ? 'active' : ''}`}
              onClick={() => {
                setRange('7d');

              }}
            >
              <Calendar size={16} />
              <span>7 Days</span>
            </button>
            <button
              className={`view-toggle-button ${range === 'mtd' ? 'active' : ''}`}
              onClick={() => {
                setRange('mtd');

              }}
            >
              <Calendar size={16} />
              <span>Month To Date</span>
            </button>
            <button
              className={`view-toggle-button ${range === '1m' ? 'active' : ''}`}
              onClick={() => { setRange('1m') }}
            >
              <Calendar size={16} />
              <span>1 Month</span>
            </button>
            <button
              className={`view-toggle-button ${range === '90d' ? 'active' : ''}`}
              onClick={() => { setRange('3m') }}
            >
              <Calendar size={16} />
              <span>3 Months</span>
            </button>
            <button
              className={`view-toggle-button ${range === 'custom' ? 'active' : ''}`}
              onClick={() => {
                if (range !== 'custom') {
                  setRange('custom');
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
          subtitle={range === '7d' ? 'last 7 days' : range === '1m' ? 'last month' : range === '3m' ? 'last 3 months' : range === 'custom' ? 'Custom Range' : range === 'mtd' ? 'Month To Date' : 'last 6 months'}
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
          icon={Users}
          label="Total System Users"
          value={formatNumber(data?.stats?.totalUsers?.value)}
          subtitle={data?.stats?.totalUsers?.sublabel}
          color="color-neutral"
          delay={300}
        />
        {orgId == 'all' ? <MetricCard
          icon={Building2}
          label="Total Organizations"
          onClick={() => navigate('/global-admin/organizations')}
          value={formatNumber(data?.stats?.totalOrg?.value)}
          subtitle={data?.stats?.totalOrg?.sublabel}
          color="color-neutral"
          delay={300}
        />
          :
          <MetricCard
            icon={Building2}
            label="Active Users Percentage"
            value={formatNumber(data?.stats?.activepercentage?.value)}
            subtitle={`${data?.stats?.activepercentage?.sublabel} (${range === '7d' ? 'last 7 days' : range === '1m' ? 'last month' : range === '3m' ? 'last 3 months' : 'last 6 months'})`}
            color="color-neutral"
            delay={300}
          />}
      </div>
      {/* <div className="filter-group-enhanced" style={{display:"flex",margin:"20px"}}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          {ranges.map((r, index) => (
            <button key={index} onClick={() => setRange(r)} className={`${r === range ? 'btn-primary' : 'btn-secondary'}`}>
              {r}
            </button>
          ))}
        </div>
      </div> */}

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

        {/* Usage Distribution */}
        <div className="chart-panel">
          <div className="panel-header-enhanced">
            <div>
              <h3 className="panel-title">User Distribution Across Organizations</h3>
              <p className="panel-description">Active user allocation by organization</p>
            </div>
            <Users size={20} className="panel-icon" />
          </div>

          <div className="distribution-layout-vertical">


            <div className="distribution-chart">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={data?.organizations || []}
                    dataKey="users"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    label={false}
                    onClick={(entry) => handleOrgClick(entry._id)}
                    cursorStyle={{ cursor: 'pointer' }}
                  >
                    {data?.organizations?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${formatNumber(value)} users`, name]} cursorStyle={{ cursor: 'pointer' }} cursor={{ fill: 'transparent' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="distribution-bars-grid">
              {data?.organizations?.map((org, idx) => (
                <div key={idx} className="distribution-bar-item">
                  <div className="bar-header">
                    <div className="bar-label">
                      <div className="bar-color" style={{ background: COLORS[idx] }} />
                      <span>{org.name}</span>
                    </div>
                    <span className="bar-value">{formatNumber(org.users)} users</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Show empty state if no data */}
            {(!data?.organizations || data?.organizations.length === 0) && (
              <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                No organization data available
              </div>
            )}
          </div>
        </div>


      </div>
      {userPopUp && <UserPop isOpen={userPopUp} onClose={() => setUserPopUp(false)} orgId={userOrgId} loading={isLoading} range={range} />}

      {/* Charts Row 2: System Health & Top Organizations */}
      <div className="charts-grid">
        {/* System Health */}
        {/* <div className="chart-panel">
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
        </div> */}
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
            <div className="support-stat" onClick={() => navigate('/global-admin/support/admin')}>
              <div className="support-stat-label">ADMIN</div>
              <div className="support-stat-value" style={{ color: 'red' }}>{data?.ticketsData?.adminOpen}</div>
              <div className="support-stat-label">Open Tickets</div>
            </div>
            <div className="support-stat" onClick={() => navigate('/global-admin/support/admin')}>
              <div className="support-stat-label">ADMIN</div>
              <div className="support-stat-value">{data?.ticketsData?.adminResolved}</div>
              <div className="support-stat-label">Resolved Tickets</div>
            </div>
            <div className="support-stat" onClick={() => navigate('/global-admin/support/user')}>
              <div className="support-stat-label">USER</div>
              <div className="support-stat-value" style={{ color: 'red' }}>{data?.ticketsData?.userOpen}</div>
              <div className="support-stat-label">Open Tickets</div>
            </div>
            <div className="support-stat" onClick={() => navigate('/global-admin/support/user')}>
              <div className="support-stat-label">USER</div>
              <div className="support-stat-value">{data?.ticketsData?.userResolved}</div>
              <div className="support-stat-label">Resolved Tickets</div>
            </div>
            <div className="support-stat" onClick={() => navigate('/global-admin/support')}>
              <div className="support-stat-label">TOTAL</div>
              <div className="support-stat-value" style={{ color: 'red' }}>{data?.ticketsData?.userOpen + data?.ticketsData?.adminOpen}</div>
              <div className="support-stat-label">Open Tickets</div>
            </div>
            <div className="support-stat" onClick={() => navigate('/global-admin/support')}>
              <div className="support-stat-label">TOTAL</div>
              <div className="support-stat-value">{data?.ticketsData?.userResolved + data?.ticketsData?.adminResolved}</div>
              <div className="support-stat-label">Resolved Tickets</div>
            </div>


          </div>
        </div>

        {/* Top Organizations */}
        <div className="chart-panel">
          <div className="panel-header-enhanced">
            <div>
              <h3 className="panel-title">Organizational Performance</h3>
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
                    <th>active users(%)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.organizations.map((org, idx) => (
                    <tr key={org.id} onClick={() => navigate(`/global-admin/organizations/${org._id}`)} style={{ cursor: 'pointer' }}>
                      <td>
                        <div className="rank-badge" style={{ background: COLORS[idx] }} >
                          #{idx + 1}
                        </div>
                      </td>
                      <td className="org-name">{org.name}</td>
                      <td>{formatNumber(org.users)}</td>
                      <td>{formatNumber(org.activeUsersPercentage)}</td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsViewNew;