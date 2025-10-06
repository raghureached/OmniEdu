const fs = require("fs");
const cloudinary = require("../config/cloudinary");

// Middleware: upload file to Cloudinary & attach result to req
const uploadToCloudinary = (folder) => {
  return async (req, res, next) => {
    if (!req.file) return next();
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder,
        resource_type: "auto",
      });

      // Delete from local after upload
      fs.unlinkSync(req.file.path);

      // Attach Cloudinary result to req for later use in DB
      req.uploadedFile = {
        url: result.secure_url,
        public_id: result.public_id,
        folder: result.folder,
        format: result.format,
        size: result.bytes,
      };

      next();
    } catch (error) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(500).json({
        isSuccess: false,
        message: "Cloudinary upload failed",
        error: error.message,
      });
    }
  };
};

const uploadMultipleToCloudinary = async (req, res, next) => {
    try {
      if (!req.files) return next();
      // console.log(req.files)
      req.uploadedFiles = {};
  
      for (const fieldName of Object.keys(req.files)) {
        const files = req.files[fieldName];
        req.uploadedFiles[fieldName] = [];
  
        for (const file of files) {
          let folderName = "";
          if(fieldName === "logo") folderName = "logos";
          else if(fieldName === "documentFiles") folderName = "documents";
          else if(fieldName === "primaryFile") folderName = "primaryFiles";
          else if(fieldName === "additionalFile") folderName = "additionalFiles";
          else{
            folderName = fieldName
          }
          const result = await cloudinary.uploader.upload(file.path, {
            folder: folderName,
            resource_type: "auto",
          });
  
          try {
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          } catch (err) {
            // Log the error, but do not crash the app
            console.warn(`Could not delete file at ${file.path}`, err);
          }
          req.uploadedFiles[fieldName].push({
            url: result.secure_url,
            public_id: result.public_id,
            format: result.format,
            size: result.bytes,
          });
          // console.log(req.uploadedFiles)
        }
      }
  
      next();
    } catch (error) {
      console.log(error)
      return res.status(500).json({
        isSuccess: false,
        message: "Cloudinary upload failed",
        error: error.message,
      });
    }
  };


  const uploadQuestionFilesToCloud = async (req, res, next) => {
    try {
      if (!req.files) return next();
  
      req.uploadedFiles = {};
  
      for (const fieldName of Object.keys(req.files)) {
        const files = req.files[fieldName];
        req.uploadedFiles[fieldName] = [];
  
        for (const file of files) {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "questionFiles",
            resource_type: "auto",
          });
  
          // Delete temp file
          if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
  
          req.uploadedFiles[fieldName].push({
            url: result.secure_url,
            public_id: result.public_id,
            format: result.format,
            size: result.bytes,
          });
        }
      }
      next();
    } catch (error) {
      console.error(error);
      res.status(500).json({
        isSuccess: false,
        message: "Cloudinary upload failed",
        error: error.message,
      });
    }
  };
module.exports = {uploadToCloudinary,uploadMultipleToCloudinary,uploadQuestionFilesToCloud};
