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
  
      req.uploadedFiles = {}; // object to hold uploaded data
  
      // Loop through each field
      for (const fieldName of Object.keys(req.files)) {
        const files = req.files[fieldName];
        req.uploadedFiles[fieldName] = [];
  
        for (const file of files) {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: fieldName === "logo" ? "logos" : "documents",
            resource_type: "auto",
          });
  
          // delete local file after upload
          fs.unlinkSync(file.path);
  
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
      return res.status(500).json({
        isSuccess: false,
        message: "Cloudinary upload failed",
        error: error.message,
      });
    }
  };

module.exports = {uploadToCloudinary,uploadMultipleToCloudinary};
