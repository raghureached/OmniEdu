const router = require("express").Router();
const multer = require("multer");
const controller = require("../controllers/scorm.controller");
const globalController = require("../controllers/global_scorm.controller");

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
router.get("/:id", controller.getScormModule);
router.put("/:id", controller.updateScormModule);
router.delete("/:id", controller.deleteScormModule);

router.post("/global/upload", upload.single("file"), globalController.uploadScorm);
router.get("/global/fetch", globalController.getScormModules);
router.get("/global/:id", globalController.getScormModule);
router.put("/global/:id", globalController.updateScormModule);
router.delete("/global/:id", globalController.deleteScormModule);

/**
 * USER ROUTES
 */
router.post("/launch", controller.launch);
router.post("/global/launch", globalController.launch);

/**
 * SCORM RUNTIME ROUTES
 * (These are called from inside SCORM content)
 */
router.post("/initialize", controller.initialize);
router.get("/value", controller.getValue);
router.post("/value", controller.setValue);
router.post("/commit", controller.commit);
router.post("/finish", controller.finish);

// Global runtime endpoints (namespaced)
router.post("/global/initialize", globalController.initialize);
router.get("/global/value", globalController.getValue);
router.post("/global/value", globalController.setValue);
router.post("/global/commit", globalController.commit);
router.post("/global/finish", globalController.finish);

module.exports = router;
