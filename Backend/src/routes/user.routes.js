const { getAssignment } = require("../controllers/admin.controller/admin_Assignment")
const { getUserAssignments, getSchedule } = require("../controllers/user_controller/user_assignments")
const { getModule, getAssessment, getSurvey, getLearningPath, markComplete, markCompleteLP, getInProgress, updateStatus, enrolledbyUser, getRecomended, getCompleted, getAssigned, getEnrolledModule, getEnrolledAssessment, getCompletedinLP, getLeaderboard, getLeaderboardinTeam } = require("../controllers/user_controller/user_content")
const { getMessage } = require("../controllers/user_controller/user_Message")
const { getProfile } = require("../controllers/user_controller/user_profile")
const { updateProgress, getUserProgress, getUserProgressById } = require("../controllers/user_controller/user_progress")
const { getContentStats, getUserRewards, getNotification } = require("../controllers/user_controller/user_stats")
const { 
  getAnalytics,
  updateLearningActivity, 
} = require("../controllers/user_controller/user_analytics")
const { enroll } = require("../controllers/user_controller/user_enroll")
const { getCatalog } = require("../controllers/user_controller/user_courseCatalog")
const { updateAssessmentAttempt } = require("../controllers/user_controller/user_assessment")
const { getTickets, createTicket, updateTicketStatus, updateTicket, deleteTicket } = require("../controllers/user_controller/user_Tickets")
const { getTicketStats,getTicketDetails,
  addTicketComment } = require("../controllers/user_controller/user_Tickets")
const { getUserActivity } = require("../controllers/user_controller/user_activity")


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
router.route("/enrolled/getModule/:moduleId").get(getEnrolledModule)
router.route("/getAssessment/:assessmentId").get(getAssessment)
router.route("/enrolled/getAssessment/:assessmentId").get(getEnrolledAssessment)

router.route("/getSurvey/:surveyId").get(getSurvey)
router.route("/getLearningPath/:learningPathId").get(getLearningPath)
router.route("/getInProgress").get(getInProgress)
router.route("/enrolledbyUser").get(enrolledbyUser)
router.route("/updateStatus/:id/:status").post(updateStatus)
router.route("/markComplete/:id").post(markComplete)
router.route("/markComplete/:lpId/:id").post(markCompleteLP)
router.route("/getCatalog").get(getCatalog)
router.route("/enroll/:id").post(enroll)
router.route("/getRecomended").get(getRecomended)
router.route("/getCompleted").get(getCompleted)
router.route("/getAssigned").get(getAssigned)
router.route("/getAssignmentSchedule/:id").get(getSchedule)
router.route("/getCompletedinLP/:lpId").get(getCompletedinLP)
router.route("/getLeaderboard").get(getLeaderboard)
router.route("/getLeaderboardinTeam").get(getLeaderboardinTeam)
router.route("/updateAssessmentAttempt").post(updateAssessmentAttempt)
router.route("/updateWeeklyProgress").post(updateLearningActivity)


/////////STATS?/////////////
router.route("/getStats").get(getContentStats)
router.route("/getUserRewards").get(getUserRewards)

/////////ANALYTICS/////////////
router.route("/analytics").get(getAnalytics)
// router.route("/analytics/completion").get(getCompletionMetrics)
// router.route("/analytics/deadlines").get(getDeadlines)
// router.route("/analytics/time-spent").get(getTimeSpent)
// router.route("/analytics/assessment-performance").get(getAssessmentPerformance)
// router.route("/analytics/gamification").get(getGamificationStats)


///////////NOTIFICATION////////////
router.route("/getNotification").get(getNotification)
/////////TICKETS////////////
router.route("/getTickets").get(getTickets)
router.route("/getTicketStats").get(getTicketStats)
router.route("/createTicket").post(createTicket)
router.route("/updateTicketStatus/:ticketId").put(updateTicketStatus)
router.route("/updateTicket/:ticketId").put(updateTicket)
router.route("/deleteTicket/:ticketId").delete(deleteTicket)
router.route("/getTicketDetails/:ticketId").get(getTicketDetails);
router.route("/addTicketComment/:ticketId").post(addTicketComment);


router.route("/getActivity").get(getUserActivity)

module.exports = router;