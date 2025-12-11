const submissionModel = require("../../models/user_submission.model");
const SubmissionGradingModel = require("../../models/submissions_grading_model");


const gradeSubmission = async(req,res) =>{
    try {
        const {submissionId,grade,feedback} = req.body;
        const submission = await SubmissionGradingModel.create({
            submissionId,
            grade,
            feedback,
            gradedBy: req.user._id
        })
        return res.status(201).json({
            success:true,
            message:"Submission graded successfully",
            data:submission
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Failed to grade submission",
            error:error.message
        })
    }
}

const getSubmissions = async(req,res)=>{
    try {
        const submissions = await submissionModel.find({refPath:"Module"})
        return res.status(200).json({
            success:true,
            message:"Submissions fetched successfully",
            data:submissions
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Failed to fetch submissions",
            error:error.message
        })
    }
}

module.exports = {
    gradeSubmission,
    getSubmissions
}