const User = require('../../models/users_model');
const UserProfile = require('../../models/userProfiles_model');
const Organization = require('../../models/organization_model');
const Leaderboard = require('../../models/leaderboard.model');
const adminTicket = require('../../models/adminTicket');
const userTickets = require('../../models/userTickets');

// Helper function to get date range filter
const getDateRangeFilter = (dateRange) => {
  if (dateRange === 'all') return null;
  
  const now = new Date();
  const startDate = new Date();
  
  switch (dateRange) {
    case '7D':
      startDate.setDate(now.getDate() - 7);
      break;
    case '1M':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case '3M':
      startDate.setMonth(now.getMonth() - 3);
      break;
    case '6M':
      startDate.setMonth(now.getMonth() - 6);
      break;
    default:
      startDate.setDate(now.getDate() - 7);
  }
  
  return { $gte: startDate, $lte: now };
};

const getAnalyticsData = async (req, res) => {
  try {
    const { dateRange = '30d' } = req.query;
    const dateFilter = getDateRangeFilter(dateRange);
    
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Debug: Check total users first
    const totalUsers = await User.countDocuments();

    // Check users with last_login data
    const usersWithLastLogin = await User.countDocuments({ last_login: { $exists: true, $ne: null } });

    // Get Daily Active Users (DAU) - users who logged in last 24 hours
    const dauQuery = { last_login: { $gte: last24Hours } };
    if (dateFilter && dateRange === '7D') {
      // For 7D range, show DAU for each day in the range
      dauQuery.last_login = { $gte: dateFilter.$gte };
    }
    const dau = await User.countDocuments(dauQuery);

    // Get Monthly Active Users (MAU) - users who logged in last 30 days
    const mauQuery = { last_login: { $gte: last30Days } };
    if (dateFilter && (dateRange === '1M' || dateRange === '3M' || dateRange === '6M')) {
      mauQuery.last_login = { $gte: dateFilter.$gte };
    }
    const mau = await User.countDocuments(mauQuery);
    
    // Calculate stickiness score (DAU/MAU ratio)
    const stickinessScore = mau > 0 ? ((dau / mau) * 100).toFixed(1) : 0;

    // Get previous period data for comparison
    const previous24Hours = new Date(last24Hours.getTime() - 24 * 60 * 60 * 1000);
    const previous30Days = new Date(last30Days.getTime() - 30 * 24 * 60 * 60 * 1000);

    const previousDAU = await User.countDocuments({
      last_login: { $gte: previous24Hours, $lt: last24Hours }
    });

    const previousMAU = await User.countDocuments({
      last_login: { $gte: previous30Days, $lt: last30Days }
    });

    // Calculate percentage changes
    const dauChange = previousDAU > 0 ? (((dau - previousDAU) / previousDAU) * 100).toFixed(1) : 0;
    const mauChange = previousMAU > 0 ? (((mau - previousMAU) / previousMAU) * 100).toFixed(1) : 0;
    const totalChange = previousDAU > 0 ? (((totalUsers - previousDAU) / previousDAU) * 100).toFixed(1) : 0;

    // Get organization data from leaderboard - aggregate total hours per organization
    // First get all organizations
    const allOrganizations = await Organization.find({}, 'name').sort({ name: 1 });
    const totalorgs = allOrganizations.length;

    // Get leaderboard data aggregated by organization with date filtering
    const orgLeaderboardQuery = {};
    if (dateFilter) {
      orgLeaderboardQuery.updatedAt = dateFilter;
    }
    
    const orgLeaderboardData = await Leaderboard.aggregate([
      {
        $match: orgLeaderboardQuery
      },
      {
        $group: {
          _id: '$organization_id',
          totalHours: { $sum: '$noOfhoursCompleted' },
          userCount: { $addToSet: '$user_id' }
        }
      },
      {
        $addFields: {
          userCount: { $size: '$userCount' }
        }
      }
    ]);

    // Create a map of organization_id to leaderboard data
    const leaderboardMap = {};
    orgLeaderboardData.forEach(data => {
      data.totalHours = data.totalHours / 60;
      leaderboardMap[data._id.toString()] = data;
    });

    // Get organization details and combine with leaderboard data
    const orgData = await Promise.all(
      allOrganizations.map(async (organization) => {
        const orgId = organization._id.toString();
        const leaderboardInfo = leaderboardMap[orgId];

        const totalHours = leaderboardInfo ? leaderboardInfo.totalHours : 0;
        
        // Calculate active users based on last_login instead of leaderboard
        const activeUserQuery = { 
          organization_id: organization._id,
          last_login: { $exists: true, $ne: null }
        };
        
        // Apply date range filter for active users
        if (dateFilter) {
          activeUserQuery.last_login.$gte = dateFilter.$gte;
        } else {
          // Default to last 30 days if no date range specified
          activeUserQuery.last_login.$gte = last30Days;
        }
        
        const activeUsersCount = await User.countDocuments(activeUserQuery);
        const totalOrgUsers = await User.countDocuments({ organization_id: organization._id });
        
        // Calculate active users percentage
        const activeUsersPercentage = totalOrgUsers > 0 ? 
          ((activeUsersCount / totalOrgUsers) * 100).toFixed(1) : 0;

        // Get previous period data for comparison (last 30 days before current period)
        const previousPeriodStart = new Date(last30Days.getTime() - 30 * 24 * 60 * 60 * 1000);
        const previousActiveUsersCount = await User.countDocuments({
          organization_id: organization._id,
          last_login: { $gte: previousPeriodStart, $lt: last30Days }
        });
        
        // Get previous total users for percentage calculation
        const previousTotalUsers = await User.countDocuments({
          organization_id: organization._id,
          createdAt: { $lt: last30Days }
        });
        
        const previousPercentage = previousTotalUsers > 0 ? 
          ((previousActiveUsersCount / previousTotalUsers) * 100).toFixed(1) : 0;
        
        const change = previousPercentage > 0 ?
          (((activeUsersPercentage - previousPercentage) / previousPercentage) * 100).toFixed(0) : 0;

        return {
          name: organization.name,
          _id: organization._id,
          users: activeUsersCount, // Use active users count instead of leaderboard userCount
          totalHours: totalHours,
          activeUsersPercentage: parseFloat(activeUsersPercentage),
          change: change >= 0 ? `↑ ${Math.abs(change)}%` : `↓ ${Math.abs(change)}%`,
          changeType: change >= 0 ? 'badge-up' : 'badge-down'
        };
      })
    );

    // Sort organizations by total hours (descending) and take top 5
    const validOrgData = orgData
      .sort((a, b) => b.totalHours - a.totalHours)
      .slice(0, 5);
    const ticketsData = {};
    const adminTickets = await adminTicket.find();
    const userTicketss = await userTickets.find();
    ticketsData.adminOpen = adminTickets.filter((t) => t.status === "Open").length;
    ticketsData.adminResolved = adminTickets.filter((t) => t.status === "Resolved").length
    ticketsData.userOpen = userTicketss.filter((t) => t.status === "Open").length;
    ticketsData.userResolved = userTicketss.filter((t) => t.status === "Resolved").length;

    // System Health Metrics
    const systemHealth = await getSystemHealthMetrics(dateRange);

    res.json({
      stats: {
        dau: {
          value: dau,
          change: dauChange,
          label: 'Daily Active Users (DAU)',
          sublabel: 'Last 24 hours'
        },
        mau: {
          value: mau,
          change: mauChange,
          label: 'Monthly Active Users (MAU)',
          sublabel: 'Last 30 days'
        },
        stickiness: {
          value: stickinessScore,
          label: 'Stickiness Score',
          sublabel: 'DAU/MAU Ratio'
        },
        totalUsers: {
          value: totalUsers,
          change: totalChange,
          label: 'Total System Users',
          sublabel: 'All registered accounts'
        },
        totalOrg:{
          value:totalorgs,
          label:'Total Organizations',
          sublabel:'All registered organizations'
        }
      },
      organizations: validOrgData, // Top 5 organizations by total hours
    
      systemHealth: systemHealth,
      ticketsData,
      timestamp: now
    });

  } catch (error) {
    console.error('Error fetching analytics data:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
};

// Helper function to get system health metrics
const getSystemHealthMetrics = async (dateRange = '30d') => {
  try {
    const dateFilter = getDateRangeFilter(dateRange);
    
    // Get total bandwidth usage from leaderboard (sum of all noOfhoursCompleted)
    const totalBandwidthQuery = {};
    if (dateFilter) {
      totalBandwidthQuery.updatedAt = dateFilter;
    }
    
    const totalBandwidthResult = await Leaderboard.aggregate([
      {
        $match: totalBandwidthQuery
      },
      {
        $group: {
          _id: null,
          totalHours: { $sum: '$noOfhoursCompleted' }
        }
      }
    ]);

    const totalBandwidthGB = totalBandwidthResult.length > 0 ?
      Math.round((totalBandwidthResult[0].totalHours * 0.001) * 100) / 100 : 0; // Convert to GB

    // Get CPU load (simulated - in production you'd get this from system monitoring)
    const cpuLoad = Math.round(Math.random() * 30 + 20); // 20-50% typical range

    // Get uptime (simulated - in production you'd get this from system monitoring)
    const uptime = 99.8; // Typical high uptime

    // Get bandwidth for current month or date range
    let bandwidthQuery = {};
    if (dateFilter) {
      bandwidthQuery = { updatedAt: dateFilter };
    } else {
      // Default to current month
      const currentMonthStart = new Date();
      currentMonthStart.setDate(1);
      currentMonthStart.setHours(0, 0, 0, 0);
      bandwidthQuery = { updatedAt: { $gte: currentMonthStart } };
    }

    const bandwidthResult = await Leaderboard.aggregate([
      {
        $match: bandwidthQuery
      },
      {
        $group: {
          _id: null,
          periodHours: { $sum: '$noOfhoursCompleted' }
        }
      }
    ]);

    const periodBandwidthGB = bandwidthResult.length > 0 ?
      Math.round((bandwidthResult[0].periodHours * 0.001) * 100) / 100 : 0;

    return {
      bandwidthUsedGB: periodBandwidthGB,
      totalBandwidthGB: totalBandwidthGB,
      cpuLoad: cpuLoad,
      uptime: uptime,
      bandwidthTrend: generateBandwidthTrend(dateRange)
    };
  } catch (error) {
    console.error('Error getting system health metrics:', error);
    return {
      bandwidthUsedGB: 0,
      totalBandwidthGB: 0,
      cpuLoad: 0,
      uptime: 0,
      bandwidthTrend: []
    };
  }
};

// Helper function to generate bandwidth trend data
const generateBandwidthTrend = (dateRange = '30d') => {
  const trend = [];
  const now = new Date();
  let days = 30;

  switch (dateRange) {
    case '7D':
      days = 7;
      break;
    case '1M':
      days = 30;
      break;
    case '3M':
      days = 90;
      break;
    case '6M':
      days = 180;
      break;
    default:
      days = 30;
  }

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Show fewer labels for longer periods
    let showLabel = true;
    if (days > 30 && i % 7 !== 0) showLabel = false; // Weekly labels for >30 days
    if (days > 90 && i % 14 !== 0) showLabel = false; // Bi-weekly labels for >90 days
    
    trend.push({
      label: showLabel ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '',
      value: Math.round(Math.random() * 50 + 10) // 10-60 GB per day
    });
  }

  return trend;
};

const getOrganizationAnalytics = async (req, res) => {
  try {
    const { organizationId } = req.params;
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Verify organization exists
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Get total users for this organization
    const last7DaysUsers = await User.countDocuments({ organization_id: organizationId, last_login: { $gte: last7Days } });
    const totalUsers = await User.countDocuments({ organization_id: organizationId });
    const percent = last7DaysUsers / totalUsers * 100;

    // Get Daily Active Users (DAU) - users who logged in last 24 hours
    const dau = await User.countDocuments({
      organization_id: organizationId,
      last_login: { $gte: last24Hours }
    });

    // Get Monthly Active Users (MAU) - users who logged in last 30 days
    const mau = await User.countDocuments({
      organization_id: organizationId,
      last_login: { $gte: last30Days }
    });

    // Calculate stickiness score (DAU/MAU ratio)
    const stickinessScore = mau > 0 ? ((dau / mau) * 100).toFixed(1) : 0;

    // Get previous period data for comparison
    const previous24Hours = new Date(last24Hours.getTime() - 24 * 60 * 60 * 1000);
    const previous30Days = new Date(last30Days.getTime() - 30 * 24 * 60 * 60 * 1000);

    const previousDAU = await User.countDocuments({
      organization_id: organizationId,
      last_login: { $gte: previous24Hours, $lt: last24Hours }
    });

    const previousMAU = await User.countDocuments({
      organization_id: organizationId,
      last_login: { $gte: previous30Days, $lt: last30Days }
    });

    // Calculate percentage changes
    const dauChange = previousDAU > 0 ? (((dau - previousDAU) / previousDAU) * 100).toFixed(1) : 0;
    const mauChange = previousMAU > 0 ? (((mau - previousMAU) / previousMAU) * 100).toFixed(1) : 0;
    const totalChange = previousDAU > 0 ? (((totalUsers - previousDAU) / previousDAU) * 100).toFixed(1) : 0;

    // Get organization-specific leaderboard data
    const orgLeaderboardData = await Leaderboard.aggregate([
      {
        $match: { organization_id: organization._id }
      },
      {
        $group: {
          _id: '$organization_id',
          totalHours: { $sum: '$noOfhoursCompleted' },
          userCount: { $addToSet: '$user_id' }
        }
      },
      {
        $addFields: {
          userCount: { $size: '$userCount' }
        }
      }
    ]);

    const totalHours = orgLeaderboardData.length > 0 ? orgLeaderboardData[0].totalHours / 60 : 0; // Convert to hours
    const activeUsers = orgLeaderboardData.length > 0 ? orgLeaderboardData[0].userCount : 0;

    const activeUsersPercentage = totalUsers > 0 ? 
      ((activeUsers / totalUsers) * 100).toFixed(1) : 0;

    // Get previous period data for comparison (last 30 days before current period)
    const previousPeriodStart = new Date(last30Days.getTime() - 30 * 24 * 60 * 60 * 1000);
    const previousPeriodUsers = await Leaderboard.aggregate([
      {
        $match: {
          organization_id: organization._id,
          updatedAt: { $gte: previousPeriodStart, $lt: last30Days }
        }
      },
      {
        $group: {
          _id: '$organization_id',
          uniqueUsers: { $addToSet: '$user_id' }
        }
      }
    ]);

    const previousActiveUsers = previousPeriodUsers.length > 0 ? 
      previousPeriodUsers[0].uniqueUsers.length : 0;
    
    // Get previous total users for percentage calculation
    const previousTotalUsers = await User.countDocuments({
      organization_id: organization._id,
      createdAt: { $lt: last30Days }
    });
    
    const previousPercentage = previousTotalUsers > 0 ? 
      ((previousActiveUsers / previousTotalUsers) * 100).toFixed(1) : 0;
    
    const percentageChange = previousPercentage > 0 ?
      (((activeUsersPercentage - previousPercentage) / previousPercentage) * 100).toFixed(0) : 0;

    // Create organization data in same format as global analytics
    const orgData = [{
      name: organization.name,
      users: activeUsers,
      totalHours: totalHours,
      activeUsersPercentage: parseFloat(activeUsersPercentage),
      change: percentageChange >= 0 ? `↑ ${Math.abs(percentageChange)}%` : `↓ ${Math.abs(percentageChange)}%`,
      changeType: percentageChange >= 0 ? 'badge-up' : 'badge-down'
    }];

    // Get organization-specific ticket data
    const adminTickets = await adminTicket.find({ organization_id: organizationId });
    const userTicketss = await userTickets.find({ organization_id: organizationId });
    
    const ticketsData = {
      adminOpen: adminTickets.filter((t) => t.status === "Open").length,
      adminResolved: adminTickets.filter((t) => t.status === "Resolved").length,
      userOpen: userTicketss.filter((t) => t.status === "Open").length,
      userResolved: userTicketss.filter((t) => t.status === "Resolved").length
    };

    // Get organization-specific system health metrics
    const systemHealth = await getSystemHealthMetrics();

    res.json({
      stats: {
        dau: {
          value: dau,
          change: dauChange,
          label: 'Daily Active Users (DAU)',
          sublabel: 'Last 24 hours'
        },
        mau: {
          value: mau,
          change: mauChange,
          label: 'Monthly Active Users (MAU)',
          sublabel: 'Last 30 days'
        },
        stickiness: {
          value: stickinessScore,
          label: 'Stickiness Score',
          sublabel: 'DAU/MAU Ratio'
        },
        totalUsers: {
          value: totalUsers,
          change: totalChange,
          label: 'Total Organization Users',
          sublabel: 'All registered accounts in organization'
        },
        activepercentage:{
          value: percent.toFixed(2),
          label: 'Total Active Users',
          sublabel: 'All registered active accounts in organization'
        }
      },
      organizations: orgData,

      systemHealth: systemHealth,
      ticketsData,
      timestamp: now
    });

  } catch (error) {
    console.error('Error fetching organization analytics data:', error);
    res.status(500).json({ error: 'Failed to fetch organization analytics data' });
  }
};

// Helper function to get organization-specific system health metric

module.exports = {
  getAnalyticsData,
  getOrganizationAnalytics
};
