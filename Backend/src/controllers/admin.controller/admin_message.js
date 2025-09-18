const ForUserMessage = require("../../models/messageForUser");
const logAdminActivity = require("./admin_activity");
const setMessage = async(req,res)=>{
    try {
        const {message,status} = req.body;
        const messageSet = await ForUserMessage.create({
            message_text:message,
            status,
            organization_id:"68bc0898fdb4a64d5a727a60",
            created_by:"68bc1d953f117b638adf49dc"
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
module.exports={
    setMessage,
    editMessage,
    deleteMessage
}