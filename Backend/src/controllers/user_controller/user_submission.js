const submissionModel = require("../../models/user_submission.model")

const createSubmission = async(req,res) => {
    try {
        const userId = req.user._id;
        const uploadedFile = req.uploadedFile;
        const {moduleId,refPath} = req.body;
        const newSubmission = new submissionModel({
            userId,
            moduleId,
            refPath,
            file_url:uploadedFile?.url  
        })
        await newSubmission.save();
        return res.status(201).json({
            success:true,
            message:"Submission created successfully",
            data:newSubmission
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Failed to create submission",
            error:error.message
        })
    }
}

module.exports = {
    createSubmission
}