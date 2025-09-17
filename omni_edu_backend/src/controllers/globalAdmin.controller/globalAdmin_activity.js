const GlobalAdminActivity = require("../../models/globalAdmin_activity_model");


const logGlobalAdminActivity = async (req, action, actionOn, details, status = "success") => {
    try {
        await GlobalAdminActivity.create({
            admin: req.user?._id,
            action,
            actionOn,
            details,
            ip: req.headers["x-forwarded-for"]?.split(",")[0] || req.ip,
            userAgent: req.headers["user-agent"],
            status,
        });
    } catch (err) {
        console.error("Failed to log global admin activity:", err.message);
    }
};


const getGlobalAdminActivity = async (req, res) => {
    try {
      const { actionOn, dateRange, search } = req.query;
      const filters = {};
      const page = parseInt(req.query.page) || 1;
      const limit = 50;
      const skip = (page - 1) * limit;
      if (actionOn) {
        filters.actionOn = actionOn;
      }
  
      if (dateRange) {
        // handle dateRange as comma-separated or array string
        let range = dateRange;
        if (typeof dateRange === "string") {
          try {
            // if query is sent as ?dateRange[]=2025-09-01&dateRange[]=2025-09-15, 
            // Express parses it into array automatically
            range = JSON.parse(dateRange);
          } catch {
            range = dateRange.split(",");
          }
        }
  
        if (Array.isArray(range) && range.length === 2) {
          filters.createdAt = {
            $gte: new Date(range[0]),
            $lte: new Date(range[1]),
          };
        }
      }
  
      if (search) {
        filters.details = { $regex: search, $options: "i" };
      }
  
      const activities = await GlobalAdminActivity.find(filters)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
      const total = await GlobalAdminActivity.countDocuments(filters);
  
      return res.status(200).json({
        isSuccess: true,
        message: "Activities fetched successfully",
        data: activities,
        pagination: {
          totalPages:total,
          currentPage:page,
          limit,
                    totalPages: Math.ceil(total / limit),
          hasNextPage: page * limit < total,
        },
      });
    } catch (error) {
      return res.status(500).json({
        isSuccess: false,
        message: "Failed to fetch activities",
        error: error.message,
      });
    }
  };
  

module.exports = {
    logGlobalAdminActivity,
    getGlobalAdminActivity
}