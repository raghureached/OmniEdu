const OrganizationAssessmentsAttemps = require("../../models/organizationAssessmentsAttemps_model")

const updateAssessmentAttempt = async(req,res)=>{
    try {
        const {assessmentId,attemptedAt,score,result} = req.body
        const assessmentAttempt = await OrganizationAssessmentsAttemps.create({assessment_id:assessmentId,attemptedAt,score,result,user_id:req.user._id})
        return res.status(200).json({
            isSuccess:true,
            message:"Assessment Attempt Updated Successfully"
        })
    } catch (error) {
        return res.status(500).json({
            isSuccess:false,
            message:"Failed to Update Assessment Attempt",
            error:error.message
        })
    }
}

module.exports = {
    updateAssessmentAttempt
}