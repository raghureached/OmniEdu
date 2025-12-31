const User = require('../../models/users_model');
const UserProfile = require('../../models/userProfiles_model');
const Organization = require('../../models/organization_model');
const Leaderboard = require('../../models/leaderboard.model');
const adminTicket = require('../../models/adminTicket');
const userTickets = require('../../models/userTickets');

/* ===========================
   DATE RANGE UTILS (SINGLE SOURCE)
=========================== */
const getDateRangeFilter = (dateRange = '7D', startDate, endDate) => {
  // console.log(dateRange);
  if (!dateRange || dateRange === 'all') return null;
  if (dateRange === 'custom' && startDate && endDate) {
    return { 
      $gte: new Date(startDate), 
      $lte: new Date(endDate + 'T23:59:59.999Z') 
    };
  }

  const end = new Date();
  const start = new Date(end);

  switch (dateRange.toUpperCase()) {
    case '7D':
      start.setDate(end.getDate() - 7);
      break;

    case '1M':
      start.setMonth(end.getMonth() - 1);
      break;

    case '3M':
      start.setMonth(end.getMonth() - 3);
      break;

    case '6M':
      start.setMonth(end.getMonth() - 6);
      break;

    case 'MTD':
      start.setDate(1);              // first day of current month
      start.setHours(0, 0, 0, 0);    // start of day
      break;

    default:
      start.setDate(end.getDate() - 7);
  }

  return { start, end };
};

const getPreviousRange = (range) => {
  if (!range) return null;
  const duration = range.end - range.start;
  return {
    start: new Date(range.start.getTime() - duration),
    end: new Date(range.start)
  };
};

/* ===========================
   GLOBAL ANALYTICS
=========================== */

