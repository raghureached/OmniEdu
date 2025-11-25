const { getAssignment } = require("../controllers/admin.controller/admin_Assignment")
const { getUserAssignments } = require("../controllers/user_controller/user_assignments")
const { getModule, getAssessment, getSurvey, getLearningPath } = require("../controllers/user_controller/user_content")
const { getMessage } = require("../controllers/user_controller/user_Message")
const { getProfile } = require("../controllers/user_controller/user_profile")
const { updateProgress, getUserProgress, getUserProgressById } = require("../controllers/user_controller/user_progress")

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

module.exports = router