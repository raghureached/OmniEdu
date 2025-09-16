
const userActivity = require("../../models/userActivity_model");

const logUserActivity = async (req, action, details, status = "success") => {
  try {
    await userActivity.create({
      user: req.user?._id,
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

module.exports = logUserActivity;
