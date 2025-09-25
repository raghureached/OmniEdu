const GlobalAssignment = require("../../models/global_Assignment")
const GlobalModule = require("../../models/globalModule_model")
const GlobalAssessment = require("../../models/globalAssessments_model")
const Surveys = require("../../models/global_surveys_model")
const Organization = require("../../models/organization_model")
const { logGlobalAdminActivity } = require("./globalAdmin_activity")
const createAssignment = async(req,res)=>{
    try {
        const {assignType,assignDate,assignTime,dueDate,dueTime,notifyUsers,isRecurring,contentId,orgId} = req.body
        const Module = await GlobalModule.findOne({uuid:contentId}).populate("title")
        const Assessment = await GlobalAssessment.findOne({uuid:contentId}).populate("title")
        const Survey = await Surveys.findOne({uuid:contentId}).populate("title")
        const Organization = await Organization.findOne({uuid:orgId})
        if(!Module){
            return res.status(404).json({
                isSuccess:false,
                message:"Content not found"
            })
        }
        const contentName = Module ? Module.title : Assessment ? Assessment.title : Survey ? Survey.title : ""
        const assignment = await GlobalAssignment.create({
            assignDate,
            assignTime,
            dueDate,
            dueTime,
            notifyUsers,
            isRecurring,
            contentId:Module ? Module._id : "",
            contentName:contentName,
            surveyId:Survey ? Survey._id : "",
            assessmentId:Assessment ? Assessment._id : "",
            orgId:Organization ? Organization._id : ""      
        })
        await logGlobalAdminActivity(req,"Create Assignment","assignment",`Assignment created successfully`)
        return res.status(201).json({
            isSuccess:true,
            message:"Assignment created successfully",
            data:assignment
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            isSuccess:false,
            message:"Failed to create assignment",
            error:error.message
        })
    }
}


const fetchAssignments = async(req,res)=>{
    try {
        const assignments = await GlobalAssignment.find().populate("contentId").populate("surveyId").populate("assessmentId").populate("orgId")
        return res.status(200).json({
            isSuccess:true,
            message:"Assignments fetched successfully",
            data:assignments
        })
    } catch (error) {
        return res.status(500).json({
            isSuccess:false,
            message:"Failed to fetch assignments",
            error:error.message
        })
    }
}

module.exports = {
    createAssignment,
    fetchAssignments
}