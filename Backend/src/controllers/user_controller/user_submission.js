const submissionModel = require("../../models/user_submission.model")

const createSubmission = async (req, res) => {
    try {
        const userId = req.user._id;
        const uploadedFile = req.uploadedFile;
        const { moduleId, refPath } = req.body;

        // Check if submission already exists
        const existingSubmission = await submissionModel.findOne({
            userId,
            moduleId
        });

        if (existingSubmission) {
            return res.status(400).json({
                success: false,
                message: "You have already submitted for this module",
                data: existingSubmission
            });
        }

        // Create new submission if none exists
        const newSubmission = new submissionModel({
            userId,
            moduleId,
            refPath,
            file_url: uploadedFile?.url,
            submittedAt: new Date()
        });

        await newSubmission.save();
        
        return res.status(201).json({
            success: true,
            message: "Submission created successfully",
            data: newSubmission
        });
    } catch (error) {
        console.error("Error creating submission:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create submission",
            error: error.message
        });
    }
}

const fetchSubmission = async (req, res) => {
    try {
        const { moduleId } = req.params;
        const userId = req.user._id;

        const submission = await submissionModel.findOne({ 
            moduleId,
            userId 
        });

        if (!submission) {
            return res.status(404).json({
                success: false,
                message: "No submission found for this module",
                data: null
            });
        }

        return res.status(200).json({
            success: true,
            message: "Submission retrieved successfully",
            data: submission
        });
    } catch (error) {
        console.error("Error fetching submission:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch submission",
            error: error.message
        });
    }
}

module.exports = {
    createSubmission,
    fetchSubmission
}