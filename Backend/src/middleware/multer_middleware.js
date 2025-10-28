const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { error } = require('console');

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
    console.log("file",file)
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // console.log(file)    
    let filePrefix = "";
    if(file.fieldname === 'logo'){
      filePrefix = "logo";
    }else if(file.fieldname === 'invoice'){
      filePrefix = "invoice";
    }else if(file.fieldname === 'receipt'){
      filePrefix = "receipt";
    }else if(file.fieldname === 'document3'){
      filePrefix = "document3";
    }else if(file.fieldname === 'document4'){
      filePrefix = "document4";
    }else if(file.fieldname === 'thumbnail'){
      filePrefix = "thumbnail";
    }
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
    const allowed = ["image/jpeg", "image/png", "application/pdf","image/svg+xml"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only JPEG, PNG, and PDF files are allowed"), false);
    }
    cb(null, true);
  
  },
 });


 const contentDir = path.join(__dirname, '../content/');
 ensureFolder(contentDir);
 
 const diskStorageContent = multer.diskStorage({
   destination: function (req, file, cb) {
     console.log("file",file)
     ensureFolder(contentDir);
     cb(null, contentDir);
   },
   filename: function (req, file, cb) {
     const timestamp = Date.now();
     cb(null, `content-${timestamp}-${file.originalname}`);
   },
 });
 
 // Multer instance with limits + fileFilter
 const uploadContent = multer({
   storage: diskStorageContent,
   limits: { fileSize: 20 * 1024 * 1024 },
   fileFilter: (req, file, cb) => {
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


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/questions/";
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|mp4|mp3/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.test(ext)) cb(null, true);
  else cb(new Error("Unsupported file type!"), false);
};

const uploadQuestionFile = multer({ storage, fileFilter });
// ========== Exports ==========
module.exports = {
  upload,         // use for logos and docs (stored in /uploads)
  uploadContent,   // use for org content (stored in /content)
  uploadAssessment ,// use for assessment (stored in /assessments)
  uploadQuestionFile
};
