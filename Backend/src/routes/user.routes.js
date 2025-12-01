const { getAssignment } = require("../controllers/admin.controller/admin_Assignment")
const { getUserAssignments } = require("../controllers/user_controller/user_assignments")
const { getModule, getAssessment, getSurvey, getLearningPath, markComplete, getInProgress, updateStatus, enrolledbyUser, getCatalog } = require("../controllers/user_controller/user_content")
const { getMessage } = require("../controllers/user_controller/user_Message")
const { getProfile } = require("../controllers/user_controller/user_profile")
const { updateProgress, getUserProgress, getUserProgressById } = require("../controllers/user_controller/user_progress")
const { getContentStats, getUserRewards } = require("../controllers/user_controller/user_stats")

const router = require("express").Router()


router.route("/userProfile").get(getProfile)

/////////Assignments////////
router.route("/getUserAssignments").get(getUserAssignments)
router.route("/getAssignment/:id").get(getAssignment)


////////Progress//////////
router.route("/updateProgress").post(updateProgress)
router.route("/getUserProgress").get(getUserProgress)
router.route("/getUserProgress/:id").get(getUserProgressById)

////////Message//////////
router.route("/getMessages").get(getMessage)



////////CONTENT//////////

router.route("/getModule/:moduleId").get(getModule)
router.route("/getAssessment/:assessmentId").get(getAssessment)
router.route("/getSurvey/:surveyId").get(getSurvey)
router.route("/getLearningPath/:learningPathId").get(getLearningPath)
router.route("/getInProgress").get(getInProgress)
router.route("/enrolledbyUser").get(enrolledbyUser)
router.route("/updateStatus/:id/:status").post(updateStatus)
router.route("/markComplete/:id").post(markComplete)
router.route("/getCatalog").get(getCatalog)





/////////STATS?/////////////
router.route("/getStats").get(getContentStats)
router.route("/getUserRewards").get(getUserRewards)

module.exports = router