const GlobalAssignment = require("../../models/global_Assignment")
const Content = require("../../models/content_model")
const Organization = require("../../models/organization_model")
const createAssignment = async(req,res)=>{
    try {
        const {assignType,assignDate,assignTime,dueDate,dueTime,notifyUsers,isRecurring,contentId} = req.body
        const content = await Content.findOne({uuid:contentId}).populate("title")
        if(!content){
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
            contentId:content._id,
        contentName:content.title
        })
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


module.exports = {
    createAssignment
}