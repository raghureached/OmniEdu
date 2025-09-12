const {addOrganization, editOrganization, deleteOrganization, getOrganizations} = require("../controllers/globalAdmin.controller/globalAdmin_organization");
const {addRole, editRole, deleteRole, getRoles} = require("../controllers/globalAdmin.controller/globalAdmin_Roles");
const {addContent, editContent, deleteContent, getContent, getContentById} = require("../controllers/globalAdmin.controller/globalAdmin_content");
const {createSurvey, editSurvey, deleteSurvey, getSurveys, getSurvey} = require("../controllers/globalAdmin.controller/globalAdmin_Surveys");
const {upload,uploadContent} = require("../middleware/multer_middleware");
const { uploadMultipleToCloudinary, uploadToCloudinary } = require("../utils/uploadOnCloud");
const { setMessage, editMessage, deleteMessage } = require("../controllers/globalAdmin.controller/globalAdmin_message");
const { getPlans } = require("../controllers/globalAdmin.controller/globalAdmin_plans");
// const csvStream = require("../utils/csvParser");

const router = require("express").Router();

////////////Organization////////////

router.route('/addOrganization').post(upload.fields([{name:'logo',maxCount:1},{name:'documents',maxCount:10}]),uploadMultipleToCloudinary,addOrganization)
router.route('/editOrganization/:id').put(upload.fields([{name:'logo',maxCount:1},{name:'documents',maxCount:10}]),uploadMultipleToCloudinary,editOrganization)
router.route('/deleteOrganization/:id').delete(deleteOrganization)
router.route('/getOrganizations').get(getOrganizations)
// router.route('/readCSV').get(readCSV)

//////////////Global Roles////////////

router.route('/addRole').post(addRole)
router.route('/editRole/:id').put(editRole)
router.route('/deleteRole/:id').delete(deleteRole)
router.route('/getRoles').get(getRoles)

//////////////Global Content////////////

router.route('/addContent').post(uploadContent.single('file'),uploadToCloudinary("globalContent"),addContent)
router.route('/getContent').get(getContent)
router.route('/getContentById/:id').get(getContentById)
//Some changes
router.route('/editContent/:id').put(uploadContent.single('file'),uploadToCloudinary("globalContent"),editContent)
router.route('/deleteContent/:id').delete(deleteContent)

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

//////////////Plans////////////

router.route('/getPlans').get(getPlans)

module.exports = router;
