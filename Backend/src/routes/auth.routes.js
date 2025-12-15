const router = require("express").Router();
const { login,logout,checkAuth, changePassword, googleAuth, googleAuthCallback } = require("../controllers/auth_controller");
const { authenticate, authorize } = require("../middleware/auth_middleware");

router.route('/login').post(login)
router.route('/logout').post(authenticate,logout)
router.route('/checkAuth').post(authenticate,checkAuth)
router.route('/changePassword').post(changePassword)

// Google OAuth routes
router.get('/google', googleAuth);
router.get('/google/callback', googleAuthCallback);



module.exports = router;