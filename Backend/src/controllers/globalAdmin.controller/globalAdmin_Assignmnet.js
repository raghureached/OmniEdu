const GlobalAssignment = require("../../models/global_Assignment")
const GlobalModule = require("../../models/globalModule_model")
const Organization = require("../../models/organization_model")
const { logGlobalAdminActivity } = require("./globalAdmin_activity")
const createAssignment = async(req,res)=>{
    try {
        const {assignType,assignDate,assignTime,dueDate,dueTime,notifyUsers,isRecurring,contentId} = req.body
        const Module = await GlobalModule.findOne({uuid:contentId}).populate("title")
        if(!Module){
            return res.status(404).json({
                isSuccess:false,
                message:"Content not found"
            })
        }
        const assignment = await GlobalAssignment.create({
            assignDate,
            assignTime,
            dueDate,
            dueTime,
            notifyUsers,
            isRecurring,
            contentId:Module._id,
        contentName:Module.title
        })
        await logGlobalAdminActivity(req,"Create Assignment","assignment",`Assignment created successfully`)
        return res.status(201).json({
            isSuccess:true,
            message:"Assignment created successfully",
            data:assignment
        })
    } catch (error) {
        return res.status(500).json({
            isSuccess:false,
            message:"Failed to create assignment",
            error:error.message
        })
    }
}


const fetchAssignments = async(req,res)=>{
    try {
        const assignments = await GlobalAssignment.find().populate("contentId")
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