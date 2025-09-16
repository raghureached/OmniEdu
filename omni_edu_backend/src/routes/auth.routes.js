const router = require("express").Router();
const { login,logout } = require("../controllers/auth_controller");
const { authenticate, authorize } = require("../middleware/auth_middleware");

router.route('/login').post(login)
router.route('/logout').post(authenticate,logout)

module.exports = router;