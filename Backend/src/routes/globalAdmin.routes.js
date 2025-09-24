const {addOrganization, editOrganization, deleteOrganization, getOrganizations, getOrganizationById, deleteOrganizations} = require("../controllers/globalAdmin.controller/globalAdmin_organization");
const {addRole, editRole, deleteRole, getRoles, addPermissions, getPermissions, createRole, editOrgRole} = require("../controllers/globalAdmin.controller/globalAdmin_Roles");
const {addContent, editContent, deleteContent, getContent, getContentById} = require("../controllers/globalAdmin.controller/globalAdmin_Module");
const {createSurvey, editSurvey, deleteSurvey, getSurveys, getSurvey} = require("../controllers/globalAdmin.controller/globalAdmin_SurveysOld");
const {upload,uploadContent, uploadAssessment} = require("../middleware/multer_middleware");
const { uploadMultipleToCloudinary, uploadToCloudinary } = require("../utils/uploadOnCloud");
const { setMessage, editMessage, deleteMessage, getMessage } = require("../controllers/globalAdmin.controller/globalAdmin_message");
const { getPlans } = require("../controllers/globalAdmin.controller/globalAdmin_plans");
const { createAssignment, fetchAssignments } = require("../controllers/globalAdmin.controller/globalAdmin_Assignmnet");
const { getGlobalAdminActivity } = require("../controllers/globalAdmin.controller/globalAdmin_activity");
const { getGlobalProfile, changeGlobalPassword } = require("../controllers/globalAdmin.controller/globalAdmin_profile");
const { userDashBoardSettings, getUserDashBoardSettings, updateUserDashBoardConfig, getUserDashBoardConfig, getUserDashBoardPermissions } = require("../controllers/globalAdmin.controller/globalAdmin_userDashBoard");
const { updateAdminDashboardConfig, getAdminDashboardConfig, getAdminDashboardPermissions } = require("../controllers/globalAdmin.controller/globalAdmin_adminDashboard");
const { createAssessment, editAssessment, deleteAssessment, getAssessments, getAssessmentById, getQuestions, getQuestionsRandom, editQuestion, deleteQuestion, uploadAssessmentCSV } = require("../controllers/globalAdmin.controller/globalAdmin_Assessments");
// const csvStream = require("../utils/csvParser");

const router = require("express").Router();

////////////Organization////////////

router.route('/addOrganization').post(upload.fields([{name:'logo',maxCount:1},{name:'invoice',maxCount:1},{name:'receipt',maxCount:1},{name:'document',maxCount:1},{name:'document3',maxCount:1},{name:'document4',maxCount:1}]),uploadMultipleToCloudinary,addOrganization)
router.route('/editOrganization/:id').put(upload.fields([{name:'logo',maxCount:1},{name:'invoice',maxCount:1},{name:'receipt',maxCount:1},{name:'document',maxCount:1},{name:'document3',maxCount:1},{name:'document4',maxCount:1}]),uploadMultipleToCloudinary,editOrganization)
router.route('/deleteOrganization/:id').delete(deleteOrganization)
router.route('/deleteOrganizations').delete(deleteOrganizations)
router.route('/getOrganizations').get(getOrganizations)
router.route('/getOrganizationById/:id').get(getOrganizationById)
// router.route('/readCSV').get(readCSV)

//////////////Global Roles////////////

router.route('/addRole').post(addRole)
router.route('/editRole/:id').put(editRole)
router.route('/editOrgRole/:orgId').put(editOrgRole)
router.route('/deleteRole/:id').delete(deleteRole)
router.route('/getRoles/:id').get(getRoles)
router.route('/addPermissions').post(addPermissions)
router.route('/getPermissions').get(getPermissions)
//////////////Global Content////////////

router.route('/addContent').post(uploadContent.single('file'),uploadToCloudinary("globalContent"),addContent)
router.route('/getContent').get(getContent)
router.route('/getContentById/:id').get(getContentById)
//Some changes
router.route('/editContent/:id').put(uploadContent.single('file'),uploadToCloudinary("globalContent"),editContent)
router.route('/deleteContent/:id').delete(deleteContent)

/////////////Global Assesments////////////

router.route('/createAssessment').post(createAssessment)
router.route('/uploadAssessmentCSV').post(uploadAssessment.single('file'),uploadAssessmentCSV)
router.route('/editAssessment/:id').put(editAssessment)
router.route('/deleteAssessment/:id').delete(deleteAssessment)
router.route('/getAssessments').get(getAssessments)
router.route('/getAssessmentById/:id').get(getAssessmentById)
router.route('/getQuestions/:id').get(getQuestions)
router.route('/getQuestionsRandom/:id').get(getQuestionsRandom)
router.route('/editQuestion/:id').put(editQuestion)
router.route('/deleteQuestion/:id').delete(deleteQuestion)


//////////////Global Surveys////////////

router.route('/createSurvey').post(createSurvey)
router.route('/editSurvey/:id').put(editSurvey)
router.route('/deleteSurvey/:id').delete(deleteSurvey)
router.route('/getSurveys').get(getSurveys)
router.route('/getSurvey/:id').get(getSurvey)
// router.route('/viewResponses/:id').get(viewResponses)


//////////MessagesforAdmin//////////

router.route('/setMessage').post(setMessage)
router.route('/editMessage/:id').put(editMessage)
router.route('/deleteMessage/:id').delete(deleteMessage)
router.route('/getMessage').post(getMessage)

//////////////Plans////////////

router.route('/getPlans').get(getPlans)



///////////Assignments///////////
router.route('/createAssignment').post(createAssignment)
router.route('/fetchAssignments').get(fetchAssignments)



//////Activity Log//////
router.route('/getActivityLog').get(getGlobalAdminActivity)


router.route('/getGlobalProfile').get(getGlobalProfile)
router.route('/changeGlobalPassword').put(changeGlobalPassword)



//////////Admin Dashboard//////////
router.route('/updateAdminDashboardConfig/:id').put(updateAdminDashboardConfig)
router.route('/getAdminDashboardConfig/:id').get(getAdminDashboardConfig)
router.route('/getAdminDashboardPermissions').get(getAdminDashboardPermissions)

///////UserDashBoard Settings/////

router.route('/updateUserDashBoardConfig/:id').put(updateUserDashBoardConfig)
router.route('/getUserDashBoardConfig/:id').get(getUserDashBoardConfig)
router.route('/getUserDashBoardPermissions').get(getUserDashBoardPermissions)


module.exports = router;
