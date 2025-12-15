const express = require("express");
const router = express.Router();
const { getActivityLogs, getActivityLogStats } = require("../controllers/globalAdmin.controller/globalAdmin_activityLogs");
// const { verifyToken } = require("../middleware/authMiddleware");

// Get activity logs with filtering and pagination
router.get("/activity-logs", getActivityLogs);

// Get activity log statistics
router.get("/activity-logs/stats", getActivityLogStats);

module.exports = router;
