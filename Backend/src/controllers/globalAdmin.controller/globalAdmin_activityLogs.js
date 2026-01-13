const ActivityLog = require("../../models/activityLog_model");
const GlobalAdmin = require("../../models/globalAdmin/globalAdmin_model");
const mongoose = require("mongoose");

const getActivityLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter query
    const filterQuery = {};

    // Filter by action if provided
    if (req.query.action && req.query.action !== 'all') {
      filterQuery.action = req.query.action;
    }

    // Filter by user role if provided
    if (req.user.role === 'GlobalAdmin') {
      if (req.query.userRole && req.query.userRole !== 'all') {
        filterQuery.userRole = req.query.userRole;
      }
    } else if (req.user.role === 'Administrator') {
      filterQuery.userRole = { $ne: "GlobalAdmin" };
      if (req.query.userRole && req.query.userRole !== 'all') {
        filterQuery.userRole = { $eq: req.query.userRole, $ne: "GlobalAdmin" };
      }
    }

    // Filter by date range if provided
    if (req.query.date && req.query.date !== 'all') {
      const today = new Date();
      const startDate = new Date();

      switch (req.query.date) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          filterQuery.createdAt = { $gte: startDate };
          break;
        case 'week':
          startDate.setDate(today.getDate() - 7);
          filterQuery.createdAt = { $gte: startDate };
          break;
        case 'month':
          startDate.setMonth(today.getMonth() - 1);
          filterQuery.createdAt = { $gte: startDate };
          break;
        default:
          break;
      }
    }

    // Search by details if search query provided
    if (req.query.search && req.query.search.trim()) {
      filterQuery.details = { $regex: req.query.search.trim(), $options: 'i' };
    }

    // Get total count for pagination
    const total = await ActivityLog.countDocuments(filterQuery);

    // Fetch logs with pagination and sorting
    const logs = await ActivityLog.find(filterQuery)
      .populate('user', 'name email')
      .sort({ Date: -1 })
      .skip(skip)
      .limit(limit);

    // Format logs for frontend
    const formattedLogs = await Promise.all(logs.map(async (log) => {
      let userName = log.user?.name || 'Unknown User';

      if (userName === 'Unknown User') {
        try {
          const admin = await GlobalAdmin.findById(req.user._id).select('name');
          userName = admin?.name || 'Unknown User';
        } catch (error) {
          console.log('Error finding admin user:', error);
        }
      }

      return {
        id: log._id,
        userId: log.user?._id || log.user,
        userName: userName,
        userEmail: log.user?.email || '',
        action: log.action,
        details: log.details,
        userRole: log.userRole,
        ip: log.ip,
        userAgent: log.userAgent,
        status: log.status || 'success', // Default to success if status not present
        date: log.Date.toISOString().split('T')[0], // YYYY-MM-DD format
        time: log.Date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }),
        timestamp: log.Date
      };
    }));
    // console.log(formattedLogs)
    res.status(200).json({
      success: true,
      message: "Activity logs fetched successfully",
      data: {
        logs: formattedLogs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error("Error fetching activity logs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch activity logs",
      error: error.message
    });
  }
};

const getActivityLogStats = async (req, res) => {
  try {
    // Get activity statistics
    const stats = await ActivityLog.aggregate([
      {
        $group: {
          _id: null,
          totalLogs: { $sum: 1 },
          successCount: {
            $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] }
          },
          failedCount: {
            $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] }
          },
          uniqueUsers: { $addToSet: "$userId" }
        }
      }
    ]);

    const actionStats = await ActivityLog.aggregate([
      {
        $group: {
          _id: "$action",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const roleStats = await ActivityLog.aggregate([
      {
        $group: {
          _id: "$userRole",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const result = stats[0] || {
      totalLogs: 0,
      successCount: 0,
      failedCount: 0,
      uniqueUsers: []
    };

    res.status(200).json({
      success: true,
      message: "Activity log stats fetched successfully",
      data: {
        totalLogs: result.totalLogs,
        successCount: result.successCount,
        failedCount: result.failedCount,
        uniqueUsersCount: result.uniqueUsers.length,
        actionBreakdown: actionStats.map(stat => ({
          action: stat._id,
          count: stat.count
        })),
        roleBreakdown: roleStats.map(stat => ({
          role: stat._id,
          count: stat.count
        }))
      }
    });

  } catch (error) {
    console.error("Error fetching activity log stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch activity log stats",
      error: error.message
    });
  }
};

const testDatabase = async (req, res) => {
  try {
    const totalLogs = await ActivityLog.countDocuments();
    const sampleLogs = await ActivityLog.find().limit(5).populate('user', 'name email');

    res.status(200).json({
      success: true,
      message: "Database test successful",
      data: {
        totalLogs,
        sampleLogs: sampleLogs.map(log => ({
          id: log._id,
          user: log.user,
          action: log.action,
          details: log.details,
          userRole: log.userRole,
          status: log.status,
          Date: log.Date
        }))
      }
    });
  } catch (error) {
    console.error("Database test error:", error);
    res.status(500).json({
      success: false,
      message: "Database test failed",
      error: error.message
    });
  }
};

module.exports = {
  getActivityLogs,
  getActivityLogStats,
  testDatabase
};
