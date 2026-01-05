const submissionModel = require("../../models/user_submission.model");
const SubmissionGradingModel = require("../../models/submissions_grading_model");


const gradeSubmission = async (req, res) => {
    try {
        const { submissionId, grade, feedback } = req.body;
        const submission = await SubmissionGradingModel.create({
            submissionId,
            grade,
            feedback,
            gradedBy: req.user._id
        })
        return res.status(201).json({
            success: true,
            message: "Submission graded successfully",
            data: submission
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to grade submission",
            error: error.message
        })
    }
}





const getSubmissions = async (req, res) => {
    try {
        console.log(req.params.moduleId)
        const submissions = await submissionModel.find({ moduleId: req.params.moduleId })
            .populate("moduleId userId")
            .lean(); // Add .lean() to get plain JavaScript objects

        const grades = await SubmissionGradingModel.find().populate("gradedBy");

        // Create a map for faster lookups
        const gradeMap = new Map();
        grades.forEach(grade => {
            gradeMap.set(grade.submissionId.toString(), {
                grade: grade.grade,
                feedback: grade.feedback,
                gradedBy: grade.gradedBy
            });
        });

        // Map over submissions and add grade info
        const submissionsWithGrades = submissions.map(submission => {
            const submissionId = submission._id.toString();
            const gradeInfo = gradeMap.get(submissionId) || {};

            return {
                ...submission,
                grade: gradeInfo.grade || 0,
                feedback: gradeInfo.feedback || "",
                gradedBy: gradeInfo.gradedBy || null
            };
        });

        return res.status(200).json({
            success: true,
            message: "Submissions fetched successfully",
            data: submissionsWithGrades
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch submissions",
            error: error.message
        })
    }
}

module.exports = {
    gradeSubmission,
    getSubmissions
}