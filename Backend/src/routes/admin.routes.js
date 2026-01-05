//const {createAssessment, uploadAssessmentCSV, getQuestions, getAssessmentById, getAssessments, editAssessment, deleteAssessment, editQuestion, deleteQuestion, searchAssessment, getQuestionsRandom } = require("../controllers/admin.controller/admin_Assessment");
const {addUser,editUser,deleteUser,getUsers,getUserbyId, bulkDeleteUsers, bulkEditUsers, exportUsers,} = require("../controllers/admin.controller/admin_User");
const {addModule,editModule,deleteModule,previewModule,searchModules, getModules, bulkDelete, getModuleById} = require("../controllers/admin.controller/admin_Module");
const { addOrgRole, editOrgRole, deleteOrgRole, getOrgRoles } = require("../controllers/admin.controller/admin_Role");
const {upload,uploadContent, uploadAssessment, uploadQuestionFile } = require("../middleware/multer_middleware");
const { uploadToCloudinary, uploadMultipleToCloudinary } = require("../utils/uploadOnCloud");
const Department = require("../models/departments_model");
const { addGroup, getGroups, editGroup, deleteGroup, deleteGroups, deactivateGroups } = require("../controllers/admin.controller/admin_Groups");
const { addLearningPath, getLearningPaths, getContentsOfLearningPath, editLearningPath, deleteLearningPath, getLearningPathById } = require("../controllers/admin.controller/admin_LearningPath");
//const { createSurvey, deleteSurvey, getSurveys, editSurvey } = require("../controllers/admin.controller/admin_Surveys");
const { setMessage, editMessage, deleteMessage, getMessage } = require("../controllers/admin.controller/admin_message");
const { getGlobalAdminMessages } = require("../controllers/admin.controller/admin_globalMessage");
const { getActivities } = require("../controllers/admin.controller/admin_activity");
const { addUserId } = require("../middleware/dummyAuth");
const { getProfile } = require("../controllers/admin.controller/admin_profile");
const { createAssignment, getAssignments, editAssignment, deleteAssignment, getAssignment } = require("../controllers/admin.controller/admin_Assignment");
const {
  createAssessment,
  editAssessment,
  deleteAssessment,
  getAssessments,
  getAssessmentById,
  getQuestions,
  getQuestionsRandom,
  editQuestion,
  deleteQuestion,
  uploadAssessmentCSV,
  fileUploadMiddleware,
  fileUploadHandler,
} = require("../controllers/admin.controller/admin_Assessments");
  const {createSurvey, editSurvey, deleteSurvey, getSurveys, getSurvey} = require("../controllers/admin.controller/admin_Surveys");
const { enhanceText, enhanceSurvey, enhanceAssessment, createQuestions } = require("../controllers/admin.controller/admin_AI");
const { generateSurveyWithSections } = require("../controllers/admin.controller/admin_AI");
const {addTeam,editTeam,addSubTeam,editSubTeam,deleteSubTeam,addUsersToGroup} = require("../controllers/admin.controller/admin_Groups");
const { getOrganizationCreationDate, getCourseDistribution, getUsersData, calculateUsageTrend, getAdoption, getTeams, getSubteams, getEngagementHeatmap, getAtRiskLearners, getContentAnalytics, getUserAnalytics, getAssessmentAnalytics, getSurveyAnalytics, getLearningPathAnalytics, getCoursePerformanceInsights, getContentCounts, getContentCountsAll } = require("../controllers/admin.controller/admin_analytics");
const { createAdminTicket, getAdminTickets, updateAdminTicketStatus, updateAdminTicket, deleteAdminTicket , getTicketDetails,
  addTicketComment, getTicketStats} = require("../controllers/admin.controller/admin_Tickets");
const { getPermissions } = require("../controllers/permissions.controller");
const {addDocument,editDocument,deleteDocument,previewDocument,searchDocuments, getDocuments, documentbulkDelete, getDocumentById} = require("../controllers/admin.controller/admin_Document");
const { gradeSubmission, getSubmissions } = require("../controllers/admin.controller/admin_Submissions");


