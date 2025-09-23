const { addGlobalAdmin, addPlans, addAdminDashboardConfig, addUserDashboardConfig } = require("../controllers/dev_controller");

const router = require("express").Router();

router.post("/addGlobalAdmin",addGlobalAdmin)
router.post("/addPlans",addPlans)
router.post("/addAdminDashboardConfig",addAdminDashboardConfig)
router.post("/addUserDashboardConfig",addUserDashboardConfig)


module.exports = router
