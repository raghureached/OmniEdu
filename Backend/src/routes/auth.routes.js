const router = require("express").Router();
const { login,logout,checkAuth, changePassword } = require("../controllers/auth_controller");
const { authenticate, authorize } = require("../middleware/auth_middleware");

router.route('/login').post(login)
router.route('/logout').post(authenticate,logout)
router.route('/checkAuth').post(authenticate,checkAuth)
router.route('/changePassword').post(changePassword)
module.exports = router;