const router = require("express").Router();

// Users
router.route('/addUser').post(addUser)
router.route('/editUser/:id').put(editUser)
router.route('/deleteUser/:id').delete(deleteUser)
router.route('/getUsers').get(getUsers)
router.route('/getUser/:id').get(getUserbyId)
router.route('/bulkDeleteUsers').delete(bulkDeleteUsers)
router.route('/bulkEditUsers').put(bulkEditUsers)
router.route('/exportUsers').get(exportUsers)

/////ROLES////////
router.route('/addOrgRole').post(addOrgRole)
router.route('/editOrgRole/:id').put(editOrgRole)
router.route('/deleteOrgRole/:id').delete(deleteOrgRole)
router.route('/getOrgRoles').get(getOrgRoles)

//////Assessment////////


router.route('/createAssessment').post(upload.single('thumbnail'),uploadToCloudinary('assessments'),createAssessment)
router.route('/uploadAssessmentCSV').post(uploadAssessmentCSV)
router.route('/editAssessment/:id').put(upload.single('thumbnail'), uploadToCloudinary('assessments'), editAssessment)
router.route('/deleteAssessment/:id').delete(deleteAssessment)
router.route('/getAssessments').get(getAssessments)
router.route('/getAssessmentById/:id').get(getAssessmentById)
router.route('/getQuestions/:id').get(getQuestions)
router.route('/getQuestionsRandom/:id').get(getQuestionsRandom)
router.route('/editQuestion/:id').put(editQuestion)
router.route('/deleteQuestion/:id').delete(deleteQuestion)
router.post('/uploadFile', uploadQuestionFile.single('file'),uploadToCloudinary('questions'), fileUploadHandler);

////Documents
router.route('/createDocument').post(uploadContent.fields([{name:'primaryFile',maxCount:1},{name:'additionalFile',maxCount:1},{name:'thumbnail',maxCount:1}]),uploadMultipleToCloudinary,addDocument)
router.route('/editDocument/:id').put(uploadContent.fields([{name:'primaryFile',maxCount:1},{name:'additionalFile',maxCount:1},{name:'thumbnail',maxCount:1}]),uploadMultipleToCloudinary,editDocument)
router.route('/deleteDocument/:id').delete(deleteDocument)
router.route('/getDocuments').get(getDocuments)
router.route('/bulkDeleteDocument').delete(documentbulkDelete)
router.route('/getDocumentById/:id').get(getDocumentById)

//////Module////////

router.route('/createModule').post(uploadContent.fields([{name:'primaryFile',maxCount:1},{name:'additionalFile',maxCount:1},{name:'thumbnail',maxCount:1}]),uploadMultipleToCloudinary,addModule)
router.route('/editModule/:id').put(uploadContent.fields([{name:'primaryFile',maxCount:1},{name:'additionalFile',maxCount:1},{name:'thumbnail',maxCount:1}]),uploadMultipleToCloudinary,editModule)
router.route('/deleteModule/:id').delete(deleteModule)
router.route('/getModules').get(getModules)
router.route('/bulkDeleteModule').delete(bulkDelete)
router.route('/getModuleById/:id').get(getModuleById)

//////////////Surveys////////////
router.route('/createSurvey').post(createSurvey)
router.route('/editSurvey/:id').put(editSurvey)
router.route('/deleteSurvey/:id').delete(deleteSurvey)
router.route('/getSurveys').get(getSurveys)
router.route('/getSurvey/:id').get(getSurvey)

//////Groups////////
router.route('/addGroup').post(addGroup)
router.route('/getGroups').get(getGroups)
router.route('/editGroup/:id').put(editGroup)
router.route('/deleteGroup/:id').delete(deleteGroup)
router.route('/deleteGroups').delete(deleteGroups)
router.route('/deactivateGroups').post(deactivateGroups)
router.route('/addUsersToGroup').post(addUsersToGroup)

