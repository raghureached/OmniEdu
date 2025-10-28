//const {createAssessment, uploadAssessmentCSV, getQuestions, getAssessmentById, getAssessments, editAssessment, deleteAssessment, editQuestion, deleteQuestion, searchAssessment, getQuestionsRandom } = require("../controllers/admin.controller/admin_Assessment");
const {addUser,editUser,deleteUser,getUsers,getUserbyId, bulkDeleteUsers, bulkEditUsers, exportUsers,} = require("../controllers/admin.controller/admin_User");
const {addModule,editModule,deleteModule,previewModule,searchModules, getModules, bulkDelete, getModuleById} = require("../controllers/admin.controller/admin_Module");
const { addOrgRole, editOrgRole, deleteOrgRole, getOrgRoles } = require("../controllers/admin.controller/admin_Role");
const {upload,uploadContent, uploadAssessment, uploadQuestionFile } = require("../middleware/multer_middleware");
const { uploadToCloudinary, uploadMultipleToCloudinary } = require("../utils/uploadOnCloud");
const Department = require("../models/departments_model");
const { addGroup, getGroups, editGroup, deleteGroup } = require("../controllers/admin.controller/admin_Groups");
const { addLearningPath, getLearningPaths, getContentsOfLearningPath, editLearningPath, deleteLearningPath, getLearningPathById } = require("../controllers/admin.controller/admin_LearningPath");
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

//////Module////////

router.route('/createModule').post(uploadContent.fields([{name:'primaryFile',maxCount:1},{name:'additionalFile',maxCount:1},{name:'thumbnail',maxCount:1}]),uploadMultipleToCloudinary,addModule)
router.route('/editModule/:id').put(uploadContent.fields([{name:'primaryFile',maxCount:1},{name:'additionalFile',maxCount:1},{name:'thumbnail',maxCount:1}]),uploadMultipleToCloudinary,editModule)
router.route('/deleteModule/:id').delete(deleteModule)
router.route('/getModules').get(getModules)
router.route('/bulkDeleteModule').delete(bulkDelete) 
router.route('/getModuleById/:id').get(getModuleById) 

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


module.exports = router;