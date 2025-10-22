const ForUserMessage = require("../../models/messageForUser");
const logAdminActivity = require("./admin_activity");
const setMessage = async(req,res)=>{
    try {
        const {message,status} = req.body;
        const created_by = req.user?._id || req.body.created_by;
        const messageSet = await ForUserMessage.create({
            message_text:message,
            status,
            organization_id:req.user.organization_id,
            created_by
        })
        await logAdminActivity(req, "add", `Message set successfully: ${messageSet.message_text}`);
        return res.status(201).json({
            isSuccess:true,
            message:"Message set successfully",
            data:messageSet
        })
    } catch (error) {
        return res.status(500).json({
            isSuccess:false,
            message:"Failed to set message",
            error:error.message
        })
    }
}

const editMessage = async(req,res)=>{
    try {
        const {message,status} = req.body;
        const editedMessage = await ForUserMessage.findOneAndUpdate({uuid:req.params.id},{message_text:message,status})
        if(!editedMessage){
            return res.status(404).json({
                isSuccess:false,
                message:"Message not found"
            })
        }
        await logAdminActivity(req, "edit", `Message edited successfully: ${editedMessage.message_text}`);
        return res.status(201).json({
            isSuccess:true,
            message:"Message edited successfully",
            data:editedMessage
        })
    } catch (error) {
        return res.status(500).json({
            isSuccess:false,
            message:"Failed to set message",
            error:error.message
        })
    }
}

const deleteMessage = async(req,res)=>{
    try {
        const deletedMessage = await ForUserMessage.findOneAndDelete({uuid:req.params.id})
        if(!deletedMessage){
            return res.status(404).json({
                isSuccess:false,
                message:"Message not found"
            })
        }
        await logAdminActivity(req, "delete", `Message deleted successfully: ${deletedMessage.message_text}`);
        return res.status(200).json({
            isSuccess:true,
            message:"Message deleted successfully",
            data:deletedMessage
        })
    } catch (error) {
        return res.status(500).json({
            isSuccess:false,
            message:"Failed to delete message",
            error:error.message
        })
    }
}
const getMessage = async(req,res)=>{
    try {
        const page = req.query.page || 1;
        const limit = req.query.limit || 10;
        const skip = (page - 1) * limit;
        const messages = await ForUserMessage.find({organization_id:req.user?.organization_id}).skip(skip).limit(limit)
        return res.status(200).json({
            isSuccess:true,
            message:"Messages fetched successfully",
            data:messages,
            page,
            limit,
            total:await ForUserMessage.countDocuments()
        })
    } catch (error) {
        return res.status(500).json({
            isSuccess:false,
            message:"Failed to fetch messages",
            error:error.message
        })
    }
}
module.exports={
    setMessage,
    editMessage,
    deleteMessage,
    getMessage
}