///////Team//////////
router.route('/addTeam').post(addTeam)
router.route('/addSubTeam').post(addSubTeam)
router.route('/editTeam/:id').put(editTeam)
router.route('/editSubTeam/:id').put(editSubTeam)
router.route('/deleteSubTeam/:id').delete(deleteSubTeam)


//////Learning Path////////

router.route('/addLearningPath').post(upload.single('thumbnail'),uploadToCloudinary('learningPaths'),addLearningPath)
router.route('/getLearningPaths').get(getLearningPaths)
router.route('/getLearningPathContents/:id').get(getContentsOfLearningPath)
router.route('/editLearningPath/:id').put(upload.single('thumbnail'),uploadToCloudinary('learningPaths'),editLearningPath)
router.route('/deleteLearningPath/:id').delete(deleteLearningPath)
router.route('/getLearningPathById/:id').get(getLearningPathById)




////////MessageForUser////
router.route('/setMessage').post(setMessage)
router.route('/editMessage/:id').put(editMessage)
router.route('/deleteMessage/:id').delete(deleteMessage)
router.route('/getMessages').get(getMessage)
// Global Admin -> Admin message view (admin-safe endpoint)
router.route('/getGlobalAdminMessages').get(getGlobalAdminMessages)

//////Assignment////////
router.route('/createAssignment').post(createAssignment)
router.route('/getAssignments').get(getAssignments)
router.route('/getAssignment/:id').get(getAssignment)
router.route('/editAssignment/:id').put(editAssignment)
router.route('/deleteAssignment/:id').delete(deleteAssignment)

/////Activity Log /////
// router.route('/getActivities').get(getActivities)

//////Profile//////
router.route('/getProfile').get(getProfile)

/////Analytics//////
router.route('/analytics/getOrganizationCreationDate').get(getOrganizationCreationDate)
router.route('/analytics/getCourseDistribution').get(getCourseDistribution)
router.route('/analytics/getUserData').get(getUsersData)
router.route('/analytics/getUsageTrend').get(calculateUsageTrend)
router.route('/analytics/getAdoption').get(getAdoption)
router.route('/analytics/getTeams').get(getTeams)
router.route('/analytics/getSubteams').get(getSubteams)
router.route('/analytics/getEngagementHeatmap').get(getEngagementHeatmap)
router.route('/analytics/getAtRiskLearners').get(getAtRiskLearners)
router.route('/analytics/getCoursePerformanceInsights').get(getCoursePerformanceInsights)
router.route('/analytics/content/:contentId').get(getContentAnalytics);
router.route('/analytics/user/:userId').get(getUserAnalytics);
router.route('/analytics/assessment/:assessmentId').get(getAssessmentAnalytics);
router.route('/analytics/survey/:surveyId').get(getSurveyAnalytics);
router.route('/analytics/learningPath/:learningPathId').get(getLearningPathAnalytics);
router.route('/analytics/content-counts').get(getContentCounts);
router.route('/analytics/content-counts-all').get(getContentCountsAll);
// AI
router.route('/enhanceText').post(enhanceText)
// router.route('/generateImage').post(generateImage)
router.route('/enhanceSurvey').post(enhanceSurvey)
router.route('/enhanceAssessment').post(enhanceAssessment)
router.route('/createQuestions').post(createQuestions)
router.route('/createSurveyQuestions').post(generateSurveyWithSections)

// SUPPORT TICKETS (Admins → Admin Tickets)


router.route('/createTicket').post(createAdminTicket);
router.route('/getTickets').get(getAdminTickets);
router.route('/getTicketStats').get(getTicketStats);
router.route('/updateTicketStatus/:ticketId').put(updateAdminTicketStatus);
router.route('/updateTicket/:ticketId').put(updateAdminTicket);
router.route('/deleteTicket/:ticketId').delete(deleteAdminTicket);
router.route("/getTicketDetails/:ticketId").get(getTicketDetails);
router.route("/addTicketComment/:ticketId").post(addTicketComment);




router.route('/gradeSubmission').post(gradeSubmission)
router.route('/getSubmissions/:moduleId').get(getSubmissions) 
module.exports = router;