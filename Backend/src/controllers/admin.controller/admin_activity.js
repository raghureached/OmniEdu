
const AdminActivity = require("../../models/organizationActivity_model");

const logAdminActivity = async (req, action, details, status = "success") => {
  try {
    await AdminActivity.create({
      admin: req.user?._id,
      action,
      details,
      ip: req.headers["x-forwarded-for"]?.split(",")[0] || req.ip,
      userAgent: req.headers["user-agent"],
      status,
    });
  } catch (err) {
    console.error("Failed to log admin activity:", err.message);
  }
};

module.exports = logAdminActivity;