const getAnalyticsData = async (req, res) => {
  try {
    const { dateRange = '7D', startDate, endDate } = req.query;
    const range = getDateRangeFilter(dateRange, startDate, endDate);
    const prevRange = getPreviousRange(range);

    const totalUsers = await User.countDocuments();

    // DAU (last 24 hours)
    const dau = await User.countDocuments({
      last_login: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    // MAU (active in selected range)
    const mau = range
      ? await User.countDocuments({
        last_login: { $gte: range.start, $lte: range.end }
      })
      : totalUsers;

    const stickinessScore = mau > 0 ? ((dau / mau) * 100).toFixed(1) : 0;

    // Previous period
    const previousDAU = prevRange
      ? await User.countDocuments({
        last_login: { $gte: prevRange.start, $lte: prevRange.end }
      })
      : 0;

    const dauChange =
      previousDAU > 0
        ? (((dau - previousDAU) / previousDAU) * 100).toFixed(1)
        : 0;
    // Previous MAU (same duration, previous period)
    const previousMAU = prevRange
      ? await User.countDocuments({
        last_login: { $gte: prevRange.start, $lte: prevRange.end }
      })
      : 0;

    const mauChange =
      previousMAU > 0
        ? (((mau - previousMAU) / previousMAU) * 100).toFixed(1)
        : 0;

    // Organizations
    const organizations = await Organization.find({}, 'name');

    const orgData = await Promise.all(
      organizations.map(async (org) => {
        const activeUsers = range
          ? await User.countDocuments({
            organization_id: org._id,
            last_login: { $gte: range.start, $lte: range.end }
          })
          : await User.countDocuments({ organization_id: org._id });

        const totalOrgUsers = await User.countDocuments({
          organization_id: org._id
        });

        const activeUsersPercentage =
          totalOrgUsers > 0
            ? ((activeUsers / totalOrgUsers) * 100).toFixed(1)
            : 0;

        return {
          _id: org._id,
          name: org.name,
          users: activeUsers,
          activeUsersPercentage: Number(activeUsersPercentage)
        };
      })
    );

    // Tickets
    const adminTickets = await adminTicket.find();
    const userTicketss = await userTickets.find();

    const ticketsData = {
      adminOpen: adminTickets.filter(t => t.status === 'Open').length,
      adminResolved: adminTickets.filter(t => t.status === 'Resolved').length,
      userOpen: userTicketss.filter(t => t.status === 'Open').length,
      userResolved: userTicketss.filter(t => t.status === 'Resolved').length
    };

    res.json({
      stats: {
        dau: { value: dau, change: dauChange, sublabel: "last 24 hours"},
        mau: { value: mau, change: mauChange, sublabel: `last ${dateRange.toUpperCase()}`},
        stickiness: { value: stickinessScore, sublabel: "DAU/MAU" },
        totalUsers: { value: totalUsers, sublabel: "All Registered Users" },
        totalOrg: { value: organizations.length, sublabel: "All Organizations" }
      },
      organizations: orgData,
      ticketsData,
      timestamp: new Date()
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
};

/* ===========================
   ORGANIZATION ANALYTICS
=========================== */

const getOrganizationAnalytics = async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { dateRange = '7D', startDate, endDate } = req.query;

    const range = getDateRangeFilter(dateRange, startDate, endDate);
    const prevRange = getPreviousRange(range);

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    /* ===========================
       TOTAL USERS
    ============================ */

    const totalUsers = await User.countDocuments({
      organization_id: organizationId
    });

    /* ===========================
       DAU (LAST 24 HOURS)
    ============================ */

    const dau = await User.countDocuments({
      organization_id: organizationId,
      last_login: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    const previousDAU = await User.countDocuments({
      organization_id: organizationId,
      last_login: {
        $gte: new Date(Date.now() - 48 * 60 * 60 * 1000),
        $lt: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    });

    const dauChange =
      previousDAU > 0
        ? (((dau - previousDAU) / previousDAU) * 100).toFixed(1)
        : 0;

    /* ===========================
       MAU (RANGE-BASED)
    ============================ */

    const mau = range
      ? await User.countDocuments({
          organization_id: organizationId,
          last_login: { $gte: range.start, $lte: range.end }
        })
      : totalUsers;

    const previousMAU = prevRange
      ? await User.countDocuments({
          organization_id: organizationId,
          last_login: { $gte: prevRange.start, $lte: prevRange.end }
        })
      : 0;

    const mauChange =
      previousMAU > 0
        ? (((mau - previousMAU) / previousMAU) * 100).toFixed(1)
        : 0;

    /* ===========================
       STICKINESS
    ============================ */

    const stickiness =
      mau > 0 ? ((dau / mau) * 100).toFixed(1) : 0;

    /* ===========================
       ACTIVE USERS %
    ============================ */

    const activeUsersPercentage =
      totalUsers > 0 ? ((mau / totalUsers) * 100).toFixed(1) : 0;

    /* ===========================
       LEADERBOARD (TOTAL HOURS)
    ============================ */

    const leaderboardMatch = {
      organization_id: organization._id
    };

    if (range) {
      leaderboardMatch.updatedAt = {
        $gte: range.start,
        $lte: range.end
      };
    }

    const leaderboardData = await Leaderboard.aggregate([
      { $match: leaderboardMatch },
      {
        $group: {
          _id: null,
          totalMinutes: { $sum: '$noOfhoursCompleted' }
        }
      }
    ]);

    const totalHours =
      leaderboardData.length > 0
        ? Math.round((leaderboardData[0].totalMinutes / 60) * 10) / 10
        : 0;

    /* ===========================
       TICKETS
    ============================ */

    const adminTickets = await adminTicket.find({
      organizationId: organizationId
    });

    const userTicketss = await userTickets.find({
      organizationId: organizationId
    });

    const ticketsData = {
      adminOpen: adminTickets.filter(t => t.status === 'Open').length,
      adminResolved: adminTickets.filter(t => t.status === 'Resolved').length,
      userOpen: userTicketss.filter(t => t.status === 'Open').length,
      userResolved: userTicketss.filter(t => t.status === 'Resolved').length
    };

    /* ===========================
       RESPONSE
    ============================ */

    res.json({
      stats: {
        dau: {
          value: dau,
          change: dauChange,
          label: 'Daily Active Users',
          sublabel: 'Last 24 hours'
        },
        mau: {
          value: mau,
          change: mauChange,
          label: 'Monthly Active Users',
          sublabel: `Last ${dateRange.toUpperCase()}`
        },
        stickiness: {
          value: stickiness,
          label: 'Stickiness',
          sublabel: 'DAU / MAU'
        },
        totalUsers: {
          value: totalUsers,
          label: 'Total Users',
          sublabel: 'All registered users'
        },
        activepercentage: {
          value: Number(activeUsersPercentage),
          label: 'Active Users %',
          sublabel: `Last ${dateRange.toUpperCase()}`
        }
      },
      organizations: [
        {
          _id: organization._id,
          name: organization.name,
          users: mau,
          totalHours,
          activeUsersPercentage: Number(activeUsersPercentage)
        }
      ],
      ticketsData,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error fetching organization analytics:', error);
    res.status(500).json({ error: 'Failed to fetch organization analytics' });
  }
};


/* ===========================
   USERS LIST
=========================== */

const getUsersData = async (req, res) => {
  try {
    const { orgId } = req.params;
    const { dateRange = '7D', startDate, endDate } = req.query;

    const range = getDateRangeFilter(dateRange, startDate, endDate);
    const organization = await Organization.findById(orgId);

    const users = await User.find({ organization_id: orgId })
      .populate('global_role_id', 'name')
      .lean();

    const activeUserIds = range
      ? await User.find({
        organization_id: orgId,
        last_login: { $gte: range.start, $lte: range.end }
      }).distinct('_id')
      : [];

    const userData = users.map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.global_role_id?.name || 'N/A',
      last_login: user.last_login || null,
      isActive: activeUserIds.some(id => id.equals(user._id))
    }));

    res.json({ success: true, data: userData, name: organization.name });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getAnalyticsData,
  getOrganizationAnalytics,
  getUsersData
};
