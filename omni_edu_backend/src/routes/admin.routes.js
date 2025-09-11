const {createAssessment, uploadAssessmentCSV, getQuestions, getAssessmentById, getAssessments, editAssessment, deleteAssessment, editQuestion, deleteQuestion, searchAssessment, getQuestionsRandom } = require("../controllers/admin.controller/admin_Assessment");
const {addUser,editUser,deleteUser,getUsers,getUserbyId, bulkDeleteUsers, bulkEditUsers, exportUsers,} = require("../controllers/admin.controller/admin_User");
const {addModule,editModule,deleteModule,previewModule,searchModules} = require("../controllers/admin.controller/admin_Module");
const { addOrgRole, editOrgRole, deleteOrgRole, getOrgRoles } = require("../controllers/admin.controller/admin_Role");
const { uploadAssessment, uploadContent } = require("../middleware/multer_middleware");
const { uploadToCloudinary, uploadMultipleToCloudinary } = require("../utils/uploadOnCloud");
const Department = require("../models/departments_model");
const { addGroup, getGroups, editGroup, deleteGroup } = require("../controllers/admin.controller/admin_Groups");
const { addLearningPath, getLearningPaths, getContentsOfLearningPath, editLearningPath, deleteLearningPath } = require("../controllers/admin.controller/admin_LearningPath");
const { createSurvey, deleteSurvey, getSurveys, editSurvey } = require("../controllers/admin.controller/admin_Surveys");
const { setMessage, editMessage, deleteMessage } = require("../controllers/admin.controller/admin_message");
const { getActivities } = require("../controllers/admin.controller/admin_activity");
const { addUserId } = require("../middleware/dummyAuth");
const { getProfile } = require("../controllers/admin.controller/admin_profile");
const { createAssignment, getAssignments, editAssignment, deleteAssignment, getAssignment } = require("../controllers/admin.controller/admin_Assignment");

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

router.route('/createAssessment').post(addUserId,createAssessment)
router.route('/createAssessmentCSV').post(addUserId,uploadAssessment.single('file'),uploadAssessmentCSV)
router.route('/getAssessments').get(addUserId,getAssessments)
router.route('/getQuestions/:id').get(addUserId,getQuestions)
router.route('/getQuestionsRandom/:id').get(addUserId,getQuestionsRandom)
router.route('/getAssessmentById/:id').get(addUserId,getAssessmentById)
router.route('/editAssessment/:id').put(addUserId,editAssessment)
router.route('/deleteAssessment/:id').delete(addUserId,deleteAssessment)
router.route('/editQuestion/:id').put(addUserId,editQuestion)
router.route('/deleteQuestion/:id').delete(addUserId,deleteQuestion)
router.route('/searchAssessment').get(addUserId,searchAssessment)

//////Module////////

router.route('/createModule').post(addUserId,uploadContent.single('file'),uploadToCloudinary("modules"),addModule)
router.route('/editModule/:id').put(addUserId,uploadContent.single('file'),uploadToCloudinary("modules"),editModule)
router.route('/deleteModule/:id').delete(addUserId,deleteModule)
router.route('/previewModule/:id').get(addUserId,previewModule)
router.route('/searchModules').get(addUserId,searchModules)   

//////Groups////////

router.route('/addGroup').post(addUserId,addGroup)
router.route('/getGroups').get(addUserId,getGroups)
router.route('/editGroup/:id').put(addUserId,editGroup)
router.route('/deleteGroup/:id').delete(addUserId,deleteGroup)

//////Learning Path////////

router.route('/addLearningPath').post(addUserId,addLearningPath)
router.route('/getLearningPaths').get(addUserId,getLearningPaths)
router.route('/getLearningPathContents/:id').get(addUserId,getContentsOfLearningPath)
router.route('/editLearningPath/:id').put(addUserId,editLearningPath)
router.route('/deleteLearningPath/:id').delete(addUserId,deleteLearningPath)


//////Surveys////////
router.route('/createSurvey').post(addUserId,createSurvey)
router.route('/deleteSurvey/:id').delete(addUserId,deleteSurvey)
router.route('/getSurveys').get(addUserId,getSurveys)
router.route('/editSurvey/:id').put(addUserId,editSurvey)


////////MessageForUser////
router.route('/setMessage').post(addUserId,setMessage)
router.route('/editMessage/:id').put(addUserId,editMessage)
router.route('/deleteMessage/:id').delete(addUserId,deleteMessage)

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