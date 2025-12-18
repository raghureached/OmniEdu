const User = require('../../models/users_model');
const UserProfile = require('../../models/userProfiles_model');
const Organization = require('../../models/organization_model');
const Leaderboard = require('../../models/leaderboard.model');
const adminTicket = require('../../models/adminTicket');
const userTickets = require('../../models/userTickets');
const GlobalModule = require('../../models/globalModule_model');
const GlobalAssessments = require('../../models/globalAssessments_model');
const ForUserAssignment = require('../../models/forUserAssigments_model');
const UserContentProgress = require('../../models/userContentProgress_model');

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


const getContentAnalytics = async (req, res) => {
    try {
        const { contentId } = req.params;
        // First, find the module by UUID to get its ObjectId
        const module = await GlobalModule.findOne({ 
            uuid: contentId
        }).lean();

        if (!module) {
            return res.status(404).json({
                success: false,
                message: "Content not found"
            });
        }

        // Find all assignments for this content using the ObjectId
        const assignments = await ForUserAssignment.find({
            contentId: module._id, // Use ObjectId from the found module
        }).populate('organization_id', 'name email')
          .populate('created_by', 'name email')
          .lean();

        // Get all user progress for this content using the ObjectId
        const userProgress = await UserContentProgress.find({
            contentId: module._id, // Use ObjectId from the found module
        }).populate('organization_id', 'name email')
          .populate('assignment_id', 'assign_on due_date created_by')
          .lean();

        // Group progress data by organization
        const organizationProgressMap = new Map();
        
        for (const progress of userProgress) {
            const orgId = progress.organization_id?._id?.toString();
            if (!orgId) continue;
            
            if (!organizationProgressMap.has(orgId)) {
                organizationProgressMap.set(orgId, {
                    organization: progress.organization_id,
                    totalUsers: 0,
                    completedUsers: 0,
                    inProgressUsers: 0,
                    notStartedUsers: 0,
                    averageScore: 0,
                    totalTimeSpent: 0,
                    averageTimeSpent: 0,
                    firstStartedAt: null,
                    lastCompletedAt: null,
                    assignments: []
                });
            }
            
            const orgData = organizationProgressMap.get(orgId);
            const assignment = progress.assignment_id;
            
            // Handle start date edge cases
            let startedOn = null;
            if (progress.started_at) {
                startedOn = progress.started_at;
            } else if (progress.status === 'in_progress' || progress.status === 'completed') {
                startedOn = assignment?.assign_on || progress.createdAt;
            }

            // Handle completion date edge cases
            let completedOn = null;
            if (progress.completed_at) {
                completedOn = progress.completed_at;
            } else if (progress.status === 'completed') {
                completedOn = progress.updated_at || new Date();
            }

            // Determine content type and score based on content type
            const contentType = assignment?.contentType || 'course';
            const score = await calculateScore(progress, contentType, module._id);
            const timeSpent = calculateTimeSpent(progress.started_at, progress.completed_at, progress.last_activity_at);

            // Update organization metrics
            orgData.totalUsers++;
            orgData.totalTimeSpent += timeSpent;
            
            if (progress.status === 'completed') {
                orgData.completedUsers++;
                orgData.averageScore = (orgData.averageScore * (orgData.completedUsers - 1) + score) / orgData.completedUsers;
                if (!orgData.lastCompletedAt || completedOn > orgData.lastCompletedAt) {
                    orgData.lastCompletedAt = completedOn;
                }
            } else if (progress.status === 'in_progress') {
                orgData.inProgressUsers++;
            } else {
                orgData.notStartedUsers++;
            }
            
            if (!orgData.firstStartedAt || (startedOn && startedOn < orgData.firstStartedAt)) {
                orgData.firstStartedAt = startedOn;
            }

            // Add assignment details
            orgData.assignments.push({
                _id: progress.uuid,
                started_at: startedOn,
                completed_at: completedOn,
                status: progress.status === 'assigned' ? 'not-started' : 
                       progress.status === 'in_progress' ? 'in-progress' : 
                       progress.status === 'completed' ? 'completed' : 'not-started',
                score: score,
                timeSpent: timeSpent,
                created_at: progress.createdAt,
                updated_at: progress.updatedAt
            });
        }

        // Calculate average time spent for each organization
        for (const orgData of organizationProgressMap.values()) {
            orgData.averageTimeSpent = orgData.totalUsers > 0 ? orgData.totalTimeSpent / orgData.totalUsers : 0;
        }

        // Transform data to match AnalyticsPop expected format but with organization data
        const totalAssignments = Array.from(organizationProgressMap.values()).map(orgData => {
            const organization = orgData.organization;
            
            return {
                _id: organization._id,
                organizationName: organization?.name || 'Unknown Organization',
                email: organization?.email || 'unknown@example.com',
                totalUsers: orgData.totalUsers,
                completedUsers: orgData.completedUsers,
                inProgressUsers: orgData.inProgressUsers,
                notStartedUsers: orgData.notStartedUsers,
                completionRate: orgData.totalUsers > 0 ? (orgData.completedUsers / orgData.totalUsers) * 100 : 0,
                averageScore: orgData.averageScore,
                averageTimeSpent: orgData.averageTimeSpent,
                started_at: orgData.firstStartedAt,
                completed_at: orgData.lastCompletedAt,
                actualDuration: calculateCourseDuration(module),
                assignment_id: {
                    assign_on: orgData.firstStartedAt,
                    due_date: null,
                    contentType: 'course',
                    contentId: {
                        title: module.title,
                        created_at: module.createdAt,
                        updated_at: module.updatedAt
                    },
                    created_by: {
                        name: 'System'
                    }
                },
                created_at: orgData.firstStartedAt,
                updated_at: orgData.lastCompletedAt,
                assignments: orgData.assignments
            };
        });

        return res.status(200).json({
            success: true,
            data: {
                totalAssignments
            }
        });

    } catch (error) {
        console.error('Content analytics error:', error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

const getUserAnalytics = async (req, res) => {
    try {
        const { userId } = req.params;
        const organizationId = req.user.organization_id;

        // console.log('Fetching analytics for user:', userId, 'in organization:', organizationId);

        // First, find the user by UUID to get their ObjectId
        const user = await User.findOne({ 
            uuid: userId,
            organization_id: organizationId 
        }).lean();

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        console.log('Found user:', user._id, 'Name:', user.name);

        // Get all assignments for this user
        const assignments = await ForUserAssignment.find({
            assigned_users: user._id,
            organization_id: organizationId
        }).populate('assigned_users', 'name email')
          .populate('created_by', 'name email')
          .lean();

        console.log('Found assignments:', assignments.length);

        // Get all user progress for this user using the ObjectId
        const userProgress = await UserContentProgress.find({
            user_id: user._id, // Use ObjectId from the found user
            organization_id: organizationId
        }).populate('assignment_id', 'assign_on due_date created_by contentType')
          .lean();

        console.log('Found user progress records:', userProgress.length);

        // Manually populate content details for each progress record
        const userProgressWithContent = await Promise.all(userProgress.map(async (progress) => {
            let contentDetails = null;
            try {
                // Try to find the content based on assignment type
                const assignment = assignments.find(a => a._id.toString() === progress.assignment_id?._id?.toString());
                if (assignment) {
                    switch (assignment.assign_type) {
                        case 'OrganizationModule':
                            contentDetails = await Module.findById(progress.contentId).lean();
                            break;
                        case 'GlobalAssessments':
                            contentDetails = await GlobalAssessments.findById(progress.contentId).lean();
                            break;
                        case 'OrganizationSurvey':
                            contentDetails = await OrganizationSurveys.findById(progress.contentId).lean();
                            break;
                        case 'LearningPath':
                            contentDetails = await LearningPath.findById(progress.contentId).lean();
                            break;
                        default:
                            contentDetails = await Module.findById(progress.contentId).lean();
                    }
                } else {
                    // Fallback to Module if no assignment found
                    contentDetails = await Module.findById(progress.contentId).lean();
                }
            } catch (error) {
                console.log('Could not fetch content details for contentId:', progress.contentId, 'assign_type:', assignments.find(a => a._id.toString() === progress.assignment_id?._id?.toString())?.assign_type);
            }
            
            return {
                ...progress,
                contentId: contentDetails || progress.contentId
            };
        }));

        // Create a comprehensive data structure
        const totalAssignments = [];

        // Process assignments that might not have progress records
        for (const assignment of assignments) {
            // Find corresponding progress record
            const progress = userProgressWithContent.find(p => 
                p.assignment_id?._id?.toString() === assignment._id.toString()
            );

            // Handle start date edge cases
            let startedOn = null;
            if (progress?.started_at) {
                startedOn = progress.started_at;
            } else if (progress?.status === 'in_progress' || progress?.status === 'completed') {
                startedOn = assignment.assign_on || progress.createdAt;
            }

            // Handle completion date edge cases
            let completedOn = null;
            if (progress?.completed_at) {
                completedOn = progress.completed_at;
            } else if (progress?.status === 'completed') {
                completedOn = progress.updated_at || new Date();
            }

            // Determine content type and score
            const contentType = assignment.contentType || 'course';
            const score = progress ? await calculateScore(progress, contentType, progress.contentId) : 0;

            // Get assigned by value
            const assignedBy = await getAssignedBy(assignment, user, organizationId);

            // Get content details
            let contentTitle = 'Unknown Resource';
            let contentCreatedAt = null;
            let contentUpdatedAt = null;

            if (progress?.contentId && typeof progress.contentId === 'object' && progress.contentId.title) {
                contentTitle = progress.contentId.title || 'Unknown Resource';
                contentCreatedAt = progress.contentId.createdAt;
                contentUpdatedAt = progress.contentId.updatedAt;
            } else if (assignment.contentId) {
                // Try to get content details directly based on assignment type
                try {
                    let content = null;
                    switch (assignment.assign_type) {
                        case 'OrganizationModule':
                            content = await Module.findById(assignment.contentId).lean();
                            break;
                        case 'GlobalAssessments':
                            content = await GlobalAssessments.findById(assignment.contentId).lean();
                            break;
                        case 'OrganizationSurvey':
                            content = await OrganizationSurveys.findById(assignment.contentId).lean();
                            break;
                        case 'LearningPath':
                            content = await LearningPath.findById(assignment.contentId).lean();
                            break;
                        default:
                            content = await Module.findById(assignment.contentId).lean();
                    }
                    if (content) {
                        contentTitle = content.title || 'Unknown Resource';
                        contentCreatedAt = content.createdAt;
                        contentUpdatedAt = content.updatedAt;
                    }
                } catch (error) {
                    console.log('Could not fetch content details for assign_type:', assignment.assign_type, 'contentId:', assignment.contentId, error);
                }
            }

            totalAssignments.push({
                _id: progress?.uuid || assignment.uuid,
                userName: user?.name || 'Unknown User',
                email: user?.email || 'unknown@example.com',
                started_at: startedOn,
                completed_at: completedOn,
                status: progress?.status === 'assigned' ? 'not-started' : 
                       progress?.status === 'in_progress' ? 'in-progress' : 
                       progress?.status === 'completed' ? 'completed' : 'not-started',
                score: score,
                averageScore: progress?.averageScore || 0,
                timeSpent: progress ? calculateTimeSpent(progress.started_at, progress.completed_at, progress.last_activity_at) : 'Not Started',
                actualDuration: calculateCourseDuration(progress?.contentId),
                assignment_id: {
                    assign_on: assignment.assign_on,
                    due_date: assignment.due_date,
                    contentType: contentType,
                    contentId: {
                        title: contentTitle,
                        created_at: contentCreatedAt,
                        updated_at: contentUpdatedAt
                    },
                    created_by: {
                        name: assignedBy
                    }
                },
                created_at: progress?.createdAt || assignment.createdAt,
                updated_at: progress?.updatedAt || assignment.updatedAt
            });
        }

        // Also add any progress records that don't have assignments
        for (const progress of userProgressWithContent) {
            const hasAssignment = totalAssignments.find(a => 
                a._id === progress.uuid
            );
            
            if (!hasAssignment) {
                // Handle start date edge cases
                let startedOn = null;
                if (progress.started_at) {
                    startedOn = progress.started_at;
                } else if (progress.status === 'in_progress' || progress.status === 'completed') {
                    startedOn = progress.assignment_id?.assign_on || progress.createdAt;
                }

                // Handle completion date edge cases
                let completedOn = null;
                if (progress.completed_at) {
                    completedOn = progress.completed_at;
                } else if (progress.status === 'completed') {
                    completedOn = progress.updated_at || new Date();
                }

                // Determine content type and score
                const contentType = progress.assignment_id?.contentType || progress.contentId?.contentType || 'course';
                const score = await calculateScore(progress, contentType, progress.contentId);

                // Get assigned by value
                const assignedBy = await getAssignedBy(progress.assignment_id, user, organizationId);

                totalAssignments.push({
                    _id: progress.uuid,
                    userName: user?.name || 'Unknown User',
                    email: user?.email || 'unknown@example.com',
                    started_at: startedOn,
                    completed_at: completedOn,
                    status: progress.status === 'assigned' ? 'not-started' : 
                           progress.status === 'in_progress' ? 'in-progress' : 
                           progress.status === 'completed' ? 'completed' : 'not-started',
                    score: score,
                    averageScore: progress.averageScore || 0,
                    timeSpent: calculateTimeSpent(progress.started_at, progress.completed_at, progress.last_activity_at),
                    actualDuration: calculateCourseDuration(progress.contentId),
                    assignment_id: {
                        assign_on: progress.assignment_id?.assign_on || progress.createdAt,
                        due_date: progress.assignment_id?.due_date,
                        contentType: contentType,
                        contentId: {
                            title: progress.contentId?.title || 'Unknown Resource',
                            created_at: progress.contentId?.createdAt,
                            updated_at: progress.contentId?.updatedAt
                        },
                        created_by: {
                            name: assignedBy
                        }
                    },
                    created_at: progress.createdAt,
                    updated_at: progress.updatedAt
                });
            }
        }

        console.log('Total assignments to return:', totalAssignments.length);

        return res.status(200).json({
            success: true,
            data: {
                totalAssignments
            }
        });

    } catch (error) {
        console.error('User analytics error:', error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

const getAssessmentAnalytics = async (req, res) => {
    try {
        const { assessmentId } = req.params;
        
        if (!assessmentId) {
            return res.status(400).json({
                success: false,
                message: "Assessment ID is required"
            });
        }

        // console.log('Fetching analytics for assessment:', assessmentId);

        // Get assessment info first
        let assessment = null;
        let assessmentObjectId = null;
        
        // Handle both UUID and ObjectId cases
        if (assessmentId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
            assessment = await GlobalAssessments.findOne({ uuid: assessmentId })
                .populate('organization_id', 'name');
            assessmentObjectId = assessment?._id;
        } else {
            assessmentObjectId = assessmentId;
            assessment = await GlobalAssessments.findById(assessmentId)
                .populate('organization_id', 'name');
        }

        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: "Assessment not found"
            });
        }

        // Get all assignments for this assessment
        const assignments = await ForUserAssignment.find({
            assign_type: "GlobalAssessments",
            contentId: assessmentObjectId
        })
        .populate('assigned_users', 'name email')
        .populate('created_by', 'name')
        .populate('groups', 'name')
        .sort({ assign_on: -1 });

        // Get assessment attempts data
        let assessmentAttempts = [];
        if (assessmentObjectId) {
            assessmentAttempts = await GlobalAssessmentsAttemps.find({
                assessment_id: assessmentObjectId
            })
            .populate('user_id', 'name email')
            .populate('assessment_id', 'title description')
            .sort({ createdAt: -1 });
        }

        console.log('Found assessment attempts:', assessmentAttempts.length);

        // Create a map of user attempts for quick lookup
        const attemptsByUser = new Map();
        assessmentAttempts.forEach(attempt => {
            if (attempt.user_id) {
                attemptsByUser.set(attempt.user_id._id.toString(), attempt);
            }
        });

        // Get assessment info
        let assessmentInfo = {
            id: assessmentId,
            title: assessment.title || 'Unknown Assessment',
            description: assessment.description || 'No description',
            organizationName: assessment.organization_id?.name || 'Unknown Organization'
        };

        // Combine assignments and attempts to show all assigned users
        const allAssignments = [];
        
        assignments.forEach(assignment => {
            if (assignment.assigned_users && assignment.assigned_users.length > 0) {
                assignment.assigned_users.forEach(user => {
                    const userId = user._id.toString();
                    const attempt = attemptsByUser.get(userId);
                    
                    allAssignments.push({
                        userName: user.name || 'Unknown User',
                        email: user.email || 'unknown@example.com',
                        assignment_id: assignment,
                        status: attempt ? 'completed' : 'not-started',
                        started_at: attempt?.attemptedAt || null,
                        completed_at: attempt?.updatedAt || null,
                        updated_at: attempt?.updatedAt || assignment.updatedAt,
                        score: attempt?.score || 0,
                        assign_on: assignment.assign_on,
                        created_at: assignment.createdAt,
                        assigned_by: assignment.created_by,
                        timeSpent: attempt ? calculateTimeSpent(attempt.attemptedAt, attempt.updatedAt, attempt.updatedAt) : null,
                        actualDuration: attempt ? calculateTimeSpent(attempt.attemptedAt, attempt.updatedAt, attempt.updatedAt) : null
                    });
                });
            }
        });

        // Calculate analytics metrics
        const totalAssignments = allAssignments.length;
        const completedAssignments = allAssignments.filter(a => a.status === 'completed').length;
        const uniqueUsers = [...new Set(allAssignments.map(a => a.userName))];
        const completionRate = totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0;
        
        // Calculate scores
        const scores = allAssignments
            .filter(a => a.score !== undefined && a.score !== null && a.score > 0)
            .map(a => a.score);
        
        const averageScore = scores.length > 0 
            ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
            : 0;
        
        const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
        const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;

        // Status distribution
        const statusDistribution = allAssignments.reduce((acc, assignment) => {
            const status = assignment.status || 'assigned';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});

        // Performance categories
        const performanceCategories = {
            excellent: scores.filter(score => score >= 90).length,
            good: scores.filter(score => score >= 70 && score < 90).length,
            average: scores.filter(score => score >= 50 && score < 70).length,
            poor: scores.filter(score => score < 50).length
        };

        // Recent assignments (last 10)
        const recentAssignments = allAssignments.slice(0, 10).map(assignment => ({
            userName: assignment.userName,
            userEmail: assignment.email,
            score: assignment.score || 0,
            status: assignment.status || 'not-started',
            startedAt: assignment.started_at,
            completedAt: assignment.completed_at,
            timeSpent: assignment.timeSpent,
            assignedBy: assignment.assigned_by?.name || 'System'
        }));

        const analyticsData = {
            assessmentInfo,
            overview: {
                totalAttempts: totalAssignments,
                uniqueUsers: uniqueUsers.length,
                completionRate: Math.round(completionRate * 100) / 100,
                averageScore: Math.round(averageScore * 100) / 100,
                highestScore,
                lowestScore
            },
            statusDistribution,
            performanceCategories,
            timeAnalytics: {
                attemptsLast30Days: totalAssignments,
                attemptsLast7Days: totalAssignments,
                averageTimeSpent: calculateAverageTimeSpent(assessmentAttempts)
            },
            recentAttempts: recentAssignments,
            detailedAttempts: allAssignments.map(assignment => ({
                userName: assignment.userName,
                userEmail: assignment.email,
                score: assignment.score || 0,
                status: assignment.status || 'not-started',
                startedAt: assignment.started_at,
                completedAt: assignment.completed_at,
                timeSpent: assignment.timeSpent,
                createdAt: assignment.created_at,
                assignedBy: assignment.assigned_by?.name || 'System'
            }))
        };

        console.log('Assessment analytics calculated successfully');

        return res.status(200).json({
            success: true,
            data: analyticsData
        });

    } catch (error) {
        console.error('Assessment analytics error:', error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// Helper function to calculate average time spent
const calculateAverageTimeSpent = (attempts) => {
    const validAttempts = attempts.filter(attempt => 
        attempt.attemptedAt && attempt.updatedAt
    );
    
    if (validAttempts.length === 0) return '0 min';
    
    const totalTimeMs = validAttempts.reduce((total, attempt) => {
        const start = new Date(attempt.attemptedAt);
        const end = new Date(attempt.updatedAt);
        return total + (end - start);
    }, 0);
    
    const avgTimeMs = totalTimeMs / validAttempts.length;
    const avgHours = Math.floor(avgTimeMs / (1000 * 60 * 60));
    const avgMins = Math.floor((avgTimeMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (avgHours > 0) {
        return `${avgHours}h ${avgMins}m`;
    } else {
        return `${avgMins} min`;
    }
};

const getSurveyAnalytics = async (req, res) => {
    try {
        const { surveyId } = req.params;
        
        if (!surveyId) {
            return res.status(400).json({
                success: false,
                message: "Survey ID is required"
            });
        }

        console.log('Fetching analytics for survey:', surveyId);

        // Get survey info first
        let survey = null;
        let surveyObjectId = null;
        
        // Handle both UUID and ObjectId cases
        if (surveyId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
            survey = await OrganizationSurveys.findOne({ uuid: surveyId })
                .populate('organization_id', 'name');
            surveyObjectId = survey?._id;
        } else {
            surveyObjectId = surveyId;
            survey = await OrganizationSurveys.findById(surveyId)
                .populate('organization_id', 'name');
        }

        if (!survey) {
            return res.status(404).json({
                success: false,
                message: "Survey not found"
            });
        }

        // Get all assignments for this survey
        const assignments = await ForUserAssignment.find({
            assign_type: "OrganizationSurvey",
            contentId: surveyObjectId
        })
        .populate('assigned_users', 'name email')
        .populate('created_by', 'name')
        .populate('groups', 'name')
        .sort({ assign_on: -1 });

        // console.log('Found assignments:', assignments.length);

        // Get survey responses data
        let surveyResponses = [];
        if (surveyObjectId) {
            surveyResponses = await OrganizationSurveyResponses.find({
                survey_assignment_id: surveyObjectId.toString()
            })
            .populate('user_id', 'name email')
            .sort({ submitted_at: -1 });
        }

        console.log('Found survey responses:', surveyResponses.length);

        // Create a map of user responses for quick lookup
        const responsesByUser = new Map();
        surveyResponses.forEach(response => {
            if (response.user_id) {
                responsesByUser.set(response.user_id._id.toString(), response);
            }
        });

        // Get survey info
        let surveyInfo = {
            id: surveyId,
            title: survey.title || 'Unknown Survey',
            description: survey.description || 'No description',
            organizationName: survey.organization_id?.name || 'Unknown Organization'
        };

        // Combine assignments and responses to show all assigned users
        const allAssignments = [];
        
        assignments.forEach(assignment => {
            if (assignment.assigned_users && assignment.assigned_users.length > 0) {
                assignment.assigned_users.forEach(user => {
                    const userId = user._id.toString();
                    const response = responsesByUser.get(userId);
                    
                    allAssignments.push({
                        userName: user.name || 'Unknown User',
                        email: user.email || 'unknown@example.com',
                        assignment_id: assignment,
                        status: response ? 'completed' : 'not-started',
                        started_at: response?.createdAt || null,
                        completed_at: response?.submitted_at || null,
                        updated_at: response?.updatedAt || assignment.updatedAt,
                        assign_on: assignment.assign_on,
                        created_at: assignment.createdAt,
                        assigned_by: assignment.created_by,
                        timeSpent: response ? calculateTimeSpent(response.createdAt, response.submitted_at, response.updatedAt) : null,
                        actualDuration: response ? calculateTimeSpent(response.createdAt, response.submitted_at, response.updatedAt) : null,
                        responses: response?.responses || null
                    });
                });
            }
        });

        // Calculate analytics metrics
        const totalAssignments = allAssignments.length;
        const completedAssignments = allAssignments.filter(a => a.status === 'completed').length;
        const uniqueUsers = [...new Set(allAssignments.map(a => a.userName))];
        const completionRate = totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0;

        // Status distribution (for surveys, all are completed since they're responses)
        const statusDistribution = allAssignments.reduce((acc, assignment) => {
            const status = assignment.status || 'assigned';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});

        // Recent assignments (last 10)
        const recentAssignments = allAssignments.slice(0, 10).map(assignment => ({
            userName: assignment.userName,
            userEmail: assignment.email,
            status: assignment.status || 'not-started',
            startedAt: assignment.started_at,
            completedAt: assignment.completed_at,
            timeSpent: assignment.timeSpent,
            assignedBy: assignment.assigned_by?.name || 'System'
        }));

        // Detailed assignments
        const detailedAssignments = allAssignments.map(assignment => ({
            userName: assignment.userName,
            userEmail: assignment.email,
            status: assignment.status || 'not-started',
            startedAt: assignment.started_at,
            completedAt: assignment.completed_at,
            timeSpent: assignment.timeSpent,
            createdAt: assignment.created_at,
            assignedBy: assignment.assigned_by?.name || 'System',
            responses: assignment.responses
        }));

        const analyticsData = {
            surveyInfo,
            overview: {
                totalResponses: totalAssignments,
                uniqueUsers: uniqueUsers.length,
                completionRate: Math.round(completionRate * 100) / 100,
                averageScore: 0, // Surveys don't typically have scores
                highestScore: 0,
                lowestScore: 0
            },
            statusDistribution,
            performanceCategories: {
                excellent: 0,
                good: 0,
                average: 0,
                poor: 0
            },
            timeAnalytics: {
                responsesLast30Days: totalAssignments,
                responsesLast7Days: totalAssignments,
                averageTimeSpent: calculateAverageTimeSpent(surveyResponses.map(r => ({
                    attemptedAt: r.createdAt,
                    updatedAt: r.submitted_at
                })))
            },
            recentResponses: recentAssignments,
            detailedResponses: detailedAssignments
        };

        console.log('Survey analytics calculated successfully');

        return res.status(200).json({
            success: true,
            data: analyticsData
        });

    } catch (error) {
        console.error('Survey analytics error:', error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// Helper function to get organization-specific system health metric

module.exports = {
  getAnalyticsData,
  getOrganizationAnalytics,
  getContentAnalytics
};
