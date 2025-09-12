const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Helper to ensure folder exists
const ensureFolder = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

// ========== Storage 1: For logos & docs ==========
const uploadsDir = path.join(__dirname, '../uploads/');
ensureFolder(uploadsDir);

const diskStorageUploads = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    console.log(file)    
    const filePrefix = file.fieldname === 'logo' ? 'logo' : 'doc';
    const { name = 'org' } = req.body;
    const timestamp = Date.now();
    cb(null, `${filePrefix}-${timestamp}-${name}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage: diskStorageUploads,
  limits: {
    fileSize: 2 * 1024 * 1024 ,
  },
  fileFilter: (req, file, cb) => {
    // Optional: restrict file types
    const allowed = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only JPEG, PNG, and PDF files are allowed"), false);
    }
    cb(null, true);
  },
 });


// ========== Storage 2: For org content ==========
const contentDir = path.join(__dirname, '../content/');
ensureFolder(contentDir);

const diskStorageContent = multer.diskStorage({
  destination: function (req, file, cb) {
    // console.log(contentDir);
    
    cb(null, contentDir);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    // TODO: later replace with org id if required
    cb(null, `content-${timestamp}-${file.originalname}`);
  },
});

// Multer instance with limits + fileFilter
const uploadContent = multer({
  storage: diskStorageContent,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB max
  fileFilter: (req, file, cb) => {
    // Example: only allow videos, images, and PDFs
    const allowed = [
      "image/jpeg",
      "image/png",
      "application/pdf",
      "video/mp4",
    ];

    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Invalid file type"), false);
    }
    cb(null, true);
  },
});

const AssessmentDir = path.join(__dirname, '../assessments/');
ensureFolder(AssessmentDir);

const diskStorageAssessment = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, AssessmentDir);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    cb(null, `assessment-${timestamp}-${file.originalname}`);
  }
});

const uploadAssessment = multer({ storage: diskStorageAssessment });
// ========== Exports ==========
module.exports = {
  upload,         // use for logos and docs (stored in /uploads)
  uploadContent,   // use for org content (stored in /content)
  uploadAssessment // use for assessment (stored in /assessments)
};
