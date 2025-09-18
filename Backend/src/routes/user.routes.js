const { getAssignment } = require("../controllers/admin.controller/admin_Assignment")
const { getUserAssignments } = require("../controllers/user_controller/user_assignments")
const { getMessage } = require("../controllers/user_controller/user_Message")
const { getProfile } = require("../controllers/user_controller/user_profile")
const { updateProgress, getUserProgress, getUserProgressById } = require("../controllers/user_controller/user_progress")
const { addUserId } = require("../middleware/dummyAuth")

const router = require("express").Router()


router.route("/userProfile").get(addUserId,getProfile)

/////////Assignments////////
router.route("/getUserAssignments").get(addUserId,getUserAssignments)
router.route("/getAssignment/:id").get(addUserId,getAssignment)


////////Progress//////////
router.route("/updateProgress").post(addUserId,updateProgress)
router.route("/getUserProgress").get(addUserId,getUserProgress)
router.route("/getUserProgress/:id").get(addUserId,getUserProgressById)

////////Message//////////
router.route("/getMessage").get(addUserId,getMessage)

module.exports = router