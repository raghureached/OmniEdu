const router = require("express").Router();
const multer = require("multer");
const controller = require("../controllers/scorm.controller");

// Multer config (ZIP only – important)
const upload = multer({
  dest: "uploads/scorm",
  fileFilter: (req, file, cb) => {
    if (!file.originalname.endsWith(".zip")) {
      return cb(new Error("Only SCORM zip files are allowed"));
    }
    cb(null, true);
  }
});

/**
 * ADMIN ROUTES
 */
router.post("/upload", upload.single("file"), controller.uploadScorm);
router.get("/fetch", controller.getScormModules);

/**
 * USER ROUTES
 */
router.post("/launch", controller.launch);

/**
 * SCORM RUNTIME ROUTES
 * (These are called from inside SCORM content)
 */
router.post("/initialize", controller.initialize);
router.get("/value", controller.getValue);
router.post("/value", controller.setValue);
router.post("/commit", controller.commit);
router.post("/finish", controller.finish);

module.exports = router;
