const { addGlobalAdmin } = require("../controllers/dev_controller");

const router = require("express").Router();

router.post("/addGlobalAdmin",addGlobalAdmin)

module.exports = router
