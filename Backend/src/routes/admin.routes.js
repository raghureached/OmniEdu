//const {createAssessment, uploadAssessmentCSV, getQuestions, getAssessmentById, getAssessments, editAssessment, deleteAssessment, editQuestion, deleteQuestion, searchAssessment, getQuestionsRandom } = require("../controllers/admin.controller/admin_Assessment");
const {addUser,editUser,deleteUser,getUsers,getUserbyId, bulkDeleteUsers, bulkEditUsers, exportUsers,} = require("../controllers/admin.controller/admin_User");
const {addModule,editModule,deleteModule,previewModule,searchModules, getModules, bulkDelete} = require("../controllers/admin.controller/admin_Module");
const { addOrgRole, editOrgRole, deleteOrgRole, getOrgRoles } = require("../controllers/admin.controller/admin_Role");
const {upload,uploadContent, uploadAssessment, uploadQuestionFile } = require("../middleware/multer_middleware");
const { uploadToCloudinary, uploadMultipleToCloudinary } = require("../utils/uploadOnCloud");
const Department = require("../models/departments_model");
const { addGroup, getGroups, editGroup, deleteGroup } = require("../controllers/admin.controller/admin_Groups");
const { addLearningPath, getLearningPaths, getContentsOfLearningPath, editLearningPath, deleteLearningPath } = require("../controllers/admin.controller/admin_LearningPath");
//const { createSurvey, deleteSurvey, getSurveys, editSurvey } = require("../controllers/admin.controller/admin_Surveys");
const { setMessage, editMessage, deleteMessage, getMessage } = require("../controllers/admin.controller/admin_message");
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
  
const router = require("express").Router();

router.route('/addUser').post(addUserId,addUser)
router.route('/editUser/:id').put(addUserId,editUser)
router.route('/deleteUser/:id').delete(addUserId,deleteUser)
router.route('/getUsers').get(addUserId,getUsers)
router.route('/getUser/:id').get(addUserId,getUserbyId)
router.route('/bulkDeleteUsers').delete(addUserId,bulkDeleteUsers)
router.route('/bulkEditUsers').put(addUserId,bulkEditUsers)
router.route('/exportUsers').get(addUserId,exportUsers)


/////ROLES////////

router.route('/addOrgRole').post(addUserId,addOrgRole)
router.route('/editOrgRole/:id').put(addUserId,editOrgRole)
router.route('/deleteOrgRole/:id').delete(addUserId,deleteOrgRole)
router.route('/getOrgRoles').get(addUserId,getOrgRoles)

//////Assessment////////


router.route('/createAssessment').post(upload.single('thumbnail'),uploadToCloudinary('assessments'),createAssessment)
router.route('/uploadAssessmentCSV').post(uploadAssessmentCSV)
router.route('/editAssessment/:id').put(editAssessment)
router.route('/deleteAssessment/:id').delete(deleteAssessment)
router.route('/getAssessments').get(getAssessments)
router.route('/getAssessmentById/:id').get(getAssessmentById)
router.route('/getQuestions/:id').get(getQuestions)
router.route('/getQuestionsRandom/:id').get(getQuestionsRandom)
router.route('/editQuestion/:id').put(editQuestion)
router.route('/deleteQuestion/:id').delete(deleteQuestion)
router.post('/uploadFile', uploadQuestionFile.single('file'),uploadToCloudinary('questions'), fileUploadHandler);

//////Module////////

router.route('/createModule').post(uploadContent.fields([{name:'primaryFile',maxCount:1},{name:'additionalFile',maxCount:1},{name:'thumbnail',maxCount:1}]),uploadMultipleToCloudinary,addModule)
router.route('/editModule/:id').put(uploadContent.fields([{name:'primaryFile',maxCount:1},{name:'additionalFile',maxCount:1},{name:'thumbnail',maxCount:1}]),uploadMultipleToCloudinary,editModule)
router.route('/deleteModule/:id').delete(deleteModule)
router.route('/getModules').get(getModules)
router.route('/bulkDeleteModule').delete(bulkDelete)  

//////////////Global Surveys////////////

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

//////Learning Path////////

router.route('/addLearningPath').post(addLearningPath)
router.route('/getLearningPaths').get(addUserId,getLearningPaths)
router.route('/getLearningPathContents/:id').get(addUserId,getContentsOfLearningPath)
router.route('/editLearningPath/:id').put(addUserId,editLearningPath)
router.route('/deleteLearningPath/:id').delete(addUserId,deleteLearningPath)




////////MessageForUser////
router.route('/setMessage').post(setMessage)
router.route('/editMessage/:id').put(editMessage)
router.route('/deleteMessage/:id').delete(deleteMessage)
router.route('/getMessages').get(getMessage)
//////Assignment////////
router.route('/createAssignment').post(addUserId,createAssignment)
router.route('/getAssignments').get(addUserId,getAssignments)
router.route('/getAssignment/:id').get(addUserId,getAssignment)
router.route('/editAssignment/:id').put(addUserId,editAssignment)
router.route('/deleteAssignment/:id').delete(addUserId,deleteAssignment)

/////Activity Log /////

// router.route('/getActivities').get(getActivities)


//////Profile//////
router.route('/getProfile').get(addUserId,getProfile)


module.exports = router;