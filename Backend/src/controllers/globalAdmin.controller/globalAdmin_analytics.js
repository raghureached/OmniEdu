const User = require('../../models/users_model');
const UserProfile = require('../../models/userProfiles_model');
const Organization = require('../../models/organization_model');
const Leaderboard = require('../../models/leaderboard.model');
const adminTicket = require('../../models/adminTicket');
const userTickets = require('../../models/userTickets');

const getAnalyticsData = async (req, res) => {
  try {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Debug: Check total users first
    const totalUsers = await User.countDocuments();

    // Check users with last_login data
    const usersWithLastLogin = await User.countDocuments({ last_login: { $exists: true, $ne: null } });

    // Get Daily Active Users (DAU) - users who logged in last 24 hours
    const dau = await User.countDocuments({
      last_login: { $gte: last24Hours }
    });

    // Get Monthly Active Users (MAU) - users who logged in last 30 days
    const mau = await User.countDocuments({
      last_login: { $gte: last30Days }
    })
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

    // Get leaderboard data aggregated by organization
    const orgLeaderboardData = await Leaderboard.aggregate([
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
        const userCount = leaderboardInfo ? leaderboardInfo.userCount : 0;

        // Get previous period data for comparison (last 30 days before current period)
        const previousPeriodStart = new Date(last30Days.getTime() - 30 * 24 * 60 * 60 * 1000);
        const previousPeriodHours = await Leaderboard.aggregate([
          {
            $match: {
              organization_id: organization._id,
              updatedAt: { $gte: previousPeriodStart, $lt: last30Days }
            }
          },
          {
            $group: {
              _id: '$organization_id',
              totalHours: { $sum: '$noOfhoursCompleted' }
            }
          }
        ]);

        const previousHours = previousPeriodHours.length > 0 ? previousPeriodHours[0].totalHours : 0;
        const change = previousHours > 0 ?
          (((totalHours - previousHours) / previousHours) * 100).toFixed(0) : 0;

        return {
          name: organization.name,
          users: userCount,
          totalHours: totalHours,
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
          label: 'Total System Users',
          sublabel: 'All registered accounts'
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
const getSystemHealthMetrics = async () => {
  try {
    // Get total bandwidth usage from leaderboard (sum of all noOfhoursCompleted)
    const totalBandwidthResult = await Leaderboard.aggregate([
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

    // Get bandwidth for current month
    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    currentMonthStart.setHours(0, 0, 0, 0);

    const monthlyBandwidthResult = await Leaderboard.aggregate([
      {
        $match: {
          updatedAt: { $gte: currentMonthStart }
        }
      },
      {
        $group: {
          _id: null,
          monthlyHours: { $sum: '$noOfhoursCompleted' }
        }
      }
    ]);

    const monthlyBandwidthGB = monthlyBandwidthResult.length > 0 ?
      Math.round((monthlyBandwidthResult[0].monthlyHours * 0.001) * 100) / 100 : 0;

    return {
      bandwidthUsedGB: monthlyBandwidthGB,
      totalBandwidthGB: totalBandwidthGB,
      cpuLoad: cpuLoad,
      uptime: uptime,
      bandwidthTrend: generateBandwidthTrend()
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
const generateBandwidthTrend = () => {
  const trend = [];
  const now = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    trend.push({
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
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
    const totalUsers = await User.countDocuments({ organization_id: organizationId });

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

    // Get previous period data for comparison (last 30 days before current period)
    const previousPeriodStart = new Date(last30Days.getTime() - 30 * 24 * 60 * 60 * 1000);
    const previousPeriodHours = await Leaderboard.aggregate([
      {
        $match: {
          organization_id: organization._id,
          updatedAt: { $gte: previousPeriodStart, $lt: last30Days }
        }
      },
      {
        $group: {
          _id: '$organization_id',
          totalHours: { $sum: '$noOfhoursCompleted' }
        }
      }
    ]);

    const previousHours = previousPeriodHours.length > 0 ? previousPeriodHours[0].totalHours / 60 : 0; // Convert to hours
    const hoursChange = previousHours > 0 ? (((totalHours - previousHours) / previousHours) * 100).toFixed(0) : 0;

    // Create organization data in same format as global analytics
    const orgData = [{
      name: organization.name,
      users: activeUsers,
      totalHours: totalHours,
      change: hoursChange >= 0 ? `↑ ${Math.abs(hoursChange)}%` : `↓ ${Math.abs(hoursChange)}%`,
      changeType: hoursChange >= 0 ? 'badge-up' : 'badge-down'
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
    const systemHealth = await getOrganizationSystemHealthMetrics(organizationId);

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

// Helper function to get organization-specific system health metrics
const getOrganizationSystemHealthMetrics = async (organizationId) => {
  try {
    // Get total bandwidth usage for this organization from leaderboard
    const totalBandwidthResult = await Leaderboard.aggregate([
      {
        $match: { organization_id: organizationId }
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

    // Get bandwidth for current month for this organization
    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    currentMonthStart.setHours(0, 0, 0, 0);

    const monthlyBandwidthResult = await Leaderboard.aggregate([
      {
        $match: {
          organization_id: organizationId,
          updatedAt: { $gte: currentMonthStart }
        }
      },
      {
        $group: {
          _id: null,
          monthlyHours: { $sum: '$noOfhoursCompleted' }
        }
      }
    ]);

    const monthlyBandwidthGB = monthlyBandwidthResult.length > 0 ?
      Math.round((monthlyBandwidthResult[0].monthlyHours * 0.001) * 100) / 100 : 0;

    return {
      bandwidthUsedGB: monthlyBandwidthGB,
      totalBandwidthGB: totalBandwidthGB,
      cpuLoad: cpuLoad,
      uptime: uptime,
      bandwidthTrend: generateOrganizationBandwidthTrend(organizationId)
    };
  } catch (error) {
    console.error('Error getting organization system health metrics:', error);
    return {
      bandwidthUsedGB: 0,
      totalBandwidthGB: 0,
      cpuLoad: 0,
      uptime: 0,
      bandwidthTrend: []
    };
  }
};

// Helper function to generate organization-specific bandwidth trend data
const generateOrganizationBandwidthTrend = (organizationId) => {
  const trend = [];
  const now = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    trend.push({
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Math.round(Math.random() * 20 + 5) // 5-25 GB per day for single org
    });
  }

  return trend;
};

module.exports = {
  getAnalyticsData,
  getOrganizationAnalytics
};
